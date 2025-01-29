import React, { createContext, useContext } from 'react';
import { RequirementGroup } from '@wasm';
import { useFilteredReportsRequirementGroups } from '@/hooks/requirement-group-hooks';
import { Report } from '@wasm';

interface FilteredRequirementGroupsContextType {
    requirementGroups: RequirementGroup[];
    loading: boolean;
    error: string | null;
}

const FilteredRequirementGroupsContext = createContext<FilteredRequirementGroupsContextType | undefined>(undefined);

export const FilteredRequirementGroupsProvider: React.FC<{ reports: Report[]; children: React.ReactNode }> = ({ reports, children }) => {
    const { requirementGroups, loading, error } = useFilteredReportsRequirementGroups(reports);

    return (
        <FilteredRequirementGroupsContext.Provider value={{ requirementGroups, loading, error }}>
            {children}
        </FilteredRequirementGroupsContext.Provider>
    );
};

export const useFilteredRequirementGroupsContext = () => {
    const context = useContext(FilteredRequirementGroupsContext);
    if (!context) {
        throw new Error('useFilteredRequirementGroupsContext must be used within a FilteredRequirementGroupsProvider');
    }
    return context;
};
