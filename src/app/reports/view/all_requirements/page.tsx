'use client';

import React from 'react';
import TableContainer from './table-container';
import { Table, Skeleton } from 'antd';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';

const Page = () => {
    const { filteredSelectedReports, loading: reportsLoading } = useReportsContext();

    const { filteredSelectedReportsSections, loading: sectionsLoading } = useSectionsContext();
    const { filteredSelectedRequirements, loading: requirementsLoading } = useRequirementsContext();
    const { filteredSelectedRequirementGroups, loading: groupsLoading } = useRequirementGroupsContext();

    if (reportsLoading || sectionsLoading || requirementsLoading || groupsLoading) {
        return (
            <div>
                <div className="my-4">
                    <Skeleton.Button active />
                </div>
                <Table
                    dataSource={Array.from({ length: 20 }, (_, index) => ({ key: index }))}
                    pagination={false}
                    columns={[
                        {
                            title: 'Title',
                            dataIndex: 'title',
                            key: 'title',
                            render: () => <Skeleton.Input active style={{ width: 150 }} />,
                        },
                        {
                            title: 'Compliance Rating',
                            dataIndex: 'compliance_rating',
                            key: 'compliance_rating',
                            render: () => <Skeleton.Input active style={{ width: 100 }} />,
                        },
                        {
                            title: '',
                            key: 'actions',
                            render: () => <Skeleton.Button active />,
                        },
                    ]}
                />
            </div>
        );
    }

    return (
        <div>
            <TableContainer
                reports={filteredSelectedReports}
                sections={filteredSelectedReportsSections}
                requirements={filteredSelectedRequirements}
                requirement_groups={filteredSelectedRequirementGroups}
            />
        </div>
    );
};

export default Page;
