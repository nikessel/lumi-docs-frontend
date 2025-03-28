import React, { useEffect } from 'react';
import { Typography, Button, List, Card, Collapse, Checkbox, Input, notification } from 'antd';
import { EditOutlined, SearchOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useCreateReportStore } from '@/stores/create-report-store';
import type { Section, RequirementGroup, Requirement, RegulatoryFramework } from '@wasm';
import AISuggestionsReviewSkeleton from './ai-suggestions-review-skeleton';

const { Title, Text } = Typography;

type DisplayMode = 'suggested' | 'all';

interface AISuggestionsReviewProps {
    onCustomize: () => void;
    requirementIds: string[];
    framework: RegulatoryFramework;
    isLoading: boolean;
    highlightChanges: boolean;
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

const AISuggestionsReview: React.FC<AISuggestionsReviewProps> = ({ onCustomize, requirementIds, framework, isLoading, highlightChanges }) => {
    const { sectionsForRegulatoryFramework, loading: sectionsLoading } = useSectionsContext();
    const { requirementGroupsBySectionId, loading: requirementGroupsLoading } = useRequirementGroupsContext();
    const { requirementsByGroupId, loading: requirementsLoading } = useRequirementsContext();
    const {
        selectedRequirements,
        setSelectedRequirements,
        setSelectedSections,
        setSelectedRequirementGroups,
        setSectionsSetForFramework,
        setGroupsSetForSections,
        setRequirementsSetForGroups
    } = useCreateReportStore();
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [displayMode, setDisplayMode] = React.useState<DisplayMode>('suggested');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [api, contextHolder] = notification.useNotification();
    const lastNotificationTimeRef = React.useRef<number>(0);
    const [hideHighlights, setHideHighlights] = React.useState(false);

    // Store previous state
    const prevStateRef = React.useRef<{
        requirementIds: string[];
        sections: SectionWithGroups[];
    }>({
        requirementIds: [],
        sections: []
    });

    // Sync state with useCreateReportStore when requirementIds changes
    React.useEffect(() => {
        if (requirementIds.length > -1) {
            // Get all sections and groups that contain the selected requirements
            const sections = sectionsForRegulatoryFramework[framework] || [];
            const selectedSections: string[] = [];
            const selectedGroups: string[] = [];
            const selectedReqs: string[] = [];

            sections.forEach(section => {
                const groups = requirementGroupsBySectionId[section.id] || [];
                let hasSelectedGroup = false;

                groups.forEach(group => {
                    const requirements = requirementsByGroupId[group.id] || [];
                    const selectedGroupReqs = requirements.filter(req => requirementIds.includes(req.id));

                    if (selectedGroupReqs.length > 0) {
                        hasSelectedGroup = true;
                        selectedGroups.push(group.id);
                        selectedReqs.push(...selectedGroupReqs.map(req => req.id));
                    }
                });

                if (hasSelectedGroup) {
                    selectedSections.push(section.id);
                }
            });

            // Update store state
            setSelectedSections(selectedSections);
            setSelectedRequirementGroups(selectedGroups);
            setSelectedRequirements(selectedReqs);
            setSectionsSetForFramework(framework);
            setGroupsSetForSections(selectedSections);
            setRequirementsSetForGroups(selectedGroups);
        }
    }, [requirementIds, framework, sectionsForRegulatoryFramework, requirementGroupsBySectionId, requirementsByGroupId]);

    useEffect(() => {
        if (selectedRequirements.length === 0 && !(isLoading || sectionsLoading || requirementGroupsLoading || requirementsLoading)) {
            api.info({
                message: 'No Requirements Selected',
                description: 'Analysis yielded 0 pre-selected requirements. Please select manually or update Key Factors',
                key: "no_requirements_selected"
            });

            setIsEditMode(true);
            setDisplayMode('all');
        }
    }, [selectedRequirements])

    const handleRequirementSelect = (requirementId: string) => {
        if (!isEditMode) return;

        if (selectedRequirements.includes(requirementId)) {
            // Remove the requirement if it already exists
            setSelectedRequirements(
                selectedRequirements.filter((reqId) => reqId !== requirementId)
            );
        } else {
            // Add the requirement if it doesn't exist
            setSelectedRequirements([...selectedRequirements, requirementId]);
        }
    };

    const sections = React.useMemo(() => {
        const sections = sectionsForRegulatoryFramework[framework] || [];
        const sectionMap = new Map<string, SectionWithGroups>();

        // When in all display mode, show all sections and their groups
        if (displayMode === 'all') {
            sections.forEach(section => {
                const groups = requirementGroupsBySectionId[section.id] || [];
                sectionMap.set(section.id, {
                    section,
                    selectedGroups: groups.map(group => ({
                        group,
                        selectedRequirements: requirementsByGroupId[group.id] || [] // Show all requirements
                    }))
                });
            });
        } else {
            // Show only suggested requirements
            sections.forEach(section => {
                const groups = requirementGroupsBySectionId[section.id] || [];
                const selectedGroups = groups.filter(group => {
                    const requirements = requirementsByGroupId[group.id] || [];
                    return requirements.some(req => selectedRequirements.includes(req.id));
                });

                if (selectedGroups.length > 0) {
                    sectionMap.set(section.id, {
                        section,
                        selectedGroups: selectedGroups.map(group => ({
                            group,
                            selectedRequirements: (requirementsByGroupId[group.id] || [])
                                .filter(req => selectedRequirements.includes(req.id))
                        }))
                    });
                }
            });
        }

        return Array.from(sectionMap.values());
    }, [sectionsForRegulatoryFramework, framework, requirementGroupsBySectionId, requirementsByGroupId, selectedRequirements, displayMode]);

    // Get all sections including removed ones
    const allSections = React.useMemo(() => {
        // Only calculate diffs when in suggested mode
        if (displayMode === 'all') {
            return sections;
        }

        const currentSectionIds = new Set(sections.map(s => s.section.id));
        const prevSectionIds = new Set(prevStateRef.current.sections.map(s => s.section.id));

        // Create a map of current sections for easy lookup
        const currentSectionsMap = new Map(sections.map(s => [s.section.id, s]));

        // Process removed sections and their groups
        const removedSections = prevStateRef.current.sections
            .filter(s => !currentSectionIds.has(s.section.id))
            .map(s => ({
                section: s.section,
                selectedGroups: s.selectedGroups.map(group => ({
                    group: group.group,
                    selectedRequirements: [] // Empty array to indicate removal
                }))
            }));

        // Add removed groups to existing sections
        const sectionsWithRemovedGroups = sections.map(section => {
            const prevSection = prevStateRef.current.sections.find(s => s.section.id === section.section.id);
            if (!prevSection) return section;

            const currentGroupIds = new Set(section.selectedGroups.map(g => g.group.id));
            const removedGroups = prevSection.selectedGroups
                .filter(g => !currentGroupIds.has(g.group.id))
                .map(g => ({
                    group: g.group,
                    selectedRequirements: [] // Empty array to indicate removal
                }));

            return {
                ...section,
                selectedGroups: [...section.selectedGroups, ...removedGroups]
            };
        });

        return [...sectionsWithRemovedGroups, ...removedSections];
    }, [sections, displayMode]);

    // Calculate diffs for sections and groups
    const getDiffInfo = React.useCallback((sectionId: string, groupId: string, currentRequirements: Requirement[]): DiffInfo => {
        // Only calculate diffs when in suggested mode
        if (displayMode === 'all') {
            return {
                isNew: false,
                isRemoved: false,
                requirementDiff: 0
            };
        }

        const prevSection = prevStateRef.current.sections.find(s => s.section.id === sectionId);
        const prevGroup = prevSection?.selectedGroups.find(g => g.group.id === groupId);
        const prevRequirements = prevGroup?.selectedRequirements || [];

        return {
            isNew: !prevGroup,
            isRemoved: Boolean(prevGroup && !currentRequirements.length),
            requirementDiff: currentRequirements.length - prevRequirements.length
        };
    }, [displayMode]);

    // Calculate total changes
    const totalChanges = React.useMemo(() => {
        // Only calculate changes when in suggested mode
        if (displayMode === 'all') {
            return { added: 0, removed: 0 };
        }

        let added = 0;
        let removed = 0;

        allSections.forEach(({ section, selectedGroups }) => {
            selectedGroups.forEach(({ group, selectedRequirements: groupRequirements }) => {
                const diffInfo = getDiffInfo(section.id, group.id, groupRequirements);
                if (diffInfo.requirementDiff > 0) {
                    added += diffInfo.requirementDiff;
                } else if (diffInfo.requirementDiff < 0) {
                    removed += Math.abs(diffInfo.requirementDiff);
                }
            });
        });

        return { added, removed };
    }, [allSections, getDiffInfo, displayMode]);

    // Update previous state after rendering
    React.useEffect(() => {
        if (displayMode === 'suggested') {
            prevStateRef.current = {
                requirementIds: selectedRequirements,
                sections
            };
        }
    }, [selectedRequirements, sections, displayMode]);

    // Handle edit mode toggle
    const handleEditModeToggle = () => {
        if (isEditMode) {
            handleHideHighlightsToggle()
            // When saving (exiting edit mode)
            setSearchQuery(''); // Clear search when saving
            setIsEditMode(false);
            setDisplayMode('suggested');

            // Update the store with current selections
            const sections = sectionsForRegulatoryFramework[framework] || [];
            const selectedSections: string[] = [];
            const selectedGroups: string[] = [];
            const selectedReqs: string[] = [];

            sections.forEach(section => {
                const groups = requirementGroupsBySectionId[section.id] || [];
                let hasSelectedGroup = false;

                groups.forEach(group => {
                    const requirements = requirementsByGroupId[group.id] || [];
                    const selectedGroupReqs = requirements.filter(req => selectedRequirements.includes(req.id));

                    if (selectedGroupReqs.length > 0) {
                        hasSelectedGroup = true;
                        selectedGroups.push(group.id);
                        selectedReqs.push(...selectedGroupReqs.map(req => req.id));
                    }
                });

                if (hasSelectedGroup) {
                    selectedSections.push(section.id);
                }
            });

            // Update store state
            setSelectedSections(selectedSections);
            setSelectedRequirementGroups(selectedGroups);
            setSelectedRequirements(selectedReqs);
            setSectionsSetForFramework(framework);
            setGroupsSetForSections(selectedSections);
            setRequirementsSetForGroups(selectedGroups);
        } else {
            // When entering edit mode
            setIsEditMode(true);
            setDisplayMode('all');
        }
    };

    // Reset edit mode and display mode when new changes are received
    React.useEffect(() => {
        setIsEditMode(false);
        setDisplayMode('suggested');
    }, [requirementIds]);

    // Reset hideHighlights when new changes are received
    React.useEffect(() => {
        setHideHighlights(false);
    }, [requirementIds]);

    // Handle hide highlights toggle
    const handleHideHighlightsToggle = () => {
        // setHideHighlights(!hideHighlights);
        // Update selectedRequirements with their current values to reset change tracking
        setSelectedRequirements([...selectedRequirements]);
    };

    // Add handlers for selecting all children
    const handleSelectAllSection = (sectionId: string, checked: boolean) => {
        const section = allSections.find(s => s.section.id === sectionId);
        if (!section) return;

        const allRequirementIds = section.selectedGroups.flatMap(group =>
            group.selectedRequirements.map(req => req.id)
        );

        if (checked) {
            // Add all requirements that aren't already selected
            setSelectedRequirements([...new Set([...selectedRequirements, ...allRequirementIds])]);
        } else {
            // Remove all requirements from this section
            setSelectedRequirements(selectedRequirements.filter(id => !allRequirementIds.includes(id)));
        }
    };

    const handleSelectAllGroup = (sectionId: string, groupId: string, checked: boolean) => {
        const section = allSections.find(s => s.section.id === sectionId);
        if (!section) return;

        const group = section.selectedGroups.find(g => g.group.id === groupId);
        if (!group) return;

        const groupRequirementIds = group.selectedRequirements.map(req => req.id);

        if (checked) {
            // Add all requirements from this group that aren't already selected
            setSelectedRequirements([...new Set([...selectedRequirements, ...groupRequirementIds])]);
        } else {
            // Remove all requirements from this group
            setSelectedRequirements(selectedRequirements.filter(id => !groupRequirementIds.includes(id)));
        }
    };

    // Filter sections based on search query
    const filteredSections = React.useMemo(() => {
        if (!searchQuery) return allSections;

        const query = searchQuery.toLowerCase();
        return allSections.filter(({ section, selectedGroups }) => {
            // Check if section matches
            const sectionMatches = section.description.toLowerCase().includes(query);
            if (sectionMatches) return true;

            // Filter groups that match
            const matchingGroups = selectedGroups.filter(({ group, selectedRequirements }) => {
                // Check if group matches
                const groupMatches = group.name.toLowerCase().includes(query);
                if (groupMatches) return true;

                // Filter requirements that match
                const matchingRequirements = selectedRequirements.filter(req =>
                    req.name.toLowerCase().includes(query)
                );

                // Only return true if there are matching requirements
                return matchingRequirements.length > 0;
            });

            // Only return true if there are matching groups
            return matchingGroups.length > 0;
        }).map(({ section, selectedGroups }) => {
            // If section matches, show all groups and requirements
            if (section.description.toLowerCase().includes(query)) {
                return { section, selectedGroups };
            }

            // Otherwise, filter groups and requirements
            return {
                section,
                selectedGroups: selectedGroups.filter(({ group, selectedRequirements }) => {
                    // If group matches, show all requirements
                    if (group.name.toLowerCase().includes(query)) {
                        return true;
                    }

                    // Otherwise, only show if there are matching requirements
                    return selectedRequirements.some(req =>
                        req.name.toLowerCase().includes(query)
                    );
                }).map(({ group, selectedRequirements }) => ({
                    group,
                    selectedRequirements: group.name.toLowerCase().includes(query)
                        ? selectedRequirements // Show all requirements if group matches
                        : selectedRequirements.filter(req => // Only show matching requirements
                            req.name.toLowerCase().includes(query)
                        )
                }))
            };
        });
    }, [allSections, searchQuery]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            // Get all requirement IDs from all sections and groups
            const allRequirementIds = allSections.flatMap(({ selectedGroups }) =>
                selectedGroups.flatMap(({ selectedRequirements }) =>
                    selectedRequirements.map(req => req.id)
                )
            );
            // Add all requirements that aren't already selected
            setSelectedRequirements([...new Set([...selectedRequirements, ...allRequirementIds])]);
        } else {
            // Clear all selections
            setSelectedRequirements([]);
        }
    };

