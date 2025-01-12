import React, { useState, useEffect } from 'react';
import { Dropdown, Checkbox } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Typography from "@/components/typography";
import { useSearchParams } from 'next/navigation';
import type { MenuProps } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Report } from '@wasm';

// Define interfaces for better type safety
interface SectionAssessment {
    section_id: string;
}


interface ReportSectionSelectorProps {
    reports?: Report[];
}

const ReportSectionSelector: React.FC<ReportSectionSelectorProps> = ({ reports }) => {
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const [menuVisible, setMenuVisible] = useState(false);

    const searchParams = useSearchParams();

    useEffect(() => {
        const selectedSectionsFromUrl = searchParams.get('selectedSections')?.split(",").filter(Boolean) || [];
        setSelectedSections(selectedSectionsFromUrl);
    }, [searchParams]);

    const updateUrlWithSelectedSections = (newSelectedSections: string[]) => {
        const updatedSearchParams = new URLSearchParams(window.location.search);
        updatedSearchParams.set('selectedSections', newSelectedSections.join(','));

        window.history.replaceState(
            { path: updatedSearchParams.toString() },
            '',
            `${window.location.pathname}?${updatedSearchParams.toString()}`
        );
    };

    const handleSectionChange = (
        e: CheckboxChangeEvent,
        sectionId: string
    ) => {
        e.stopPropagation();
        const newSelectedSections = e.target.checked
            ? [...selectedSections, sectionId]
            : selectedSections.filter((id) => id !== sectionId);

        setSelectedSections(newSelectedSections);
        updateUrlWithSelectedSections(newSelectedSections);
    };

    const getMenuItems = (): MenuProps['items'] => {
        if (!reports) return [];

        return reports.map((report) => ({
            key: report.id,
            label: report.title,
            children: Array.from(report.section_assessments.entries()).map(([, section]) => {
                const sectionId = "setoberemoved";
                if (!sectionId) return null;

                return {
                    key: `${report.id}-${sectionId}`,
                    label: (
                        <label>
                            <Checkbox
                                checked={selectedSections.includes(sectionId)}
                                onChange={(e) => handleSectionChange(e, sectionId)}
                            >
                                <Typography>{sectionId}</Typography>
                            </Checkbox>
                        </label>
                    )
                };
            }).filter((item): item is NonNullable<typeof item> => item !== null)
        }));
    };

    const reportCount = reports?.length ?? 0;
    const sectionCount = selectedSections.length;

    const menuProps: MenuProps = {
        items: getMenuItems()
    };

    return (
        <div>
            {reports && reports.length === 1 ? (
                <Dropdown
                    menu={menuProps}
                    trigger={['click']}
                    open={menuVisible}
                    onOpenChange={setMenuVisible}
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <Typography textSize="h5">
                            {reports[0].title} <DownOutlined />
                        </Typography>
                    </a>
                </Dropdown>
            ) : (
                <Dropdown
                    menu={menuProps}
                    trigger={['click']}
                    open={menuVisible}
                    onOpenChange={setMenuVisible}
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <Typography textSize="h5">
                            {reportCount} Reports, {sectionCount} Sections
                            <DownOutlined className="pl-3" />
                        </Typography>
                    </a>
                </Dropdown>
            )}
        </div>
    );
};

export default ReportSectionSelector;
