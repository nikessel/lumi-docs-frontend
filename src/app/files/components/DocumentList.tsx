import React, { useState } from 'react';
import { Button, Tag, Tooltip, Pagination } from 'antd';
import { ExportOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import Image from 'next/image';
import pdfIcon from '@/assets/pdf-icon.svg';
import dayjs from 'dayjs';
import { Document, File } from "@wasm";

interface DocumentListProps {
    documents: Document[];
    filesByDocumentId: { [key: string]: File };
    viewFile: (fileId: string) => void;
    downloadFile: (fileId: string, fileName: string, mimeType: string) => Promise<void>;
    viewLoading: { [id: string]: boolean };
    downloadLoading: { [id: string]: boolean };
}

const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    filesByDocumentId,
    viewFile,
    downloadFile,
    viewLoading,
    downloadLoading,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;
    const total = documents.length;

    const getFileIcon = (extension: string | null) => {
        return extension === 'pdf' ? pdfIcon : pdfIcon;
    };

    const paginatedDocuments = documents.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {paginatedDocuments.map((document) => {
                    const file = filesByDocumentId[document.id];
                    return (
                        <div
                            key={document.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors duration-150"
                        >
                            <div className="flex items-center gap-3 pr-4">
                                <Image
                                    src={getFileIcon("pdf")}
                                    alt="icon"
                                    width={20}
                                    height={20}
                                    className="opacity-80"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">
                                        {document.meta.title}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Created {dayjs(document.created_date).format('DD/MM/YYYY HH:mm')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {file?.status === "uploading" ? (
                                    <Tag color="geekblue" className="flex items-center">
                                        Uploading <LoadingOutlined className="ml-1" />
                                    </Tag>
                                ) : file?.status === "processing" ? (
                                    <Tag color="geekblue" className="flex items-center">
                                        Processing <LoadingOutlined className="ml-1" />
                                    </Tag>
                                ) : file?.status === "ready" ? (
                                    <div className="flex items-center gap-2">
                                        <Tooltip title="View Document">
                                            <Button
                                                loading={viewLoading[document.id]}
                                                disabled={viewLoading[document.id]}
                                                icon={<ExportOutlined />}
                                                type="text"
                                                size="small"
                                                onClick={() => file && viewFile(file.id)}
                                                className="text-gray-500 hover:text-gray-700"
                                            />
                                        </Tooltip>
                                        <Tooltip title="Download Document">
                                            <Button
                                                loading={downloadLoading[document.id]}
                                                disabled={downloadLoading[document.id]}
                                                icon={<DownloadOutlined />}
                                                type="text"
                                                size="small"
                                                onClick={() => file && downloadFile(file.id, document.meta.title || file.path || document.id, "application/pdf")}
                                                className="text-gray-500 hover:text-gray-700"
                                            />
                                        </Tooltip>
                                    </div>
                                ) : (
                                    <Tooltip
                                        title={
                                            typeof file?.status === "object"
                                                ? "processing_failed" in file.status
                                                    ? file?.status.processing_failed
                                                    : file?.status.upload_failed
                                                : ""
                                        }
                                    >
                                        <Tag color="red">Failed</Tag>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-center py-4">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    size="small"
                />
            </div>
        </div>
    );
};

export default DocumentList; 