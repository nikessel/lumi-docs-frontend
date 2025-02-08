'use client';

import React, { useEffect, useState } from 'react';
import { Button, Divider } from 'antd';
import { SaveOutlined, ArrowRightOutlined } from '@ant-design/icons';
import "@/styles/globals.css";
// import ReportSectionSelector from '@/components/report-section-selector';
import ReportCreatedOn from '@/components/created-on';
import FilterBar from '@/components/filter-bar'
import { createUrlWithParams } from '@/utils/url-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import SubMenu from './sub-menu';
import ReportsHeader from '@/app/reports/view/report-header';
import { useReportsContext } from '@/contexts/reports-context';
import { useSearchParamsState } from '@/contexts/search-params-context';
import { useRequirements } from '@/hooks/requirement-hooks';
import { filterReports } from '@/utils/report-utils';
import { useWasm } from '@/components/WasmProvider';
import { Report } from "@wasm"

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { reports } = useReportsContext();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { selectedReports, searchQuery, compliance } = useSearchParamsState()
    const { requirements } = useRequirements()
    const [filteredSelectedReports, setFilteredSelectedReports] = useState<Report[]>([]);
    const { wasmModule } = useWasm()

    useEffect(() => {
        const filteredReports = filterReports(reports, selectedReports, searchQuery, compliance, requirements)
        setFilteredSelectedReports(filteredReports)
    }, [reports, wasmModule, selectedReports, searchQuery, compliance, requirements])

    const handleGoToReports = () => {
        const tasksUrl = createUrlWithParams('/reports/view/overview', searchParams);
        router.push(tasksUrl);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    {filteredSelectedReports.length > 0 ?

                        <div className="space-y-4">
                            <ReportsHeader reports={filteredSelectedReports} header={"Tasks"} />
                        </div>
                        : <div>Tasks</div>
                    }
                </div>
                <div className="flex items-center space-x-2">
                    <Button icon={<SaveOutlined />}>Save view</Button>
                    <Button icon={<ArrowRightOutlined />} type="primary" onClick={handleGoToReports}>
                        Go to Reports
                    </Button>
                </div>
            </div>
            <Divider className="border-thin mt-2 mb-2" />

            <div className="flex justify-between items-center">
                <SubMenu />
                <div>
                    {filteredSelectedReports.length > 0 ? <div className="flex justify-between w-full">
                        <div className="flex items-center gap-4">
                            <ReportCreatedOn reports={filteredSelectedReports} />
                            <FilterBar />
                        </div>
                    </div> : ""}
                </div>
            </div>

            <div className="mt-4">{children}</div>
        </div>
    );
};

export default Layout;
