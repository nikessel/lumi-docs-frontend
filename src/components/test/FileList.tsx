import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWasm } from "@/components/WasmProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { eventBus } from "@/components/EventBus";
import { WrappedEvent } from "@/components/EventHelpers";
import type { File, GetFileDataResponse } from "@wasm";

export function FileList() {
  const { wasmModule } = useWasm();
  const [files, setFiles] = useState<File[]>([]);
  const [blobUrls, setBlobUrls] = useState<{ [id: string]: string }>({});
  const [error, setError] = useState("");

  // Ref to store previous Blob URLs for cleanup
  const prevBlobUrlsRef = useRef<{ [id: string]: string }>({});

  // Function to fetch all files
  const fetchFiles = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response = await wasmModule.get_files();
      if (response.output) {
        const filesData = response.output.output;
        setFiles(filesData);

        // Fetch data for PDF files and create Blob URLs
        const newBlobUrls: { [id: string]: string } = {};

        for (const file of filesData) {
          if (file.extension === "pdf" && file.uploaded) {
            // Fetch file data
            const fileDataResponse: GetFileDataResponse =
              await wasmModule.get_file_data({
                input: file.id,
              });
            if (fileDataResponse.output) {
              const fileData = fileDataResponse.output.output;

              // Convert Uint8Array to Blob
              const blob = new Blob([fileData], { type: "application/pdf" });
              const url = URL.createObjectURL(blob);
              newBlobUrls[file.id] = url;
            } else if (fileDataResponse.error) {
              console.error(
                `Error fetching data for file ${file.id}:`,
                fileDataResponse.error.message,
              );
            }
          }
        }

        setBlobUrls(newBlobUrls);
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch files");
    }
  }, [wasmModule]);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();

    const handleCreatedEvent = (event: WrappedEvent) => {
      if (event.type === "Created") {
        const payload = event.payload;
        if (payload && "File" in payload) {
          // A new file has been created, refetch the files
          fetchFiles();
        }
      }
    };

    // Subscribe to "Created" events
    eventBus.subscribe("Created", handleCreatedEvent);

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
      eventBus.unsubscribe("Created", handleCreatedEvent);
    };
  }, [fetchFiles]);

  // Revoke previous Blob URLs when blobUrls change
  useEffect(() => {
    const prevBlobUrls = prevBlobUrlsRef.current;
    // Revoke previous Blob URLs
    Object.values(prevBlobUrls).forEach((url) => URL.revokeObjectURL(url));
    // Update prevBlobUrlsRef
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
              <li key={file.id} className="flex items-center mb-2">
                <span className="flex-1">
                  {file.title || file.path || file.id}
                </span>
                {file.extension === "pdf" && blobUrls[file.id] ? (
                  <Button
                    onClick={() => {
                      window.open(
                        blobUrls[file.id],
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                  >
                    View PDF
                  </Button>
                ) : (
                  <span>Unsupported file type</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