    // Calculate if all requirements are selected
    const isAllSelected = React.useMemo(() => {
        const allRequirementIds = allSections.flatMap(({ selectedGroups }) =>
            selectedGroups.flatMap(({ selectedRequirements }) =>
                selectedRequirements.map(req => req.id)
            )
        );
        return allRequirementIds.length > 0 && allRequirementIds.every(id => selectedRequirements.includes(id));
    }, [allSections, selectedRequirements]);

    // Calculate if some requirements are selected
    const isIndeterminate = React.useMemo(() => {
        const allRequirementIds = allSections.flatMap(({ selectedGroups }) =>
            selectedGroups.flatMap(({ selectedRequirements }) =>
                selectedRequirements.map(req => req.id)
            )
        );
        return selectedRequirements.length > 0 && selectedRequirements.length < allRequirementIds.length;
    }, [allSections, selectedRequirements]);

    if (isLoading) {
        return <AISuggestionsReviewSkeleton />;
    }

    return (
        <Card
            title={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        Requirement Selection
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                            {selectedRequirements.length} Selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditMode && displayMode === 'suggested' && highlightChanges && (totalChanges.added > 0 || totalChanges.removed > 0) && prevStateRef.current.requirementIds.length > 0 && !hideHighlights && (
                            <>
                                {totalChanges.added > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                                        Added {totalChanges.added}
                                    </span>
                                )}
                                {totalChanges.removed > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                                        Removed {totalChanges.removed}
                                    </span>
                                )}
                            </>
                        )}
                        {totalChanges.added + totalChanges.removed > 0 && <Button
                            type={'text'}
                            icon={<CheckOutlined />}
                            onClick={handleHideHighlightsToggle}
                            className={`${hideHighlights ? 'text-gray-500' : 'text-gray-500'}`}
                            size="small"
                        />}
                        <Button
                            type={isEditMode ? 'default' : 'text'}
                            icon={isEditMode ? <SaveOutlined /> : <EditOutlined />}
                            onClick={handleEditModeToggle}
                            className={`${isEditMode ? 'text-blue-500' : 'text-gray-500'}`}
                            size="small"
                        >
                            {isEditMode ? 'Save' : ''}
                        </Button>
                    </div>
                </div>
            }
        >{contextHolder}
            <div className="flex flex-col h-full">
                {isEditMode && (
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="Search requirements..."
                                prefix={<SearchOutlined />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64"
                            />
                            <Checkbox
                                checked={isAllSelected}
                                indeterminate={isIndeterminate}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            >
                                Select All
                            </Checkbox>
                        </div>
                    </div>
                )}
                <List
                    className="flex-1 overflow-auto"
                    size="small"
                    dataSource={filteredSections}
                    renderItem={({ section, selectedGroups }) => {
                        const sectionDiff = getDiffInfo(section.id, selectedGroups[0]?.group.id, selectedGroups[0]?.selectedRequirements || []);
                        const isRemoved = !selectedGroups.some(g => g.selectedRequirements.length > 0);
                        const allSectionRequirements = selectedGroups.flatMap(group => group.selectedRequirements);
                        const isAllSelected = allSectionRequirements.length > 0 &&
                            allSectionRequirements.every(req => selectedRequirements.includes(req.id));

                        return (
                            <List.Item
                                className={`${!isEditMode && displayMode === 'suggested' && highlightChanges && !hideHighlights && sectionDiff.isNew && prevStateRef.current.requirementIds.length > 0 ? 'bg-green-50' :
                                    !isEditMode && displayMode === 'suggested' && highlightChanges && !hideHighlights && isRemoved && prevStateRef.current.requirementIds.length > 0 ? 'bg-red-50' : ''
                                    }`}
                            >
                                <div className="w-full">
                                    <div className="flex items-center gap-2">
                                        {isEditMode && (
                                            <Checkbox
                                                checked={isAllSelected}
                                                indeterminate={selectedRequirements.some(id =>
                                                    allSectionRequirements.some(req => req.id === id)
                                                ) && !isAllSelected}
                                                onChange={(e) => handleSelectAllSection(section.id, e.target.checked)}
                                            />
                                        )}
                                        <Text
                                            strong
                                            className={`text-sm ${!isEditMode && displayMode === 'suggested' && highlightChanges && !hideHighlights && sectionDiff.isNew && prevStateRef.current.requirementIds.length > 0 ? 'text-green-600' :
                                                !isEditMode && displayMode === 'suggested' && highlightChanges && !hideHighlights && isRemoved && prevStateRef.current.requirementIds.length > 0 ? 'text-red-600' : ''
                                                }`}
                                        >
                                            {section.description}
                                            {!isEditMode && displayMode === 'suggested' && highlightChanges && !hideHighlights && sectionDiff.requirementDiff !== 0 && prevStateRef.current.requirementIds.length > 0 && (
                                                <span className={`ml-2 ${sectionDiff.requirementDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {sectionDiff.requirementDiff > 0 ? '+' : ''}{sectionDiff.requirementDiff}
                                                </span>
                                            )}
                                        </Text>
                                    </div>
                                    <Collapse
                                        className="mt-2 [&_.ant-collapse-expand-icon]:scale-75"
                                        size="small"
                                        ghost
                                    >
                                        {selectedGroups.map(({ group, selectedRequirements: groupRequirements }) => {
                                            const diffInfo = getDiffInfo(section.id, group.id, groupRequirements);
                                            const isAllGroupSelected = groupRequirements.length > 0 &&
                                                groupRequirements.every(req => selectedRequirements.includes(req.id));

                                            return (
                                                <Collapse.Panel
                                                    key={group.id}
                                                    header={
                                                        <div className="flex items-center gap-2">
                                                            {isEditMode && (
                                                                <Checkbox
                                                                    checked={isAllGroupSelected}
                                                                    indeterminate={selectedRequirements.some(id =>
                                                                        groupRequirements.some(req => req.id === id)
                                                                    ) && !isAllGroupSelected}
                                                                    onChange={(e) => handleSelectAllGroup(section.id, group.id, e.target.checked)}
                                                                />
                                                            )}
                                                            <div
                                                                className={`text-xs p-1 rounded ${!isEditMode && displayMode === 'suggested' && highlightChanges && !hideHighlights && diffInfo.isNew && prevStateRef.current.requirementIds.length > 0 ? 'bg-green-50 text-green-600' :
                                                                    !isEditMode && displayMode === 'suggested' && highlightChanges && !hideHighlights && diffInfo.isRemoved && prevStateRef.current.requirementIds.length > 0 ? 'bg-red-50 text-red-600' :
                                                                        !isEditMode && displayMode === 'suggested' && highlightChanges && !hideHighlights && diffInfo.requirementDiff !== 0 && prevStateRef.current.requirementIds.length > 0 ?
                                                                            (diffInfo.requirementDiff > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600') :
                                                                            'text-gray-600'
                                                                    }`}
                                                            >
                                                                {group.name} ({groupRequirements.length} requirements)
                                                                {!isEditMode && displayMode === 'suggested' && highlightChanges && !hideHighlights && diffInfo.requirementDiff !== 0 && prevStateRef.current.requirementIds.length > 0 && (
                                                                    <span className={`ml-1 ${diffInfo.requirementDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {diffInfo.requirementDiff > 0 ? '+' : ''}{diffInfo.requirementDiff}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <div className="ml-4 space-y-1">
                                                        {(() => {
                                                            // Get all requirements for this group
                                                            const allGroupRequirements = requirementsByGroupId[group.id] || [];

                                                            // Get requirements that were previously selected but are now removed
                                                            const removedRequirements = allGroupRequirements.filter(req =>
                                                                prevStateRef.current.requirementIds.includes(req.id) &&
                                                                !selectedRequirements.includes(req.id)
                                                            );

                                                            // Combine current and removed requirements
                                                            const displayRequirements = [...groupRequirements, ...removedRequirements];

                                                            return displayRequirements.map(req => {
                                                                const isNew = !isEditMode && displayMode === 'suggested' && highlightChanges &&
                                                                    !prevStateRef.current.requirementIds.includes(req.id) &&
                                                                    prevStateRef.current.requirementIds.length > 0;
                                                                const isRemoved = !isEditMode && displayMode === 'suggested' && highlightChanges &&
                                                                    prevStateRef.current.requirementIds.includes(req.id) &&
                                                                    !selectedRequirements.includes(req.id) &&
                                                                    prevStateRef.current.requirementIds.length > 0;

                                                                return (
                                                                    <div
                                                                        key={req.id}
                                                                        className={`text-xs text-gray-600 flex items-start gap-2 items-center 
                                                                            ${isEditMode && !selectedRequirements.includes(req.id) ? 'opacity-50' : ''}
                                                                            ${isNew && !hideHighlights ? 'text-green-600' : ''}
                                                                            ${isRemoved && !hideHighlights ? 'text-red-600' : ''}
                                                                        `}
                                                                    >
                                                                        {isEditMode ? (
                                                                            <Checkbox
                                                                                checked={selectedRequirements.includes(req.id)}
                                                                                onChange={() => handleRequirementSelect(req.id)}
                                                                                className=""
                                                                            />
                                                                        ) : (
                                                                            <span className={`${isNew && !hideHighlights ? 'text-green-600' : isRemoved && !hideHighlights ? 'text-red-600' : 'text-gray-400'}`}>•</span>
                                                                        )}
                                                                        <span>{req.name}</span>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                </Collapse.Panel>
                                            );
                                        })}
                                    </Collapse>
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