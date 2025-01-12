'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Table, Breadcrumb, Skeleton, Button } from 'antd';
import { useRegulatoryFrameworks } from '@/hooks/regulatory-frameworks-hooks';
import { useSectionsForRegulatoryFrameworks } from '@/hooks/section-hooks';
import { useRequirementGroupsForSectionIds } from '@/hooks/requirement-group-hooks';
import { useRequirementsForGroupIds } from '@/hooks/requirement-hooks';
import { Section, RequirementGroup, Requirement } from '@wasm';
import RegulatoryFrameworkTag from '@/components/regulatory-framework-tag';

const RegulatoryFrameworksTable: React.FC = () => {
    const { frameworks, loading: frameworksLoading } = useRegulatoryFrameworks();
    const frameworkIds = useMemo(() => frameworks.map(f => f.id), [frameworks]);
    const { sections, loading: sectionsLoading } = useSectionsForRegulatoryFrameworks(frameworkIds);
    const sectionIds = useMemo(() => sections.map(section => section.id), [sections]);
    const { requirementGroups, loading: groupsLoading } = useRequirementGroupsForSectionIds(sectionIds);
    const groupIds = useMemo(() => requirementGroups.map(group => group.id), [requirementGroups]);
    const { requirements, loading: requirementsLoading } = useRequirementsForGroupIds(groupIds);

    const [isLoading, setIsLoading] = useState(true);
    const [breadcrumb, setBreadcrumb] = useState<{ name: string; id: string | null }[]>([{ name: 'Frameworks', id: null }]);
    const [view, setView] = useState<'frameworks' | 'sections' | 'groups' | 'requirements'>('frameworks');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const loading = frameworksLoading || sectionsLoading || groupsLoading || requirementsLoading;

    useEffect(() => {
        if (!loading) {
            const timeout = setTimeout(() => setIsLoading(false), 10);
            return () => clearTimeout(timeout);
        } else {
            setIsLoading(true);
        }
    }, [loading]);

    const handleBreadcrumbClick = (index: number) => {
        const newBreadcrumb = breadcrumb.slice(0, index + 1);
        setBreadcrumb(newBreadcrumb);

        if (index === 0) {
            setView('frameworks');
            setSelectedId(null);
        } else if (index === 1) {
            setView('sections');
            setSelectedId(newBreadcrumb[index].id);
        } else if (index === 2) {
            setView('groups');
            setSelectedId(newBreadcrumb[index].id);
        }
    };

    const handleRowClick = (id: string, name: string, level: 'sections' | 'groups' | 'requirements') => {
        setSelectedId(id);
        setView(level);
        setBreadcrumb(prev => [...prev, { name, id }]);
    };

    const columns = useMemo(() => {
        if (view === 'frameworks') {
            return [
                {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name: string, record: any) => (
                        <div>
                            <RegulatoryFrameworkTag standard={name} />
                        </div>
                    ),
                },
                {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                },
                {
                    title: 'Number of Sections',
                    dataIndex: 'sectionCount',
                    key: 'sectionCount',
                },
                {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
                },
                {
                    title: 'Documents Included',
                    dataIndex: 'documents',
                    key: 'documents',
                },
                {
                    key: 'actions',
                    render: () => <Button type="primary">Create Report</Button>,
                },
            ];
        } else if (view === 'sections') {
            return [
                {
                    title: 'Section Name',
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                },
                {
                    title: 'Number of Groups',
                    dataIndex: 'groupCount',
                    key: 'groupCount',
                },
                {
                    key: 'actions',
                    render: () => <Button type="primary">Create Report</Button>,
                },
            ];
        } else if (view === 'groups') {
            return [
                {
                    title: 'Group Name',
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                },
                {
                    title: 'Number of Requirements',
                    dataIndex: 'requirementCount',
                    key: 'requirementCount',
                },
            ];
        } else {
            return [
                {
                    title: 'Requirement Name',
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                },
            ];
        }
    }, [view]);

    const dataSource = useMemo(() => {
        if (isLoading) {
            return Array.from({ length: 10 }).map((_, index) => ({
                key: `skeleton-${index}`,
                name: <Skeleton.Input active style={{ width: 150 }} size="small" />,
                description: <Skeleton.Input active style={{ width: 300 }} size="small" />,
                sectionCount: <Skeleton.Input active style={{ width: 50 }} size="small" />,
                price: <Skeleton.Input active style={{ width: 100 }} size="small" />,
                documents: <Skeleton.Input active style={{ width: 100 }} size="small" />,
            }));
        }

        if (view === 'frameworks') {
            return frameworks.map(f => ({
                key: f.id,
                name: f.id,
                description: f.description || 'No description available',
                sectionCount: sections.filter(section => section.regulatory_framework === f.id).length,
                price: '€1,500',
                documents: 1000,
            }));
        } else if (view === 'sections') {
            return sections
                .filter(section => section.regulatory_framework === selectedId)
                .map(section => ({
                    key: section.id,
                    name: section.name,
                    description: section.description || 'No description available',
                    groupCount: requirementGroups.filter(group => group.section_id === section.id).length,
                }));
        } else if (view === 'groups') {
            return requirementGroups
                .filter(group => group.section_id === selectedId)
                .map(group => ({
                    key: group.id,
                    name: group.name,
                    description: group.description || 'No description available',
                    requirementCount: requirements.filter(req => req.group_id === group.id).length,
                }));
        } else {
            return requirements
                .filter(req => req.group_id === selectedId)
                .map(req => ({
                    key: req.id,
                    name: req.name,
                    description: req.description || 'No description available',
                }));
        }
    }, [isLoading, view, frameworks, sections, requirementGroups, requirements, selectedId]);

    return (
        <div>
            <Breadcrumb className="mb-2">
                {breadcrumb.map((crumb, index) => (
                    <Breadcrumb.Item key={index} onClick={() => handleBreadcrumbClick(index)}>
                        {crumb.name}
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={{ pageSize: 10 }}
                rowKey="key"
                onRow={(record) => ({
                    onClick: () => {
                        if (view !== 'requirements') {
                            handleRowClick(
                                record.key,
                                record.name,
                                view === 'frameworks' ? 'sections' : view === 'sections' ? 'groups' : 'requirements'
                            );
                        }
                    },
                    style: { cursor: view === 'requirements' ? 'default' : 'pointer' },
                })}
            />
        </div>
    );
};

export default RegulatoryFrameworksTable;
