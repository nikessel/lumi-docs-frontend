import React, { useState, useMemo } from "react";
import { List, Checkbox, Button, Tree } from "antd";
import { FolderOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useCreateReportStore } from "@/stores/create-report-store";
import { useDocumentsContext } from "@/contexts/documents-context";
import type { Key } from 'rc-tree/lib/interface';
import type { DataNode } from 'antd/es/tree';
import type { TreeNodeProps } from 'rc-tree';

interface BaseNode {
    key: string;
    title: string;
    path?: string;
}

interface DocumentNode extends BaseNode {
    documentNumber: number;
    isLeaf: true;
}

interface FolderNode extends BaseNode {
    children: { [key: string]: FolderNode | DocumentNode };
}

type TreeNode = FolderNode | DocumentNode;

const isDocumentNode = (node: TreeNode): node is DocumentNode => {
    return 'isLeaf' in node && node.isLeaf === true;
};

const isFolderNode = (node: TreeNode): node is FolderNode => {
    return 'children' in node;
};

const SelectDocuments: React.FC = () => {
    const { documents, filesByDocumentId } = useDocumentsContext();
    const {
        selectedDocumentNumbers,
        setSelectedDocumentNumbers,
    } = useCreateReportStore();

    const [expandedKeys, setExpandedKeys] = useState<Key[]>(['root']);
    const [currentPath, setCurrentPath] = useState<string | null>(null);

    // Create tree structure from documents
    const treeData = useMemo(() => {
        const createTreeStructure = (): DataNode[] => {
            const documentNodes: { [key: string]: DocumentNode } = {};
            const folderNodes: { [key: string]: FolderNode } = {};

            // First pass: create document nodes
            documents.forEach(doc => {
                const file = filesByDocumentId[doc.id];
                const documentNode: DocumentNode = {
                    key: doc.number.toString(), // Use document number as key
                    title: doc.meta.title,
                    documentNumber: doc.number,
                    isLeaf: true
                };

                if (!file?.path) {
                    documentNodes[doc.number.toString()] = documentNode;
                    return;
                }

                // Handle paths with directories
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
                    const folderPath = pathParts.slice(0, lastFolderIndex + 1);
                    let currentFolder: { [key: string]: FolderNode | DocumentNode } = folderNodes;
                    let currentPath = '';

                    // Create folder structure
                    for (let i = 0; i <= lastFolderIndex; i++) {
                        currentPath = folderPath.slice(0, i + 1).join('/');
                        if (!currentFolder[folderPath[i]]) {
                            currentFolder[folderPath[i]] = {
                                key: currentPath,
                                title: folderPath[i],
                                children: {},
                                path: currentPath
                            };
                        }
                        currentFolder = (currentFolder[folderPath[i]] as FolderNode).children;
                    }

                    // Add document to the last folder
                    currentFolder[doc.number.toString()] = documentNode;
                } else {
                    documentNodes[doc.number.toString()] = documentNode;
                }
            });

            // Create root node with separate document and folder nodes
            const rootChildren: { [key: string]: FolderNode | DocumentNode } = {};

            // Add folder nodes
            Object.entries(folderNodes).forEach(([key, node]) => {
                rootChildren[key] = node;
            });

            // Add document nodes
            Object.entries(documentNodes).forEach(([key, node]) => {
                rootChildren[key] = node;
            });

            // Create a wrapper folder for root children
            const rootWrapper: FolderNode = {
                key: 'root',
                title: 'All Documents',
                children: rootChildren
            };

            // Convert folder structure to array format for Tree component
            const convertFolderToArray = (folder: FolderNode): DataNode => {
                return {
                    key: folder.key,
                    title: folder.title,
                    children: Object.values(folder.children).map(child =>
                        isFolderNode(child) ? convertFolderToArray(child) : {
                            key: child.key,
                            title: child.title,
                            isLeaf: true
                        }
                    )
                };
            };

            return [convertFolderToArray(rootWrapper)];
        };

        return createTreeStructure();
    }, [documents, filesByDocumentId]);

    const handleSelect = (selectedKeys: Key[]) => {
        console.log("selectedKeys", selectedKeys)

        const key = selectedKeys[0]?.toString();

        if (!key) return;

        const findNode = (nodes: TreeNode[]): TreeNode | undefined => {
            for (const node of nodes) {
                if (node.key === key) {
                    return node;
                }
                if (isFolderNode(node)) {
                    const found = findNode(Object.values(node.children));
                    if (found) return found;
                }
            }
            return undefined;
        };

        const selectedNode = findNode(treeData as unknown as TreeNode[]);
        if (selectedNode) {
            if (isDocumentNode(selectedNode)) {
                if (selectedDocumentNumbers.includes(selectedNode.documentNumber)) {
                    setSelectedDocumentNumbers(
                        selectedDocumentNumbers.filter(num => num !== selectedNode.documentNumber)
                    );
                } else {
                    setSelectedDocumentNumbers([...selectedDocumentNumbers, selectedNode.documentNumber]);
                }
            } else if (selectedNode.path) {
                setCurrentPath(selectedNode.path);
            }
        }
    };

    const handleExpand = (keys: Key[]) => {
        setExpandedKeys(keys);
    };

    const handleFolderSelect = (folderPath: string) => {
        const getFolderDocuments = (nodes: TreeNode[]): number[] => {
            let documents: number[] = [];
            for (const node of nodes) {
                if (isDocumentNode(node)) {
                    documents.push(node.documentNumber);
                }
                if (isFolderNode(node)) {
                    documents = [...documents, ...getFolderDocuments(Object.values(node.children))];
                }
            }
            return documents;
        };

        const findFolder = (nodes: TreeNode[]): FolderNode | undefined => {
            for (const node of nodes) {
                if (isFolderNode(node) && node.path === folderPath) {
                    return node;
                }
                if (isFolderNode(node)) {
                    const found = findFolder(Object.values(node.children));
                    if (found) return found;
                }
            }
            return undefined;
        };

        const folder = findFolder(treeData as unknown as TreeNode[]);
        if (folder) {
            const folderDocuments = getFolderDocuments([folder]);
            const allSelected = folderDocuments.every(docNum =>
                selectedDocumentNumbers.includes(docNum)
            );

            if (allSelected) {
                // Deselect all documents in the folder
                setSelectedDocumentNumbers(
                    selectedDocumentNumbers.filter(num => !folderDocuments.includes(num))
                );
            } else {
                // Select all documents in the folder
                const newSelected = [...selectedDocumentNumbers];
                folderDocuments.forEach(docNum => {
                    if (!newSelected.includes(docNum)) {
                        newSelected.push(docNum);
                    }
                });
                setSelectedDocumentNumbers(newSelected);
            }
        }
    };

    const getIcon = (props: TreeNodeProps) => {
        return props.isLeaf ? <FilePdfOutlined /> : <FolderOutlined />;
    };

    return (
        <div className="space-y-4">

            <Tree
                showIcon
                expandedKeys={expandedKeys}
                onExpand={handleExpand}
                treeData={treeData}
                onSelect={handleSelect}
                icon={getIcon}
                checkable
                checkedKeys={selectedDocumentNumbers.map(num => num?.toString())}
                onCheck={(checkedKeys) => {
                    // The checkedKeys object has a structure like { checked: string[], halfChecked: string[] }
                    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
                    console.log("debugging checkedKeys", checkedKeys);
                    console.log("debugging keys", keys);

                    // Get all document numbers from the checked keys
                    const checkedDocumentNumbers = keys
                        .map(key => {
                            console.log("Looking for key:", key);

                            // Find the document number directly from the documents array
                            const doc = documents.find(d => d.number.toString() === key);
                            if (doc) {
                                console.log("Found document:", doc);
                                return doc.number;
                            }

                            console.log("No document found for key:", key);
                            return null;
                        })
                        .filter((num): num is number => num !== null);

                    console.log("debugging checkedDocumentNumbers", checkedDocumentNumbers);

                    // Update the selected document numbers
                    setSelectedDocumentNumbers(checkedDocumentNumbers);
                }}
            />
        </div>
    );
};

export default SelectDocuments;
