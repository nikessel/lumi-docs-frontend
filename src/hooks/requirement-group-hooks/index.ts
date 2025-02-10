import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { filterReports } from "@/utils/report-utils";
import { RequirementGroup } from "@wasm";
import { useReportsContext } from "@/contexts/reports-context";
import { useSectionsContext } from "@/contexts/sections-context";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useAuth } from "../auth-hook/Auth0Provider";
import { fetchGroupsBySectionIds } from "@/utils/requirement-group-utils";

interface UseRequirementGroups {
    requirementGroups: RequirementGroupWithSectionId[];
    filteredSelectedRequirementGroups: RequirementGroupWithSectionId[];
    requirementGroupsBySectionId: Record<string, RequirementGroupWithSectionId[]>;
    loading: boolean;
    error: string | null;
}

export interface RequirementGroupWithSectionId extends RequirementGroup {
    section_id: string;
}

export const useRequirementGroups = (): UseRequirementGroups => {
    const { wasmModule } = useWasm();
    const { reports, filteredSelectedReports } = useReportsContext();
    const { sections, loading: sectionsLoading } = useSectionsContext();
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const [requirementGroups, setRequirementGroups] = useState<RequirementGroupWithSectionId[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["requirementGroups"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    useEffect(() => {
        const fetchRequirementGroups = async (isInitialLoad = false) => {
            console.log(`🔄 Fetching requirement groups... (Initial Load: ${isInitialLoad})`);

            if (!wasmModule) {
                return;
            }

            if (!isAuthenticated || authLoading) {
                return;
            }

            if (sections.length === 0) {
                if (!sectionsLoading) {
                    setLoading(false);
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
                    setBeingRefetched("requirementGroups", true);
                }

                // Use the new utility function
                const { requirementGroups: fetchedGroups, errors } = await fetchGroupsBySectionIds(
                    wasmModule,
                    sections.map(section => section.id)
                );

                if (Object.keys(errors).length > 0) {
                    console.warn("⚠️ Some sections failed to fetch requirement groups:", errors);
                }

                setRequirementGroups(fetchedGroups);
                console.log(`✅ Fetched ${fetchedGroups.length} requirement groups`);

                // **Important:** Mark fetch as completed
                triggerUpdate("requirementGroups", true);
            } catch (err: unknown) {
                console.error("❌ Error fetching requirement groups:", err);
                setError((err as Error)?.message || "Failed to fetch requirement groups.");
            } finally {
                if (isInitialLoad) {
                    setLoading(false);
                } else {
                    setBeingRefetched("requirementGroups", false);
                }
            }
        };

        fetchRequirementGroups(loading);
    }, [wasmModule, sections, sectionsLoading, lastUpdated, loading, setBeingRefetched, triggerUpdate, authLoading, isAuthenticated]);


    const filteredSelectedRequirementGroups = (() => {
        if (!filteredSelectedReports.length) return requirementGroups;

        const filteredReports = filterReports(reports, filteredSelectedReports.map(r => r.id), "", null, []);
        const selectedSectionIds = filteredReports.flatMap(report =>
            Array.from(report.section_assessments.keys())
        );

        return requirementGroups.filter(group => selectedSectionIds.includes(group.section_id));
    })();

    const requirementGroupsBySectionId = requirementGroups.reduce<Record<string, RequirementGroupWithSectionId[]>>(
        (acc, group) => {
            if (!acc[group.section_id]) {
                acc[group.section_id] = [];
            }
            acc[group.section_id].push(group);
            return acc;
        },
        {}
    );

    return {
        requirementGroups,
        filteredSelectedRequirementGroups,
        requirementGroupsBySectionId,
        loading,
        error,
    };
};
