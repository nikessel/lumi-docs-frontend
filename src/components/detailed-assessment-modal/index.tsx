'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Progress, Divider, Tag, Button, Spin } from 'antd';
import { Task, Requirement, RegulatoryFramework } from '@wasm';
import { getComplianceColorCode } from '@/utils/formating';
import Typography from '../typography';
import ReactMarkdown from "react-markdown";
import RegulatoryFrameworkTag from '../regulatory-framework-tag';
import { useFilesContext } from '@/contexts/files-context';
import { viewFile, fetchFileData } from "@/utils/files-utils";
import { useWasm } from "@/components/WasmProvider";
import NATag from '../non-applicable-tag';
import { getTasksByReportAndRequirmentId } from '@/utils/tasks-utils';
import { updateTaskStatus } from '@/utils/tasks-utils';
import { useDocumentsContext } from '@/contexts/documents-context';
import { LoadingOutlined } from "@ant-design/icons";
import { RequirementAssessmentWithId } from '@/hooks/report-hooks';


interface RequirementModalProps {
    requirement: Requirement | undefined;
    requirementAssessment: RequirementAssessmentWithId | undefined;
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
    const { documents, filesByDocumentId } = useDocumentsContext()
    const { wasmModule } = useWasm();
    const [blobUrls, setBlobUrls] = React.useState<{ [id: string]: string }>({});
    const [viewLoading, setViewLoading] = React.useState<{ [id: string]: boolean }>({});
    const [tasks, setTasks] = useState<Task[] | null>([])
    const [tasksLoading, setTasksLoading] = useState(false)
    const [taskLoading, setTaskLoading] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (requirement?.id && requirementAssessment?.reportId && wasmModule) {
            setTasksLoading(true)
            getTasksByReportAndRequirmentId(wasmModule, {
                report_id: requirementAssessment.reportId,
                requirement_id: requirement.id,
            })
                .then(setTasks)
                .catch((error) => {
                    console.error("Failed to fetch tasks:", error);
                }).finally(() => {
                    setTasksLoading(false)
                });
        }
    }, [requirement?.id, requirementAssessment?.reportId, wasmModule]);

    const handleAddToDo = async (task: Task) => {
        setTaskLoading(prev => ({ ...prev, [task.id!]: true }));
        try {
            await updateTaskStatus(wasmModule, task, "open");
            // Refetch tasks
            const updatedTasks = await getTasksByReportAndRequirmentId(wasmModule, {
                report_id: requirementAssessment!.reportId,
                requirement_id: requirement!.id,
            });
            setTasks(updatedTasks);
        } catch (error) {
            console.error("Error adding To Do:", error);
        } finally {
            setTaskLoading(prev => ({ ...prev, [task.id!]: false }));
        }
    };

    // Renders the sources section
    const renderSources = () => (
        <div className="my-4">
            <Typography textSize="h4">Sources and Research Summary</Typography>
            <div className="mt-2 p-4">
                <div className="mb-4">
                    <p>
                        {requirementAssessment?.objective_research_summary || 'No summary available.'}
                    </p>
                </div>
                <Typography textSize="h5" className="mb-2">Sources</Typography>
                <ul className="list-disc pl-5">
                    {requirementAssessment?.sources && requirementAssessment.sources.length > 0 ? (
                        requirementAssessment.sources.map((source, index) => {
                            const document = documents.find((document) => document.number.toString() === String(source));
                            const file = document && filesByDocumentId[document.id]

                            return (
                                <li key={`source-${index}`}>
                                    {document ? (
                                        <button
                                            className="text-blue-600 underline"
                                            onClick={() => file && viewFile(file.id, async (id) => fetchFileData(id, wasmModule, {}, () => { }), blobUrls, setBlobUrls, setViewLoading)}
                                        >
                                            {document.meta.title}
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
            </div>
        </div>
    );

    // Renders the detailed assessment section
    const renderDetails = () => (
        <div className="my-4">
            <Typography textSize="h4">Detailed Assessment</Typography>
            <div className="mt-2 p-4">
                <ReactMarkdown>
                    {requirementAssessment?.details || 'No detailed assessment available.'}
                </ReactMarkdown>
            </div>
        </div>
    );

    // Renders the task list
    const renderTaskList = () => (
        <>
            {tasksLoading ? (
                <div className="flex items-center justify-center">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                </div>
            ) : tasks && tasks.length > 0 ? (
                <ul className="list-disc pl-5">
                    {tasks.map((task) => (
                        <li key={task.id} className="my-4 flex items-center justify-between">
                            {task.status === "open" ? (
                                <div>
                                    <strong>{task.title}</strong> -
                                    <span className="text-gray-400 ml-1">Added To Do</span>
                                </div>
                            ) : task.status === "completed" ? (
                                <div className="flex items-center">
                                    <strong>{task.title}</strong>
                                    <Tag color="green" className="ml-2">✔ Completed</Tag>
                                </div>
                            ) : task.status === "ignored" ? (
                                <div className="line-through text-gray-400">
                                    <strong>{task.title}</strong>
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
                                        loading={taskLoading[task.id!]}
                                        onClick={() => handleAddToDo(task)}
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
            width="80%"
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
        >
            <Divider className="my-2" />

            {/* Header Section */}
            <div className="my-4">
                <div className="flex justify-between">
                    <Typography textSize="h4">Requirement</Typography>
                    <RegulatoryFrameworkTag
                        standard={regulatoryFramework}
                        additionalReference={requirement?.reference}
                    />
                </div>
                <p>{requirement?.description || 'No description available.'}</p>
            </div>

            {/* Assessment Section */}
            <div className="my-4">
                <Typography textSize="h4">Assessment</Typography>
                {requirementAssessment?.negative_findings &&
                    requirementAssessment.negative_findings.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {requirementAssessment.negative_findings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No key findings available.</p>
                )}
            </div>

            {/* Details and Sources */}
            {renderDetails()}
            {renderSources()}

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

export default DetailedAssessmentModal;
