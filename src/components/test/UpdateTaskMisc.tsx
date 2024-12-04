"use client";
import { useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Task } from "@wasm";

const testJson = JSON.stringify({
  priority: "high",
  due_date: "2024-12-31",
  assignee: "john.doe",
  tags: ["urgent", "review-required"],
  notes: {
    last_update: "2024-01-15",
    comments: ["Initial review completed", "Waiting for secondary approval"]
  }
}, null, 2);

export default function TaskMiscTest() {
  const { wasmModule, isLoading } = useWasm();
  const [taskId, setTaskId] = useState("");
  const [jsonInput, setJsonInput] = useState(testJson);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string>();

  const handleUpdateMisc = async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      // Validate JSON format
      JSON.parse(jsonInput);

      // First get the current task
      const taskResponse = await wasmModule.get_task({
        input: taskId
      });

      if (taskResponse.error) {
        setError(`${taskResponse.error.kind} error: ${taskResponse.error.message}`);
        return;
      }

      if (!taskResponse.output?.output) {
        setError("Task not found");
        return;
      }

      // Create updated task by spreading the existing task and updating misc
      const task: Task = {
        ...taskResponse.output.output,
        misc: jsonInput // Update the misc field with new JSON
      };

      // Send the update
      const updateResponse = await wasmModule.update_task({
        input: task
      });

      if (updateResponse.error) {
        setError(`${updateResponse.error.kind} error: ${updateResponse.error.message}`);
        return;
      }

      setStatus("Task misc field updated successfully!");
      setError(undefined);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format: " + err.message);
      } else {
        setError(err instanceof Error ? err.message : "Error updating task");
      }
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Update Task Misc Field</h2>
        
        <div className="space-y-2">
          <label htmlFor="taskId" className="block text-sm font-medium">
            Task ID
          </label>
          <input
            id="taskId"
            type="text"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            placeholder="Enter task ID"
            className="w-full p-2 border rounded font-mono text-sm bg-white text-black"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="jsonInput" className="block text-sm font-medium">
            Misc JSON
          </label>
          <textarea
            id="jsonInput"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Enter JSON for misc field"
            className="w-full h-64 p-2 border rounded font-mono text-sm bg-white text-black"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleUpdateMisc}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={isLoading || !taskId}
        >
          Update Task Misc Field
        </button>
      </div>

      {isLoading && (
        <div className="text-blue-600 font-medium">Loading...</div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status && !error && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
