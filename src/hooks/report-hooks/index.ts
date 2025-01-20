import { useEffect, useState } from 'react';
import { useWasm } from '@/components/WasmProvider';
import { getSelectedFilteredReports } from '@/utils/report-utils'; // Adjust the path if necessary
import { Report } from '@wasm';
import { fetchReports } from '@/utils/report-utils';
import { useSearchParams } from 'next/navigation';
import useCacheInvalidationStore from '@/stores/cache-validation-store';

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
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);

    useEffect(() => {
        const fetchAllReports = async (isInitialLoad = false) => {
            if (!wasmModule) return;

            try {
                if (isInitialLoad) {
                    setLoading(true); // Set loading for the initial fetch
                } else {
                    console.log("isRefetchingReports from hook")
                    setBeingRefetched("reports", true); // Set refetching for subsequent fetches
                }

                const { reports: fetchedReports, error } = await fetchReports(wasmModule);

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