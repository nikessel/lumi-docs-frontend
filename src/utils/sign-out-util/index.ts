import { useCreateReportStore } from "@/stores/create-report-store";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

export async function clearAllData(): Promise<{ status: string; message: string }> {
    console.log("📌 Clearing all stored data...");

    try {
        const reportStore = useCreateReportStore.getState();
        const cacheStore = useCacheInvalidationStore.getState();

        if (reportStore && cacheStore) {
            reportStore.resetState();
            cacheStore.resetState();
            console.log("✅ All data cleared successfully.");
        } else {
            console.warn("⚠️ One or more stores are unavailable.");
        }

        return { status: "success", message: "All data has been successfully cleared." };
    } catch (error) {
        console.error("❌ Failed to clear data:", error);
        return {
            status: "error",
            message: `Failed to clear all data: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

