import { useEffect, useState } from 'react';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { Report } from '@wasm';
import { fetchReports, fetchReportsByIds, filterReports } from '@/utils/report-utils';
import useCacheInvalidationStore from '@/stores/cache-validation-store';
import { useCreateReportStore } from '@/stores/create-report-store';
import { useSearchParamsState } from '@/contexts/search-params-context';
import { useAllRequirementsContext } from '@/contexts/requirements-context/all-requirements-context';
import { useAuth } from '../auth-hook/Auth0Provider';
import { logLumiDocsContext } from '@/utils/logging-utils';
import { useUserContext } from '@/contexts/user-context';
import { RequirementAssessment, RegulatoryFramework } from '@wasm';

interface UseReports {
    reports: Report[];
    filteredSelectedReports: Report[];
    loading: boolean;
    error: string | null;
}

export type RequirementAssessmentWithId = RequirementAssessment & { id: string, reportId: string, regulatoryFramework: RegulatoryFramework };

export const useReports = (): UseReports => {
    const { wasmModule } = useWasm();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
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

    const { selectedReports, searchQuery, compliance } = useSearchParamsState();
    const { requirements, loading: requirementsLoading } = useAllRequirementsContext();
    const [filteredSelectedReports, setFilteredSelectedReports] = useState<Report[]>([]);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    const { user } = useUserContext()

    const [tbd, setTbd] = useState(0)

    useEffect(() => {
        const filteredReports = filterReports(reports, selectedReports, searchQuery, compliance, requirements);
        setFilteredSelectedReports(filteredReports);
    }, [reports, selectedReports, searchQuery, compliance, requirements]);

    useEffect(() => {
        const processingReports = reports.filter(report => report.status === "processing");

        if (processingReports.length > 0) {
            const timeout = setTimeout(() => {
                processingReports.forEach(report => addStaleReportId(report.id));
                triggerUpdate("reports");
            }, 30000);

            return () => clearTimeout(timeout);
        }
    }, [reports, addStaleReportId, triggerUpdate]);

    useEffect(() => {
        const fetchReportsData = async () => {
            if (!wasmModule || !isAuthenticated || authLoading || requirementsLoading) return;
            if (!user?.email) return
            if (loading) return

            try {
                setLoading(true);
                let fetchedReports: Report[] = reports;

                if (staleReportIds.length > 0 && reports.length > 0) {
                    // Fetch only stale reports
                    const { reports: updatedReports, errors } = await fetchReportsByIds(wasmModule, staleReportIds);

                    if (Object.keys(errors).length > 0) {
                        logLumiDocsContext(`Errors fetching some stale reports: ${errors}`, "error")
                    }

                    if (updatedReports) {
                        Object.values(updatedReports).forEach((report) => {
                            if (report) {
                                const existingIndex = fetchedReports.findIndex((existingReport) => existingReport.id === report.id);
                                if (existingIndex === -1) {
                                    fetchedReports.push(report);
                                } else {
                                    fetchedReports[existingIndex] = report;
                                }
                            }
                        });
                    }


                    fetchedReports = reports.map((existingReport) =>
                        updatedReports[existingReport.id] || existingReport
                    );

                    removeStaleReportIds(staleReportIds);
                    logLumiDocsContext(`Stale reports updated: ${staleReportIds.length}`, "success")
                } else {
                    const { reports: allReports, error } = await fetchReports(wasmModule);
                    if (error) {
                        throw new Error(error);
                    }
                    fetchedReports = allReports;
                    logLumiDocsContext(`All reports asdasd updated: ${fetchedReports.length}`, "success")
                }

                setReports(fetchedReports);
                const newReport = fetchedReports.find((report) => report.id === newReportCreated.id);

                if (newReport) {
                    logLumiDocsContext(`🔔 Detected new report with ID ${newReport.id}. Marking as processing.`, "success")
                    setNewReportCreated({ id: newReport.id, status: "processing" });
                }

            } catch (err) {
                logLumiDocsContext(`Error fetching reports: ${err}`, "error")
                setError(err instanceof Error ? err.message : "Failed to fetch reports.");
            } finally {
                triggerUpdate("reports", true);
                setLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated) {
            fetchReportsData();
        }
    }, [wasmModule, isAuthenticated, authLoading, lastUpdated, hasFetchedOnce, staleReportIds, reports, removeStaleReportIds, newReportCreated.id, setNewReportCreated, triggerUpdate, requirementsLoading, user?.email]);

    return { reports, filteredSelectedReports, loading, error };
};
