import React from 'react';
import { Typography, Button, List, Card } from 'antd';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import type { Section, RequirementGroup, Requirement, RegulatoryFramework } from '@wasm';

const { Title, Text } = Typography;

interface AISuggestionsReviewProps {
    onCustomize: () => void;
    requirementIds: string[];
    framework: RegulatoryFramework;
    isLoading: boolean;
}

interface SectionWithGroups {
    section: Section;
    selectedGroups: {
        group: RequirementGroup;
        selectedRequirements: Requirement[];
    }[];
}

interface DiffInfo {
    isNew: boolean;
    isRemoved: boolean;
    requirementDiff: number;
}

const AISuggestionsReview: React.FC<AISuggestionsReviewProps> = ({ onCustomize, requirementIds, framework, isLoading }) => {
    const { sectionsForRegulatoryFramework } = useSectionsContext();
    const { requirementGroupsBySectionId } = useRequirementGroupsContext();
    const { requirementsByGroupId } = useRequirementsContext();

    // Store previous requirementIds
    const prevRequirementIdsRef = React.useRef<string[]>([]);

    const sections = React.useMemo(() => {
        const sections = sectionsForRegulatoryFramework[framework] || [];
        const sectionMap = new Map<string, SectionWithGroups>();

        // First, find all sections that contain any of the selected requirements
        sections.forEach(section => {
            const groups = requirementGroupsBySectionId[section.id] || [];
            const selectedGroups = groups.filter(group => {
                const requirements = requirementsByGroupId[group.id] || [];
                return requirements.some(req => requirementIds.includes(req.id));
            });

            if (selectedGroups.length > 0) {
                sectionMap.set(section.id, {
                    section,
                    selectedGroups: selectedGroups.map(group => ({
                        group,
                        selectedRequirements: (requirementsByGroupId[group.id] || [])
                            .filter(req => requirementIds.includes(req.id))
                    }))
                });
            }
        });

        return Array.from(sectionMap.values());
    }, [sectionsForRegulatoryFramework, framework, requirementGroupsBySectionId, requirementsByGroupId, requirementIds]);

    // Calculate diffs for sections and groups
    const getDiffInfo = React.useCallback((sectionId: string, groupId: string, currentRequirements: Requirement[]): DiffInfo => {
        const prevSection = prevRequirementIdsRef.current.length > 0 ?
            sectionsForRegulatoryFramework[framework]?.find(s => s.id === sectionId) : null;

        const prevGroup = prevSection ?
            (requirementGroupsBySectionId[prevSection.id] || []).find(g => g.id === groupId) : null;

        const prevRequirements = prevGroup ?
            (requirementsByGroupId[prevGroup.id] || []).filter(req => prevRequirementIdsRef.current.includes(req.id)) : [];

        return {
            isNew: !prevGroup,
            isRemoved: false, // We don't show removed groups in the current view
            requirementDiff: currentRequirements.length - prevRequirements.length
        };
    }, [sectionsForRegulatoryFramework, framework, requirementGroupsBySectionId, requirementsByGroupId]);

    // Update previous requirementIds after rendering
    React.useEffect(() => {
        prevRequirementIdsRef.current = requirementIds;
    }, [requirementIds]);

    return (
        <Card
            title={
                <div className="flex items-center gap-2">
                    Suggested Requirement Selection
                </div>
            }
            className="w-full [&_.ant-card-head]:relative [&_.ant-card-head]:border-b-0"
            headStyle={{
                borderBottom: 'none',
                position: 'relative'
            }}
            extra={
                <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 w-full ${!isLoading ? 'animate-[loading-border_2s_ease-in-out_infinite]' : ''}`}
                />
            }
        >
            <div className="flex flex-col h-full">
                <List
                    className="flex-1 overflow-auto"
                    size="small"
                    dataSource={sections}
                    renderItem={({ section, selectedGroups }) => {
                        const sectionDiff = getDiffInfo(section.id, selectedGroups[0]?.group.id, selectedGroups[0]?.selectedRequirements || []);

                        return (
                            <List.Item>
                                <div className="w-full">
                                    <Text
                                        strong
                                        className={`text-sm ${sectionDiff.isNew ? 'text-green-600' :
                                            sectionDiff.isRemoved ? 'text-red-600' : ''
                                            }`}
                                    >
                                        {section.description}
                                        {sectionDiff.requirementDiff !== 0 && (
                                            <span className={`ml-2 ${sectionDiff.requirementDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {sectionDiff.requirementDiff > 0 ? '+' : ''}{sectionDiff.requirementDiff}
                                            </span>
                                        )}
                                    </Text>
                                    <div className="ml-2 mt-1 space-y-1">
                                        {selectedGroups.map(({ group, selectedRequirements }) => {
                                            const diffInfo = getDiffInfo(section.id, group.id, selectedRequirements);
                                            return (
                                                <div
                                                    key={group.id}
                                                    className={`text-xs ${diffInfo.isNew ? 'text-green-600' :
                                                        diffInfo.isRemoved ? 'text-red-600' :
                                                            'text-gray-600'
                                                        }`}
                                                >
                                                    • {group.name} ({selectedRequirements.length} requirements)
                                                    {diffInfo.requirementDiff !== 0 && (
                                                        <span className={`ml-1 ${diffInfo.requirementDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {diffInfo.requirementDiff > 0 ? '+' : ''}{diffInfo.requirementDiff}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </div>
        </Card>
    );
};

export default AISuggestionsReview; 