import React, { useState, useEffect, useCallback } from "react";
import { useWasm } from "@/components/WasmProvider";
import { useAuth } from "@/components/Auth0";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Section, Requirement, RequirementGroup, IdType } from "@wasm";

type Step = "initial" | "sections" | "requirements";

interface SelectionSummary {
  sections: Section[];
  requirementGroups: RequirementGroup[];
  requirements: Requirement[];
  totalCounts: {
    sections: number;
    requirementGroups: number;
    requirements: number;
  };
}

export function ReportCreator() {
  const { wasmModule } = useWasm();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("initial");
  
  // Data states
  const [sections, setSections] = useState<Section[]>([]);
  const [requirementGroups, setRequirementGroups] = useState<RequirementGroup[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  
  // Total counts state
  const [totalCounts, setTotalCounts] = useState({
    sections: 0,
    requirementGroups: 0,
    requirements: 0,
  });
  
  // Selection states
  const [selectedSections, setSelectedSections] = useState<IdType[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<IdType[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<IdType[]>([]);
  
  // UI states
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectionSummary, setSelectionSummary] = useState<SelectionSummary | null>(null);

  // Load total counts when the component mounts
  const loadTotalCounts = useCallback(async () => {
    if (!wasmModule) return;
    try {
      const [sectionsResponse, groupsResponse, requirementsResponse] = await Promise.all([
        wasmModule.get_all_sections(),
        wasmModule.get_all_requirement_groups(),
        wasmModule.get_all_requirements()
      ]);

      setTotalCounts({
        sections: sectionsResponse.output?.output.length || 0,
        requirementGroups: groupsResponse.output?.output.length || 0,
        requirements: requirementsResponse.output?.output.length || 0,
      });
    } catch (err) {
      console.error("Error fetching total counts:", err);
    }
  }, [wasmModule]);

  useEffect(() => {
    loadTotalCounts();
  }, [loadTotalCounts]);

  // First, let's fix the loading functions with useCallback
  const loadInitialData = useCallback(async () => {
    if (!wasmModule) return;
    try {
      const sectionsResponse = await wasmModule.get_all_sections();
      if (sectionsResponse.output) {
        setSections(sectionsResponse.output.output);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("Failed to fetch sections");
    }
  }, [wasmModule]);


const loadRequirementGroups = useCallback(async () => {
  if (!wasmModule || selectedSections.length === 0) return;
  
  try {
    // First get all requirement groups for selected sections
    const groupsPromises = selectedSections.map(sectionId =>
      wasmModule.get_requirement_groups_by_section({ input: sectionId })
    );
    
    const groupResponses = await Promise.all(groupsPromises);
    const allGroups = groupResponses.flatMap(response => 
      response.output ? response.output.output : []
    );
    
    // Remove duplicate groups
    const uniqueGroups = Array.from(
      new Map(allGroups.map(group => [group.id, group])).values()
    );

    // Then get requirements for each group
    const requirementPromises = uniqueGroups.map(group =>
      wasmModule.get_requirements_by_group({ input: group.id })
    );

    const requirementResponses = await Promise.all(requirementPromises);
    const allRequirements = requirementResponses.flatMap(response =>
      response.output ? response.output.output : []
    );

    // Remove duplicate requirements
    const uniqueRequirements = Array.from(
      new Map(allRequirements.map(req => [req.id, req])).values()
    );
    
    setRequirementGroups(uniqueGroups);
    setRequirements(uniqueRequirements);
    setSelectedGroups([]);
    setSelectedRequirements([]);
  } catch (err) {
    console.error("Error fetching requirement groups:", err);
    setError("Failed to fetch requirement groups");
  }
}, [wasmModule, selectedSections]);

// When a group is selected, we need to fetch its requirements
const loadChildGroups = useCallback(async () => {
  if (!wasmModule || selectedGroups.length === 0) return;
  
  try {
    // Get requirements for selected groups
    const requirementPromises = selectedGroups.map(groupId =>
      wasmModule.get_requirements_by_group({ input: groupId })
    );
    
    const requirementResponses = await Promise.all(requirementPromises);
    const newRequirements = requirementResponses.flatMap(response =>
      response.output ? response.output.output : []
    );
    
    // Remove duplicates
    const uniqueRequirements = Array.from(
      new Map(newRequirements.map(req => [req.id, req])).values()
    );
    
    setRequirements(uniqueRequirements);
    // Clear requirement selections when groups change
    setSelectedRequirements([]);
  } catch (err) {
    console.error("Error fetching requirements:", err);
    setError("Failed to fetch requirements");
  }
}, [wasmModule, selectedGroups]);

useEffect(() => {
  if (selectedGroups.length > 0 && wasmModule) {
    loadChildGroups();
  }
}, [selectedGroups, loadChildGroups, wasmModule]);

const buildSelectionSummary = (): SelectionSummary => {
  const selectedSectionsList = sections.filter(s => selectedSections.includes(s.id));
  const selectedGroupsList = requirementGroups.filter(g => selectedGroups.includes(g.id));
  const selectedRequirementsList = requirements.filter(r => selectedRequirements.includes(r.id));

  // Default to full report counts
  let effectiveCounts = {
    sections: totalCounts.sections,
    requirementGroups: totalCounts.requirementGroups,
    requirements: totalCounts.requirements
  };

  if (currentStep !== "initial") {
    if (selectedSectionsList.length > 0) {
      effectiveCounts.sections = selectedSectionsList.length;
      
      if (currentStep === "sections") {
        // When only sections are selected, show all groups and requirements for those sections
        effectiveCounts.requirementGroups = requirementGroups.length;
        effectiveCounts.requirements = requirements.length;
      } else if (currentStep === "requirements") {
        // When specific groups are selected, only show their requirements
        if (selectedGroups.length > 0) {
          effectiveCounts.requirementGroups = selectedGroups.length;
          effectiveCounts.requirements = requirements.length; // Now this will be up to date with the selected groups' requirements
        } else {
          // No groups selected yet, show all groups and requirements for the sections
          effectiveCounts.requirementGroups = requirementGroups.length;
          effectiveCounts.requirements = requirements.length;
        }
      }
    }
  }

  return {
    sections: selectedSectionsList,
    requirementGroups: selectedGroupsList,
    requirements: selectedRequirementsList,
    totalCounts: effectiveCounts
  };
};


  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadRequirementGroups();
  }, [loadRequirementGroups, selectedSections]);

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
    setError("");
  };



// Then update the dialog content to only show section names:
{selectionSummary && (
  <div className="space-y-4 py-4">
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Sections</span>
        <span className="text-sm text-muted-foreground">
          {selectionSummary.totalCounts.sections}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Requirement Groups</span>
        <span className="text-sm text-muted-foreground">
          {selectionSummary.totalCounts.requirementGroups}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Requirements</span>
        <span className="text-sm text-muted-foreground">
          {selectionSummary.totalCounts.requirements}
        </span>
      </div>
    </div>

    {/* Only show section names if specific selections were made */}
    {selectionSummary.sections.length > 0 && (
      <div className="pt-4 border-t">
        <div className="text-sm font-medium mb-2">Selected Sections:</div>
        <ul className="list-disc pl-5 space-y-1">
          {selectionSummary.sections.map(s => (
            <li key={s.id} className="text-sm text-muted-foreground">{s.name}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}

  const handleConfirmCreation = () => {
    const summary = buildSelectionSummary();
    setSelectionSummary(summary);
    setShowConfirmDialog(true);
  };

  const handleCreateReport = async () => {
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const input = {
        input: {
          sections_to_include: selectedSections.length > 0 ? selectedSections : undefined,
          requirements_to_include: selectedRequirements.length > 0 ? selectedRequirements : undefined,
          requirement_groups_to_include: selectedGroups.length > 0 ? selectedGroups : undefined,
        },
      };

      const response = await wasmModule!.create_report(input);
      if (response.output) {
        setSuccessMessage(
          `Report created successfully with ID: ${response.output.output}`
        );
        setSelectedSections([]);
        setSelectedGroups([]);
        setSelectedRequirements([]);
        setCurrentStep("initial");
      } else if (response.error) {
        setError(`${response.error.kind}: ${response.error.message}`);
      }
    } catch (err) {
      console.error("Error creating report:", err);
      setError("Failed to create report");
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
        <AlertDescription>Please log in to create a report.</AlertDescription>
      </Alert>
    );
  }

return (
  <Card className="w-full max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle>Create a New Report</CardTitle>
    </CardHeader>
    <CardContent>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 text-green-800 border-green-200 mb-4">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {currentStep === "initial" && (
        <div className="space-y-2">
          <Button 
            onClick={() => handleConfirmCreation()} 
            className="w-full"
          >
            Create Full Report
          </Button>
          <Button
            onClick={() => handleStepChange("sections")}
            variant="outline"
            className="w-full"
          >
            Select Specific Sections
          </Button>
        </div>
      )}

      {currentStep === "sections" && (
        <div className="space-y-4">
          <div className="max-h-64 overflow-y-auto border p-4 rounded">
            {sections.map((section) => (
              <div key={section.id} className="flex items-start space-x-2 mb-2">
                <Checkbox
                  id={`section-${section.id}`}
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={(checked) => {
                    setSelectedSections(prev =>
                      checked
                        ? [...prev, section.id]
                        : prev.filter(id => id !== section.id)
                    );
                  }}
                  className="mt-1"
                />
                <label htmlFor={`section-${section.id}`} className="text-sm flex-1">
                  <span className="font-medium">{section.name}</span>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </label>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => handleConfirmCreation()}
              disabled={selectedSections.length === 0}
              className="w-full"
            >
              Create Report with Selected Sections
            </Button>
            <Button
              onClick={() => handleStepChange("requirements")}
              variant="outline"
              disabled={selectedSections.length === 0}
              className="w-full"
            >
              Select Requirements
            </Button>
          </div>
        </div>
      )}

{currentStep === "requirements" && (
  <div className="space-y-4">
    <Button
      variant="ghost"
      onClick={() => {
        handleStepChange("sections");
        setSelectedGroups([]);
        setSelectedRequirements([]);
      }}
      className="text-sm -ml-4"
    >
      ← Back to Sections
    </Button>

    {requirementGroups.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold mb-2">Requirement Groups</h3>
        <div className="max-h-64 overflow-y-auto border p-4 rounded mb-4">
          {requirementGroups.map((group) => (
            <div key={group.id} className="flex items-start space-x-2 mb-2">
              <Checkbox
                id={`group-${group.id}`}
                checked={selectedGroups.includes(group.id)}
                onCheckedChange={(checked) => {
                  setSelectedGroups(prev =>
                    checked
                      ? [...prev, group.id]
                      : prev.filter(id => id !== group.id)
                  );
                }}
                className="mt-1"
              />
              <label htmlFor={`group-${group.id}`} className="text-sm flex-1">
                <span className="font-medium">{group.name}</span>
                <p className="text-xs text-gray-500">{group.description}</p>
              </label>
            </div>
          ))}
        </div>

        {/* Add action buttons after groups selection */}
        <div className="space-y-2">
          <Button
            onClick={() => handleConfirmCreation()}
            disabled={selectedGroups.length === 0}
            className="w-full"
          >
            Create Report with Selected Groups
          </Button>
          <Button
            onClick={loadChildGroups}
            variant="outline"
            disabled={selectedGroups.length === 0}
            className="w-full"
          >
            Select Requirements Within Groups
          </Button>
        </div>
      </div>
    )}

    {/* Only show requirements section after user clicks to see them */}
    {requirements.length > 0 && selectedRequirements.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold mb-2">Requirements</h3>
        <div className="max-h-64 overflow-y-auto border p-4 rounded mb-4">
          {requirements.map((requirement) => (
            <div key={requirement.id} className="flex items-start space-x-2 mb-2">
              <Checkbox
                id={`requirement-${requirement.id}`}
                checked={selectedRequirements.includes(requirement.id)}
                onCheckedChange={(checked) => {
                  setSelectedRequirements(prev =>
                    checked
                      ? [...prev, requirement.id]
                      : prev.filter(id => id !== requirement.id)
                  );
                }}
                className="mt-1"
              />
              <label htmlFor={`requirement-${requirement.id}`} className="text-sm flex-1">
                <span className="font-medium">{requirement.name}</span>
                <p className="text-xs text-gray-500">{requirement.description}</p>
              </label>
            </div>
          ))}
        </div>

        <Button
          onClick={() => handleConfirmCreation()}
          className="w-full"
          disabled={selectedRequirements.length === 0}
        >
          Create Report with Selected Requirements
        </Button>
      </div>
    )}
  </div>
)}

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Report Creation</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Please review your selections below.
              </DialogDescription>
            </DialogHeader>

            {selectionSummary && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sections</span>
                    <span className="text-sm text-muted-foreground">
                      {selectionSummary.totalCounts.sections}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Requirement Groups</span>
                    <span className="text-sm text-muted-foreground">
                      {selectionSummary.totalCounts.requirementGroups}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Requirements</span>
                    <span className="text-sm text-muted-foreground">
                      {selectionSummary.totalCounts.requirements}
                    </span>
                  </div>
                </div>

                {/* Show detailed selections if any specific items were selected */}
                {(selectionSummary.sections.length > 0 ||
                  selectionSummary.requirementGroups.length > 0 ||
                  selectionSummary.requirements.length > 0) && (
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Selected Items:</div>
                    {selectionSummary.sections.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm text-muted-foreground">Sections:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectionSummary.sections.map(s => (
                            <li key={s.id} className="text-sm text-muted-foreground">{s.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectionSummary.requirementGroups.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm text-muted-foreground">Requirement Groups:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectionSummary.requirementGroups.map(g => (
                            <li key={g.id} className="text-sm text-muted-foreground">{g.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectionSummary.requirements.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground">Requirements:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectionSummary.requirements.map(r => (
                            <li key={r.id} className="text-sm text-muted-foreground">{r.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <div className="space-y-2 w-full">
                <Button onClick={handleCreateReport} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Creating..." : "Create Report"}
                </Button>
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

    </CardContent>
  </Card>
);

}
