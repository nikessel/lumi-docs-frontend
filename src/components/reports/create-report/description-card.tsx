import React, { useState, useEffect } from "react";
import {
    Card,
    Typography,
    Input,
    Select,
    Button,
    Checkbox,
    Tag
} from "antd";
import { ReloadOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import type {
    DeviceDescription,
    TrialDescription,
    CompanyDescription,
    Company
} from "@wasm";
import Image from "next/image";
import DescriptionCardSkeleton from "./description-card-skeleton";
import { FIELD_TO_ENUM_TYPE } from "@/types/fieldToEnumMap";
import { enumMap, TypeName } from "@/types/constants";


const MULTI_SELECT_FIELDS = [
    "quality_management_system_maturity",
    "software_lifecycle_phase",
    "development_lifecycle_phase",
    "lifecycle_phase"
];

type DescriptionType = DeviceDescription | TrialDescription | CompanyDescription | Company;

interface DescriptionCardProps {
    description: DescriptionType[]; // now an array
    title: string;
    applicableFieldPaths?: Map<string, string[]>;
    rootKey: 'device' | 'company' | 'trial';
    setHighlightChanges: (highlightChanges: boolean) => void;
    isLoading?: boolean;
    onDescriptionChange?: (newDescriptions: DescriptionType[]) => void;
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
    const [resetCounter, setResetCounter] = useState(0);

    const [descriptions, setDescriptions] = useState<DescriptionType[]>(description);

    useEffect(() => {
        setDescriptions(description); // sync if prop changes
    }, [description]);

    useEffect(() => {
        if (!initialDescription || !onDescriptionChange) return;

        const processObject = (obj: any, currentPath: string = '') => {
            if (!obj || typeof obj !== 'object') return;

            Object.entries(obj).forEach(([key, value]) => {
                const fieldPath = currentPath ? `${currentPath}.${key}` : key;

                // Only process if the field is both applicable and should be rendered
                if (isFieldApplicable(fieldPath) && shouldRenderField(fieldPath)) {
                    const enumOptions = getEnumOptions(fieldPath);
                    if (enumOptions?.length && MULTI_SELECT_FIELDS.includes(key)) {
                        // Previously used only the current value
                        // ✅ Now select value and all values before it
                        const valuesUpTo = getValuesUpTo(String(value), enumOptions);

                        // Only pre-fill if the original was a string (not an array already)
                        if (typeof value === 'string') {
                            handleValueChange({
                                key: fieldPath,
                                value: valuesUpTo,
                                level: 0,
                                enableHighlightChanges: false,
                            });
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        processObject(value, fieldPath);
                    }
                }
            });
        };

        processObject(initialDescription[0]); // ✅ Use initialDescription[0] since it's an array now
    }, [initialDescription, resetCounter]);

    const getEnumOptions = (fieldPath: string): string[] | undefined => {
        const qualifiedPath = `${rootKey}.${fieldPath}`;
        const enumType = FIELD_TO_ENUM_TYPE[qualifiedPath] as TypeName;
        if (!enumType) return undefined;

        const values = enumMap[enumType];
        return values ? [...values] : undefined;
    };


    const getValuesUpTo = (value: string, options: string[]): string[] => {
        const index = options.indexOf(value);
        return index === -1 ? [value] : options.slice(0, index + 1);
    };

    const formatKey = (key: string) =>
        key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const formatValue = (value: string) =>
        value.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const isFieldApplicable = (fieldPath: string): boolean => {
        if (analysisMode === 'full') return true;
        if (!applicableFieldPaths) return true;

        const subPaths = applicableFieldPaths.get(rootKey) || [];

        // A field is applicable if:
        // - it is directly included, OR
        // - one of its children is included (e.g. product_portfolio.includes_xyz)
        const isApplicable = subPaths.some(path =>
            path === fieldPath || path.startsWith(fieldPath + '.')
        );

        console.log(`🧠[isFieldApplicable] Checking "${fieldPath}" against:`, subPaths);
        console.log(`🧠[isFieldApplicable] Result for "${fieldPath}":`, isApplicable);

        return isApplicable;
    };

    const shouldRenderField = (fullPath: string): boolean => {
        if (analysisMode === 'full') return true;
        if (!applicableFieldPaths) return true;

        const subPaths = applicableFieldPaths.get(rootKey) || [];

        // Only render this specific field if it or its children are in the applicable list
        return subPaths.some(p => p === fullPath || p.startsWith(fullPath + '.'));
    };


    console.log("TEETETETETETET", applicableFieldPaths)

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
        const fieldName = key.split('.').pop() || '';
        const isMultiSelectField = MULTI_SELECT_FIELDS.includes(fieldName);

        let updatedDescriptions: DescriptionType[] = [];

        if (isMultiSelectField && Array.isArray(value)) {
            updatedDescriptions = value.map((option, i) => {
                const updated = updateNestedField(descriptions[0], key.split('.'), option);
                return updated;
            });
        } else {
            updatedDescriptions = descriptions.map((desc, i) => {
                const updated = updateNestedField(desc, key.split('.'), value);
                return updated;
            });
        }

        const flattenedDescriptions = updatedDescriptions.flat();

        setDescriptions(flattenedDescriptions);

        if (onDescriptionChange) {
            console.log('🧠[updateDescriptions] calling onDescriptionChange');
            onDescriptionChange(flattenedDescriptions);
        }

        if (enableHighlightChanges) {
            setHighlightChanges(true);
        }
    };

    const updateNestedField = (obj: DescriptionType, path: string[], newValue: any): DescriptionType => {
        const updated = JSON.parse(JSON.stringify(obj)); // deep copy
        let current = updated;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = newValue;
        return updated;
    };


    const handleReset = () => {
        if (onDescriptionChange && initialDescription) {
            setDescriptions(initialDescription);
            setResetCounter(prev => prev + 1);
        }
    };

    const renderField = (key: string, value: any, level: number = 0): React.ReactNode => {
        const fullPath = key; // top-level keys like "process_scope"
        if (key === 'company_type' || !isFieldApplicable(fullPath)) return null;

        const formattedKey = formatKey(key);
        const indent = level * 16;

        const renderValue = (val: any, currentLevel: number = 0, currentPath: string = key): React.ReactNode => {
            const fieldName = currentPath.split('.').pop() || currentPath;
            const enumOptions = getEnumOptions(currentPath);
            const isMultiSelect = MULTI_SELECT_FIELDS.includes(fieldName);

            // 🔹 1. Get value(s) from all descriptions
            const getMergedValues = (): any => {
                const values = descriptions.map(desc => {
                    let current = desc as any;
                    for (const part of currentPath.split('.')) {
                        current = current?.[part];
                    }
                    return current;
                });
                return isMultiSelect ? Array.from(new Set(values.flat())) : values[0];
            };

            const mergedValue = getMergedValues();

            // 🔹 2. If the value is a nested object
            if (typeof mergedValue === 'object' && !Array.isArray(mergedValue) && mergedValue !== null) {
                return (
                    <div style={{ marginLeft: `${currentLevel * 16}px` }}>
                        {Object.entries(mergedValue)
                            .filter(([k, _]) => shouldRenderField(`${currentPath}.${k}`))
                            .map(([k, v]) => {
                                const newPath = `${currentPath}.${k}`;
                                const enumOptions = getEnumOptions(newPath);
                                const isSelectField = enumOptions?.length && !MULTI_SELECT_FIELDS.includes(k);

                                return (
                                    <div key={newPath} className={`mb-2 ${isSelectField ? 'flex items-center justify-between' : ''}`}>
                                        <Typography.Text type="secondary">{formatKey(k)}:</Typography.Text>
                                        {renderValue(v, currentLevel + 1, newPath)}
                                    </div>
                                );
                            })}
                    </div>
                );
            }

            // 🔹 3. If enum with multi-select (Checkbox.Group)
            if (enumOptions?.length && isMultiSelect) {
                return (
                    <Checkbox.Group
                        value={mergedValue}
                        onChange={(value) =>
                            handleValueChange({ key: currentPath, value, level: currentLevel, enableHighlightChanges: true })
                        }
                        style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                    >
                        {enumOptions.map(option => (
                            <Checkbox key={option} value={option}>{formatValue(option)}</Checkbox>
                        ))}
                    </Checkbox.Group>
                );
            }

            // 🔹 4. If enum with single select
            if (enumOptions?.length) {
                return (
                    <Select
                        value={mergedValue}
                        onChange={(value) =>
                            handleValueChange({ key: currentPath, value, level: currentLevel, enableHighlightChanges: true })
                        }
                        style={{
                            width: 'auto',
                            minWidth: '150px',
                            ...(currentLevel > 0 ? { marginLeft: 'auto' } : {})
                        }}
                        options={enumOptions.map(option => ({
                            value: option,
                            label: formatValue(option),
                        }))}
                    />
                );
            }

            // 🔹 5. If it's a long text
            if (typeof mergedValue === 'string' && mergedValue.length > 30) {
                return (
                    <Input.TextArea
                        value={mergedValue}
                        onChange={(e) =>
                            handleValueChange({ key: currentPath, value: e.target.value, level: currentLevel, enableHighlightChanges: true })
                        }
                        style={{ width: '100%', minHeight: '80px' }}
                        autoSize={{ minRows: 3 }}
                        className="mt-2"
                    />
                );
            }

            // 🔹 6. Default case (simple input)
            return (
                <Input
                    value={String(mergedValue ?? '')}
                    onChange={(e) =>
                        handleValueChange({ key: currentPath, value: e.target.value, level: currentLevel, enableHighlightChanges: true })
                    }
                    style={{ width: 'auto', minWidth: '50px' }}
                />
            );
        };


        return (
            <div key={key} className="mb-2" style={{ marginLeft: `${indent}px` }}>
                {level === 0 ? (
                    <>
                        <Typography.Text type="secondary" className="block mb-2">{formattedKey}:</Typography.Text>
                        {renderValue(value, level + 1)}
                    </>
                ) : (
                    <div className="flex items-center justify-between">
                        <Typography.Text type="secondary" className="block mb-2">{formattedKey}:</Typography.Text>
                        {renderValue(value, level + 1)}
                    </div>
                )}
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
            {descriptions.length > 0 && descriptions[0] && Object.entries(descriptions[0]).map(([key, value]) => renderField(key, value, 0))}
        </Card>
    );
};

export default DescriptionCard; 