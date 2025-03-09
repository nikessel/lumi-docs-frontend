import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Typography } from 'antd';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useReportsContext } from '@/contexts/reports-context';
import RequirementGroupComponent from './requirement-group';
import GroupSorter from './group-sorter';
import { RequirementGroupWithSectionId } from '@/hooks/requirement-group-hooks';
import { RequirementWithGroupId } from '@/hooks/requirement-hooks';

const { Text } = Typography;

interface MainContentProps {
    selectedSections: Set<string>;
    selectedGroupId?: string;
}

const MainContent: React.FC<MainContentProps> = ({ selectedSections, selectedGroupId }) => {
    const { filteredSelectedRequirementGroups } = useRequirementGroupsContext();
    const { filteredSelectedRequirements } = useRequirementsContext();
    const { filteredSelectedReports } = useReportsContext();
    const [isAllExpanded, setIsAllExpanded] = useState(true);
    const [complianceSortDirection, setComplianceSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [referenceSortActive, setReferenceSortActive] = useState(true);

    const handleToggleAll = useCallback(() => {
        setIsAllExpanded(prev => !prev);
    }, []);

    const handleSortByCompliance = useCallback(() => {
        setComplianceSortDirection(prevDirection => {
            if (prevDirection === null) return 'desc';
            if (prevDirection === 'desc') return 'asc';
            return null
            // return null;
        });
        setReferenceSortActive(false);
    }, []);

    const handleSortByReference = useCallback(() => {
        setComplianceSortDirection(prev => prev ? null : prev);
        setReferenceSortActive(prev => !prev);
    }, []);

    // Memoize the report group IDs calculation
    const reportGroupIds = useMemo(() => new Set(
        filteredSelectedReports.flatMap(report =>
            Array.from(report.section_assessments.values()).flatMap(section =>
                Array.from(section.sub_assessments?.keys() || [])
            )
        )
    ), [filteredSelectedReports]);

    // Memoize the compliance ratings calculation
    const complianceRatings = useMemo(() => {
        const ratings = new Map<string, number>();

        for (const group of filteredSelectedRequirementGroups) {
            for (const report of filteredSelectedReports) {
                for (const section of report.section_assessments.values()) {
                    if (section.sub_assessments) {
                        const assessment = section.sub_assessments.get(group.id);
                        if (assessment && 'requirement_group_assessment' in assessment) {
                            ratings.set(group.id, assessment.requirement_group_assessment.compliance_rating ?? -1);
                            break;
                        }
                    }
                }
            }
        }

        return ratings;
    }, [filteredSelectedReports, filteredSelectedRequirementGroups]);

    // Memoize filtered and sorted groups
    const filteredGroups = useMemo(() => {

        let groups = (filteredSelectedRequirementGroups as RequirementGroupWithSectionId[]).filter(group =>
            selectedSections.has(group.section_id) && reportGroupIds.has(group.id)
        );

        if (selectedGroupId) {
            groups = groups.filter(group => group.id === selectedGroupId);
        }

        if (complianceSortDirection !== null) {
            groups = [...groups].sort((a, b) => {
                const aRating = complianceRatings.get(a.id) ?? -1;
                const bRating = complianceRatings.get(b.id) ?? -1;

                if (aRating === -1 && bRating === -1) return 0;
                if (aRating === -1) return 1;
                if (bRating === -1) return -1;

                return complianceSortDirection === 'asc' ? aRating - bRating : bRating - aRating;
            });
        }

        if (referenceSortActive) {
            groups = [...groups].sort((a, b) =>
                (a.reference || '').localeCompare(b.reference || '')
            );
        }

        return groups;
    }, [
        filteredSelectedRequirementGroups,
        selectedSections,
        reportGroupIds,
        selectedGroupId,
        referenceSortActive,
        complianceRatings,
        complianceSortDirection
    ]);

    // Memoize groups by section calculation
    const groupsBySection = useMemo(() => {
        if (complianceSortDirection || referenceSortActive) return null;

        return filteredGroups.reduce<Record<string, RequirementGroupWithSectionId[]>>((acc, group) => {
            if (!acc[group.section_id]) {
                acc[group.section_id] = [];
            }
            acc[group.section_id].push(group);
            return acc;
        }, {});

    }, [filteredGroups, referenceSortActive, complianceSortDirection]);

    if (selectedSections.size === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <Text type="secondary" className="text-xs">Select sections to view their requirement groups</Text>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <GroupSorter
                onToggleAll={handleToggleAll}
                onSortByCompliance={handleSortByCompliance}
                onSortByReference={handleSortByReference}
                isAllExpanded={isAllExpanded}
                complianceSortDirection={complianceSortDirection}
                referenceSortActive={referenceSortActive}
            />
            {groupsBySection ? (

                Array.from(selectedSections).map(sectionId => {
                    const groups = groupsBySection[sectionId] || [];
                    return (
                        <div key={sectionId} className="mb-4">
                            {groups.map(group => (
                                <RequirementGroupComponent
                                    key={group.id}
                                    group={group}
                                    requirements={(filteredSelectedRequirements as RequirementWithGroupId[]).filter(req => req.group_id === group.id)}
                                    defaultExpanded={isAllExpanded}
                                    complianceSortDirection={complianceSortDirection}
                                    referenceSortActive={referenceSortActive}
                                />
                            ))}
                        </div>
                    );
                })
            ) : (

                <div className="mb-4">
                    {filteredGroups.map(group => (
                        <RequirementGroupComponent
                            key={group.id}
                            group={group}
                            requirements={(filteredSelectedRequirements as RequirementWithGroupId[]).filter(req => req.group_id === group.id)}
                            defaultExpanded={isAllExpanded}
                            complianceSortDirection={complianceSortDirection}
                            referenceSortActive={referenceSortActive}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MainContent; 