'use client';
import React, { useState, useEffect, MutableRefObject } from "react";
import { Layout, Menu, Divider, message } from "antd";
import { FilePdfOutlined, FileDoneOutlined, ProjectOutlined, BarChartOutlined, FileSearchOutlined, LogoutOutlined } from "@ant-design/icons";
import SidebarToggleButton from "./sider-toggle-button";
import SiderLogo from "./sider-logo";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAllData } from "@/utils/sign-out-util";
import { useAuth } from "../Auth0";
import HelpCard from "../help-card";

const { Sider } = Layout;

const AppSiderComponent: React.FC<{ reportsRef: MutableRefObject<null>; regulatoryFrameworksRef: MutableRefObject<null>; filesRef: MutableRefObject<null>, tasksRef: MutableRefObject<null> }> = ({ reportsRef, regulatoryFrameworksRef, filesRef, tasksRef }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showToggleButton, setShowToggleButton] = useState(true);
    const pathname = usePathname();
    const { logout } = useAuth()
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        const checkWindowWidth = () => {
            const shouldCollapse = window.innerWidth <= 1200;
            setCollapsed(prev => (prev !== shouldCollapse ? shouldCollapse : prev));
            setShowToggleButton(prev => (prev !== !shouldCollapse ? !shouldCollapse : prev));
        };

        setTimeout(checkWindowWidth, 0); // Delaying execution after the initial render
        window.addEventListener("resize", checkWindowWidth);

        return () => {
            window.removeEventListener("resize", checkWindowWidth);
        };
    }, []);

    const handleSignOut = async () => {
        messageApi.loading("Signing out")
        await clearAllData()
        logout()
    }

    // useEffect(() => {
    //     checkWindowWidth();
    //     window.addEventListener("resize", checkWindowWidth);

    //     return () => {
    //         window.removeEventListener("resize", checkWindowWidth);
    //     };
    // }, []);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const getBasePath = (path: string) => {
        const segments = path.split('/');
        return `/${segments[1]}`; // Return the first-level route
    };

    const activeKey = getBasePath(pathname); // Get the base path of the current URL

    const menuItems = [
        {
            key: "/dashboard",
            icon: <BarChartOutlined />,
            label: <Link href="/dashboard">Dashboard</Link>,
        },
        {
            key: "/reports",
            icon: <FileDoneOutlined />,
            label: <Link href="/reports">Reports</Link>,
            ref: reportsRef
        },
        {
            key: "/tasks",
            icon: <ProjectOutlined />,
            label: <Link href="/tasks">Tasks</Link>,
            ref: tasksRef
        },
        {
            key: "/files",
            icon: <FilePdfOutlined />,
            label: <Link href="/files">Files</Link>,
            ref: filesRef
        },
        {
            key: "/standards",
            icon: <FileSearchOutlined />,
            label: <Link href="/standards">Regulatory Frameworks</Link>,
            ref: regulatoryFrameworksRef
        },
        {
            key: "/",
            icon: <LogoutOutlined />,
            label: <div>Sign out</div>,
            onClick: () => handleSignOut()
        },
    ];

    return (
        <Sider collapsible collapsed={collapsed} className="h-screen" trigger={null}>
            <div className="h-full flex flex-col">
                {contextHolder}

                <div>
                    {showToggleButton && <SidebarToggleButton collapsed={collapsed} onToggle={toggleCollapse} />}
                    <SiderLogo collapsed={collapsed} />
                    <Divider />
                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]}
                        items={menuItems}
                    />
                </div>

                <div className="flex-grow" />

                <div className="w-full flex justify-center mb-12">
                    <HelpCard collapsed={collapsed} />
                </div>
            </div>
        </Sider>
    );
};

export default AppSiderComponent;
