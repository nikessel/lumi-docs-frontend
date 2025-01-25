import { useEffect, useState } from 'react';
import { useWasm } from '@/components/WasmProvider';
import { getSelectedFilteredReports } from '@/utils/report-utils'; // Adjust the path if necessary
import { Report } from '@wasm';
import { fetchReports } from '@/utils/report-utils';
import { useSearchParams } from 'next/navigation';
import useCacheInvalidationStore from '@/stores/cache-validation-store';
import { fetchReportsByIds } from "@/utils/report-utils";
import { useCreateReportStore } from '@/stores/create-report-store';
import { report } from 'process';

interface UseSelectedFilteredReports {
    reports: Report[];
    loading: boolean;
    error: string | null;
}

export const useSelectedFilteredReports = (): UseSelectedFilteredReports => {
    const { wasmModule } = useWasm();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const fetchedReports = await getSelectedFilteredReports(wasmModule);
                setReports(fetchedReports);
            } catch (err: any) {
                console.error(err);
                setError(err?.message || "Failed to fetch reports.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [wasmModule]);

    return { reports, loading, error };
};

interface UseAllReports {
    reports: Report[];
    loading: boolean;
    error: string | null;
}

export const useAllReports = (): UseAllReports => {
    const { wasmModule } = useWasm();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["reports"]);
    const addStaleReportId = useCacheInvalidationStore((state) => state.addStaleReportId);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const newReportCreated = useCreateReportStore((state) => state.newReportCreated)
    const setNewReportCreated = useCreateReportStore((state) => state.setNewReportCreated)

    useEffect(() => {
        // Check if any report has a status of "processing"
        const processingReports = reports.filter((report) => report.status === "processing");

        if (processingReports.length > 0) {
            // Add these reports to the stale list
            processingReports.forEach((report) => {
                addStaleReportId(report.id);
            });

            // Trigger update after 3 seconds
            const timeout = setTimeout(() => {
                triggerUpdate("reports");
            }, 3000);

            // Cleanup timeout on unmount or when reports change
            return () => clearTimeout(timeout);
        }
    }, [reports, addStaleReportId, triggerUpdate]);

    useEffect(() => {
        const fetchAllReports = async (isInitialLoad = false) => {
            if (!wasmModule) return;

            try {
                if (isInitialLoad) {
                    setLoading(true); // Set loading for the initial fetch
                } else {
                    setBeingRefetched("reports", true); // Set refetching for subsequent fetches
                }

                const { reports: fetchedReports, error } = await fetchReports(wasmModule);
                const rep = fetchedReports.find((report) => report.id === newReportCreated.id)

                if (rep) {
                    setNewReportCreated({ id: rep.id, status: "processing" })
                }
                if (error) {
                    setError(error);
                } else {
                    setReports(fetchedReports);
                }
            } catch (err: any) {
                setError(err?.message || "Failed to fetch reports.");
            } finally {
                if (isInitialLoad) {
                    setLoading(false);
                } else {
                    setBeingRefetched("reports", false);
                }
            }
        };

        fetchAllReports(loading);
    }, [wasmModule, lastUpdated]);

    return { reports, loading, error };
};

// interface UseReportsByIds {
//     reports: Report[];
//     loading: boolean;
//     error: string | null;
// }

// export const useReportsByIds = (reportIds: string[]): UseReportsByIds => {
//     const { wasmModule } = useWasm();
//     const [reports, setReports] = useState<Report[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [initialReportFetched, setInitialReportFetched] = useState(false)
//     const staleIds = useCacheInvalidationStore((state) => state.staleIds);
//     const [isStale, setIsStale] = useState(false)


//     useEffect(() => {
//         console.log("runinnguseeffect")
//         const fetchReports = async () => {

//             if (isStale || !initialReportFetched) {
//                 console.log("runinnguseeffect insde", reports)

//                 try {
//                     setLoading(true);
//                     const { reports: fetchedReports, errors } = await fetchReportsByIds(wasmModule, reportIds);
//                     setInitialReportFetched(true)
//                     if (Object.keys(errors).length > 0) {
//                         setError("Some reports could not be fetched.");
//                     } else {
//                         setReports(fetchedReports);
//                     }
//                 } catch (err: any) {
//                     setError(err.message || "Failed to fetch reports.");
//                 } finally {
//                     setLoading(false);
//                 }
//             }
//         };

//         if (reportIds.length > 0) {
//             fetchReports();
//         }
//     }, [wasmModule, reportIds]);

//     return { reports, loading, error };
// };