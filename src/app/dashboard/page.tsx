'use client';
import React from "react";
import Typography from "@/components/typography";
import { Button, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "@/styles/globals.css";
import { useUser } from "@/hooks/user-hooks";
import { useAllReports } from "@/hooks/report-hooks";
import { useAllReportsTasks } from "@/hooks/tasks-hooks";
import ReportList from "./report-list";
import TaskList from "./task-list";
import SavedViews, { SavedView } from "./saved-views";

const Page = () => {
    const { user, loading: userLoading, error: userError } = useUser(0)
    const { reports, loading: reportsLoading, error: reportsError } = useAllReports()
    const { tasks, loading: tasksLoading, error: tasksError } = useAllReportsTasks(reports)

    const reportsData = [
        {
            regulatoryFramework: "iso13485",
            complianceRating: 25,
            unresolvedTasks: 97,
            title: "This is a report title"
        },
        {
            regulatoryFramework: "mdr",
            complianceRating: 40,
            unresolvedTasks: 42,
            title: "This is a report title"
        },
        {
            regulatoryFramework: "iso14971",
            complianceRating: 70,
            unresolvedTasks: 15,
            title: "This is a report title"
        },
        {
            regulatoryFramework: "iso14971",
            complianceRating: 55,
            unresolvedTasks: 20,
            title: "This is a report title"
        },
        {
            regulatoryFramework: "iso14155",
            complianceRating: 80,
            unresolvedTasks: 5,
            title: "This is a report title"
        },
    ];

    const handleViewAll = () => {
        console.log("View All clicked");
    };

    const tasksData = [
        { title: "Instructions For Use", taskCount: 8, icon: "IFU" },
        { title: "Clinical Investigation Plan", taskCount: 6, icon: "CIP" },
        { title: "Intended Purpose", taskCount: 7, icon: "P" },
        { title: "Clinical Evaluation Report", taskCount: 9, icon: "CER" },
        { title: "Risk Traceability Matrix", taskCount: 2, icon: "RTM" },
        { title: "Biological Evaluation Plan", taskCount: 10, icon: "BEP" },
    ];

    const viewsData: SavedView[] = [
        { icon: "SV", title: "Saved View 1", onView: () => console.log("Viewing Saved View 1"), description: "This is a descasdasdasdasdasd" },
        { icon: "TP", title: "Test Plan", onView: () => console.log("Viewing Test Plan"), description: "This is a descasdasdasdasdasd" },
        { icon: "CD", title: "Clinical Data", onView: () => console.log("Viewing Clinical Data"), description: "This is a descasdasdasdasdasd" },
        { icon: "SV", title: "Saved View 1", onView: () => console.log("Viewing Saved View 1"), description: "This is a descasdasdasdasdasd" },
        { icon: "TP", title: "Test Plan", onView: () => console.log("Viewing Test Plan"), description: "This is a descasdasdasdasdasd" },
        { icon: "CD", title: "Clinical Data", onView: () => console.log("Viewing Clinical Data"), description: "This is a descasdasdasdasdasd" },
        { icon: "SV", title: "Saved View 1", onView: () => console.log("Viewing Saved View 1"), description: "This is a descasdasdasdasdasd" },
        { icon: "TP", title: "Test Plan", onView: () => console.log("Viewing Test Plan"), description: "This is a descasdasdasdasdasd" },
        { icon: "CD", title: "Clinical Data", onView: () => console.log("Viewing Clinical Data"), description: "This is a descasdasdasdasdasd" },
    ];

    return (
        <div>
            <div className="flex w-full ">
                <div className="w-2/3 pr-4 flex flex-col gap-6">
                    <ReportList reports={reportsData} onViewAll={handleViewAll} />
                    <SavedViews views={viewsData} />
                </div>
                <div className="w-1/3">
                    <TaskList tasks={tasksData} onViewAll={handleViewAll} />
                </div>
            </div>

        </div>
    );
};

export default Page;