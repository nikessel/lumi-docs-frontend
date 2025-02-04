'use client';

import React from 'react';
import { Modal, Progress, Divider, Tag } from 'antd';
import { RequirementAssessment, Requirement, RegulatoryFramework } from '@wasm';
import { getComplianceColorCode } from '@/utils/formating';
import Typography from '../typography';
import ReactMarkdown from "react-markdown";
import RegulatoryFrameworkTag from '../regulatory-framework-tag';
import { useFilesContext } from '@/contexts/files-context';
import { viewFile, fetchFileData } from "@/utils/files-utils";
import { useWasm } from "@/components/WasmProvider";
import NATag from '../non-applicable-tag';


interface RequirementModalProps {
    requirement: Requirement | undefined;
    requirementAssessment: RequirementAssessment | undefined;
    onClose: () => void;
    open: boolean;
    regulatoryFramework: RegulatoryFramework | undefined
}

const DetailedAssessmentModal: React.FC<RequirementModalProps> = ({
    requirement,
    requirementAssessment,
    onClose,
    open,
    regulatoryFramework
}) => {

    const complianceRating = requirementAssessment?.compliance_rating || 0;
    const { files } = useFilesContext()
    const { wasmModule } = useWasm();
    const [blobUrls, setBlobUrls] = React.useState<{ [id: string]: string }>({});
    const [viewLoading, setViewLoading] = React.useState<{ [id: string]: boolean }>({});

    console.log("DETAILED", requirement, requirementAssessment)

    return (
        <Modal
            open={open}
            title={
                <div className="pr-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{requirement?.name || 'Requirement Details'}</span>
                    {requirementAssessment?.applicable ? <Progress
                        type="circle"
                        percent={complianceRating}
                        width={50}
                        strokeColor={getComplianceColorCode(complianceRating)}
                    /> :
                        <NATag />
                    }
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

                <div className="flex gap-x-2 items-center mt-2">
                    <RegulatoryFrameworkTag standard={regulatoryFramework} />
                    {requirement?.reference && regulatoryFramework && (
                        <Tag color="geekblue">
                            {(() => {
                                const refNormalized = requirement.reference.toLowerCase().replace(/\s+/g, "");
                                const frameworkNormalized = regulatoryFramework.toLowerCase().replace(/\s+/g, "");

                                return refNormalized.includes(frameworkNormalized)
                                    ? requirement.reference.replace(new RegExp(regulatoryFramework, "gi"), "").trim()
                                    : requirement.reference;
                            })()}
                        </Tag>
                    )}
                </div>

                <Typography className="my-4" textSize='h4'>Summary of research</Typography>

                <p>{requirementAssessment?.objective_research_summary || 'No summary available.'}</p>

                <Typography className="my-4" textSize='h4'>Selected Documents</Typography>

                <ul className="list-disc pl-5">
                    {requirementAssessment?.sources && requirementAssessment?.sources.length > 0 ? (
                        requirementAssessment.sources.map((source, index) => {
                            const file = files.find((file) => file.number === source);
                            return (
                                <li key={`source-${index}`}>
                                    {file ? (
                                        <button
                                            className="text-blue-600 underline"
                                            onClick={() => viewFile(file.id, async (id) => fetchFileData(id, wasmModule, {}, () => { }), blobUrls, setBlobUrls, setViewLoading)}
                                        >
                                            {file.title}
                                        </button>
                                    ) : (
                                        "Unknown Source"
                                    )}
                                </li>
                            );
                        })
                    ) : (
                        <li>No sources available.</li>
                    )}
                </ul>


                {/* <Typography className="my-4" textSize='h4'>Selected Quotes</Typography>

                {requirementAssessment?.quotes && Array.isArray(requirementAssessment.quotes) && requirementAssessment.quotes.length > 0 ? (
                    <ul>
                        {requirementAssessment.quotes.map((quote, index) => (
                            <ReactMarkdown key={`${quote}-${index}`}>{quote.pretty}</ReactMarkdown>
                        ))}
                    </ul>
                ) : (
                    <p>No quotes available.</p>
                )} */}

                <Typography className="my-4" textSize='h4'>Key findings</Typography>

                {requirementAssessment?.negative_findings && requirementAssessment?.negative_findings?.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {requirementAssessment.negative_findings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No key findings available.</p>
                )}

                <Typography className="my-4" textSize='h4'>Detailed assessment</Typography>

                <ReactMarkdown>{requirementAssessment?.details || 'No detailed assessment available.'}</ReactMarkdown>
            </div>
        </Modal>
    );
};

export default DetailedAssessmentModal;
