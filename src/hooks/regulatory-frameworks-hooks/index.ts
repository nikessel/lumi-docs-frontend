import { useState, useEffect } from "react";
import { getSupportedFrameworks } from "@/utils/regulatory-frameworks-utils";
import { RegulatoryFramework } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useAuth } from "../auth-hook/Auth0Provider";
import { logLumiDocsContext } from "@/utils/logging-utils";

interface FrameworkInfo {
    id: RegulatoryFramework;
    description: string;
}

interface UseRegulatoryFrameworks {
    frameworks: FrameworkInfo[];
    loading: boolean;
    error: string | null;
}

export const useRegulatoryFrameworks = (): UseRegulatoryFrameworks => {
    const [frameworks, setFrameworks] = useState<FrameworkInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["regulatoryFrameworks"]);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    useEffect(() => {
        const fetchFrameworks = async () => {
            if (!isAuthenticated || authLoading) return;

            try {
                setLoading(true);
                const frameworksData = getSupportedFrameworks();

                if (!frameworksData || frameworksData.length === 0) {
                    logLumiDocsContext("No regulatory frameworks found.", "warning")
                    setError("No regulatory frameworks available.");
                    return;
                }

                setFrameworks(frameworksData);
                logLumiDocsContext(`Regulatory frameworks updated: ${frameworksData.length}`, "success")
            } catch (err: unknown) {
                logLumiDocsContext(`Error fetching regulatory frameworks: ${err}`, "error")
                setError("Failed to fetch regulatory frameworks.");
            } finally {
                triggerUpdate("regulatoryFrameworks", true); // Reset lastUpdated
                setLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated) {
            fetchFrameworks();
        }
    }, [isAuthenticated, authLoading, lastUpdated, hasFetchedOnce, triggerUpdate]);

    return { frameworks, loading, error };
};
