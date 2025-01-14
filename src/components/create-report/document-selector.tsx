import React, { useState } from "react";
import { List, Checkbox, Button } from "antd";

interface Document {
    id: string;
    name: string;
}

interface SelectDocumentsProps {
    documents: Document[];
    selectedDocuments: string[];
    setSelectedDocuments: React.Dispatch<React.SetStateAction<string[]>>;
}

const SelectDocuments: React.FC<SelectDocumentsProps> = ({
    documents,
    selectedDocuments,
    setSelectedDocuments,
}) => {
    const [allDocumentsSelected, setAllDocumentsSelected] = useState(true);
    const [showDocuments, setShowDocuments] = useState(false);

    const handleAllDocumentsToggle = (checked: boolean) => {
        setAllDocumentsSelected(checked);
        if (checked) {
            setSelectedDocuments(documents.map((document) => document.id)); // Select all documents
        } else {
            setSelectedDocuments([]); // Deselect all documents
        }
    };

    const handleDocumentSelect = (id: string) => {
        setSelectedDocuments((prev) => {
            if (prev.includes(id)) {
                return prev.filter((documentId) => documentId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const toggleShowDocuments = () => {
        setShowDocuments((prev) => !prev);
    };

    return (
        <div className="space-y-4">
            {/* All Documents Checkbox with Show Documents Button */}
            <div className="flex items-center">
                <Checkbox
                    checked={allDocumentsSelected}
                    onChange={(e) => handleAllDocumentsToggle(e.target.checked)}
                >
                    All Documents ({documents.length})
                </Checkbox>
                <Button
                    type="link"
                    onClick={toggleShowDocuments}
                >
                    {showDocuments ? "Hide documents" : "Show documents"}
                </Button>
            </div>

            {/* Show List of Documents When Toggled */}
            {showDocuments && (
                <List
                    header="Select Documents"
                    bordered
                    dataSource={documents}
                    renderItem={(document) => (
                        <List.Item>
                            <Checkbox
                                checked={selectedDocuments.includes(document.id)}
                                onChange={() => handleDocumentSelect(document.id)}
                            >
                                {document.name}
                            </Checkbox>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default SelectDocuments;
