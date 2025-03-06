'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Table, Breadcrumb, Skeleton } from 'antd';
import RegulatoryFrameworkTag from '@/components/regulatory-framework-tag';
import { useRegulatoryFrameworksContext } from '@/contexts/regulatory-frameworks-context';
import { getPriceForGroup, getPriceForSection, getPriceForFramework } from '@/utils/payment';
import { formatPrice } from '@/utils/payment';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useRequirementPriceContext } from '@/contexts/price-context/use-requirement-price-context';

const RegulatoryFrameworksTable: React.FC = () => {
    const { frameworks, loading: frameworksLoading } = useRegulatoryFrameworksContext();

    const { sectionsForRegulatoryFramework, loading: sectionsLoading } = useSectionsContext();

    const { requirementGroupsBySectionId, loading: groupsLoading } = useRequirementGroupsContext();

    const { requirementsByGroupId, loading: requirementsLoading } = useRequirementsContext();

    const { userPrice, defaultPrice } = useRequirementPriceContext()
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
            ];
        } else if (view === 'sections') {
            return [
                {
                    title: 'Section Name',
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: 'Number of Groups',
                    dataIndex: 'groupCount',
                    key: 'groupCount',
                },
                {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
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
                {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
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
                {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
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
                sectionCount: sectionsForRegulatoryFramework[f.id]?.length || 0,
                price: formatPrice(getPriceForFramework(f.id, sectionsForRegulatoryFramework, requirementGroupsBySectionId, requirementsByGroupId, userPrice ? userPrice : defaultPrice)),
                documents: 1000,
            }));
        } else if (view === 'sections') {
            return sectionsForRegulatoryFramework[selectedId || ""]?.map(section => ({
                key: section.id,
                name: section.name,
                description: section.description || 'No description available',
                groupCount: requirementGroupsBySectionId[section.id]?.length || 0,
                price: formatPrice(getPriceForSection(section.id, requirementGroupsBySectionId, requirementsByGroupId, userPrice ? userPrice : defaultPrice))
            })) || [];
        } else if (view === 'groups') {
            return requirementGroupsBySectionId[selectedId || ""]?.map(group => ({
                key: group.id,
                name: group.name,
                description: group.description || 'No description available',
                requirementCount: requirementsByGroupId[group.id]?.length || 0,
                price: formatPrice(getPriceForGroup(group.id, requirementsByGroupId, userPrice ? userPrice : defaultPrice))
            })) || [];
        } else {
            return requirementsByGroupId[selectedId || ""]?.map(req => ({
                key: req.id,
                name: req.name,
                description: req.description || 'No description available',
                price: formatPrice(userPrice ? userPrice : defaultPrice)
            })) || [];
        }
    }, [isLoading, view, frameworks, sectionsForRegulatoryFramework, requirementGroupsBySectionId, requirementsByGroupId, selectedId, userPrice, defaultPrice]);


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
