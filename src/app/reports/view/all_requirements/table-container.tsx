'use client';

import React, { useState } from 'react';
import { Table, Breadcrumb, Progress } from 'antd';
import { Report, Section, Requirement, RequirementGroup, SectionAssessment, RequirementGroupAssessment, RequirementAssessment } from '@wasm';
import DetailedAssessmentModal from '@/components/detailed-assessment-modal';
import { getComplianceColorCode } from '@/utils/formating';
import RegulatoryFrameworkTag from '@/components/regulatory-framework-tag';

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

const TableContainer: React.FC<TableContainerProps> = ({ reports, sections, requirements, requirement_groups }) => {
    const [selectedRequirement, setSelectedRequirement] = useState<{
        requirement: Requirement | undefined;
        requirementAssessment: RequirementAssessment | undefined;
    }>({
        requirement: undefined,
        requirementAssessment: undefined,
    });
    const [openModal, setOpenModal] = useState<boolean>(false)

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
            const { id, ...assessment } = record;
            console.log("!!!!!1", record)
            setOpenModal(true)
            setSelectedRequirement({ requirement: requirements.find((req) => req.id === record.id), requirementAssessment: assessment as RequirementAssessment })
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        setBreadcrumb((prev) => prev.slice(0, index + 1));
    };

    const columns = [
        {
            title: 'Title',
            key: 'name',
            render: (_: unknown, record: TableRow) => {
                const section = sections.find((section) => section.id === record.id);
                const requirement = requirements.find((req) => req.id === record.id);
                const requirementGroup = requirement_groups.find((group) => group.id === record.id);

                // Render with primary and secondary text
                return section ? (
                    <div >
                        <div className="mb-1"><RegulatoryFrameworkTag standard={section.regulatory_framework} /> {section.name}</div>
                        <small style={{ color: '#888' }}>[add description]</small>
                    </div>
                ) : requirement ? (
                    <div>
                        <div>{requirement.name}</div>
                        <small style={{ color: '#888' }}>[add description]</small>
                    </div>
                ) : requirementGroup ? (
                    <div>
                        <div>{requirementGroup.name}</div>
                        <small style={{ color: '#888' }}>[add description]</small>
                    </div>
                ) : (
                    <div>
                        <div>{record.id}</div>
                        <small style={{ color: '#888' }}>[add description]</small>
                    </div>
                );
            },
        },
        {
            title: 'Compliance Rating',
            dataIndex: 'compliance_rating',
            key: 'compliance_rating',
            render: (_: unknown, record: TableRow) => {
                return (
                    <div> <Progress percent={Number(record.compliance_rating)} strokeColor={getComplianceColorCode(Number(record.compliance_rating))} /> </div>
                )
            }
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
                        <div className="w-full flex justify-end">
                            <a onClick={() => handleRowClick(record)}>
                                View Children ({childrenCount})
                            </a>
                        </div>
                    );
                }

                return <div className="w-full flex justify-end">
                    <a onClick={() => handleRowClick(record)}>View Details</a></div>;
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
                        <Breadcrumb.Item key={`${index}-${crumb.title}`}>
                            <a onClick={() => handleBreadcrumbClick(index)}>{displayTitle}</a>
                        </Breadcrumb.Item>
                    );
                })}
            </Breadcrumb>
            <Table
                dataSource={currentView.data}
                rowKey={(record) => `${record.id}-${Math.random()}`} // Add a unique suffix to prevent duplicates
                columns={columns}
                pagination={false}
            />
            <DetailedAssessmentModal requirement={selectedRequirement.requirement} requirementAssessment={selectedRequirement.requirementAssessment} onClose={() => setOpenModal(false)} open={openModal} />
        </div>
    );
};

export default TableContainer;
