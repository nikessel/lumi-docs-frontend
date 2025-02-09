import { useState, useEffect } from "react";
import { getSupportedFrameworks } from "@/utils/regulatory-frameworks-utils";
import { RegulatoryFramework } from "@wasm";
// import { useNewAuth } from "../auth-hook";


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
    // const { isAuthenticated, isLoading: authLoading } = useNewAuth()

    useEffect(() => {
        const fetchFrameworks = async () => {

            try {
                setLoading(true);
                const frameworksData = getSupportedFrameworks();

                if (!frameworksData || frameworksData.length === 0) {
                    console.warn("⚠️ No regulatory frameworks found.");
                    setError("No regulatory frameworks available.");
                    return;
                }

                console.log(`✅ Successfully fetched ${frameworksData.length} regulatory frameworks.`);
                setFrameworks(frameworksData);
            } catch (err: unknown) {
                console.error("❌ Error fetching regulatory frameworks:", err);
                setError("Failed to fetch regulatory frameworks.");
            } finally {
                console.log("✅ Fetching frameworks process completed.");
                setLoading(false);
            }
        };

        fetchFrameworks();
    }, []);

    return { frameworks, loading, error };
};
