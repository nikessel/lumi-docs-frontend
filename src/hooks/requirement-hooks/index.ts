import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { filterReports } from "@/utils/report-utils";
import { Requirement } from "@wasm";
import { useReportsContext } from "@/contexts/reports-context";
import { useRequirementGroupsContext } from "@/contexts/requirement-group-context";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

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
    const { requirementGroups } = useRequirementGroupsContext();

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
                console.error("❌ WASM module not loaded");
                setError("WASM module not loaded");
                return;
            }

            if (!requirementGroups.length) {
                console.log("⚠️ No requirement groups available, skipping requirement fetch");
                return;
            }

            if (!isInitialLoad && !lastUpdated) {
                console.log("🟢 Requirements are already up to date, skipping re-fetch");
                return;
            }

            try {
                if (isInitialLoad) {
                    console.log("🔄 Initial requirement fetch started...");
                    setLoading(true);
                } else {
                    console.log("🔄 Refetching requirements...");
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
                    console.log("✅ Initial requirement fetch completed");
                    setLoading(false);
                } else {
                    console.log("✅ Requirement refetch completed");
                    setBeingRefetched("requirements", false);
                }
            }
        };

        fetchRequirements(loading);
    }, [wasmModule, requirementGroups, lastUpdated, loading, setBeingRefetched, triggerUpdate]);

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

    const lastUpdated = useCacheInvalidationStore((state) => state.lastUpdated["allRequirements"]);
    const setBeingRefetched = useCacheInvalidationStore((state) => state.setBeingRefetched);
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate);

    useEffect(() => {
        const fetchAllRequirements = async (isInitialLoad = false) => {
            console.log(`🔄 Fetching all requirements... (Initial Load: ${isInitialLoad})`);

            if (!wasmModule) {
                console.error("❌ WASM module not loaded");
                setError("WASM module not loaded");
                return;
            }

            if (!isInitialLoad && !lastUpdated) {
                console.log("🟢 All requirements are already up to date, skipping fetch");
                return;
            }

            try {
                if (isInitialLoad) {
                    console.log("🔄 Initial all-requirements fetch started...");
                    setLoading(true);
                } else {
                    console.log("🔄 Refetching all requirements...");
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
                    console.log("✅ Initial all-requirements fetch completed");
                    setLoading(false);
                } else {
                    console.log("✅ All-requirements refetch completed");
                    setBeingRefetched("allRequirements", false);
                }
            }
        };

        fetchAllRequirements(loading);
    }, [wasmModule, lastUpdated, loading, setBeingRefetched, triggerUpdate]);

    return { requirements, loading, error };
};
