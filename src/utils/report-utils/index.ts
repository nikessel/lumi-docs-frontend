import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils"
import type { Report, RequirementOrRequirementGroupAssessment, IdType, ReportStatus, SectionAssessment, RequirementAssessment, RequirementGroupAssessment, Requirement } from "@wasm";
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

    const validCachedReports: Report[] = [];
    const staleReportIdsToFetch: string[] = [];

    const { staleReportIds, removeStaleReportIds } = useCacheInvalidationStore.getState();
    const cachedReports = await getData<CachedReport>(DB_NAME, STORE_NAME, DB_VERSION);
    const isFullFetch = await getMetadata(DB_NAME, "fullFetch", DB_VERSION);

    if (staleReportIds.length < 1) {
        if (!wasmModule) {
            result.error = "WASM module not loaded";
            return result;
        }

        try {
            const response = await wasmModule.get_all_reports();
            if (response.output) {
                const reportsData = response.output.output;

                // Add timestamp to each report
                const reportsWithTimestamps = reportsData.map((report: Report) => ({
                    ...report,
                    timestamp: Date.now(),
                }));

                // Save reports and metadata
                await saveData(DB_NAME, STORE_NAME, reportsWithTimestamps, DB_VERSION, true);
                await saveMetadata(DB_NAME, "fullFetch", true, DB_VERSION);
                await saveMetadata(DB_NAME, "lastFetch", Date.now(), DB_VERSION);

                result.reports = reportsData;
                return result;
            } else if (response.error) {
                result.error = response.error.message;
                return result;
            }
        } catch (err: unknown) {
            console.error("Error during full fetch:", err);
            result.error = "Failed to perform full fetch";
            return result;
        }
    } else {
        cachedReports.forEach((report) => {
            if (!staleReportIds.includes(report.id) && report.timestamp && Date.now() - report.timestamp <= CACHE_TTL) {
                validCachedReports.push(report);
            } else {
                staleReportIdsToFetch.push(report.id);
            }
        });

        staleReportIds.forEach((id) => {
            if (!staleReportIdsToFetch.includes(id)) {
                staleReportIdsToFetch.push(id);
            }
        });

        result.reports.push(...validCachedReports);

        if (!wasmModule) {
            result.error = "WASM module not loaded";
            return result;
        }

        // if (staleReportIdsToFetch.length > 0) {
        //     console.log(`create1asdasdasd Fetching stale or missing reports for IDs: ${staleReportIdsToFetch.join(", ")}`);
        //     const fetchResults = await fetchReportsByIds(wasmModule, staleReportIdsToFetch);
        //     console.log(`create1asdasdasd  fetchResults`, fetchResults);

        //     result.reports.push(
        //         ...fetchResults.reports.map((report) => ({
        //             ...report,
        //             timestamp: Date.now(), // Add timestamp here
        //         }))
        //     );

        //     if (Object.keys(fetchResults.errors).length > 0) {
        //         console.error("Errors fetching some reports:", fetchResults.errors);
        //         result.error = "Some reports could not be fetched.";
        //     } else {
        //         removeStaleReportIds(staleReportIdsToFetch);
        //     }
        // }

        if (staleReportIdsToFetch.length > 0) {

            let fetchResults: { reports: Report[]; errors: { [id: string]: string } } = {
                reports: [],
                errors: {},
            };

            let attempts = 0;
            const maxAttempts = 5;
            const retryDelay = 500; // 500ms

            while (attempts < maxAttempts) {
                try {
                    fetchResults = await fetchReportsByIds(wasmModule, staleReportIdsToFetch);

                    // If there are no errors, break out of the retry loop
                    if (Object.keys(fetchResults.errors).length === 0) {
                        break;
                    }
                } catch (err) {
                    console.error(`Error fetching reports on attempt ${attempts + 1}:`, err);
                }

                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                }
            }

            // Add successfully fetched reports to the result
            result.reports.push(
                ...fetchResults.reports.map((report) => ({
                    ...report,
                    timestamp: Date.now(), // Add timestamp here
                }))
            );

            // If there are still errors after retries, handle them
            if (Object.keys(fetchResults.errors).length > 0) {
                console.error("Errors fetching some reports after retries:", fetchResults.errors);
                result.error = "Some reports could not be fetched after retries.";
            } else {
                removeStaleReportIds(staleReportIdsToFetch);
            }
        }

        if (!result.error) {
            await saveMetadata(DB_NAME, "lastFetch", Date.now(), DB_VERSION);
        }
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

    const { staleReportIds, removeStaleIds } = useCacheInvalidationStore.getState();

    // Fetch cached reports dynamically
    const cachedReports = await getData<CachedReport>(DB_NAME, STORE_NAME, DB_VERSION);

    // Determine which reports need to be fetched
    const reportsToFetch: string[] = [];
    const validCachedReports: Report[] = [];

    reportIds.forEach((reportId) => {
        const cachedReport = cachedReports.find((report) => report.id === reportId);

        const isStale = staleReportIds.includes(reportId);

        const isExpired = cachedReport?.timestamp
            ? Date.now() - cachedReport.timestamp > CACHE_TTL
            : true;

        if (cachedReport && !isExpired && !isStale) {
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
    wasmModule: typeof WasmModule | null,
    selectedReports: string[],
    searchQuery: string,
    compliance: [number, number] | null,
    requirements: Requirement[]
): Promise<Report[]> {
    console.log("GETTINGFILTEREDREPORTS")
    if (!wasmModule) {
        throw new Error("WASM module not loaded");
    }

    if (selectedReports.length === 0) {
        return [];
    }

    const { reports: fetchedReports, errors } = await fetchReportsByIds(wasmModule, selectedReports);

    if (Object.keys(errors).length > 0) {
        console.error("Errors fetching reports:", errors);
        throw new Error("Some reports could not be fetched.");
    }

    return filterReports(fetchedReports, searchQuery, compliance, requirements); // Apply filtering logic here
}

export function filterReports(reports: Report[], searchQuery: string, compliance: [number, number] | null, requirements: Requirement[]): Report[] {
    return reports
        .map(report => {
            const filteredSections = new Map<IdType, SectionAssessment>();
            report.section_assessments.forEach((section, sectionId) => {
                if (!section.requirement_assessments) return;

                const filteredRequirements = new Map<IdType, RequirementOrRequirementGroupAssessment>();

                section.requirement_assessments.forEach((assessment, requirementId) => {
                    if ("requirement" in assessment) {
                        const requirement = requirements.find((req) => req.id === requirementId);

                        const name = requirement?.name ?? "Unknown Requirement";
                        const description = requirement?.description ?? "No description available";

                        const { compliance_rating, details, objective_research_summary } = assessment.requirement;

                        const matchesCompliance = compliance
                            ? compliance_rating >= compliance[0] && compliance_rating <= compliance[1]
                            : true;

                        const matchesSearchQuery = searchQuery
                            ? details.includes(searchQuery) || objective_research_summary.includes(searchQuery) || name.includes(searchQuery) || description.includes(searchQuery)
                            : true;

                        if (matchesCompliance && matchesSearchQuery) {
                            filteredRequirements.set(requirementId, assessment);
                        }
                    }
                });

                if (filteredRequirements.size > 0) {
                    filteredSections.set(sectionId, {
                        ...section,
                        requirement_assessments: filteredRequirements
                    });
                }
            });

            if (filteredSections.size > 0) {
                return { ...report, section_assessments: filteredSections };
            }

            return null;
        })
        .filter(Boolean) as Report[];
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

// export async function restoreReport(
//     wasmModule: typeof WasmModule | null,
//     reportId: string
// ): Promise<string> {
//     if (!wasmModule) {
//         throw new Error("WASM module not loaded");
//     }

//     try {
//         const response = await wasmModule.restore_report({ input: reportId });

//         if (response.output) {
//             // Update the cached report in IndexedDB
//             const cachedReports = await getData<CachedReport>(dbName, "reports", dbVersion);

//             const updatedReports = cachedReports.map((report) => {
//                 if (report.id === reportId) {
//                     // Check if the report has an archived status with a previous_status
//                     const previousStatus =
//                         typeof report.status === "object" &&
//                             "archived" in report.status &&
//                             report.status.archived.previous_status
//                             ? report.status.archived.previous_status
//                             : "ready"; // Default to "ready" if no previous status exists

//                     return {
//                         ...report,
//                         status: previousStatus,
//                     };
//                 }
//                 return report;
//             });

//             await saveData(dbName, "reports", updatedReports, dbVersion, true);

//             return `Report with ID ${reportId} restored successfully.`;
//         } else if (response.error) {
//             throw new Error(response.error.message);
//         }
//         throw new Error("Unexpected response from restore_report.");
//     } catch (err: unknown) {
//         console.error("Error restoring report:", err);
//         throw new Error(`Failed to restore report with ID ${reportId}`);
//     }
// }

export const isArchived = (status: ReportStatus | undefined): boolean => {
    return typeof status === "object" && "archived" in status;
};


