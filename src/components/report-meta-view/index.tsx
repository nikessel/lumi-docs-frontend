'use client';
import React, { useState, useEffect } from "react";
import { Button, Progress, Tooltip, Dropdown, Menu, Skeleton, Tag } from "antd";
import { MoreOutlined, DeleteOutlined, ShareAltOutlined, FolderOutlined, ReloadOutlined } from "@ant-design/icons";
import Typography from "../typography";
import "@/styles/globals.css";
import { useRouter } from "next/navigation";
import Checked from "@/assets/checked.svg"
import Unchecked from "@/assets/unchecked.svg";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import RegulatoryFrameworkTag from "../regulatory-framework-tag";
import { Report } from '@wasm';
import { formatStatus } from "@/utils/styling-utils";
import { archiveReport, isArchived, restoreReport } from "@/utils/report-utils";
import { message as antdMessage } from "antd";
import type * as WasmModule from "@wasm";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import ReportStatusTag from "../report-status-tag";
import useCacheInvalidationStore from "@/stores/cache-validation-store";
import { useGlobalActionsStore } from "@/stores/global-actions-store";

interface ReportMetaViewProps {
    openRedirectPath: string,
    report: Report | null,
    loading?: boolean
    wasmModule: typeof WasmModule | null;
}

const ReportMetaView: React.FC<ReportMetaViewProps> = ({
    report,
    openRedirectPath,
    loading,
    wasmModule,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedReports = searchParams.get('selectedReports')?.split(",") || [];
    const [isSelected, setIsSelected] = useState(selectedReports.includes(report?.id || ""));
    const [actionLoading, setActionLoading] = useState("");
    const [messageApi, contextHolder] = antdMessage.useMessage();
    const addStaleReportId = useCacheInvalidationStore((state) => state.addStaleReportId)
    const addRestoringId = useGlobalActionsStore((state) => state.addRestoringId)
    const addArchivingId = useGlobalActionsStore((state) => state.addArchivingId)
    const triggerUpdate = useCacheInvalidationStore((state) => state.triggerUpdate)

    useEffect(() => {
        setIsSelected(selectedReports.includes(report?.id || ""));
    }, [selectedReports, report?.id]);


    const toggleSelection = () => {
        const updatedReports = isSelected
            ? selectedReports.filter((reportId) => reportId !== report?.id)
            : [...selectedReports, report?.id];
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('selectedReports', updatedReports.join(","));
        window.history.replaceState(null, '', `${window.location.pathname}?${newSearchParams.toString()}`);
    };

    const handleArchiveReport = async (e: React.MouseEvent, action: string) => {
        e.stopPropagation();
        if (!report?.id) return;

        setActionLoading(action);

        try {
            const res = await archiveReport(wasmModule, report.id);
            addArchivingId(report.id)
            addStaleReportId(report.id)
            triggerUpdate("reports")
        } catch (error) {
            console.error("Error archiving report:", error);
        }
    };

    const handleRestoreReport = async (e: React.MouseEvent, action: string) => {
        e.stopPropagation();
        if (!report?.id) return;

        setActionLoading(action);

        try {
            const res = await restoreReport(wasmModule, report.id);
            addRestoringId(report.id)
            addStaleReportId(report.id)
            triggerUpdate("reports")
        } catch (error) {
            console.error("Error archiving report:", error);
        }
    };


    const menu = (
        <Menu>
            {!isArchived(report?.status) ?
                <Menu.Item
                    key="archive"
                    onClick={(info) => handleArchiveReport(info.domEvent as React.MouseEvent, "archive")}
                    icon={<FolderOutlined />}
                >
                    Archive
                </Menu.Item> :
                <Menu.Item
                    key="restore"
                    onClick={(info) => handleRestoreReport(info.domEvent as React.MouseEvent, "restore")}
                    icon={<ReloadOutlined />}
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
            {report?.status === "processing" && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-70 flex items-center justify-center z-10">
                    <Typography textSize="small" className="text-gray-500">
                        Processing...
                    </Typography>
                </div>
            )}

            <div className={`flex items-center gap-3 ${report?.status === "processing" ? "opacity-50" : ""}`}>
                <Image src={isSelected ? Checked : Unchecked} alt="checkbox" width={20} />
                <Typography>{report?.title}</Typography>
            </div>
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
