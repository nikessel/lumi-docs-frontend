import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Progress, Tag, Spin, Button, Tooltip } from 'antd';
import { RightOutlined, CheckCircleFilled, WarningFilled, CloseCircleFilled } from '@ant-design/icons';
import { Requirement, Task } from '@wasm';
import { getSimplefiedComplianceColorCode } from '@/utils/formating';
import RegulatoryFrameworkTag from '@/components/reports/regulatory-framework-tag';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';
import { useDocumentsContext } from '@/contexts/documents-context';
import { useStyle, getTextSizeClass, getPaddingClass, getIndentClass } from '@/contexts/style-context';
import { RequirementGroupWithSectionId } from '@/hooks/requirement-group-hooks';
import DetailedAssessmentModal from '@/components/reports/detailed-assessment-modal';
import { extractAllRequirementAssessments } from '@/utils/report-utils';
import { RequirementWithGroupId } from '@/hooks/requirement-hooks';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { getTasksByReportAndRequirmentId } from '@/utils/tasks-utils';
import { RequirementAssessmentWithId } from '@/hooks/report-hooks';
import NATag from '../non-applicable-tag';

const { Text } = Typography;

interface RequirementGroupProps {
    group: RequirementGroupWithSectionId;
    requirements: RequirementWithGroupId[];
    defaultExpanded?: boolean;
    complianceSortDirection: 'asc' | 'desc' | null;
    referenceSortActive: boolean;
}

