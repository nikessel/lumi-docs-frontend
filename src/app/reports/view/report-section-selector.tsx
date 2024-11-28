import React, { useState, useEffect } from 'react';
import { Dropdown, Menu, Checkbox } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { Report } from '@wasm';
import Typography from "@/components/typography";
import { useSearchParams, useRouter } from 'next/navigation';

interface ReportSectionSelectorProps {
    reports?: Report[];
}

const ReportSectionSelector: React.FC<ReportSectionSelectorProps> = ({ reports }) => {
    const [selectedSections, setSelectedSections] = useState<any[]>([]);
    const [menuVisible, setMenuVisible] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Update selectedSections from the URL query param
    useEffect(() => {
        const selectedSectionsFromUrl = searchParams.get('selectedSections')?.split(",") || [];
        setSelectedSections(selectedSectionsFromUrl);
    }, [searchParams]);

    const updateUrlWithSelectedSections = (newSelectedSections: string[]) => {
        const updatedSearchParams = new URLSearchParams(window.location.search);
        updatedSearchParams.set('selectedSections', newSelectedSections.join(','));

        // Use history.replaceState to update the URL without pushing a new history entry
        window.history.replaceState(
            { path: updatedSearchParams.toString() }, // state object (can be used for more advanced tracking)
            '', // title (not used here)
            `${window.location.pathname}?${updatedSearchParams.toString()}`
        );
    };

    // Handle section selection
    const handleSectionChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        sectionId: string,
        checked: boolean
    ) => {
        e.stopPropagation(); // Prevent dropdown from closing
        const newSelectedSections = checked
            ? [...selectedSections, sectionId]
            : selectedSections.filter((id) => id !== sectionId);

        setSelectedSections(newSelectedSections);
        updateUrlWithSelectedSections(newSelectedSections); // Update the URL with new selections
    };

    // Render the dropdown menu for each report
    const renderMenu = () => {
        if (reports) {
            return (
                <Menu>
                    {reports.map((r) => (
                        <Menu.SubMenu key={r.id} title={r.title}>
                            {r.section_assessments?.map((section) => {
                                const sectionId = section.section_id; // Save the section_id to a variable
                                if (sectionId) {
                                    return (
                                        <Menu.Item key={`${r.id}-${sectionId}`} onClick={(e: any) => e.stopPropagation()}>
                                            <label>
                                                <Checkbox
                                                    checked={selectedSections.includes(sectionId)}
                                                    onChange={(e: any) =>
                                                        handleSectionChange(e, sectionId, e.target.checked)
                                                    }
                                                >
                                                    <Typography>{sectionId}</Typography>
                                                </Checkbox>
                                            </label>
                                        </Menu.Item>
                                    );
                                }
                                return null;
                            })}
                        </Menu.SubMenu>
                    ))}
                </Menu>
            );
        }
        return null;
    };

    const reportCount = reports ? reports.length : 0;
    const sectionCount = selectedSections.length;

    return (
        <div>
            {reports && reports.length === 1 ? (
                <Dropdown
                    overlay={renderMenu() || <div></div>}
                    trigger={['click']}
                    open={menuVisible}
                    onOpenChange={(visible) => setMenuVisible(visible)}
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <Typography textSize="h5">
                            {reports[0].title} <DownOutlined />
                        </Typography>
                    </a>
                </Dropdown>
            ) : (
                <Dropdown
                    overlay={renderMenu() || <div></div>}
                    trigger={['click']}
                    open={menuVisible}
                    onOpenChange={(visible) => setMenuVisible(visible)}
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
