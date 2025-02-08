import { useCreateReportStore } from "@/stores/create-report-store";
import { RegulatoryFramework } from "@wasm";
import type * as WasmModule from "@wasm";
import { CreateReportInput } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { PRICE_PER_REQUIREMENT_IN_EURO } from "../payment";

export const calculateReportPrice = (): number => {
    const { selectedRequirements } = useCreateReportStore.getState();
    return selectedRequirements.length * PRICE_PER_REQUIREMENT_IN_EURO;
};

export const validateReportInput = (): { error: true; messages: string[] } | { error: false; input: CreateReportInput } => {
    const {
        selectedFramework,
        selectedSections,
        selectedDocumentNumbers,
        selectedRequirementGroups,
        selectedRequirements
    } = useCreateReportStore.getState();

    const errorMessages: string[] = [];

    if (selectedSections.length === 0) {
        errorMessages.push("Please select at least 1 section.");
    }

    if (selectedRequirementGroups.length === 0) {
        errorMessages.push("Please select at least 1 requirement group.");
    }

    if (selectedDocumentNumbers.length === 0) {
        errorMessages.push("Please select at least 1 document.");
    }

    if (errorMessages.length > 0) {
        return {
            error: true,
            messages: errorMessages,
        };
    }

    const input: CreateReportInput = {
        regulatory_framework: selectedFramework as RegulatoryFramework,
        filter: {
            sections_to_include: selectedSections,
            requirement_groups_to_include: selectedRequirementGroups,
            document_numbers_to_include: selectedDocumentNumbers,
            requirements_to_include: selectedRequirements,
        }
    };

    return {
        error: false,
        input,
    };
};

export const createReport = async (wasmModule: typeof WasmModule | null, input: CreateReportInput) => {

    if (!wasmModule) {
        throw new Error("WASM module is not loaded. Please try again.");
    }

    const response = await wasmModule.create_report(input);

    const newReportId = response.output?.output
    const cacheStore = useCacheInvalidationStore.getState();
    const createReportStore = useCreateReportStore.getState()
    newReportId && cacheStore.addStaleReportId(newReportId);
    cacheStore.triggerUpdate("reports")
    newReportId && createReportStore.setNewReportCreated({ id: newReportId, status: "pending" })

    if (response.error) {
        createReportStore.setNewReportCreated({ id: undefined, status: "error", message: response.error.message })
        throw new Error(response.error.message);
    }

    return response;
};
