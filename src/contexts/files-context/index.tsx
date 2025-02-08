import React, { createContext, useContext, ReactNode } from 'react';
import { useFiles } from '@/hooks/files-hooks';
import { File } from '@wasm';

interface FilesContextType {
    files: File[];
    isLoading: boolean;
    error: string | null;
}

const FilesContext = createContext<FilesContextType | undefined>(undefined);

export const FilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { files, isLoading, error } = useFiles();

    return (
        <FilesContext.Provider value={{ files, isLoading, error }}>
            {children}
        </FilesContext.Provider>
    );
};

export const useFilesContext = (): FilesContextType => {
    const context = useContext(FilesContext);
    if (!context) {
        throw new Error('useFilesContext must be used within a FilesProvider');
    }
    return context;
};
