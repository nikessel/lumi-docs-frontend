import React, { useState } from "react";
import { List, Checkbox, Button } from "antd";
import { useCreateReportStore } from "@/stores/create-report-store";
import { useDocumentsContext } from "@/contexts/documents-context";

const SelectDocuments: React.FC = () => {

    const { documents, filesByDocumentId } = useDocumentsContext(); // Access documents from context

    const {
        selectedDocumentNumbers,
        setSelectedDocumentNumbers,
    } = useCreateReportStore(); // Access Zustand store

    const [allDocumentsSelected, setAllDocumentsSelected] = useState(
        selectedDocumentNumbers.length === documents.length
    );

    const [showDocuments, setShowDocuments] = useState(false);

    const handleAllDocumentsToggle = (checked: boolean) => {
        setAllDocumentsSelected(checked);
        if (checked) {
            setSelectedDocumentNumbers(documents.map((document) => document.number)); // Select all documents
        } else {
            setSelectedDocumentNumbers([]); // Deselect all documents
        }
    };

    const handleDocumentSelect = (documentNumber: number) => {
        if (selectedDocumentNumbers.includes(documentNumber)) {
            setSelectedDocumentNumbers(
                selectedDocumentNumbers.filter((number) => number !== documentNumber)
            );
        } else {
            setSelectedDocumentNumbers([...selectedDocumentNumbers, documentNumber]);
        }
    };

    const toggleShowDocuments = () => {
        setShowDocuments((prev) => !prev);
    };

    return (
        <div className="space-y-4">
            {/* All Documents Checkbox with Show Documents Button */}
            <div className="flex items-center">
                <Checkbox
                    checked={selectedDocumentNumbers.length === documents.length}
                    onChange={(e) => handleAllDocumentsToggle(e.target.checked)}
                >
                    All Documents ({selectedDocumentNumbers.length}/{documents.length})
                </Checkbox>
                <Button type="link" onClick={toggleShowDocuments}>
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
                            <div className="flex justify-between items-center w-full">

                                <Checkbox
                                    checked={selectedDocumentNumbers.includes(document.number)}
                                    onChange={() => handleDocumentSelect(document.number)}
                                >
                                    {document.meta.title}
                                </Checkbox>
                                <div className="px-2 py-1 rounded-md text-green-500 bg-green-100 text-center text-xs">FREE</div>
                            </div>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default SelectDocuments;
