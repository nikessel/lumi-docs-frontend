'use client';

import React from 'react';
import { useSelectedFilteredReports } from '@/hooks/report-hooks';
import { useFilteredReportSections } from '@/hooks/section-hooks';
import { useFilteredReportsRequirements } from '@/hooks/requirement-hooks';
import { useFilteredReportsRequirementGroups } from '@/hooks/requirement-group-hooks';
import ReportStateHandler from '@/components/report-state-handler';
import TableContainer from './table-container';

const Page = () => {
    const { reports, loading: reportsLoading, error: reportsError } = useSelectedFilteredReports();
    const { sections, loading: sectionsLoading, error: sectionsError } = useFilteredReportSections(reports);
    const { requirements, loading: requirementsLoading, error: requirementsError } = useFilteredReportsRequirements(reports);
    const { requirementGroups, loading: groupsLoading, error: groupsError } = useFilteredReportsRequirementGroups(reports);

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
