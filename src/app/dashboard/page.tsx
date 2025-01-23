'use client';
import React from "react";
import Typography from "@/components/typography";
import { Button, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "@/styles/globals.css";
import { useUserContext } from "@/contexts/user-context";
import { useAllReports } from "@/hooks/report-hooks";
import { useAllReportsTasks } from "@/hooks/tasks-hooks";
import ReportList from "./report-list";
import TaskList from "@/components/tasks-list/task-list";
import SavedViews from "./saved-views";
import { useRouter } from "next/navigation";
import { useAllReportsContext } from "@/contexts/reports-context/all-reports-context";
import { useAllReportsTasksContext } from '@/contexts/tasks-context/all-report-tasks';

const Page = () => {
    const router = useRouter();

    const { user, loading: userLoading, error: userError } = useUserContext()
    const { reports, loading: reportsLoading, error: reportsError } = useAllReportsContext()
    const { tasks, loading: tasksLoading, error: tasksError } = useAllReportsTasksContext()

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