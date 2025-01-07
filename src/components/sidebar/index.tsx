// src/components/AppSiderComponent.tsx

'use client';
import React, { useState, useEffect } from "react";
import { Layout, Menu, Divider } from "antd";
import { FilePdfOutlined, FileDoneOutlined, BarChartOutlined, FileSearchOutlined, SettingOutlined, CreditCardOutlined, LogoutOutlined } from "@ant-design/icons";
import SidebarToggleButton from "./sider-toggle-button";
import SiderLogo from "./sider-logo";
import Link from 'next/link';

const { Sider } = Layout;
const { SubMenu } = Menu;

const AppSiderComponent: React.FC = ({ }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showToggleButton, setShowToggleButton] = useState(true);

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
                    <Divider></Divider>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={["1"]}
                        items={[
                            {
                                key: "1",
                                icon: <BarChartOutlined />,
                                label: <Link href="/dashboard">Dashboard</Link>,
                            },
                            {
                                key: "2",
                                icon: <FileDoneOutlined />,
                                label: "Reports",
                                children: [
                                    {
                                        key: "2-1",
                                        label: <Link href="/reports/overview">Overview</Link>,
                                    },
                                    {
                                        key: "2-2",
                                        label: <Link href="/reports/findings">Findings</Link>,
                                    },
                                    {
                                        key: "2-3",
                                        label: <Link href="/reports/implementation">Implementation</Link>,
                                    },
                                ],
                            },
                            {
                                key: "3",
                                icon: <FilePdfOutlined />,
                                label: <Link href="/files">Files</Link>,
                            },
                            {
                                key: "4",
                                icon: <FileSearchOutlined />,
                                label: <Link href="/standards">Standards</Link>,
                            },
                        ]}
                    />
                    <Divider orientation="left"><div className="text-xs">Account</div></Divider>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={["1"]}
                        items={[
                            {
                                key: "5",
                                icon: <SettingOutlined />,
                                label: <Link href="/">Settings</Link>,
                            },
                            {
                                key: "6",
                                icon: <CreditCardOutlined />,
                                label: <Link href="/">Billing</Link>,
                            },
                            {
                                key: "7",
                                icon: <LogoutOutlined />,
                                label: <Link href="/">Sign out</Link>,
                            },
                        ]}
                    />
                </div>
            </div>
        </Sider>
    );
};

export default AppSiderComponent;
