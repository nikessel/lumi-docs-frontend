import React from "react";
import { Modal } from "antd";
import FileUploadContent from "./file-upload";

const FileUploadModal: React.FC<{
    visible: boolean;
    onClose: () => void;
}> = ({ visible, onClose }) => {
    return (
        <Modal
            title="Upload Files"
            width={"50%"}
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <FileUploadContent onClose={onClose} />
        </Modal>
    );
};

export default FileUploadModal;