import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWasm } from "@/components/WasmProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { eventBus } from "@/components/EventBus";
import type { WrappedEvent } from "@/components/EventHelpers";
import type { File, GetFileDataResponse } from "@wasm";

export function FileList() {
  const { wasmModule } = useWasm();
  const [files, setFiles] = useState<File[]>([]);
  const [fileData, setFileData] = useState<{ [id: string]: Uint8Array }>({});
  const [blobUrls, setBlobUrls] = useState<{ [id: string]: string }>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<{ [id: string]: boolean }>({});

  // Ref to store previous Blob URLs for cleanup
  const prevBlobUrlsRef = useRef<{ [id: string]: string }>({});

  // Function to fetch file data and create blob URL
  const fetchFileData = useCallback(
    async (fileId: string) => {
      if (!wasmModule) {
        setError("WASM module not loaded");
        return null;
      }

      // Return cached data if available
      if (fileData[fileId]) {
        return fileData[fileId];
      }

      setLoading((prev) => ({ ...prev, [fileId]: true }));

      try {
        const fileDataResponse: GetFileDataResponse =
          await wasmModule.get_file_data({
            input: fileId,
          });

        if (fileDataResponse.output) {
          const data = fileDataResponse.output.output;
          setFileData((prev) => ({ ...prev, [fileId]: data }));
          return data;
        } else if (fileDataResponse.error) {
          console.error(
            `Error fetching data for file ${fileId}:`,
            fileDataResponse.error.message,
          );
          setError(`Failed to load file: ${fileDataResponse.error.message}`);
        }
      } catch (err) {
        console.error("Error fetching file data:", err);
        setError("Failed to load file");
      } finally {
        setLoading((prev) => ({ ...prev, [fileId]: false }));
      }
      return null;
    },
    [wasmModule, fileData],
  );

  const viewFile = useCallback(
    async (fileId: string) => {
      // Use existing blob URL if available
      if (blobUrls[fileId]) {
        window.open(blobUrls[fileId], "_blank", "noopener,noreferrer");
        return;
      }

      const data = await fetchFileData(fileId);
      if (data) {
        const bytes = new Uint8Array(data);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setBlobUrls((prev) => ({ ...prev, [fileId]: url }));
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    [blobUrls, fetchFileData],
  );

  const downloadFile = useCallback(
    async (fileId: string, fileName: string, mimeType: string) => {
      const data = await fetchFileData(fileId);
      if (data) {
        const bytes = new Uint8Array(data);
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    },
    [fetchFileData],
  );
  // Function to fetch file list
  const fetchFiles = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response = await wasmModule.get_files();
      if (response.output) {
        setFiles(response.output.output);
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch files");
    }
  }, [wasmModule]);

  // Fetch files on component mount and handle events
  useEffect(() => {
    fetchFiles();

    const handleCreatedEvent = (event: WrappedEvent) => {
      if (event.type === "Created") {
        const payload = event.payload;
        if (payload && "File" in payload) {
          fetchFiles();
        }
      }
    };

    eventBus.subscribe("Created", handleCreatedEvent);

    return () => {
      eventBus.unsubscribe("Created", handleCreatedEvent);
    };
  }, [fetchFiles]);

  // Cleanup blob URLs
  useEffect(() => {
    const prevBlobUrls = prevBlobUrlsRef.current;
    Object.values(prevBlobUrls).forEach((url) => URL.revokeObjectURL(url));
    prevBlobUrlsRef.current = blobUrls;
  }, [blobUrls]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent>
        {files.length === 0 ? (
          <p>No files available.</p>
        ) : (
          <ul className="list-none pl-0">
            {files.map((file) => (
              <li key={file.id} className="flex items-center gap-2 mb-2">
                <span className="flex-1">
                  {file.title || file.path || file.id}
                </span>
                {file.uploaded && (
                  <div className="flex gap-2">
                    {file.extension === "pdf" && (
                      <Button
                        onClick={() => viewFile(file.id)}
                        disabled={loading[file.id]}
                      >
                        {loading[file.id] ? "Loading..." : "View"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() =>
                        downloadFile(
                          file.id,
                          file.title ||
                          file.path ||
                          `${file.id}.${file.extension}`,
                          file.extension === "pdf"
                            ? "application/pdf"
                            : "application/octet-stream",
                        )
                      }
                      disabled={loading[file.id]}
                    >
                      {loading[file.id] ? "Loading..." : "Download"}
                    </Button>
                  </div>
                )}
                {!file.uploaded && <span>File not uploaded</span>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
