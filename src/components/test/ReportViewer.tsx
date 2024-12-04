"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useWasm } from '@/components/WasmProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
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
  TaskStatus
} from '@wasm';

type RequirementOrGroupAssessment = RequirementAssessment | RequirementGroupAssessment;


const isRequirementAssessment = (
  assessment: RequirementOrGroupAssessment
): assessment is RequirementAssessment => {
  return 'requirement_id' in assessment && !('requirement_group_id' in assessment);
};

const InfoTooltip: React.FC<{
  name?: string;
  description?: string;
  reference?: string;
  id?: string;
}> = ({ name, description, reference, id }) => {
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

const TaskList: React.FC<{
  reportId: string;
  requirementId: string;
}> = ({ reportId, requirementId }) => {
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

  const getTaskStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ignored':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Tasks</h4>
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-2">
              {task.status && getTaskStatusIcon(task.status)}
              <div className="flex-1">
                <div className="font-medium">{task.title}</div>
                <p className="text-sm text-gray-600">{task.description}</p>
                {task.associated_document && (
                  <div className="text-sm text-gray-500 mt-1">
                    Document: {task.associated_document}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const RequirementCard: React.FC<{ 
  req: any;
  reportId: string;
  index: number;
}> = ({ req, reportId, index }) => {
  const { wasmModule } = useWasm();
  const [reqDetails, setReqDetails] = React.useState<Requirement | undefined>();

  React.useEffect(() => {
    const fetchRequirement = async () => {
      if (!wasmModule || !req.content.requirement_id) return;
      
      try {
        const response = await wasmModule.get_requirement({ input: req.content.requirement_id });
        if (response.output) {
          setReqDetails(response.output.output);
        }
      } catch (err) {
        console.error("Failed to fetch requirement:", err);
      }
    };

    if (!reqDetails && req.content.requirement_id) {
      fetchRequirement();
    }
  }, [wasmModule, req.content.requirement_id, reqDetails]);

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
          <div className="flex items-center gap-1 flex-shrink-0">
            <ComplianceIndicator rating={req.content.compliance_rating} />
          </div>
        </div>
      </AccordionTrigger>
<AccordionContent className="px-4 py-2">
  <div className="space-y-4">
    {/* Assessment Summary */}
    <div>
      <h4 className="font-medium mb-1">Assessment Summary</h4>
      <p className="text-sm text-gray-700">{req.content.summary}</p>
    </div>

    {/* Assessment Details */}
    <div>
      <h4 className="font-medium mb-1">Assessment Details</h4>
      <p className="text-sm text-gray-700">{req.content.details}</p>
    </div>

    {/* Findings */}
    {req.content.findings?.length > 0 && (
      <div>
        <h4 className="font-medium mb-1">Findings</h4>
        <ul className="list-disc pl-4 space-y-1">
          {req.content.findings.map((finding: string, i: number) => (
            <li key={i} className="text-sm text-gray-700">{finding}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Source Documents */}
    {req.content.sources?.length > 0 && (
      <div>
        <h4 className="font-medium mb-1">Source Documents</h4>
        <ul className="list-disc pl-4">
          {req.content.sources.map((source: string, i: number) => (
            <li key={i} className="text-sm text-gray-700">{source}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Tasks */}
    {req.content.requirement_id && (
      <TaskList 
        reportId={reportId}
        requirementId={req.content.requirement_id}
      />
    )}
  </div>
</AccordionContent>
    </AccordionItem>
  );
};

const RequirementGroupCard: React.FC<{
  group: any;
  reportId: string;
  index: number;
}> = ({ group, reportId, index }) => {
  const { wasmModule } = useWasm();
  const [groupDetails, setGroupDetails] = React.useState<RequirementGroup | undefined>();

  React.useEffect(() => {
    const fetchRequirementGroup = async () => {
      if (!wasmModule || !group.content.requirement_group_id) return;
      
      try {
        const response = await wasmModule.get_requirement_group({ input: group.content.requirement_group_id });
        if (response.output) {
          setGroupDetails(response.output.output);
        }
      } catch (err) {
        console.error("Failed to fetch requirement group:", err);
      }
    };

    if (!groupDetails && group.content.requirement_group_id) {
      fetchRequirementGroup();
    }
  }, [wasmModule, group.content.requirement_group_id, groupDetails]);

  if (!group.content.assessments?.length) return null;

  return (
    <AccordionItem value={`group-${index}`} className="border rounded-lg bg-gray-50">
      <AccordionTrigger className="px-4 py-2 hover:no-underline w-full">
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="truncate">{groupDetails?.name || `Requirement Group ${index + 1}`}</span>
    <InfoTooltip 
      name={groupDetails?.name}
      description={groupDetails?.description}
      reference={groupDetails?.reference}
      id={groupDetails?.id}
    />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <ComplianceIndicator rating={group.content.compliance_rating} />
          </div>
        </div>
      </AccordionTrigger>
<AccordionContent className="px-4 py-2">
  <div className="space-y-4">
    {/* Assessment Summary */}
    <div>
      <h4 className="font-medium mb-1">Assessment Summary</h4>
      <p className="text-sm text-gray-700">{group.content.summary}</p>
    </div>

    {/* Assessment Details */}
    <div>
      <h4 className="font-medium mb-1">Assessment Details</h4>
      <p className="text-sm text-gray-700">{group.content.details}</p>
    </div>

    {/* Nested Requirements */}
    {group.content.assessments?.length > 0 && (
      <Accordion type="multiple" className="space-y-2">
        {group.content.assessments.map((assessment: any, i: number) => (
          isRequirementAssessment(assessment.content) ? (
            <RequirementCard 
              key={i} 
              req={assessment} 
              reportId={reportId}
              index={i} 
            />
          ) : (
            <RequirementGroupCard 
              key={i} 
              group={assessment} 
              reportId={reportId}
              index={i} 
            />
          )
        ))}
      </Accordion>
    )}
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
}> = ({ sectionId, complianceRating, index }) => {
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
      <div className="flex items-center gap-1">
        <ComplianceIndicator rating={complianceRating} />
      </div>
    </div>
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
        const response = await wasmModule.get_report({ input: reportId });
        if (response.output) {
          setReport(response.output.output);
        } else if (response.error) {
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

  console.log("!!", report)

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

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
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



  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{report.title}</CardTitle>
            {getStatusBadge(report.status)}
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
        {report.section_assessments.map((section, index) => (
          <AccordionItem value={`section-${index}`} key={index} className="border rounded-lg">
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
  <SectionHeader 
    sectionId={section.section_id} 
    complianceRating={section.compliance_rating}
    index={index}
  />
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4">
                <p className="text-gray-700">{section.abstract_text}</p>
                
{section.requirement_assessments?.map((req, reqIndex) => (
  isRequirementAssessment(req) ? (
    <RequirementCard 
      key={reqIndex} 
      req={req} 
      index={reqIndex}
      reportId={reportId}
    />
  ) : (
    <RequirementGroupCard 
      key={reqIndex} 
      group={req} 
      reportId={reportId}  // Add reportId here
      index={reqIndex} 
    />
  )
))}

              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ReportViewer;
