'use client';

import React from 'react';
import { Tag } from 'antd';

interface StandardTagProps {
    standard: string | undefined;
}

const RegulatoryFrameworkTag: React.FC<StandardTagProps> = ({ standard }) => {
    if (!standard) {
        return null;
    }

    const standardMap: Record<string, { label: string; color: string }> = {
        iso13485: { label: 'ISO 13485', color: 'blue' },
        iso14155: { label: 'ISO 14155', color: 'green' },
        iso14971: { label: 'ISO 14971', color: 'cyan' },
        mdr: { label: 'MDR', color: 'volcano' },
        iec62304: { label: 'IEC 62304', color: 'purple' },
        iec62366: { label: 'IEC 62366', color: 'magenta' },
        iso10993_10: { label: 'ISO 10993-10', color: 'gold' },
    };

    const standardEntry = standardMap[standard] || { label: standard, color: 'default' };

    return <Tag color={standardEntry.color}>{standardEntry.label}</Tag>;
};

export default RegulatoryFrameworkTag;
