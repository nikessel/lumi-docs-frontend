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
import SavedViews from "./saved-views";
import { useRouter } from "next/navigation";

const Page = () => {
    const router = useRouter();
    const { user, loading: userLoading, error: userError } = useUser(0)
    const { reports, loading: reportsLoading, error: reportsError } = useAllReports()
    const { tasks, loading: tasksLoading, error: tasksError } = useAllReportsTasks(reports)
    const isLoading = tasksLoading || reportsLoading || userLoading
    return (
        <div className="flex" style={{ height: "75vh" }}>
            <div className="w-2/3 pr-4 flex flex-col gap-6">
                <ReportList reports={reports} onViewAll={() => router.push("/reports")} isLoading={isLoading} />
                <div style={{ height: "38vh" }}>
                    <SavedViews isLoading={isLoading} />
                </div>
            </div>
            <div className="w-1/3">
                <TaskList tasks={tasks} onViewAll={() => router.push("/tasks")} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default Page;