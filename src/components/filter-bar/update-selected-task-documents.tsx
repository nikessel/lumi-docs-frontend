"use client";

import React, { useMemo } from "react";
import { Select, Spin } from "antd";
import { useFiles } from "@/hooks/files-hooks";
import { useSearchParamsState } from "@/contexts/search-params-context";
import Typography from "../typography";
import { useDocumentsContext } from "@/contexts/documents-context";

const { Option } = Select;

const SelectTaskDocuments: React.FC = () => {
    const { files, isLoading } = useFiles(); // Fetch available files
    const { selectedTaskDocuments, toggleSelectedTaskDocuments } = useSearchParamsState(); // Get state management functions
    const { documents } = useDocumentsContext();

    const documentOptions = useMemo(() => {

        return documents.map((document) => ({
            label: document.meta.title,
            value: document.id,
        }));
    }, [documents]);

    const handleChange = (selectedIds: string[]) => {
        selectedIds.forEach((fileId) => {
            if (!selectedTaskDocuments.includes(fileId)) {
                toggleSelectedTaskDocuments(fileId); // Add selected document
            }
        });

        selectedTaskDocuments.forEach((fileId: string) => {
            if (!selectedIds.includes(fileId)) {
                toggleSelectedTaskDocuments(fileId); // Remove deselected document
            }
        });
    };

    return (
        <div>
            <Typography className="my-1" textSize="h4">Task Documents</Typography>
            <Typography className="my-4" color="secondary">By setting this filter you can view tasks associated with one or multiple specific documents</Typography>
            <Select
                mode="multiple"
                allowClear
                placeholder="Select task documents"
                loading={isLoading}
                onChange={handleChange}
                value={selectedTaskDocuments} // Controlled component
                style={{ width: "100%" }}
                optionFilterProp="label"
                notFoundContent={isLoading ? <Spin size="small" /> : "No documents found"}
            >
                {documentOptions.map(({ label, value }) => (
                    <Option key={value} value={value}>
                        {label}
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default SelectTaskDocuments;
