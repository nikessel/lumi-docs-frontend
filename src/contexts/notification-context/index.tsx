import React, { useEffect, useState } from "react";
import { Badge, Dropdown, List, Button, notification } from "antd";
import { BellOutlined } from "@ant-design/icons";
import NotificationService, { AppNotification } from "./notification-service";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [api, contextHolder] = notification.useNotification();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    useEffect(() => {
        NotificationService.init(api);
        const unsubscribe = NotificationService.subscribe(setNotifications);
        return () => unsubscribe();
    }, [api]);

    const unseenCount = notifications.filter(n => !n.read).length;

    const handleDropdownClick = () => {
        NotificationService.markAllAsRead();
    };

    return (
        <>
            {contextHolder} {/* Ensures notifications work */}
            {/* <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000 }}>
                <Dropdown
                    overlay={
                        <div
                            style={{
                                width: 320,
                                background: "white",
                                borderRadius: 6,
                                boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{ maxHeight: 300, overflowY: "auto", padding: 10 }}>
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
                                {notifications.length === 0 && (
                                    <p style={{ textAlign: "center", margin: 0 }}>No notifications</p>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <Button type="text" onClick={() => setNotifications([])} block>
                                    Clear Notifications
                                </Button>
                            )}
                        </div>
                    }
                    trigger={["click"]}
                    onOpenChange={handleDropdownClick}
                >
                    <Badge count={unseenCount} offset={[-5, 5]}>
                        <BellOutlined style={{ fontSize: 24, cursor: "pointer" }} />
                    </Badge>
                </Dropdown>
            </div> */}
            {children}
        </>
    );
};
