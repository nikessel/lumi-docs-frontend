import React from 'react';
import { File } from "@wasm";

const FileRow: React.FC<{ file: File; isSelected: boolean; onClick: () => void }> = ({
    file,
    isSelected,
    onClick,
}) => {
    return (
        <div
            className={`file-row ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <span>{file.title}</span>
            <span>{file.extension}</span>
            <span>{file.size}</span>
        </div>
    );
};

export default FileRow;
