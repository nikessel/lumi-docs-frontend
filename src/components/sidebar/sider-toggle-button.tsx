import React from "react";
import { Button } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

interface SidebarToggleButtonProps {
    collapsed: boolean;
    onToggle: () => void;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ collapsed, onToggle }) => {
    return (
        <Button
            aria-label="Toggle sidebar"
            onClick={onToggle}
            className="z-10 top-2.5 -right-[15px] transition-right duration-300 hover:text-black"
            style={{
                position: "absolute",
            }}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        />
    );
};

export default SidebarToggleButton;
