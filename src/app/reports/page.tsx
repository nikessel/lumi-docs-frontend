'use client';
import React, { useEffect, useState } from "react";
import Typography from "@/components/typography";
import { Button, Divider, Input, Tooltip, message } from "antd";
import { PlusOutlined, AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import "@/styles/globals.css";
import ReportMetaView from "@/components/report-meta-view";
import { useWasm } from "@/components/WasmProvider";
import { fetchReports } from "@/utils/report-utils";
import type { Report } from "@wasm";
import { useSearchParams } from 'next/navigation';
import { useRouter } from "next/navigation";


const Page = () => {
    const { wasmModule } = useWasm();
    const [reports, setReports] = useState<Report[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const [selectedReports, setSelectedReports] = useState<string[]>([]); // local state for selected reports
    const [selectedCount, setSelectedCount] = useState(selectedReports.length);
    const router = useRouter();  // Initialize the router

    useEffect(() => {
        const urlSelectedReports = searchParams.get('selectedReports');
        if (urlSelectedReports) {
            // Split only if there are valid reports
            const decodedReports = urlSelectedReports
                .split(",")
                .map(report => decodeURIComponent(report))
                .filter(Boolean); // Remove empty strings from the array
            console.log("Decoded selected reports:", decodedReports);
            setSelectedReports(decodedReports);
            setSelectedCount(decodedReports.length);
        } else {
            setSelectedReports([]);
            setSelectedCount(0);
        }
    }, [searchParams]);

    // Fetch reports on mount
    useEffect(() => {
        const loadReports = async () => {
            if (!wasmModule) {
                console.warn("WASM module not loaded. Skipping report fetching.");
                return;
            }

            try {
                setLoading(true);
                const { reports, error } = await fetchReports(wasmModule);
                console.log("!!!!!!ASDASDASD", reports)

                if (error) {
                    console.error("Error fetching reports:", error);
                    setError(error);
                    message.error(`Failed to fetch reports: ${error}`);
                } else if (!reports.length) {
                    console.warn("No reports found.");
                    setError("No reports available.");
                } else {
                    console.log("Reports fetched successfully:", reports);
                    setReports(reports);
                }
            } catch (err) {
                console.error("Unexpected error while fetching reports:", err);
                setError("An unexpected error occurred.");
                message.error("An unexpected error occurred while fetching reports.");
            } finally {
                setLoading(false);
            }
        };

        loadReports();
    }, [wasmModule]);

    // Filter reports based on the search query
    const filteredReports = reports.filter(
        (report) =>
            report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.regulatory_framework.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <Button
                            size="small"
                            icon={viewMode === "grid" ? <BarsOutlined /> : <AppstoreOutlined />}
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
                <div
                    className={`mt-4 ${viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        : "flex flex-col"
                        }`}
                >
                    {Array.from({ length: 20 }, (_, index) => (
                        <ReportMetaView key={index} loading={true} viewType={viewMode === "grid" ? "card" : "row"} />
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
                    {/* Search Field */}

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
                    {/* View Toggle Button */}
                    <Tooltip title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}>
                        <Button
                            size="small"
                            icon={viewMode === "grid" ? <BarsOutlined /> : <AppstoreOutlined />}
                            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                        />
                    </Tooltip>
                    <Button
                        size="small"
                        type="primary"
                        disabled={selectedCount === 0}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event from propagating to the parent div
                            if (selectedReports.length > 0) {
                                router.push(`/reports/view?selectedReports=${encodeURIComponent(selectedReports.join(','))}`);
                            }
                        }}
                    >
                        {selectedCount === 0 ? "Select reports" : selectedCount === 1 ? `Open ${selectedCount} report` : `Open ${selectedCount} reports`}
                    </Button>
                </div>

            </div>

            {/* Display Reports */}
            <div
                className={`mt-4 ${viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "flex flex-col"
                    }`}
            >
                {filteredReports.map((report) => (
                    <ReportMetaView
                        id={report.id}
                        key={report.id}
                        regulatoryFramework={report.regulatory_framework}
                        title={report.title}
                        compliance={report.compliance_rating}
                        viewType={viewMode === "grid" ? "card" : "row"}
                        createdOn={new Date(report.created_date).toLocaleDateString()}
                    />
                ))}
            </div>
        </div >
    );
};

export default Page;
