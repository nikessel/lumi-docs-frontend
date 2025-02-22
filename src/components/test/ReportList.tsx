import React, { useState, useEffect, useCallback } from "react";
import { useWasm } from "@/components/WasmProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { eventBus } from "@/components/EventBus";
import { WrappedEvent } from "@/components/EventHelpers";
import type { Report } from "@wasm";


function mapReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Map) {
    // Cast to a Map of string to unknown to satisfy Object.fromEntries type checking
    return Object.fromEntries(value as Map<string, unknown>);
  }
  return value;
}

export function ReportList() {
  const { wasmModule } = useWasm();
  const [reports, setReports] = useState<Report[]>([]);
  const [blobUrls, setBlobUrls] = useState<{ [id: string]: string }>({});
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    console.log("!!!123123123", wasmModule)
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response = await wasmModule.get_all_reports();

      if (response.output) {
        const reportsData = response.output.output;
        setReports(reportsData);
        setError("");
        // Create Blob URLs for each report
        const newBlobUrls: { [id: string]: string } = {};
        reportsData.forEach((report) => {
          const jsonString = JSON.stringify(report, mapReplacer, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          newBlobUrls[report.id] = url;
        });

        // Revoke previous Blob URLs before setting new ones
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
  }, [wasmModule]);

  useEffect(() => {
    fetchReports();
    const handleCreatedEvent = (event: WrappedEvent) => {
      if (event.type === "Created" && "Report" in event.payload) {
        fetchReports();
      }
    };
    eventBus.subscribe("Created", handleCreatedEvent);

    return () => {
      eventBus.unsubscribe("Created", handleCreatedEvent);
      // Don't clean up blobUrls here
    };
  }, [fetchReports]);

  // Separate effect for cleaning up old blob URLs when they change
  useEffect(() => {
    return () => {
      Object.values(blobUrls).forEach(url => URL.revokeObjectURL(url));
    };
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
        {reports.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          <ul className="list-none pl-0">
            {reports.map((report) => (
              <li key={report.id} className="flex items-center gap-2 mb-2">
                <span className="flex-1">{report.title || report.id}</span>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(
                      `/test/reports/${report.id}`,
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                >
                  View
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    window.open(
                      blobUrls[report.id],
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                >
                  Open JSON
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default ReportList;
