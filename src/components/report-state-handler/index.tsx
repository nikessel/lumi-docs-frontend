'use client';

import React from 'react';
import { Report } from '@wasm';
import LoadingLogoScreen from '../loading-screen';

interface ReportStateHandlerProps {
    loading: boolean;
    error: string | null;
    reports: Report[];
    expectReports: boolean;
    children: React.ReactNode;

}

const ReportStateHandler: React.FC<ReportStateHandlerProps> = ({
    loading,
    error,
    reports,
    expectReports,
    children,
}) => {
    if (loading) {
        return <div className="w-full h-full flex  justify-center"><LoadingLogoScreen /></div>;
    }

    if (error) {
        return <div className="w-full h-full flex items-center justify-center text-red-500">{error}</div>;
    }

    if (!reports.length && expectReports) {
        return <div className="w-full h-full flex items-center justify-center">No reports found</div>;
    }

    return <>{children}</>;
};

export default ReportStateHandler;
