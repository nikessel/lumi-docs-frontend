import { useState, useEffect, useCallback } from "react";
import { useWasm } from "@/components/WasmProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

const testJson = JSON.stringify({
  theme: "dark",
  notifications: {
    email: true,
    push: false
  },
  dashboard: {
    defaultView: "weekly",
    widgets: ["calendar", "tasks", "reports"]
  }
}, null, 2);

export default function UserPreferences() {
  const { wasmModule, isLoading } = useWasm();
  const [jsonInput, setJsonInput] = useState(testJson);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string>();
  const [currentPrefs, setCurrentPrefs] = useState<string>("");

  const fetchCurrentUser = useCallback(async () => {
    if (!wasmModule) return;
    
    try {
      const response = await wasmModule.get_user();
      if (response.error) {
        setError(`${response.error.kind} error: ${response.error.message}`);
        return;
      }
      if (response.output) {
        const prettyPrefs = JSON.stringify(
          response.output.output.preferences || {},
          null,
          2
        );
        setCurrentPrefs(prettyPrefs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching user");
    }
  }, [wasmModule]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const handleUpdatePreferences = async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      // Validate JSON format
      JSON.parse(jsonInput);

      // Get current user first
      const userResponse = await wasmModule.get_user();
      if (userResponse.error) {
        setError(`${userResponse.error.kind} error: ${userResponse.error.message}`);
        return;
      }
      
      if (!userResponse.output) {
        setError("No user data received");
        return;
      }

      // Update the user object with new preferences
      const updatedUser = {
        ...userResponse.output.output,
        preferences: jsonInput  // The API expects a JSON string for preferences
      };

      // Send the update
      const updateResponse = await wasmModule.update_user({
        input: updatedUser
      });

      if (updateResponse.error) {
        setError(`${updateResponse.error.kind} error: ${updateResponse.error.message}`);
        return;
      }

      setStatus("Preferences updated successfully!");
      setError(undefined);
      
      // Refresh the display
      fetchCurrentUser();
      
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format: " + err.message);
      } else {
        setError(err instanceof Error ? err.message : "Error updating preferences");
      }
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Update User Preferences</h2>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Enter JSON preferences"
          className="w-full h-64 p-2 border rounded font-mono text-sm bg-white text-black"
          disabled={isLoading}
        />
        <button
          onClick={handleUpdatePreferences}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={isLoading}
        >
          Update Preferences
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

      {currentPrefs && (
        <div className="space-y-2">
          <h3 className="font-medium">Current Preferences:</h3>
          <pre className="p-4 bg-gray-50 rounded border overflow-auto">
            {currentPrefs}
          </pre>
        </div>
      )}
    </div>
  );
}
