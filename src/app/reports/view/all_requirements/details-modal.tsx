import React from 'react';
import { Modal } from 'antd';
import { RequirementAssessment } from '@wasm';

interface DetailsModalProps {
    requirement: RequirementAssessment;
    onClose: () => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ requirement, onClose }) => {
    return (
        <Modal
            visible={true}
            title="Requirement Details"
            onCancel={onClose}
            footer={null}
        >
            <p>Compliance Rating: {requirement.compliance_rating}</p>
            <p>Applicability Rating: {requirement.applicability_rating}</p>
            <p>Details: {requirement.details}</p>
            <p>Negative Findings: {requirement.negative_findings.join(', ')}</p>
            <p>Sources: {requirement.sources.join(', ')}</p>
        </Modal>
    );
};

export default DetailsModal;
