import React, { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { useStorage } from "@/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { User } from "@wasm";

interface UserProfileProps {
  refreshProfile: boolean; // New prop to trigger re-fetching
}

const UserProfile = ({ refreshProfile }: UserProfileProps) => {
  const { wasmModule, isLoading } = useWasm();
  const [idToken] = useStorage("id_token");
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!wasmModule || !idToken) return;

      try {
        const userResponse = await wasmModule.get_user();

        if (userResponse.error) {
          const { kind, message } = userResponse.error;

          if (kind === "NotFound") {
            console.warn("User not found:", message);
            setError("User not found. Please complete the sign up form.");
          } else {
            console.error("Error fetching user data:", kind, message);
            setError(`Error fetching user data: ${message}`);
          }

          return;
        }
        if (userResponse.output) {
          setUserData(userResponse.output.output as User);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Error fetching user data");
      }
    };

    fetchUserData();
  }, [wasmModule, idToken, refreshProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent>
          <Alert variant="destructive">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent>
          <Alert className="bg-red-50 text-red-800 border-red-200">
            User data not available. Please sign up.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>First Name:</strong> {userData.first_name}
          </p>
          <p>
            <strong>Last Name:</strong> {userData.last_name}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <p>
            <strong>Job Title:</strong> {userData.job_title || "Not provided"}
          </p>
          <p>
            <strong>Company:</strong> {userData.company || "Not provided"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
