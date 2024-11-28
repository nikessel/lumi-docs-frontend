'use client';

import React, { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
import { fetchReportById } from '@/utils/report-utils'; // Update this path based on your project structure
import type { Report } from '@wasm';
import Typography from "@/components/typography";
import { Button, Divider, Select, Progress, Slider } from "antd";
import "@/styles/globals.css";
import { useWasm } from "@/components/WasmProvider";
import { formatRegulatoryFramework } from '@/utils/helpers';
import SectionCard from './sections-selector';
import SectionMetaList from './section-meta-list';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import ReportSectionSelector from './report-section-selector'; // Import new helper component
import ReportCreatedOn from './created-on'; // Import new component
import { fetchSections } from '@/utils/sections-utils';

const { Option } = Select;

const ReportPage = () => {
    const { wasmModule } = useWasm();
    // const { reportId } = useParams() as { reportId: string }; // Ensure `reportId` is treated as a string

    const searchParams = useSearchParams(); // Access query parameters
    const selectedReportsIds = searchParams.get('selectedReports')?.split(",").map(report => decodeURIComponent(report)) || [];

    const [reports, setReports] = useState<Report[]>([]);  // Store all selected reports
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const [view, setView] = useState<string>("Findings view"); // Default selected view
    const [acceptanceLevel, setAcceptanceLevel] = useState(20)

    const data = [
        { title: "Ethical Considerations", compliance_rating: 88 },
        { title: "Clinical Investigation Planning", compliance_rating: 92 },
        { title: "Clinical Investigation Conduct", compliance_rating: 78 },
        { title: "Ethical Considerations", compliance_rating: 88 },
        { title: "Clinical Investigation Planning", compliance_rating: 92 },
        { title: "Clinical Investigation Conduct", compliance_rating: 78 },
        { title: "Ethical Considerations", compliance_rating: 88 },
        { title: "Clinical Investigation Planning", compliance_rating: 92 },
        { title: "Clinical Investigation Conduct", compliance_rating: 78 },
        { title: "Ethical Considerations", compliance_rating: 88 },
        { title: "Clinical Investigation Planning", compliance_rating: 92 },
        { title: "Clinical Investigation Conduct", compliance_rating: 78 },
    ];

    console.log("selectedReportsIds", selectedReportsIds)

    useEffect(() => {
        const fetchReports = async () => {
            console.log("FETCHING DATA")
            setLoading(true);
            const fetchedReports: Report[] = [];
            for (const reportId of selectedReportsIds) {
                const { report, error } = await fetchReportById(wasmModule, reportId);
                console.log("FETCHed report", report, error)

                if (error) {
                    setError(error);
                } else {
                    report && fetchedReports.push(report);
                }
            }
            setReports(fetchedReports);
            setLoading(false);
        };

        if (selectedReportsIds.length > 0) {
            fetchReports();

        }
    }, []);

    const handleViewChange = (value: string) => {
        setView(value);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!reports.length) {
        return <p>No reports found for selected IDs: {selectedReportsIds.join(", ")}</p>;
    }

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <div className="space-y-4">
                        <ReportSectionSelector reports={reports} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Select
                        defaultValue="Findings view"
                        style={{ width: 200 }}
                        onChange={handleViewChange}
                    >
                        <Option value="Findings view">Findings view</Option>
                        <Option value="Implementations view">Implementations view</Option>
                        <Option value="References">References</Option>
                    </Select>
                </div>
            </div>
            <Divider className="border-thin mt-2 mb-2" />
            <div className="flex justify-between items-center">
                {/* <Typography color="secondary">
                    Created On: {new Date(report.created_date).toLocaleDateString()}
                </Typography> */}
                <div className="flex justify-between w-full">

                    <ReportCreatedOn reports={reports} />
                    <div className="flex gap-4">
                        <Typography color="secondary" textSize="small">
                            Acceptance level: {100 - acceptanceLevel}
                        </Typography>
                        <div className="w-32">
                            <Slider
                                value={acceptanceLevel}
                                onChange={(val) => setAcceptanceLevel(val)}
                                max={100}
                                min={0}
                                reverse={true}
                                tooltip={{ formatter: (val) => `${100 - (val ?? 0)}`, }}
                                trackStyle={{ backgroundColor: "var(--success)" }}
                            />
                        </div>

                    </div>
                </div>
            </div>
            <div>
                <SectionMetaList data={data} />
            </div>
        </div>
    );
};

export default ReportPage;
