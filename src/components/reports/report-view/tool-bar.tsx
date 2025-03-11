import React, { useState, useEffect, useRef } from 'react';
import { Input, Select, Switch, Space, Typography, Dropdown, Button } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { useUrlParams } from '@/hooks/url-hooks';
import { useReportsContext } from '@/contexts/reports-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { Report } from '@wasm';
import { RequirementWithGroupId } from '@/hooks/requirement-hooks';
import { RequirementGroupWithSectionId } from '@/hooks/requirement-group-hooks';
import { useStyle } from '@/contexts/style-context';
import FontSizeSelector from '@/components/reports/report-view/font-size-selector';
import DownloadPDFButton from './download-pdf-button';
import DownloadExcelButton from '@/components/reports/report-view/download-excel-button';

const { Search } = Input;
const { Text } = Typography;

interface ToolBarProps {
    selectedSections: Set<string>;
    selectedGroupId?: string;
}

const ToolBar: React.FC<ToolBarProps> = ({ selectedSections, selectedGroupId }) => {
    const { params, setParams } = useUrlParams();
    const { reports } = useReportsContext();
    const { requirementGroups } = useRequirementGroupsContext();
    const { requirements } = useRequirementsContext();
    const [visibleItems, setVisibleItems] = useState<string[]>([]);
    const [overflowItems, setOverflowItems] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Get unique sections and groups from the data
    const sections = Array.from(new Set((requirementGroups as RequirementGroupWithSectionId[]).map(group => group.section_id)));
    const groups = Array.from(new Set(requirementGroups.map(group => group.id)));

    // Define all toolbar items
    const toolbarItems = [
        {
            key: 'search',
            component: (
                <div className="w-48">
                    <Search
                        size="small"
                        placeholder="Search..."
                        defaultValue={params.searchQuery}
                        onChange={(e) => {
                            if (e.target.value === '') {
                                setParams({ searchQuery: '' });
                            }
                        }}
                        onSearch={(value) => setParams({ searchQuery: value })}
                        className="w-full"
                        allowClear
                    />
                </div>
            )
        },
        {
            key: 'fontSize',
            component: (
                <div className="w-28">
                    <FontSizeSelector />
                </div>
            )
        },
        {
            key: 'downloadPDF',
            component: (
                <DownloadPDFButton
                    selectedSections={selectedSections}
                    selectedGroupId={selectedGroupId}
                />
            )
        },
        {
            key: 'downloadExcel',
            component: (
                <DownloadExcelButton />
            )
        },
    ];

    // Function to check which items can fit in the toolbar
    const updateVisibleItems = () => {
        if (!toolbarRef.current) return;

        const toolbarWidth = toolbarRef.current.clientWidth;
        let currentWidth = 0;
        const visible: string[] = [];
        const overflow: string[] = [];

        // Reserve space for the overflow button
        const overflowButtonWidth = 40;
        const availableWidth = toolbarWidth - overflowButtonWidth;

        // Always show search and font size first
        const priorityItems = ['search', 'fontSize'];
        const remainingItems = toolbarItems.filter(item => !priorityItems.includes(item.key));

        // Add priority items first
        toolbarItems
            .filter(item => priorityItems.includes(item.key))
            .forEach(item => {
                let itemWidth = item.key === 'search' ? 200 : 112; // Font size selector width
                if (currentWidth + itemWidth < availableWidth) {
                    visible.push(item.key);
                    currentWidth += itemWidth;
                } else {
                    overflow.push(item.key);
                }
            });

        // Then add remaining items
        remainingItems.forEach(item => {
            let itemWidth = 0;
            switch (item.key) {
                case 'reports':
                case 'sections':
                case 'groups':
                    itemWidth = 160;
                    break;
                case 'sorting':
                    itemWidth = 180;
                    break;
                default:
                    itemWidth = 160;
            }

            if (currentWidth + itemWidth < availableWidth) {
                visible.push(item.key);
                currentWidth += itemWidth;
            } else {
                overflow.push(item.key);
            }
        });

        setVisibleItems(visible);
        setOverflowItems(overflow);
    };

    // Update visible items on mount and resize
    useEffect(() => {
        updateVisibleItems();
        window.addEventListener('resize', updateVisibleItems);
        return () => window.removeEventListener('resize', updateVisibleItems);
    }, []);

    const overflowMenu = {
        items: overflowItems.map(key => {
            const item = toolbarItems.find(i => i.key === key);
            return {
                key,
                label: (
                    <div onClick={(e) => e.stopPropagation()}>
                        {item?.component}
                    </div>
                )
            };
        })
    };

    return (
        <div ref={toolbarRef} className="toolbar-container flex items-center gap-2 h-full w-full">
            {visibleItems.map(key => {
                const item = toolbarItems.find(i => i.key === key);
                return item?.component;
            })}

            {overflowItems.length > 0 && (
                <Dropdown
                    menu={overflowMenu}
                    placement="bottomRight"
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                    trigger={['click']}
                >
                    <Button size="small" icon={<EllipsisOutlined />} />
                </Dropdown>
            )}
        </div>
    );
};

export default ToolBar; 