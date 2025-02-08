'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Progress, Skeleton } from 'antd';
import { extractAllRequirementAssessments } from '@/utils/report-utils';
import DetailedAssessmentModal from '@/components/detailed-assessment-modal';
import type { RequirementAssessment, Requirement } from "@wasm";
import { getComplianceColorCode } from '@/utils/formating';
import { RegulatoryFramework } from '@wasm';
import NATag from '@/components/non-applicable-tag';
import { useReportsContext } from '@/contexts/reports-context';
import { useRequirementsContext } from '@/contexts/requirements-context';

type RequirementAssessmentWithId = RequirementAssessment & { id: string, reportId: string, regulatoryFramework: RegulatoryFramework };

const Page = () => {
    const { filteredSelectedReports, loading: reportsLoading } = useReportsContext();
    const { filteredSelectedRequirements, loading: requirementsLoading } = useRequirementsContext();

    const [allAssessmentsSorted, setAllAssessmentsSorted] = useState<RequirementAssessmentWithId[]>([]);

    const [selectedRequirement, setSelectedRequirement] = useState<{
        requirement: Requirement | undefined;
        requirementAssessment: RequirementAssessmentWithId | undefined;
    }>({
        requirement: undefined,
        requirementAssessment: undefined,
    });

    const [openModal, setOpenModal] = useState<boolean>(false);

    useEffect(() => {
        if (filteredSelectedReports) {
            const assessments = extractAllRequirementAssessments(filteredSelectedReports);
            const sortedAssessments = assessments.sort((a, b) => {
                if (a.compliance_rating === undefined) return 1; // Push 'undefined' to the bottom
                if (b.compliance_rating === undefined) return -1; // Push 'undefined' to the bottom
                return a.compliance_rating - b.compliance_rating; // Normal numeric sorting
            });
            setAllAssessmentsSorted(sortedAssessments);
        }
    }, [filteredSelectedReports]);

    // Handle View Details click
    const handleViewDetails = (record: RequirementAssessmentWithId) => {
        const requirement = filteredSelectedRequirements.find((req) => req.id === record.id);
        setSelectedRequirement({ requirement, requirementAssessment: record });
        setOpenModal(true);
    };

    // Columns for the table
    const columns = [
        {
            title: 'Requirement Name',
            dataIndex: 'id',
            key: 'name',
            render: (id: string) => filteredSelectedRequirements.find((req) => req.id === id)?.name || 'Unknown Requirement',
        },
        {
            title: 'Compliance Rating',
            dataIndex: 'compliance_rating',
            key: 'compliance_rating',
            render: (compliance_rating: number | undefined) => (
                <div className="flex justify-center">
                    {compliance_rating || compliance_rating === 0 ? <Progress
                        type="circle"
                        percent={compliance_rating}
                        strokeColor={getComplianceColorCode(compliance_rating)}
                        width={50} // Adjust size as needed
                    /> : <NATag />}
                </div>
            ),
        },
        {
            title: '',
            key: 'actions',
            render: (_: unknown, record: RequirementAssessmentWithId) => (
                <Button type="link" onClick={() => handleViewDetails(record)}>
                    View Details
                </Button>
            ),
        },
    ];

    if (reportsLoading || requirementsLoading) {
        return (
            <div className="">
                <div className="w-100">
                    <Table
                        dataSource={Array.from({ length: 10 }).map((_, index) => ({ key: index }))}
                        columns={[
                            {
                                title: 'Requirement Name',
                                key: 'name',
                                render: () => <Skeleton.Input active style={{ width: 200 }} />,
                            },
                            {
                                title: 'Compliance Rating',
                                key: 'compliance_rating',
                                render: () => <Skeleton.Avatar active shape="circle" size={50} />,
                            },
                            {
                                title: '',
                                key: 'actions',
                                render: () => <Skeleton.Button active />,
                            },
                        ]}
                        pagination={false}
                    />
                </div>
            </div>
        );
    }

    return (
        <div>
            <Table
                dataSource={allAssessmentsSorted}
                rowKey="id"
                columns={columns}
                pagination={{ pageSize: 10 }}
            />
            <DetailedAssessmentModal
                requirement={selectedRequirement.requirement}
                requirementAssessment={selectedRequirement.requirementAssessment}
                onClose={() => setOpenModal(false)}
                open={openModal}
                regulatoryFramework={selectedRequirement.requirementAssessment?.regulatoryFramework}
            />
        </div>
    );
};

export default Page;
