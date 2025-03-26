'use client';

import React from 'react';
import { Divider, Alert } from 'antd';
import "@/styles/globals.css";
import ReportCreatedOn from '@/components/reports/created-on';
import SaveViewButton from '@/components/saved-views/save-view-button';
import { useReportsContext } from '@/contexts/reports-context';
import { extractProgress } from '@/utils/report-utils';
import Typography from '@/components/common/typography';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { filteredSelectedReports, reports } = useReportsContext();
    const processingReport = filteredSelectedReports.find(report => report.status === "processing");
    const progress = processingReport ? extractProgress(processingReport.title) : undefined;

    console.log("filteredSelectedReports", filteredSelectedReports, reports)

    return (
        <div>
            <Typography textSize="h4">New Report</Typography>

            <Divider className="border-thin mt-2 mb-2" />

            <div className="flex justify-between items-center">
            </div>

            <div className="mt-2">
                {processingReport && (
                    <div className="mb-4">
                        <Alert
                            message={`A report has only partially finished processing. Assessments will gradually be updated. ${progress ? `Progress: ${progress}%` : ""}`}
                            type="info"
                            closable
                        />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default Layout;
