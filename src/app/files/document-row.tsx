import React from 'react';
import { Document } from "@wasm";

const DocumentRow: React.FC<{ document: Document; isSelected: boolean; onClick: () => void }> = ({
    document,
    isSelected,
    onClick,
}) => {
    return (
        <div
            className={`file-row ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <span>{document.meta.title}</span>
            <span>{document.meta.version}</span>
        </div>
    );
};

export default DocumentRow;
