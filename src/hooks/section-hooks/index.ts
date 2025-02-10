import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchSectionsByRegulatoryFramework } from "@/utils/sections-utils";
import { Section } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useRegulatoryFrameworksContext } from "@/contexts/regulatory-frameworks-context";
import { useReportsContext } from "@/contexts/reports-context";
import { useAuth } from "../auth-hook/Auth0Provider";


interface UseSections {
    sections: Section[];
    filteredSelectedReportsSections: Section[];
    sectionsForRegulatoryFramework: Record<string, Section[]>;
    loading: boolean;
    error: string | null;
}

export const useSections = (): UseSections => {
    const { wasmModule } = useWasm();
    const { filteredSelectedReports } = useReportsContext();
    const { frameworks, loading: frameWorksLoading } = useRegulatoryFrameworksContext();
    const { isAuthenticated, isLoading: authLoading } = useAuth()


    const [sections, setSections] = useState<Section[]>([]);
    const [sectionsForRegulatoryFramework, setSectionsForRegulatoryFramework] = useState<Record<string, Section[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["sections"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    useEffect(() => {
        const fetchAllSections = async (isInitialLoad = false) => {
            if (!wasmModule) {
                return;
            }

            if (!isAuthenticated || authLoading) {
                return
            }

            if (!frameworks.length) {
                if (!frameWorksLoading) {
                    setLoading(false)
                }
                return;
            }

            if (!isInitialLoad && !lastUpdated) {
                return;
            }

            try {
                if (isInitialLoad) {
                    setLoading(true);
                } else {
                    setBeingRefetched("sections", true);
                }

                const sectionsMap: Record<string, Section[]> = {};
                let allFetchedSections: Section[] = [];

                const fetchPromises = frameworks.map(async (framework) => {
                    const { sections, error } = await fetchSectionsByRegulatoryFramework(wasmModule, framework.id);

                    if (error) {
                        console.warn(`⚠️ Failed to fetch sections for framework ${framework.id}:`, error);
                        setError(`Failed to fetch sections for some frameworks.`);
                    } else {
                        sectionsMap[framework.id] = sections;
                        allFetchedSections = [...allFetchedSections, ...sections];
                    }
                });

                await Promise.all(fetchPromises);

                console.log(`✅ Successfully fetched ${allFetchedSections.length} sections.`);

                setSections(allFetchedSections);
                setSectionsForRegulatoryFramework(sectionsMap);
                triggerUpdate("sections", true);

            } catch (err: unknown) {
                console.error("❌ Error fetching sections:", err);
                setError((err as Error)?.message || "Failed to fetch sections.");
            } finally {
                if (isInitialLoad) {
                    setLoading(false);
                } else {
                    setBeingRefetched("sections", false);
                }
            }
        };

        fetchAllSections(loading);
    }, [wasmModule, frameworks, frameWorksLoading, lastUpdated, loading, setBeingRefetched, triggerUpdate, authLoading, isAuthenticated]);

    const filteredSelectedReportsSections = (() => {
        if (!filteredSelectedReports.length) return sections;

        const selectedSectionIds = filteredSelectedReports.flatMap(report =>
            Array.from(report.section_assessments.keys())
        );

        return sections.filter(section => selectedSectionIds.includes(section.id));
    })();

    return {
        sections,
        filteredSelectedReportsSections,
        sectionsForRegulatoryFramework,
        loading,
        error,
    };
};
