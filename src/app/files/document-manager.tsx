'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Table, Input, Button, Modal, Breadcrumb, message, Tag, Tooltip } from 'antd';
import { SearchOutlined, FolderAddOutlined, LoadingOutlined, ExportOutlined, DownloadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import pdfIcon from '@/assets/pdf-icon.svg';
import folderIcon from '@/assets/folder-icon.svg';
import dayjs from 'dayjs';
import Image from 'next/image';
import FileContextMenu from './document-context-menu';
import { Select } from 'antd';
import { File, Document } from "@wasm";
import { createDirectory } from '@/utils/files-utils';
import { useWasm } from '@/components/WasmProvider';
import type { ColumnType } from 'antd/es/table';
import { useDocumentsContext } from '@/contexts/documents-context';
import { useFilesContext } from '@/contexts/files-context';

const FileManager: React.FC<{
    downloadFile: (fileId: string, fileName: string, mimeType: string) => Promise<void>,
    viewFile: (fileId: string) => void,
    downloadLoading: {
        [id: string]: boolean;
    },
    viewLoading: {
        [id: string]: boolean;
    }
}> = ({ viewFile, downloadFile, downloadLoading, viewLoading }) => {



    const { wasmModule } = useWasm()

    const { files } = useFilesContext()
    const { documents, filesByDocumentId } = useDocumentsContext();



    const [fileList, setFileList] = useState(files);

    const [documentList, setDocumentList] = useState(documents);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [breadcrumb, setBreadcrumb] = useState<string[]>(['./']);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; record: File } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState<'create' | 'rename' | 'move'>('create');
    const [newFolderName, setNewFolderName] = useState('');
    const [foldersForMove, setFoldersForMove] = useState<File[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [processingFiles, setProcessingFiles] = useState(0)

    useEffect(() => {
        setDocumentList(documents);
    }, [documents]);

    useEffect(() => {
        let nProcessingFiles = 0
        files.forEach(file => {
            if (file.status === "uploading" || file.status === "processing") {
                nProcessingFiles++
            }
        })
        setProcessingFiles(nProcessingFiles)
    }, [files])

    // Filter files based on the search term and current path
    const filteredDocuments = useMemo(() => {
        return documentList
            .filter(document =>
                document.meta.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [documentList, searchTerm]);

    useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu(null); // Close context menu
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const getFileIcon = (extension: string | null) => {
        console.log("asasd123asd123", extension)
        return extension === 'pdf' ? pdfIcon : folderIcon;
    };

    const columns: ColumnType<Document>[] = [
        {
            title: 'Name',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.meta.title.localeCompare(b.meta.title),
            render: (text: string, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Image src={getFileIcon("pdf")} alt="icon" width={16} height={16} style={{ marginRight: 8 }} />
                    <span>{`${record.meta.title}`}</span>
                </div>
            ),
        },
        {
            title: 'Created On',
            dataIndex: 'created_date',
            key: 'created_date',
            sorter: (a, b) =>
                dayjs(a.created_date).unix() - dayjs(b.created_date).unix(),
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            render: (record) => {
                const file = filesByDocumentId[record.id];
                return (
                    <div className="flex gap-x-2 justify-end">
                        {file?.status === "uploading" ? (
                            <Tag color="geekblue">
                                Uploading <LoadingOutlined style={{ marginLeft: 5 }} />
                            </Tag>
                        ) : file?.status === "processing" ? (
                            <Tag color="geekblue">
                                Processing <LoadingOutlined style={{ marginLeft: 5 }} />
                            </Tag>
                        ) : file?.status === "ready" ? (
                            ""
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

                        <Button
                            loading={viewLoading[record.id]}
                            disabled={viewLoading[record.id]}
                            icon={<ExportOutlined />} type="default"
                            size="small"
                            onClick={() => file && viewFile(file.id)}
                        />
                        <Button
                            loading={downloadLoading[record.id]}
                            disabled={downloadLoading[record.id]}
                            icon={<DownloadOutlined />} type="default"
                            size="small"
                            onClick={() => file && downloadFile(file.id, record.meta.title || record.meta.path || record.id, "application/pdf")} />
                    </div>
                );
            },
        },
    ];

    const handleBreadcrumbClick = (index: number) => {
        const newPath = breadcrumb.slice(0, index + 1).join('/');
        setBreadcrumb(breadcrumb.slice(0, index + 1));
        setCurrentPath(index === 0 ? '' : newPath);
    };

    return (
        <div>
            <div className="flex justify-between">
                <Breadcrumb style={{ marginBottom: 16 }}>
                    {breadcrumb.map((crumb, index) => (
                        <Breadcrumb.Item
                            key={index}
                            onClick={() => handleBreadcrumbClick(index)}

                        >
                            {crumb}
                        </Breadcrumb.Item>
                    ))}
                </Breadcrumb>
                <div> {processingFiles ? <Tag color="geekblue">Processing {`${processingFiles} `}files <LoadingOutlined style={{ marginLeft: 5 }} /></Tag> : ""} </div>
            </div>
            <div className="gap-x-4" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input
                    placeholder="Search files..."
                    prefix={<SearchOutlined />}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="gap-x-4" style={{ display: 'flex' }}>
                    <Button icon={<FolderAddOutlined />} onClick={() => console.log("handle")} type="primary">
                        Create Folder
                    </Button>
                    <Button
                        icon={<FolderOpenOutlined />}
                        onClick={() => console.log("handle")}
                        type="primary"
                        disabled={selectedFiles.length === 0}
                    >
                        Move
                    </Button>
                    <Button
                        onClick={() => setSelectedFiles([])}
                        type="default"
                        disabled={selectedFiles.length === 0}
                    >
                        Clear Selection
                    </Button>
                </div>
            </div>
            <Table<Document>
                columns={columns}
                dataSource={filteredDocuments}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    pageSize: 100,
                    total: filteredDocuments.length,
                    onChange: (page) => {
                        if (page !== currentPage)
                            setCurrentPage(page)
                    },
                    showSizeChanger: false,
                }}
                rowClassName="file-row" // Apply the class here
                loading={false}
            />
            {contextMenu && (
                <FileContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onCreateFolder={() => console.log("handle")}
                    onMove={() => console.log("handle")}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};

export default FileManager;
