import React, { useState, useEffect, useCallback } from "react";
import { useWasm } from "@/components/WasmProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { eventBus } from "@/components/EventBus";
import { WrappedEvent } from "@/components/EventHelpers";
import type { Report } from "@wasm";

export function ReportList() {
  const { wasmModule } = useWasm();
  const [reports, setReports] = useState<Report[]>([]);
  const [blobUrls, setBlobUrls] = useState<{ [id: string]: string }>({});
  const [error, setError] = useState("");

  // Function to fetch all reports
  const fetchReports = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response = await wasmModule.get_all_reports();
      if (response.output) {
        const reportsData = response.output.output;
        setReports(reportsData);

        // Create Blob URLs for each report
        const newBlobUrls: { [id: string]: string } = {};
        reportsData.forEach((report) => {
          const jsonString = JSON.stringify(report, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          newBlobUrls[report.id] = url;
        });

        // Revoke previous Blob URLs
        setBlobUrls(oldUrls => {
          Object.values(oldUrls).forEach(url => URL.revokeObjectURL(url));
          return newBlobUrls;
        });
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to fetch reports");
    }
  }, [wasmModule]); // Remove blobUrls dependency

  // Fetch reports on component mount and when events occur
  useEffect(() => {
    fetchReports();

    const handleCreatedEvent = (event: WrappedEvent) => {
      if (event.type === "Created" && "Report" in event.payload) {
        fetchReports();
      }
    };

    // Subscribe to "Created" events
    eventBus.subscribe("Created", handleCreatedEvent);

    // Cleanup: Unsubscribe and revoke Blob URLs when unmounting
    return () => {
      eventBus.unsubscribe("Created", handleCreatedEvent);
      setBlobUrls(oldUrls => {
        Object.values(oldUrls).forEach(url => URL.revokeObjectURL(url));
        return {};
      });
    };
  }, [fetchReports]); // Only depend on fetchReports

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
        {reports.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          <ul className="list-none pl-0">
            {reports.map((report) => (
              <li key={report.id} className="flex items-center mb-2">
                <span className="flex-1">{report.title || report.id}</span>
                <Button
                  onClick={() => {
                    window.open(
                      blobUrls[report.id],
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  View
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
