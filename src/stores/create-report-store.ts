import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { RegulatoryFramework } from '@wasm';


interface ReportState {
    currentStep: number;
    selectedFramework: RegulatoryFramework;
    selectedSections: string[];
    selectedDocumentNumbers: number[];
    selectedRequirementGroups: string[];
    selectedRequirements: string[];
    newReportCreated: { id: string | undefined, status: "pending" | "processing" | "error" | undefined, message?: string },

    sectionsSetForFramework: string;
    groupsSetForSections: string[];
    requirementsSetForGroups: string[];

    setCurrentStep: (step: number) => void;
    setSelectedFramework: (framework: RegulatoryFramework) => void;
    setSelectedSections: (sections: string[]) => void;
    setSelectedDocumentNumbers: (documentNumbers: number[]) => void;
    setSelectedRequirementGroups: (requirementGroups: string[]) => void;
    setSelectedRequirements: (requirements: string[]) => void;

    setSectionsSetForFramework: (framework: string) => void;
    setGroupsSetForSections: (sections: string[]) => void;
    setRequirementsSetForGroups: (groups: string[]) => void;

    setNewReportCreated: (input: { id: string | undefined, status: "pending" | "processing" | "error" | undefined, message?: string }) => void

    resetState: () => void;
}

export const useCreateReportStore = create<ReportState>()(
    persist(
        (set) => ({
            currentStep: 0,
            selectedFramework: "iso13485",
            selectedSections: [],
            selectedDocumentNumbers: [],
            selectedRequirementGroups: [],
            selectedRequirements: [],
            newReportCreated: { id: "", status: undefined },

            sectionsSetForFramework: "",
            groupsSetForSections: [],
            requirementsSetForGroups: [],

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
                        message: input.message || undefined
                    },
                })),

            resetState: () =>
                set(() => ({
                    currentStep: 0,
                    selectedFramework: "iso13485",
                    selectedSections: [],
                    selectedRequirementGroups: [],
                    selectedRequirements: [],
                })),
        }),
        {
            name: "report-creation-store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
