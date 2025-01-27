'use client';
import React, { useState, useEffect } from "react";
import Typography from "@/components/typography";
import { Button, Divider, Input, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "@/styles/globals.css";
import ReportMetaView from "@/components/report-meta-view";
import { useRouter } from "next/navigation";
// import { useAllReports } from '@/hooks/report-hooks';
import { useUrlSelectedReports } from '@/hooks/url-hooks';
import CreateReportModal from "@/components/create-report/create-report-modal";
import { useWasm } from '@/components/WasmProvider';
import { isArchived } from "@/utils/report-utils";
import { useAllReportsContext } from "@/contexts/reports-context/all-reports-context";
import PaymentChecker from "@/components/payment/payment-checker";
// import { ReportsByIdsProvider } from "@/contexts/reports-context/reports-by-id";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
// import { fetchReportsByIds } from "@/utils/report-utils";
import { useGlobalActionsStore } from "@/stores/global-actions-store";
import { message } from "antd";

const Page = () => {
    const { reports, loading, error } = useAllReportsContext();
    const { selectedReports, selectedCount } = useUrlSelectedReports();
    const { wasmModule, isLoading } = useWasm();
    const archiving_ids = useGlobalActionsStore((state) => state.archiving_ids)
    const restoring_ids = useGlobalActionsStore((state) => state.restoring_ids)
    const remove_archiving_id = useGlobalActionsStore((state) => state.removeArchivingId)
    const remove_restoring_id = useGlobalActionsStore((state) => state.removeRestoringId)
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate)
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const [showArchived, setShowArchived] = useState(false);

    const archivedReports = reports.filter((report) => isArchived(report.status));
    const archivedCount = archivedReports.length;

    const [messageApi, contextHolder] = message.useMessage()

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

    useEffect(() => {
        reports.forEach((report) => {
            if (archiving_ids.includes(report.id) && isArchived(report.status)) {
                remove_archiving_id(report.id);
            }
            if (restoring_ids.includes(report.id) && !isArchived(report.status)) {
                remove_restoring_id(report.id);
            }
        });
        if (archiving_ids.length > 0 || restoring_ids.length > 0) {
            triggerUpdate("reports")
        }
    }, [reports, archiving_ids, restoring_ids]);

    useEffect(() => {
        if (archiving_ids.length > 0) {
            const key = "archivingMessage";
            messageApi.loading({
                content: `Archiving ${archiving_ids.length} report(s)...`,
                key,
                duration: 0, // Make the message persist until explicitly dismissed
            });
        } else {
            messageApi.destroy("archivingMessage"); // Dismiss the archiving message
        }

        if (restoring_ids.length > 0) {
            const key = "restoringMessage";
            messageApi.loading({
                content: `Restoring ${restoring_ids.length} report(s)...`,
                key,
                duration: 0,
            });
        } else {
            messageApi.destroy("restoringMessage"); // Dismiss the restoring message
        }
    }, [archiving_ids, restoring_ids]);

    // Render loading placeholders
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
                        <ReportMetaView key={index} report={null} loading={true} openRedirectPath="/reports/view/overview" wasmModule={wasmModule} />
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
            <PaymentChecker />
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <Typography textSize="h4">Reports</Typography>
                <div className="flex items-center space-x-2">
                    {/* New Button */}
                    <CreateReportModal />
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
                {sortedReports.filter((report) => !isArchived(report.status)).map((report) => (
                    <ReportMetaView
                        report={report}
                        key={report.id}
                        openRedirectPath="/reports/view/overview"
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
                            openRedirectPath="/reports/view/overview"
                            wasmModule={wasmModule}

                        />
                    ))}
                </>
            )}
            {contextHolder}
        </div>
    );
};

export default Page;
