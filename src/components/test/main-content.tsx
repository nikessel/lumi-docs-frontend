import React from 'react';
import { Typography } from 'antd';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useReportsContext } from '@/contexts/reports-context';
import RequirementGroupComponent from './requirement-group';
import { RequirementGroupWithSectionId } from '@/hooks/requirement-group-hooks';
import { RequirementWithGroupId } from '@/hooks/requirement-hooks';

const { Text } = Typography;

interface MainContentProps {
    selectedSections: Set<string>;
}

const MainContent: React.FC<MainContentProps> = ({ selectedSections }) => {
    const { filteredSelectedRequirementGroups } = useRequirementGroupsContext();
    const { filteredSelectedRequirements } = useRequirementsContext();
    const { filteredSelectedReports } = useReportsContext();

    if (selectedSections.size === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <Text type="secondary" className="text-xs">Select sections to view their requirement groups</Text>
            </div>
        );
    }

    // Get all group IDs that are actually included in the report's assessments
    const reportGroupIds = new Set(
        filteredSelectedReports.flatMap(report =>
            Array.from(report.section_assessments.values()).flatMap(section =>
                Array.from(section.sub_assessments?.keys() || [])
            )
        )
    );

    // Filter groups to only show those that are in the selected sections and part of the report
    const filteredGroups = (filteredSelectedRequirementGroups as RequirementGroupWithSectionId[]).filter(group =>
        selectedSections.has(group.section_id) && reportGroupIds.has(group.id)
    );

    // Group the filtered groups by section
    const groupsBySection = filteredGroups.reduce<Record<string, RequirementGroupWithSectionId[]>>((acc, group) => {
        if (!acc[group.section_id]) {
            acc[group.section_id] = [];
        }
        acc[group.section_id].push(group);
        return acc;
    }, {});

    return (
        <div className="h-full overflow-y-auto">
            {Array.from(selectedSections).map(sectionId => {
                const groups = groupsBySection[sectionId] || [];
                return (
                    <div key={sectionId} className="mb-4">
                        {groups.map(group => (
                            <RequirementGroupComponent
                                key={group.id}
                                group={group}
                                requirements={(filteredSelectedRequirements as RequirementWithGroupId[]).filter(req => req.group_id === group.id)}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default MainContent; 