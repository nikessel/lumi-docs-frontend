import React from "react";
import { Card, Typography } from "antd";
import type { DeviceDescription, TrialDescription, CompanyDescription, Company } from "@wasm";

type DescriptionType = DeviceDescription | TrialDescription | CompanyDescription | Company;

interface DescriptionCardProps {
    description: DescriptionType;
    title: string;
    onReady?: () => void;
}

const DescriptionCard: React.FC<DescriptionCardProps> = ({ description, title, onReady }) => {
    // Call onReady immediately since data is available
    React.useEffect(() => {
        onReady?.();
    }, []);

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

    const renderField = (key: string, value: any, level: number = 0) => {
        // Skip rendering if the field is "Company Type"
        if (key === 'company_type') {
            return null;
        }

        const formattedKey = formatKey(key);
        const indent = level * 16; // 16px indentation per level

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
                <div className="absolute bottom-0 left-0 h-0.5 bg-green-500 w-full" />
            }
        >
            {Object.entries(description).map(([key, value]) => renderField(key, value, 0))}
        </Card>
    );
};

export default DescriptionCard; 