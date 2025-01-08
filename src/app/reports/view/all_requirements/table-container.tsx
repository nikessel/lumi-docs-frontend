'use client';

import React, { useState } from 'react';
import { Table, Breadcrumb } from 'antd';
import { Report, Section, Requirement, RequirementGroup, SectionAssessment, RequirementGroupAssessment, RequirementAssessment } from '@wasm';

// Union type for rows in the table
type TableRow = (SectionAssessment | RequirementGroupAssessment | RequirementAssessment) & { id: string };

interface TableContainerProps {
    reports: Report[];
    sections: Section[];
    requirements: Requirement[],
    requirement_groups: RequirementGroup[],
}

type BreadcrumbState = {
    title: string;
    data: TableRow[];
};

const TableContainer: React.FC<TableContainerProps> = ({ reports, sections }) => {
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbState[]>([
        {
            title: 'Sections',
            data: reports.flatMap((report) =>
                Array.from(report.section_assessments.entries()).map(([key, section]) => ({
                    ...section,
                    id: key, // Add the key as `id`
                }))
            ),
        },
    ]);

    const currentView = breadcrumb[breadcrumb.length - 1];

    const handleRowClick = (record: TableRow) => {
        console.log(record);
        // Handle RequirementGroupAssessment with `assessments`
        if ('assessments' in record && record.assessments) {
            const children: TableRow[] = Array.from(record.assessments.entries()).map(([key, value]) => {
                if ('requirement' in value) {
                    return {
                        ...value.requirement,
                        id: key, // Add the key as `id`
                    } as TableRow;
                } else if ('requirement_group' in value) {
                    return {
                        ...value.requirement_group,
                        id: key, // Add the key as `id`
                    } as TableRow;
                }
                throw new Error('Unexpected assessment type');
            });

            if (children.length > 0) {
                setBreadcrumb((prev) => [
                    ...prev,
                    {
                        title: record.id || 'Requirement Group',
                        data: children,
                    },
                ]);
            }
        }
        // Handle SectionAssessment with `requirement_assessments`
        else if ('requirement_assessments' in record && record.requirement_assessments) {
            const children: TableRow[] = Array.from(record.requirement_assessments.entries()).map(([key, value]) => {
                if ('requirement' in value) {
                    return {
                        ...value.requirement,
                        id: key, // Add the key as `id`
                    } as TableRow;
                } else if ('requirement_group' in value) {
                    return {
                        ...value.requirement_group,
                        id: key, // Add the key as `id`
                    } as TableRow;
                }
                throw new Error('Unexpected requirement type');
            });

            if (children.length > 0) {
                setBreadcrumb((prev) => [
                    ...prev,
                    {
                        title: record.id || 'Section',
                        data: children,
                    },
                ]);
            }
        } else {
            console.log('Requirement clicked:', record); // Handle modal or detailed view
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        setBreadcrumb((prev) => prev.slice(0, index + 1));
    };

    const columns = [
        {
            title: 'Section Name',
            key: 'name',
            render: (_: unknown, record: TableRow) => {
                // Find the section by its ID
                const section = sections.find((section) => section.id === record.id);
                return section ? section.name : record.id; // Fallback to ID if name is not found
            },
        },
        {
            title: 'Compliance Rating',
            dataIndex: 'compliance_rating',
            key: 'compliance_rating',
        },
        {
            title: '',
            render: (_: unknown, record: TableRow) => {
                if ('requirement_assessments' in record || 'assessments' in record) {
                    const childrenCount =
                        'requirement_assessments' in record
                            ? record.requirement_assessments?.size || 0
                            : 'assessments' in record
                                ? record.assessments?.size || 0
                                : 0;

                    return (
                        <a onClick={() => handleRowClick(record)}>
                            View Children ({childrenCount})
                        </a>
                    );
                }

                return <a onClick={() => console.log('View Details:', record)}>View Details</a>;
            },
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-2">
                {breadcrumb.map((crumb, index) => {
                    let displayTitle;

                    if (index === 0) {
                        displayTitle = "Sections";
                    } else {
                        const section = sections.find((section) => section.id === crumb.title);
                        if (section) {
                            displayTitle = `${section.regulatory_framework} / ${section.name}`;
                        } else {
                            displayTitle = crumb.title; // Fallback if no section matches
                        }
                    }

                    return (
                        <Breadcrumb.Item key={index}>
                            <a onClick={() => handleBreadcrumbClick(index)}>{displayTitle}</a>
                        </Breadcrumb.Item>
                    );
                })}
            </Breadcrumb>
            <Table
                dataSource={currentView.data}
                rowKey={(record) => record.id} // Use the ID as the unique key
                columns={columns}
                pagination={false}
            />
        </div>
    );
};

export default TableContainer;
