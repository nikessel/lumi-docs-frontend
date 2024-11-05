import React, { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { useAuth } from "@/components/Auth0";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category, Requirement, VersionedIdType } from "@wasm";

export function ReportCreator() {
  const { wasmModule } = useWasm();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    VersionedIdType[]
  >([]);
  const [selectedRequirements, setSelectedRequirements] = useState<
    VersionedIdType[]
  >([]);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [showRequirementSelection, setShowRequirementSelection] =
    useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories and requirements when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!wasmModule) return;

      try {
        const categoriesResponse = await wasmModule.get_categories();
        const requirementsResponse = await wasmModule.get_requirements();

        if (categoriesResponse.output && requirementsResponse.output) {
          setCategories(categoriesResponse.output.output);
          setRequirements(requirementsResponse.output.output);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch categories and requirements");
      }
    };

    fetchData();
  }, [wasmModule]);

  const handleCategoryChange = (id: VersionedIdType, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked
        ? [...prev, id]
        : prev.filter((item) => !(item[0] === id[0] && item[1] === id[1])),
    );
  };

  const handleRequirementChange = (id: VersionedIdType, checked: boolean) => {
    setSelectedRequirements((prev) =>
      checked
        ? [...prev, id]
        : prev.filter((item) => !(item[0] === id[0] && item[1] === id[1])),
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
          categories_to_include:
            showCategorySelection && selectedCategories.length > 0
              ? selectedCategories
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
          `Report created successfully with ID: ${response.output.output}`,
        );
        // Optionally reset selections
        setSelectedCategories([]);
        setSelectedRequirements([]);
      } else if (response.error) {
        setError(response.error.message);
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

          {/* Toggle Buttons for Category and Requirement Selections */}
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={() => setShowCategorySelection(!showCategorySelection)}
              className="w-full"
            >
              {showCategorySelection
                ? "Hide Category Selection"
                : "Select Categories"}
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

          {/* Conditionally Render Category Selection Menu */}
          {showCategorySelection && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Categories</h3>
              {categories.length === 0 && <p>No categories available.</p>}
              <div className="max-h-64 overflow-y-auto border p-2 rounded">
                {categories.map((category) => (
                  <div
                    key={`${category.id[0]}-${category.id[1]}`}
                    className="flex items-center mb-2"
                  >
                    <Checkbox
                      id={`category-${category.id[0]}-${category.id[1]}`}
                      checked={selectedCategories.some(
                        (item) =>
                          item[0] === category.id[0] &&
                          item[1] === category.id[1],
                      )}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`category-${category.id[0]}-${category.id[1]}`}
                      className="ml-2"
                    >
                      {category.name}
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
                    key={`${requirement.id[0]}-${requirement.id[1]}`}
                    className="flex items-center mb-2"
                  >
                    <Checkbox
                      id={`requirement-${requirement.id[0]}-${requirement.id[1]}`}
                      checked={selectedRequirements.some(
                        (item) =>
                          item[0] === requirement.id[0] &&
                          item[1] === requirement.id[1],
                      )}
                      onCheckedChange={(checked) =>
                        handleRequirementChange(
                          requirement.id,
                          checked as boolean,
                        )
                      }
                    />
                    <label
                      htmlFor={`requirement-${requirement.id[0]}-${requirement.id[1]}`}
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
