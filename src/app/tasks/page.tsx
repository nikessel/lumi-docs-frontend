'use client';
import React, { useState } from "react";
import Typography from "@/components/typography";
import { Button, Divider, Input, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "@/styles/globals.css";
import ReportMetaView from "@/components/report-meta-view";
import { useRouter } from "next/navigation";
// import { useAllReports } from '@/hooks/report-hooks';
import { useUrlSelectedReports } from '@/hooks/url-hooks';
import { useWasm } from '@/components/WasmProvider';
import { isArchived } from "@/utils/report-utils";
import { useAllReportsContext } from "@/contexts/reports-context/all-reports-context";
import ReportStateHandler from "@/components/report-state-handler";

const Page = () => {
    const { reports, loading, error } = useAllReportsContext();
    const { selectedReports, selectedCount } = useUrlSelectedReports();
    const { wasmModule, isLoading } = useWasm();

    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const [showArchived, setShowArchived] = useState(false);

    const archivedReports = reports.filter((report) => isArchived(report.status));
    const archivedCount = archivedReports.length;

    const filteredReports = reports.filter(
        (report) =>
            report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.regulatory_framework.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedReports = filteredReports.sort((a, b) => {
        if (a.status === "processing" && b.status !== "processing") {
            return 1; // Move "processing" to the bottom
        } else if (a.status !== "processing" && b.status === "processing") {
            return -1; // Keep non-"processing" at the top
        }
        return 0; // Maintain the original order otherwise
    });

    // Render loading placeholders
    if (loading || isLoading) {
        return (
            <div>
                <div className="flex justify-between items-center">
                    <Typography textSize="h4">Tasks</Typography>
                </div>
                <Divider className="border-thin mt-2 mb-2" />
                <Typography color="secondary">
                    Loading reports, please wait...
                </Typography>
                <div className="flex flex-col mt-4">
                    {Array.from({ length: 20 }, (_, index) => (
                        <ReportMetaView key={index} report={null} loading={true} openRedirectPath="/tasks/overview/view" wasmModule={wasmModule} />
                    ))}
                </div>
            </div>
        );
    }

    // Render error state
    // if (error) {
    //     return (
    //         <div className="flex flex-col items-center justify-center h-full">
    //             <Typography textSize="h5" color="secondary">
    //                 No reports
    //             </Typography>
    //         </div>
    //     );
    // }

    // Render reports
    return (
        <ReportStateHandler expectReports={true} loading={false} reports={reports} error={error}>

            <div>
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <Typography textSize="h4">Tasks</Typography>
                </div>
                <Divider className="border-thin mt-2 mb-2" />
                <div className="flex justify-between items-center">
                    <Typography color="secondary">
                        Select one or multiple reports to view associated tasks
                    </Typography>
                    <div className="flex gap-3">
                        <Input
                            size="small"
                            placeholder="Search reports"
                            onChange={(e) => setSearchQuery(e.target.value)}
                            allowClear
                            style={{ width: 200 }}
                        />
                        <Button
                            size="small"
                            type="primary"
                            disabled={selectedCount === 0}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent event from propagating to the parent div
                                if (selectedReports.length > 0) {
                                    router.push(`/tasks/view/overview?selectedReports=${encodeURIComponent(selectedReports.join(','))}`);
                                }
                            }}
                        >
                            {selectedCount === 0 ? "Select reports" : selectedCount === 1 ? `Open ${selectedCount} report` : `Open ${selectedCount} reports`}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col mt-4">
                    {sortedReports.filter((report) => !isArchived(report.status)).map((report) => (
                        <ReportMetaView
                            report={report}
                            key={report.id}
                            openRedirectPath="/tasks/view/overview"
                            wasmModule={wasmModule}

                        />
                    ))}
                </div>
                {archivedReports.length > 0 ? <Button
                    className="mt-4"
                    size="small"
                    onClick={() => setShowArchived(!showArchived)}
                    type="link"
                >
                    {showArchived
                        ? `Hide archived (${archivedCount})`
                        : `Archived (${archivedCount})`}
                </Button> : ""}
                {showArchived && archivedReports.length > 0 && (
                    <>
                        <Divider className="border-thin mt-4 mb-2" />
                        <Typography textSize="h5" className="mb-2">Archived Reports</Typography>
                        {archivedReports.map((report) => (
                            <ReportMetaView
                                report={report}
                                key={report.id}
                                openRedirectPath="/tasks/view/overview"
                                wasmModule={wasmModule}

                            />
                        ))}
                    </>
                )}
            </div>
        </ReportStateHandler>
    );
};

export default Page;
