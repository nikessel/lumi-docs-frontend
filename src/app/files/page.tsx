'use client';

import React, { useState, useEffect } from 'react';
import { Button, Divider, Space, Skeleton, Tooltip } from 'antd';
import { UploadOutlined } from "@ant-design/icons";
import Typography from '@/components/common/typography';
import { useWasm } from "@/contexts/wasm-context/WasmProvider";
import DocumentManager from '../../components/files/document-manager';
import FileUploadModal from '@/components/files/upload-files/file-upload-modal';
import { useFilesContext } from '@/contexts/files-context';
import { viewFile, downloadFile, fetchFileData } from '@/utils/files-utils';
import { useUploadManager } from '@/components/files/upload-files/upload-manager';
import { useDocumentsContext } from '@/contexts/documents-context';

const Page = () => {
    const { files, isLoading, error } = useFilesContext();
    const { documents, isLoading: documentsLoading, error: documentsError } = useDocumentsContext();

    const { wasmModule, isLoading: wasmLoading } = useWasm();

    const [fileData, setFileData] = useState<{ [id: string]: Uint8Array }>({});
    const [blobUrls, setBlobUrls] = useState<{ [id: string]: string }>({});
    const [viewLoading, setViewLoading] = useState<{ [id: string]: boolean }>({});
    const [downloadLoading, setDownloadLoading] = useState<{ [id: string]: boolean }>({});
    const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

    const [firstRenderCompleted, setFirstRenderCompleted] = useState(false)
    const uploadManager = useUploadManager()

    useEffect(() => {
        if (!isLoading && wasmLoading && !firstRenderCompleted)
            setFirstRenderCompleted(true)
    }, [isLoading, wasmLoading, firstRenderCompleted])

    if (((isLoading && files.length < 1) && firstRenderCompleted) || wasmLoading) {
        return (
            <div className="w-full h-full p-4">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Skeleton.Input active style={{ width: 150, height: 24 }} />
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

    const handleOpenModal = () => setIsModalVisible(true);
    const handleCloseModal = () => setIsModalVisible(false);

    return (

        <div>
            <div className="flex justify-between items-center">
                <div>
                    <Typography textSize="h4">Files</Typography>
                </div>
                <Tooltip title={uploadManager.isUploading ? "Please wait for current session to finish uploading" : ""}><Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={handleOpenModal}
                    disabled={uploadManager.isUploading}
                >
                    Upload
                </Button></Tooltip>
            </div>
            <Divider className="border-thin mt-2 mb-2" />

            {error ? (
                <Typography color="secondary">{error}</Typography>
            ) : (
                <DocumentManager
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
            />
        </div>
    );
};

export default Page;
