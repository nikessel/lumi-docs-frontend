'use client';

import React from 'react';
import { Report } from '@wasm';
import LoadingLogoScreen from '../loading-screen';
import { useAuth } from '../Auth0';
import { Button } from 'antd';
import Image from "next/image";
import Typography from '../typography';

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

    if (error) {

        return (
            <div className="w-full h-full flex items-center justify-center text-red-500">
                {error}
            </div>);
    }

    return <>{children}</>;
};

export default ReportStateHandler;
