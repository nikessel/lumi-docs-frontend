import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ReportState {
    currentStep: number;
    selectedFramework: string;
    selectedSections: string[];
    selectedDocumentNumbers: number[];
    selectedRequirementGroups: string[];
    selectedRequirements: string[];
    newReportCreated: { id: string, status: "pending" | "processing" | undefined },

    sectionsSetForFramework: string;
    groupsSetForSections: string[];
    requirementsSetForGroups: string[];

    setCurrentStep: (step: number) => void;
    setSelectedFramework: (framework: string) => void;
    setSelectedSections: (sections: string[]) => void;
    setSelectedDocumentNumbers: (documentNumbers: number[]) => void;
    setSelectedRequirementGroups: (requirementGroups: string[]) => void;
    setSelectedRequirements: (requirements: string[]) => void;

    setSectionsSetForFramework: (framework: string) => void;
    setGroupsSetForSections: (sections: string[]) => void;
    setRequirementsSetForGroups: (groups: string[]) => void;

    setNewReportCreated: (input: { id: string, status: "pending" | "processing" | undefined }) => void

    resetState: () => void;
}

export const useCreateReportStore = create<ReportState>()(
    persist(
        (set) => ({
            // Initial state
            currentStep: 0,
            selectedFramework: "mdr",
            selectedSections: [],
            selectedDocumentNumbers: [],
            selectedRequirementGroups: [],
            selectedRequirements: [],
            newReportCreated: { id: "", status: undefined },

            // help to persist state correctly 
            sectionsSetForFramework: "",
            groupsSetForSections: [],
            requirementsSetForGroups: [],


            // Setters
            setCurrentStep: (step) => set(() => ({ currentStep: step })),
            setSelectedFramework: (framework) => set(() => ({ selectedFramework: framework })),
            setSelectedSections: (sections) => set(() => ({ selectedSections: sections })),
            setSelectedDocumentNumbers: (documentNumbers) =>
                set(() => ({ selectedDocumentNumbers: documentNumbers })),
            setSelectedRequirementGroups: (requirementGroups) =>
                set(() => ({ selectedRequirementGroups: requirementGroups })),
            setSelectedRequirements: (requirements) =>
                set(() => ({ selectedRequirements: requirements })),


            setSectionsSetForFramework: (framework) => set(() => ({ sectionsSetForFramework: framework })),
            setGroupsSetForSections: (sections) => set(() => ({ groupsSetForSections: sections })),
            setRequirementsSetForGroups: (groups) => set(() => ({ requirementsSetForGroups: groups })),

            setNewReportCreated: (input) =>
                set(() => ({
                    newReportCreated: {
                        id: input.id,
                        status: input.status,
                    },
                })),


            // Reset state
            resetState: () =>
                set(() => ({
                    currentStep: 0,
                    selectedFramework: "mdr",
                    selectedSections: [],
                    selectedDocumentNumbers: [],
                    selectedRequirementGroups: [],
                })),
        }),
        {
            name: "report-creation-store", // Key for localStorage
            storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
        }
    )
);
