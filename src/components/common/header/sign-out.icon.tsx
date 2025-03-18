import React from "react";
import { Dropdown, Button, Tooltip, } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";
import { clearAllData } from "@/utils/sign-out-util";

const SignOutIcon: React.FC = () => {
    const { logout } = useAuth();

    const handleSignOut = async () => {
        await clearAllData();
        logout();
    };


    return (
        <Button icon={<LogoutOutlined />} size="small" type="link" onClick={handleSignOut} className="text-black">Sign out</Button>
    );
};

export default SignOutIcon;
