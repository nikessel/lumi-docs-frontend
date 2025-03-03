import React, { createContext, useContext, ReactNode } from 'react';
import { useDocuments } from '@/hooks/document-hooks';
import { Document, File } from '@wasm';

interface DocumentsContextType {
    documents: Document[];
    filesByDocumentId: Record<string, File>;
    isLoading: boolean;
    error: string | null;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export const DocumentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { documents, isLoading, error, filesByDocumentId } = useDocuments();

    return (
        <DocumentsContext.Provider value={{ documents, isLoading, error, filesByDocumentId }}>
            {children}
        </DocumentsContext.Provider>
    );
};

export const useDocumentsContext = (): DocumentsContextType => {
    const context = useContext(DocumentsContext);
    if (!context) {
        throw new Error('useDocumentsContext must be used within a DocumentsProvider');
    }
    return context;
};
