'use client';

import React from 'react';
import { Button, Divider } from 'antd';
import { SaveOutlined, ArrowRightOutlined } from '@ant-design/icons';
import "@/styles/globals.css";
import ReportCreatedOn from '@/components/created-on';
import FilterBar from '@/components/filter-bar'
import RequirementGroups from './show-requirement-group';
import { useReportsContext } from '@/contexts/reports-context';

const ReportPage = () => {
    const { filteredSelectedReports } = useReportsContext();

    return (
        <div>
            <div className="flex justify-between items-center">
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
                    <ReportCreatedOn reports={filteredSelectedReports} />
                    <div className="flex items-center gap-4">
                        <FilterBar />
                    </div>
                </div>
            </div>

            <RequirementGroups />
        </div>
    );
};

export default ReportPage;
