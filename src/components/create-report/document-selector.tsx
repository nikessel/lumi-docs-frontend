import React, { useState } from "react";
import { List, Checkbox, Button } from "antd";

interface Document {
    id: string;
    name: string;
    number: number;
}

interface SelectDocumentsProps {
    documents: Document[];
    selectedDocuments: number[];
    setSelectedDocuments: React.Dispatch<React.SetStateAction<number[]>>;
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
            setSelectedDocuments(documents.map((document) => document.number)); // Select all documents
        } else {
            setSelectedDocuments([]); // Deselect all documents
        }
    };

    const handleDocumentSelect = (document_number: number) => {
        setSelectedDocuments((prev) => {
            if (prev.includes(document_number)) {
                return prev.filter((documentId) => documentId !== document_number);
            } else {
                return [...prev, document_number];
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
                                checked={selectedDocuments.includes(document.number)}
                                onChange={() => handleDocumentSelect(document.number)}
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
