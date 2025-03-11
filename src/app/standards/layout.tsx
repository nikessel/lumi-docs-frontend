'use client';

import React from 'react';
import { Divider } from 'antd';
import "@/styles/globals.css";

import Typography from '@/components/common/typography';


interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center ">
                <Typography textSize='h4'>Supported Regulatory Frameworks</Typography>
            </div>
            <Divider className="border-thin mt-2 mb-2" />
            <Typography color="secondary">The table shows currently supported regulatory frameworks and their associated sections, groups, and requirements. Navigate to Reports to create a new report.</Typography>


            <div className="mt-2">{children}</div>
        </div>
    );
};

export default Layout;
