import React, { createContext, useContext } from 'react';
import { Report } from '@wasm';
import { useReports } from '@/hooks/report-hooks';

interface ReportsContextProivider {
    reports: Report[];
    filteredSelectedReports: Report[],
    loading: boolean;
    error: string | null;
}

const ReportsContext = createContext<ReportsContextProivider | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { reports, filteredSelectedReports, loading, error } = useReports();

    return (
        <ReportsContext.Provider value={{ reports, filteredSelectedReports, loading, error }}>
            {children}
        </ReportsContext.Provider>
    );
};

export const useReportsContext = () => {
    const context = useContext(ReportsContext);
    if (!context) {
        throw new Error('useReportsContext must be used within a ReportsProvider');
    }
    return context;
};
