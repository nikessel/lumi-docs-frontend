"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useWasm } from '@/components/WasmProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Bookmark, Quote as QuoteIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronRight, AlertCircle, CheckCircle2, XCircle, Info, CheckCircle, Clock } from 'lucide-react';
import type { 
  Report, 
  Section,
  ReportStatus, 
  RequirementAssessment, 
  RequirementGroupAssessment,
  Requirement,
  RequirementGroup,
  Task,
  AssessmentQuote,
  TaskStatus,
  RequirementOrRequirementGroupAssessment,
} from '@wasm';

interface RequirementWrapper {
  content: RequirementAssessment;
  id: string; // Store the ID from the Map key
}

interface RequirementGroupWrapper {
  content: RequirementGroupAssessment;
  id: string; // Store the ID from the Map key
}

type AssessmentWrapper = RequirementWrapper | RequirementGroupWrapper;

const isRequirementOrGroupAssessment = (
  assessment: RequirementOrRequirementGroupAssessment
): assessment is { requirement: RequirementAssessment } => {
  return 'requirement' in assessment;
};

// Helper to create wrapper objects
const createAssessmentWrapper = (content: RequirementOrRequirementGroupAssessment, id: string): AssessmentWrapper => {
  if (isRequirementOrGroupAssessment(content)) {
    return {
      content: content.requirement,
      id
    } as RequirementWrapper;
  } else {
    return {
      content: content.requirement_group,
      id
    } as RequirementGroupWrapper;
  }
};

