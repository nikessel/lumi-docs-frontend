// src/components/user-settings.tsx
'use client';
import React, { useState } from "react";
import { Popover, Avatar } from "antd";
import { SettingOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";

interface UserSettingsProps {
    user: undefined;
}

const UserSettings: React.FC<UserSettingsProps> = ({ user }) => {
    const [visible, setVisible] = useState(false);

    // Define the content for the Popover using simple divs
    const settingsContent = (
        <div className="flex flex-col space-y-2">
            <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                <SettingOutlined />
                <span>Settings</span>
            </button>
            <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                <LogoutOutlined />
                <span>Log Out</span>
            </button>
        </div>
    );

    return (
        <Popover
            content={settingsContent}
            trigger="click"
            open={visible}
            onOpenChange={(vis) => setVisible(vis)}
            placement="top"
        >
            <Avatar size="large" icon={<UserOutlined />} className="cursor-pointer" />
        </Popover>
    );
};

export default UserSettings;
