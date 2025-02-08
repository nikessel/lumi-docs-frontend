import React from "react";
import { Tag, Tooltip } from "antd";
import { Report } from "@wasm"

interface ReportsHeaderProps {
    reports: Report[]; // Replace with your report type if needed
    header?: string
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({ reports, header }) => {
    const reportCount = reports.length;

    return (
        <div className="flex items-center ">
            <div className="flex items-center text-h4_custom mr-4" >
                {header ? header : "Reports"}
            </div>
            {reportCount > 1 && (
                <Tooltip
                    title={
                        <div>
                            {reports.map((report) => (
                                <div key={report.id}>{report.title}</div>
                            ))}
                        </div>
                    }
                >
                    <Tag color="blue" className="cursor-pointer">
                        {`${reportCount} Reports Selected`}
                    </Tag>
                </Tooltip>
            )}
        </div>
    );
};

export default ReportsHeader;
