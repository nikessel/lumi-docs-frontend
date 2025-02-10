import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { filterReports } from "@/utils/report-utils";
import { Requirement } from "@wasm";
import { useReportsContext } from "@/contexts/reports-context";
import { useRequirementGroupsContext } from "@/contexts/requirement-group-context";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useAuth } from "../auth-hook/Auth0Provider";
import { fetchRequirementsByGroupIds } from "@/utils/requirement-utils";
import { useUserContext } from "@/contexts/user-context";
interface UseRequirements {
    requirements: RequirementWithGroupId[];
    filteredSelectedRequirements: RequirementWithGroupId[];
    requirementsByGroupId: Record<string, RequirementWithGroupId[]>;
    loading: boolean;
    error: string | null;
}

export interface RequirementWithGroupId extends Requirement {
    group_id: string;
}

export const useRequirements = (): UseRequirements => {
    const { wasmModule } = useWasm();
    const { reports, filteredSelectedReports } = useReportsContext();
    const { requirementGroups, loading: groupsLoading } = useRequirementGroupsContext();
    const { isAuthenticated, isLoading: authLoading } = useAuth()


    const [requirements, setRequirements] = useState<RequirementWithGroupId[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["requirements"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    useEffect(() => {
        const fetchRequirements = async (isInitialLoad = false) => {

            if (!wasmModule) {
                return;
            }

            if (!isAuthenticated || authLoading) {
                return;
            }

            if (!requirementGroups.length) {
                if (!groupsLoading) {
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
                    setBeingRefetched("requirements", true);
                }

                const { requirements: fetchedRequirements, errors } = await fetchRequirementsByGroupIds(
                    wasmModule,
                    requirementGroups.map(group => group.id)
                );

                if (Object.keys(errors).length > 0) {
                    console.warn("⚠️ Some groups failed to fetch:", errors);
                }

                setRequirements(fetchedRequirements);
                console.log(`✅ Fetched ${fetchedRequirements.length} requirements`);

                // **Important:** Mark fetch as completed
                triggerUpdate("requirements", true);
            } catch (err: unknown) {
                console.error("❌ Error fetching requirements:", err);
                setError((err as Error)?.message || "Failed to fetch requirements.");
            } finally {
                if (isInitialLoad) {
                    setLoading(false);
                } else {
                    setBeingRefetched("requirements", false);
                }
            }
        };

        fetchRequirements(loading);
    }, [wasmModule, requirementGroups, groupsLoading, lastUpdated, loading, setBeingRefetched, triggerUpdate, authLoading, isAuthenticated]);


    const filteredSelectedRequirements = (() => {
        if (!filteredSelectedReports.length) return requirements;

        const filteredReports = filterReports(reports, filteredSelectedReports.map(r => r.id), "", null, []);
        const selectedGroupIds = filteredReports.flatMap(report =>
            Array.from(report.section_assessments.values()).flatMap(section =>
                Array.from(section.sub_assessments?.keys() || [])
            )
        );

        return requirements.filter(req => selectedGroupIds.includes(req.group_id));
    })();

    const requirementsByGroupId = requirements.reduce<Record<string, RequirementWithGroupId[]>>(
        (acc, req) => {
            if (!acc[req.group_id]) {
                acc[req.group_id] = [];
            }
            acc[req.group_id].push(req);
            return acc;
        },
        {}
    );

    return {
        requirements,
        filteredSelectedRequirements,
        requirementsByGroupId,
        loading,
        error,
    };
};

interface UseAllRequirements {
    requirements: Requirement[];
    loading: boolean;
    error: string | null;
}

export const useAllRequirements = (): UseAllRequirements => {
    const { wasmModule } = useWasm();
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["allRequirements"]);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    useEffect(() => {
        const fetchAllRequirements = async () => {

            if (!wasmModule || !isAuthenticated || authLoading) return;

            try {
                setLoading(true);
                const response = await wasmModule.get_all_requirements();

                if (response.error) {
                    console.error("⚠️ Error fetching all requirements:", response.error.message);
                    throw new Error(response.error.message);
                }

                setRequirements(response.output?.output || []);
                console.log(`🟢 lumi-docs-context all requirements updated ${response.output?.output?.length || 0}`);

            } catch (err: unknown) {
                console.error("❌ Failed to fetch all requirements:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch requirements.");
            } finally {
                triggerUpdate("allRequirements", true); // Set lastUpdated to null
                setLoading(false);
                setHasFetchedOnce(true);
            }
        };

        if (!hasFetchedOnce || lastUpdated) {
            fetchAllRequirements();
        }
    }, [wasmModule, isAuthenticated, authLoading, lastUpdated, hasFetchedOnce, triggerUpdate]);

    return { requirements, loading, error };
};

