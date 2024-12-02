import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils"
import type { Report } from "@wasm";
import type * as WasmModule from "@wasm";

// Extended type for cached reports
interface CachedReport extends Report {
    timestamp?: number;
}

const DB_NAME = "ReportsCacheDB";
const STORE_NAME = "reports";
const DB_VERSION = 1;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

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



    // Fetch cached reports dynamically
    const cachedReports = await getData<CachedReport>(DB_NAME, STORE_NAME, DB_VERSION);
    const isFullFetch = await getMetadata(DB_NAME, "fullFetch", DB_VERSION);

    const lastFetchTimestamp = await getMetadata(DB_NAME, "lastFetch", DB_VERSION);


    const isExpired = lastFetchTimestamp
        ? Date.now() - lastFetchTimestamp > CACHE_TTL
        : true;

    if (cachedReports.length > 0 && !isExpired && isFullFetch) {
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
            console.log("beforesavemeta")
            await saveMetadata(DB_NAME, "fullFetch", true, DB_VERSION);
            await saveMetadata(DB_NAME, "lastFetch", Date.now(), DB_VERSION);
            console.log("aftersavemeta")
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


// export async function fetchReports(
//     wasmModule: typeof WasmModule | null
// ): Promise<{
//     reports: Report[];
//     blobUrls: { [id: string]: string };
//     error: string | null;
// }> {
//     const result: {
//         reports: Report[];
//         blobUrls: { [id: string]: string };
//         error: string | null;
//     } = {
//         reports: [],
//         blobUrls: {},
//         error: null,
//     };

//     const cachedReports = await getData<CachedReport>(DB_NAME, STORE_NAME, DB_VERSION);
//     const isFullFetch = await getMetadata(DB_NAME, "fullFetch", DB_VERSION);
//     const lastFetchTimestamp = await getMetadata(DB_NAME, "lastFetch", DB_VERSION);

//     const isExpired = lastFetchTimestamp
//         ? Date.now() - lastFetchTimestamp > CACHE_TTL
//         : true;

//     if (cachedReports.length > 0 && !isExpired && isFullFetch) {
//         console.log("Using cached reports data");
//         result.reports = cachedReports;
//         return result;
//     }

//     if (!wasmModule) {
//         result.error = "WASM module not loaded";
//         return result;
//     }

//     try {
//         const response = await wasmModule.get_all_reports();
//         console.log("WASM response:", response);

//         if (response.output) {
//             const reportsData = response.output.output;
//             console.log("Reports data:", reportsData);

//             // Add timestamp to each report
//             const reportsWithTimestamps = reportsData.map((report: Report) => ({
//                 ...report,
//                 timestamp: Date.now(),
//             }));

//             // Save reports and metadata
//             console.log("About to save data with timestamps");
//             await saveData(DB_NAME, STORE_NAME, reportsWithTimestamps, DB_VERSION, true);
//             console.log("About to save metaData fullFetch");
//             await saveMetadata(DB_NAME, "fullFetch", true, DB_VERSION);
//             console.log("About to save metaData lastFetch");
//             await saveMetadata(DB_NAME, "lastFetch", Date.now(), DB_VERSION);

//             result.reports = reportsData;
//         } else if (response.error) {
//             console.error("WASM error:", response.error.message);
//             result.error = response.error.message;
//         }
//     } catch (err: unknown) {
//         console.error("Error fetching reports:", err);
//         result.error = "Failed to fetch reports";
//     }
//     console.log("RESULTTTTT", result)
//     return result;
// }

export async function fetchReportsByIds(
    wasmModule: typeof WasmModule | null,
    reportIds: string[]
): Promise<{ reports: Report[]; errors: { [id: string]: string } }> {
    const results: { reports: Report[]; errors: { [id: string]: string } } = {
        reports: [],
        errors: {},
    };

    // Fetch cached reports dynamically
    const cachedReports = await getData<CachedReport>(DB_NAME, STORE_NAME, DB_VERSION);

    // Determine which reports need to be fetched
    const reportsToFetch: string[] = [];
    const validCachedReports: Report[] = [];

    reportIds.forEach((reportId) => {
        const cachedReport = cachedReports.find((report) => report.id === reportId);

        const isExpired = cachedReport?.timestamp
            ? Date.now() - cachedReport.timestamp > CACHE_TTL
            : true;

        if (cachedReport && !isExpired) {
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
    }

    return results;
}


// export async function fetchReportsByIds(
//     wasmModule: typeof WasmModule | null,
//     reportIds: string[]
// ): Promise<{ reports: Report[]; errors: { [id: string]: string } }> {
//     const results: { reports: Report[]; errors: { [id: string]: string } } = {
//         reports: [],
//         errors: {},
//     };

//     // Fetch cached reports
//     const cachedReports = await getData<CachedReport>(DB_NAME, STORE_NAME, DB_VERSION);

//     // Determine which reports need to be fetched
//     const reportsToFetch: string[] = [];
//     const validCachedReports: Report[] = [];

//     reportIds.forEach((reportId) => {
//         const cachedReport = cachedReports.find((report) => report.id === reportId);

//         const isExpired = cachedReport?.timestamp
//             ? Date.now() - cachedReport.timestamp > CACHE_TTL
//             : true;

//         if (cachedReport && !isExpired) {
//             console.log(`Using cached report for ID: ${reportId}`);
//             validCachedReports.push(cachedReport);
//         } else {
//             reportsToFetch.push(reportId);
//         }
//     });

//     // Include valid cached reports in the results
//     results.reports.push(...validCachedReports);

//     // Fetch fresh reports for IDs that were not cached or were expired
//     if (reportsToFetch.length > 0) {
//         if (!wasmModule) {
//             reportsToFetch.forEach((id) => {
//                 results.errors[id] = "WASM module not loaded";
//             });
//             return results;
//         }

//         console.log(`Fetching fresh reports for IDs: ${reportsToFetch.join(", ")}`);

//         const fetchPromises = reportsToFetch.map(async (reportId) => {
//             try {
//                 const response = await wasmModule.get_report({ input: reportId });

//                 if (response.output) {
//                     const reportData = response.output.output;

//                     // Save the fetched report to IndexedDB
//                     await saveData(DB_NAME, STORE_NAME, [{ ...reportData, timestamp: Date.now() }], DB_VERSION, false);

//                     results.reports.push(reportData);
//                 } else if (response.error) {
//                     console.error(`Error fetching report for ID: ${reportId}: ${response.error.message}`);
//                     results.errors[reportId] = response.error.message;
//                 }
//             } catch (err: unknown) {
//                 console.error(`Error fetching report for ID: ${reportId}`, err);
//                 results.errors[reportId] = "Failed to fetch report";
//             }
//         });

//         // Wait for all fetch operations to complete
//         await Promise.all(fetchPromises);
//     }

//     return results;
// }

//should recieve array of IDs
// export async function fetchReportById(
//     wasmModule: typeof WasmModule | null,
//     reportId: string
// ): Promise<{ report: Report | null; error: string | null }> {

//     const result: { report: Report | null; error: string | null } = {
//         report: null,
//         error: null,
//     };

//     // Fetch cached report
//     const cachedReports = await getData<CachedReport>(DB_NAME, STORE_NAME, DB_VERSION);
//     const cachedReport = cachedReports.find((report) => report.id === reportId);
//     console.log("cachedReport", cachedReport)

//     const isExpired = cachedReport?.timestamp
//         ? Date.now() - cachedReport.timestamp > CACHE_TTL
//         : true;

//     if (cachedReport && !isExpired) {
//         console.log(`Using cached report for ID: ${reportId}`);
//         result.report = cachedReport;
//         return result;
//     }

//     if (!wasmModule) {
//         result.error = "WASM module not loaded";
//         return result;
//     }

//     console.log(`Fetching fresh report for ID: ${reportId}`);

//     // Fetch from WASM module
//     try {
//         const response = await wasmModule.get_report({ input: reportId });

//         if (response.output) {
//             const reportData = response.output.output;
//             result.report = reportData;

//             // Save the report to IndexedDB
//             await saveData(DB_NAME, STORE_NAME, [{ ...reportData, timestamp: Date.now() }], DB_VERSION, false);
//         } else if (response.error) {
//             result.error = response.error.message;
//         }
//     } catch (err: unknown) {
//         console.error(`Error fetching report for ID: ${reportId}`, err);
//         result.error = "Failed to fetch report";
//     }

//     return result;
// }
