'use client';
import React, { useState, useEffect } from "react";
import { Button, Progress, Tooltip, Dropdown, Menu, Skeleton, Tag } from "antd";
import { MoreOutlined, FolderOutlined, ReloadOutlined } from "@ant-design/icons";
import Typography from "../typography";
import "@/styles/globals.css";
import { useRouter } from "next/navigation";
import Checked from "@/assets/checked.svg"
import Unchecked from "@/assets/unchecked.svg";
import Image from "next/image";
import RegulatoryFrameworkTag from "../regulatory-framework-tag";
import { Report } from '@wasm';
import { archiveReport, isArchived, restoreReport } from "@/utils/report-utils";
import { message as antdMessage } from "antd";
import type * as WasmModule from "@wasm";
import ReportStatusTag from "../report-status-tag";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useSearchParamsState } from "@/contexts/search-params-context";

const extractProgress = (title: string): number => {
    const match = title.match(/(\d+)\/(\d+)/);
    if (!match) return 0; // Default to 0% if no match is found

    const completed = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);

    return total > 0 ? Math.round((completed / total) * 100) : 0;
};

interface ReportMetaViewProps {
    openRedirectPath: string,
    report: Report | null,
    wasmModule: typeof WasmModule | null;
    forceUpdate: () => Promise<string>,
    setActionLoading: (input: boolean) => void;
    actionLoading: boolean;
    loading?: boolean
}

const ReportMetaView: React.FC<ReportMetaViewProps> = ({
    report,
    openRedirectPath,
    loading,
    wasmModule,
    forceUpdate,
    setActionLoading,
    actionLoading
}) => {
    const router = useRouter();
    const { selectedReports, toggleSelectedReport } = useSearchParamsState();
    const [isSelected, setIsSelected] = useState(selectedReports.includes(report?.id || ""));
    const [messageApi, contextHolder] = antdMessage.useMessage();
    const addStaleReportId = useCacheInvalidationStore((state) => state.addStaleReportId)
    const [assessmentProgres, setAssessmentProgress] = useState(0)

    useEffect(() => {
        if (report?.status === "processing") {
            const progress = extractProgress(report.title)
            setAssessmentProgress(progress)
        }
    }, [report])

    useEffect(() => {
        setIsSelected(selectedReports.includes(report?.id || ""));
    }, [selectedReports, report?.id]);


    const toggleSelection = () => {
        if (!report?.id) return
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
                duration: 0, // Keeps the message visible until updated
            });
            await archiveReport(wasmModule, id);
            addStaleReportId(id)
            await forceUpdate()

        } catch (error) {
            messageApi.open({
                key: messageKey,
                type: 'error',
                content: 'Could not archive report',
                duration: 0, // Keeps the message visible until updated
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
                duration: 0, // Keeps the message visible until updated
            });
            await restoreReport(wasmModule, id);
            addStaleReportId(id)
            await forceUpdate()
        } catch (error) {
            messageApi.open({
                key: messageKey,
                type: 'error',
                content: 'Could not restore report',
                duration: 2, // Message disappears after 2 seconds
            });
            console.error("Error archiving report:", error);
        }
        setActionLoading(false)
    };


    const menu = (
        <Menu>
            {!isArchived(report?.status) ?
                <Menu.Item
                    key="archive"
                    onClick={(info) => handleArchiveReport(info.domEvent as React.MouseEvent, report?.id)}
                    icon={<FolderOutlined />}
                    disabled={actionLoading}
                >
                    Archive
                </Menu.Item> :
                <Menu.Item
                    key="restore"
                    onClick={(info) => handleRestoreReport(info.domEvent as React.MouseEvent, report?.id)}
                    icon={<ReloadOutlined />}
                    disabled={actionLoading}
                >
                    Restore
                </Menu.Item>
            }
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
            className={`relative flex items-center justify-between border-b py-1 ${report?.status === "processing" ? "cursor-not-allowed" : "cursor-pointer"
                }`}
            onClick={report?.status === "processing" ? undefined : toggleSelection}
        >{contextHolder}


            {report?.status === "processing" ?
                <Tooltip title="The report progress is updated every 5 minutes">
                    <div
                        style={{ width: "100%" }}
                        className={`flex items-center gap-3 flex`}
                    >
                        <div className="whitespace-nowrap mr-3">{report.title}</div>
                        <Progress status="active" percent={assessmentProgres} />
                    </div>
                </Tooltip>
                :
                <div className={`flex items-center gap-3`}>
                    <Image src={isSelected ? Checked : Unchecked} alt="checkbox" width={20} />
                    <Typography>{report?.title}</Typography>
                </div>
            }
            {report?.status !== "processing" ?
                <div
                    className={`flex items-center space-x-6 }`}
                >
                    <div className="w-20 flex justify-center">
                        <ReportStatusTag status={report?.status} />
                    </div>
                    <div className="w-20 flex justify-center">
                        <RegulatoryFrameworkTag standard={report?.regulatory_framework} />
                    </div>
                    <div className="w-20 flex justify-center ">
                        <Typography color="secondary" textSize="small">
                            {report?.created_date ? new Date(report?.created_date).toLocaleDateString() : ""}
                        </Typography>
                    </div>
                    <Tooltip title={`Resolved Tasks: 50%`}>
                        <Progress steps={5} size={8} percent={50} showInfo={false} />
                    </Tooltip>
                    <Tooltip title={`Compliance score: ${report?.compliance_rating}%`}>
                        <Progress size={20} type="circle" percent={report?.compliance_rating} showInfo={false} />
                    </Tooltip>
                    {!isArchived(report?.status) ? <Button
                        type="link"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`${openRedirectPath}?selectedReports=${report?.id}`);
                        }}
                    >
                        Open
                    </Button> : ""}
                    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                        <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                    </Dropdown>
                </div> : ""}
        </div>
    );

};

export default ReportMetaView;
