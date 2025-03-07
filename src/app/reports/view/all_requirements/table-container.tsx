'use client';

import React, { useState, useEffect } from 'react';
import { Table, Breadcrumb, Progress } from 'antd';
import { Report, Section, Requirement, RequirementGroup, SectionAssessment, RequirementGroupAssessment, RequirementAssessment } from '@wasm';
import DetailedAssessmentModal from '@/components/detailed-assessment-modal';
import { getComplianceColorCode } from '@/utils/formating';
import RegulatoryFrameworkTag from '@/components/regulatory-framework-tag';
import { RegulatoryFramework } from '@wasm';
import { extractAllRequirementAssessments } from '@/utils/report-utils';
import NATag from '@/components/non-applicable-tag';

// Union type for rows in the table
type TableRow = (SectionAssessment | RequirementGroupAssessment | RequirementAssessment & { reportId: string, regulatoryFramework: RegulatoryFramework }) & { id: string };

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

    const [allAssessmentsSorted, setAllAssessmentsSorted] = useState<(RequirementAssessment & { id: string, reportId: string, regulatoryFramework: RegulatoryFramework })[]>([]);

    useEffect(() => {
        if (reports) {
            const assessments = extractAllRequirementAssessments(reports);
            const sortedAssessments = assessments.sort((a, b) => {
                if (a.compliance_rating === undefined) return 1; // Push 'undefined' to the bottom
                if (b.compliance_rating === undefined) return -1; // Push 'undefined' to the bottom
                return a.compliance_rating - b.compliance_rating; // Normal numeric sorting
            });
            setAllAssessmentsSorted(sortedAssessments);
        }
    }, [reports]);


    const [selectedRequirement, setSelectedRequirement] = useState<{
        requirement: Requirement | undefined;
        requirementAssessment: RequirementAssessment & { id: string, reportId: string, regulatoryFramework: RegulatoryFramework } | undefined;
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
        // Handle RequirementGroupAssessment with `assessments`
        if ('sub_assessments' in record && record.sub_assessments) {
            const children: TableRow[] = Array.from(record.sub_assessments.entries()).map(([key, value]) => {
                if ('requirement_assessment' in value) {
                    return {
                        ...value.requirement_assessment,
                        id: key, // Add the key as `id`
                    } as TableRow;
                } else if ('requirement_group_assessment' in value) {
                    return {
                        ...value.requirement_group_assessment,
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
        else {
            setOpenModal(true)
            setSelectedRequirement({ requirement: requirements.find((req) => req.id === record.id), requirementAssessment: allAssessmentsSorted.find((ass) => ass.id === record.id) })
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        setBreadcrumb((prev) => prev.slice(0, index + 1));
    };

    const columns = [
        {
            title: 'Title',
            key: 'name',
            sorter: (a: TableRow, b: TableRow) => {
                const nameA =
                    sections.find((section) => section.id === a.id)?.name ||
                    requirements.find((req) => req.id === a.id)?.name ||
                    requirement_groups.find((group) => group.id === a.id)?.name ||
                    a.id;

                const nameB =
                    sections.find((section) => section.id === b.id)?.name ||
                    requirements.find((req) => req.id === b.id)?.name ||
                    requirement_groups.find((group) => group.id === b.id)?.name ||
                    b.id;

                return nameA.localeCompare(nameB); // Compare strings alphabetically
            },
            render: (_: unknown, record: TableRow) => {
                const name =
                    sections.find((section) => section.id === record.id)?.name ||
                    requirements.find((req) => req.id === record.id)?.name ||
                    requirement_groups.find((group) => group.id === record.id)?.name ||
                    record.id;

                // Get the current section from breadcrumb if we're in a section view
                const currentSection = breadcrumb.length > 1 ? sections.find(section => section.id === breadcrumb[1].title) : undefined;

                // Get the reference from the current record
                const reference = requirements.find((req) => req.id === record.id)?.reference ||
                    requirement_groups.find((group) => group.id === record.id)?.reference;

                // Use the current section's framework if we're in a section view, otherwise use the record's own framework
                const regulatoryFramework = currentSection?.regulatory_framework ||
                    sections.find((section) => section.id === record.id)?.regulatory_framework ||
                    sections.find((section) => section.id === ('section_id' in record ? record.section_id : undefined))?.regulatory_framework;

                return (
                    <div className="">
                        <div className="mb-2">{name}</div>
                        {regulatoryFramework && (
                            <div className="mb-1">
                                <RegulatoryFrameworkTag standard={regulatoryFramework} additionalReference={reference} />
                            </div>
                        )}

                    </div>
                );
            },
        },
        {
            title: 'Compliance Rating',
            dataIndex: 'compliance_rating',
            key: 'compliance_rating',
            sorter: (a: TableRow, b: TableRow) => {
                const ratingA = Number(a.compliance_rating) || 0;
                const ratingB = Number(b.compliance_rating) || 0;
                return ratingA - ratingB; // Sort numerically
            },
            render: (_: unknown, record: TableRow) => {
                return (
                    <div>
                        {record.compliance_rating || record.compliance_rating === 0 ? <Progress
                            percent={Number(record.compliance_rating)}
                            strokeColor={getComplianceColorCode(Number(record.compliance_rating))}
                        /> : <NATag />}
                    </div>
                );
            },
        },
        {
            title: '',
            render: (_: unknown, record: TableRow) => {
                if ('sub_assessments' in record) {
                    const childrenCount =
                        'sub_assessments' in record
                            ? record.sub_assessments?.size : 0
                    // : 'assessments' in record
                    //     ? record.assessments?.size || 0
                    //     : 0;

                    return (
                        <div className="w-full flex justify-end text-primary">
                            <a onClick={() => handleRowClick(record)}>
                                View {childrenCount} items
                            </a>
                        </div>
                    );
                }

                return (
                    <div className="w-full flex justify-end text-primary">
                        <a onClick={() => handleRowClick(record)}>View Details</a>
                    </div>
                );
            },
        },
    ];


    return (
        <div>
            <Breadcrumb className="my-4">
                {breadcrumb.map((crumb, index) => {
                    let displayTitle;

                    if (index === 0) {
                        displayTitle = "Sections";
                    } else {
                        const section = sections.find((section) => section.id === crumb.title);
                        const group = requirement_groups.find((group) => group.id === crumb.title);
                        if (section) {
                            displayTitle = `${section.regulatory_framework} / ${section.name}`;
                        } else if (group) {
                            displayTitle = group.name;
                        } else {
                            displayTitle = crumb.title; // Fallback if no section or group matches
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
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: 'pointer' }
                })}
            />
            <DetailedAssessmentModal
                requirement={selectedRequirement.requirement}
                requirementAssessment={selectedRequirement.requirementAssessment}
                onClose={() => setOpenModal(false)} open={openModal}
                regulatoryFramework={selectedRequirement.requirementAssessment?.regulatoryFramework}
            />
        </div>
    );
};

export default TableContainer;
