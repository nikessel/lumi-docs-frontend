import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Button, List, message, Tag } from "antd";
import { DeleteOutlined, InboxOutlined, FilePdfOutlined, FolderAddOutlined, LoadingOutlined } from "@ant-design/icons";
import { useUploadManager } from "@/components/files/upload-files/upload-manager";
import { FileExtension } from "@wasm";
import { SupportedFileType } from "@/types/file-types";
import { UploadFile } from "antd/es/upload/interface";
import { formatFileSize } from "@/utils/helpers";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { Form } from "antd";
import JSZip from 'jszip';

const SUPPORTED_EXTENSIONS: FileExtension[] = ["pdf", "txt", "md", "zip"];
const IGNORED_PATHS = ["__MACOSX", ".DS_Store"];

const { Dragger } = Upload;

interface FileUploadContentProps {
    onClose: () => void;
}

const FileUploadContent: React.FC<FileUploadContentProps> = ({ onClose }) => {
    const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
    const [estimatedTotalFiles, setEstimatedTotalFiles] = useState<number>(0);
    const [zipFileCounts, setZipFileCounts] = useState<Record<string, number>>({});
    const uploadManager = useUploadManager();
    const addStaleFileId = useCacheInvalidationStore((state) => state.addStaleFileId);
    const addStaleDocumentId = useCacheInvalidationStore((state) => state.addStaleDocumentId);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const [form] = Form.useForm(); // Create form instance

    const [isProcessingFiles, setIsProcessingFiles] = useState(false)

    const fileChangeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Function to count files in a zip
    const countFilesInZip = async (file: File): Promise<number> => {
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);

            let totalCount = 0;
            const processZipContents = async (zipContents: JSZip) => {
                for (const [path, zipEntry] of Object.entries(zipContents.files)) {
                    // Skip directories and ignored paths
                    if (zipEntry.dir || IGNORED_PATHS.some(ignored => path.includes(ignored))) {
                        continue;
                    }

                    // Get file extension
                    const extension = path.split('.').pop()?.toLowerCase() as FileExtension;

                    // If it's a nested ZIP file, process it recursively
                    if (extension === "zip") {
                        try {
                            const nestedZipContent = await zipEntry.async('blob');
                            const nestedZip = await JSZip.loadAsync(nestedZipContent);
                            await processZipContents(nestedZip);
                        } catch (error) {
                            console.error(`Error processing nested zip in ${path}:`, error);
                        }
                    } else if (extension && SUPPORTED_EXTENSIONS.filter(ext => ext !== "zip").includes(extension)) {
                        // Only count files with supported extensions (excluding zip)
                        totalCount += 1;
                    }
                }
            };

            await processZipContents(contents);

            setZipFileCounts(prev => ({
                ...prev,
                [file.name]: totalCount
            }));

            return totalCount;
        } catch (error) {
            console.error(`Error counting files in zip ${file.name}:`, error);
            return 0;
        }
    };

    // Update estimated total files whenever selected files change
    useEffect(() => {
        const updateEstimatedTotal = async () => {
            let total = 0;
            for (const file of selectedFiles) {
                const ext = file.name.split(".").pop()?.toLowerCase() as FileExtension;
                if (ext === "zip" && file.originFileObj) {
                    const zipFileCount = await countFilesInZip(file.originFileObj);
                    total += zipFileCount;
                } else {
                    total += 1;
                }
            }
            setEstimatedTotalFiles(total);
            setIsProcessingFiles(false)
        };

        updateEstimatedTotal();
    }, [selectedFiles]);

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

    const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
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
            const nativeFiles = selectedFiles.map((file) => {
                const path = file.originFileObj?.webkitRelativePath || file.name;
                return new File([file.originFileObj as Blob], path, { type: file.type });
            });
            uploadManager.uploadFiles(nativeFiles, handleResetSelectedFiles, handleRefetchFiles);
            handleResetSelectedFiles()
            onClose()
        } catch (error) {
            console.error("Upload error:", error);
            message.error(error instanceof Error ? error.message : "Failed to upload files");
        }
    };

    const handleRemoveSelectedFile = (uid: string) => {
        setSelectedFiles((prevFiles) => {
            const fileToRemove = prevFiles.find(file => file.uid === uid);
            const ext = fileToRemove?.name.split(".").pop()?.toLowerCase() as FileExtension;
            if (fileToRemove && ext === "zip") {
                setZipFileCounts(prev => {
                    const newCounts = { ...prev };
                    delete newCounts[fileToRemove.name];
                    return newCounts;
                });
            }
            return prevFiles.filter((file) => file.uid !== uid);
        });
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
                            Supports single or multiple files ({SUPPORTED_EXTENSIONS.join(", ")}). To upload entire directory, click button below.
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

            {!isProcessingFiles && selectedFiles.length > 0 && (
                !isProcessingFiles && selectedFiles.length > 50 ? (
                    <div className="mt-4 text-gray-600">
                        {estimatedTotalFiles} files selected
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
                                <span>
                                    {file.name}
                                </span>
                                <div className="flex gap-4">
                                    {(file.name.split(".").pop()?.toLowerCase() as FileExtension) === "zip" && zipFileCounts[file.name] !== undefined &&
                                        <Tag color="blue">{zipFileCounts[file.name]} files</Tag>
                                    }
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


            <div className="w-full mt-8 flex justify-end items-center">

                <Button
                    key="upload"
                    type="primary"
                    disabled={!selectedFiles.length || uploadManager.isUploading || isProcessingFiles}
                    loading={uploadManager.isUploading}
                    onClick={handleUpload}
                >
                    {uploadManager.isUploading ? "Uploading..." : `Upload (${estimatedTotalFiles})`}
                </Button>
            </div>
        </>
    );
};

export default FileUploadContent;
