import React from 'react';
import { Typography, Checkbox, Tooltip } from 'antd';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import RegulatoryFrameworkTag from '@/components/regulatory-framework-tag';
import { getComplianceColorCode } from '@/utils/formating';
import { formatRegulatoryFramework } from '@/utils/helpers';

const { Text } = Typography;

interface NavigationProps {
    selectedSections: Set<string>;
    onSectionSelect: (sections: Set<string>) => void;
}

const Navigation: React.FC<NavigationProps> = ({ selectedSections, onSectionSelect }) => {
    const { filteredSelectedReports } = useReportsContext();
    const { filteredSelectedReportsSections } = useSectionsContext();
    const { requirementGroupsBySectionId } = useRequirementGroupsContext();

    const toggleSection = (sectionId: string) => {
        const next = new Set(selectedSections);
        if (next.has(sectionId)) {
            next.delete(sectionId);
        } else {
            next.add(sectionId);
        }
        onSectionSelect(next);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
                <div className="py-2">
                    {filteredSelectedReports.map(report => (
                        <div key={report.id} className="mb-2">
                            {/* Report Header */}
                            <div className="px-3 py-1.5 bg-gray-50 flex items-center gap-1">
                                <Text strong className="text-xs truncate flex-1">{report.title}</Text>
                                <RegulatoryFrameworkTag standard={report.regulatory_framework} />
                            </div>

                            {/* Sections */}
                            <div className="mt-1">
                                {Array.from(report.section_assessments.keys()).map(sectionId => {
                                    const section = filteredSelectedReportsSections.find(s => s.id === sectionId);
                                    if (!section) return null;

                                    const groups = requirementGroupsBySectionId[sectionId] || [];
                                    const reference = groups[0]?.reference;
                                    const sectionAssessment = report.section_assessments.get(sectionId);
                                    const complianceRating = sectionAssessment?.compliance_rating;

                                    return (
                                        <div
                                            key={sectionId}
                                            className="px-3 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => toggleSection(sectionId)}
                                        >
                                            <div className="flex items-center gap-1">
                                                <Checkbox
                                                    checked={selectedSections.has(sectionId)}
                                                    className="mr-1 shrink-0"
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={() => toggleSection(sectionId)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <Text className="text-xs truncate block">{section.name}</Text>
                                                </div>
                                            </div>
                                            <div className="ml-6 flex items-center gap-2 min-w-0">
                                                {complianceRating !== undefined && (
                                                    <Tooltip title={`Compliance Rating: ${complianceRating}%`}>
                                                        <Text
                                                            className="text-xs whitespace-nowrap"
                                                            style={{ color: getComplianceColorCode(complianceRating) }}
                                                        >
                                                            {Math.round(complianceRating)}%
                                                        </Text>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title={`Reference from ${formatRegulatoryFramework(section.regulatory_framework)}`}>
                                                    <div className="min-w-0 flex-1">
                                                        <RegulatoryFrameworkTag
                                                            standard={section.regulatory_framework}
                                                            additionalReference={reference}
                                                            type="compact"
                                                        />
                                                    </div>
                                                </Tooltip>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Navigation;