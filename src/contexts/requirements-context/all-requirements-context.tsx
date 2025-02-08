import React, { createContext, useContext } from "react";
import { Requirement } from "@wasm";
import { useAllRequirements } from "@/hooks/requirement-hooks";

interface AllRequirementsContextType {
    requirements: Requirement[];
    loading: boolean;
    error: string | null;
}

const AllRequirementsContext = createContext<AllRequirementsContextType | undefined>(undefined);

export const AllRequirementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { requirements, loading, error } = useAllRequirements();

    return (
        <AllRequirementsContext.Provider value={{ requirements, loading, error }}>
            {children}
        </AllRequirementsContext.Provider>
    );
};

export const useAllRequirementsContext = () => {
    const context = useContext(AllRequirementsContext);
    if (!context) {
        throw new Error("useAllRequirementsContext must be used within an AllRequirementsProvider");
    }
    return context;
};
