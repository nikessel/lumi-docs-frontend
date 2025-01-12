import { useEffect, useState } from 'react';
import { useWasm } from '@/components/WasmProvider';
import { getSelectedFilteredReports } from '@/utils/report-utils'; // Adjust the path if necessary
import { Report } from '@wasm';
import { fetchReports } from '@/utils/report-utils';
import { useSearchParams } from 'next/navigation';

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

    useEffect(() => {
        const fetchAllReports = async () => {
            if (!wasmModule) return;

            try {
                setLoading(true);
                const { reports, error } = await fetchReports(wasmModule);

                if (error) {
                    setError(error);
                } else {
                    setReports(reports);
                }
            } catch (err: any) {
                setError(err?.message || "Failed to fetch reports.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllReports();
    }, [wasmModule]);

    return { reports, loading, error };
};