import React, { useMemo, useState } from 'react';
import { Tree } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { Document, File } from '@wasm';
import type { Key } from 'rc-tree/lib/interface';
import type { AntdTreeNodeAttribute } from 'antd/es/tree';

interface DirectoryTreeProps {
    documents: Document[];
    filesByDocumentId: { [key: string]: File };
    onSelect: (documentId: string | null, path: string | null) => void;
}

interface TreeNode {
    key: string;
    title: string;
    children?: { [key: string]: TreeNode };
    path?: string;
    fileCount?: number;
}

interface TreeNodeArray {
    key: string;
    title: string;
    children?: TreeNodeArray[];
    path?: string;
    fileCount?: number;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ documents, filesByDocumentId, onSelect }) => {
    const [expandedKeys, setExpandedKeys] = useState<Key[]>(['root']);

    const treeData = useMemo(() => {
        const createTreeStructure = (): TreeNodeArray[] => {
            // Create root node
            const root: TreeNodeArray = {
                key: 'root',
                title: 'All Documents',
                children: [],
                path: undefined
            };

            const folderStructure: { [key: string]: TreeNode } = {};
            let rootFileCount = 0;

            documents.forEach(doc => {
                const file = filesByDocumentId[doc.id];
                if (!file?.path) {
                    rootFileCount++;
                    return;
                }

                // Check if the path contains directory separators
                const hasDirectories = file.path.includes('/');

                if (!hasDirectories) {
                    rootFileCount++;
                    return;
                }

                // Handle paths with directories
                const pathParts = file.path.split('/').filter(Boolean);
                console.log("pathParts", pathParts)


                // Find the last part that's not a file (doesn't have an extension)
                let lastFolderIndex = pathParts.length - 1;
                while (lastFolderIndex >= 0) {
                    const part = pathParts[lastFolderIndex];
                    // Check if the part has a file extension (e.g., .pdf, .doc, etc.)
                    if (!part.match(/\.[a-zA-Z0-9]+$/)) {
                        break;
                    }
                    lastFolderIndex--;
                }

                // If we found a folder, use everything before it as the path
                if (lastFolderIndex >= 0) {
                    const folderPath = pathParts.slice(0, lastFolderIndex + 1);
                    let current = folderStructure;

                    // Create directory structure
                    folderPath.forEach((part, index) => {
                        if (!current[part]) {
                            current[part] = {
                                key: folderPath.slice(0, index + 1).join('/'),
                                title: part,
                                children: {},
                                path: folderPath.slice(0, index + 1).join('/')
                            };
                        }
                        current = current[part].children!;
                    });
                } else {
                    // If no folder found, add to root
                    rootFileCount++;
                }
            });

            // Convert the nested object structure to array structure and count files
            const convertToArray = (node: TreeNode): TreeNodeArray => {
                const result: TreeNodeArray = {
                    key: node.key,
                    title: node.title,
                    path: node.path
                };

                if (node.children) {
                    const children = Object.values(node.children).map(convertToArray);
                    result.children = children;

                    // Count files in this folder and its subfolders
                    const countFiles = (nodes: TreeNodeArray[]): number => {
                        return nodes.reduce((count, child) => {
                            if (child.children) {
                                return count + countFiles(child.children);
                            }
                            return count + 1;
                        }, 0);
                    };

                    const fileCount = countFiles(children);
                    if (fileCount > 0) {
                        result.title = `${node.title} (${fileCount} files)`;
                    }
                }

                return result;
            };

            // Add folder structure to root
            root.children = Object.values(folderStructure).map(convertToArray);

            // Count files in folders
            const countFolderFiles = (nodes: TreeNodeArray[]): number => {
                return nodes.reduce((count, node) => {
                    if (node.children) {
                        return count + countFolderFiles(node.children);
                    }
                    return count + 1;
                }, 0);
            };

            const folderFileCount = countFolderFiles(root.children || []);
            const totalFiles = rootFileCount + folderFileCount;
            root.title = `All Documents (${totalFiles} files)`;

            return [root];
        };

        return createTreeStructure();
    }, [documents, filesByDocumentId]);

    const handleSelect = (selectedKeys: Key[]) => {
        const key = selectedKeys[0]?.toString();
        if (!key) return;

        const findNode = (nodes: TreeNodeArray[]): TreeNodeArray | undefined => {
            for (const node of nodes) {
                if (node.key === key) {
                    return node;
                }
                if (node.children) {
                    const found = findNode(node.children);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const selectedNode = findNode(treeData);
        if (selectedNode) {
            onSelect(null, selectedNode.path || null);
        }
    };

    const handleExpand = (keys: Key[]) => {
        setExpandedKeys(keys);
    };

    return (
        <Tree
            showIcon
            expandedKeys={expandedKeys}
            onExpand={handleExpand}
            treeData={treeData}
            onSelect={handleSelect}
            icon={<FolderOutlined />}
        />
    );
};

export default DirectoryTree; 