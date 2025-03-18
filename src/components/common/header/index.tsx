import React from "react";
import { Layout } from "antd";
import NotificationBell from "@/components/common/header/notification-bell";
import UploadIndicator from "@/components/files/upload-files/upload-indicator";
import UserIcon from "@/components/common/header/user-icon";
import SignOutIcon from "@/components/common/header/sign-out.icon";
const { Header } = Layout;

const AppHeader: React.FC = () => {
    return (
        <Header
            className="bg-white flex items-center justify-end px-4 shadow-sm gap-x-4"
            style={{ height: 30, padding: "0 16px", display: "flex", alignItems: "center", gap: "20px" }}
        >
            <UploadIndicator />
            <UserIcon />
            <NotificationBell />
            <SignOutIcon />
        </Header>
    );
};

export default AppHeader;
