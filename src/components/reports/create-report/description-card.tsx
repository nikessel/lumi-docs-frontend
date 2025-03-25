import React, { useState, useEffect } from "react";
import { Card, Skeleton, Typography, Spin } from "antd";
import type { DeviceDescription, TrialDescription, CompanyDescription, Company } from "@wasm";
import { LoadingOutlined } from '@ant-design/icons';

type DescriptionType = DeviceDescription | TrialDescription | CompanyDescription | Company;

interface DescriptionCardProps {
    description: DescriptionType;
    title: string;
}

const DescriptionCard: React.FC<DescriptionCardProps> = ({ description, title }) => {
    const [loadedFields, setLoadedFields] = useState<Set<string>>(new Set());
    const [loadingTimes, setLoadingTimes] = useState<{ [key: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Generate random loading times for each field and sub-field
        const times: { [key: string]: number } = {};
        const addFieldTimes = (obj: any, prefix: string = '') => {
            Object.entries(obj).forEach(([key, value]) => {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                times[fullKey] = Math.random() * 4000 + 5000; // Random time between 3-7 seconds

                if (typeof value === 'object' && value !== null) {
                    addFieldTimes(value, fullKey);
                }
            });
        };

        addFieldTimes(description);
        setLoadingTimes(times);

        // Set up timeouts to show each field and sub-field
        Object.entries(times).forEach(([key, time]) => {
            setTimeout(() => {
                setLoadedFields((prev) => {
                    const newSet = new Set([...prev, key]);
                    // Check if all fields are loaded
                    if (newSet.size === Object.keys(times).length) {
                        setIsLoading(false);
                    }
                    return newSet;
                });
            }, time);
        });
    }, [description]);

    const formatKey = (key: string) => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatValue = (value: string) => {
        return value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const renderField = (key: string, value: any, level: number = 0, parentKey: string = '') => {
        // Skip rendering if the field is "Company Type"
        if (key === 'company_type') {
            return null;
        }

        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const isLoading = !loadedFields.has(fullKey);
        const formattedKey = formatKey(key);
        const indent = level * 16; // 16px indentation per level
        const isChild = typeof value !== 'object' || value === null || Array.isArray(value);

        if (isLoading && isChild) {
            return (
                <div key={key} className="mb-4 flex items-center" style={{ marginLeft: `${indent}px` }}>
                    <Spin className="mr-2" indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                    <Typography.Text type="secondary">{formattedKey}:</Typography.Text>
                </div>
            );
        }

        const renderValue = (val: any, currentLevel: number = 0): React.ReactNode => {
            if (key.toLowerCase() === 'generation') {
                return val ? '1st' : 'Later';
            }

            if (typeof val === 'object' && val !== null) {
                if (Array.isArray(val)) {
                    return val.map(item => renderValue(item, currentLevel));
                }
                return (
                    <div style={{ marginLeft: `${currentLevel * 16}px` }}>
                        {Object.entries(val).map(([k, v]) => {
                            // Skip rendering if the field is "Company Type"
                            if (k === 'company_type') {
                                return null;
                            }

                            const nestedKey = `${fullKey}.${k}`;
                            const isNestedLoading = !loadedFields.has(nestedKey);
                            const isNestedChild = typeof v !== 'object' || v === null || Array.isArray(v);

                            if (isNestedLoading && isNestedChild) {
                                return (
                                    <div key={k} className="mb-4 flex items-center" style={{ marginLeft: `${indent}px` }}>
                                        <Spin className="mr-2" indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                                        <Typography.Text type="secondary">{formatKey(k)}:</Typography.Text>
                                    </div>
                                );
                            }

                            return (
                                <div key={k} className="mb-2">
                                    <Typography.Text type="secondary">{formatKey(k)}:</Typography.Text>
                                    <Typography.Text style={{ marginLeft: '8px' }}>
                                        {renderValue(v, currentLevel + 1)}
                                    </Typography.Text>
                                </div>
                            );
                        })}
                    </div>
                );
            }
            return formatValue(String(val));
        };

        return (
            <div key={key} className="" style={{ marginLeft: `${indent}px` }}>
                <Typography.Text type="secondary">{formattedKey}:</Typography.Text>
                <Typography.Text style={{ marginLeft: '8px' }}>
                    {renderValue(value, level + 1)}
                </Typography.Text>
            </div>
        );
    };

    return (
        <Card
            title={title}
            className="w-full [&_.ant-card-head]:relative [&_.ant-card-head]:border-b-0"
            headStyle={{
                borderBottom: 'none',
                position: 'relative'
            }}
            extra={
                <div
                    className={`absolute bottom-0 left-0 h-0.5 ${isLoading
                        ? 'bg-blue-500 animate-border-flow'
                        : 'bg-green-500 w-full'
                        }`}
                />
            }
        >
            {Object.entries(description).map(([key, value]) => renderField(key, value, 0, ''))}
        </Card>
    );
};

export default DescriptionCard; 