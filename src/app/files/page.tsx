'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Divider, List, Space, Skeleton } from 'antd';
import { UploadOutlined } from "@ant-design/icons";
import Typography from '@/components/typography';
import { fetchFiles } from "@/utils/files-utils";
import { useWasm } from "@/components/WasmProvider";
import type { File } from "@wasm";
import FileManager from './file-manager';
// import { useFiles } from '@/hooks/files-hooks';
import FileUploadModal from '@/components/upload-files/file-upload-modal';
import { useFilesContext } from '@/contexts/files-context';
import ReportStateHandler from '@/components/report-state-handler';
import useCacheInvalidationStore from '@/stores/cache-validation-store';
import { viewFile, downloadFile, fetchFileData } from '@/utils/files-utils';
import { useSearchParams, useRouter } from "next/navigation";

const Page = () => {
    const { files, isLoading, error } = useFilesContext();

    const { wasmModule, isLoading: wasmLoading } = useWasm();

    const [fileData, setFileData] = useState<{ [id: string]: Uint8Array }>({});
    const [blobUrls, setBlobUrls] = useState<{ [id: string]: string }>({});
    const [viewLoading, setViewLoading] = useState<{ [id: string]: boolean }>({});
    const [downloadLoading, setDownloadLoading] = useState<{ [id: string]: boolean }>({});
    const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
    const addStaleFileId = useCacheInvalidationStore((state) => state.addStaleFileId)

    const searchParams = useSearchParams();
    const router = useRouter();
    const isModalOpenInitially = searchParams.get("open_modal") === "true";

    // useEffect(() => {
    //     if (isModalOpenInitially) {
    //         setIsModalVisible(true);
    //         // Remove open_modal=true from URL
    //         const newUrl = new URL(window.location.href);
    //         newUrl.searchParams.delete("open_modal");
    //         window.history.replaceState({}, "", newUrl.toString());
    //     }
    // }, [isModalOpenInitially]);



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



    const handleUploadComplete = (uploadedFiles: File[]) => {
        addStaleFileId("all")
        console.log("Uploaded files:", uploadedFiles);
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
                    <FileManager
                        files={files}
                        viewLoading={viewLoading}
                        downloadLoading={downloadLoading}
                        viewFile={(fileId) =>
                            viewFile(fileId, (id) => fetchFileData(id, wasmModule, fileData, setFileData), blobUrls, setBlobUrls, setViewLoading)
                        }
                        downloadFile={(fileId, fileName, mimeType) =>
                            downloadFile(fileId, fileName, mimeType, (id) => fetchFileData(id, wasmModule, fileData, setFileData), setDownloadLoading)
                        }
                    />
                )}
                <FileUploadModal
                    visible={isModalVisible}
                    onClose={handleCloseModal}
                // onUploadComplete={handleUploadComplete}
                />
            </div>
        </ReportStateHandler>
    );
};

export default Page;
