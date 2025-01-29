'use client';

import React from 'react';
import { Button, Divider } from 'antd';
import { SaveOutlined, ArrowRightOutlined } from '@ant-design/icons';
import "@/styles/globals.css";
// import ReportSectionSelector from '@/components/report-section-selector';
import ReportCreatedOn from '@/components/created-on';
import FilterBar from '@/components/filter-bar'
import RequirementGroups from './show-requirement-group';
import { useSelectedFilteredReports } from '@/hooks/report-hooks'; // Adjust the path if needed
import ReportStateHandler from '@/components/report-state-handler'

const ReportPage = () => {
    const { reports, loading, error } = useSelectedFilteredReports();

    return (
        <ReportStateHandler loading={loading} error={error} reports={reports} expectReports={true}>
            <div>
                <div className="flex justify-between items-center">
                    {/* <div>
                        <div className="space-y-4">
                            <ReportSectionSelector reports={reports} />
                        </div>
                    </div> */}
                    <div className="flex items-center space-x-2">
                        <Button icon={<SaveOutlined />}>Save view</Button>
                        <Button icon={<ArrowRightOutlined />} type="primary">
                            Go to tasks
                        </Button>
                    </div>
                </div>
                <Divider className="border-thin mt-2 mb-2" />

                <div className="flex justify-between items-center">
                    <div className="flex justify-between w-full">
                        <ReportCreatedOn reports={reports} />
                        <div className="flex items-center gap-4">
                            <FilterBar reports={reports} />
                        </div>
                    </div>
                </div>

                <RequirementGroups />
            </div>
        </ReportStateHandler>
    );
};

export default ReportPage;
