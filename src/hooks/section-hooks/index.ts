import { useEffect, useState, useMemo } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchSectionsByRegulatoryFramework } from "@/utils/sections-utils";
import { Section } from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useRegulatoryFrameworksContext } from "@/contexts/regulatory-frameworks-context";
import { useReportsContext } from "@/contexts/reports-context";
import { useAuth } from "../auth-hook/Auth0Provider";
import { logLumiDocsContext } from "@/utils/logging-utils";
import { useUserContext } from "@/contexts/user-context";

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
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
    const { user } = useUserContext()

    useEffect(() => {
        const fetchAllSections = async () => {
            if (!wasmModule || !isAuthenticated || authLoading) return;
            if (frameworks.length === 0 || frameWorksLoading) return;
            if (!user?.email) return
            
            try {
                setLoading(true);

                const sectionsMap: Record<string, Section[]> = {};
                let allFetchedSections: Section[] = [];

                const fetchPromises = frameworks.map(async (framework) => {
                    const { sections, error } = await fetchSectionsByRegulatoryFramework(wasmModule, framework.id);

                    if (error) {
                        logLumiDocsContext(`lumi-docs-context Failed to fetch sections for framework ${framework.id}: ${error}`, "warning")
                        setError(`Failed to fetch sections for some frameworks.`);
                    } else {
                        sectionsMap[framework.id] = sections;
                        allFetchedSections = [...allFetchedSections, ...sections];
                    }
                });

                await Promise.all(fetchPromises);

                setSections(allFetchedSections);
                setSectionsForRegulatoryFramework(sectionsMap);
                logLumiDocsContext(`Sections updated: ${allFetchedSections.length}`, "success")
            } catch (err: unknown) {
                logLumiDocsContext(`lumi-docs-context Error fetching sections: ${err}`, "error")
                setError((err as Error)?.message || "Failed to fetch sections.");
            } finally {
                triggerUpdate("sections", true); // Reset lastUpdated
                setLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated) {
            fetchAllSections();
        }
    }, [wasmModule, isAuthenticated, authLoading, frameworks, frameWorksLoading, lastUpdated, hasFetchedOnce, triggerUpdate, user?.email]);

    const filteredSelectedReportsSections = useMemo(() => {
        if (!filteredSelectedReports.length) return sections;

        const selectedSectionIds = filteredSelectedReports.flatMap(report =>
            Array.from(report.section_assessments.keys())
        );

        return sections.filter(section => selectedSectionIds.includes(section.id));
    }, [filteredSelectedReports, sections]);

    return {
        sections,
        filteredSelectedReportsSections,
        sectionsForRegulatoryFramework,
        loading,
        error,
    };
};
