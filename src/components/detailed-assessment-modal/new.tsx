'use client';

import React from 'react';
import { Modal, Progress, Divider, Tag, Button, Collapse } from 'antd';
import ReactMarkdown from 'react-markdown';
import Typography from '../typography';
import RegulatoryFrameworkTag from '../regulatory-framework-tag';
import NATag from '../non-applicable-tag';
import { getComplianceColorCode } from '@/utils/formating';

const { Panel } = Collapse;

// Sample data for demonstration purposes
const sampleRequirement = {
    id: 'req-1',
    name: 'Sample Requirement',
    description:
        'This is a sample requirement description. And this is a longer description to make it more realistic.',
    reference: '7.1.1',
};

const sampleRequirementAssessment = {
    applicable: true,
    compliance_rating: 85,
    objective_research_summary:
        "The system demonstrates robust performance and exceptional reliability under varied conditions. Its design reflects thoughtful integration of user feedback and regulatory standards. Detailed analyses reveal a strong commitment to quality and continuous improvement. Comprehensive testing has validated the system’s efficiency and security measures. Minor documentation enhancements are suggested to optimize clarity and user experience.",
    details: `
The implementation exhibits remarkable consistency in performance across multiple testing phases. User evaluations confirm its intuitive interface and ease of navigation. Rigorous compliance checks underscore its adherence to industry standards and best practices. The risk management strategy is well-executed, with proactive measures addressing potential vulnerabilities. Overall, the assessment highlights a balanced approach to innovation and regulatory compliance.`,
    negative_findings: ['Sample negative finding.', 'Another sample negative finding.'],
    sources: [101, 102],
    reportId: 'rep-1',
};

const sampleRegulatoryFramework = 'iso13485';

const sampleFiles = [
    { id: 'file-1', number: 101, title: 'Design Requirements Specification' },
    { id: 'file-2', number: 102, title: 'Battery Test Report' },
];

const sampleTasks = [
    {
        id: 'task-1',
        status: 'unseen',
        title: 'Review documentation',
        description: 'Review sample docs for compliance.',
    },
    {
        id: 'task-2',
        status: 'completed',
        title: 'Update procedure',
        description: 'Procedure updated successfully.',
    },
];

interface RequirementModalProps {
    onClose: () => void;
    open: boolean;
}

const SampleDetailedAssessmentModal: React.FC<RequirementModalProps> = ({ onClose, open }) => {
    const complianceRating = sampleRequirementAssessment.compliance_rating || 0;

    // Renders the sources accordion using Tailwind for styling.
    const renderSourcesAccordion = () => (
        <div className="mt-2 inline-block bg-blue-50 text-blue-600 rounded-lg border border-blue-300 w-full">
            <Collapse ghost size="small">
                <Panel key="1" header={`${sampleRequirementAssessment.sources.length} Sources and Research Summary`}>
                    <ul className="list-disc pl-5">
                        {sampleRequirementAssessment.sources.length > 0 ? (
                            sampleRequirementAssessment.sources.map((source, index) => {
                                const file = sampleFiles.find((file) => file.number === source);
                                return (
                                    <li key={`source-${index}`}>
                                        {file ? (
                                            <button
                                                className="text-blue-600 underline"
                                                onClick={() => alert(`View file: ${file.title}`)}
                                            >
                                                {file.title}
                                            </button>
                                        ) : (
                                            'Unknown Source'
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <li>No sources available.</li>
                        )}
                    </ul>
                    <div className="mt-2">
                        <p>
                            {sampleRequirementAssessment.objective_research_summary || 'No summary available.'}
                        </p>
                    </div>
                </Panel>
            </Collapse>
        </div>
    );

    // Renders the detailed assessment accordion.
    const renderDetailsAccordion = () => (
        <div className="mt-2 inline-block bg-blue-50 text-blue-600 rounded-lg border border-blue-300 w-full">
            <Collapse ghost size="small">
                <Panel key="1" header="Detailed Assessment">
                    <ReactMarkdown>
                        {sampleRequirementAssessment.details || 'No detailed assessment available.'}
                    </ReactMarkdown>
                </Panel>
            </Collapse>
        </div>
    );

    // Renders the task list.
    const renderTaskList = () => (
        <>
            {sampleTasks && sampleTasks.length > 0 ? (
                <ul className="list-disc pl-5">
                    {sampleTasks.map((task) => (
                        <li key={task.id} className="my-1 flex items-center justify-between">
                            {task.status === 'open' ? (
                                <div>
                                    <strong>{task.title}</strong>{' '}
                                    <span className="text-gray-400 ml-1">Open</span>
                                </div>
                            ) : task.status === 'completed' ? (
                                <div className="flex items-center">
                                    <strong>{task.title}</strong>
                                    <Tag color="green" className="ml-2">
                                        ✔ Completed
                                    </Tag>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <strong>{task.title}</strong>
                                        <div className="text-text_secondary">{task.description}</div>
                                    </div>
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={() => alert(`Add task: ${task.title}`)}
                                        className="ml-4"
                                    >
                                        Add To Do
                                    </Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No suggested tasks available.</p>
            )}
        </>
    );

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width="50%"
            title={
                <div className="pr-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{sampleRequirement?.name || 'Requirement Details'}</span>
                    {sampleRequirementAssessment?.applicable ? <Progress
                        type="circle"
                        percent={complianceRating}
                        width={50}
                        strokeColor={getComplianceColorCode(complianceRating)}
                    /> :
                        <NATag />
                    }
                </div>
            }
        >
            <Divider className="my-2" />

            {/* Header Section */}
            <div className="my-4">
                <div className=" flex justify-between">
                    <Typography textSize="h4">Requirement</Typography>
                    <RegulatoryFrameworkTag
                        standard={sampleRegulatoryFramework}
                        additionalReference={sampleRequirement.reference}
                    />
                </div>
                <p>{sampleRequirement.description || 'No description available.'}</p>

            </div>



            <div className="my-4 bg-white rounded-lg">
                {/* Assessment Section */}
                <Typography className="pt-2" textSize="h4">Assessment</Typography>

                {/* Negative Findings */}
                {sampleRequirementAssessment.negative_findings &&
                    sampleRequirementAssessment.negative_findings.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {sampleRequirementAssessment.negative_findings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No key findings available.</p>
                )}

                {/* Details Accordion */}
                {renderDetailsAccordion()}
                {renderSourcesAccordion()}
            </div>

            {/* To Do Tasks */}
            <div className="my-4">
                <Typography textSize="h4">
                    To Do
                </Typography>
                {renderTaskList()}
            </div>
        </Modal>
    );
};

export default SampleDetailedAssessmentModal;
