'use client';

import React, { useEffect, useState } from 'react';
import ReportStateHandler from '@/components/report-state-handler';
import TableContainer from './table-container';
import { useSelectedFilteredReportsContext } from '@/contexts/reports-context/selected-filtered-reports';
import { useFilteredSectionsContext } from '@/contexts/sections/filtered-report-sections';
import { useFilteredRequirementsContext } from '@/contexts/requirement-context/filtered-report-requirement-context';
import { useFilteredRequirementGroupsContext } from '@/contexts/requirement-group-context/filtered-report-requirement-group';
import { Table, Skeleton } from 'antd';

const Page = () => {
    const { reports, loading: reportsLoading, error: reportsError } = useSelectedFilteredReportsContext();

    const { sections, loading: sectionsLoading, error: sectionsError } = useFilteredSectionsContext();
    const { requirements, loading: requirementsLoading, error: requirementsError } = useFilteredRequirementsContext();
    const { requirementGroups, loading: groupsLoading, error: groupsError } = useFilteredRequirementGroupsContext();

    const error = reportsError || sectionsError || requirementsError || groupsError;

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!reportsLoading && !sectionsLoading && !requirementsLoading && !groupsLoading) {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timeout);
    }, [reportsLoading, sectionsLoading, requirementsLoading, groupsLoading]);

    if (loading) {
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
                reports={reports}
                sections={sections}
                requirements={requirements}
                requirement_groups={requirementGroups}
            />
        </div>
    );
};

export default Page;
