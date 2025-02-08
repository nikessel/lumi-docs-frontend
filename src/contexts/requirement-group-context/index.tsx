import React, { createContext, useContext } from "react";
import { RequirementGroup } from "@wasm";
import { useRequirementGroups } from "@/hooks/requirement-group-hooks";

interface RequirementGroupsContextType {
    requirementGroups: RequirementGroup[];
    filteredSelectedRequirementGroups: RequirementGroup[];
    requirementGroupsBySectionId: Record<string, RequirementGroup[]>;
    loading: boolean;
    error: string | null;
}

const RequirementGroupsContext = createContext<RequirementGroupsContextType | undefined>(undefined);

export const RequirementGroupsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { requirementGroups, filteredSelectedRequirementGroups, requirementGroupsBySectionId, loading, error } = useRequirementGroups();

    return (
        <RequirementGroupsContext.Provider value={{ requirementGroups, filteredSelectedRequirementGroups, requirementGroupsBySectionId, loading, error }}>
            {children}
        </RequirementGroupsContext.Provider>
    );
};

export const useRequirementGroupsContext = () => {
    const context = useContext(RequirementGroupsContext);
    if (!context) {
        throw new Error("useRequirementGroupsContext must be used within a RequirementGroupsProvider");
    }
    return context;
};
