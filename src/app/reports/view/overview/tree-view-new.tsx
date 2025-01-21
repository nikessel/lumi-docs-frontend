'use client';
import { useEffect } from 'react';
import { analyzeReports, generateWaffleDataFromReports } from '@/utils/advanced-charts-utils';

import React from 'react';
import { Report } from "@wasm"

type TreeViewProps = {
    reports: Report[]; // Replace `any` with a specific type once the structure is defined
};

const TreeView: React.FC<TreeViewProps> = ({ reports }) => {

    useEffect(() => {
        const res = generateWaffleDataFromReports(reports)
        console.log("TREEVIEW!!!", res)
    }, [reports])


    return <div className="p-4 bg-gray-200 text-center">TreeView Placeholder</div>;
};

export default TreeView;
