'use client'
import React, { useEffect, useState } from 'react';
import Typography from '@/components/typography';
import { Button, Divider, List } from 'antd';
import { UploadOutlined } from "@ant-design/icons";
import { fetchFiles } from "@/utils/files-utils";
import type { File } from "@wasm";
import { useWasm } from "@/components/WasmProvider";

interface TreeNode {
    title: string;
    key: string;
    children?: TreeNode[];
}

const Page = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { wasmModule, isLoading: wasmLoading } = useWasm(); // Check if WASM is loading
    const [fileTree, setFileTree] = useState<TreeNode[]>([]);

    useEffect(() => {
        const loadFiles = async () => {
            setIsLoading(true)
            try {
                const { files, error } = await fetchFiles(wasmModule); // Pass wasmModule if available
                if (error) {
                    setError(error);
                } else {
                    setError(null)
                    setFiles(files);
                }
            } catch (err) {
                console.error("Error loading files:", err);
                setError("Failed to load files");
            } finally {
                setIsLoading(false)
            }
        };
        loadFiles();
    }, [wasmModule]);


    if (isLoading || wasmLoading) {
        return (
            <div className="w-full h-full bg-red-500"> loading </div>
        )
    }

    const handleDelete = (id: string) => {
        console.log(`Delete file with id: ${id}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <Typography textSize="h4">Files</Typography>
                </div>
                <div className="flex items-center space-x-2">
                    <Button type="primary" icon={<UploadOutlined />}>Upload</Button>
                </div>
            </div>
            <Divider className="border-thin mt-2 mb-2" />

            {error ? (
                <Typography color="secondary">{error}</Typography>
            ) : (
                <List
                    dataSource={files}
                    renderItem={(file) => (
                        <List.Item>
                            <div className="w-full flex justify-between items-center">
                                <div className="flex gap-8">
                                    <Typography>
                                        {file.title || file.path || file.id}
                                    </Typography>

                                    <Typography color="secondary" textSize="small">
                                        {new Date(file.created_date).toLocaleDateString()
                                            || 'N/A'}
                                    </Typography>
                                </div>

                                <Button
                                    type="default"
                                    size="small"
                                    danger
                                    onClick={() => handleDelete(file.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default Page;
