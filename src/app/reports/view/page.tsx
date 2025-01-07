'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { fetchReportsByIds } from '@/utils/report-utils';
import type { Report as WasmReport, Section, SectionAssessment as WasmSectionAssessment } from '@wasm';
import { Button, Divider } from "antd";
import "@/styles/globals.css";
import { useWasm } from "@/components/WasmProvider";
import { useSearchParams } from 'next/navigation';
import ReportSectionSelector from './report-section-selector';
import ReportCreatedOn from './created-on';
import { fetchSectionsByIds } from '@/utils/sections-utils';
import { ArrowRightOutlined, SaveOutlined } from "@ant-design/icons";
import FilterBar from './filter-bar';
import RadarChart from './sections-radar-chart';
import Typography from '@/components/typography';
import TreeCanvas from "./tree-view";

// Extend WASM types for component use
interface ComponentSectionAssessment extends WasmSectionAssessment {
  section_id: string;
}

interface ComponentReport extends Omit<WasmReport, 'section_assessments'> {
  section_assessments: Map<string, ComponentSectionAssessment>;
}

interface SectionListData {
  compliance_rating: number;
  title: string;
  section_id: string;
}

interface ReportAdapterProps {
  wasmReports: WasmReport[];
  children: (adaptedReports: ComponentReport[]) => React.ReactNode;
}

const ReportAdapter: React.FC<ReportAdapterProps> = ({ wasmReports, children }) => {
  const adaptedReports = wasmReports.map(wasmReport => {
    const adaptedSectionAssessments = new Map(
      Array.from(wasmReport.section_assessments.entries()).map(([id, assessment]) => [
        id,
        {
          ...assessment,
          section_id: id
        } as ComponentSectionAssessment
      ])
    );

    return {
      ...wasmReport,
      section_assessments: adaptedSectionAssessments
    } as ComponentReport;
  });

  return <>{children(adaptedReports)}</>;
};

const ReportPage = () => {
    const { wasmModule, isLoading: wasmLoading } = useWasm();
    const searchParams = useSearchParams();
    const selectedReportsIds = useMemo(() => {
        const reportsParam = searchParams.get('selectedReports');
        return reportsParam ? reportsParam.split(",").map(report => decodeURIComponent(report)) : [];
    }, [searchParams]);

    const [reports, setReports] = useState<WasmReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [sectionListData, setSectionListData] = useState<SectionListData[]>([]);

    useEffect(() => {
        const fetchReportsAndSections = async () => {
            setLoading(true);

            if (!wasmModule) {
                setError("WASM module not loaded");
                setLoading(false);
                return;
            }

            try {
                const { reports: fetchedReports, errors } = await fetchReportsByIds(wasmModule, selectedReportsIds);

                if (Object.keys(errors).length > 0) {
                    console.error("Errors fetching reports:", errors);
                    setError("Some reports could not be fetched.");
                    return;
                }

                setReports(fetchedReports);

                // Extract unique section IDs from section_assessments
                const sectionIds = Array.from(
                    new Set(
                        fetchedReports.flatMap(report => 
                            Array.from(report.section_assessments.entries())
                                .map(([id]) => id)
                                .filter(Boolean)
                        )
                    )
                );

                const { sections: fetchedSections, error: sectionError } = await fetchSectionsByIds(wasmModule, sectionIds);

                if (sectionError) {
                    console.error("Error fetching sections:", sectionError);
                } else {
                    setError(null);
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
    }, [wasmModule, selectedReportsIds]);

    useEffect(() => {
        const sectionMetaData = sections.map(section => {
            const relatedAssessments = reports.flatMap(report => 
                Array.from(report.section_assessments.entries())
                    .filter(([id]) => id === section.id)
                    .map(([, assessment]) => assessment)
            );

            const averageComplianceRating =
                relatedAssessments.length > 0
                    ? relatedAssessments.reduce((sum, assessment) => sum + (assessment.compliance_rating || 0), 0) / relatedAssessments.length
                    : 0;

            return {
                title: section.name,
                compliance_rating: Math.round(averageComplianceRating),
                section_id: section.id
            };
        });

        setSectionListData(sectionMetaData);
    }, [sections, reports]);

    if (loading || wasmLoading) {
        return <div className="w-full h-full bg-red-500">loadingtbr</div>;
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
                        <ReportAdapter wasmReports={reports}>
                            {(adaptedReports) => (
                                <ReportSectionSelector reports={adaptedReports} />
                            )}
                        </ReportAdapter>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button icon={<SaveOutlined />}>Save view</Button>
                    <Button icon={<ArrowRightOutlined />} type="primary">Go to implementation</Button>
                </div>
            </div>
            <Divider className="border-thin mt-2 mb-2" />
            <div className="flex justify-between items-center">
                <div className="flex justify-between w-full">
                    <ReportAdapter wasmReports={reports}>
                        {(adaptedReports) => (
                            <ReportCreatedOn reports={adaptedReports} />
                        )}
                    </ReportAdapter>
                    <div className="flex items-center gap-4">
                        <ReportAdapter wasmReports={reports}>
                            {(adaptedReports) => (
                                <FilterBar reports={adaptedReports} />
                            )}
                        </ReportAdapter>
                    </div>
                </div>
            </div>
            <div className="w-1/2 mt-2 mb-4">
                <Typography>Section assessments</Typography>
                <RadarChart sectionListData={sectionListData} />
            </div>
            <TreeCanvas />
        </div>
    );
};

export default ReportPage;
