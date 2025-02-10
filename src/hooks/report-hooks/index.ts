import { useEffect, useState } from 'react';
import { useWasm } from '@/components/WasmProvider';
import { Report } from '@wasm';
import { fetchReports, fetchReportsByIds, filterReports } from '@/utils/report-utils';
import useCacheInvalidationStore from '@/stores/cache-validation-store';
import { useCreateReportStore } from '@/stores/create-report-store';
import { useSearchParamsState } from '@/contexts/search-params-context';
import { useAllRequirementsContext } from '@/contexts/requirements-context/all-requirements-context';
import { useAuth } from '../auth-hook/Auth0Provider';

interface UseReports {
    reports: Report[];
    filteredSelectedReports: Report[];
    loading: boolean;
    error: string | null;
}

export const useReports = (): UseReports => {
    const { wasmModule } = useWasm();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth()


    const cacheStore = useCacheInvalidationStore.getState();
    const lastUpdated = cacheStore.lastUpdated["reports"];
    const staleReportIds = useCacheInvalidationStore((state) => state.staleReportIds);
    const addStaleReportId = useCacheInvalidationStore((state) => state.addStaleReportId);
    const removeStaleReportIds = useCacheInvalidationStore((state) => state.removeStaleReportIds);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);

    const newReportCreated = useCreateReportStore((state) => state.newReportCreated);
    const setNewReportCreated = useCreateReportStore((state) => state.setNewReportCreated);

    const [resolveRefreshPromise, setResolveRefreshPromise] = useState<(() => void) | null>(null);

    const { selectedReports, searchQuery, compliance } = useSearchParamsState();
    const { requirements } = useAllRequirementsContext();
    const [filteredSelectedReports, setFilteredSelectedReports] = useState<Report[]>([]);

    useEffect(() => {
        const filteredReports = filterReports(reports, selectedReports, searchQuery, compliance, requirements);
        setFilteredSelectedReports(filteredReports);
    }, [reports, selectedReports, searchQuery, compliance, requirements]);

    useEffect(() => {
        const processingReports = reports.filter((report) => report.status === "processing");

        if (processingReports.length > 0) {
            console.log(`⏳ Detected ${processingReports.length} reports in processing state. Adding to stale list.`);
            processingReports.forEach((report) => addStaleReportId(report.id));

            const timeout = setTimeout(() => {
                console.log("🔄 Triggering report update after 5 minutes due to processing state.");
                triggerUpdate("reports");
            }, 5 * 60 * 1000);

            return () => clearTimeout(timeout);
        }
    }, [reports, addStaleReportId, triggerUpdate]);

    useEffect(() => {
        const fetchReportsData = async (isInitialLoad = false) => {
            if (!wasmModule) {
                return;
            }

            if (!isAuthenticated || authLoading) {
                return
            }

            if (!lastUpdated && !isInitialLoad) {
                return;
            }

            try {
                if (isInitialLoad) {
                    setLoading(true);
                } else {
                    setBeingRefetched("reports", true);
                }

                let fetchedReports: Report[] = [];

                if (staleReportIds.length > 0 && reports.length > 0) {
                    triggerUpdate("reports", true);
                    const { reports: updatedReports, errors } = await fetchReportsByIds(wasmModule, staleReportIds);

                    if (Object.keys(errors).length > 0) {
                        console.error("❌ Errors fetching some stale reports:", errors);
                    } else {
                        console.log(`✅ Fetched stale reports: ${staleReportIds.join(", ")}`);
                    }

                    fetchedReports = reports.map((existingReport) =>
                        updatedReports[existingReport.id] || existingReport
                    );

                    removeStaleReportIds(staleReportIds);
                } else {
                    triggerUpdate("reports", true);

                    const { reports: allReports, error } = await fetchReports(wasmModule);

                    if (error) {
                        throw new Error(error);
                    }

                    console.log(`✅ Fetched all reports: ${allReports.length}`);

                    fetchedReports = allReports;
                }

                setReports(fetchedReports);

                const newReport = fetchedReports.find((report) => report.id === newReportCreated.id);

                if (newReport) {
                    console.log(`🔔 Detected new report with ID ${newReport.id}. Marking as processing.`);
                    setNewReportCreated({ id: newReport.id, status: "processing" });
                }

            } catch (err) {
                console.error("❌ Error fetching reports:", err);
                setError((err as Error)?.message || "Failed to fetch reports.");
            } finally {
                if (isInitialLoad) {
                    setLoading(false);
                } else {
                    setLoading(false);
                    setBeingRefetched("reports", false);
                }
                if (resolveRefreshPromise) {
                    console.log("✅ Resolving refresh promise...");
                    resolveRefreshPromise();
                    setResolveRefreshPromise(null);
                }

                triggerUpdate("reports", true);
            }
        };

        fetchReportsData(loading);
    }, [wasmModule, lastUpdated, loading, newReportCreated.id, removeStaleReportIds, reports, resolveRefreshPromise, setBeingRefetched, setNewReportCreated, staleReportIds, triggerUpdate, authLoading, isAuthenticated]);

    return { reports, filteredSelectedReports, loading, error };
};
