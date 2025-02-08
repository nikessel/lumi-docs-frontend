import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchSectionsByRegulatoryFramework } from "@/utils/sections-utils";
import { Section } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useRegulatoryFrameworksContext } from "@/contexts/regulatory-frameworks-context";
import { useReportsContext } from "@/contexts/reports-context";

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

    const [sections, setSections] = useState<Section[]>([]);
    const [sectionsForRegulatoryFramework, setSectionsForRegulatoryFramework] = useState<Record<string, Section[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["sections"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    useEffect(() => {
        const fetchAllSections = async (isInitialLoad = false) => {
            console.log(`🔄 Fetching all sections for all frameworks... (Initial Load: ${isInitialLoad})`);

            if (!wasmModule) {
                console.error("❌ WASM module not loaded");
                setError("WASM module not loaded");
                return;
            }

            if (!frameworks.length) {
                console.warn("⚠️ No regulatory frameworks available, skipping section fetch");
                if (!frameWorksLoading) {
                    setLoading(false)
                }
                return;
            }

            if (!isInitialLoad && !lastUpdated) {
                console.log("🟢 Sections are already up to date, skipping re-fetch");
                return;
            }

            try {
                if (isInitialLoad) {
                    console.log("🔄 Initial section fetch started...");
                    setLoading(true);
                } else {
                    console.log("🔄 Refetching sections...");
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
                    console.log("✅ Initial section fetch completed");
                    setLoading(false);
                } else {
                    console.log("✅ Section refetch completed");
                    setBeingRefetched("sections", false);
                }
            }
        };

        fetchAllSections(loading);
    }, [wasmModule, frameworks, frameWorksLoading, lastUpdated, loading, setBeingRefetched, triggerUpdate]);

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
