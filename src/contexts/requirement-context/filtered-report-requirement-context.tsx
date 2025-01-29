import React, { createContext, useContext } from 'react';
import { Requirement } from '@wasm';
import { useFilteredReportsRequirements } from '@/hooks/requirement-hooks';
import { Report } from '@wasm';

interface FilteredRequirementsContextType {
    requirements: Requirement[];
    loading: boolean;
    error: string | null;
}

const FilteredRequirementsContext = createContext<FilteredRequirementsContextType | undefined>(undefined);

export const FilteredRequirementsProvider: React.FC<{ reports: Report[]; children: React.ReactNode }> = ({ reports, children }) => {
    const { requirements, loading, error } = useFilteredReportsRequirements(reports);

    return (
        <FilteredRequirementsContext.Provider value={{ requirements, loading, error }}>
            {children}
        </FilteredRequirementsContext.Provider>
    );
};

export const useFilteredRequirementsContext = () => {
    const context = useContext(FilteredRequirementsContext);
    if (!context) {
        throw new Error('useFilteredRequirementsContext must be used within a FilteredRequirementsProvider');
    }
    return context;
};
