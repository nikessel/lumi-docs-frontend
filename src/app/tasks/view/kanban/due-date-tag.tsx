import React, { useEffect, useMemo } from "react";
import { DatePicker, message } from "antd";
import dayjs from "dayjs"; // Ensure dayjs is installed
import { useWasm } from "@/components/WasmProvider";
import { updateTask } from "@/utils/tasks-utils";
import { Dayjs } from "dayjs";
import { useTasksContext } from "@/contexts/tasks-context";

interface DueDateTagProps {
    task_id: string;
}

const DueDateTag: React.FC<DueDateTagProps> = ({ task_id }) => {
    const { selectedFilteredReportsTasks } = useTasksContext();
    const task = useMemo(() => selectedFilteredReportsTasks.find((t) => t.id === task_id), [selectedFilteredReportsTasks, task_id]);
    const [localStateDueDate, setLocalStateDueDate] = React.useState<Dayjs | null>(null);
    const { wasmModule } = useWasm();

    useEffect(() => {
        setLocalStateDueDate(null)
    }, [task?.due_date])

    if (!task) return null


    const deadline = task?.due_date ? dayjs(task?.due_date) : null;
    const now = dayjs();
    const timeDifference = deadline ? deadline.diff(now, "millisecond") : null;
    const oneDayInMs = 24 * 60 * 60 * 1000;

    const handleDateChange = async (newDate: dayjs.Dayjs | null) => {
        if (!newDate) return;

        if (!wasmModule) {
            message.error("WASM module is not available.");
            return;
        }

        try {
            setLocalStateDueDate(newDate)
            await updateTask(wasmModule, task, { due_date: newDate.toISOString() });
        } catch (error) {
            console.error(error);
        }
    };

    const backgroundClass =
        timeDifference && timeDifference < 0
            ? "bg-red-100 text-red-700 hover:bg-red-100 "
            : timeDifference && timeDifference <= oneDayInMs
                ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-700"
                : "bg-gray-100 hover:bg-gray-100 text-gray-700";

    return (
        <div
            onClick={(e) => e.stopPropagation()} // Prevent event propagation
        >
            <DatePicker
                removeIcon={true}
                showTime
                value={localStateDueDate && localStateDueDate !== deadline ? localStateDueDate : deadline}

                format="DD-MM-YY HH:mm"
                onChange={handleDateChange}
                placeholder="Set due date"
                className={`rounded-md ${backgroundClass} tex-xs `}
                style={{
                    width: "100%",
                    border: "none", // No border to keep consistent with the tag look
                    color: "inherit", // Inherit the text color from the dynamic styles
                }}
                getPopupContainer={(trigger) => trigger.parentNode as HTMLElement} // Ensure popup appears in the correct position
            />
        </div>
    );
};

export default DueDateTag;
