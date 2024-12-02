import { useState } from "react";
import { useWasm } from "@/components/WasmProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AdminUploadReportInput, Report } from "@wasm";

const ReportUploader = () => {
  const { wasmModule, isLoading, error: wasmError } = useWasm();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(undefined);
    setSuccess(false);

    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      setError("No file selected");
      return;
    }

    if (file.type !== "application/json") {
      setError("Please upload a JSON file");
      return;
    }

    try {
      const fileContent = await file.text();
      const reportData = JSON.parse(fileContent) as Report;
      
      const input: AdminUploadReportInput = {
        input: reportData
      };

      const response = await wasmModule.admin_upload_report(input);

      if (response.error) {
        setError(`${response.error.kind} error: ${response.error.message}`);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Report upload error:", err);
      setError(err instanceof Error ? err.message : "Error uploading report");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Upload Report JSON</h2>
        
        <input
          type="file"
          accept="application/json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={isLoading}
        />
        
        {isLoading && (
          <div className="text-blue-600 font-medium">
            Loading WASM module...
          </div>
        )}

        {(error || wasmError) && (
          <Alert variant="destructive">
            <AlertDescription>
              {error || wasmError}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <AlertDescription>
              Report uploaded successfully!
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ReportUploader;
