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

const { Search } = Input;
const { Text } = Typography;

const ToolBar: React.FC = () => {
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
                        value={params.searchQuery}
                        onChange={(e) => setParams({ searchQuery: e.target.value })}
                        className="w-full"
                    />
                </div>
            )
        },
        {
            key: 'reports',
            component: (
                <div className="w-40">
                    <Select
                        size="small"
                        mode="multiple"
                        placeholder="Reports"
                        value={params.selectedReports}
                        onChange={(value) => setParams({ selectedReports: value })}
                        options={reports.map(report => ({
                            label: report.id,
                            value: report.id
                        }))}
                        className="w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-multiple]:!h-8 [&_.ant-select-selection-item]:!h-5 [&_.ant-select-selection-item-content]:!h-5 [&_.ant-select-selection-item-remove]:!h-5 [&_.ant-select-selection-item-remove]:!w-5"
                        maxTagCount={0}
                        maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
                    />
                </div>
            )
        },
        {
            key: 'sections',
            component: (
                <div className="w-40">
                    <Select
                        size="small"
                        mode="multiple"
                        placeholder="Sections"
                        value={params.selectedSections}
                        onChange={(value) => setParams({ selectedSections: value })}
                        options={sections.map(section => ({
                            label: section,
                            value: section
                        }))}
                        className="w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-multiple]:!h-8 [&_.ant-select-selection-item]:!h-5 [&_.ant-select-selection-item-content]:!h-5 [&_.ant-select-selection-item-remove]:!h-5 [&_.ant-select-selection-item-remove]:!w-5"
                        maxTagCount={0}
                        maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
                    />
                </div>
            )
        },
        {
            key: 'groups',
            component: (
                <div className="w-40">
                    <Select
                        size="small"
                        mode="multiple"
                        placeholder="Groups"
                        value={params.selectedGroups}
                        onChange={(value) => setParams({ selectedGroups: value })}
                        options={groups.map(group => ({
                            label: group,
                            value: group
                        }))}
                        className="w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-multiple]:!h-8 [&_.ant-select-selection-item]:!h-5 [&_.ant-select-selection-item-content]:!h-5 [&_.ant-select-selection-item-remove]:!h-5 [&_.ant-select-selection-item-remove]:!w-5"
                        maxTagCount={1}
                        maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
                    />
                </div>
            )
        },
        {
            key: 'sorting',
            component: (
                <div className="flex items-center gap-2">
                    <Select
                        size="small"
                        placeholder="Sort"
                        value={params.sorting}
                        onChange={(value) => setParams({ sorting: value })}
                        options={[
                            { label: 'Ascending', value: 'asc' },
                            { label: 'Descending', value: 'desc' }
                        ]}
                        className="w-24"
                    />
                    <Switch
                        size="small"
                        checked={params.sortByGroup}
                        onChange={(checked) => setParams({ sortByGroup: checked })}
                    />
                    <Switch
                        size="small"
                        checked={params.sortBySection}
                        onChange={(checked) => setParams({ sortBySection: checked })}
                    />
                </div>
            )
        }
    ];

    // Function to check which items can fit in the toolbar
    const updateVisibleItems = () => {
        if (!toolbarRef.current) return;

        const toolbarWidth = toolbarRef.current.clientWidth;
        let currentWidth = 0;
        const visible: string[] = [];
        const overflow: string[] = [];

        // Reserve space for the overflow button
        const overflowButtonWidth = 40; // Approximate width for the overflow button
        const availableWidth = toolbarWidth - overflowButtonWidth;

        toolbarItems.forEach(item => {
            // Approximate widths for different types of items
            let itemWidth = 0;
            switch (item.key) {
                case 'search':
                    itemWidth = 200; // Search input
                    break;
                case 'reports':
                case 'sections':
                case 'groups':
                    itemWidth = 160; // Select components
                    break;
                case 'sorting':
                    itemWidth = 180; // Sorting controls
                    break;
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