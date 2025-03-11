import React from 'react';
import { Button, Tooltip } from 'antd';
import { DownOutlined, UpOutlined, RightOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { useStyle, getTextSizeClass, getPaddingClass } from '@/contexts/style-context';

interface GroupSorterProps {
    onToggleAll: () => void;
    onSortByCompliance: () => void;
    onSortByReference: () => void;
    isAllExpanded: boolean;
    complianceSortDirection: 'asc' | 'desc' | null;
    referenceSortActive: boolean;
}

const GroupSorter: React.FC<GroupSorterProps> = ({
    onToggleAll,
    onSortByCompliance,
    onSortByReference,
    isAllExpanded,
    complianceSortDirection,
    referenceSortActive
}) => {
    const { fontSize } = useStyle();
    const textSizeClass = getTextSizeClass(fontSize);
    const paddingClass = getPaddingClass(fontSize);

    // Get button size based on font size
    const getButtonSize = () => {
        switch (fontSize) {
            case 'xs':
                return 'small';
            case 'normal':
                return 'middle';
            case 'large':
                return 'large';
            default:
                return 'middle';
        }
    };

    // Get icon size class based on font size
    const getIconSizeClass = () => {
        switch (fontSize) {
            case 'xs':
                return 'text-xs';
            case 'normal':
                return 'text-sm';
            case 'large':
                return 'text-base';
            default:
                return 'text-sm';
        }
    };

    const iconSizeClass = getIconSizeClass();
    const buttonSize = getButtonSize();

    return (
        <div className={`flex items-center border-b pl-1`}>
            {/* Expand/Collapse All - aligned with group arrows */}
            <div className="flex items-center">
                <Tooltip title={isAllExpanded ? "Collapse all" : "Expand all"}>
                    <Button
                        type="text"
                        size={buttonSize}
                        icon={<RightOutlined className={`transition-transform ${isAllExpanded ? 'rotate-90' : ''} ${iconSizeClass}`} />}
                        onClick={onToggleAll}
                        className={textSizeClass}
                    />
                </Tooltip>
            </div>

            {/* Sort by Compliance - aligned with progress bars */}
            <div className="flex items-center ml-[48px]">
                <Tooltip title="Sort by compliance">
                    <Button
                        type="text"
                        size={buttonSize}
                        icon={
                            complianceSortDirection === 'asc' ? (
                                <SortAscendingOutlined className={iconSizeClass} />
                            ) : complianceSortDirection === 'desc' ? (
                                <SortDescendingOutlined className={iconSizeClass} />
                            ) : (
                                <SortDescendingOutlined className={`${iconSizeClass}`} />
                            )
                        }
                        onClick={onSortByCompliance}
                        className={`${textSizeClass} ${complianceSortDirection ? 'text-blue-600' : ''}`}
                    />
                </Tooltip>
            </div>

            {/* Flex spacer to push reference sort to the right */}
            <div className="flex-grow" />

            {/* Sort by Reference - aligned with reference tags */}
            <div className="flex items-center pr-3">
                <Tooltip title="Sort by reference">
                    <Button
                        type="text"
                        size={buttonSize}
                        onClick={onSortByReference}
                        className={`${textSizeClass} ${referenceSortActive ? 'text-blue-600' : ''}`}
                    >
                        Ref
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};

export default GroupSorter; 