const QuoteDisplay: React.FC<{
  quote: AssessmentQuote;
}> = ({ quote }) => {
  const relevancy = Math.round(quote.relevancy_rating);
  
  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden my-4">
      {/* Quote content section */}
      <div className="p-4 relative">
        {/* Large quote mark in the background */}
        <div className="absolute top-0 left-0 text-gray-100 p-4">
          <QuoteIcon className="h-8 w-8" />
        </div>
        
        <div className="relative bg-gray-50 rounded-lg p-6 italic">
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:mb-3">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              className="text-gray-700"
            >
              {quote.pretty}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      
      {/* Metadata footer */}
      <div className="border-t bg-gray-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">{quote.raw.document_title}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span>Page {quote.raw.page}</span>
              <span className="text-gray-400">•</span>
              <span>Lines {quote.raw.start_line}-{quote.raw.end_line}/{quote.raw.total_lines_on_page}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-blue-500" />
              <span className={`font-medium ${relevancy >= 80 ? 'text-green-600' : relevancy >= 60 ? 'text-blue-600' : 'text-gray-600'}`}>
                {relevancy}% Relevant
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const isRequirementAssessment = (
  assessment: AssessmentWrapper
): assessment is RequirementWrapper => {
  // Check if it's a requirement wrapper by checking if it has Requirement assessment type properties
  return 'objective_research_summary' in assessment.content;
};

const ThreadViewButton: React.FC<{ 
  reportId: string;
}> = ({ reportId }) => {
  const router = useRouter();
  const { wasmModule } = useWasm();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!wasmModule) return;
      try {
        const response = await wasmModule.is_admin();
        if (response.output) {
          setIsAdmin(response.output.output);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
      }
    };

    checkAdmin();
  }, [wasmModule]);

  if (!isAdmin) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/test/reports/${reportId}/threads`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-1"
    >
      <MessageSquare className="h-4 w-4" />
      View Threads
    </Button>
  );
};

const InfoTooltip: React.FC<{
  name?: string;
  description?: string;
  reference?: string;
  id?: string;
}> = ({ name, description, reference }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger onClick={(e) => e.stopPropagation()} className="hover:bg-gray-200 p-1 rounded-full transition-colors">
          <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm bg-gray-50 border border-gray-200">
          <p className="font-medium">Name: {name}</p>
          <p className="mt-1"><strong>Description:</strong> {description}</p>
          {reference && <p className="mt-1"><strong>Reference:</strong> {reference}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


interface TaskDisplayProps {
  task: Task;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({ task }) => {
  const getStatusIcon = (status: TaskStatus | undefined) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ignored':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TaskStatus | undefined) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ignored':
        return 'bg-gray-100 text-gray-800';
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{task.title}</CardTitle>
        {task.status && (
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <Badge className={getStatusColor(task.status)}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
            <p className="text-sm text-gray-700">{task.description}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">Task Details</h3>
            <p className="text-sm text-gray-700">{task.task}</p>
          </div>

          {task.suggestion && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Suggestion</h3>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {task.suggestion.kind.split('_').map((word: string) => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </p>
                <p className="text-sm text-blue-800">{task.suggestion.description}</p>
                <p className="text-sm text-blue-700 mt-2">{task.suggestion.content}</p>
              </div>
            </div>
          )}

          {task.associated_document && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Associated Document</h3>
              <p className="text-sm text-gray-700">{task.associated_document}</p>
            </div>
          )}

          {task.id && (
            <div className="text-xs text-gray-400">
              ID: {task.id}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


interface TaskListProps {
  reportId: string;
  requirementId: string;
}

const TaskList: React.FC<TaskListProps> = ({ reportId, requirementId }) => {
  const { wasmModule } = useWasm();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTasks = async () => {
      if (!wasmModule) return;
      
      try {
        const response = await wasmModule.get_tasks_by_report_and_requirement({
          report_id: reportId,
          requirement_id: requirementId
        });
        
        if (response.output) {
          setTasks(response.output.output);
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [wasmModule, reportId, requirementId]);

  if (loading) return <Skeleton className="h-20" />;
  if (tasks.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Tasks</h4>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskDisplay key={task.id || Math.random()} task={task} />
        ))}
      </div>
    </div>
  );
};

const RequirementCard: React.FC<{ 
  req: RequirementWrapper;
  reportId: string;
  index: number;
}> = ({ req, reportId, index }) => {
  const { wasmModule } = useWasm();
  const [reqDetails, setReqDetails] = React.useState<Requirement | undefined>();

  React.useEffect(() => {
    const fetchRequirement = async () => {
      if (!wasmModule || !req.id) return;
      
      try {
        const response = await wasmModule.get_requirement({ input: req.id });
        if (response.output) {
          setReqDetails(response.output.output);
        }
      } catch (err) {
        console.error("Failed to fetch requirement:", err);
      }
    };

    if (!reqDetails && req.id) {
      fetchRequirement();
    }
  }, [wasmModule, req.id, reqDetails]);

  return (
    <AccordionItem value={`req-${index}`} className="border rounded-lg bg-white">
      <AccordionTrigger className="px-4 py-2 hover:no-underline w-full">
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="truncate">{reqDetails?.name || `Requirement ${index + 1}`}</span>
            <InfoTooltip 
              name={reqDetails?.name}
              description={reqDetails?.description}
              reference={reqDetails?.reference}
              id={reqDetails?.id}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ComplianceIndicator rating={req.content.compliance_rating} />
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 py-2">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Objective Research Summary</h4>
            <p className="text-sm text-gray-700">{req.content.objective_research_summary}</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Assessment Details</h4>
            <p className="text-sm text-gray-700">{req.content.details}</p>
          </div>
          {req.content.negative_findings?.length > 0 && (
            <div>
              <h4 className="font-medium mb-1">Negative Findings</h4>
              <ul className="list-disc pl-4 space-y-1">
                {req.content.negative_findings.map((finding, i) => (
                  <li key={i} className="text-sm text-gray-700">{finding}</li>
                ))}
              </ul>
            </div>
          )}
          {req.content.quotes && req.content.quotes.length > 0 && (
            <div>
              <h4 className="font-medium mb-1">Supporting Evidence</h4>
              <div className="space-y-2">
                {req.content.quotes.map((quote, i) => (
                  <QuoteDisplay key={i} quote={quote} />
                ))}
              </div>
            </div>
          )}
          {req.content.sources?.length > 0 && (
            <div>
              <h4 className="font-medium mb-1">Source Documents</h4>
              <ul className="list-disc pl-4">
                {req.content.sources.map((source, i) => (
                  <li key={i} className="text-sm text-gray-700">{source}</li>
                ))}
              </ul>
            </div>
          )}
          <TaskList 
            reportId={reportId}
            requirementId={req.id}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

interface RequirementGroupCardProps {
  group: RequirementGroupWrapper;
  reportId: string;
  index: number;
}


const RequirementGroupCard: React.FC<RequirementGroupCardProps> = ({ group, reportId, index }) => {
  const { wasmModule } = useWasm();
  const [groupDetails, setGroupDetails] = React.useState<RequirementGroup | null>(null);

  React.useEffect(() => {
    const fetchRequirementGroup = async () => {
      if (!wasmModule || !group.id) return;
      
      try {
        const response = await wasmModule.get_requirement_group({ input: group.id });
        if (response.output) {
          setGroupDetails(response.output.output);
        }
      } catch (err) {
        console.error("Failed to fetch requirement group:", err);
      }
    };

    if (!groupDetails && group.id) {
      fetchRequirementGroup();
    }
  }, [wasmModule, group.id, groupDetails]);

  const renderNestedAssessments = () => {
    if (!group.content.assessments) {
      console.log('No assessments found for group:', group.id);
      return null;
    }

    console.log('Group assessments:', Array.from(group.content.assessments.entries()));
    
    return (
      <div className="mt-6 space-y-4">
        <h4 className="font-medium">Requirements</h4>
        <Accordion type="multiple" className="space-y-4">
          {Array.from(group.content.assessments.entries() as IterableIterator<[string, RequirementOrRequirementGroupAssessment]>)
            .map(([key, assessment], i) => {
              console.log('Processing nested assessment:', { key, assessment });
              const wrapper = createAssessmentWrapper(assessment, key);
              return (
                <div key={key}>
                  {isRequirementAssessment(wrapper) ? (
                    <RequirementCard 
                      req={wrapper}
                      reportId={reportId}
                      index={i} 
                    />
                  ) : (
                    <RequirementGroupCard 
                      group={wrapper}
                      reportId={reportId}
                      index={i} 
                    />
                  )}
                </div>
              );
          })}
        </Accordion>
      </div>
    );
  };

  return (
    <AccordionItem value={`group-${index}`} className="border rounded-lg bg-gray-50">
      <AccordionTrigger className="px-4 py-2 hover:no-underline w-full">
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="truncate">
              {groupDetails?.name || `Requirement Group ${index + 1}`}
            </span>
            <InfoTooltip 
              name={groupDetails?.name}
              description={groupDetails?.description}
              reference={groupDetails?.reference}
              id={groupDetails?.id}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ComplianceIndicator rating={group.content.compliance_rating} />
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 py-2">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Assessment Summary</h4>
            <p className="text-sm text-gray-700">{group.content.summary}</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Assessment Details</h4>
            <p className="text-sm text-gray-700">{group.content.details}</p>
          </div>
          {renderNestedAssessments()}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const ComplianceIndicator: React.FC<{ rating: number }> = ({ rating }) => {
  let Icon = XCircle;
  let color = "text-red-500";
  
  if (rating >= 80) {
    Icon = CheckCircle2;
    color = "text-green-500";
  } else if (rating >= 50) {
    Icon = AlertCircle;
    color = "text-yellow-500";
  }

  return (
    <>
      <Icon className={color} />
      <span>{rating}%</span>
    </>
  );
};

const SectionHeader: React.FC<{
  sectionId: string | undefined;
  complianceRating: number;
  index: number;
  reportId: string;
}> = ({ sectionId, complianceRating, index, reportId }) => {
  const { wasmModule } = useWasm();
  const [sectionDetails, setSectionDetails] = React.useState<Section | undefined>();

  React.useEffect(() => {
    const fetchSection = async () => {
      if (!wasmModule || !sectionId) return;
      
      try {
        const response = await wasmModule.get_sections({ input: [sectionId] });
        if (response.output && response.output.output.length > 0) {
          setSectionDetails(response.output.output[0]);
        }
      } catch (err) {
        console.error("Failed to fetch section:", err);
      }
    };

    if (!sectionDetails && sectionId) {
      fetchSection();
    }
  }, [wasmModule, sectionId, sectionDetails]);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <ChevronRight className="h-4 w-4" />
        <span className="truncate">{sectionDetails?.name || `Section ${index + 1}`}</span>
        <InfoTooltip 
          name={sectionDetails?.name}
          description={sectionDetails?.description}
          id={sectionDetails?.id}
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <ComplianceIndicator rating={complianceRating} />
        </div>
      </div>
    </div>
  );
};


const getStatusBadge = (status: ReportStatus) => {
  const statusStyles: Record<ReportStatus, string> = {
    processing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    partially_failed: 'bg-red-100 text-red-800'
  };

  return (
    <Badge className={statusStyles[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </Badge>
  );
};


const ReportViewer = () => {
  const params = useParams();
  const reportId = params?.reportId as string;
  const { wasmModule } = useWasm();
  const [report, setReport] = React.useState<Report | null>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    const fetchReport = async () => {
      console.log('Fetching report, WASM module status:', !!wasmModule);
      
      if (!wasmModule) {
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
          return;
        }
        setError('WASM module not loaded. Please refresh the page.');
        setLoading(false);
        return;
      }

      if (!reportId) {
        setError('Invalid report ID');
        setLoading(false);
        return;
      }

      try {
        console.log('Making WASM call with reportId:', reportId);
        const response = await wasmModule.get_report({ input: reportId });
        console.log('Got report response:', response);
        
        if (response.output) {
          console.log('Report data:', {
            title: response.output.output.title,
            sectionsCount: Object.keys(response.output.output.section_assessments || {}).length,
            sections: response.output.output.section_assessments
          });
          setReport(response.output.output);
        } else if (response.error) {
          console.error('Report error:', response.error);
          setError(response.error.message);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError('Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [wasmModule, reportId, retryCount]);


  const renderSections = () => {
    if (!report?.section_assessments) {
      console.log('No section assessments found in report');
      return null;
    }

    const sectionEntries = Array.from(report.section_assessments.entries());
    console.log('Section entries:', sectionEntries);

    return sectionEntries.map(([sectionId, section], index) => {
      console.log('Rendering section:', {
        sectionId,
        abstractText: section.abstract_text,
        requirementCount: section.requirement_assessments ? Array.from(section.requirement_assessments.entries()).length : 0
      });

      return (
        <AccordionItem value={`section-${index}`} key={sectionId} className="border rounded-lg">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <SectionHeader 
              sectionId={sectionId}
              complianceRating={section.compliance_rating}
              index={index}
              reportId={reportId}
            />
          </AccordionTrigger>
          <AccordionContent className="px-4 py-2">
            <div className="space-y-4">
              <p className="text-gray-700">{section.abstract_text}</p>
              
              {section.requirement_assessments && Array.from(section.requirement_assessments.entries()).map(([reqId, req], reqIndex) => {
                console.log('Rendering requirement:', {
                  reqId,
                  type: isRequirementOrGroupAssessment(req) ? 'requirement' : 'group'
                });

                const wrapper = createAssessmentWrapper(req, reqId);
                return isRequirementAssessment(wrapper) ? (
                  <RequirementCard 
                    key={reqId}
                    req={wrapper}
                    index={reqIndex}
                    reportId={reportId}
                  />
                ) : (
                  <RequirementGroupCard 
                    key={reqId}
                    group={wrapper}
                    reportId={reportId}
                    index={reqIndex}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    });
  };

  if (!report) {
    console.log('No report data available');
    return null;
  }

  console.log('Rendering full report:', {
    title: report.title,
    status: report.status,
    sectionsCount: Object.keys(report.section_assessments || {}).length
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{report.title}</CardTitle>
            <div className="flex items-center gap-4">
              <ThreadViewButton reportId={report.id} />
              {getStatusBadge(report.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Abstract</h3>
              <p className="text-gray-700">{report.abstract_text}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Overall Compliance:</span>
              <div className="flex items-center gap-1">
                <ComplianceIndicator rating={report.compliance_rating} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="space-y-4">
        {renderSections()}
      </Accordion>
    </div>
  );
};

export default ReportViewer;
