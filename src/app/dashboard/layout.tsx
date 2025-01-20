'use client';
import React from "react";
import Typography from "@/components/typography";
import { Divider } from "antd";
import "@/styles/globals.css";
import { useUser } from "@/hooks/user-hooks";


interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    const { user, loading: userLoading, error: userError } = useUser(0)

    return (
        <div>
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <Typography textSize="h4">Dashboard </Typography>
            </div>
            <Divider className="border-thin mt-2 mb-2" />
            <div className="flex justify-between items-center">
                <Typography color="secondary">
                    Welcome back, {user?.first_name}
                </Typography>
            </div>
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
};

export default Layout;