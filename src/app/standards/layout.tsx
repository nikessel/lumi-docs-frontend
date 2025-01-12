'use client';

import React from 'react';
import { Divider } from 'antd';
import "@/styles/globals.css";

import Typography from '@/components/typography';


interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    return (
        <div>
            <div className="flex justify-between items-center">
                <Typography textSize='h4'>Supported Regulatory Frameworks</Typography>
            </div>
            <Divider className="border-thin mt-2 mb-2" />

            <div className="mt-2">{children}</div>
        </div>
    );
};

export default Layout;
