'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchReportById } from '@/utils/report-utils'; // Update this path based on your project structure
import type { Report } from '@wasm';
import Typography from "@/components/typography";
import { Button, Divider, Select, Progress, Slider } from "antd";
import "@/styles/globals.css";
import { useWasm } from "@/components/WasmProvider";
import { formatRegulatoryFramework } from '@/utils/helpers';
import SectionCard from './sections-selector';
import SectionMetaList from './section-meta-list';
import { fetchCategories } from '@/utils/sections-utils';

const { Option } = Select;

const ReportPage = () => {
    const { wasmModule } = useWasm();
    const { reportId } = useParams() as { reportId: string }; // Ensure `reportId` is treated as a string
    const [report, setReport] = useState<Report | null>(null);
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

    console.log("!!", report)

    useEffect(() => {
        const fetchReport = async () => {
            if (!reportId) return;

            setLoading(true);
            const { report, error } = await fetchReportById(wasmModule, reportId); // Pass your wasmModule if necessary
            if (error) {
                setError(error);
            } else {
                setReport(report);
            }
            setLoading(false);
        };

        fetchReport();

        const getCategoriesTest = async () => {
            console.log("RUNNING GET CATEGORIES")
            const res = await fetchCategories(wasmModule)
            console.log("?????", res)
        }
        getCategoriesTest()
    }, [reportId]);

    const handleViewChange = (value: string) => {
        setView(value);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!report) {
        return <p>No report found for ID: {reportId}</p>;
    }

    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <Typography textSize="h4">{report.title}</Typography>
                    <Button type="link">{formatRegulatoryFramework(report.regulatory_framework)}</Button>
                    <div className="w-72 flex items-center">
                        <Progress percent={report.compliance_rating} size="small" format={(percent) => `${percent}% Compliance`} />
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
                <Typography color="secondary">
                    Created On: {new Date(report.created_date).toLocaleDateString()}
                </Typography>
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
            <div>
                <SectionMetaList data={data} />
            </div>
        </div>
    );
};

export default ReportPage;
