import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Button, List, message, Tag } from "antd";
import { DeleteOutlined, InboxOutlined, FilePdfOutlined, FolderAddOutlined, LoadingOutlined } from "@ant-design/icons";
import { useUploadManager } from "@/components/files/upload-files/upload-manager";
import { FileExtension } from "@wasm";
import { UploadFile } from "antd/es/upload/interface";
import { formatFileSize } from "@/utils/helpers";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { Form } from "antd";
import JSZip from 'jszip';

// Use the same constants as the upload manager for consistency
const SUPPORTED_EXTENSIONS: FileExtension[] = ["pdf", "txt", "md", "zip"];
const VALID_EXTENSIONS: FileExtension[] = ["pdf", "txt", "md"]; // Same as upload manager
const IGNORED_PATHS = ["__MACOSX", ".DS_Store"];

const { Dragger } = Upload;

interface FileUploadContentProps {
    onClose: () => void;
}

interface ExtractedFile {
    file: File;
    source: string; // Original ZIP file name
    path: string;   // Path within ZIP (with zip name as prefix for disambiguation)
    originalName: string; // Original filename without the zip prefix
}


const FileUploadContent: React.FC<FileUploadContentProps> = ({ onClose }) => {
    const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
    const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
    const [isProcessingFiles, setIsProcessingFiles] = useState(false);
    
    const uploadManager = useUploadManager();
    const addStaleFileId = useCacheInvalidationStore((state) => state.addStaleFileId);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const [form] = Form.useForm();

    const fileChangeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Helper to sanitize filenames for use in paths
    const sanitizeForPath = (name: string): string => {
        // Remove file extension for folder name
        const baseName = name.split('.').slice(0, -1).join('.');
        // Remove or replace characters that might cause issues in paths
        return (baseName || name)
            .replace(/[/\\:*?"<>|]/g, '_') // Replace invalid path chars with underscores
            .trim();
    };

    // Extract files from a ZIP file
    const extractFilesFromZip = useCallback(async (zipFile: File, parentSource: string = ""): Promise<ExtractedFile[]> => {
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(zipFile);
            const extracted: ExtractedFile[] = [];

            const source = parentSource || zipFile.name;
            // Create a sanitized directory name from the zip file
            const zipDirName = sanitizeForPath(zipFile.name);
            
            const processZipContents = async (zipContents: JSZip, parentPath: string = "") => {
                const entries = Object.values(zipContents.files);
                for (const entry of entries) {
                    // Get the normalized path for this entry
                    const entryName = entry.name.split('/').pop() || entry.name;
                    const originalPath = parentPath ? `${parentPath}/${entryName}` : entryName;
                    
                    // Skip directories and ignored paths
                    if (entry.dir || IGNORED_PATHS.some(ignored => originalPath.includes(ignored))) {
                        continue;
                    }

                    // Get file extension
                    const extension = entryName.split('.').pop()?.toLowerCase() as FileExtension;

                    // If it's a nested ZIP file, process it recursively
                    if (extension === "zip") {
                        try {
                            const zipContent = await entry.async('blob');
                            const nestedZipFile = new File([zipContent], entryName);
                            // For nested ZIPs, just pass the original source
                            const nestedFiles = await extractFilesFromZip(nestedZipFile, source);
                            extracted.push(...nestedFiles);
                        } catch (err) {
                            console.error(`Error processing nested zip in ${originalPath}:`, err);
                        }
                    } else if (extension && VALID_EXTENSIONS.includes(extension)) {
                        try {
                            // Extract the file content
                            const blob = await entry.async('blob');
                            const file = new File([blob], entryName, {
                                type: `application/${extension}`,
                            });
                            
                            // Create a path with the ZIP folder as prefix for disambiguation
                            const zipPrefixedPath = `${zipDirName}/${entryName}`;
                            
                            // Add to extracted files with metadata
                            extracted.push({
                                file,
                                source,
                                path: zipPrefixedPath,
                                originalName: entryName
                            });
                        } catch (err) {
                            console.error(`Failed to extract file ${entryName}:`, err);
                        }
                    }
                }
            };

            await processZipContents(contents);
            return extracted;
        } catch (err) {
            console.error(`Error extracting files from ${zipFile.name}:`, err);
            return [];
        }
    }, []);

    // Update extracted files whenever selected files change
    useEffect(() => {
        const processSelectedFiles = async () => {
            if (selectedFiles.length === 0) {
                setExtractedFiles([]);
                setIsProcessingFiles(false);
                return;
            }

            setIsProcessingFiles(true);
            let newExtractedFiles: ExtractedFile[] = [];

            for (const file of selectedFiles) {
                const ext = file.name.split(".").pop()?.toLowerCase() as FileExtension;
                
                if (ext === "zip" && file.originFileObj) {
                    const zipExtracted = await extractFilesFromZip(file.originFileObj);
                    newExtractedFiles = [...newExtractedFiles, ...zipExtracted];
                } else if (VALID_EXTENSIONS.includes(ext) && file.originFileObj) {
                    // Regular file, add directly to extracted files without modifying path
                    newExtractedFiles.push({
                        file: file.originFileObj,
                        source: "direct",
                        path: file.name,
                        originalName: file.name
                    });
                }
            }

            setExtractedFiles(prevFiles => {
                // Filter out files from the same sources to avoid duplicates from the same source
                const filteredPrev = prevFiles.filter(ef => 
                    !selectedFiles.some(sf => {
                        if (sf.name.endsWith('.zip')) {
                            return ef.source === sf.name;
                        } else {
                            return ef.path === sf.name;
                        }
                    })
                );
                return [...filteredPrev, ...newExtractedFiles];
            });
            
            setIsProcessingFiles(false);
        };

        processSelectedFiles();
    }, [selectedFiles, extractFilesFromZip]);

    const shouldIgnoreFile = (file: UploadFile): boolean => {
        const webkitPath = file.originFileObj?.webkitRelativePath || "";
        return IGNORED_PATHS.some((ignoredPath) => webkitPath.includes(ignoredPath) || file.name.includes(ignoredPath));
    };

    const processFiles = useCallback((files: UploadFile[]) => {
        const validFiles = files.filter((file) => {
            const ext = file.name.split(".").pop()?.toLowerCase() as FileExtension;
            return ext && SUPPORTED_EXTENSIONS.includes(ext) && !shouldIgnoreFile(file);
        });

        // Use a map to deduplicate by name first (for the display list)
        const fileMap = new Map<string, UploadFile>();

        validFiles.forEach((file) => {
            if (!fileMap.has(file.name)) {
                fileMap.set(file.name, file);
            }
        });

        setSelectedFiles((prev) => [
            ...prev,
            ...Array.from(fileMap.values()).filter((newFile) => 
                !prev.some((existingFile) => existingFile.name === newFile.name)
            )
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

    // Prevent the default upload behavior by returning false
    const beforeUploadHandler = () => {
        setIsProcessingFiles(true);
        // Return false to prevent default upload behavior
        return false;
    };

    const handleRefetchFiles = () => {
        addStaleFileId("all");
        triggerUpdate("files");
    }

    const handleResetSelectedFiles = () => {
        setSelectedFiles([]);
        setExtractedFiles([]);
    }

    const handleUpload = async () => {
        if (extractedFiles.length === 0) {
            message.error("No files ready for upload.");
            return;
        }

        try {
            // Create File objects with the properly prefixed paths
            const filesToUpload = extractedFiles.map(({ file, path }) => {
                return new File([file], path, { type: file.type });
            });
            
            console.log(`Uploading ${filesToUpload.length} files with unique paths`);
            uploadManager.uploadFiles(filesToUpload, handleResetSelectedFiles, handleRefetchFiles);
            handleResetSelectedFiles();
            onClose();
        } catch (error) {
            console.error("Upload error:", error);
            message.error(error instanceof Error ? error.message : "Failed to upload files");
        }
    };

    const handleRemoveSelectedFile = (uid: string) => {
        setSelectedFiles((prevFiles) => {
            const fileToRemove = prevFiles.find(file => file.uid === uid);
            
            if (fileToRemove) {
                if (fileToRemove.name.endsWith('.zip')) {
                    // If removing a ZIP, remove all files extracted from this ZIP
                    setExtractedFiles(prev => 
                        prev.filter(ef => ef.source !== fileToRemove.name)
                    );
                } else {
                    // If removing a regular file, remove just that file
                    setExtractedFiles(prev => 
                        prev.filter(ef => ef.path !== fileToRemove.name)
                    );
                }
            }
            
            return prevFiles.filter((file) => file.uid !== uid);
        });
    };

    // Group extracted files by their source
    const groupedFiles = extractedFiles.reduce((groups, file) => {
        const source = file.source;
        if (!groups[source]) {
            groups[source] = [];
        }
        groups[source].push(file);
        return groups;
    }, {} as Record<string, ExtractedFile[]>);

    return (
        <>
            <Form form={form}>
                <Form.Item name="upload" valuePropName="fileList">
                    <Dragger
                        fileList={[]}
                        showUploadList={false}
                        className="w-full"
                        multiple
                        beforeUpload={beforeUploadHandler}
                        onChange={handleFileChange}
                        customRequest={() => {}} // Override default upload request
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
                    <Upload 
                        fileList={[]} 
                        showUploadList={false} 
                        multiple 
                        beforeUpload={beforeUploadHandler} 
                        onChange={handleFileChange}
                        customRequest={() => {}} // Override default upload request
                    >
                        <Button icon={<FilePdfOutlined />}>Select Files</Button>
                    </Upload>
                    <Upload 
                        fileList={[]} 
                        showUploadList={false} 
                        multiple 
                        beforeUpload={beforeUploadHandler} 
                        onChange={handleFileChange}
                        customRequest={() => {}} // Override default upload request 
                        directory
                    >
                        <Button icon={<FolderAddOutlined />}>Select Directory</Button>
                    </Upload>
                </div>
            </div>

            {isProcessingFiles && (
                <div className="mt-2 text-text_secondary">
                    <LoadingOutlined className="mr-2" /> Preparing files
                </div>
            )}

            {!isProcessingFiles && selectedFiles.length > 0 && (
                <>
                    {extractedFiles.length > 0 && (
                        <div className="mt-4 mb-2 text-gray-600">
                            {extractedFiles.length} files ready for upload
                        </div>
                    )}
                    
                    {selectedFiles.length <= 50 && (
                        <List
                            className="mt-4 overflow-auto"
                            size="small"
                            bordered
                            style={{ maxHeight: 200 }}
                            dataSource={selectedFiles}
                            renderItem={(file) => {
                                const ext = file.name.split(".").pop()?.toLowerCase() as FileExtension;
                                const isZip = ext === "zip";
                                const filesInZip = isZip ? (groupedFiles[file.name] || []).length : 0;
                                
                                return (
                                    <List.Item>
                                        <span>
                                            {file.name}
                                        </span>
                                        <div className="flex gap-4">
                                            {isZip && filesInZip > 0 && (
                                                <Tag color="blue">{filesInZip} files in folder</Tag>
                                            )}
                                            <span>{file.size ? formatFileSize(file.size) : "-"}</span>
                                            <div
                                                className="cursor-pointer hover:opacity-60"
                                                onClick={() => handleRemoveSelectedFile(file.uid)}
                                            >
                                                <DeleteOutlined className="text-red-500" />
                                            </div>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    )}
                </>
            )}

            <div className="w-full mt-8 flex justify-end items-center">
                <Button
                    key="upload"
                    type="primary"
                    disabled={extractedFiles.length === 0 || uploadManager.isUploading || isProcessingFiles}
                    loading={uploadManager.isUploading}
                    onClick={handleUpload}
                >
                    {uploadManager.isUploading ? "Uploading..." : `Upload (${extractedFiles.length})`}
                </Button>
            </div>
        </>
    );
};

export default FileUploadContent;
