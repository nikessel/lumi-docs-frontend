'use client';
import React, { useState, useEffect } from "react";
import "@/styles/globals.css";
import { useUserContext } from "@/contexts/user-context";
import ReportList from "./report-list";
import TaskList from "@/components/tasks-list/task-list";
import SavedViews from "./saved-views";
import { useRouter } from "next/navigation";
import { useReportsContext } from "@/contexts/reports-context";
import { useTasksContext } from "@/contexts/tasks-context";
import InitialSteps from "@/components/user-guide-components/initial-screen";

const Page = () => {
    const router = useRouter();
    const { loading: userLoading } = useUserContext()
    const { reports, loading: reportsLoading } = useReportsContext()
    const { tasks, loading: tasksLoading } = useTasksContext()

    const isLoading = tasksLoading || reportsLoading || userLoading
    const [showInitialScreen, setShowInitialScreen] = useState(false)

    useEffect(() => {
        if (!tasksLoading && !reportsLoading && !reportsLoading) {
            if (reports.length === 0) {
                setShowInitialScreen(true)
            }
        }
    }, [tasksLoading, reportsLoading, userLoading, reports.length])

    if (showInitialScreen) {
        return <InitialSteps />
    }


    return (
        <div className="flex" style={{ height: "75vh" }}>
            <div className="w-2/3 pr-4 flex flex-col gap-6">
                <ReportList allTasks={tasks} reports={reports} onViewAll={() => router.push("/reports")} isLoading={isLoading} />
                <div style={{ height: "38vh" }}>
                    <SavedViews isLoading={isLoading} />
                </div>
            </div>
            <div className="w-1/3">
                <TaskList tasks={tasks} />
            </div>
        </div>
    );
};

export default Page;