import type { Report, RequirementAssessmentOrRequirementGroupAssessment, IdType, ReportStatus, SectionAssessment, RequirementAssessment, RequirementGroupAssessment, Requirement } from "@wasm";
import type * as WasmModule from "@wasm";
import useCacheInvalidationStore from "@/stores/cache-validation-store";

export async function fetchReports(
    wasmModule: typeof WasmModule | null
): Promise<{
    reports: Report[];
    blobUrls: Record<string, string>;
    error: string | null;
}> {
    const result: {
        reports: Report[];
        blobUrls: Record<string, string>;
        error: string | null;
    } = {
        reports: [],
        blobUrls: {},
        error: null,
    };

    if (!wasmModule) {
        console.error("❌ Error: WASM module not loaded.");
        result.error = "WASM module not loaded";
        return result;
    }

    try {
        const response = await wasmModule.get_all_reports();

        if (response.output) {
            const reportsData = response.output.output;
            result.reports = reportsData;

        } else if (response.error) {
            console.error(`❌ Error fetching reports: ${response.error.message}`);
            result.error = response.error.message;
        }
    } catch (err) {
        console.error("❌ Error during report fetch:", err);
        result.error = "Failed to fetch reports";
    }

    return result;
}


export async function fetchReportsByIds(
    wasmModule: typeof WasmModule | null,
    reportIds: string[]
): Promise<{ reports: Record<string, Report | null>; errors: Record<string, string> }> {

    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return {
            reports: Object.fromEntries(reportIds.map(id => [id, null])),
            errors: Object.fromEntries(reportIds.map(id => [id, "WASM module not loaded"])),
        };
    }

    const cacheStore = useCacheInvalidationStore.getState();

    // ✅ Remove reports from `staleReportIds` before fetching
    cacheStore.removeStaleReportIds(reportIds);

    const results: { reports: Record<string, Report | null>; errors: Record<string, string> } = {
        reports: {},
        errors: {},
    };

    try {
        // Fetch all reports in parallel
        const fetchPromises = reportIds.map(async (reportId) => {
            try {
                const response = await wasmModule.get_report({ input: reportId });

                if (response.output) {
                    results.reports[reportId] = response.output.output;
                } else if (response.error) {
                    results.errors[reportId] = response.error.message;
                    console.error(`❌ Error fetching report ${reportId}: ${response.error.message}`);
                }
            } catch (err) {
                results.errors[reportId] = "Failed to fetch report";
                console.error(`❌ Failed to fetch report ${reportId}:`, err);
            }
        });

        await Promise.all(fetchPromises);

    } catch (err) {
        console.error("❌ Unexpected error fetching reports:", err);
    }

    return results;
}




export function filterReports(
    reports: Report[],
    selectedReportIds: string[],
    searchQuery: string,
    compliance: [number, number] | null,
    requirements: Requirement[]
): Report[] {
    return reports
        .filter(report => selectedReportIds.includes(report.id))
        .map(report => {
            console.log("reportasdasdasd", report)
            const filteredSections = new Map<IdType, SectionAssessment>();

            report.section_assessments.forEach((section, sectionId) => {
                if (!section.sub_assessments) return;

                const filteredAssessments = filterAssessmentsRecursively(
                    section.sub_assessments,
                    searchQuery,
                    compliance,
                    requirements
                );

                if (filteredAssessments.size > 0) {
                    filteredSections.set(sectionId, {
                        ...section,
                        sub_assessments: filteredAssessments,
                    });
                }
            });

            return filteredSections.size > 0 ? { ...report, section_assessments: filteredSections } : null;
        })
        .filter(Boolean) as Report[];
}


function filterAssessmentsRecursively(
    assessments: Map<IdType, RequirementAssessmentOrRequirementGroupAssessment>,
    searchQuery: string,
    compliance: [number, number] | null,
    requirements: Requirement[]
): Map<IdType, RequirementAssessmentOrRequirementGroupAssessment> {
    const filteredAssessments = new Map<IdType, RequirementAssessmentOrRequirementGroupAssessment>();

    assessments.forEach((assessment, id) => {
        if ("requirement_assessment" in assessment) {
            const requirement = requirements.find(req => req.id === id);
            const name = requirement?.name ?? "Unknown Requirement";
            const description = requirement?.description ?? "No description available";

            const { compliance_rating, details, objective_research_summary } = assessment.requirement_assessment;

            const matchesCompliance = compliance
                ? compliance_rating && compliance_rating >= compliance[0] && compliance_rating <= compliance[1]
                : true;

            const matchesSearchQuery = searchQuery
                ? details.includes(searchQuery) ||
                objective_research_summary.includes(searchQuery) ||
                name.includes(searchQuery) ||
                description.includes(searchQuery)
                : true;

            if (matchesCompliance && matchesSearchQuery) {
                filteredAssessments.set(id, assessment);
            }
        } else if ("requirement_group_assessment" in assessment && assessment.requirement_group_assessment.sub_assessments) {
            const filteredSubAssessments = filterAssessmentsRecursively(
                assessment.requirement_group_assessment.sub_assessments,
                searchQuery,
                compliance,
                requirements
            );

            if (filteredSubAssessments.size > 0) {
                filteredAssessments.set(id, {
                    ...assessment,
                    requirement_group_assessment: {
                        ...assessment.requirement_group_assessment,
                        sub_assessments: filteredSubAssessments,
                    },
                });
            }
        }
    });

    return filteredAssessments;
}

