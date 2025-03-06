'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input, Breadcrumb, Tag, Layout } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { Document } from "@wasm";
import { useWasm } from '@/components/WasmProvider';
import { useDocumentsContext } from '@/contexts/documents-context';
import { useFilesContext } from '@/contexts/files-context';
import DirectoryTree from './components/DirectoryTree';
import DocumentList from './components/DocumentList';

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

    console.log("filesByDocumentId", filesByDocumentId)

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
                            <Breadcrumb.Item>Documents</Breadcrumb.Item>
                            {selectedPath && (
                                <Breadcrumb.Item>{selectedPath}</Breadcrumb.Item>
                            )}
                        </Breadcrumb>
                        <div>
                            {processingFiles ? (
                                <Tag color="geekblue" style={{ padding: '4px 8px' }}>
                                    Processing {`${processingFiles} `}files <LoadingOutlined style={{ marginLeft: 5 }} />
                                </Tag>
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
                        />
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default FileManager;
