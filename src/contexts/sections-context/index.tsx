import React, { createContext, useContext } from "react";
import { Section } from "@wasm";
import { useSections } from "@/hooks/section-hooks";

interface SectionsContextType {
    sections: Section[];
    filteredSelectedReportsSections: Section[];
    sectionsForRegulatoryFramework: Record<string, Section[]>;
    loading: boolean;
    error: string | null;
}

const SectionsContext = createContext<SectionsContextType | undefined>(undefined);

export const SectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { sections, filteredSelectedReportsSections, sectionsForRegulatoryFramework, loading, error } = useSections();

    return (
        <SectionsContext.Provider value={{ sections, filteredSelectedReportsSections, sectionsForRegulatoryFramework, loading, error }}>
            {children}
        </SectionsContext.Provider>
    );
};

export const useSectionsContext = () => {
    const context = useContext(SectionsContext);
    if (!context) {
        throw new Error("useSectionsContext must be used within a SectionsProvider");
    }
    return context;
};
