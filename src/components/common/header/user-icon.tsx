import React from "react";
import { Dropdown, Spin, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
    useUser

} from "@/hooks/user-hooks";
const { Text } = Typography;

const UserIcon: React.FC = () => {
    const { user, loading, error } = useUser();

    const menuContent = (
        <div
            style={{
                width: 250,
                background: "white",
                borderRadius: 6,
                boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                padding: 12,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {loading ? (
                <Spin />
            ) : error ? (
                <Text type="danger">{error}</Text>
            ) : user ? (
                <>
                    <Text strong>{`${user.first_name} ${user.last_name}`}</Text>
                    <Text type="secondary">{user.job_title || "No job title"}</Text>
                    <Text>{user.email}</Text>
                    <Text type="secondary">{user.company || "No company"}</Text>
                </>
            ) : (
                <Text type="danger">User not found</Text>
            )}
        </div>
    );

    return (
        <Dropdown overlay={menuContent} trigger={["click"]}>
            <UserOutlined style={{ fontSize: 16, cursor: "pointer", marginLeft: 10 }} />
        </Dropdown>
    );
};

export default UserIcon;
