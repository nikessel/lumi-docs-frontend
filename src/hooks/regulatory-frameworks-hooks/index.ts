import { useState, useEffect } from "react";
import { getSupportedFrameworks } from "@/utils/regulatory-frameworks-utils";
import { RegulatoryFramework } from "@wasm";

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

    useEffect(() => {
        try {
            setLoading(true);
            const frameworks = getSupportedFrameworks();
            setFrameworks(frameworks);
        } catch (err: any) {
            console.error(err);
            setError("Failed to fetch regulatory frameworks.");
        } finally {
            setLoading(false);
        }
    }, []);

    return { frameworks, loading, error };
};
