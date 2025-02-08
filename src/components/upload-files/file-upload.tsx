import React, { useState, useCallback } from "react";
import { Upload, Button, List, message } from "antd";
import { DeleteOutlined, InboxOutlined, FilePdfOutlined, FolderAddOutlined } from "@ant-design/icons";
import { useUploadManager } from "@/components/upload-files/upload-manager";
import { File as WasmFile, FileExtension } from "@wasm";
import { UploadFile } from "antd/es/upload/interface";
import { formatFileSize } from "@/utils/helpers";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

const SUPPORTED_EXTENSIONS: FileExtension[] = ["pdf", "txt", "md", "zip"];
const IGNORED_PATHS = ["__MACOSX", ".DS_Store"];

const { Dragger } = Upload;

interface FileUploadContentProps {
    onClose: () => void;
    afterUpload: () => void;
}

const FileUploadContent: React.FC<FileUploadContentProps> = ({ onClose, afterUpload }) => {
    const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
    const uploadManager = useUploadManager();
    // const [api, contextHolder] = notification.useNotification();
    const addStaleFileId = useCacheInvalidationStore((state) => state.addStaleFileId);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    // useEffect(() => {
    //     if (!uploadManager.isUploading && (uploadManager.uploadedFiles > 0 || uploadManager.failedFiles.length || uploadManager.filesAlreadyExisted)) {

    //         if (uploadManager.failedFiles.length > 0) {
    //             api.error({
    //                 message: "Error",
    //                 description: `Failed to upload ${uploadManager.failedFiles.length} files`
    //             });
    //         }

    //         if (uploadManager.uploadedFiles > 0 || uploadManager.filesAlreadyExisted) {
    //             const lines = [];

    //             if (uploadManager.uploadedFiles > 0) {
    //                 lines.push(`Successfully uploaded ${uploadManager.uploadedFiles} files.`);
    //             }

    //             if (uploadManager.filesAlreadyExisted > 0) {
    //                 lines.push(`${uploadManager.filesAlreadyExisted} files already existed.`);
    //             }

    //             api.success({
    //                 message: "Success",
    //                 description: lines.join("\n"),
    //             });

    //             setSelectedFiles([]);
    //             onClose();
    //         }
    //     }
    // }, [uploadManager, api, onClose]);

    const shouldIgnoreFile = (file: UploadFile): boolean => {
        const webkitPath = file.originFileObj?.webkitRelativePath || "";
        return IGNORED_PATHS.some((ignoredPath) => webkitPath.includes(ignoredPath) || file.name.includes(ignoredPath));
    };

    const processFiles = useCallback((files: UploadFile[]) => {
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
    }, []);

    const handleFileChange = useCallback(({ fileList }: any) => {
        const files = fileList.map((item: any) => ({
            ...item,
            originFileObj: item.originFileObj || item,
        }));
        processFiles(files as UploadFile[]);
    }, [processFiles]);

    const handleUpload = async () => {
        if (!selectedFiles.length) {
            message.error("No files selected for upload.");
            return;
        }

        try {
            const nativeFiles = selectedFiles.map((file) => file.originFileObj as File);
            uploadManager.uploadFiles(nativeFiles);
            addStaleFileId("all");
            triggerUpdate("files");
            setSelectedFiles([]);
            onClose()
            // afterUpload()
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
            <Dragger maxCount={100} showUploadList={false} className="w-full" multiple beforeUpload={() => false} onChange={handleFileChange}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Supports single or multiple .pdf or .zip files. To upload entire directory, click button below.
                </p>
            </Dragger>

            <div className="flex justify-between mt-4">
                <div className="flex gap-4">
                    <Upload showUploadList={false} multiple beforeUpload={() => false} onChange={handleFileChange} maxCount={100}>
                        <Button icon={<FilePdfOutlined />}>Select Files</Button>
                    </Upload>
                    <Upload showUploadList={false} multiple beforeUpload={() => false} onChange={handleFileChange} directory maxCount={100}>
                        <Button icon={<FolderAddOutlined />}>Select Directory</Button>
                    </Upload>
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <List className="mt-4 overflow-auto" size="small" bordered style={{ maxHeight: 200 }} dataSource={selectedFiles}
                    renderItem={(file) => (
                        <List.Item>
                            <span>{file.name}</span>
                            <div className="flex gap-4">
                                <span>{file.size ? formatFileSize(file.size) : "-"}</span>
                                <div className="cursor-pointer hover:opacity-60" onClick={() => handleRemoveSelectedFile(file.uid)}>
                                    <DeleteOutlined className="text-red-500" />
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
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

            {/* {uploadManager.isUploading && (
                <div style={{ marginTop: 16 }}>
                    <Progress percent={Math.round(uploadManager.progress * 100)} status={uploadManager.failedFiles.length ? "exception" : "active"} />
                    <p style={{ marginTop: 8, textAlign: "center" }}>
                        {uploadManager.uploadedFiles}/{uploadManager.totalFiles} files uploaded
                    </p>
                </div>
            )} */}
        </>
    );
};

export default FileUploadContent;
