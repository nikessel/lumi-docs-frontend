import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils"
import type { Report, ReportStatus, RequirementAssessment, RequirementGroupAssessment } from "@wasm";
import type * as WasmModule from "@wasm";
import { dbName, dbVersion } from "@/utils/db-utils";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

// Extended type for cached reports
interface CachedReport extends Report {
    timestamp?: number;
}

// Extended type for cached reports
interface CachedReport extends Report {
    timestamp?: number;
}

const DB_NAME = dbName;
const STORE_NAME = "reports";
const DB_VERSION = dbVersion;
const CACHE_TTL = 60 * 60 * 1000; 

export async function fetchReports(
    wasmModule: typeof WasmModule | null
): Promise<{
    reports: Report[];
    blobUrls: { [id: string]: string };
    error: string | null;
}> {
    const result: {
        reports: Report[];
        blobUrls: { [id: string]: string };
        error: string | null;
    } = {
        reports: [],
        blobUrls: {},
        error: null,
    };

    const { staleIds, removeStaleIds } = useCacheInvalidationStore.getState();

    // Fetch cached reports dynamically
    const cachedReports = await getData<CachedReport>(DB_NAME, STORE_NAME, DB_VERSION);
    const cachedIds = cachedReports.map((report) => report.id);
    const hasStaleIds = staleIds.some((id) => cachedIds.includes(id));

    const isFullFetch = await getMetadata(DB_NAME, "fullFetch", DB_VERSION);

    const lastFetchTimestamp = await getMetadata(DB_NAME, "lastFetch", DB_VERSION);


    const isExpired = lastFetchTimestamp
        ? Date.now() - lastFetchTimestamp > CACHE_TTL
        : true;

    if (cachedReports.length > 0 && !isExpired && isFullFetch && !hasStaleIds) {
        console.log("Using cached reports data");
        result.reports = cachedReports;
        return result;
    }

    if (!wasmModule) {
        result.error = "WASM module not loaded";
        return result;
    }

    try {
        const response = await wasmModule.get_all_reports();
        console.log("WASM response:", response);

        if (response.output) {
            const reportsData = response.output.output;

            // Add timestamp to each report
            const reportsWithTimestamps = reportsData.map((report: Report) => ({
                ...report,
                timestamp: Date.now(),
            }));

            // Save reports dynamically
            await saveData(DB_NAME, STORE_NAME, reportsWithTimestamps, DB_VERSION, true);

            await saveMetadata(DB_NAME, "fullFetch", true, DB_VERSION);
            await saveMetadata(DB_NAME, "lastFetch", Date.now(), DB_VERSION);
            removeStaleIds(cachedIds)

            result.reports = reportsData;
        } else if (response.error) {
            result.error = response.error.message;
        }
    } catch (err: unknown) {
        console.error("Error fetching reports:", err);
        result.error = "Failed to fetch reports";
    }

    return result;
}


export async function fetchReportsByIds(
    wasmModule: typeof WasmModule | null,
    reportIds: string[]
): Promise<{ reports: Report[]; errors: { [id: string]: string } }> {
    const results: { reports: Report[]; errors: { [id: string]: string } } = {
        reports: [],
        errors: {},
    };

    const { staleIds, removeStaleIds } = useCacheInvalidationStore.getState();


    // Fetch cached reports dynamically
    const cachedReports = await getData<CachedReport>(DB_NAME, STORE_NAME, DB_VERSION);

    // Determine which reports need to be fetched
    const reportsToFetch: string[] = [];
    const validCachedReports: Report[] = [];

    reportIds.forEach((reportId) => {
        const cachedReport = cachedReports.find((report) => report.id === reportId);

        const isStale = staleIds.includes(reportId);
        const isExpired = cachedReport?.timestamp
            ? Date.now() - cachedReport.timestamp > CACHE_TTL
            : true;

        if (cachedReport && !isExpired && !isStale) {
            console.log(`Using cached report for ID: ${reportId}`);
            validCachedReports.push(cachedReport);
        } else {
            reportsToFetch.push(reportId);
        }
    });

    // Include valid cached reports in the results
    results.reports.push(...validCachedReports);

    // Fetch fresh reports for IDs that were not cached or were expired
    if (reportsToFetch.length > 0) {
        if (!wasmModule) {
            reportsToFetch.forEach((id) => {
                results.errors[id] = "WASM module not loaded";
            });
            return results;
        }

        console.log(`Fetching fresh reports for IDs: ${reportsToFetch.join(", ")}`);

        const fetchPromises = reportsToFetch.map(async (reportId) => {
            try {
                const response = await wasmModule.get_report({ input: reportId });

                if (response.output) {
                    const reportData = response.output.output;

                    // Save fetched report dynamically
                    await saveData(DB_NAME, STORE_NAME, [{ ...reportData, timestamp: Date.now() }], DB_VERSION, false);

                    results.reports.push(reportData);
                } else if (response.error) {
                    results.errors[reportId] = response.error.message;
                }
            } catch (err: unknown) {
                results.errors[reportId] = "Failed to fetch report";
            }
        });

        // Wait for all fetch operations to complete
        await Promise.all(fetchPromises);

        removeStaleIds(reportsToFetch)
    }

    return results;
}

