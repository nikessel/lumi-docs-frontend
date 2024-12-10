"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useWasm } from '@/components/WasmProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface ThreadState {
  conversation: string[];
  logs: string[];
  id: string;
}

const ThreadViewer = () => {
  const params = useParams();
  const { wasmModule } = useWasm();
  const [thread, setThread] = React.useState<ThreadState | null>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // Extract params and ensure they're strings
  const reportId = params?.reportId?.toString() || '';
  const sectionId = params?.sectionId?.toString() || '';
  const requirementId = params?.requirementId?.toString() || '';
  const groupId = params?.groupId?.toString() || '';

  React.useEffect(() => {
    const fetchThread = async () => {
      if (!wasmModule || !reportId) {
        setError('Invalid parameters or WASM module not loaded');
        setLoading(false);
        return;
      }

      try {
        let response;
        
        if (requirementId) {
          response = await wasmModule.admin_get_threads_by_requirement({
            report_id: reportId,
            requirement_id: requirementId
          });
        } else if (groupId) {
          response = await wasmModule.admin_get_threads_by_requirement_group({
            report_id: reportId,
            group_id: groupId
          });
        } else if (sectionId) {
          response = await wasmModule.admin_get_threads_by_section({
            report_id: reportId,
            section_id: sectionId
          });
        } else {
          response = await wasmModule.admin_get_threads_by_report({
            input: reportId
          });
          console.log('response:', response);
        }

        if (response.output) {
          setThread(response.output.output as ThreadState);
        } else if (response.error) {
          setError(response.error.message);
        }
      } catch (err) {
        console.error("Error fetching thread:", err);
        setError('Failed to fetch thread');
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [wasmModule, reportId, sectionId, requirementId, groupId]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!thread) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thread Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Display conversation messages */}
            {thread.conversation && thread.conversation.length > 0 && (
              <div className="space-y-2">
                {thread.conversation.map((message: string, index: number) => (
                  <div key={index} className="p-3 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-700">{message}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Display logs if any */}
            {thread.logs && thread.logs.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Logs</h3>
                <div className="space-y-2">
                  {thread.logs.map((log: string, index: number) => (
                    <div key={index} className="p-2 rounded bg-gray-100">
                      <p className="text-sm font-mono">{log}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreadViewer;
