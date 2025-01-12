import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchRequirementGroupsByIds } from "@/utils/requirement-group-utils";
import {
    RequirementGroup,
    Report,
    RequirementOrRequirementGroupAssessment,
    Section
} from "@wasm";

interface UseFilteredReportsRequirementGroups {
    requirementGroups: RequirementGroup[];
    loading: boolean;
    error: string | null;
}

export const useFilteredReportsRequirementGroups = (
    reports: Report[]
): UseFilteredReportsRequirementGroups => {
    const { wasmModule } = useWasm();
    const [requirementGroups, setRequirementGroups] = useState<RequirementGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const extractGroupIds = (
            assessments: Map<string, RequirementOrRequirementGroupAssessment>
        ): string[] => {
            const ids: string[] = [];

            assessments.forEach((assessment, key) => {
                if ("requirement_group" in assessment) {
                    ids.push(key); // Use the key as the group ID
                    const groupAssessments = assessment.requirement_group.assessments || new Map();
                    ids.push(...extractGroupIds(groupAssessments)); // Recursively extract nested group IDs
                }
            });

            return ids;
        };

        const fetchRequirementGroups = async () => {
            if (!wasmModule || reports.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Collect all requirement group IDs
                const allGroupIds = reports.flatMap((report) =>
                    Array.from(report.section_assessments.values()).flatMap((section) =>
                        section.requirement_assessments
                            ? extractGroupIds(section.requirement_assessments)
                            : []
                    )
                );

                const { requirementGroups, errors } = await fetchRequirementGroupsByIds(
                    wasmModule,
                    allGroupIds
                );

                if (Object.keys(errors).length > 0) {
                    console.error("Errors fetching requirement groups:", errors);
                    setError("Some requirement groups could not be fetched.");
                }

                setRequirementGroups(requirementGroups);
            } catch (err: any) {
                console.error(err);
                setError(err?.message || "Failed to fetch requirement groups.");
            } finally {
                setLoading(false);
            }
        };

        fetchRequirementGroups();
    }, [wasmModule, reports]);

    return { requirementGroups, loading, error };
};

interface UseRequirementGroupsForSections {
    requirementGroups: RequirementGroupWithSectionId[];
    loading: boolean;
    error: string | null;
}

// Extend RequirementGroup to include `section_id`
interface RequirementGroupWithSectionId extends RequirementGroup {
    section_id: string;
}

export const useRequirementGroupsForSectionIds = (
    sectionIds: string[]
): UseRequirementGroupsForSections => {
    const { wasmModule } = useWasm();
    const [requirementGroups, setRequirementGroups] = useState<RequirementGroupWithSectionId[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequirementGroups = async () => {
            if (!wasmModule || sectionIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const allGroups: RequirementGroupWithSectionId[] = [];

                for (const sectionId of sectionIds) {
                    const response = await wasmModule.get_requirement_groups_by_section({ input: sectionId });

                    if (response.error) {
                        throw new Error(response.error.message);
                    }

                    // Add `section_id` to each group
                    const groupsWithSectionId = (response.output?.output || []).map((group: RequirementGroup) => ({
                        ...group,
                        section_id: sectionId,
                    }));

                    allGroups.push(...groupsWithSectionId);
                }

                setRequirementGroups(allGroups);
            } catch (err: any) {
                console.error('Error fetching requirement groups:', err);
                setError(err.message || 'Failed to fetch requirement groups.');
            } finally {
                setLoading(false);
            }
        };

        fetchRequirementGroups();
    }, [wasmModule, sectionIds]);

    return { requirementGroups, loading, error };
};