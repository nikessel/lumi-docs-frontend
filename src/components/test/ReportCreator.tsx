import React, { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { useAuth } from "@/components/Auth0";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import type { Section, Requirement, IdType } from "@wasm";

export function ReportCreator() {
  const { wasmModule } = useWasm();
  const { isAuthenticated } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedSections, setSelectedSections] = useState<IdType[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<IdType[]>([]);
  const [showSectionSelection, setShowSectionSelection] = useState(false);
  const [showRequirementSelection, setShowRequirementSelection] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch sections and requirements when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!wasmModule) return;

      try {
        const sectionsResponse = await wasmModule.get_categories(); // Assuming get_categories now returns sections
        const requirementsResponse = await wasmModule.get_requirements();

        if (sectionsResponse.output && requirementsResponse.output) {
          setSections(sectionsResponse.output.output);
          setRequirements(requirementsResponse.output.output);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch sections and requirements");
      }
    };

    fetchData();
  }, [wasmModule]);

  const handleSectionChange = (id: IdType, checked: boolean) => {
    setSelectedSections((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleRequirementChange = (id: IdType, checked: boolean) => {
    setSelectedRequirements((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    if (!wasmModule) {
      setError("WASM module not loaded");
      setIsSubmitting(false);
      return;
    }

    try {
      const input = {
        input: {
          sections_to_include:
            showSectionSelection && selectedSections.length > 0
              ? selectedSections
              : undefined,
          requirements_to_include:
            showRequirementSelection && selectedRequirements.length > 0
              ? selectedRequirements
              : undefined,
        },
      };

      const response = await wasmModule.create_report(input);
      if (response.output) {
        setSuccessMessage(
          `Report created successfully with ID: ${response.output.output}`
        );
        setSelectedSections([]);
        setSelectedRequirements([]);
      } else if (response.error) {
        // Format error details including the error kind
        const errorMessage = `${response.error.kind}: ${response.error.message}`;
        setError(errorMessage);
        
        // Log full error object for debugging
        console.error("Report creation failed:", {
          kind: response.error.kind,
          message: response.error.message
        });
      }
    } catch (err) {
      console.error("Error creating report:", err);
      setError("Failed to create report");
    } finally {
      setIsSubmitting(false);
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Toggle Buttons for Section and Requirement Selections */}
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={() => setShowSectionSelection(!showSectionSelection)}
              className="w-full"
            >
              {showSectionSelection
                ? "Hide Section Selection"
                : "Select Sections"}
            </Button>

            <Button
              type="button"
              onClick={() =>
                setShowRequirementSelection(!showRequirementSelection)
              }
              className="w-full"
            >
              {showRequirementSelection
                ? "Hide Requirement Selection"
                : "Select Requirements"}
            </Button>
          </div>

          {/* Conditionally Render Section Selection Menu */}
          {showSectionSelection && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Sections</h3>
              {sections.length === 0 && <p>No sections available.</p>}
              <div className="max-h-64 overflow-y-auto border p-2 rounded">
                {sections.map((section) => (
                  <div
                    key={`section-${section.id}`}
                    className="flex items-center mb-2"
                  >
                    <Checkbox
                      id={`section-${section.id}`}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={(checked) =>
                        handleSectionChange(section.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`section-${section.id}`}
                      className="ml-2"
                    >
                      {section.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditionally Render Requirement Selection Menu */}
          {showRequirementSelection && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Select Requirements
              </h3>
              {requirements.length === 0 && <p>No requirements available.</p>}
              <div className="max-h-64 overflow-y-auto border p-2 rounded">
                {requirements.map((requirement) => (
                  <div
                    key={`requirement-${requirement.id}`}
                    className="flex items-center mb-2"
                  >
                    <Checkbox
                      id={`requirement-${requirement.id}`}
                      checked={selectedRequirements.includes(requirement.id)}
                      onCheckedChange={(checked) =>
                        handleRequirementChange(
                          requirement.id,
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor={`requirement-${requirement.id}`}
                      className="ml-2"
                    >
                      {requirement.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Report...
              </div>
            ) : (
              "Create Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
