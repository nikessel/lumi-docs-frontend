import { useState, useEffect } from 'react';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { Device } from '@wasm';
import { useAuth } from '../auth-hook/Auth0Provider';
import { logLumiDocsContext } from '@/utils/logging-utils';
import { getDeviceDescriptions } from '@/utils/description-utils';

interface UseDeviceDescriptions {
    deviceDescriptions: Device[];
    loading: boolean;
    error: string | null;
}

export const useDeviceDescriptions = (): UseDeviceDescriptions => {
    const { wasmModule } = useWasm();
    const [deviceDescriptions, setDeviceDescriptions] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    useEffect(() => {
        const fetchDeviceDescriptions = async () => {
            if (!wasmModule || !isAuthenticated || authLoading) return;

            try {
                setLoading(true);
                const response = await getDeviceDescriptions(wasmModule);

                if (response.error) {
                    throw new Error(response.error);
                }

                setDeviceDescriptions(response.devices);
                logLumiDocsContext(`Device descriptions updated: ${response.devices.length}`, 'success');
            } catch (err) {
                logLumiDocsContext(`Error fetching device descriptions: ${err}`, 'error');
                setError(err instanceof Error ? err.message : 'Failed to fetch device descriptions');
            } finally {
                setLoading(false);
            }
        };

        fetchDeviceDescriptions();
    }, [wasmModule, isAuthenticated, authLoading]);

    return { deviceDescriptions, loading, error };
}; 