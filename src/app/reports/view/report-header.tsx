import React from "react";
import { Tag, Tooltip } from "antd";
import Typography from "@/components/typography";
import { Report } from "@wasm"

interface ReportsHeaderProps {
    reports: Report[]; // Replace with your report type if needed
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({ reports }) => {
    const reportCount = reports.length;

    return (
        <div className="flex items-center ">
            <div className="flex items-center text-h4_custom mr-4" >
                Reports
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