const RequirementGroupComponent: React.FC<RequirementGroupProps> = ({ group, requirements, defaultExpanded = false, complianceSortDirection, referenceSortActive }) => {
    const { fontSize } = useStyle();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const { filteredSelectedReports } = useReportsContext();
    const { sections } = useSectionsContext();
    const { documents } = useDocumentsContext();
    const { wasmModule } = useWasm();
    const [requirementTasks, setRequirementTasks] = useState<{ [key: string]: Task[] }>({});
    const [tasksLoading, setTasksLoading] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        setIsExpanded(prev => (prev !== defaultExpanded ? defaultExpanded : prev));
    }, [defaultExpanded]);

    const [selectedRequirement, setSelectedRequirement] = useState<{
        requirement: Requirement | undefined;
        requirementAssessment: RequirementAssessmentWithId | undefined;
    }>({
        requirement: undefined,
        requirementAssessment: undefined,
    });
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set());

    // Memoize all assessments
    const allAssessments = useMemo(() => {
        return extractAllRequirementAssessments(filteredSelectedReports);
    }, [filteredSelectedReports]);

    // Memoize the regulatory framework
    const regulatoryFramework = useMemo(() => {
        const section = sections.find(s => s.id === group.section_id);
        return section?.regulatory_framework;
    }, [sections, group.section_id]);

    // Memoize the compliance rating
    const complianceRating = useMemo(() => {
        let rating: number | undefined = undefined;
        filteredSelectedReports.forEach(report => {
            report.section_assessments.forEach(section => {
                if (section.sub_assessments) {
                    const assessment = section.sub_assessments.get(group.id);
                    if (assessment && 'requirement_group_assessment' in assessment) {
                        rating = assessment.requirement_group_assessment.compliance_rating;
                    }
                }
            });
        });
        return rating;
    }, [filteredSelectedReports, group.id]);

    const progressComponent = useMemo(() => {
        if (complianceRating === undefined) return null;

        return (
            <Progress
                percent={complianceRating}
                size="small"
                showInfo={true}
                className="w-20"
                strokeColor={getSimplefiedComplianceColorCode(complianceRating)}
            />
        );
    }, [complianceRating]);

    // Update sorting logic for requirements
    const filteredAndSortedRequirements = useMemo(() => {
        // Get requirements that belong to this group and have assessments
        const groupRequirements = requirements.filter(req =>
            req.group_id === group.id &&
            allAssessments.some(assessment => assessment.id === req.id)
        );

        if (complianceSortDirection !== null) {
            return [...groupRequirements].sort((a, b) => {
                const assessmentA = allAssessments.find(assessment => assessment.id === a.id);
                const assessmentB = allAssessments.find(assessment => assessment.id === b.id);
                const ratingA = assessmentA?.compliance_rating ?? 0;
                const ratingB = assessmentB?.compliance_rating ?? 0;
                return complianceSortDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA;
            });
        }

        if (referenceSortActive) {
            return [...groupRequirements].sort((a, b) =>
                (a.name || '').localeCompare(b.name || '')
            );
        }

        // Default sorting
        return groupRequirements;
    }, [requirements, group.id, allAssessments, complianceSortDirection, referenceSortActive]);

    const toggleExpand = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
    }, []);

    const getRequirementAssessment = useCallback((requirementId: string): RequirementAssessmentWithId | undefined => {
        return allAssessments.find(assessment => assessment.id === requirementId);
    }, [allAssessments]);

    const handleRequirementClick = useCallback((requirement: Requirement) => {
        const assessment = getRequirementAssessment(requirement.id);
        setSelectedRequirement({ requirement, requirementAssessment: assessment });
        setOpenModal(true);
    }, [getRequirementAssessment]);

    const toggleRequirementExpand = useCallback((requirementId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedRequirements(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(requirementId)) {
                newExpanded.delete(requirementId);
            } else {
                newExpanded.add(requirementId);
            }
            return newExpanded;
        });
    }, []);

    const getComplianceIcon = (rating: number | undefined) => {
        if (rating === undefined) return <WarningFilled className="text-gray-500" />;
        if (rating > 80) return <CheckCircleFilled className="text-green-500" />;
        if (rating > 40) return <WarningFilled className="text-yellow-500" />;
        return <CloseCircleFilled className="text-red-500" />;
    };

    // Load tasks when a requirement is expanded
    useEffect(() => {
        expandedRequirements.forEach(async (requirementId) => {
            if (!wasmModule || requirementTasks[requirementId] || tasksLoading[requirementId]) return;

            const assessment = getRequirementAssessment(requirementId);
            if (!assessment?.reportId) return;

            setTasksLoading(prev => ({ ...prev, [requirementId]: true }));
            try {
                const tasks = await getTasksByReportAndRequirmentId(wasmModule, {
                    report_id: assessment.reportId,
                    requirement_id: requirementId,
                });
                setRequirementTasks(prev => ({ ...prev, [requirementId]: tasks }));
            } catch (error) {
                console.error("Failed to fetch tasks:", error);
            } finally {
                setTasksLoading(prev => ({ ...prev, [requirementId]: false }));
            }
        });
    }, [expandedRequirements, getRequirementAssessment, requirementTasks, tasksLoading, wasmModule]);

    const renderExpandedRequirementDetails = (assessment: RequirementAssessmentWithId | undefined) => {
        if (!assessment) return null;
        const textSizeClass = getTextSizeClass(fontSize);
        const indentClass = getIndentClass(fontSize);

        return (
            <div className={`${indentClass} mt-2 space-y-4 select-none pb-2`}>
                {/* Negative Findings */}
                {assessment.negative_findings && assessment.negative_findings.length > 0 && (
                    <div>
                        <div className="flex flex-wrap gap-1">
                            {assessment.negative_findings.map((finding, index) => (
                                <div key={index} className={`${textSizeClass} text-gray-600 flex items-center`}>
                                    <span className="mr-1">•</span>
                                    {finding}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Documents */}
                {assessment.sources && assessment.sources.length > 0 && (
                    <div className="mt-1 mb-2">
                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            {assessment.sources.slice(0, 1).map((sourceId, index) => {
                                const document = documents.find(doc => doc.number === sourceId);
                                if (!document) return null;
                                return (
                                    <Tag
                                        key={index}
                                        color="geekblue"
                                        className={`${textSizeClass} whitespace-nowrap document-tag`}
                                    >
                                        {document.meta.title || sourceId}
                                    </Tag>
                                );
                            })}
                            {assessment.sources.length > 1 && (
                                <Tooltip title={assessment.sources.slice(1).map(sourceId => {
                                    const document = documents.find(doc => doc.number === sourceId);
                                    return document?.meta.title || sourceId;
                                }).join('\n')}>
                                    <Tag color="geekblue" className={`${textSizeClass} whitespace-nowrap`}>
                                        +{assessment.sources.length - 1} more
                                    </Tag>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                )}


            </div>
        );
    };

    const renderRequirement = (requirement: RequirementWithGroupId) => {
        const assessment = getRequirementAssessment(requirement.id);
        const isExpanded = expandedRequirements.has(requirement.id);
        const textSizeClass = getTextSizeClass(fontSize);
        const paddingClass = getPaddingClass(fontSize);
        console.log("aassadas", assessment)
        return (
            <div key={requirement.id} className="cursor-pointer select-none">
                <div
                    className={`flex items-center gap-2 hover:bg-blue-50 ${paddingClass}`}
                    onClick={(e) => toggleRequirementExpand(requirement.id, e)}
                >
                    {assessment === undefined ? (
                        <Spin size="small" className="flex-shrink-0" />
                    ) : (
                        !assessment?.applicable ? (
                            <WarningFilled className="text-gray-500" />
                        ) : <div className="flex items-center gap-2 flex-shrink-0">
                            {getComplianceIcon(assessment?.compliance_rating)}
                            {assessment?.compliance_rating !== undefined && (
                                <Text className={textSizeClass + " whitespace-nowrap"}>
                                    {Math.round(assessment.compliance_rating)}%
                                </Text>
                            )}
                        </div>
                    )}

                    <Text className={textSizeClass + " whitespace-nowrap flex-shrink-0"}>{requirement.name}</Text>

                    {assessment ? <div className="flex items-center gap-2 ml-auto">
                        <button
                            className="hover:bg-blue-100 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRequirementClick(requirement);
                            }}
                        >
                            <Text className={textSizeClass}>Details</Text>
                        </button>
                        <RightOutlined
                            className={`${textSizeClass} transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                    </div> : ""}
                </div>
                {isExpanded && renderExpandedRequirementDetails(assessment)}
            </div>
        );
    };

    return (
        <div className="border-b last:border-b-0 select-none  pb-2">
            <div
                className={`${getPaddingClass(fontSize)} cursor-pointer flex items-center gap-2 my-2`}
                onClick={toggleExpand}
            >
                <RightOutlined
                    className={`${getTextSizeClass(fontSize)} transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
                {progressComponent}
                <Text className={`${getTextSizeClass(fontSize)} truncate font-bold`}>{group.name}</Text>
                <div className="flex-grow" />
                {regulatoryFramework && (
                    <div className="pr-3">
                        <RegulatoryFrameworkTag
                            standard={regulatoryFramework}
                            type="compact"
                            additionalReference={group.reference}
                        />
                    </div>
                )}
            </div>
            {isExpanded && (
                <div className={`${getIndentClass(fontSize)} pr-3 select-none`}>
                    {filteredAndSortedRequirements.map(requirement => renderRequirement(requirement))}
                </div>
            )}
            <DetailedAssessmentModal
                requirement={selectedRequirement.requirement}
                requirementAssessment={selectedRequirement.requirementAssessment}
                onClose={() => setOpenModal(false)}
                open={openModal}
                regulatoryFramework={selectedRequirement.requirementAssessment?.regulatoryFramework}
            />
        </div>
    );
};

export default RequirementGroupComponent; 