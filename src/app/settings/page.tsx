'use client';
import React, { useState } from "react";
import { Input, Button, Divider, Switch, Tooltip, message, List, Modal } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "@/styles/globals.css";
import Typography from "@/components/typography";

const SettingsPage = () => {
    const [theme, setTheme] = useState("Light");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [acceptanceCriteria, setAcceptanceCriteria] = useState(70);
    const [lowRatedThreshold, setLowRatedThreshold] = useState(50);
    const [savedViews, setSavedViews] = useState<string[]>(["View 1", "View 2"]);
    const [taskAutoTransfer, setTaskAutoTransfer] = useState(false);
    const [editingView, setEditingView] = useState<string | null>(null);
    const [newViewName, setNewViewName] = useState("");

    const handleThemeToggle = () => {
        setTheme(theme === "Light" ? "Dark" : "Light");
        message.success(`Theme switched to ${theme === "Light" ? "Dark" : "Light"}`);
    };

    const handleSaveViewRename = () => {
        if (editingView && newViewName.trim()) {
            setSavedViews((prev) =>
                prev.map((view) => (view === editingView ? newViewName.trim() : view))
            );
            setEditingView(null);
            setNewViewName("");
            message.success("View renamed successfully.");
        }
    };

    const handleDeleteView = (view: string) => {
        setSavedViews((prev) => prev.filter((v) => v !== view));
        message.success("View deleted successfully.");
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <Typography textSize="h4">Settings</Typography>
            </div>
            <Divider className="border-thin mt-2 mb-2" />

            {/* User Settings */}
            <Typography textSize="h5">User Settings</Typography>
            <Divider />
            <div className="flex flex-col space-y-4">
                <Input placeholder="Change Name" />
                <Input placeholder="Change Email" type="email" />
                <Input placeholder="Change Password" type="password" />
            </div>

            {/* Notifications */}
            <Divider className="border-thin mt-4 mb-4" />
            <Typography textSize="h5">Notifications</Typography>
            <div className="flex justify-between items-center mt-2">
                <Typography>Email Notifications</Typography>
                <Switch checked={emailNotifications} onChange={setEmailNotifications} />
            </div>

            {/* Theme */}
            <div className="flex justify-between items-center mt-2">
                <Typography>Theme</Typography>
                <Switch
                    checked={theme === "Dark"}
                    onChange={handleThemeToggle}
                    checkedChildren="Dark"
                    unCheckedChildren="Light"
                />
            </div>

            {/* Report Configuration */}
            <Divider className="border-thin mt-4 mb-4" />
            <Typography textSize="h5">Report Configuration</Typography>
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <Typography>Acceptance Criteria</Typography>
                    <Input
                        type="number"
                        value={acceptanceCriteria}
                        onChange={(e) => setAcceptanceCriteria(Number(e.target.value))}
                        style={{ width: 80 }}
                        min={0}
                        max={100}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <Typography>Low Rated Assessments Threshold</Typography>
                    <Input
                        type="number"
                        value={lowRatedThreshold}
                        onChange={(e) => setLowRatedThreshold(Number(e.target.value))}
                        style={{ width: 80 }}
                        min={0}
                        max={100}
                    />
                </div>
            </div>

            {/* Saved Views */}
            <Divider className="border-thin mt-4 mb-4" />
            <Typography textSize="h5">Saved Views</Typography>
            <List
                dataSource={savedViews}
                renderItem={(view) => (
                    <List.Item
                        actions={[
                            <Button
                                key={`${view}-$`}
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => setEditingView(view)}
                            />,
                            <Button
                                key={`${view}-$`}
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteView(view)}
                                danger
                            />,
                        ]}
                    >
                        {view}
                    </List.Item>
                )}
            />
            <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setSavedViews((prev) => [...prev, `New View ${savedViews.length + 1}`])}
            >
                Add View
            </Button>

            {/* Task Management */}
            <Divider className="border-thin mt-4 mb-4" />
            <Typography textSize="h5">Task Management</Typography>
            <div className="flex justify-between items-center mt-2">
                <Typography>Automatically Transfer All Tasks</Typography>
                <Switch
                    checked={taskAutoTransfer}
                    onChange={setTaskAutoTransfer}
                />
            </div>

            {/* Rename Modal */}
            <Modal
                title="Rename View"
                visible={!!editingView}
                onCancel={() => setEditingView(null)}
                onOk={handleSaveViewRename}
            >
                <Input
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    placeholder="Enter new view name"
                />
            </Modal>
        </div>
    );
};

export default SettingsPage;
