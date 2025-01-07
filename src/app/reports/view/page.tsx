'use client';

import React, { useEffect, useState } from 'react';
import { fetchReportsByIds } from '@/utils/report-utils'; // Update this path based on your project structure
import type { Report, Section } from '@wasm';
import { Button, Divider } from "antd";
import "@/styles/globals.css";
import { useWasm } from "@/components/WasmProvider";
import SectionMetaList from './section-meta-list';
import { useSearchParams, } from 'next/navigation'; // Import useSearchParams
import ReportSectionSelector from './report-section-selector'; // Import new helper component
import ReportCreatedOn from './created-on'; // Import new component
import { fetchSectionsByIds } from '@/utils/sections-utils';
import { ArrowRightOutlined, SaveOutlined } from "@ant-design/icons"
import FilterBar from './filter-bar';
import RequirementGroups from './show-requirement-group';
import RadarChart from './sections-radar-chart';
import Typography from '@/components/typography';
import TreeMap from './tree-view-report';
import TreeCanvas from "./tree-view"

const ReportPage = () => {
    const { wasmModule, isLoading: wasmLoading } = useWasm(); // Check if WASM is loading

    const searchParams = useSearchParams(); // Access query parameters
    const selectedReportsIds = searchParams.get('selectedReports')?.split(",").map(report => decodeURIComponent(report)) || [];

    const [reports, setReports] = useState<Report[]>([]);  // Store all selected reports
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sections, setSections] = useState<Section[]>([]);

    const [sectionListData, setSectionListData] = useState<{ compliance_rating: number, title: string, section_id: string }[]>([])

    useEffect(() => {
        const fetchReportsAndSections = async () => {
            setLoading(true);

            if (!wasmModule) {
                setError("WASM module not loaded");
                setLoading(false);
                return;
            }

            try {
                // Fetch selected reports
                const { reports: fetchedReports, errors } = await fetchReportsByIds(wasmModule, selectedReportsIds);

                if (Object.keys(errors).length > 0) {
                    console.error("Errors fetching reports:", errors);
                    setError("Some reports could not be fetched.");
                    return;
                }

                setReports(fetchedReports);

                // Extract unique section IDs
                const sectionIds = Array.from(
                    new Set(
                        fetchedReports
                            .flatMap((report) =>
                                report.section_assessments
                                    .map((assessment) => assessment.section_id)
                            )
                            .filter((id): id is string => Boolean(id))
                    )
                );

                // Fetch sections by IDs
                const { sections: fetchedSections, error: sectionError } = await fetchSectionsByIds(wasmModule, sectionIds);

                if (sectionError) {
                    console.error("Error fetching sections:", sectionError);
                } else {
                    setError(null)
                    setSections(fetchedSections);
                }
            } catch (err) {
                console.error("Error fetching reports and sections:", err);
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        if (selectedReportsIds.length > 0) {
            fetchReportsAndSections();
        }
    }, [wasmModule]);

    console.log("reports", reports)

    useEffect(() => {
        const sectionMetaData = sections.map(section => {
            const relatedAssessments = reports
                .flatMap(report => report.section_assessments)
                .filter(assessment => assessment.section_id === section.id);

            const averageComplianceRating =
                relatedAssessments.reduce((sum, assessment) => sum + (assessment.compliance_rating || 0), 0) /
                (relatedAssessments.length || 1);

            return {
                title: section.name,
                compliance_rating: Math.round(averageComplianceRating),
                section_id: section.id
            };
        });

        setSectionListData(sectionMetaData)

    }, [sections])

    if (loading || wasmLoading) {
        return <div className="w-full h-full bg-red-500">loadingtbr</div>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!reports.length) {
        return <p>No reports found for selected IDs: {selectedReportsIds.join(", ")}</p>;
    }

    console.log("sectionssss", sectionListData)
    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <div className="space-y-4">
                        <ReportSectionSelector reports={reports} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button icon={<SaveOutlined />}>Save view</Button>
                    <Button iconPosition='end' icon={<ArrowRightOutlined />} type="primary">Go to implementation</Button>
                </div>
            </div>
            <Divider className="border-thin mt-2 mb-2" />
            <div className="flex justify-between items-center">

                <div className="flex justify-between w-full">

                    <ReportCreatedOn reports={reports} />
                    <div className="flex items-center gap-4">
                        <FilterBar reports={reports} />
                    </div>
                </div>
            </div>
            <div className="w-1/2 mt-2 mb-4">
                <Typography> Section assessments </Typography>
                <RadarChart sectionListData={sectionListData} />
            </div>
            {/* <div>
                <SectionMetaList data={sectionListData} />
            </div> */}
            {/* <RequirementGroups /> */}
            {/* <TreeMap reports={reports} sectionListData={sectionListData} /> */}
            <TreeCanvas />
        </div>
    );
};

export default ReportPage;
