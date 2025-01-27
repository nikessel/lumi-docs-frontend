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

    const { login } = useAuth()
    console.log("ERROROROROROR", error)

    // if (loading) {
    //     return <div className="w-full h-full flex  justify-center"><LoadingLogoScreen /></div>;
    // }

    if (error) {
        if (error === "Missing Authorization header") {
            return (
                <div className="mt-8 mt-8 mb-16">
                    <Typography className="mb-8 flex justify-center" textSize="h2">Please login to view this content</Typography>
                    <div className="flex justify-center">
                        <Image
                            src={require("@/assets/undraw_secure-login_m11a.svg")}
                            alt="Signed Out Illustration"
                            width={400}
                            height={400}
                            className="mb-6"
                        />
                    </div>
                    <div className="flex justify-center">
                        <Button type="primary" onClick={() => login()}>Login</Button>
                    </div>
                </div>
            )

        } else {
            return (
                <div className="w-full h-full flex items-center justify-center text-red-500">
                    {error}
                </div>);
        }
    }

    if (!reports.length && expectReports) {
        return <div className="w-full h-full flex items-center justify-center">No reports found</div>;
    }

    return <>{children}</>;
};

export default ReportStateHandler;
