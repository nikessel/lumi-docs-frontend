import React from "react";
import { Tag } from "antd";
import { formatStatus } from "@/utils/styling-utils";
import { isArchived } from "@/utils/report-utils";
import type { ReportStatus } from "@wasm";

interface ReportStatusTagProps {
    status: ReportStatus | undefined;
}

const ReportStatusTag: React.FC<ReportStatusTagProps> = ({ status }) => {
    if (!status) return

    if (isArchived(status)) {
        return (
            <div className="w-32 flex justify-center">
                <Tag color="gray">Archived</Tag>
            </div>
        );
    }

    return (
        <div className="w-32 flex justify-center">
            {status === "ready" ? (
                <Tag color="green">{formatStatus(status)}</Tag>
            ) : (
                <Tag color="red">{formatStatus(status)}</Tag>
            )}
        </div>
    );
};

export default ReportStatusTag;