export async function getSelectedFilteredReports(
    wasmModule: typeof WasmModule | null
): Promise<Report[]> {
    if (!wasmModule) {
        throw new Error("WASM module not loaded");
    }

    const searchParams = new URLSearchParams(window.location.search);
    const reportsParam = searchParams.get('selectedReports');
    const selectedReportsIds = reportsParam
        ? reportsParam.split(",").map(report => decodeURIComponent(report))
        : [];

    if (selectedReportsIds.length === 0) {
        return [];
    }

    const { reports: fetchedReports, errors } = await fetchReportsByIds(wasmModule, selectedReportsIds);

    if (Object.keys(errors).length > 0) {
        console.error("Errors fetching reports:", errors);
        throw new Error("Some reports could not be fetched.");
    }

    return filterReports(fetchedReports); // Apply filtering logic here
}

export function filterReports(reports: Report[]): Report[] {
    // Placeholder logic; return the reports as is
    return reports;
}

export function extractAllRequirementAssessments(reports: Report[]): (RequirementAssessment & { id: string })[] {
    const assessments: (RequirementAssessment & { id: string })[] = [];

    // Helper function to extract requirement assessments recursively
    function extractFromGroup(group: RequirementGroupAssessment, parentId: string) {
        if (group.assessments) {
            for (const [key, value] of group.assessments.entries()) {
                if ('requirement' in value) {
                    assessments.push({ ...value.requirement, id: key });
                } else if ('requirement_group' in value) {
                    extractFromGroup(value.requirement_group, key);
                }
            }
        }
    }

    reports.forEach((report) => {
        // Traverse section assessments
        report.section_assessments.forEach((section, sectionId) => {
            if (section.requirement_assessments) {
                for (const [key, value] of section.requirement_assessments.entries()) {
                    if ('requirement' in value) {
                        assessments.push({ ...value.requirement, id: key });
                    } else if ('requirement_group' in value) {
                        extractFromGroup(value.requirement_group, key);
                    }
                }
            }
        });
    });

    return assessments;
}

export async function archiveReport(
    wasmModule: typeof WasmModule | null,
    reportId: string
): Promise<string> {
    if (!wasmModule) {
        throw new Error("WASM module not loaded");
    }

    try {
        const response = await wasmModule.archive_report({ input: reportId });
        if (response.output) {
            return `Report with ID ${reportId} archived successfully.`;
        } else if (response.error) {
            throw new Error(response.error.message);
        }
        // Add an explicit return statement in case neither condition is met
        return "Unexpected response from archive_report.";
    } catch (err: unknown) {
        console.error("Error archiving report:", err);
        throw new Error(`Failed to archive report with ID ${reportId}`);
    }
}

export async function restoreReport(
    wasmModule: typeof WasmModule | null,
    reportId: string
): Promise<string> {
    if (!wasmModule) {
        throw new Error("WASM module not loaded");
    }

    try {
        const response = await wasmModule.restore_report({ input: reportId });
        if (response.output) {
            return `Report with ID ${reportId} restored successfully.`;
        } else if (response.error) {
            throw new Error(response.error.message);
        }
        // Add a fallback return or throw to ensure all code paths are covered
        throw new Error("Unexpected response from restore_report.");
    } catch (err: unknown) {
        console.error("Error restoring report:", err);
        throw new Error(`Failed to restore report with ID ${reportId}`);
    }
}

export const isArchived = (status: ReportStatus | undefined): boolean => {
    return typeof status === "object" && "archived" in status;
};