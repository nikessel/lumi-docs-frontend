import React, { useState, useEffect } from "react";
import { useWasm } from "@/components/WasmProvider";
import { useStorage } from "@/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { User } from "@wasm";
import { Shield, ShieldOff } from "lucide-react";

interface UserProfileProps {
  refreshProfile: boolean;
}

const UserProfile = ({ refreshProfile }: UserProfileProps) => {
  const { wasmModule, isLoading } = useWasm();
  const [idToken] = useStorage("id_token");
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  useEffect(() => {
    // Update lastRefresh when refreshProfile changes
    setLastRefresh(Date.now());
  }, [refreshProfile]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!wasmModule || !idToken) return;

      // Reset error state at start of fetch
      setError(null);

      try {
        // Fetch user data
        const userResponse = await wasmModule.get_user();
        if (userResponse.error) {
          const { kind, message } = userResponse.error;
          if (kind === "NotFound") {
            console.warn("User not found:", message);
            setError("User not found. Please complete the sign up form.");
            setUserData(null);
          } else {
            console.error("Error fetching user data:", kind, message);
            setError(`Error fetching user data: ${message}`);
          }
          return;
        }

        if (userResponse.output) {
          setUserData(userResponse.output.output as User);

          // Only check admin status if we successfully got user data
          try {
            const adminResponse = await wasmModule.is_admin();
            if (adminResponse.output) {
              setIsAdmin(adminResponse.output.output);
            }
          } catch (adminError) {
            console.error("Error checking admin status:", adminError);
            // Don't set main error - just log it since we still have user data
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Error fetching user data");
        setUserData(null);
      }
    };

    fetchUserData();
  }, [wasmModule, idToken, lastRefresh]); // Add lastRefresh to dependencies

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
        <div className="flex items-center justify-between">
          <CardTitle>User Profile</CardTitle>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2 text-green-600">
                <Shield size={20} />
                <span className="text-sm font-medium">Admin</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <ShieldOff size={20} />
                <span className="text-sm font-medium">Standard User</span>
              </div>
            )}
          </div>
        </div>
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
