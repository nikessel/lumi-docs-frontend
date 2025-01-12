'use client';

import React from 'react';
import { Modal, Progress, Divider } from 'antd';
import { RequirementAssessment, Requirement } from '@wasm';
import { getComplianceColorCode } from '@/utils/formating';
import Typography from '../typography';

interface RequirementModalProps {
    requirement: Requirement | undefined;
    requirementAssessment: RequirementAssessment | undefined;
    onClose: () => void;
    open: boolean;
}

const DetailedAssessmentModal: React.FC<RequirementModalProps> = ({
    requirement,
    requirementAssessment,
    onClose,
    open,
}) => {
    const complianceRating = requirementAssessment?.compliance_rating || 0;

    return (
        <Modal
            open={open}
            title={
                <div className="pr-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{requirement?.name || 'Requirement Details'}</span>
                    <Progress
                        type="circle"
                        percent={complianceRating}
                        width={50}
                        strokeColor={getComplianceColorCode(complianceRating)}
                    />
                </div>
            }
            onCancel={onClose}
            footer={null}
            width="80%"
        >
            <Divider className="border-thin mt-2 mb-2" />

            <div className="mt-4">
                <Typography className="my-4" textSize='h4'>Description of Requirement</Typography>
                <p>{requirement?.description || 'No description available.'}</p>

                <Typography className="my-4" textSize='h4'>Summary of research</Typography>

                <p>{requirementAssessment?.objective_research_summary || 'No summary available.'}</p>

                <Typography className="my-4" textSize='h4'>Selected Quotes</Typography>

                {requirementAssessment?.quotes && Array.isArray(requirementAssessment.quotes) && requirementAssessment.quotes.length > 0 ? (
                    <ul>
                        {requirementAssessment.quotes.map((quote, index) => (
                            <li key={index}>
                                {typeof quote === 'string' ? quote : quote.pretty || 'No quote content available.'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No quotes available.</p>
                )}

                <Typography className="my-4" textSize='h4'>Key findings</Typography>

                <p>{requirementAssessment?.negative_findings || 'No key findings available.'}</p>

                <Typography className="my-4" textSize='h4'>Detailed assessment</Typography>

                <p>{requirementAssessment?.details || 'No detailed assessment available.'}</p>
            </div>
        </Modal>
    );
};

export default DetailedAssessmentModal;
