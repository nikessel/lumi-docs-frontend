'use client';
import React, { useState, useEffect } from "react";
import { Layout, Menu, Divider } from "antd";
import { FilePdfOutlined, FileDoneOutlined, ProjectOutlined, BarChartOutlined, FileSearchOutlined, SettingOutlined, CreditCardOutlined, LogoutOutlined } from "@ant-design/icons";
import SidebarToggleButton from "./sider-toggle-button";
import SiderLogo from "./sider-logo";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Sider } = Layout;

const AppSiderComponent: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [showToggleButton, setShowToggleButton] = useState(true);
    const pathname = usePathname();

    const checkWindowWidth = () => {
        if (window.innerWidth <= 1200) {
            setCollapsed(true);
            setShowToggleButton(false);
        } else {
            setShowToggleButton(true);
        }
    };

    useEffect(() => {
        checkWindowWidth();
        window.addEventListener("resize", checkWindowWidth);

        return () => {
            window.removeEventListener("resize", checkWindowWidth);
        };
    }, []);

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
        },
        {
            key: "/tasks",
            icon: <ProjectOutlined />,
            label: <Link href="/tasks">Tasks</Link>,
        },
        {
            key: "/files",
            icon: <FilePdfOutlined />,
            label: <Link href="/files">Files</Link>,
        },
        {
            key: "/standards",
            icon: <FileSearchOutlined />,
            label: <Link href="/standards">Regulatory Frameworks</Link>,
        },
        {
            key: "/",
            icon: <LogoutOutlined />,
            label: <Link href="/">Sign out</Link>,
        },
    ];

    const accountMenuItems = [
        {
            key: "/settings",
            icon: <SettingOutlined />,
            label: <Link href="/settings">Settings</Link>,
        },
        {
            key: "/billing",
            icon: <CreditCardOutlined />,
            label: <Link href="/billing">Billing</Link>,
        },
        {
            key: "/",
            icon: <LogoutOutlined />,
            label: <Link href="/">Sign out</Link>,
        },
    ];

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            className="h-screen"
            trigger={null}
        >
            <div className="h-full flex flex-col justify-between">
                <div>
                    {showToggleButton && <SidebarToggleButton collapsed={collapsed} onToggle={toggleCollapse} />}
                    <SiderLogo collapsed={collapsed} />
                    <Divider />
                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]} // Highlight the menu item for the base path
                        items={menuItems}
                    />
                    {/* <Divider orientation="left">
                        <div className="text-xs">Account</div>
                    </Divider>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]} // Highlight the menu item for the base path
                        items={accountMenuItems}
                    /> */}
                </div>
            </div>
        </Sider>
    );
};

export default AppSiderComponent;
