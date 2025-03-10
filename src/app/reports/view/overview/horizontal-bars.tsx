'use client';

import React, { useEffect, useState } from 'react';
import { Progress, Tooltip } from 'antd';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';

type DisplayDataItem = {
    label: string;
    rating: number | undefined;
    id: { sectionId: string; reportId: string };
};

const ComplianceBarChart: React.FC = () => {
    const { filteredSelectedReports, loading } = useReportsContext();
    const { filteredSelectedReportsSections, loading: sectionsLoading } = useSectionsContext();
    const [hoveredSection, setHoveredSection] = useState<{ sectionId: string; reportId: string } | null>(null);
    const [sortedDisplay, setSortedDisplay] = useState<DisplayDataItem[]>([]);

    useEffect(() => {
        if (!filteredSelectedReportsSections || sectionsLoading) return;

        const displayData: DisplayDataItem[] = [];

        filteredSelectedReports.forEach((report) => {
            if (report.section_assessments) {
                Array.from(report.section_assessments).forEach(([sectionId, section]) => {
                    displayData.push({
                        label: filteredSelectedReportsSections.find((s) => s.id === sectionId)?.name || '',
                        rating: section.compliance_rating,
                        id: { reportId: report.id, sectionId: sectionId },
                    });
                });
            }
        });

        setSortedDisplay(
            displayData.sort((a, b) => {
                if (a.rating === undefined) return 1;
                if (b.rating === undefined) return -1;
                return a.rating - b.rating;
            })
        );

    }, [filteredSelectedReports, filteredSelectedReportsSections, sectionsLoading]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {sortedDisplay.map((section) => (
                <div
                    key={`${section.id.reportId}-${section.id.sectionId}`}
                    onMouseEnter={() => setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                    className="mb-1"
                >
                    <div className="text-xs text-gray-600">
                        {section.label}
                    </div>
                    <div>

                        <Progress
                            percent={section.rating}
                            showInfo
                            className={`transition duration-500 ease-out ${hoveredSection
                                && hoveredSection.sectionId
                                && (hoveredSection.sectionId !== section.id.sectionId
                                    || hoveredSection.reportId !== section.id.reportId) ? 'opacity-30' : ''}`}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ComplianceBarChart;
