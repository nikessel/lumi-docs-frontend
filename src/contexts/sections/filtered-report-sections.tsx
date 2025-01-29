import React, { createContext, useContext } from 'react';
import { Section } from '@wasm';
import { useFilteredReportSections } from '@/hooks/section-hooks';
import { Report } from '@wasm';

interface FilteredSectionsContextType {
    sections: Section[];
    loading: boolean;
    error: string | null;
}

const FilteredSectionsContext = createContext<FilteredSectionsContextType | undefined>(undefined);

export const FilteredSectionsProvider: React.FC<{ reports: Report[]; children: React.ReactNode }> = ({ reports, children }) => {
    const { sections, loading, error } = useFilteredReportSections(reports);

    return (
        <FilteredSectionsContext.Provider value={{ sections, loading, error }}>
            {children}
        </FilteredSectionsContext.Provider>
    );
};

export const useFilteredSectionsContext = () => {
    const context = useContext(FilteredSectionsContext);
    if (!context) {
        throw new Error('useFilteredSectionsContext must be used within a FilteredSectionsProvider');
    }
    return context;
};
