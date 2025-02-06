'use client';
import React, { useEffect, useState } from "react";
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
import FirstReportModal from "@/components/user-guide-components/first-report-modal";

const Page = () => {
    const router = useRouter();

    const { user, loading: userLoading, error: userError } = useUserContext()
    const { reports, loading: reportsLoading, error: reportsError } = useAllReportsContext()
    const { tasks, loading: tasksLoading, error: tasksError } = useAllReportsTasksContext()

    const isLoading = tasksLoading || reportsLoading || userLoading
    const [isModalVisible, setIsModalVisible] = useState(true);


    // useEffect(() => {
    //     if (reports.length === 0 && !reportsLoading && !userLoading && !tasksLoading) {
    //         setIsModalVisible(true)
    //     }

    // }, [reports, reportsLoading, userLoading, tasksLoading])


    return (
        <div className="flex" style={{ height: "75vh" }}>
            <div className="w-2/3 pr-4 flex flex-col gap-6">
                <ReportList allTasks={tasks} reports={reports} onViewAll={() => router.push("/reports")} isLoading={isLoading} />
                <div style={{ height: "38vh" }}>
                    <SavedViews isLoading={isLoading} />
                </div>
            </div>
            <div className="w-1/3">
                <TaskList tasks={tasks} onViewAll={() => router.push("/tasks")} isLoading={isLoading} />
            </div>
            {/* <FirstReportModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
            /> */}
        </div>
    );
};

export default Page;