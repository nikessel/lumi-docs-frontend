declare module '@cubone/react-file-manager' {
    import React from 'react';

    export interface File {
        name: string;
        isDirectory: boolean;
        path: string;
        updatedAt?: string;
        size?: number;
    }

    export interface FileManagerProps {
        files: File[];
        height?: string | number;
        layout?: 'list' | 'grid';
        onRefresh?: () => void;
        onCreateFolder?: (name: string, parentFolder: File) => void;
        onDelete?: (files: File[]) => void;
        onDownload?: (files: File[]) => void;
        onFileOpen?: (file: File) => void;
        onFileUploaded?: (response: { [key: string]: any }) => void;
        onRename?: (file: File, newName: string) => void;
        [key: string]: any; // Allow additional props
    }

    export const FileManager: React.FC<FileManagerProps>;
}
