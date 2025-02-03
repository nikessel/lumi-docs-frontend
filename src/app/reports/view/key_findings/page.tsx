'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Progress, Skeleton } from 'antd';
import ReportStateHandler from '@/components/report-state-handler';
import { extractAllRequirementAssessments } from '@/utils/report-utils';
import DetailedAssessmentModal from '@/components/detailed-assessment-modal';
import type { RequirementAssessment, Requirement } from "@wasm";
import { getComplianceColorCode } from '@/utils/formating';
import { useSelectedFilteredReportsContext } from '@/contexts/reports-context/selected-filtered-reports';
import { useFilteredRequirementsContext } from '@/contexts/requirement-context/filtered-report-requirement-context';
import { RegulatoryFramework } from '@wasm';

type RequirementAssessmentWithId = RequirementAssessment & { id: string, reportId: string, regulatoryFramework: RegulatoryFramework };

const Page = () => {
    const { reports, loading: reportsLoading, error: reportsError } = useSelectedFilteredReportsContext();
    const { requirements, loading: requirementsLoading, error: requirementsError } = useFilteredRequirementsContext();

    const [allAssessmentsSorted, setAllAssessmentsSorted] = useState<RequirementAssessmentWithId[]>([]);

    const [selectedRequirement, setSelectedRequirement] = useState<{
        requirement: Requirement | undefined;
        requirementAssessment: RequirementAssessmentWithId | undefined;
    }>({
        requirement: undefined,
        requirementAssessment: undefined,
    });

    const [openModal, setOpenModal] = useState<boolean>(false);

    const [loading, setLoading] = useState(true)

    const error = reportsError || requirementsError;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!reportsLoading && !requirementsLoading) {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [reportsLoading, requirementsLoading]);

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

    console.log("selectedRequirement", selectedRequirement)

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

    if (loading) {
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
