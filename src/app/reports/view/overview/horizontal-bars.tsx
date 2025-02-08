'use client';

import React, { useEffect, useState } from 'react';
import { Progress, Tooltip, Modal, Button } from 'antd';
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
    const [selectedSection, setSelectedSection] = useState<DisplayDataItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [queuedSection, setQueuedSection] = useState<DisplayDataItem | null>(null);

    useEffect(() => {
        if (queuedSection) {
            setSelectedSection(queuedSection);
            setIsModalOpen(true);
            setQueuedSection(null);
        }
    }, [queuedSection]);

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
                if (a.rating === undefined) return 1; // Move undefined to the bottom
                if (b.rating === undefined) return -1; // Move undefined to the bottom
                return a.rating - b.rating; // Normal numeric sorting
            })
        );

    }, [filteredSelectedReports, filteredSelectedReportsSections, sectionsLoading]);

    const handleColumnClick = (section: DisplayDataItem) => {
        setQueuedSection(section);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedSection(null);
    };

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
                    onClick={() => handleColumnClick(section)}
                >
                    <Tooltip
                        title={
                            hoveredSection &&
                                hoveredSection.sectionId === section.id.sectionId &&
                                hoveredSection.reportId === section.id.reportId
                                ? section.label
                                : undefined
                        }
                    >
                        <Progress
                            percent={section.rating}
                            showInfo
                            className={`cursor-pointer transition duration-500 ease-out ${hoveredSection
                                && hoveredSection.sectionId
                                && (hoveredSection.sectionId !== section.id.sectionId
                                    || hoveredSection.reportId !== section.id.reportId) ? 'opacity-30' : ''}`}
                        />
                    </Tooltip>
                </div>
            ))}

            <Modal
                title="Section Actions"
                visible={isModalOpen}
                onCancel={handleModalClose}
                footer={[
                    <Button key="filter" onClick={() => console.log(`Add to filters: ${selectedSection?.id.sectionId}`)}>
                        Add to Filters
                    </Button>,
                    <Button
                        key="view"
                        type="primary"
                        onClick={() => console.log(`View assessment for: ${selectedSection?.id.sectionId}`)}
                    >
                        View Assessment
                    </Button>,
                ]}
            >
                <p className="mt-4">
                    <strong>{selectedSection?.label}</strong> ({filteredSelectedReports.find((report) => report.id === selectedSection?.id.reportId)?.title})
                </p>
                <div className="my-4">
                    Compliance Rating
                    <Progress percent={selectedSection?.rating} showInfo={true} />
                </div>

            </Modal>
        </div>
    );
};

export default ComplianceBarChart;
