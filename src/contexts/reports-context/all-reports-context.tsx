import React, { createContext, useContext, useEffect, useState } from 'react';
import { Report } from '@wasm';
import { useAllReports } from '@/hooks/report-hooks';

interface AllReportsContextType {
    reports: Report[];
    loading: boolean;
    error: string | null;
}

const AllReportsContext = createContext<AllReportsContextType | undefined>(undefined);

export const AllReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { reports, loading, error } = useAllReports();
    console.log("create1asdasdasd AllReportsContext", reports, loading, error)

    return (
        <AllReportsContext.Provider value={{ reports, loading, error }}>
            {children}
        </AllReportsContext.Provider>
    );
};

export const useAllReportsContext = () => {
    const context = useContext(AllReportsContext);
    if (!context) {
        throw new Error('useAllReportsContext must be used within a AllReportsProvider');
    }
    return context;
};
