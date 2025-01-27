'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Divider, List, Space, Skeleton } from 'antd';
import { UploadOutlined } from "@ant-design/icons";
import Typography from '@/components/typography';
import { fetchFiles } from "@/utils/files-utils";
import { useWasm } from "@/components/WasmProvider";
import type { File } from "@wasm";
import FileManager from './file-manager';
import { useFiles } from '@/hooks/files-hooks';
import FileUploadModal from '@/components/upload-files/file-upload-modal';
import { useFilesContext } from '@/contexts/files-context';
import ReportStateHandler from '@/components/report-state-handler';

const Page = () => {
    const { files, isLoading, error } = useFilesContext();

    const { wasmModule, isLoading: wasmLoading } = useWasm();

    const [fileData, setFileData] = useState<{ [id: string]: Uint8Array }>({});
    const [blobUrls, setBlobUrls] = useState<{ [id: string]: string }>({});
    const [viewLoading, setViewLoading] = useState<{ [id: string]: boolean }>({});
    const [downloadLoading, setDownloadLoading] = useState<{ [id: string]: boolean }>({});
    const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

    // Function to fetch file data
    const fetchFileData = useCallback(async (fileId: string) => {
        if (!wasmModule) {
            return null;
        }

        if (fileData[fileId]) {
            return fileData[fileId];
        }

        try {
            const response = await wasmModule.get_file_data({ input: fileId });

            if (response.output) {
                const data = response.output.output;
                setFileData((prev) => ({ ...prev, [fileId]: data }));
                return data;
            } else if (response.error) {
                console.error(`Error fetching data for file ${fileId}:`, response.error.message);
            }
        } catch (err) {
            console.error("Error fetching file data:", err);
        }
        return null;
    }, [wasmModule, fileData]);

    // View file
    const viewFile = useCallback(async (fileId: string) => {
        setViewLoading((prev) => ({ ...prev, [fileId]: true }));
        try {
            if (blobUrls[fileId]) {
                window.open(blobUrls[fileId], "_blank", "noopener,noreferrer");
                return;
            }

            const data = await fetchFileData(fileId);
            if (data) {
                const bytes = new Uint8Array(data);
                const blob = new Blob([bytes], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                setBlobUrls((prev) => ({ ...prev, [fileId]: url }));
                window.open(url, "_blank", "noopener,noreferrer");
            }
        } finally {
            setViewLoading((prev) => ({ ...prev, [fileId]: false }));
        }
    }, [blobUrls, fetchFileData]);

    // Download file
    const downloadFile = useCallback(async (fileId: string, fileName: string, mimeType: string) => {
        setDownloadLoading((prev) => ({ ...prev, [fileId]: true }));
        try {
            const data = await fetchFileData(fileId);
            if (data) {
                const bytes = new Uint8Array(data);
                const blob = new Blob([bytes], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } finally {
            setDownloadLoading((prev) => ({ ...prev, [fileId]: false }));
        }
    }, [fetchFileData]);


    if (isLoading || wasmLoading) {
        return (
            <div className="w-full h-full p-4">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Skeleton for the title */}
                    <Skeleton.Input active style={{ width: 150, height: 24 }} />

                    {/* Skeleton for the list items */}
                    {Array.from({ length: 30 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <Skeleton.Input active style={{ width: 300, height: 20 }} />
                            <div className="flex gap-2">
                                <Skeleton.Button active size="small" style={{ width: 60 }} />
                                <Skeleton.Button active size="small" style={{ width: 80 }} />
                                <Skeleton.Button active size="small" style={{ width: 70 }} />
                            </div>
                        </div>
                    ))}
                </Space>
            </div>
        );
    }

    const handleDelete = (id: string) => {
        console.log(`Delete file with id: ${id}`);
    };

    const handleUploadComplete = (uploadedFiles: File[]) => {
        // Perform any additional actions after upload, e.g., refresh the file list
        console.log("Uploaded files:", uploadedFiles);
        // Optionally, trigger a re-fetch of files here
    };

    const handleOpenModal = () => setIsModalVisible(true);
    const handleCloseModal = () => setIsModalVisible(false);

    return (
        <ReportStateHandler expectReports={false} loading={false} reports={[]} error={error}>

            <div>
                <div className="flex justify-between items-center">
                    <div>
                        <Typography textSize="h4">Files</Typography>
                    </div>
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={handleOpenModal}
                    >
                        Upload
                    </Button>
                </div>
                <Divider className="border-thin mt-2 mb-2" />

                {error ? (
                    <Typography color="secondary">{error}</Typography>
                ) : (
                    <FileManager files={files} />

                    // <List
                    //     dataSource={files}
                    //     renderItem={(file) => (
                    //         <List.Item>
                    //             <div className="w-full flex justify-between items-center">
                    //                 <div className="flex gap-8">
                    //                     <Typography>
                    //                         {file.title || file.path || file.id}
                    //                     </Typography>

                    //                     <Typography color="secondary" textSize="small">
                    //                         {new Date(file.created_date).toLocaleDateString() || 'N/A'}
                    //                     </Typography>
                    //                 </div>
                    //                 <div className="flex gap-4">
                    //                     <Button
                    //                         size="small"
                    //                         loading={viewLoading[file.id]}
                    //                         onClick={() => viewFile(file.id)}
                    //                         disabled={viewLoading[file.id]}
                    //                     >
                    //                         View
                    //                     </Button>
                    //                     <Button
                    //                         size="small"
                    //                         loading={downloadLoading[file.id]}
                    //                         onClick={() => downloadFile(file.id, file.title || file.path || file.id, "application/pdf")}
                    //                         disabled={downloadLoading[file.id]}
                    //                     >
                    //                         Download
                    //                     </Button>
                    //                     <Button
                    //                         type="default"
                    //                         size="small"
                    //                         danger
                    //                         onClick={() => handleDelete(file.id)}
                    //                     >
                    //                         Delete
                    //                     </Button>
                    //                 </div>
                    //             </div>
                    //         </List.Item>
                    //     )}
                    // />
                )}
                <FileUploadModal
                    visible={isModalVisible}
                    onClose={handleCloseModal}
                    onUploadComplete={handleUploadComplete}
                />
            </div>
        </ReportStateHandler>
    );
};

export default Page;
