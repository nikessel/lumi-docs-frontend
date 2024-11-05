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
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    job_title: "",
    company: "",
  });

  // Check if user exists and fetch claims when component mounts
  useEffect(() => {
    const initializeComponent = async () => {
      if (!wasmModule || !idToken) {
        setIsCheckingUser(false);
        return;
      }

      try {
        // Check if user exists
        const existsResponse = await wasmModule.user_exists();
        if (existsResponse.error) {
          setError(`Error checking user: ${existsResponse.error.message}`);
          return;
        }

        if (existsResponse.output) {
          setUserExists(existsResponse.output.output);
          if (existsResponse.output.output) {
            // If user exists, we don't need to fetch claims
            setIsCheckingUser(false);
            return;
          }
        }

        // Only fetch claims if user doesn't exist
        const claimsResponse = await wasmModule.token_to_claims({
          token: idToken,
        });
        if (claimsResponse.error) {
          setError(`Failed to get claims: ${claimsResponse.error.message}`);
          return;
        }

        if (claimsResponse.output) {
          const claimsData = claimsResponse.output.output;
          setFormData((prev) => ({
            ...prev,
            first_name: claimsData.given_name || "",
            last_name: claimsData.family_name || "",
          }));
        }
      } catch (error: unknown) {
        setError("Error initializing component");
        if (error instanceof Error) {
          console.error(error);
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
        setUserExists(true); // Update user exists state after successful creation
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
