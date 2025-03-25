import React from 'react';
import { Typography, Button, List } from 'antd';
import { useCreateReportStore } from '@/stores/create-report-store';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { formatRegulatoryFramework } from '@/utils/helpers';
import type { Section, RequirementGroup, Requirement } from '@wasm';

const { Title, Text } = Typography;

interface AISuggestionsReviewProps {
    onCustomize: () => void;
}

interface SectionWithGroups {
    section: Section;
    selectedGroups: {
        group: RequirementGroup;
        selectedRequirements: Requirement[];
    }[];
}

const AISuggestionsReview: React.FC<AISuggestionsReviewProps> = ({ onCustomize }) => {
    const {
        selectedFramework,
        selectedSections,
        selectedRequirementGroups,
        selectedRequirements,
    } = useCreateReportStore();

    const { sectionsForRegulatoryFramework } = useSectionsContext();
    const { requirementGroupsBySectionId } = useRequirementGroupsContext();
    const { requirementsByGroupId } = useRequirementsContext();

    const sections = selectedSections.map(sectionId => {
        const section = sectionsForRegulatoryFramework[selectedFramework]?.find(s => s.id === sectionId);
        if (!section) return null;

        const groups = requirementGroupsBySectionId[sectionId] || [];
        const selectedGroupsForSection = groups.filter(group => selectedRequirementGroups.includes(group.id));

        if (selectedGroupsForSection.length === 0) return null;

        return {
            section,
            selectedGroups: selectedGroupsForSection.map(group => {
                const requirements = requirementsByGroupId[group.id] || [];
                const selectedRequirementsForGroup = requirements.filter(req =>
                    selectedRequirements.includes(req.id)
                );
                return { group, selectedRequirements: selectedRequirementsForGroup };
            })
        };
    }).filter((item): item is SectionWithGroups => item !== null);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
                <Title level={5} className="!mb-0">Suggested Requirements</Title>
                <Button size="small" onClick={onCustomize}>Customize Selection</Button>
            </div>

            <List
                className="flex-1 overflow-auto"
                size="small"
                bordered
                style={{ maxHeight: 'calc(100vh - 300px)' }}
                dataSource={sections}
                renderItem={({ section, selectedGroups }) => (
                    <List.Item className="py-2">
                        <div className="w-full">
                            <Text strong className="text-sm">{section.description}</Text>
                            <div className="ml-4 mt-1 space-y-1">
                                {selectedGroups.map(({ group, selectedRequirements }) => (
                                    <div key={group.id} className="text-xs text-gray-600">
                                        • {group.name} ({selectedRequirements.length} requirements)
                                    </div>
                                ))}
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default AISuggestionsReview; 