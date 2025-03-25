import React, { useState, useEffect } from "react";
import { Card, Skeleton, Typography } from "antd";
import type { DeviceDescription } from "@wasm";

interface DeviceDescriptionCardProps {
    deviceDescription: DeviceDescription;
}

const DeviceDescriptionCard: React.FC<DeviceDescriptionCardProps> = ({ deviceDescription }) => {
    const [loadedFields, setLoadedFields] = useState<Set<string>>(new Set());
    const [loadingTimes, setLoadingTimes] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        // Generate random loading times for each field
        const times: { [key: string]: number } = {};
        Object.keys(deviceDescription).forEach((key) => {
            times[key] = Math.random() * 4000 + 3000; // Random time between 3-7 seconds
        });
        setLoadingTimes(times);

        // Set up timeouts to show each field
        Object.entries(times).forEach(([key, time]) => {
            setTimeout(() => {
                setLoadedFields((prev) => new Set([...prev, key]));
            }, time);
        });
    }, [deviceDescription]);

    const formatKey = (key: string) => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const renderField = (key: string, value: any) => {
        const isLoading = !loadedFields.has(key);
        const formattedKey = formatKey(key);

        if (isLoading) {
            return (
                <div key={key} className="mb-4">
                    <Typography.Text type="secondary">{formattedKey}:</Typography.Text>
                    <Skeleton.Input active size="small" style={{ width: '60%', marginLeft: '8px' }} />
                </div>
            );
        }

        return (
            <div key={key} className="mb-4">
                <Typography.Text type="secondary">{formattedKey}:</Typography.Text>
                <Typography.Text style={{ marginLeft: '8px' }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </Typography.Text>
            </div>
        );
    };

    return (
        <Card title="Device Description" className="w-full">
            {Object.entries(deviceDescription).map(([key, value]) => renderField(key, value))}
        </Card>
    );
};

export default DeviceDescriptionCard;