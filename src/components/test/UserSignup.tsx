import React, { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { useStorage } from "@/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UserSignup = () => {
  const { wasmModule, isLoading } = useWasm();
  const [idToken] = useStorage("id_token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    job_title: "",
    company: "",
  });

  // Fetch claims when component mounts
  useEffect(() => {
    const fetchClaims = async () => {
      if (!wasmModule || !idToken) return;

      try {
        const response = await wasmModule.token_to_claims({ token: idToken });
        if (response.error) {
          setError(`Failed to get claims: ${response.error.message}`);
          return;
        }

        if (response.output) {
          const claimsData = response.output.output;
          // Pre-fill form with claims data
          setFormData((prev) => ({
            ...prev,
            first_name: claimsData.given_name || "",
            last_name: claimsData.family_name || "",
          }));
        }
      } catch (error: unknown) {
        setError("Error fetching claims");
        if (error instanceof Error) {
          console.error(error);
        }
      }
    };

    fetchClaims();
  }, [wasmModule, idToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    if (!wasmModule) {
      setError("WASM module not loaded");
      setIsSubmitting(false);
      return;
    }

    try {
      const userInput = {
        input: {
          ...formData,
          config: {}, // UserBaseConfig is currently empty
        },
      };

      const response = await wasmModule.create_user(userInput);

      if (response.error) {
        setError(`${response.error.kind} error: ${response.error.message}`);
      } else {
        setSuccess(true);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Failed to create user");
        console.error("User creation error:", error);
      } else {
        setError("Failed to create user");
        console.error("User creation error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>Profile created successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Profile...
              </div>
            ) : (
              "Create Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserSignup;
