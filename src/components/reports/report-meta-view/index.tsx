'use client';
import React, { useState, useEffect } from "react";
import { Button, Progress, Tooltip, Dropdown, Menu, Skeleton, Tag, Checkbox, Modal, Input } from "antd";
import { MoreOutlined, FolderOutlined, ReloadOutlined, EditOutlined } from "@ant-design/icons";
import Typography from "../../common/typography";
import "@/styles/globals.css";
import { useRouter } from "next/navigation";
import RegulatoryFrameworkTag from "../regulatory-framework-tag";
import { Report } from '@wasm';
import { archiveReport, isArchived, restoreReport, renameReport } from "@/utils/report-utils";
import { message as antdMessage } from "antd";
import type * as WasmModule from "@wasm";
import ReportStatusTag from "../report-status-tag";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useSearchParamsState } from "@/contexts/search-params-context";
import { LoadingOutlined } from "@ant-design/icons";
import { extractProgress } from "@/utils/report-utils";

interface ReportMetaViewProps {
    openRedirectPath: string,
    report: Report | null,
    wasmModule: typeof WasmModule | null;
    setActionLoading: (input: boolean) => void;
    actionLoading: boolean;
    loading?: boolean
}

const ReportMetaView: React.FC<ReportMetaViewProps> = ({
    report,
    openRedirectPath,
    loading,
    wasmModule,
    setActionLoading,
    actionLoading
}) => {
    const router = useRouter();
    const { selectedReports, toggleSelectedReport } = useSearchParamsState();
    const [isSelected, setIsSelected] = useState(false);
    const [messageApi, contextHolder] = antdMessage.useMessage();
    const addStaleReportId = useCacheInvalidationStore((state) => state.addStaleReportId)
    const [assessmentProgress, setAssessmentProgress] = useState(0)
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate)
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [newReportName, setNewReportName] = useState("");

    useEffect(() => {
        if (report?.status === "processing") {
            const progress = extractProgress(report.title)
            setAssessmentProgress(progress)
        }
    }, [report])

    useEffect(() => {
        if (report?.id) {
            setIsSelected(selectedReports.includes(report.id));
        }
    }, [selectedReports, report?.id]);

    const toggleSelection = () => {
        if (!report?.id || (report?.status === "processing" && assessmentProgress === 0)) return
        toggleSelectedReport(report.id)
    };

    const handleArchiveReport = async (e: React.MouseEvent, id: string | undefined) => {
        setActionLoading(true)
        e.stopPropagation();
        if (!id) {
            setActionLoading(false)
            return
        }
        const messageKey = `${Date.now()}`

        try {
            messageApi.open({
                key: messageKey,
                type: 'loading',
                content: 'Archiving report...',
                duration: 0,
            });
            await archiveReport(wasmModule, id);
            addStaleReportId(id)
            triggerUpdate("reports")

        } catch (error) {
            messageApi.open({
                key: messageKey,
                type: 'error',
                content: 'Could not archive report',
                duration: 0,
            });
            console.error("Error archiving report:", error);
        }
        setActionLoading(false)

    };

    const handleRestoreReport = async (e: React.MouseEvent, id: string | undefined) => {
        setActionLoading(true)
        e.stopPropagation();
        if (!id) {
            setActionLoading(false)
            return
        }
        const messageKey = `${Date.now()}`

        try {
            messageApi.open({
                key: messageKey,
                type: 'loading',
                content: 'Restoring report...',
                duration: 0,
            });
            await restoreReport(wasmModule, id);
            addStaleReportId(id)
            triggerUpdate("reports")

        } catch (error) {
            messageApi.open({
                key: messageKey,
                type: 'error',
                content: 'Could not restore report',
                duration: 0,
            });
            console.error("Error restoring report:", error);
        }
        setActionLoading(false)
    };

    const handleRename = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const messageKey = `${Date.now()}`
        if (!report?.id || !newReportName.trim()) {
            messageApi.open({
                key: messageKey,
                type: 'error',
                content: 'Please enter a new report name',
                duration: 2,
            });
            return
        }

        try {
            messageApi.open({
                key: messageKey,
                type: 'loading',
                content: 'Renaming report...',
                duration: 0,
            });
            await renameReport(wasmModule, report.id, newReportName);
            addStaleReportId(report.id)
            triggerUpdate("reports")
            setIsRenameModalVisible(false);
            setNewReportName("");
            messageApi.open({
                key: messageKey,
                type: 'success',
                content: 'Report renamed successfully',
                duration: 2,
            });
        } catch (error) {
            messageApi.open({
                key: messageKey,
                type: 'error',
                content: 'Could not rename report',
                duration: 2,
            });
            console.error("Error renaming report:", error);
        }
    };

    const menu = (
        <Menu>
            {!isArchived(report?.status) && (
                <Menu.Item
                    key="rename"
                    onClick={(info) => {
                        info.domEvent.stopPropagation();
                        setIsRenameModalVisible(true);
                        setNewReportName(report?.title || "");
                    }}
                    icon={<EditOutlined />}
                >
                    Rename
                </Menu.Item>
            )}
            {!isArchived(report?.status) && (
                <Menu.Item
                    key="archive"
                    onClick={(info) => handleArchiveReport(info.domEvent as React.MouseEvent, report?.id)}
                    icon={<FolderOutlined />}
                    disabled={actionLoading}
                >
                    Archive
                </Menu.Item>
            )}
            {isArchived(report?.status) && (
                <Menu.Item
                    key="restore"
                    onClick={(info) => handleRestoreReport(info.domEvent as React.MouseEvent, report?.id)}
                    icon={<ReloadOutlined />}
                    disabled={actionLoading}
                >
                    Restore
                </Menu.Item>
            )}
        </Menu>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-between border-b py-1">
                <div className="flex-1">
                    <Skeleton title={{ width: "40%" }} paragraph={false} active />
                </div>
                <div className="flex items-center space-x-12">
                    <Skeleton title={{ width: "10%" }} paragraph={false} active />
                    <Skeleton.Button active shape="default" size="small" />
                    <Skeleton.Avatar active size="small" shape="circle" />
                    <Skeleton.Button active shape="default" size="small" />
                    <Skeleton.Button active shape="default" size="small" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={'relative flex items-center justify-between border-b py-1 cursor-pointer'}
            onClick={toggleSelection}
        >
            {contextHolder}
            <Modal
                title="Rename Report"
                open={isRenameModalVisible}
                onOk={(e) => handleRename(e)}
                onCancel={(e) => {
                    e.stopPropagation();
                    setIsRenameModalVisible(false);
                    setNewReportName("");
                }}
                okText="Rename"
            >
                <Input
                    placeholder="Enter new report name"
                    value={newReportName}
                    onChange={(e) => setNewReportName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                />
            </Modal>



            <div className={`flex items-center gap-3`}>



                <Checkbox disabled={report?.status === "processing" && assessmentProgress === 0}
                    checked={isSelected} />

                {report?.status === "processing" ?
                    <Tag color="geekblue">Processing {`${assessmentProgress}%`}<LoadingOutlined style={{ marginLeft: 5 }} /></Tag>
                    : ""}

                {report?.status !== "processing" && <Typography>{report?.title}</Typography>}

            </div>

            <div
                className={`flex items-center space-x-6 }`}
            >
                {report?.status !== "processing" && <div className="w-20 flex justify-center">
                    <ReportStatusTag status={report?.status} />
                </div>}
                <div className="w-20 flex justify-center">
                    <RegulatoryFrameworkTag standard={report?.regulatory_framework} />
                </div>
                <div className="w-20 flex justify-center ">
                    <Typography color="secondary" textSize="small">
                        {report?.created_date ? new Date(report?.created_date).toLocaleDateString() : ""}
                    </Typography>
                </div>
                {report?.status !== "processing" && <Tooltip title={`Compliance score: ${report?.compliance_rating}%`}>
                    <Progress size={20} type="circle" percent={report?.compliance_rating} showInfo={false} />
                </Tooltip>}
                {!isArchived(report?.status) ? <Button
                    type="link"
                    size="small"
                    disabled={report?.status === "processing" && assessmentProgress === 0}
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`${openRedirectPath}?selectedReports=${report?.id}`);
                    }}
                >
                    {report?.status === "processing" ? "Open Partial" : "Open"}
                </Button> : ""}
                {report?.status !== "processing" && <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                    <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                </Dropdown>}
            </div>
        </div>
    );

};

export default ReportMetaView;
