import React, { useState, useCallback, useEffect } from "react";
import { Modal, Upload, Button, List, Progress, message } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useUploadManager } from "@/components/upload-files/upload-manager";
import { File as WasmFile, FileExtension } from "@wasm"; // Import File and FileExtension
import type { UploadProps, UploadFile } from 'antd';
import { InboxOutlined, FilePdfOutlined, FolderAddOutlined } from '@ant-design/icons';
import { formatFileSize } from "@/utils/helpers";
import { notification } from "antd";


const SUPPORTED_EXTENSIONS: FileExtension[] = ["pdf", "txt", "md", "zip"];
const IGNORED_PATHS = ["__MACOSX", ".DS_Store"];

const { Dragger } = Upload;


const FileUploadModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    onUploadComplete: (files: WasmFile[]) => void;
}> = ({ visible, onClose, onUploadComplete }) => {
    const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
    const uploadManager = useUploadManager();
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (!uploadManager.isUploading && (uploadManager.uploadedFiles > 0 || uploadManager.failedFiles || uploadManager.filesAlreadyExisted)) {
            if (uploadManager.failedFiles.length > 0) {
                api.error({
                    message: "Error",
                    description: `Failed to upload ${uploadManager.failedFiles.length} files`
                });
            }
            if (uploadManager.uploadedFiles > 0 || uploadManager.filesAlreadyExisted) {
                const lines = [];

                if (uploadManager.uploadedFiles > 0) {
                    lines.push(`Successfully uploaded ${uploadManager.uploadedFiles} files.`);
                }

                if (uploadManager.filesAlreadyExisted > 0) {
                    lines.push(`${uploadManager.filesAlreadyExisted} files already existed.`);
                }

                api.success({
                    message: "Success",
                    description: lines.join('\n'), // Join lines with a newline character
                });
                setSelectedFiles([])
                onClose()
            }
        }
    }, [uploadManager])

    const shouldIgnoreFile = (file: UploadFile): boolean => {
        const webkitPath = file.originFileObj?.webkitRelativePath || ""; // Access from originFileObj
        return IGNORED_PATHS.some(
            (ignoredPath) =>
                webkitPath.includes(ignoredPath) || file.name.includes(ignoredPath)
        );
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
            ...Array.from(fileMap.values()).filter(
                (newFile) => !prev.some((existingFile) => existingFile.name === newFile.name)
            ),
        ]);

    }, []);

    const handleFileChange = useCallback(({ fileList }: any) => {

        const files = fileList.map((item: any) => ({
            ...item,
            originFileObj: item.originFileObj || item, // Ensure originFileObj fallback
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

            // onUploadComplete(uploadedFiles);
            // setSelectedFiles([]);
            // onClose();

            // // Map selected files to WasmFile type
            // const uploadedFiles: WasmFile[] = selectedFiles.map((file) => {
            //     const ext = file.name.split(".").pop()?.toLowerCase() as FileExtension;
            //     if (!SUPPORTED_EXTENSIONS.includes(ext)) {
            //         throw new Error(`Unsupported file extension: ${ext}`);
            //     }

            //     return {
            //         id: file.name,
            //         path: file.name,
            //         title: file.name,
            //         extension: ext,
            //         size: file.size,
            //         total_chunks: Math.ceil(file.size / (1024 * 1024)),
            //         uploaded: true,
            //         created_date: new Date(),
            //         status: "ready",
            //         number: 0,
            //         multipart_upload_id: undefined,
            //         multipart_upload_part_ids: undefined,
            //     };
            // });


        } catch (error) {
            console.error("Upload error:", error);
            message.error(error instanceof Error ? error.message : "Failed to upload files");
        }
    };

    const handleRemoveSelectedFile = (uid: string) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.uid !== uid));
    };

    return (
        <Modal
            title="Upload Files"
            width={"50%"}
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={uploadManager.isUploading}>
                    Cancel
                </Button>,
                <Button
                    key="upload"
                    type="primary"
                    disabled={!selectedFiles.length || uploadManager.isUploading}
                    loading={uploadManager.isUploading}
                    onClick={handleUpload}
                >
                    {uploadManager.isUploading ? "Uploading..." : `Upload (${selectedFiles.length})`}
                </Button>,
            ]}
        >
            {contextHolder}
            <Dragger maxCount={100} showUploadList={false} className="w-full" multiple={true} beforeUpload={() => false} onChange={handleFileChange}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Supports single or multiple .pdf or .zip files. To upload entire directory, click button below.
                </p>
            </Dragger>

            <div className="flex justify-between mt-4 ">
                <div className="flex gap-4 ">
                    <Upload
                        showUploadList={false}
                        multiple
                        beforeUpload={() => false}
                        onChange={handleFileChange}
                        maxCount={100}
                    >
                        <Button icon={<FilePdfOutlined />}>Select Files</Button>
                    </Upload>
                    <Upload
                        showUploadList={false}
                        multiple
                        beforeUpload={() => false}
                        onChange={handleFileChange}
                        directory
                        maxCount={100}
                    >
                        <Button icon={<FolderAddOutlined />}>Select Directory</Button>
                    </Upload>
                </div>
            </div>

            {selectedFiles.length > 0 && (
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
                                <div className="cursor-pointer hover:opacity-60" onClick={() => handleRemoveSelectedFile(file.uid)}><DeleteOutlined className="text-red-500" /></div>
                            </div>
                        </List.Item>
                    )}
                />
            )}

            {uploadManager.isUploading && (
                <div style={{ marginTop: 16 }}>
                    <Progress
                        percent={Math.round(uploadManager.progress * 100)}
                        status={uploadManager.failedFiles.length ? "exception" : "active"}
                    />
                    <p style={{ marginTop: 8, textAlign: "center" }}>
                        {uploadManager.uploadedFiles}/{uploadManager.totalFiles} files uploaded
                    </p>
                </div>
            )}
        </Modal>
    );
};

export default FileUploadModal;
