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
import { createUrlWithParams } from '@/utils/url-utils';
import { useRouter, useSearchParams } from 'next/navigation';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { reports, loading, error } = useSelectedFilteredReports();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleGoToReports = () => {
        const tasksUrl = createUrlWithParams('/reports/view/overview', searchParams);
        router.push(tasksUrl);
    };

    return (
        <ReportStateHandler loading={loading} error={error} reports={reports} expectReports={false}>
            <div>
                <div className="flex justify-between items-center">
                    <div>
                        {reports.length > 0 ?

                            <div className="space-y-4">
                                <ReportSectionSelector reports={reports} />
                            </div>
                            : <div>Tasks</div>
                        }
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button icon={<SaveOutlined />}>Save view</Button>
                        <Button icon={<ArrowRightOutlined />} type="primary" onClick={handleGoToReports}>
                            Go to Reports
                        </Button>
                    </div>
                </div>
                <Divider className="border-thin mt-2 mb-2" />

                <div className="flex justify-between items-center">
                    {reports.length > 0 ? <div className="flex justify-between w-full">
                        <div className="flex items-center gap-4">
                            <ReportCreatedOn reports={reports} />
                            <FilterBar reports={reports} />
                        </div>
                    </div> : ""}
                </div>

                <div className="mt-2">{children}</div>
            </div>
        </ReportStateHandler>
    );
};

export default Layout;
