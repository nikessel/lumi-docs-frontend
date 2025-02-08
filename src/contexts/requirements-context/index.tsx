import React, { createContext, useContext } from "react";
import { Requirement } from "@wasm";
import { useRequirements } from "@/hooks/requirement-hooks";

interface RequirementsContextType {
    requirements: Requirement[];
    filteredSelectedRequirements: Requirement[];
    requirementsByGroupId: Record<string, Requirement[]>; // ✅ Now included
    loading: boolean;
    error: string | null;
}

const RequirementsContext = createContext<RequirementsContextType | undefined>(undefined);

export const RequirementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { requirements, filteredSelectedRequirements, requirementsByGroupId, loading, error } = useRequirements();

    return (
        <RequirementsContext.Provider value={{ requirements, filteredSelectedRequirements, requirementsByGroupId, loading, error }}>
            {children}
        </RequirementsContext.Provider>
    );
};

export const useRequirementsContext = () => {
    const context = useContext(RequirementsContext);
    if (!context) {
        throw new Error("useRequirementsContext must be used within a RequirementsProvider");
    }
    return context;
};
