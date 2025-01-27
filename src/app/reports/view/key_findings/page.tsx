'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Progress } from 'antd';
import ReportStateHandler from '@/components/report-state-handler';
import { extractAllRequirementAssessments } from '@/utils/report-utils';
import DetailedAssessmentModal from '@/components/detailed-assessment-modal';
import type { RequirementAssessment, Requirement } from "@wasm";
import { getComplianceColorCode } from '@/utils/formating';
import { useSelectedFilteredReportsContext } from '@/contexts/reports-context/selected-filtered-reports';
import { useFilteredRequirementsContext } from '@/contexts/requirement-context/filtered-report-requirement-context';

type RequirementAssessmentWithId = RequirementAssessment & { id: string };

const Page = () => {
    const { reports, loading: reportsLoading, error: reportsError } = useSelectedFilteredReportsContext();
    const { requirements, loading: requirementsLoading, error: requirementsError } = useFilteredRequirementsContext();

    const [allAssessmentsSorted, setAllAssessmentsSorted] = useState<RequirementAssessmentWithId[]>([]);

    const [selectedRequirement, setSelectedRequirement] = useState<{
        requirement: Requirement | undefined;
        requirementAssessment: RequirementAssessment | undefined;
    }>({
        requirement: undefined,
        requirementAssessment: undefined,
    });

    const [openModal, setOpenModal] = useState<boolean>(false);

    const loading = reportsLoading || requirementsLoading;
    const error = reportsError || requirementsError;

    useEffect(() => {
        if (reports) {
            const assessments = extractAllRequirementAssessments(reports);
            const sortedAssessments = assessments.sort((a, b) => a.compliance_rating - b.compliance_rating);
            setAllAssessmentsSorted(sortedAssessments);
        }
    }, [reports]);

    // Handle View Details click
    const handleViewDetails = (record: RequirementAssessmentWithId) => {
        const requirement = requirements.find((req) => req.id === record.id);
        setSelectedRequirement({ requirement, requirementAssessment: record });
        setOpenModal(true);
    };

    // Columns for the table
    const columns = [
        {
            title: 'Requirement Name',
            dataIndex: 'id',
            key: 'name',
            render: (id: string) => requirements.find((req) => req.id === id)?.name || 'Unknown Requirement',
        },
        // {
        //     title: 'Description',
        //     dataIndex: 'description',
        //     key: 'description',
        //     render: () => '[Insert description]',
        // },
        // {
        //     title: 'Details',
        //     dataIndex: 'details',
        //     key: 'details',
        //     render: () => '[Insert details]',
        // },
        {
            title: 'Compliance Rating',
            dataIndex: 'compliance_rating',
            key: 'compliance_rating',
            render: (compliance_rating: number) => (
                <div className="flex justify-center">
                    <Progress
                        type="circle"
                        percent={compliance_rating}
                        strokeColor={getComplianceColorCode(compliance_rating)}
                        width={50} // Adjust size as needed
                    />
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

    return (
        <ReportStateHandler loading={loading} error={error} reports={reports} expectReports={true}>
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
                />
            </div>
        </ReportStateHandler>
    );
};

export default Page;
