import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Button, List, message } from "antd";
import { DeleteOutlined, InboxOutlined, FilePdfOutlined, FolderAddOutlined, LoadingOutlined } from "@ant-design/icons";
import { useUploadManager } from "@/components/upload-files/upload-manager";
import { FileExtension } from "@wasm";
import { UploadFile } from "antd/es/upload/interface";
import { formatFileSize } from "@/utils/helpers";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { Form } from "antd";

const SUPPORTED_EXTENSIONS: FileExtension[] = ["pdf", "txt", "md", "zip"];
const IGNORED_PATHS = ["__MACOSX", ".DS_Store"];

const { Dragger } = Upload;

interface FileUploadContentProps {
    onClose: () => void;
}

const FileUploadContent: React.FC<FileUploadContentProps> = ({ onClose }) => {
    const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
    const uploadManager = useUploadManager();
    const addStaleFileId = useCacheInvalidationStore((state) => state.addStaleFileId);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const [form] = Form.useForm(); // Create form instance

    const [isProcessingFiles, setIsProcessingFiles] = useState(false)

    const fileChangeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const shouldIgnoreFile = (file: UploadFile): boolean => {
        const webkitPath = file.originFileObj?.webkitRelativePath || "";
        return IGNORED_PATHS.some((ignoredPath) => webkitPath.includes(ignoredPath) || file.name.includes(ignoredPath));
    };

    const processFiles = useCallback((files: UploadFile[]) => {
        setIsProcessingFiles(true)

        const validFiles = files.filter((file) => {
            const ext = file.name.split(".").pop()?.toLowerCase() as FileExtension;
            return ext && SUPPORTED_EXTENSIONS.includes(ext) && !shouldIgnoreFile(file);
        });

        const fileMap = new Map<string, UploadFile>();

        validFiles.forEach((file) => {
            if (!fileMap.has(file.name)) {
                fileMap.set(file.name, file);
            }
        });

        setSelectedFiles((prev) => [
            ...prev,
            ...Array.from(fileMap.values()).filter((newFile) => !prev.some((existingFile) => existingFile.name === newFile.name))
        ]);
        setIsProcessingFiles(false)
    }, []);

    const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setIsProcessingFiles(true)
        // Clear existing timeout to debounce
        if (fileChangeTimeout.current) {
            clearTimeout(fileChangeTimeout.current);
        }

        // Set a timeout to process files after 500ms
        fileChangeTimeout.current = setTimeout(() => {
            const files = fileList.map((item: UploadFile) => ({
                ...item,
                originFileObj: item.originFileObj || item,
            }));
            processFiles(files as UploadFile[]);
        }, 500);
    };

    const handleRefetchFiles = () => {
        addStaleFileId("all");
        triggerUpdate("files");
    }

    const handleResetSelectedFiles = () => {
        setSelectedFiles([])
    }

    const handleUpload = async () => {
        if (!selectedFiles.length) {
            message.error("No files selected for upload.");
            return;
        }

        try {
            const nativeFiles = selectedFiles.map((file) => new File([file.originFileObj as Blob], file.name, { type: file.type }));
            uploadManager.uploadFiles(nativeFiles, handleResetSelectedFiles, handleRefetchFiles);
            handleResetSelectedFiles()
            onClose()
        } catch (error) {
            console.error("Upload error:", error);
            message.error(error instanceof Error ? error.message : "Failed to upload files");
        }
    };

    const handleRemoveSelectedFile = (uid: string) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.uid !== uid));
    };

    return (
        <>
            <Form form={form}>
                <Form.Item name="upload" valuePropName="fileList">
                    <Dragger
                        fileList={[]}
                        showUploadList={false}
                        className="w-full"
                        multiple
                        beforeUpload={() => setIsProcessingFiles(true)}
                        onChange={handleFileChange}
                        hasControlInside={true}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Supports single or multiple .pdf or .zip files. To upload entire directory, click button below.
                        </p>
                    </Dragger>
                </Form.Item>
            </Form>


            <div className="flex justify-between mt-4">
                <div className="flex gap-4">
                    <Upload fileList={[]} showUploadList={false} multiple beforeUpload={() => setIsProcessingFiles(true)} onChange={handleFileChange} >
                        <Button icon={<FilePdfOutlined />}>Select Files</Button>
                    </Upload>
                    <Upload fileList={[]} showUploadList={false} multiple beforeUpload={() => setIsProcessingFiles(true)} onChange={handleFileChange} directory >
                        <Button icon={<FolderAddOutlined />}>Select Directory</Button>
                    </Upload>
                </div>
            </div>

            {isProcessingFiles ? <div className="mt-2 text-text_secondary"><LoadingOutlined className="mr-2" /> Preparing files</div> : ""}

            {selectedFiles.length > 0 && (
                selectedFiles.length > 50 ? (
                    <div className="mt-4 text-gray-600">
                        {selectedFiles.length} files selected
                    </div>
                ) : (
                    <List
                        className="mt-4 overflow-auto"
                        size="small"
                        bordered
                        style={{ maxHeight: 200 }}
                        dataSource={selectedFiles}
                        renderItem={(file) => (
                            <List.Item>
                                <span>{file.name}</span>
                                <div className="flex gap-4">
                                    <span>{file.size ? formatFileSize(file.size) : "-"}</span>
                                    <div
                                        className="cursor-pointer hover:opacity-60"
                                        onClick={() => handleRemoveSelectedFile(file.uid)}
                                    >
                                        <DeleteOutlined className="text-red-500" />
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                )
            )}


            <div className="w-full mt-8 flex justify-end">
                <Button
                    key="upload"
                    type="primary"
                    disabled={!selectedFiles.length || uploadManager.isUploading}
                    loading={uploadManager.isUploading}
                    onClick={handleUpload}
                >
                    {uploadManager.isUploading ? "Uploading..." : `Upload (${selectedFiles.length})`}
                </Button>
            </div>
        </>
    );
};

export default FileUploadContent;
