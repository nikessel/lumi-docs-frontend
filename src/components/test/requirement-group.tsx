import React, { useState } from 'react';
import { Typography, Collapse, Tooltip, Progress } from 'antd';
import { RightOutlined, CheckCircleFilled, WarningFilled, CloseCircleFilled } from '@ant-design/icons';
import { RequirementGroup, Requirement, RequirementAssessment } from '@wasm';
import { getComplianceColorCode } from '@/utils/formating';
import RegulatoryFrameworkTag from '@/components/regulatory-framework-tag';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';
import { RequirementGroupWithSectionId } from '@/hooks/requirement-group-hooks';
import DetailedAssessmentModal from '@/components/detailed-assessment-modal';
import { RequirementAssessmentWithId } from '@/app/reports/view/key_findings/page';
import { extractAllRequirementAssessments } from '@/utils/report-utils';

const { Text } = Typography;

interface RequirementGroupProps {
    group: RequirementGroupWithSectionId;
    requirements: Requirement[];
}

const RequirementGroupComponent: React.FC<RequirementGroupProps> = ({ group, requirements }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showHighCompliance, setShowHighCompliance] = useState(false);
    const { filteredSelectedReports } = useReportsContext();
    const { sections } = useSectionsContext();
    const [selectedRequirement, setSelectedRequirement] = useState<{
        requirement: Requirement | undefined;
        requirementAssessment: RequirementAssessmentWithId | undefined;
    }>({
        requirement: undefined,
        requirementAssessment: undefined,
    });
    const [openModal, setOpenModal] = useState<boolean>(false);

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    // Get the compliance rating from the report's assessments
    const getGroupComplianceRating = () => {
        for (const report of filteredSelectedReports) {
            for (const section of report.section_assessments.values()) {
                if (section.sub_assessments) {
                    const assessment = section.sub_assessments.get(group.id);
                    if (assessment && 'requirement_group_assessment' in assessment) {
                        return assessment.requirement_group_assessment.compliance_rating;
                    }
                }
            }
        }
        return undefined;
    };

    // Get the regulatory framework from the section
    const getRegulatoryFramework = () => {
        const section = sections.find(s => s.id === group.section_id);
        return section?.regulatory_framework;
    };

    // Get all requirement assessments
    const allAssessments = extractAllRequirementAssessments(filteredSelectedReports);

    // Get requirement assessment
    const getRequirementAssessment = (requirementId: string): RequirementAssessmentWithId | undefined => {
        return allAssessments.find(assessment => assessment.id === requirementId);
    };

    const complianceRating = getGroupComplianceRating();
    const regulatoryFramework = getRegulatoryFramework();

    // Sort requirements by compliance rating
    const sortedRequirements = [...requirements].sort((a, b) => {
        const assessmentA = getRequirementAssessment(a.id);
        const assessmentB = getRequirementAssessment(b.id);
        const ratingA = assessmentA?.compliance_rating ?? 0;
        const ratingB = assessmentB?.compliance_rating ?? 0;
        return ratingA - ratingB;
    });

    // Group requirements by compliance rating
    const highComplianceRequirements = sortedRequirements.filter(req => {
        const assessment = getRequirementAssessment(req.id);
        return assessment?.compliance_rating && assessment.compliance_rating > 80;
    });

    const lowComplianceRequirements = sortedRequirements.filter(req => {
        const assessment = getRequirementAssessment(req.id);
        return !assessment?.compliance_rating || assessment.compliance_rating <= 80;
    });

    const handleRequirementClick = (requirement: Requirement) => {
        const assessment = getRequirementAssessment(requirement.id);
        setSelectedRequirement({ requirement, requirementAssessment: assessment });
        setOpenModal(true);
    };

    const getComplianceIcon = (rating: number | undefined) => {
        if (rating === undefined) return null;
        if (rating > 80) return <CheckCircleFilled className="text-green-500" />;
        if (rating > 40) return <WarningFilled className="text-yellow-500" />;
        return <CloseCircleFilled className="text-red-500" />;
    };

    const renderFindings = (assessment: RequirementAssessmentWithId | undefined) => {
        if (!assessment?.negative_findings || assessment.negative_findings.length === 0) {
            return null;
        }
        return (
            <div className="text-xs flex items-center gap-1 truncate">
                {assessment.negative_findings.map((finding: string, index: number) => (
                    <React.Fragment key={index}>
                        <span className="text-gray-500 truncate">{finding}</span>
                        {index < assessment.negative_findings.length - 1 && (
                            <span className="">•</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="border-b last:border-b-0">
            <div
                className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                onClick={toggleExpand}
            >
                <RightOutlined
                    className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
                <div className="flex-1 min-w-0 flex items-center gap-8">
                    <Text className="text-xs truncate block">{group.name}</Text>
                    {complianceRating !== undefined && (
                        <Progress
                            percent={complianceRating}
                            strokeColor={getComplianceColorCode(complianceRating)}
                            size="small"
                            showInfo={true}
                            className="w-20"
                        />
                    )}
                    {regulatoryFramework && (
                        <RegulatoryFrameworkTag
                            standard={regulatoryFramework}
                            type="compact"
                            additionalReference={group.reference}
                        />
                    )}
                </div>
            </div>
            {isExpanded && (
                <div className="pl-8 pr-3">
                    {highComplianceRequirements.length > 0 && (
                        <div
                            className="py-1.5 cursor-pointer hover:text-blue-600"
                            onClick={() => setShowHighCompliance(!showHighCompliance)}
                        >
                            <Text className="text-xs">
                                {showHighCompliance ? 'Hide' : 'Show'} {highComplianceRequirements.length} Requirements {'>'} 0.8
                            </Text>
                        </div>
                    )}
                    {showHighCompliance && highComplianceRequirements.map(requirement => {
                        const assessment = getRequirementAssessment(requirement.id);
                        return (
                            <div
                                key={requirement.id}
                                className="py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleRequirementClick(requirement)}
                            >
                                <div className="flex items-center gap-2">
                                    {getComplianceIcon(assessment?.compliance_rating)}
                                    {assessment?.compliance_rating !== undefined && (
                                        <Text className="text-xs">
                                            {Math.round(assessment.compliance_rating)}%
                                        </Text>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Text className="text-xs font-semibold truncate block flex-shrink-0">{requirement.name}</Text>
                                        {renderFindings(assessment)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {lowComplianceRequirements.map(requirement => {
                        const assessment = getRequirementAssessment(requirement.id);
                        return (
                            <div
                                key={requirement.id}
                                className="py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleRequirementClick(requirement)}
                            >
                                <div className="flex items-center gap-2">
                                    {getComplianceIcon(assessment?.compliance_rating)}
                                    {assessment?.compliance_rating !== undefined && (
                                        <Text className="text-xs">
                                            {Math.round(assessment.compliance_rating)}%
                                        </Text>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Text className="text-xs font-semibold truncate block flex-shrink-0">{requirement.name}</Text>
                                        {renderFindings(assessment)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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