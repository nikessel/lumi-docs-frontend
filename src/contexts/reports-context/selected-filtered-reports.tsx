import React, { createContext, useContext, useEffect, useState } from 'react';
import { Report } from '@wasm';
import { useSelectedFilteredReports } from '@/hooks/report-hooks';

interface SelectedFilteredReportsContextType {
    reports: Report[];
    loading: boolean;
    error: string | null;
}

const SelectedFilteredReportsContext = createContext<SelectedFilteredReportsContextType | undefined>(undefined);

export const SelectedFilteredReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { reports, loading, error } = useSelectedFilteredReports();

    return (
        <SelectedFilteredReportsContext.Provider value={{ reports, loading, error }}>
            {children}
        </SelectedFilteredReportsContext.Provider>
    );
};

export const useSelectedFilteredReportsContext = () => {
    const context = useContext(SelectedFilteredReportsContext);
    if (!context) {
        throw new Error('useSelectedFilteredReportsContext must be used within a SelectedFilteredReportsProvider');
    }
    return context;
};
