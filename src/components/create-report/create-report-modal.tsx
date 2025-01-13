import React, { useState } from "react";
import { Button, Modal } from "antd";
import ReportCreator from "./report-creator"; // Import your ReportCreator component

const CreateReportModal: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Handlers for showing and hiding the modal
    const showModal = () => setIsModalVisible(true);
    const handleCancel = () => setIsModalVisible(false);

    return (
        <div>
            {/* Button to open the modal */}
            <Button type="primary" onClick={showModal}>
                Create New Report
            </Button>

            {/* Modal containing the ReportCreator */}
            <Modal
                title="Create New Report"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null} // Remove default footer
                width={800} // Adjust the width as needed
            >
                <ReportCreator onReportSubmitted={() => setIsModalVisible(false)} />
            </Modal>
        </div>
    );
};

export default CreateReportModal;
