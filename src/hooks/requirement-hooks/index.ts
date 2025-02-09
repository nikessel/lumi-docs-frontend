import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { filterReports } from "@/utils/report-utils";
import { Requirement } from "@wasm";
import { useReportsContext } from "@/contexts/reports-context";
import { useRequirementGroupsContext } from "@/contexts/requirement-group-context";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
// import { useNewAuth } from "../auth-hook";

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
    // const { isAuthenticated, isLoading: authLoading } = useNewAuth()


    const [requirements, setRequirements] = useState<RequirementWithGroupId[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["requirements"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    useEffect(() => {
        const fetchRequirements = async (isInitialLoad = false) => {
            console.log(`🔄 Fetching requirements... (Initial Load: ${isInitialLoad})`);

            if (!wasmModule) {
                setError("WASM module not loaded");
                return;
            }

            // if (!isAuthenticated && !authLoading) {
            //     setError("User not authenticated");
            //     setLoading(false)
            //     return
            // }

            if (!requirementGroups.length) {
                if (!groupsLoading) {
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
                    setBeingRefetched("requirements", true);
                }

                const allRequirements: RequirementWithGroupId[] = [];

                for (const group of requirementGroups) {
                    const response = await wasmModule.get_requirements_by_group({ input: group.id });

                    if (response.error) {
                        console.warn(`⚠️ Failed to fetch requirements for group ${group.id}: ${response.error.message}`);
                        continue;
                    }

                    // Add `group_id` to each requirement
                    const requirementsWithGroupId = (response.output?.output || []).map((req: Requirement) => ({
                        ...req,
                        group_id: group.id,
                    }));

                    allRequirements.push(...requirementsWithGroupId);
                }

                console.log(`✅ Fetched ${allRequirements.length} requirements`);
                setRequirements(allRequirements);

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
    }, [wasmModule, requirementGroups, groupsLoading, lastUpdated, loading, setBeingRefetched, triggerUpdate]);

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
    // const { isAuthenticated, isLoading: authLoading } = useNewAuth()


    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["allRequirements"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    useEffect(() => {
        const fetchAllRequirements = async (isInitialLoad = false) => {
            console.log(`🔄 Fetching all requirements... (Initial Load: ${isInitialLoad})`);

            if (!wasmModule) {
                setError("WASM module not loaded");
                return;
            }

            // if (!isAuthenticated && !authLoading) {
            //     setError("User not authenticated");
            //     setLoading(false)
            //     return
            // }

            if (!isInitialLoad && !lastUpdated) {
                return;
            }

            try {
                if (isInitialLoad) {
                    setLoading(true);
                } else {
                    setBeingRefetched("allRequirements", true);
                }

                const response = await wasmModule.get_all_requirements();

                if (response.error) {
                    console.error("⚠️ Error fetching all requirements:", response.error.message);
                    throw new Error(response.error.message);
                }

                console.log(`✅ Fetched ${response.output?.output?.length || 0} requirements`);
                setRequirements(response.output?.output || []);

                // **Important:** Mark fetch as completed
                triggerUpdate("allRequirements", true);
            } catch (err: unknown) {
                console.error("❌ Failed to fetch all requirements:", err);
                setError((err as Error)?.message || "Failed to fetch requirements.");
            } finally {
                if (isInitialLoad) {
                    setLoading(false);
                } else {
                    setBeingRefetched("allRequirements", false);
                }
            }
        };

        fetchAllRequirements(loading);
    }, [wasmModule, lastUpdated, loading, setBeingRefetched, triggerUpdate]);

    return { requirements, loading, error };
};
