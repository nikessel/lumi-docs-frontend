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
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }
    try {
      const response = await wasmModule.get_all_reports();
      if (response.output) {
        setReports(response.output.output);
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
    };
  }, [fetchReports]);

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
                      `/test/reports/${report.id}`,
                      '_blank',
                      'noopener,noreferrer'
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
