import React, { useState } from "react";
import { Button, Modal, Input, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { saveViewToUser } from "@/utils/user-utils";
import { useWasm } from "../../contexts/wasm-context/WasmProvider";
import Typography from "../common/typography";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useUserContext } from "@/contexts/user-context";

const SaveViewButton: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const { wasmModule, isLoading } = useWasm()
    const { user } = useUserContext()

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setTitle("");
        setDescription("");
    };

    const handleSave = async () => {
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        const savedView = { title, description, link: currentUrl };

        setIsSaving(true);
        const key = "saveView";

        messageApi.open({
            key,
            type: "loading",
            content: "Saving view...",
            duration: 0,
        });

        try {
            const result = await saveViewToUser(wasmModule, savedView);
            user?.id && useCacheInvalidationStore.getState().addStaleId(user?.id)
            useCacheInvalidationStore.getState().triggerUpdate("user")

            if (result.success) {
                messageApi.open({
                    key,
                    type: "success",
                    content: "View saved successfully!",
                });
            } else {
                messageApi.open({
                    key,
                    type: "error",
                    content: result.message || "Failed to save view.",
                });
            }
        } catch (error) {
            console.error("Error saving view:", error);
            messageApi.open({
                key,
                type: "error",
                content: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsSaving(false);
            handleCloseModal();
        }
    };

    return (
        <>
            {contextHolder}
            <Button loading={isLoading} icon={<SaveOutlined />} onClick={handleOpenModal} disabled={isSaving}>
                Save view
            </Button>
            <Modal
                title="Save View"
                visible={isModalVisible}
                onOk={handleSave}
                onCancel={handleCloseModal}
                okText={isSaving ? "Saving..." : "Save"}
                cancelText="Cancel"
                confirmLoading={isSaving}
            >
                <div className="space-y-4">
                    <Typography className="leading-4" color="secondary" >
                        Saved views is a convenient way to return back to a specfic page with specfic filters and more.
                    </Typography>

                    <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSaving}
                    />
                    <Input.TextArea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        disabled={isSaving}
                    />
                </div>
            </Modal>
        </>
    );
};

export default SaveViewButton;
