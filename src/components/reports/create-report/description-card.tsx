import React, { useState, useEffect } from "react";
import {
    Card,
    Typography,
    Spin,
    Input,
    Select,
    Radio,
    Button,
    Checkbox,
    Tag
} from "antd";
import { ReloadOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import * as Enums from "@wasm";
import type {
    DeviceDescription,
    TrialDescription,
    CompanyDescription,
    Company
} from "@wasm";
import Image from "next/image";
import DescriptionCardSkeleton from "./description-card-skeleton";
import { enumMap } from "@/enumMap";
import { FIELD_TO_ENUM_TYPE } from "@/fieldToEnumMap";

const MULTI_SELECT_FIELDS = [
    "quality_management_system_maturity",
    "software_lifecycle_phase",
    "development_lifecycle_phase",
    "lifecycle_phase"
];

type DescriptionType = DeviceDescription | TrialDescription | CompanyDescription | Company;

interface DescriptionCardProps {
    description: DescriptionType | null;
    title: string;
    applicableFieldPaths?: Map<string, string[]>;
    rootKey: 'device' | 'company' | 'trial';
    setHighlightChanges: (highlightChanges: boolean) => void;
    isLoading?: boolean;
    onDescriptionChange?: (newDescription: DescriptionType) => void;
}

const StringArrayInput: React.FC<{
    value: string[];
    onChange: (value: string[]) => void;
}> = ({ value = [], onChange }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (inputValue.trim()) {
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemove = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="mt-2 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {value.map((item, index) => (
                    <Tag
                        key={index}
                        closable
                        onClose={() => handleRemove(index)}
                        closeIcon={<CloseOutlined className="text-xs" />}
                        className="flex items-center gap-1"
                    >
                        {item}
                    </Tag>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add new item"
                    style={{ width: 'auto', minWidth: '150px' }}
                />
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="small"
                />
            </div>
        </div>
    );
};

const DescriptionCard: React.FC<DescriptionCardProps> = ({
    description,
    title,
    applicableFieldPaths,
    isLoading = false,
    onDescriptionChange,
    rootKey,
    setHighlightChanges
}) => {
    const [analysisMode, setAnalysisMode] = useState<'full' | 'affecting'>('affecting');
    const [initialDescription] = useState(description);

    useEffect(() => {
        if (!initialDescription || !onDescriptionChange) return;

        const processObject = (obj: any, currentPath: string = '') => {
            if (!obj || typeof obj !== 'object') return;

            Object.entries(obj).forEach(([key, value]) => {
                const fieldPath = currentPath ? `${currentPath}.${key}` : key;

                // Check if this is a multi-select field
                const enumOptions = getEnumOptions(fieldPath);
                if (enumOptions?.length && MULTI_SELECT_FIELDS.includes(key)) {
                    const valuesUpTo = getValuesUpTo(String(value), enumOptions);
                    handleValueChange({ key, value, level: 0, enableHighlightChanges: false });
                } else if (typeof value === 'object' && value !== null) {
                    processObject(value, fieldPath);
                }
            });
        };

        processObject(initialDescription);
    }, [initialDescription]); // Only run when initialDescription changes

    const getEnumOptions = (fieldPath: string): string[] | undefined => {
        const qualifiedPath = `${rootKey}.${fieldPath}`;
        const enumType = FIELD_TO_ENUM_TYPE[qualifiedPath];
        if (!enumType) return undefined;
        const values = enumMap[enumType];
        return Array.isArray(values) ? values : undefined;
    };


    const getValuesUpTo = (value: string, options: string[]): string[] => {
        const index = options.indexOf(value);
        return index === -1 ? [value] : options.slice(0, index + 1);
    };

    const formatKey = (key: string) =>
        key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const formatValue = (value: string) =>
        value.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const isFieldApplicable = (key: string) => {
        if (analysisMode === 'full') return true;
        if (!applicableFieldPaths) return true;
        return Array.from(applicableFieldPaths.values()).some(paths =>
            paths.some(path => path.includes(key))
        );
    };

    const handleValueChange = ({
        key,
        value,
        level = 0,
        enableHighlightChanges = false
    }: {
        key: string;
        value: any;
        level?: number;
        enableHighlightChanges?: boolean;
    }) => {
        if (!onDescriptionChange) return;
        const updateNestedObject = (obj: any, path: string[], newValue: any): any => {
            if (path.length === 1) return { ...obj, [path[0]]: newValue };
            return {
                ...obj,
                [path[0]]: updateNestedObject(obj[path[0]], path.slice(1), newValue)
            };
        };

        const newDescription = { ...description };
        const path = key.split('.');
        const updatedDescription = updateNestedObject(newDescription, path, value);

        onDescriptionChange(updatedDescription);

        if (enableHighlightChanges) {
            setHighlightChanges(true);
        }
    };

    const handleReset = () => {
        if (onDescriptionChange && initialDescription) {
            onDescriptionChange(initialDescription);
        }
    };

    const renderField = (key: string, value: any, level: number = 0): React.ReactNode => {
        if (key === 'company_type' || !isFieldApplicable(key)) return null;

        const formattedKey = formatKey(key);
        const indent = level * 16;

        const renderValue = (val: any, currentLevel: number = 0, currentPath: string = key): React.ReactNode => {
            if (key.toLowerCase() === 'generation') {
                return (
                    <Select
                        value={val ? '1st' : 'Later'}
                        onChange={(value) => handleValueChange({ key: currentPath, value: value === '1st', level: currentLevel, enableHighlightChanges: true })}
                        style={{ width: 'auto', minWidth: '150px' }}
                        options={[{ value: '1st', label: '1st' }, { value: 'Later', label: 'Later' }]}
                    />
                );
            }

            if (typeof val === 'object' && val !== null) {
                if (Array.isArray(val)) {
                    const enumOptions = getEnumOptions(currentPath);
                    const isMultiSelect = MULTI_SELECT_FIELDS.includes(currentPath.split('.').pop() || '');

                    if (enumOptions?.length && isMultiSelect) {
                        return (
                            <Checkbox.Group
                                value={val}
                                onChange={(value) => handleValueChange({ key: currentPath, value, level: currentLevel, enableHighlightChanges: true })}
                                style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                            >
                                {enumOptions.map(option => (
                                    <Checkbox key={option} value={option}>{formatValue(option)}</Checkbox>
                                ))}
                            </Checkbox.Group>
                        );
                    }

                    // Handle array of strings
                    if (val.every(item => typeof item === 'string')) {
                        return (
                            <StringArrayInput
                                value={val}
                                onChange={(newValue) => handleValueChange({ key: currentPath, value: newValue, level: currentLevel, enableHighlightChanges: true })}
                            />
                        );
                    }

                    return val.map((item, index) => renderValue(item, currentLevel, `${currentPath}[${index}]`));
                }

                return (
                    <div style={{ marginLeft: `${currentLevel * 16}px` }}>
                        {Object.entries(val).map(([k, v]) => {
                            if (k === 'company_type' || !isFieldApplicable(k)) return null;
                            const newPath = `${currentPath}.${k}`;
                            const fieldName = k;
                            const enumOptions = getEnumOptions(newPath);
                            const isSelectField = enumOptions?.length && !MULTI_SELECT_FIELDS.includes(fieldName);
                            const isSmallInputField = typeof v === 'string' && v.length <= 30;
                            const isCheckboxField = enumOptions?.length && MULTI_SELECT_FIELDS.includes(fieldName);

                            return (
                                <div key={k} className="mb-2">
                                    {isCheckboxField ? (
                                        <div className="flex flex-col gap-2">
                                            <Typography.Text type="secondary">{formatKey(k)}:</Typography.Text>
                                            {renderValue(v, currentLevel + 1, newPath)}
                                        </div>
                                    ) : (isSelectField || isSmallInputField) ? (
                                        <div className="flex items-center justify-between gap-2">
                                            <Typography.Text type="secondary">{formatKey(k)}:</Typography.Text>
                                            {renderValue(v, currentLevel + 1, newPath)}
                                        </div>
                                    ) : (
                                        <>
                                            <Typography.Text type="secondary">{formatKey(k)}:</Typography.Text>
                                            {renderValue(v, currentLevel + 1, newPath)}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            }

            const fieldName = currentPath.split('.').pop() || currentPath;
            const enumOptions = getEnumOptions(currentPath);
            const isMultiSelect = MULTI_SELECT_FIELDS.includes(fieldName);
            const currentValue = isMultiSelect && enumOptions ? (Array.isArray(val) ? val : getValuesUpTo(val, enumOptions)) : val;

            if (enumOptions?.length) {
                if (isMultiSelect) {
                    return (
                        <Checkbox.Group
                            value={currentValue}
                            onChange={(value) => handleValueChange({ key: currentPath, value, level: currentLevel, enableHighlightChanges: true })}
                            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                        >
                            {enumOptions.map(option => (
                                <Checkbox key={option} value={option}>{formatValue(option)}</Checkbox>
                            ))}
                        </Checkbox.Group>
                    );
                }

                return (
                    <Select
                        value={currentValue}
                        onChange={(value) => handleValueChange({ key: currentPath, value, level: currentLevel, enableHighlightChanges: true })}
                        style={{ width: 'auto', minWidth: '150px' }}
                        options={enumOptions.map(option => ({ value: option, label: formatValue(option) }))}
                    />
                );
            }

            if (typeof val === 'string' && val.length > 30) {
                return (
                    <Input.TextArea
                        value={val}
                        onChange={(e) => handleValueChange({ key: currentPath, value: e.target.value, level: currentLevel, enableHighlightChanges: true })}
                        style={{ width: '100%', minHeight: '80px' }}
                        autoSize={{ minRows: 3 }}
                        className="mt-2"
                    />
                );
            }

            return (
                <Input
                    value={String(val)}
                    onChange={(e) => handleValueChange({ key: currentPath, value: e.target.value, level: currentLevel, enableHighlightChanges: true })}
                    style={{ width: 'auto', minWidth: '50px' }}
                />
            );
        };

        return (
            <div key={key} className="mb-2" style={{ marginLeft: `${indent}px` }}>
                <Typography.Text type="secondary" className="block mb-2">{formattedKey}:</Typography.Text>
                {renderValue(value, level + 1)}
            </div>
        );
    };

    if (isLoading) return <DescriptionCardSkeleton />;
    if (!description) return null;

    return (
        <Card
            title={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">{title}</div>
                    <div className="flex items-center gap-2">
                        <Button type="text" icon={<ReloadOutlined />} onClick={handleReset} title="Reset to initial values" />
                        {/* <Radio.Group
                            value={analysisMode}
                            onChange={(e) => setAnalysisMode(e.target.value)}
                            optionType="button"
                            buttonStyle="solid"
                            size="small"
                            style={{ fontSize: '10px', fontWeight: 'normal' }}
                        >
                            <Radio.Button value="full">Full Analysis</Radio.Button>
                            <Radio.Button value="affecting">Key Factors</Radio.Button>
                        </Radio.Group> */}
                    </div>
                </div>
            }
        >
            <div className="bg-[var(--bg-secondary)] text-[var(--primary)] mb-4 p-2 rounded-md text-xs font-normal flex items-center gap-2">
                <Image src="/assets/pngs/ai_blue.png" alt="AI" width={24} height={24} color="var(--primary)" />
                The information below is based on a review of all uploaded documents. Changing Key Factors will update the suggestions to the right.
            </div>
            {Object.entries(description).map(([key, value]) => renderField(key, value, 0))}
        </Card>
    );
};

export default DescriptionCard; 