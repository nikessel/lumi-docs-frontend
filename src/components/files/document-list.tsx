import React, { useState } from 'react';
import { Button, Tag, Tooltip, Pagination } from 'antd';
import { ExportOutlined, DownloadOutlined, LoadingOutlined, FolderOutlined } from '@ant-design/icons';
import Image from 'next/image';
import pdfIcon from '@/assets/svgs/pdf-icon.svg';
import dayjs from 'dayjs';
import { Document, File } from "@wasm";

interface DocumentListProps {
    documents: Document[];
    filesByDocumentId: { [key: string]: File };
    viewFile: (fileId: string) => void;
    downloadFile: (fileId: string, fileName: string, mimeType: string) => Promise<void>;
    viewLoading: { [id: string]: boolean };
    downloadLoading: { [id: string]: boolean };
    onFolderClick: (path: string) => void;
    currentPath: string | null;
}

const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    filesByDocumentId,
    viewFile,
    downloadFile,
    viewLoading,
    downloadLoading,
    onFolderClick,
    currentPath
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    // Group items into folders and files
    const { folders, files } = React.useMemo(() => {
        const folders = new Set<string>();
        const files: { document: Document; file: File | undefined }[] = [];

        documents.forEach(document => {
            const file = filesByDocumentId[document.id];
            if (!file?.path) {
                files.push({ document, file });
                return;
            }

            const pathParts = file.path.split('/').filter(Boolean);
            let lastFolderIndex = pathParts.length - 1;
            while (lastFolderIndex >= 0) {
                const part = pathParts[lastFolderIndex];
                if (!part.match(/\.[a-zA-Z0-9]+$/)) {
                    break;
                }
                lastFolderIndex--;
            }

            if (lastFolderIndex >= 0) {
                // This is a file in a folder
                const folderPath = pathParts.slice(0, lastFolderIndex + 1).join('/');
                if (folderPath === currentPath) {
                    files.push({ document, file });
                } else {
                    folders.add(folderPath);
                }
            } else {
                // This is a file in the root
                if (!currentPath) {
                    files.push({ document, file });
                }
            }
        });

        return { folders: Array.from(folders), files };
    }, [documents, filesByDocumentId, currentPath]);

    const total = folders.length + files.length;

    const getFileIcon = (extension: string | null) => {
        return extension === 'pdf' ? pdfIcon : pdfIcon;
    };

    const paginatedItems = [...folders, ...files].slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {paginatedItems.map((item, index) => {
                    if (typeof item === 'string') {
                        const folderName = item.split('/').pop() || item;
                        return (
                            <div
                                key={`folder-${index}`}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors duration-150 cursor-pointer"
                                onClick={() => onFolderClick(item)}
                            >
                                <div className="flex items-center gap-3 pr-4">
                                    <FolderOutlined style={{ fontSize: '20px', color: '#8c8c8c' }} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">
                                            {folderName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    } else {
                        // This is a file
                        const { document, file } = item;
                        if (file) {
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
                        }
                    }
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