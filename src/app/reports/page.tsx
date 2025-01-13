'use client';
import React, { useState } from "react";
import Typography from "@/components/typography";
import { Button, Divider, Input, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "@/styles/globals.css";
import ReportMetaView from "@/components/report-meta-view";
import { useRouter } from "next/navigation";
import { useAllReports } from '@/hooks/report-hooks';
import { useUrlSelectedReports } from '@/hooks/url-hooks';

const Page = () => {
    const { reports, loading, error } = useAllReports();
    const { selectedReports, selectedCount } = useUrlSelectedReports();

    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // Filter reports based on the search query
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
    if (loading) {
        return (
            <div>
                <div className="flex justify-between items-center">
                    <Typography textSize="h4">Reports</Typography>
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Search reports"
                            allowClear
                            style={{ width: 200 }}
                        />
                        <Button size="small" type="primary" icon={<PlusOutlined />}>
                            New
                        </Button>
                    </div>
                </div>
                <Divider className="border-thin mt-2 mb-2" />
                <Typography color="secondary">
                    Loading reports, please wait...
                </Typography>
                <div className="flex flex-col mt-4">
                    {Array.from({ length: 20 }, (_, index) => (
                        <ReportMetaView key={index} report={null} loading={true} openRedirectPath="/reports/view/overview" />
                    ))}
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Typography textSize="h5" color="secondary">
                    No reports
                </Typography>
            </div>
        );
    }

    // Render reports
    return (
        <div>
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <Typography textSize="h4">Reports</Typography>
                <div className="flex items-center space-x-2">
                    {/* New Button */}
                    <Button size="small" type="primary" icon={<PlusOutlined />}>
                        New
                    </Button>
                </div>
            </div>
            <Divider className="border-thin mt-2 mb-2" />
            <div className="flex justify-between items-center">
                <Typography color="secondary">
                    Open a single report or check more for merged view
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
                                router.push(`/reports/view/overview?selectedReports=${encodeURIComponent(selectedReports.join(','))}`);
                            }
                        }}
                    >
                        {selectedCount === 0 ? "Select reports" : selectedCount === 1 ? `Open ${selectedCount} report` : `Open ${selectedCount} reports`}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col mt-4">
                {sortedReports.map((report) => (
                    <ReportMetaView
                        report={report}
                        key={report.id}
                        openRedirectPath="/reports/view/overview"
                    />
                ))}
            </div>
        </div>
    );
};

export default Page;
