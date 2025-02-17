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
import { RequirementAssessmentWithId } from '@/app/reports/view/key_findings/page';
import { updateTaskStatus } from '@/utils/tasks-utils';
import { LoadingOutlined } from "@ant-design/icons";
import TaskActions from '@/app/reports/view/to_do/task-actions';

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


    console.log("Asdasdasd", requirement, requirementAssessment)
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

                <Typography className="my-4" textSize='h4'>Suggested tasks</Typography>
                {tasksLoading ? (
                    <div className="flex items-center justify-center">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    </div>
                ) : tasks && tasks.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {tasks.map((task) => (
                            <li key={task.id} className="my-4 flex items-center justify-between">
                                {/* Status-based Rendering */}
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
                                    // Default: Add To Do Button
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
            </div>
        </Modal>
    );
};

export default DetailedAssessmentModal;
