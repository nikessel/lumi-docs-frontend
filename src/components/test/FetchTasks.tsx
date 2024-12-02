"use client";
import { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { 
  Task,
  Report,
  GetAllReportsResponse,
  GetTasksByReportResponse,
  GetTasksByReportAndRequirementResponse,
  GetTasksByDocumentResponse
} from "@wasm";

function TaskTest() {
  const { wasmModule, isLoading, error: wasmError } = useWasm();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [requirementTasks, setRequirementTasks] = useState<Task[]>([]);
  const [documentTasks, setDocumentTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function fetchReports() {
      if (!wasmModule) return;
      
      try {
        const response: GetAllReportsResponse = await wasmModule.get_all_reports();
        if (response.error) {
          setError(`${response.error.kind} error: ${response.error.message}`);
          return;
        }
        if (response.output?.output.length) {
          setSelectedReport(response.output.output[0]);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err instanceof Error ? err.message : "Error fetching reports");
      }
    }
    
    fetchReports();
  }, [wasmModule]);

  const handleFetchTasks = async () => {
    if (!wasmModule || !selectedReport) return;
    setIsFetching(true);
    setError(undefined);
    
    try {
      // Reset all task states
      setTasks([]);
      setRequirementTasks([]);
      setDocumentTasks([]);

      // Fetch tasks by report
      const reportTasksResponse: GetTasksByReportResponse = 
        await wasmModule.get_tasks_by_report({ input: selectedReport.id });
      if (reportTasksResponse.error) {
        setError(`${reportTasksResponse.error.kind} error: ${reportTasksResponse.error.message}`);
        return;
      }
      if (reportTasksResponse.output) {
        setTasks(reportTasksResponse.output.output);
      }

      // Get first requirement ID from assessments if available
      const firstRequirementId = selectedReport.section_assessments?.[0]?.requirement_assessments?.[0]?.requirement_id;
      if (firstRequirementId) {
        const requirementTasksResponse: GetTasksByReportAndRequirementResponse = 
          await wasmModule.get_tasks_by_report_and_requirement({
            report_id: selectedReport.id,
            requirement_id: firstRequirementId
          });
        if (requirementTasksResponse.output) {
          setRequirementTasks(requirementTasksResponse.output.output);
        }
      }

      // If we have tasks and one has an associated document, fetch by document
      const taskWithDoc = reportTasksResponse.output?.output.find(t => t.associated_document);
      if (taskWithDoc?.associated_document) {
        const documentTasksResponse: GetTasksByDocumentResponse = 
          await wasmModule.get_tasks_by_document({
            report_id: selectedReport.id,
            document: taskWithDoc.associated_document
          });
        if (documentTasksResponse.output) {
          setDocumentTasks(documentTasksResponse.output.output);
        }
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err instanceof Error ? err.message : "Error fetching tasks");
    } finally {
      setIsFetching(false);
    }
  };

  const renderTaskList = (title: string, taskList: Task[]) => (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">{title}</h3>
      {taskList.length === 0 ? (
        <p className="text-gray-500">No tasks found</p>
      ) : (
        <div className="space-y-2">
          {taskList.map((task) => (
            <div key={task.id} className="p-2 bg-gray-50 rounded">
              <p className="font-medium">id: {task.id}</p>
              <p className="font-medium">title: {task.title}</p>
              <p className="text-sm text-gray-600">{task.description}</p>
              {task.associated_document && (
                <p className="text-xs text-gray-500">
                  Document: {task.associated_document}
                </p>
              )}
              <p className="text-xs text-gray-400">Status: {task.status || 'Unknown'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-blue-600 font-medium">Loading WASM module...</div>;
  }

  if (!selectedReport) {
    return <div className="text-gray-600">No report available</div>;
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Task Query Test</CardTitle>
        <CardDescription>
          Testing various task query functions with report: {selectedReport.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleFetchTasks} 
            disabled={isFetching}
          >
            {isFetching ? "Fetching Tasks..." : "Fetch Tasks"}
          </Button>
          {(error || wasmError) && (
            <div className="text-red-600 font-medium">
              Error: {error || wasmError}
            </div>
          )}
        </div>
        {renderTaskList("Tasks by Report", tasks)}
        {renderTaskList("Tasks by Report & Requirement", requirementTasks)}
        {renderTaskList("Tasks by Document", documentTasks)}
      </CardContent>
    </Card>
  );
}

export default TaskTest;
