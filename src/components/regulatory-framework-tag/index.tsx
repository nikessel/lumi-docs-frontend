'use client';

import React from 'react';
import { Tag, Typography } from 'antd';

interface StandardTagProps {
    standard: string | undefined;
    additionalReference?: string;
    type?: 'standard' | 'compact';
}

const RegulatoryFrameworkTag: React.FC<StandardTagProps> = ({ standard, additionalReference, type = 'standard' }) => {
    if (!standard) {
        return null;
    }

    const standardMap: Record<string, { label: string; color: string }> = {
        iso13485: { label: 'ISO 13485', color: 'blue' },
        iso14155: { label: 'ISO 14155', color: 'green' },
        iso14971: { label: 'ISO 14971', color: 'cyan' },
        iec62304: { label: 'IEC 62304', color: 'purple' },
        iec62366: { label: 'IEC 62366', color: 'magenta' },
    };

    const standardEntry = standardMap[standard] || { label: standard, color: 'default' };

    if (type === 'compact') {
        const colorMap: Record<string, string> = {
            blue: 'text-blue-500',
            green: 'text-green-500',
            cyan: 'text-cyan-500',
            orange: 'text-orange-500',
            purple: 'text-purple-500',
            magenta: 'text-pink-500',
            gold: 'text-yellow-500',
            default: 'text-gray-500'
        };

        return (
            <Typography.Text className={`text-xs truncate block ${colorMap[standardEntry.color]}`}>
                {additionalReference || standardEntry.label}
            </Typography.Text>
        );
    }

    return <div><Tag color={standardEntry.color}>{standardEntry.label} {additionalReference ? `- ${additionalReference}` : ""} </Tag></div>;
};

export default RegulatoryFrameworkTag;
