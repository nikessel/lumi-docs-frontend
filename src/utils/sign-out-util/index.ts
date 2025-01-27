import { useGlobalActionsStore } from "@/stores/global-actions-store";
import { useCreateReportStore } from "@/stores/create-report-store";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { deleteDatabase } from "../db-utils";

export async function clearAllData(): Promise<{ status: string; message: string }> {
    try {
        useGlobalActionsStore.getState().resetState();
        useCreateReportStore.getState().resetState();
        useCacheInvalidationStore.getState().resetState();

        await deleteDatabase();

        return { status: "success", message: "All data has been successfully cleared." };
    } catch (error) {

        return { status: "error", message: `Failed to clear all data: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export function delayTwoSeconds(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, 2000); // 2000 milliseconds = 2 seconds
    });
}