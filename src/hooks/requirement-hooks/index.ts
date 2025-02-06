import { useEffect, useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { fetchRequirementsByIds } from "@/utils/requirement-utils";
import { RequirementGroup, Requirement, Report, RequirementAssessmentOrRequirementGroupAssessment } from "@wasm";

interface UseFilteredReportsRequirements {
    requirements: Requirement[];
    loading: boolean;
    error: string | null;
}

export const useFilteredReportsRequirements = (
    reports: Report[]
): UseFilteredReportsRequirements => {
    const { wasmModule } = useWasm();
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const extractRequirementIds = (
            assessments: Map<string, RequirementAssessmentOrRequirementGroupAssessment>
        ): string[] => {
            const ids: string[] = [];

            assessments.forEach((assessment, key) => {
                if ("requirement_assessment" in assessment) {
                    ids.push(key); // Use the key as the ID
                } else if ("requirement_group_assessment" in assessment) {
                    const groupAssessments = assessment.requirement_group_assessment.sub_assessments || new Map();
                    ids.push(...extractRequirementIds(groupAssessments)); // Recursively extract IDs
                }
            });

            return ids;
        };

        const fetchRequirements = async () => {
            if (!wasmModule || reports.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Collect all requirement IDs
                const allRequirementIds = reports.flatMap((report) =>
                    Array.from(report.section_assessments.values()).flatMap((section) =>
                        section.sub_assessments
                            ? extractRequirementIds(section.sub_assessments)
                            : []
                    )
                );

                const { requirements, errors } = await fetchRequirementsByIds(
                    wasmModule,
                    allRequirementIds
                );

                if (Object.keys(errors).length > 0) {
                    console.error("Errors fetching requirements:", errors);
                    setError("Some requirements could not be fetched.");
                }

                setRequirements(requirements);
            } catch (err: any) {
                console.error(err);
                setError(err?.message || "Failed to fetch requirements.");
            } finally {
                setLoading(false);
            }
        };

        fetchRequirements();
    }, [wasmModule, reports]);

    return { requirements, loading, error };
};


interface UseRequirementsForGroupIds {
    requirements: RequirementWithGroupId[];
    loading: boolean;
    error: string | null;
}

// Extend Requirement to include `group_id`
export interface RequirementWithGroupId extends Requirement {
    group_id: string;
}

export const useRequirementsForGroupIds = (
    groupIds: string[]
): UseRequirementsForGroupIds => {
    const { wasmModule } = useWasm();
    const [requirements, setRequirements] = useState<RequirementWithGroupId[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequirements = async () => {
            if (!wasmModule || groupIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const allRequirements: RequirementWithGroupId[] = [];

                for (const groupId of groupIds) {
                    const response = await wasmModule.get_requirements_by_group({ input: groupId });

                    if (response.error) {
                        throw new Error(response.error.message);
                    }

                    // Add `group_id` to each requirement
                    const requirementsWithGroupId = (response.output?.output || []).map((req: Requirement) => ({
                        ...req,
                        group_id: groupId,
                    }));

                    allRequirements.push(...requirementsWithGroupId);
                }

                setRequirements(allRequirements);
            } catch (err: any) {
                console.error('Error fetching requirements:', err);
                setError(err.message || 'Failed to fetch requirements.');
            } finally {
                setLoading(false);
            }
        };

        fetchRequirements();
    }, [wasmModule, groupIds]);

    return { requirements, loading, error };
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

    useEffect(() => {
        const fetchAllRequirements = async () => {
            if (!wasmModule) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await wasmModule.get_all_requirements();

                if (response.error) {
                    throw new Error(response.error.message);
                }

                setRequirements(response.output?.output || []);
            } catch (err: any) {
                console.error("Error fetching all requirements:", err);
                setError(err.message || "Failed to fetch requirements.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllRequirements();
    }, [wasmModule]);

    return { requirements, loading, error };
};