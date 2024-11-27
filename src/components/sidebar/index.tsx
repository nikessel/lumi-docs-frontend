// src/components/AppSiderComponent.tsx

'use client';
import React, { useState, useEffect } from "react";
import { Layout, Menu, Divider } from "antd";
import { FilePdfOutlined, FileDoneOutlined, BarChartOutlined, SettingOutlined } from "@ant-design/icons";
import SidebarToggleButton from "./sider-toggle-button";
import SiderLogo from "./sider-logo";
import Link from 'next/link';
import UserSettings from "./user-settings";

const { Sider } = Layout;


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
                    <Divider style={{ borderColor: '#EAF3FF' }} />

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
                                label: <Link href="/reports">Reports</Link>,
                            },
                            {
                                key: "3",
                                icon: <FilePdfOutlined />,
                                label: <Link href="/files">Files</Link>,
                            }
                        ]}
                    />
                </div>

            </div>
        </Sider>
    );
};

export default AppSiderComponent;
