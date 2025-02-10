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
    const { requirements, loading: requirementsLoading } = useAllRequirementsContext();
    const [filteredSelectedReports, setFilteredSelectedReports] = useState<Report[]>([]);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);


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
        const fetchReportsData = async () => {
            if (!wasmModule || !isAuthenticated || authLoading || requirementsLoading) return;

            try {
                setLoading(true);
                let fetchedReports: Report[] = [];

                if (staleReportIds.length > 0 && reports.length > 0) {
                    // Fetch only stale reports
                    const { reports: updatedReports, errors } = await fetchReportsByIds(wasmModule, staleReportIds);

                    if (Object.keys(errors).length > 0) {
                        console.error("❌ Errors fetching some stale reports:", errors);
                    }

                    fetchedReports = reports.map((existingReport) =>
                        updatedReports[existingReport.id] || existingReport
                    );

                    removeStaleReportIds(staleReportIds);
                    console.log(`🟢 lumi-docs-context stale reports updated: ${fetchedReports.length}`);
                } else {
                    // Fetch all reports
                    const { reports: allReports, error } = await fetchReports(wasmModule);

                    if (error) {
                        throw new Error(error);
                    }

                    fetchedReports = allReports;
                    console.log(`🟢 lumi-docs-context all reports updated: ${fetchedReports.length}`);
                }

                setReports(fetchedReports);

                const newReport = fetchedReports.find((report) => report.id === newReportCreated.id);
                if (newReport) {
                    console.log(`🔔 Detected new report with ID ${newReport.id}. Marking as processing.`);
                    setNewReportCreated({ id: newReport.id, status: "processing" });
                }

            } catch (err) {
                console.error("❌ Error fetching reports:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch reports.");
            } finally {
                triggerUpdate("reports", true); // Reset lastUpdated to avoid unnecessary refetches
                setLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated) {
            fetchReportsData();
        }
    }, [wasmModule, isAuthenticated, authLoading, lastUpdated, hasFetchedOnce, staleReportIds, reports, removeStaleReportIds, newReportCreated.id, setNewReportCreated, triggerUpdate, requirementsLoading]);

    return { reports, filteredSelectedReports, loading, error };
};
