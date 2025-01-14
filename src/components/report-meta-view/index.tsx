'use client';
import React, { useState, useEffect } from "react";
import { Button, Progress, Tooltip, Dropdown, Menu, Skeleton, Tag } from "antd";
import { MoreOutlined, DeleteOutlined, ShareAltOutlined, FolderOutlined } from "@ant-design/icons";
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

interface ReportMetaViewProps {
    openRedirectPath: string,
    report: Report | null,
    loading?: boolean
}

const ReportMetaView: React.FC<ReportMetaViewProps> = ({
    report,
    openRedirectPath,
    loading
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedReports = searchParams.get('selectedReports')?.split(",") || [];
    const [isSelected, setIsSelected] = useState(selectedReports.includes(report?.id || ""));

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

    const menu = (
        <Menu>
            <Menu.Item key="archive" icon={<FolderOutlined />}>
                Archive
            </Menu.Item>
            <Menu.Item key="share" icon={<ShareAltOutlined />}>
                Share
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                Delete
            </Menu.Item>
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
        >
            {/* Overlay for processing */}
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
                    className={`flex items-center space-x-12 }`}
                >
                    <div className="w-32 flex justify-center">
                        {report?.status === "ready" ? <Tag color="green">{formatStatus(report?.status)}</Tag> : <Tag color="red">{formatStatus(report?.status)}</Tag>}
                    </div>
                    <div className="w-32 flex justify-center">
                        <RegulatoryFrameworkTag standard={report?.regulatory_framework} />
                    </div>
                    <Typography color="secondary" textSize="small">
                        {new Date(report?.created_date).toLocaleDateString()}
                    </Typography>
                    <Tooltip title={`Resolved Tasks: 50%`}>
                        <Progress steps={5} size={8} percent={50} showInfo={false} />
                    </Tooltip>
                    <Tooltip title={`Compliance score: ${report?.compliance_rating}%`}>
                        <Progress size={20} type="circle" percent={report?.compliance_rating} showInfo={false} />
                    </Tooltip>
                    <Button
                        type="link"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`${openRedirectPath}?selectedReports=${report?.id}`);
                        }}
                    >
                        Open
                    </Button>
                    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                </div> : ""}
        </div>
    );

};

export default ReportMetaView;
