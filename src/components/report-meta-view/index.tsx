'use client';
import React, { useState, useEffect } from "react";
import { Button, Progress, Tooltip, Dropdown, Menu, Skeleton } from "antd";
import { MoreOutlined, DeleteOutlined, ShareAltOutlined, FolderOutlined } from "@ant-design/icons";
import Typography from "../typography";
import "@/styles/globals.css";
import { useRouter } from "next/navigation";
import Checked from "@/assets/checked.svg";
import Unchecked from "@/assets/unchecked.svg";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import RegulatoryFrameworkTag from "../regulatory-framework-tag";

interface ReportMetaViewProps {
    openRedirectPath: string,
    id?: string;
    title?: string;
    regulatoryFramework?: string;
    compliance?: number;
    createdOn?: string;
    loading?: boolean;
}

const ReportMetaView: React.FC<ReportMetaViewProps> = ({
    id,
    title,
    regulatoryFramework,
    compliance,
    createdOn,
    loading,
    openRedirectPath
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedReports = searchParams.get('selectedReports')?.split(",") || [];
    const [isSelected, setIsSelected] = useState(selectedReports.includes(id || ""));

    useEffect(() => {
        setIsSelected(selectedReports.includes(id || ""));
    }, [selectedReports, id]);

    const toggleSelection = () => {
        const updatedReports = isSelected
            ? selectedReports.filter((reportId) => reportId !== id)
            : [...selectedReports, id];
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
        <div className="flex items-center justify-between border-b py-1" onClick={toggleSelection}>
            <div className="flex items-center gap-3">
                <Image src={isSelected ? Checked : Unchecked} alt="checkbox" width={20} />
                <Typography>{title}</Typography>
                <RegulatoryFrameworkTag standard={regulatoryFramework} />
            </div>
            <div className="flex items-center space-x-12">
                <Typography color="secondary" textSize="small">
                    {createdOn}
                </Typography>
                <Tooltip title={`Resolved Tasks: 50%`}>
                    <Progress steps={5} size={8} percent={50} showInfo={false} />
                </Tooltip>
                <Tooltip title={`Compliance score: ${compliance}%`}>
                    <Progress size={20} type="circle" percent={compliance} showInfo={false} />
                </Tooltip>
                <Button
                    type="link"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`${openRedirectPath}?selectedReports=${id}`);
                    }}
                >
                    Open
                </Button>
                <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            </div>
        </div>
    );
};

export default ReportMetaView;
