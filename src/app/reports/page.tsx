'use client';
import React, { useState } from "react";
import Typography from "@/components/typography";
import { Button, Divider, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "@/styles/globals.css";
import ReportMetaView from "@/components/report-meta-view";
import { useRouter } from "next/navigation";
import { useUrlSelectedReports } from '@/hooks/url-hooks';
import CreateReportModal from "@/components/create-report/create-report-modal";
import { useWasm } from '@/components/WasmProvider';
import { isArchived } from "@/utils/report-utils";
import PaymentChecker from "@/components/payment/payment-checker";
import { useReportsContext } from "@/contexts/reports-context";

const Page = () => {
    const { reports, loading } = useReportsContext();
    const { selectedReports, selectedCount } = useUrlSelectedReports();
    const { wasmModule, isLoading } = useWasm();
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const [showArchived, setShowArchived] = useState(false);

    const archivedReports = reports.filter((report) => isArchived(report.status));
    const archivedCount = archivedReports.length;
    const [actionLoading, setActionLoading] = useState(false)

    const filteredReports = reports.filter(
        (report) =>
            report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.regulatory_framework.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedReports = filteredReports.sort((a, b) => {
        if (a.status === "processing" && b.status !== "processing") {
            return 1;
        } else if (a.status !== "processing" && b.status === "processing") {
            return -1;
        }
        return 0;
    });

    if (loading || isLoading) {
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
                        <ReportMetaView key={index} report={null} loading={true} openRedirectPath="/reports/view/overview" wasmModule={wasmModule} setActionLoading={setActionLoading} actionLoading={actionLoading} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <PaymentChecker />
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <Typography textSize="h4">Reports</Typography>
                <div className="flex items-center space-x-2" data-tour="new-report-button">
                    {/* New Button */}
                    <CreateReportModal />
                </div>
            </div>
            <Divider className="border-thin mt-2 mb-2" />
            {reports.length > 0 ? <div className="flex justify-between items-center">
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
            </div> :
                <div className="mt-4 bg-gray-50 w-full flex items-center justify-center" style={{ height: "78vh" }}>
                    <Typography color="secondary">Create your first report to simplify your compliance journey</Typography>
                </div>
            }

            <div className="flex flex-col mt-4">
                {sortedReports.filter((report) => !isArchived(report.status)).map((report) => (
                    <ReportMetaView
                        report={report}
                        key={report.id}
                        openRedirectPath="/reports/view/overview"
                        wasmModule={wasmModule}
                        setActionLoading={setActionLoading}
                        actionLoading={actionLoading}
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
                            openRedirectPath="/reports/view/overview"
                            wasmModule={wasmModule}
                            setActionLoading={setActionLoading}
                            actionLoading={actionLoading}
                        />
                    ))}
                </>
            )}
        </div>
    );
};

export default Page;
