import React, { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { useStorage } from "@/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserSignupProps {
  onProfileUpdate: () => void;
}

const UserSignup = ({ onProfileUpdate }: UserSignupProps) => {
  const { wasmModule, isLoading } = useWasm();
  const [idToken] = useStorage("id_token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  // Updated form data to use null for optional fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    job_title: undefined as string | undefined,
    company: undefined as string | undefined,
    config: {},
  });

  useEffect(() => {
    const initializeComponent = async () => {
      if (!wasmModule || !idToken) {
        setIsCheckingUser(false);
        return;
      }

      try {
        const existsResponse = await wasmModule.user_exists();
        if (existsResponse.output) {
          setUserExists(existsResponse.output.output);
        }
      } finally {
        setIsCheckingUser(false);
      }
    };

    initializeComponent();
  }, [wasmModule, idToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim() === "" && (name === "job_title" || name === "company") ? null : value,
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
      const response = await wasmModule.create_user({ input: formData });
      console.log("SUBMITTING", response)

      if (response.output) {
        setSuccess(true);
        setUserExists(true);
        onProfileUpdate();
      }
    } catch (error) {
      setError("Failed to create user");
      console.error("Error creating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isCheckingUser) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userExists) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription>User already signed up</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
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
              value={formData.job_title || ""}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company || ""}
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
