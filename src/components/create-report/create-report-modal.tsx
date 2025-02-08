import React, { useState } from "react";
import { Button, Modal } from "antd";
import ReportCreator from "./report-creator";
import PriceTracker from "../payment/price-tracker";

const CreateReportModal: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => setIsModalVisible(true);
    const handleCancel = () => setIsModalVisible(false);

    return (
        <div>
            <Button type="primary" onClick={showModal}>
                Create New Report
            </Button>
            <Modal
                title={<div className="flex gap-x-4 items-center">
                    <div>Create New Report</div>
                    <PriceTracker />
                </div>}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={"80%"}
                style={{ marginTop: 0 }}
            >
                <ReportCreator onReportSubmitted={() => setIsModalVisible(false)} />
            </Modal>
        </div>
    );
};

export default CreateReportModal;
