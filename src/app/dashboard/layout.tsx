'use client';
import React from "react";
import Typography from "@/components/common/typography";
import { Divider } from "antd";
import "@/styles/globals.css";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div>
            <div className="flex justify-between items-center">
                <Typography textSize="h4">Dashboard </Typography>
            </div>
            <Divider className="border-thin mt-2 mb-2" />
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
};

export default Layout;