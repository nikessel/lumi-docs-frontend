'use client';

import React from 'react';
import { Divider } from 'antd';
import "@/styles/globals.css";
import ReportCreatedOn from '@/components/reports/created-on';
import SubMenu from './components/sub-menu';
import SaveViewButton from '@/components/saved-views/save-view-button';
import { useReportsContext } from '@/contexts/reports-context';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    const { filteredSelectedReports } = useReportsContext()

    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <SubMenu />
                </div>
                <div className="flex items-center space-x-2">
                    <SaveViewButton />
                    <ReportCreatedOn reports={filteredSelectedReports} />

                </div>
            </div>
            <Divider className="border-thin mt-2 mb-2" />

            <div className="flex justify-between items-center">

            </div>

            <div className="mt-2">
                {children}
            </div>
        </div>
    );
};

export default Layout;
