'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input, Breadcrumb, Tag, Layout, Tooltip } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { Document } from "@wasm";
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { useDocumentsContext } from '@/contexts/documents-context';
import { useFilesContext } from '@/contexts/files-context';
import DirectoryTree from './directory-tree';
import DocumentList from './document-list';

const { Sider, Content } = Layout;

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
    const { wasmModule } = useWasm();
    const { files } = useFilesContext();
    const { documents, filesByDocumentId } = useDocumentsContext();

    const [documentList, setDocumentList] = useState(documents);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [processingFiles, setProcessingFiles] = useState(0);

    useEffect(() => {
        setDocumentList(documents);
    }, [documents]);

    useEffect(() => {
        let nProcessingFiles = 0;
        files.forEach(file => {
            if (file.status === "uploading" || file.status === "processing") {
                nProcessingFiles++;
            }
        });
        setProcessingFiles(nProcessingFiles);
    }, [files]);

    const filteredDocuments = useMemo(() => {
        return documentList
            .filter(document => {
                const matchesSearch = document.meta.title.toLowerCase().includes(searchTerm.toLowerCase());
                if (!matchesSearch) return false;

                if (!selectedPath) return true;

                const file = filesByDocumentId[document.id];
                if (!file?.path) return false;

                return file.path.startsWith(selectedPath);
            });
    }, [documentList, searchTerm, selectedPath, filesByDocumentId]);

    const handleDocumentSelect = (documentId: string | null, path: string | null) => {
        setSelectedDocumentId(documentId);
        setSelectedPath(path);
    };

    const handleFolderClick = (path: string) => {
        setSelectedPath(path);
    };

    return (
        <Layout style={{ height: '100%' }}>
            <Sider width={300} theme="light" style={{ padding: '24px', borderRight: '1px solid #f0f0f0' }}>
                <DirectoryTree
                    documents={documents}
                    filesByDocumentId={filesByDocumentId}
                    onSelect={handleDocumentSelect}
                />
            </Sider>
            <Content style={{ padding: '24px' }}>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <Breadcrumb style={{ fontSize: '14px' }}>
                            <Breadcrumb.Item onClick={() => setSelectedPath(null)} className="cursor-pointer">Documents</Breadcrumb.Item>
                            {selectedPath && selectedPath.split('/').map((part, index, array) => (
                                <Breadcrumb.Item
                                    key={index}
                                    onClick={() => setSelectedPath(array.slice(0, index + 1).join('/'))}
                                    className="cursor-pointer"
                                >
                                    {part}
                                </Breadcrumb.Item>
                            ))}
                        </Breadcrumb>
                        <div>
                            {processingFiles ? (
                                <Tooltip title="Files will appear in the table once they are processed">
                                    <Tag color="geekblue" style={{ padding: '4px 8px' }}>
                                        Processing {processingFiles} files <LoadingOutlined style={{ marginLeft: 5 }} />
                                    </Tag>
                                </Tooltip>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <Input
                            placeholder="Search files..."
                            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '300px' }}
                        />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm">
                        <DocumentList
                            documents={filteredDocuments}
                            filesByDocumentId={filesByDocumentId}
                            viewFile={viewFile}
                            downloadFile={downloadFile}
                            viewLoading={viewLoading}
                            downloadLoading={downloadLoading}
                            onFolderClick={handleFolderClick}
                            currentPath={selectedPath}
                        />
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default FileManager;
