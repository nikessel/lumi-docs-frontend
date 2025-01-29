import { useEffect, useState } from 'react';
import { useWasm } from '@/components/WasmProvider';
import { getSelectedFilteredReports } from '@/utils/report-utils'; // Adjust the path if necessary
import { Report } from '@wasm';
import { fetchReports } from '@/utils/report-utils';
import useCacheInvalidationStore from '@/stores/cache-validation-store';
import { useCreateReportStore } from '@/stores/create-report-store';
import { useSearchParamsState } from '@/contexts/search-params-context';
import { useAllRequirements } from '../requirement-hooks';

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
    const { selectedReports, searchQuery, compliance } = useSearchParamsState()
    const { requirements, loading: requirementsLoading } = useAllRequirements()

    useEffect(() => {
        const fetchReports = async () => {
            if (!wasmModule || requirementsLoading) return

            try {
                setLoading(true);
                const fetchedReports = await getSelectedFilteredReports(wasmModule, selectedReports, searchQuery, compliance, requirements);
                setReports(fetchedReports);
            } catch (err: any) {
                console.error(err);
                setError(err?.message || "Failed to fetch reports.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [wasmModule, selectedReports, requirements]);

    return { reports, loading, error };
};

interface UseAllReports {
    reports: Report[];
    loading: boolean;
    error: string | null;
    forceUpdate: () => Promise<string>
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

    const [resolveRefreshPromise, setResolveRefreshPromise] = useState<(() => void) | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); // Key to trigger useEffect

    const forceUpdate = (): Promise<string> => {
        console.log("FORCING RERUN");
        return new Promise<string>((resolve) => {
            setResolveRefreshPromise(() => () => resolve("OK")); // Save the resolve function with "OK"
            setRefreshKey((prev) => prev + 1); // Update refresh key to trigger useEffect
        });
    };

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
            }, 5 * 60 * 1000);

            // Cleanup timeout on unmount or when reports change
            return () => clearTimeout(timeout);
        }
    }, [reports, addStaleReportId, triggerUpdate]);

    useEffect(() => {
        const fetchAllReports = async (isInitialLoad = false) => {
            if (!wasmModule) {
                return
            }

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
                if (resolveRefreshPromise) {
                    console.log("RESOLVING PROMISE")
                    resolveRefreshPromise();
                    setResolveRefreshPromise(null);
                }
            }
        };

        fetchAllReports(loading);
    }, [wasmModule, lastUpdated, refreshKey]);


    return { reports, loading, error, forceUpdate };
};
