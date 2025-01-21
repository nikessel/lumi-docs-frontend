'use client';

import React from 'react';
import { Button, Divider } from 'antd';
import { SaveOutlined, ArrowRightOutlined } from '@ant-design/icons';
import "@/styles/globals.css";
import ReportSectionSelector from '@/components/report-section-selector';
import ReportCreatedOn from '@/components/created-on';
import FilterBar from '@/components/filter-bar'
import { useSelectedFilteredReports } from '@/hooks/report-hooks';
import ReportStateHandler from '@/components/report-state-handler'
import SubMenu from './sub-menu';
import { createUrlWithParams } from '@/utils/url-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import SaveViewButton from '@/components/save-view';
import Typography from '@/components/typography';
import ReportsHeader from './report-header';
import { useFilteredReportSections } from '@/hooks/section-hooks';
import { SelectedFilteredReportsProvider } from '@/contexts/reports-context/selected-filtered-reports';
import { FilteredSectionsProvider } from '@/contexts/sections/filtered-report-sections';
import { FilteredRequirementGroupsProvider } from '@/contexts/requirement-group-context/filtered-report-requirement-group';
import { FilteredRequirementsProvider } from '@/contexts/requirement-context/filtered-report-requirement-context';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { reports, loading, error } = useSelectedFilteredReports();
    const { sections, loading: sectionLoading, error: sectionError } = useFilteredReportSections(reports);

    const searchParams = useSearchParams();
    const router = useRouter();

    const handleGoToTasks = () => {
        const tasksUrl = createUrlWithParams('/tasks/view', searchParams);
        router.push(tasksUrl);
    };

    return (
        <ReportStateHandler loading={loading || sectionLoading} error={error} reports={reports} expectReports={false}>
            <SelectedFilteredReportsProvider>
                <FilteredSectionsProvider reports={reports}>
                    <FilteredRequirementsProvider reports={reports}>
                        <FilteredRequirementGroupsProvider reports={reports}>
                            <div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        {reports.length > 0 ?

                                            <div className="space-y-4">
                                                <ReportsHeader reports={reports} />
                                            </div>
                                            : <div>Reports</div>
                                        }
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <SaveViewButton />
                                        <Button
                                            icon={<ArrowRightOutlined />}
                                            type="primary"
                                            onClick={handleGoToTasks}
                                        >
                                            Go to tasks
                                        </Button>
                                    </div>
                                </div>
                                <Divider className="border-thin mt-2 mb-2" />

                                <div className="flex justify-between items-center">
                                    {reports.length > 0 ? <div className="flex justify-between w-full">
                                        <SubMenu />
                                        <div className="flex items-center gap-4">
                                            <ReportCreatedOn reports={reports} />
                                            <FilterBar reports={reports} />
                                        </div>
                                    </div> : ""}
                                </div>

                                <div className="mt-2">
                                    {children}
                                </div>
                            </div>
                        </FilteredRequirementGroupsProvider>
                    </FilteredRequirementsProvider>
                </FilteredSectionsProvider>
            </SelectedFilteredReportsProvider>
        </ReportStateHandler>
    );
};

export default Layout;
