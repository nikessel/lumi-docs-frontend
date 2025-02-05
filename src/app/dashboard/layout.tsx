'use client';
import React, { useEffect } from "react";
import Typography from "@/components/typography";
import { Divider } from "antd";
import "@/styles/globals.css";
import { AllReportsTasksProvider } from '@/contexts/tasks-context/all-report-tasks';
import ReportStateHandler from "@/components/report-state-handler";
import { useAllReportsContext } from "@/contexts/reports-context/all-reports-context";
import { useUserContext } from "@/contexts/user-context";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    const { user, loading: userLoading, error: userError } = useUserContext()

    const { reports, loading, error } = useAllReportsContext();

    useEffect(() => {
        console.log("USDASDASD", user)
    }, [user, userLoading])

    return (
        <ReportStateHandler loading={loading} error={error} reports={reports} expectReports={false}>
            <div>
                <AllReportsTasksProvider reports={reports}>
                    {/* Header Section */}
                    <div className="flex justify-between items-center">
                        <Typography textSize="h4">Dashboard </Typography>
                    </div>
                    <Divider className="border-thin mt-2 mb-2" />
                    {/* <div className="flex justify-between items-center">
                        <Typography color="secondary">
                            Welcome back, {user?.first_name}
                        </Typography>
                    </div> */}
                    <div className="mt-4">
                        {children}
                    </div>
                </AllReportsTasksProvider>
            </div>
        </ReportStateHandler>
    );
};

export default Layout;