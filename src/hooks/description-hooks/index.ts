import { useState, useEffect } from 'react';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { Device, Company, Trial } from '@wasm';
import { useAuth } from '../auth-hook/Auth0Provider';
import { logLumiDocsContext } from '@/utils/logging-utils';
import { getDeviceDescriptions, getAllCompanies, getAllTrials } from '@/utils/description-utils';

interface UseDescriptions {
    devices: Device[];
    companies: Company[];
    trials: Trial[];
    loading: boolean;
    error: string | null;
}

export const useDescriptions = (): UseDescriptions => {
    const { wasmModule } = useWasm();
    const [devices, setDevices] = useState<Device[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [trials, setTrials] = useState<Trial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    useEffect(() => {
        const fetchAllDescriptions = async () => {
            if (!wasmModule || !isAuthenticated || authLoading) return;

            try {
                setLoading(true);

                // Fetch all data in parallel
                const [deviceResponse, companiesResponse, trialsResponse] = await Promise.all([
                    getDeviceDescriptions(wasmModule),
                    getAllCompanies(wasmModule),
                    getAllTrials(wasmModule)
                ]);

                // Check for errors
                if (deviceResponse.error) {
                    throw new Error(deviceResponse.error);
                }
                if (companiesResponse.error) {
                    throw new Error(companiesResponse.error);
                }
                if (trialsResponse.error) {
                    throw new Error(trialsResponse.error);
                }

                // Update state with fetched data
                setDevices(deviceResponse.devices);
                setCompanies(companiesResponse.companies);
                setTrials(trialsResponse.trials);

                logLumiDocsContext(`Descriptions updated - Devices: ${deviceResponse.devices.length}, Companies: ${companiesResponse.companies.length}, Trials: ${trialsResponse.trials.length}`, 'success');
            } catch (err) {
                logLumiDocsContext(`Error fetching descriptions: ${err}`, 'error');
                setError(err instanceof Error ? err.message : 'Failed to fetch descriptions');
            } finally {
                setLoading(false);
            }
        };

        fetchAllDescriptions();
    }, [wasmModule, isAuthenticated, authLoading]);

    return { devices, companies, trials, loading, error };
}; 