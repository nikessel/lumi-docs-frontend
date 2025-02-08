'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Table, Input, Button, Modal, Breadcrumb, message, Tag } from 'antd';
import { SearchOutlined, FolderAddOutlined, LoadingOutlined, ExportOutlined, DownloadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import pdfIcon from '@/assets/pdf-icon.svg';
import folderIcon from '@/assets/folder-icon.svg';
import dayjs from 'dayjs';
import Image from 'next/image';
import FileContextMenu from './file-context-menu';
import { Select } from 'antd';
import { File } from "@wasm";
import { createDirectory } from '@/utils/files-utils';
import { useWasm } from '@/components/WasmProvider';
import type { ColumnType } from 'antd/es/table';


const FileManager: React.FC<{
    files: File[],
    downloadFile: (fileId: string, fileName: string, mimeType: string) => Promise<void>,
    viewFile: (fileId: string) => void,
    downloadLoading: {
        [id: string]: boolean;
    },
    viewLoading: {
        [id: string]: boolean;
    }
}> = ({ files, viewFile, downloadFile, downloadLoading, viewLoading }) => {
    const { wasmModule } = useWasm()
    const [fileList, setFileList] = useState(files);
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

    useEffect(() => {
        setFileList(files);
    }, [files]);

    // Filter files based on the search term and current path
    const filteredFiles = useMemo(() => {
        return fileList
            .filter(file => {
                const pathParts = file.path.split('/'); // Split the path into parts
                const isRootFile = pathParts.length === 1; // File is in root if no parent folder
                const isInCurrentFolder =
                    currentPath === '' // Root level
                        ? isRootFile // Show root files
                        : file.path.startsWith(`${currentPath}/`) &&
                        pathParts.slice(0, -1).join('/') === currentPath;

                return isInCurrentFolder;
            })
            .filter(file =>
                file.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [fileList, searchTerm, currentPath]);

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
        return extension === 'pdf' ? pdfIcon : folderIcon;
    };

    const columns: ColumnType<File>[] = [
        {
            title: 'Name',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
            render: (text: string, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {record.extension ? <Image src={getFileIcon(record.extension)} alt="icon" width={16} height={16} style={{ marginRight: 8 }} /> : ""}
                    <span>{`${record.title}${record.extension ? `.${record.extension}` : ''}`}</span>
                </div>
            ),
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            sorter: (a, b) => a.size - b.size,
            render: (size: number) => {
                const mb = size / (1024 * 1024);
                return mb < 1024 ? `${mb.toFixed(2)} MB` : `${(mb / 1024).toFixed(2)} GB`;
            },
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
            render: (record) => (
                <div className="flex gap-x-2 justify-end">
                    {record.status === "uploading" ? <Tag color="geekblue">Uploading <LoadingOutlined style={{ marginLeft: 5 }} /></Tag> : record.status === "processing" ? <Tag color="geekblue">Processing <LoadingOutlined style={{ marginLeft: 5 }} /></Tag> : record.status === "ready" ? "" : <Tag color="red">Failed</Tag>}
                    <Button loading={viewLoading[record.id]} disabled={viewLoading[record.id]} icon={<ExportOutlined />} type="default" size="small" onClick={() => viewFile(record.id)}></Button>
                    <Button loading={downloadLoading[record.id]} disabled={downloadLoading[record.id]} icon={<DownloadOutlined />} type="default" size="small" onClick={() => downloadFile(record.id, record.title || record.path || record.id, "application/pdf")}></Button>
                </div>),
        },
    ];

    const handleBreadcrumbClick = (index: number) => {
        const newPath = breadcrumb.slice(0, index + 1).join('/');
        setBreadcrumb(breadcrumb.slice(0, index + 1));
        setCurrentPath(index === 0 ? '' : newPath);
    };

    const handleCreateFolder = () => {
        setModalAction('create');
        setIsModalVisible(true);
        setContextMenu(null);
    };

    const handleMoveFiles = () => {
        setFoldersForMove(
            fileList.filter(file => !file.extension && file.path === currentPath) // Only list folders in the current path
        );
        setModalAction('move');
        setIsModalVisible(true);
        setContextMenu(null);
    };

    const confirmModalAction = async () => {
        if (modalAction === 'move') {
            if (newFolderName) {
                setFileList(prev =>
                    prev.map(file =>
                        selectedFiles.includes(file.id)
                            ? { ...file, path: `${newFolderName}/${file.title}`.replace('//', '/') }
                            : file
                    )
                );
                setSelectedFiles([]); // Clear selection after moving
                message.success('Files moved successfully!');
            } else {
                message.error('Please select a destination folder.');
            }
        } else if (modalAction === 'create') {
            await createDirectory(wasmModule, newFolderName)
        }
        setIsModalVisible(false);
        setNewFolderName('');
    };

    return (
        <div>
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
            <div className="gap-x-4" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input
                    placeholder="Search files..."
                    prefix={<SearchOutlined />}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="gap-x-4" style={{ display: 'flex' }}>
                    <Button icon={<FolderAddOutlined />} onClick={handleCreateFolder} type="primary">
                        Create Folder
                    </Button>
                    <Button
                        icon={<FolderOpenOutlined />}
                        onClick={handleMoveFiles}
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
            <Table<File>
                columns={columns}
                dataSource={filteredFiles}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    pageSize: 100,
                    total: filteredFiles.length,
                    onChange: (page) => setCurrentPage(page),
                    showSizeChanger: false,
                }}
                onRow={(record, index) => ({
                    onClick: (e) => {
                        if (!record.extension) {
                            setCurrentPath(`${currentPath}/${record.title}`.replace('//', '/'));
                            setBreadcrumb((prev) => [...prev, record.title]);
                        } else {


                            if (index === undefined) return; // Safeguard to ensure index is defined

                            const isShiftPressed = e.shiftKey;
                            const isCommandPressed = e.metaKey || e.ctrlKey;

                            setSelectedFiles((prev) => {
                                if (isShiftPressed && prev.length > 0) {
                                    // Find the index of the last selected file
                                    const lastSelectedIndex = filteredFiles.findIndex(
                                        (file) => file.id === prev[prev.length - 1]
                                    );

                                    if (lastSelectedIndex === -1) return prev; // Safeguard for invalid index

                                    // Determine the range to select
                                    const [start, end] = [
                                        Math.min(lastSelectedIndex, index),
                                        Math.max(lastSelectedIndex, index),
                                    ];

                                    // Get all files in the range
                                    const rangeFiles = filteredFiles
                                        .slice(start, end + 1)
                                        .map((file) => file.id);

                                    // Combine with already selected files
                                    return Array.from(new Set([...prev, ...rangeFiles]));
                                }

                                if (isCommandPressed) {
                                    // Toggle selection for the clicked file
                                    return prev.includes(record.id)
                                        ? prev.filter((id) => id !== record.id) // Deselect
                                        : [...prev, record.id]; // Add to selection
                                }

                                // Default single selection behavior
                                return [record.id];
                            });
                        }


                    },
                    style: {
                        cursor: record.extension ? 'default' : 'pointer',
                        backgroundColor: selectedFiles.includes(record.id)
                            ? '#e6f7ff'
                            : 'transparent',
                    },
                    onContextMenu: (e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevents the default browser context menu and table interactions
                        setContextMenu({ x: e.clientX, y: e.clientY, record });
                    },

                })}
                rowClassName="file-row" // Apply the class here
                loading={false}
            />
            {contextMenu && (
                <FileContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onCreateFolder={handleCreateFolder}
                    onMove={handleMoveFiles}
                    onClose={() => setContextMenu(null)}
                />
            )}
            <Modal
                title={
                    modalAction === 'create'
                        ? 'Create Folder'
                        : modalAction === 'rename'
                            ? 'Rename File'
                            : 'Move Files'
                }
                visible={isModalVisible}
                onOk={confirmModalAction}
                onCancel={() => setIsModalVisible(false)}
                okText={
                    modalAction === 'create'
                        ? 'Create'
                        : modalAction === 'rename'
                            ? 'Rename'
                            : 'Move'
                }
                cancelText="Cancel"
            >
                {modalAction === 'move' ? (
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Select a destination folder"
                        value={newFolderName}
                        onChange={(value) => setNewFolderName(value)}
                    >
                        {foldersForMove.map((folder) => (
                            <Select.Option
                                key={folder.id}
                                value={`${currentPath}/${folder.title}`.replace('//', '/')}
                            >
                                {folder.title}
                            </Select.Option>
                        ))}
                    </Select>
                ) : (
                    <Input
                        placeholder="Enter name"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default FileManager;
