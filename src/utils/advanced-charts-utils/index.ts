import { Report, RequirementGroupAssessment } from "@wasm"
import { getComplianceColorCode } from "../formating";

type AnalysisResult = {
    numberOfSections: number;
    numberOfRequirementAssessments: number;
    numberOfRequirementGroupAssessments: number;
    maxNestedLevels: number;
    assessmentsPerLevel: Record<number, number>; // Number of assessments at each level
};

/**
 * Analyze an array of reports to extract key metrics.
 * @param reports - Array of Report objects
 * @returns An object containing analysis results
 */
export const analyzeReports = (reports: Report[]): AnalysisResult => {
    let numberOfSections = 0;
    let numberOfRequirementAssessments = 0;
    let numberOfRequirementGroupAssessments = 0;
    let maxNestedLevels = 0;
    const assessmentsPerLevel: Record<number, number> = {};

    const incrementLevelCount = (level: number) => {
        if (!assessmentsPerLevel[level]) {
            assessmentsPerLevel[level] = 0;
        }
        assessmentsPerLevel[level]++;
    };

    const traverseRequirementGroup = (
        requirementGroup: RequirementGroupAssessment,
        currentDepth: number
    ) => {
        maxNestedLevels = Math.max(maxNestedLevels, currentDepth);
        incrementLevelCount(currentDepth);

        if (requirementGroup.assessments) {
            for (const [, assessment] of requirementGroup.assessments) {
                if ('requirement' in assessment) {
                    numberOfRequirementAssessments++;
                    incrementLevelCount(currentDepth + 1);
                } else if ('requirement_group' in assessment) {
                    numberOfRequirementGroupAssessments++;
                    traverseRequirementGroup(assessment.requirement_group, currentDepth + 1);
                }
            }
        }
    };

    reports.forEach((report) => {
        if (report.section_assessments) {
            for (const [, section] of report.section_assessments) {
                numberOfSections++;
                incrementLevelCount(1); // Level 1: Section
                if (section.requirement_assessments) {
                    for (const [, assessment] of section.requirement_assessments) {
                        if ('requirement' in assessment) {
                            numberOfRequirementAssessments++;
                            incrementLevelCount(2); // Level 2: Direct requirements
                        } else if ('requirement_group' in assessment) {
                            numberOfRequirementGroupAssessments++;
                            traverseRequirementGroup(assessment.requirement_group, 2); // Depth starts at 2 (section → requirement group)
                        }
                    }
                }
            }
        }
    });

    return {
        numberOfSections,
        numberOfRequirementAssessments,
        numberOfRequirementGroupAssessments,
        maxNestedLevels,
        assessmentsPerLevel,
    };
};

type ComplianceData = {
    id: string;
    label: string;
    value: number;
};

/**
 * Traverses nested requirement groups to collect compliance ratings.
 * @param requirementGroup - RequirementGroupAssessment to traverse
 * @param complianceRatings - Array to store collected compliance ratings
 */
const traverseRequirementGroupForComplianceRatings = (
    requirementGroup: RequirementGroupAssessment,
    complianceRatings: number[]
) => {
    // Add compliance rating for the requirement group
    complianceRatings.push(requirementGroup.compliance_rating);

    if (requirementGroup.assessments) {
        for (const [, assessment] of requirementGroup.assessments) {
            if ("requirement" in assessment) {
                complianceRatings.push(assessment.requirement.compliance_rating);
            } else if ("requirement_group" in assessment) {
                traverseRequirementGroupForComplianceRatings(assessment.requirement_group, complianceRatings);
            }
        }
    }
};

/**
 * Extracts compliance ratings from an array of reports and groups them into intervals.
 * @param reports - Array of reports
 * @returns Array of compliance rating intervals with counts
 */
export const generateWaffleDataFromReports = (reports: Report[]): ComplianceData[] => {
    const complianceRatings: number[] = [];

    reports.forEach((report) => {
        if (report.section_assessments) {
            for (const [, section] of report.section_assessments) {
                // Add compliance rating for the section
                complianceRatings.push(section.compliance_rating);

                if (section.requirement_assessments) {
                    for (const [, assessment] of section.requirement_assessments) {
                        if ("requirement" in assessment) {
                            complianceRatings.push(assessment.requirement.compliance_rating);
                        } else if ("requirement_group" in assessment) {
                            traverseRequirementGroupForComplianceRatings(assessment.requirement_group, complianceRatings);
                        }
                    }
                }
            }
        }
    });

    // Define intervals (0–10, 11–20, ..., 91–100)
    const intervals = Array.from({ length: 10 }, (_, index) => ({
        start: index * 10,
        end: (index + 1) * 10 - 1,
    }));

    // Count compliance ratings in each interval
    const counts = intervals.map(({ start, end }) => {
        const count = complianceRatings.filter((rating) => rating >= start && rating <= end).length;

        return {
            id: `${start}-${end}`,
            label: `${start}-${end}`,
            value: count,
        };
    });

    return counts;
};

type NetworkNode = {
    id: string;
    color: string;
    size: number;
};

type NetworkLink = {
    source: string;
    target: string;
};

export const generateNetworkDataFromReports = (
    reports: Report[]
): { nodes: NetworkNode[]; links: NetworkLink[] } => {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];

    const generateUniqueId = (prefix: string, id: string | number) => `${prefix}-${id}`;

    reports.forEach((report, reportIndex) => {
        const reportId = generateUniqueId('Report', reportIndex);
        nodes.push({
            id: reportId,
            color: '#cccccc', // Default color for reports
            size: 20,
        });

        if (report.section_assessments) {
            Array.from(report.section_assessments).forEach(([sectionId, section]) => {
                const sectionNodeId = generateUniqueId('Section', sectionId);
                nodes.push({
                    id: sectionNodeId,
                    color: getComplianceColorCode(section.compliance_rating), // Color based on compliance rating
                    size: 15,
                });

                links.push({
                    source: reportId,
                    target: sectionNodeId, // Link section to its parent report
                });
            });
        }
    });

    return { nodes, links };
};
