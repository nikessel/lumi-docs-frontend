'use client';

import React from 'react';
import { Tag } from 'antd';

interface StandardTagProps {
    standard: string | undefined;
}

const RegulatoryFrameworkTag: React.FC<StandardTagProps> = ({ standard }) => {
    if (!standard) {
        return
    }

    const standardMap: Record<string, { label: string; color: string }> = {
        iso13485: { label: 'ISO 13485', color: 'blue' },
        iso14155: { label: 'ISO 14155', color: 'green' },
        iso14971: { label: 'ISO 14971', color: 'cyan' },
        mdr: { label: 'MDR', color: 'volcano' },
    };

    const standardEntry = standardMap[standard] || { label: standard, color: 'default' };

    return <div><Tag color={standardEntry.color}>{standardEntry.label}</Tag></div>;
};

export default RegulatoryFrameworkTag;
