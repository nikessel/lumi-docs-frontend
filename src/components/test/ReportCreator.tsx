import React, { useState, useEffect, useCallback } from "react";
import { useWasm } from "@/components/WasmProvider";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Section, Requirement, RequirementGroup, IdType, RegulatoryFramework } from "@wasm";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";

type Step = "framework" | "initial" | "sections" | "requirements";

interface SelectionSummary {
  framework: RegulatoryFramework;
  sections: Section[];
  requirementGroups: RequirementGroup[];
  requirements: Requirement[];
  totalCounts: {
    sections: number;
    requirementGroups: number;
    requirements: number;
  };
}

const FRAMEWORKS: { value: RegulatoryFramework; label: string }[] = [
  { value: "mdr", label: "Medical Device Regulation (MDR)" },
  { value: "iso13485", label: "ISO 13485" },
  { value: "iso14155", label: "ISO 14155" },
  { value: "iso14971", label: "ISO 14971" }
];

export function ReportCreator() {
  const { wasmModule } = useWasm();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("framework");
  const [selectedFramework, setSelectedFramework] = useState<RegulatoryFramework | null>(null);

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

  // Load sections based on selected framework and update available counts
  const loadInitialData = useCallback(async () => {
    if (!wasmModule || !selectedFramework) return;
    console.log('🔄 Loading sections for framework:', selectedFramework);
    try {
      const sectionsResponse = await wasmModule.get_sections_by_regulatory_framework({
        input: selectedFramework
      });
      if (sectionsResponse.output) {
        const frameworkSections = sectionsResponse.output.output;
        console.log('📊 Loaded sections:', {
          count: frameworkSections.length,
          sections: frameworkSections.map(s => ({ id: s.id, name: s.name }))
        });
        setSections(frameworkSections);

        // Load all requirement groups for all sections
        const groupsPromises = frameworkSections.map(section =>
          wasmModule.get_requirement_groups_by_section({ input: section.id })
        );

        const groupResponses = await Promise.all(groupsPromises);
        const allGroups = groupResponses.flatMap(response =>
          response.output ? response.output.output : []
        );

        // Remove duplicate groups
        const uniqueGroups = Array.from(
          new Map(allGroups.map(group => [group.id, group])).values()
        );

        console.log('📊 Loaded all requirement groups:', {
          total: allGroups.length,
          unique: uniqueGroups.length,
          groups: uniqueGroups.map(g => ({ id: g.id, name: g.name }))
        });

        // Load all requirements for all groups
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

        console.log('📊 Loaded all requirements:', {
          total: allRequirements.length,
          unique: uniqueRequirements.length,
          requirements: uniqueRequirements.map(r => ({ id: r.id, name: r.name }))
        });

        setRequirementGroups(uniqueGroups);
        setRequirements(uniqueRequirements);

        // Set initial counts with all available items
        const newCounts = {
          sections: frameworkSections.length,
          requirementGroups: uniqueGroups.length,
          requirements: uniqueRequirements.length
        };
        console.log('🔢 Updating counts:', newCounts);
        setTotalCounts(newCounts);

        // Reset selections
        setSelectedSections([]);
        setSelectedGroups([]);
        setSelectedRequirements([]);
      }
    } catch (err) {
      console.error("❌ Error fetching sections:", err);
      setError("Failed to fetch sections");
    }
  }, [wasmModule, selectedFramework]);

  useEffect(() => {
    if (selectedFramework) {
      loadInitialData();
    }
  }, [loadInitialData, selectedFramework]);

  const loadRequirementGroups = useCallback(async () => {
    if (!wasmModule || selectedSections.length === 0) return;

    console.log('🔄 Loading requirement groups for sections:', selectedSections);
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

      console.log('📊 Loaded requirement groups:', {
        total: allGroups.length,
        unique: uniqueGroups.length,
        groups: uniqueGroups.map(g => ({ id: g.id, name: g.name }))
      });

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

      console.log('📊 Loaded requirements:', {
        total: allRequirements.length,
        unique: uniqueRequirements.length,
        requirements: uniqueRequirements.map(r => ({ id: r.id, name: r.name }))
      });

      setRequirementGroups(uniqueGroups);
      setRequirements(uniqueRequirements);
      setSelectedGroups([]);
      setSelectedRequirements([]);

      // Update total counts
      const newCounts = {
        sections: selectedSections.length,
        requirementGroups: uniqueGroups.length,
        requirements: uniqueRequirements.length
      };
      console.log('🔢 Updating counts:', newCounts);
      setTotalCounts(newCounts);
    } catch (err) {
      console.error("❌ Error fetching requirement groups:", err);
      setError("Failed to fetch requirement groups");
    }
  }, [wasmModule, selectedSections]);

  // When a group is selected, we need to fetch its requirements
  const loadChildGroups = useCallback(async () => {
    if (!wasmModule || selectedGroups.length === 0) return;

    console.log('🔄 Loading requirements for groups:', selectedGroups);
    try {
      // Get requirements for selected groups
      const requirementPromises = selectedGroups.map(groupId =>
        wasmModule.get_requirements_by_group({ input: groupId })
      );

      const requirementResponses = await Promise.all(requirementPromises);
      const allRequirements = requirementResponses.flatMap(response =>
        response.output ? response.output.output : []
      );

      // Remove duplicates
      const uniqueRequirements = Array.from(
        new Map(allRequirements.map(req => [req.id, req])).values()
      );

      console.log('📊 Loaded requirements:', {
        total: allRequirements.length,
        unique: uniqueRequirements.length,
        requirements: uniqueRequirements.map(r => ({ id: r.id, name: r.name }))
      });

      setRequirements(uniqueRequirements);
      // Clear requirement selections when groups change
      setSelectedRequirements([]);

      // Update requirements count
      const newCounts = {
        ...totalCounts,
        requirements: uniqueRequirements.length
      };
      console.log('🔢 Updating counts:', newCounts);
      setTotalCounts(newCounts);
    } catch (err) {
      console.error("❌ Error fetching requirements:", err);
      setError("Failed to fetch requirements");
    }
  }, [wasmModule, selectedGroups, totalCounts]);

  useEffect(() => {
    if (selectedSections.length > 0 && wasmModule) {
      console.log('👀 Selected sections changed:', selectedSections);
      loadRequirementGroups();
    }
  }, [selectedSections, loadRequirementGroups, wasmModule]);

  useEffect(() => {
    if (selectedGroups.length > 0 && wasmModule) {
      console.log('👀 Selected groups changed:', selectedGroups);
      loadChildGroups();
    }
  }, [selectedGroups, loadChildGroups, wasmModule]);

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
    setError("");
  };

  const handleConfirmCreation = () => {
    if (!selectedFramework) {
      setError("Please select a regulatory framework");
      return;
    }

    const summary = buildSelectionSummary();
    setSelectionSummary(summary);
    setShowConfirmDialog(true);
  };

  const handleFrameworkSelection = (framework: RegulatoryFramework) => {
    setSelectedFramework(framework);
    setCurrentStep("initial");
    // Reset all selections and counts when framework changes
    setSelectedSections([]);
    setSelectedGroups([]);
    setSelectedRequirements([]);
    setRequirementGroups([]);
    setRequirements([]);
    // Reset counts (sections count will be updated by loadInitialData)
    setTotalCounts({
      sections: 0,
      requirementGroups: 0,
      requirements: 0
    });
  };

  const buildSelectionSummary = (): SelectionSummary => {
    console.log('🏗️ Building selection summary:', {
      currentStep,
      totalCounts,
      selectedCounts: {
        sections: selectedSections.length,
        groups: selectedGroups.length,
        requirements: selectedRequirements.length
      },
      availableCounts: {
        sections: sections.length,
        groups: requirementGroups.length,
        requirements: requirements.length
      }
    });

    const selectedSectionsList = sections.filter(s => selectedSections.includes(s.id));
    const selectedGroupsList = requirementGroups.filter(g => selectedGroups.includes(g.id));
    const selectedRequirementsList = requirements.filter(r => selectedRequirements.includes(r.id));

    // Always show actual counts of what's currently available/selected
    const effectiveCounts = {
      sections: currentStep === "initial" ? sections.length : selectedSectionsList.length,
      requirementGroups: selectedGroups.length > 0 ? selectedGroups.length : requirementGroups.length,
      requirements: selectedRequirements.length > 0 ? selectedRequirements.length : requirements.length
    };

    console.log('📊 Selection summary results:', {
      effectiveCounts,
      selectedItems: {
        sections: selectedSectionsList.map(s => s.name),
        groups: selectedGroupsList.map(g => g.name),
        requirements: selectedRequirementsList.map(r => r.name)
      }
    });

    return {
      framework: selectedFramework!,
      sections: selectedSectionsList,
      requirementGroups: selectedGroupsList,
      requirements: selectedRequirementsList,
      totalCounts: effectiveCounts
    };
  };

  const handleCreateReport = async () => {
    if (!selectedFramework) return;

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const input = {
        regulatory_framework: selectedFramework,
        filter: {
          sections_to_include: selectedSections.length > 0 ? selectedSections : undefined,
          requirements_to_include: selectedRequirements.length > 0 ? selectedRequirements : undefined,
          requirement_groups_to_include: selectedGroups.length > 0 ? selectedGroups : undefined,
          document_numbers_to_include: undefined
        }
      };

      const response = await wasmModule!.create_report(input);
      if (response.output) {
        setSuccessMessage(
          `Report created successfully with ID: ${response.output.output}`
        );
        setSelectedSections([]);
        setSelectedGroups([]);
        setSelectedRequirements([]);
        setCurrentStep("framework");
        setSelectedFramework(null);
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

        {currentStep === "framework" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Regulatory Framework</label>
              <Select
                onValueChange={(value) => handleFrameworkSelection(value as RegulatoryFramework)}
                value={selectedFramework || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a framework..." />
                </SelectTrigger>
                <SelectContent>
                  {FRAMEWORKS.map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      {framework.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {currentStep === "initial" && (
          <div className="space-y-2">
            <div className="mb-4 flex items-center space-x-2">
              <span className="text-sm font-medium">Framework:</span>
              <span className="text-sm text-muted-foreground">
                {FRAMEWORKS.find(f => f.value === selectedFramework)?.label}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentStep("framework");
                  setSelectedFramework(null);
                }}
              >
                Change
              </Button>
            </div>
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
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium">Framework:</span>
              <span className="text-sm text-muted-foreground">
                {FRAMEWORKS.find(f => f.value === selectedFramework)?.label}
              </span>
            </div>
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
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium">Framework:</span>
              <span className="text-sm text-muted-foreground">
                {FRAMEWORKS.find(f => f.value === selectedFramework)?.label}
              </span>
            </div>
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

            {requirements.length > 0 && (
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
                    <span className="text-sm font-medium">Framework</span>
                    <span className="text-sm text-muted-foreground">
                      {FRAMEWORKS.find(f => f.value === selectionSummary.framework)?.label}
                    </span>
                  </div>
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

export default ReportCreator;
