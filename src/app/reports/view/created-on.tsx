import React from 'react';
import { Tag, Tooltip } from 'antd';
import { Report } from '@wasm';
import Typography from "@/components/typography";

interface ReportCreatedOnProps {
    reports: Report[];
}

const ReportCreatedOn: React.FC<ReportCreatedOnProps> = ({ reports }) => {
    // Create tooltip content by mapping over the reports and showing their titles and created dates
    const tooltipContent = reports.map((report) => (
        <div className="flex justify-between" key={report.id}>
            <div className="pr-3">{report.title}:</div> <div>{new Date(report.created_date).toLocaleDateString()}</div>
        </div>
    ));

    return (
        <div className="flex items-center space-x-2">
            {reports.length > 1 ? <Tooltip title={tooltipContent}>
                <Tag color="success" className="cursor-pointer">
                    Created On
                </Tag>
            </Tooltip> : <Tag color="success" className="cursor-pointer">
                {new Date(reports[0].created_date).toLocaleDateString()}
            </Tag>}
        </div>
    );
};

export default ReportCreatedOn;