export function extractAllRequirementAssessments(reports: Report[]): (RequirementAssessment & { id: string, reportId: string, regulatoryFramework: WasmModule.RegulatoryFramework })[] {
    const assessments: (RequirementAssessment & { id: string, reportId: string, regulatoryFramework: WasmModule.RegulatoryFramework })[] = [];

    function extractFromGroup(group: RequirementGroupAssessment, reportId: string, regulatoryFramework: WasmModule.RegulatoryFramework) {
        if (group.sub_assessments) {
            for (const [key, value] of group.sub_assessments.entries()) {
                if ('requirement_assessment' in value) {
                    assessments.push({ ...value.requirement_assessment, id: key, reportId: reportId, regulatoryFramework: regulatoryFramework });
                } else if ('requirement_group_assessment' in value) {
                    extractFromGroup(value.requirement_group_assessment, reportId, regulatoryFramework);
                }
            }
        }
    }

    reports.forEach((report) => {
        report.section_assessments.forEach((section) => {
            if (section.sub_assessments) {
                for (const [key, value] of section.sub_assessments.entries()) {
                    if ('requirement_assessment' in value) {
                        assessments.push({ ...value.requirement_assessment, id: key, reportId: report.id, regulatoryFramework: report.regulatory_framework });
                    } else if ('requirement_group_assessment' in value) {
                        extractFromGroup(value.requirement_group_assessment, report.id, report.regulatory_framework);
                    }
                }
            }
        });
    });

    return assessments;
}

export async function archiveReport(
    wasmModule: typeof WasmModule | null,
    reportId: string
): Promise<string> {

    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        throw new Error("WASM module not loaded");
    }

    try {
        const response = await wasmModule.archive_report({ input: reportId });
        if (response.output) {
            return `Report with ID ${reportId} archived successfully.`;
        } else if (response.error) {
            console.error(`❌ Error archiving report ${reportId}: ${response.error.message}`);
            throw new Error(response.error.message);
        }

        console.warn("⚠️ Unexpected response from archive_report.");
        return "Unexpected response from archive_report.";
    } catch (err) {
        console.error(`❌ Failed to archive report ${reportId}:`, err);
        throw new Error(`Failed to archive report with ID ${reportId}`);
    }
}


export async function restoreReport(
    wasmModule: typeof WasmModule | null,
    reportId: string
): Promise<string> {
    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        throw new Error("WASM module not loaded");
    }

    try {
        const response = await wasmModule.restore_report({ input: reportId });

        if (response.output) {
            return `Report with ID ${reportId} restored successfully.`;
        } else if (response.error) {
            console.error(`❌ Error restoring report ${reportId}: ${response.error.message}`);
            throw new Error(response.error.message);
        }

        console.warn("⚠️ Unexpected response from restore_report.");
        throw new Error("Unexpected response from restore_report.");
    } catch (err) {
        console.error(`❌ Failed to restore report ${reportId}:`, err);
        throw new Error(`Failed to restore report with ID ${reportId}`);
    }
}


export const isArchived = (status: ReportStatus | undefined): boolean => {
    return typeof status === "object" && "archived" in status;
};

export async function renameReport(
    wasmModule: typeof WasmModule | null,
    reportId: string,
    newTitle: string
): Promise<string> {
    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        throw new Error("WASM module not loaded");
    }

    try {
        const response = await wasmModule.rename_report({
            input: reportId,
            title: newTitle
        });

        if (response.output) {
            return `Report with ID ${reportId} renamed successfully.`;
        } else if (response.error) {
            console.error(`❌ Error renaming report ${reportId}: ${response.error.message}`);
            throw new Error(response.error.message);
        }

        console.warn("⚠️ Unexpected response from rename_report.");
        throw new Error("Unexpected response from rename_report.");
    } catch (err) {
        console.error(`❌ Failed to rename report ${reportId}:`, err);
        throw new Error(`Failed to rename report with ID ${reportId}`);
    }
}

export const extractProgress = (title: string): number => {
    const match = title.match(/(\d+)\/(\d+)/);
    if (!match) return 0;

    const completed = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);

    return total > 0 ? Math.round((completed / total) * 100) : 0;
};