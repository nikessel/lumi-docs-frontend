'use client';

import React from 'react';
import { Button, Divider } from 'antd';
import { SaveOutlined, ArrowRightOutlined } from '@ant-design/icons';
import "@/styles/globals.css";
import ReportSectionSelector from './report-section-selector';
import ReportCreatedOn from './created-on';
import FilterBar from './filter-bar';
import { useSelectedFilteredReports } from '@/hooks/report-hooks';
import ReportStateHandler from '@/components/report-state-handler'

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { reports, loading, error } = useSelectedFilteredReports();

    return (
        <ReportStateHandler loading={loading} error={error} reports={reports} expectReports={false}>
            <div>
                <div className="flex justify-between items-center">
                    <div>
                        {reports.length > 0 ?
                            <div className="space-y-4">
                                <ReportSectionSelector reports={reports} />
                            </div>
                            : <div>Reports</div>
                        }
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button icon={<SaveOutlined />}>Save view</Button>
                        <Button icon={<ArrowRightOutlined />} type="primary">
                            Go to tasks
                        </Button>
                    </div>
                </div>
                <Divider className="border-thin mt-2 mb-2" />

                <div className="flex justify-between items-center">
                    {reports.length > 0 ? <div className="flex justify-between w-full">
                        <ReportCreatedOn reports={reports} />
                        <div className="flex items-center gap-4">
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
