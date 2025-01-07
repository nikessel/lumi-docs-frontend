'use client'
import React, { useState, useEffect } from "react";
import { Button, Progress, Tooltip, Dropdown, Menu, Table, Skeleton } from "antd";
import {
    MoreOutlined,
    DeleteOutlined,
    ShareAltOutlined,
    FolderOutlined,
} from "@ant-design/icons";
import Typography from "../typography";
import "@/styles/globals.css";
import { useRouter } from "next/navigation";
import Checked from "@/assets/checked.svg";
import Unchecked from "@/assets/unchecked.svg";
import Logo from "@/assets/logo.svg";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';

interface ReportMetaViewProps {
    id?: string,
    title?: string;
    regulatoryFramework?: string;
    compliance?: number;
    viewType: "card" | "row";
    createdOn?: string,
    loading?: boolean
}

// Map regulatory frameworks to their respective SVG paths
const frameworkIcons: Record<string, string> = {
    "ISO 13485": "/assets/iso13485.svg",
    "ISO 14155": "/assets/iso14155.svg",
    "ISO 14971": "/assets/iso14971.svg",
    "ISO 10993": "/assets/iso10993.svg",
};

const ReportMetaView: React.FC<ReportMetaViewProps> = ({
    id,
    title,
    regulatoryFramework,
    compliance,
    viewType,
    createdOn,
    loading
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
        // Use the new query string to update the URL
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('selectedReports', updatedReports.join(","));
        // Updating the URL using useSearchParams
        window.history.replaceState(null, '', `${window.location.pathname}?${newSearchParams.toString()}`);
    };


    // Menu for the dropdown
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
        if (viewType === "card") {
            // Skeleton for Card View
            return (
                <div className="relative w-64 border rounded-lg shadow-sm p-4">
                    <Skeleton active title={{ width: "60%" }} paragraph={false} />
                    <div className="pt-2"><Skeleton active title={{ width: "30%" }} paragraph={false} /></div>
                    <div className="flex justify-between items-center mt-6">
                        <Skeleton.Button active shape="circle" size="large" />
                        <Skeleton.Button active block={false} shape="default" />
                    </div>
                </div>
            );
        } else {
            // Skeleton for Row View
            return (

                <div className="flex items-center justify-between border-b py-1">
                    <div className="flex-1 ">
                        <Skeleton title={{ width: "40%" }} paragraph={false} active />
                    </div>
                    <div className="flex items-center space-x-12">
                        <Skeleton title={{ width: "10%" }} paragraph={false} active />
                        <Skeleton.Button active shape="default" size="small" />
                        <Skeleton.Avatar active size="small" shape="circle" />
                        <Skeleton.Button active shape="default" size="small" />
                        <Skeleton.Button active shape="default" size="small" />
                    </div>
                </div >



            );
        }
    }

    // Card View Layout
    if (viewType === "card") {
        return (
            <div className="relative w-64 border rounded-lg shadow-sm" onClick={toggleSelection}>
                {/* Header Section */}
                <div >

                    <div className="flex justify-between items-center pr-1">

                        <div className="truncate">
                            <div className="pl-2 flex gap-2">
                                <Image
                                    src={isSelected ? Checked : Unchecked}
                                    alt="chekbox"
                                    width={20}
                                />
                                <div className="pt-2">
                                    <Typography textSize="h4">{title}</Typography>
                                    <Typography color="secondary" textSize="small">
                                        {regulatoryFramework} - {createdOn}
                                    </Typography>
                                </div>
                            </div>


                        </div>

                        <div className="flex items-center">
                            <Button
                                type="link"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent event from propagating to the parent div
                                    router.push(`/reports/view?selectedReports=${id}`);
                                }}
                            >
                                Open
                            </Button>
                            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                                <Button type="text" icon={<MoreOutlined />} />
                            </Dropdown>
                        </div>

                    </div>

                    {/* Progress Section */}
                    <div
                        className="px-4 py-2 mt-6 flex justify-between items-center"
                        style={{ borderTop: "1px solid #f5f5f5" }}
                    >
                        <Tooltip title="Compliance score">
                            <Progress size={40} type="circle" percent={compliance} />
                        </Tooltip>
                        <Tooltip title="Resolved tasks">
                            <Progress steps={5} size={10} percent={50} />
                        </Tooltip>
                    </div>
                </div>
            </div>
        );
    }

    // Row View Layout
    return (
        <div className="flex items-center justify-between border-b py-1" onClick={toggleSelection}>
            <div className="flex items-center gap-3">
                <Image
                    src={isSelected ? Checked : Unchecked}
                    alt="chekbox"
                    width={20}
                />
                <Typography >{title}</Typography>
                <Typography className="" color="secondary" textSize="small">
                    {regulatoryFramework}
                </Typography>
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
                        e.stopPropagation(); // Prevent event from propagating to the parent div
                        router.push(`/reports/view?selectedReports=${id}`);
                    }}
                >
                    Open
                </Button>
                <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            </div>
        </div >
    );
};

export default ReportMetaView;

