import { useEffect, useState, useMemo } from "react";
import { useWasm } from "@/components/WasmProvider";
import { filterReports } from "@/utils/report-utils";
import { RequirementGroup } from "@wasm";
import { useReportsContext } from "@/contexts/reports-context";
import { useSectionsContext } from "@/contexts/sections-context";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useAuth } from "../auth-hook/Auth0Provider";
import { fetchGroupsBySectionIds } from "@/utils/requirement-group-utils";
import { logLumiDocsContext } from "@/utils/logging-utils";
import { useUserContext } from "@/contexts/user-context";

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
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [requirementGroups, setRequirementGroups] = useState<RequirementGroupWithSectionId[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["requirementGroups"]);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
    const { user } = useUserContext()

    useEffect(() => {
        const fetchRequirementGroups = async () => {
            console.log("sectionbssss", sectionsLoading)
            if (!wasmModule || !isAuthenticated || authLoading) return;
            if (sections.length === 0 || sectionsLoading) return;
            if (!user?.email) return

            try {
                setLoading(true);

                const { requirementGroups: fetchedGroups, errors } = await fetchGroupsBySectionIds(
                    wasmModule,
                    sections.map(section => section.id)
                );

                if (Object.keys(errors).length > 0) {
                    logLumiDocsContext(`Some sections failed to fetch requirement groups: ${errors}`, "warning")
                }

                setRequirementGroups(fetchedGroups);
                logLumiDocsContext(`Requirement groups updated: ${fetchedGroups.length}`, "success")
            } catch (err: unknown) {
                logLumiDocsContext(`Error fetching requirement groups: ${err}`, "error")
                setError((err as Error)?.message || "Failed to fetch requirement groups.");
            } finally {
                triggerUpdate("requirementGroups", true); // Reset lastUpdated
                setLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated) {
            fetchRequirementGroups();
        }
    }, [wasmModule, isAuthenticated, authLoading, sections, sectionsLoading, lastUpdated, hasFetchedOnce, triggerUpdate, user?.email]);

    const filteredSelectedRequirementGroups = useMemo(() => {
        if (!filteredSelectedReports.length) return requirementGroups;

        const filteredReports = filterReports(reports, filteredSelectedReports.map(r => r.id), "", null, []);
        const selectedSectionIds = filteredReports.flatMap(report =>
            Array.from(report.section_assessments.keys())
        );

        return requirementGroups.filter(group => selectedSectionIds.includes(group.section_id));
    }, [filteredSelectedReports, reports, requirementGroups]);

    const requirementGroupsBySectionId = useMemo(() => {
        return requirementGroups.reduce<Record<string, RequirementGroupWithSectionId[]>>(
            (acc, group) => {
                if (!acc[group.section_id]) {
                    acc[group.section_id] = [];
                }
                acc[group.section_id].push(group);
                return acc;
            },
            {}
        );
    }, [requirementGroups]);

    return {
        requirementGroups,
        filteredSelectedRequirementGroups,
        requirementGroupsBySectionId,
        loading,
        error,
    };
};