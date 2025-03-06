import { useCreateReportStore } from "@/stores/create-report-store";
import { RegulatoryFramework } from "@wasm";
import type * as WasmModule from "@wasm";
import { CreateReportInput } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

export const calculateReportPrice = (pricePerReq: number): number => {
    const { selectedRequirements } = useCreateReportStore.getState();
    return selectedRequirements.length * pricePerReq;
};

export type ValidateReportOutput =
    | { error: true; messages: string[] }
    | { error: false; input: CreateReportInput };

export const validateReportInput = async (wasmModule: typeof WasmModule | null): Promise<ValidateReportOutput> => {
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

    if (selectedRequirements.length === 0) {
        errorMessages.push("Please select at least 1 requirement.");
    }

    if (errorMessages.length > 0) {
        return {
            error: true,
            messages: errorMessages,
        };
    }

    const resBackendCheck = await wasmModule?.get_report_prerequisites_status()

    if (resBackendCheck?.output?.output === "device_not_ready") {
        errorMessages.push("Please wait for the system to run an initial analysis of the documents to identify non-applicable requirements. This can take up to 30 minutes")
    }

    if (resBackendCheck?.output?.output === "documents_not_ready") {
        errorMessages.push("Please wait for the uploaded documents to finish processing")
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
    // const createReportStore = useCreateReportStore.getState()
    newReportId && cacheStore.addStaleReportId(newReportId);
    cacheStore.triggerUpdate("reports");
    // newReportId && createReportStore.setNewReportCreated({ id: newReportId, status: "pending" })

    return response;
};
