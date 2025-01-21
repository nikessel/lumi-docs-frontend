'use client';

import React from 'react';
import ReportStateHandler from '@/components/report-state-handler';
import TableContainer from './table-container';
import { useSelectedFilteredReportsContext } from '@/contexts/reports-context/selected-filtered-reports';
import { useFilteredSectionsContext } from '@/contexts/sections/filtered-report-sections';
import { useFilteredRequirementsContext } from '@/contexts/requirement-context/filtered-report-requirement-context';
import { useFilteredRequirementGroupsContext } from '@/contexts/requirement-group-context/filtered-report-requirement-group';

const Page = () => {
    const { reports, loading: reportsLoading, error: reportsError } = useSelectedFilteredReportsContext();

    const { sections, loading: sectionsLoading, error: sectionsError } = useFilteredSectionsContext();
    const { requirements, loading: requirementsLoading, error: requirementsError } = useFilteredRequirementsContext();
    const { requirementGroups, loading: groupsLoading, error: groupsError } = useFilteredRequirementGroupsContext();

    const loading = reportsLoading || sectionsLoading || requirementsLoading || groupsLoading;
    const error = reportsError || sectionsError || requirementsError || groupsError;

    return (
        <ReportStateHandler loading={loading} error={error} reports={reports} expectReports={true}>
            <div>
                <TableContainer
                    reports={reports}
                    sections={sections}
                    requirements={requirements}
                    requirement_groups={requirementGroups}
                />
            </div>
        </ReportStateHandler>
    );
};

export default Page;
