import type { 
  Report, 
  RequirementOrRequirementGroupAssessment,
  RequirementAssessment,
  RequirementGroupAssessment,
  IdType
} from '@wasm';

interface Section {
  section_id: IdType;
  // Add other section properties as needed
}

interface TreeNode {
  id: string;
  title: string;
  children?: TreeNode[];
}

export function processReport(report: Report, section: Section): TreeNode {
  // Convert Map to array of entries and find matching section
  const sectionAssessment = Array.from(report.section_assessments.entries())
    .find(([id]) => id === section.section_id)?.[1];

  if (!sectionAssessment) {
    return {
      id: section.section_id,
      title: 'Section Not Found'
    };
  }

  // Process requirement assessments if they exist
  const children = sectionAssessment.requirement_assessments
    ? Array.from(sectionAssessment.requirement_assessments.entries()).map(([reqId, req]) => 
        processRequirement(reqId, req)
      )
    : undefined;

  return {
    id: section.section_id,
    title: `Section ${section.section_id}`,
    children
  };
}

function processRequirement(
  reqId: IdType, 
  requirement: RequirementOrRequirementGroupAssessment
): TreeNode {
  const assessmentChildren = 'requirement' in requirement
    ? processRequirementAssessment(requirement.requirement)
    : processRequirementGroupAssessment(requirement.requirement_group);

  return {
    id: reqId,
    title: `Requirement ${reqId}`,
    children: assessmentChildren
  };
}

function processRequirementAssessment(
  _assessment: RequirementAssessment
): TreeNode[] | undefined {
  // Implement specific assessment processing logic here
  return [];
}

function processRequirementGroupAssessment(
  assessment: RequirementGroupAssessment
): TreeNode[] | undefined {
  if (!assessment.assessments) {
    return undefined;
  }

  const entries = Array.from(assessment.assessments.entries()) as Array<[IdType, RequirementOrRequirementGroupAssessment]>;
  
  return entries.map(([id, childAssessment]) => ({
    id,
    title: `Assessment ${id}`,
    children: 'requirement' in childAssessment
      ? processRequirementAssessment(childAssessment.requirement)
      : processRequirementGroupAssessment(childAssessment.requirement_group)
  }));
}
