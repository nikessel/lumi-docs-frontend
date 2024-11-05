import React, { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { useStorage } from "@/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@wasm";

const UserProfile = () => {
  const { wasmModule, isLoading } = useWasm();
  const [idToken] = useStorage("id_token");
  const [error, setError] = useState("");
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);

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
          const exists = existsResponse.output.output;
          setUserExists(exists);

          if (exists) {
            // Fetch user data
            const userResponse = await wasmModule.get_user();
            if (userResponse.error) {
              setError(
                `Error fetching user data: ${userResponse.error.message}`,
              );
              return;
            }

            if (userResponse.output) {
              const userData: User = userResponse.output.output;
              setUserData(userData);
            }
          }
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

  if (isLoading || isCheckingUser) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userExists) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert className="bg-red-50 text-red-800 border-red-200">
            <AlertDescription>User has not signed up</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (userData) {
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
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default UserProfile;
