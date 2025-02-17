'use client';

import React from 'react';
import { Button, Divider } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import "@/styles/globals.css";
import ReportCreatedOn from '@/components/created-on';
import FilterBar from '@/components/filter-bar'
import SubMenu from './sub-menu';
import { createUrlWithParams } from '@/utils/url-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import SaveViewButton from '@/components/save-view';
import ReportsHeader from './report-header';
import { useReportsContext } from '@/contexts/reports-context';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    const { filteredSelectedReports } = useReportsContext()

    const searchParams = useSearchParams();

    const router = useRouter();

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <div className="space-y-4">
                        <ReportsHeader reports={filteredSelectedReports} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <SaveViewButton />
                </div>
            </div>
            <Divider className="border-thin mt-2 mb-2" />

            <div className="flex justify-between items-center">
                <SubMenu />
                <div className="flex items-center gap-4">
                    <ReportCreatedOn reports={filteredSelectedReports} />
                    <FilterBar />
                </div>
            </div>

            <div className="mt-2">
                {children}
            </div>
        </div>
    );
};

export default Layout;
