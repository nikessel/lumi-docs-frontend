import React, { useEffect, useState } from "react";
import { Badge, Dropdown, List, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";
import NotificationService, { AppNotification } from "../../../contexts/notification-context/notification-service";

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    useEffect(() => {
        const unsubscribe = NotificationService.subscribe(setNotifications);
        return () => unsubscribe();
    }, []);

    const unseenCount = notifications.filter(n => !n.read).length;

    const handleDropdownClick = () => {
        NotificationService.markAllAsRead();
    };

    const handleClearNotifications = () => {
        NotificationService.clearAll();
        setNotifications([]);
    };

    return (
        <Dropdown
            overlay={
                <div
                    style={{
                        width: 280,
                        background: "white",
                        borderRadius: 6,
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{ maxHeight: 250, overflowY: "auto", padding: 10 }}>
                        <List
                            dataSource={notifications}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<span style={{ textTransform: "capitalize" }}>{item.type}</span>}
                                        description={item.message}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                    {notifications.length > 0 && (
                        <Button type="text" onClick={handleClearNotifications} block>
                            Clear Notifications
                        </Button>
                    )}
                </div>
            }
            trigger={["click"]}
            onOpenChange={handleDropdownClick}
        >
            <Badge overflowCount={9} count={unseenCount} size="small" offset={[-3, 3]}>
                <BellOutlined style={{ fontSize: 16, cursor: "pointer" }} />
            </Badge>
        </Dropdown>
    );
};

export default NotificationBell;
