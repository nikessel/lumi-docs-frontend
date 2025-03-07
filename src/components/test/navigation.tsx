import React, { useState } from 'react';
import { Typography, Tooltip } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import RegulatoryFrameworkTag from '@/components/regulatory-framework-tag';
import { getComplianceColorCode } from '@/utils/formating';
import { formatRegulatoryFramework } from '@/utils/helpers';
import { Report } from '@wasm';
import { useStyle, getTextSizeClass, getPaddingClass, getIndentClass } from '@/contexts/style-context';

const { Text } = Typography;

interface NavigationProps {
    selectedSections: Set<string>;
    onSectionSelect: (sections: Set<string>, selectedGroupId?: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ selectedSections, onSectionSelect }) => {
    const { filteredSelectedReports } = useReportsContext();
    const { filteredSelectedReportsSections } = useSectionsContext();
    const { requirementGroupsBySectionId } = useRequirementGroupsContext();
    const { fontSize } = useStyle();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
    const [lastSelectedSection, setLastSelectedSection] = useState<string | undefined>();
    const [lastSelectedReport, setLastSelectedReport] = useState<string | undefined>();

    // Get all group IDs that are actually included in the report's assessments
    const reportGroupIds = new Set(
        filteredSelectedReports.flatMap(report =>
            Array.from(report.section_assessments.values()).flatMap(section =>
                Array.from(section.sub_assessments?.keys() || [])
            )
        )
    );

    const toggleExpand = (sectionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(expandedSections);
        if (next.has(sectionId)) {
            next.delete(sectionId);
        } else {
            next.add(sectionId);
        }
        setExpandedSections(next);
    };

    const handleReportClick = (report: Report, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedGroupId(undefined);

        let newSelectedSections = new Set<string>();
        const reportSectionIds = Array.from(report.section_assessments.keys())
            .filter(sectionId => {
                const groups = requirementGroupsBySectionId[sectionId] || [];
                return groups.some(group => reportGroupIds.has(group.id));
            });

        // Handle multi-select with Command/Control key
        if (e.metaKey || e.ctrlKey) {
            // If all sections of this report are already selected, deselect them
            const allSectionsSelected = reportSectionIds.every(id => selectedSections.has(id));
            if (allSectionsSelected) {
                newSelectedSections = new Set(
                    Array.from(selectedSections).filter(id => !reportSectionIds.includes(id))
                );
            } else {
                // Add all sections from this report to existing selection
                newSelectedSections = new Set([
                    ...Array.from(selectedSections),
                    ...reportSectionIds
                ]);
            }
        }
        // Handle range select with Shift key
        else if (e.shiftKey && lastSelectedReport) {
            const allReports = filteredSelectedReports;
            const startIdx = allReports.findIndex(r => r.id === lastSelectedReport);
            const endIdx = allReports.findIndex(r => r.id === report.id);

            if (startIdx !== -1 && endIdx !== -1) {
                const start = Math.min(startIdx, endIdx);
                const end = Math.max(startIdx, endIdx);

                const selectedReports = allReports.slice(start, end + 1);
                const allSectionIds = selectedReports.flatMap(r =>
                    Array.from(r.section_assessments.keys()).filter(sectionId => {
                        const groups = requirementGroupsBySectionId[sectionId] || [];
                        return groups.some(group => reportGroupIds.has(group.id));
                    })
                );

                newSelectedSections = new Set([
                    ...Array.from(selectedSections),
                    ...allSectionIds
                ]);
            }
        }
        // Regular click
        else {
            newSelectedSections = new Set(reportSectionIds);
        }

        setLastSelectedReport(report.id);
        onSectionSelect(newSelectedSections);
    };

    const handleSectionClick = (sectionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedGroupId(undefined);

        let newSelectedSections = new Set<string>();

        // Handle multi-select with Command/Control key
        if (e.metaKey || e.ctrlKey) {
            newSelectedSections = new Set(selectedSections);
            if (newSelectedSections.has(sectionId)) {
                newSelectedSections.delete(sectionId);
            } else {
                newSelectedSections.add(sectionId);
            }
        }
        // Handle range select with Shift key
        else if (e.shiftKey && lastSelectedSection) {
            const allSectionIds = Array.from(filteredSelectedReports.flatMap(report =>
                Array.from(report.section_assessments.keys())
            ));

            const startIdx = allSectionIds.indexOf(lastSelectedSection);
            const endIdx = allSectionIds.indexOf(sectionId);

            if (startIdx !== -1 && endIdx !== -1) {
                const start = Math.min(startIdx, endIdx);
                const end = Math.max(startIdx, endIdx);

                newSelectedSections = new Set([
                    ...Array.from(selectedSections),
                    ...allSectionIds.slice(start, end + 1)
                ]);
            }
        }
        // Regular click
        else {
            newSelectedSections = new Set([sectionId]);
        }

        setLastSelectedSection(sectionId);
        onSectionSelect(newSelectedSections);
    };

    const handleGroupClick = (sectionId: string, groupId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedGroupId(groupId);
        onSectionSelect(new Set([sectionId]), groupId);
    };

    return (
        <div className="h-full flex flex-col select-none">
            <div className="flex-1 overflow-y-auto">
                <div className={getPaddingClass(fontSize)}>
                    {filteredSelectedReports.map(report => {
                        const reportSectionIds = Array.from(report.section_assessments.keys())
                            .filter(sectionId => {
                                const groups = requirementGroupsBySectionId[sectionId] || [];
                                return groups.some(group => reportGroupIds.has(group.id));
                            });
                        const isReportSelected = reportSectionIds.length > 0 &&
                            reportSectionIds.every(id => selectedSections.has(id));

                        return (
                            <div key={report.id} className="mb-2">
                                {/* Report Header */}
                                <div
                                    className={`${getPaddingClass(fontSize)} flex items-center gap-1 cursor-pointer hover:bg-blue-50 ${isReportSelected ? 'bg-blue-50' : ''}`}
                                    onClick={(e) => handleReportClick(report, e)}
                                >
                                    <Text strong className={`${getTextSizeClass(fontSize)} truncate flex-1 ${isReportSelected ? 'text-blue-500' : ''}`}>
                                        {report.title}
                                    </Text>
                                    <RegulatoryFrameworkTag standard={report.regulatory_framework} />
                                </div>

                                {/* Sections */}
                                <div className="mt-1">
                                    {Array.from(report.section_assessments.keys())
                                        .filter(sectionId => {
                                            const groups = requirementGroupsBySectionId[sectionId] || [];
                                            return groups.some(group => reportGroupIds.has(group.id));
                                        })
                                        .map(sectionId => {
                                            const section = filteredSelectedReportsSections.find(s => s.id === sectionId);
                                            if (!section) return null;

                                            const groups = (requirementGroupsBySectionId[sectionId] || [])
                                                .filter(group => reportGroupIds.has(group.id));
                                            const reference = groups[0]?.reference;
                                            const sectionAssessment = report.section_assessments.get(sectionId);
                                            const complianceRating = sectionAssessment?.compliance_rating;
                                            const isExpanded = expandedSections.has(sectionId);
                                            const isSelected = selectedSections.has(sectionId);

                                            return (
                                                <div key={sectionId}>
                                                    <div
                                                        className={`${getPaddingClass(fontSize)} hover:bg-blue-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                                                        onClick={(e) => handleSectionClick(sectionId, e)}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <RightOutlined
                                                                className={`${getTextSizeClass(fontSize)} transition-transform ${isExpanded ? 'rotate-90' : ''} ${isSelected ? 'text-blue-500' : ''}`}
                                                                onClick={(e) => toggleExpand(sectionId, e)}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <Text className={`${getTextSizeClass(fontSize)} truncate block ${isSelected ? 'text-blue-500 font-medium' : ''}`}>
                                                                    {section.name}
                                                                </Text>
                                                            </div>
                                                        </div>
                                                        <div className={`${getIndentClass(fontSize)} flex items-center gap-2 min-w-0`}>
                                                            {complianceRating !== undefined && (
                                                                <Tooltip title={`Compliance Rating: ${complianceRating}%`}>
                                                                    <Text
                                                                        className={`${getTextSizeClass(fontSize)} whitespace-nowrap`}
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

                                                    {/* Requirement Groups */}
                                                    {isExpanded && groups.length > 0 && (
                                                        <div className={getIndentClass(fontSize)}>
                                                            {groups.map(group => {
                                                                const isGroupSelected = selectedGroupId === group.id;
                                                                return (
                                                                    <div
                                                                        key={group.id}
                                                                        className={`${getPaddingClass(fontSize)} hover:bg-blue-50 cursor-pointer ${isGroupSelected ? 'bg-blue-50' : ''}`}
                                                                        onClick={(e) => handleGroupClick(sectionId, group.id, e)}
                                                                    >
                                                                        <Text className={`${getTextSizeClass(fontSize)} truncate block ${isGroupSelected ? 'text-blue-500 font-medium' : 'text-gray-600'}`}>
                                                                            {group.name}
                                                                        </Text>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Navigation;