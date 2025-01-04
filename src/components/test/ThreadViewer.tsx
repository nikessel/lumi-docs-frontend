import React from 'react';
import { useParams } from 'next/navigation';
import { useWasm } from '@/components/WasmProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Thread, ChatMessage } from '@wasm';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Helper function to format JSON with string wrapping
const formatJsonWithWrapping = (obj: unknown, indent: number = 2): string => {
  console.debug('[formatJsonWithWrapping] Formatting JSON object:', obj);
  const formatted = JSON.stringify(obj, (_, value) => {
    if (typeof value === 'string' && value.includes('\n')) {
      // Split by newlines and add proper indentation
      const lines = value.split('\n').map(line => line.trim());
      // Join with newlines and proper indentation
      return lines.join('\n' + ' '.repeat(indent * 2));
    }
    return value;
  }, indent);
  console.debug('[formatJsonWithWrapping] Formatted result:', formatted);
  return formatted;
};

// Helper function to format triple-quoted content
const formatTripleQuotedContent = (text: string): string => {
  console.debug('[formatTripleQuotedContent] Processing text:', text.slice(0, 100) + '...');
  let result = text;
  const tripleQuoteRegex = /"""([\s\S]*?)"""/g;
  
  // Log matches found
  const matches = text.match(tripleQuoteRegex);
  console.debug('[formatTripleQuotedContent] Found triple-quoted sections:', matches?.length ?? 0);
  
  return result.replace(tripleQuoteRegex, (match, content) => {
    console.debug('[formatTripleQuotedContent] Processing triple-quoted content:', content.slice(0, 100) + '...');
    try {
      console.debug('[formatTripleQuotedContent] Attempting to parse as JSON');
      const jsonContent = JSON.parse(content);
      const formattedJson = formatJsonWithWrapping(jsonContent);
      console.debug('[formatTripleQuotedContent] Successfully formatted JSON');
      return `"""\n${formattedJson}\n"""`;
    } catch (error) {
      // If it's not valid JSON, return the original content unchanged
      console.debug('[formatTripleQuotedContent] Not valid JSON, leaving unchanged. Error:', error);
      return match;
    }
  });
};

interface MessageContentProps {
  content: string;
  type: ChatMessage['type'];
}

const MessageContent: React.FC<MessageContentProps> = ({ content, type }) => {
  console.debug('[MessageContent] Rendering content type:', type);
  console.debug('[MessageContent] Content preview:', content.slice(0, 100) + '...');
  console.debug('[MessageContent] Full content:', content);

  let processedContent = content;

  // Process JSON and triple-quoted content for all message types
  if (content.includes('"""') || type === 'tool_call_input' || type === 'tool_call_output' || type === 'assistant') {
    let isFullJson = false;
    // First try to parse the entire content as JSON
    try {
      console.debug('[MessageContent] Attempting to parse entire content as JSON');
      const jsonContent = JSON.parse(content);
      processedContent = formatJsonWithWrapping(jsonContent);
      console.debug('[MessageContent] Successfully parsed and formatted full JSON');
      isFullJson = true;
    } catch (error) {
      console.debug('[MessageContent] Failed to parse as full JSON. Error:', error);
      // If full JSON parsing fails, try to format triple-quoted content
      console.debug('[MessageContent] Attempting to format triple-quoted content');
      processedContent = formatTripleQuotedContent(content);
      console.debug('[MessageContent] After triple quote processing:', processedContent);
    }

    // Always render with code styling for processed content
    return (
      <div className="font-mono text-sm">
        <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
          {processedContent}
        </pre>
      </div>
    );
  }

  console.debug('[MessageContent] Using default text display for type:', type);
  // Default text display for other message types
  return (
    <pre className="text-sm whitespace-pre-wrap">{content}</pre>
  );
};

const ThreadViewer: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { wasmModule } = useWasm();
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [expandedThreads, setExpandedThreads] = React.useState<Set<string>>(new Set());

  const reportId = params?.reportId?.toString();
  const parentThreadId = params?.parentThreadId?.toString();

  React.useEffect(() => {
    const fetchThreads = async () => {
      if (!wasmModule) {
        setError('WASM module not loaded');
        setLoading(false);
        return;
      }

      try {
        let response;

        if (parentThreadId) {
          response = await wasmModule.admin_get_threads_by_parent_thread({
            input: parentThreadId
          });
        } else if (reportId) {
          response = await wasmModule.admin_get_threads_by_report({
            input: reportId
          });
        } else {
          setError('No report ID or parent thread ID provided');
          setLoading(false);
          return;
        }

        if (response.output) {
          setThreads(response.output.output);
        } else if (response.error) {
          setError(response.error.message);
        }
      } catch (err) {
        console.error("Error fetching threads:", err);
        setError('Failed to fetch threads');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [wasmModule, reportId, parentThreadId]);

  const toggleThread = (threadKey: string) => {
    setExpandedThreads(prev => {
      const next = new Set(prev);
      if (next.has(threadKey)) {
        next.delete(threadKey);
      } else {
        next.add(threadKey);
      }
      return next;
    });
  };

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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        {parentThreadId ? `Sub-threads for Thread ${parentThreadId}` : `Threads for Report ${reportId}`}
      </h1>
      
      {threads.map((thread) => (
        <Card key={thread.key}>
          <div className="cursor-pointer" onClick={() => toggleThread(thread.key)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {expandedThreads.has(thread.key) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />}
                  <CardTitle className="text-lg">{thread.key}</CardTitle>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/test/reports/${reportId}/threads/parent-thread/${thread.id}`);
                  }}
                >
                  View Sub-threads
                </Button>
              </div>
            </CardHeader>
          </div>
          
          {expandedThreads.has(thread.key) && (
            <CardContent>
              <div className="space-y-4">
                {thread.conversation && thread.conversation.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium mb-2">Messages ({thread.conversation.length})</div>
                    <Accordion type="multiple" className="space-y-2">
                      {thread.conversation.map((message, index) => (
                        <AccordionItem key={index} value={`${thread.key}-message-${index}`} className="border rounded-md">
                          <AccordionTrigger className="px-3 py-2 hover:no-underline">
                            <span className="font-medium capitalize">{message.type}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 py-2 bg-gray-50">
                            <div className="space-y-2">
                              <MessageContent content={message.content} type={message.type} />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

                {thread.logs && thread.logs.length > 0 && (
                  <div>
                    <div className="font-medium mb-2">Logs ({thread.logs.length})</div>
                    <div className="space-y-2 pl-6">
                      {thread.logs.map((log, index) => (
                        <div key={index} className="p-2 rounded bg-gray-100">
                          <p className="text-sm font-mono">{log}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ThreadViewer;
