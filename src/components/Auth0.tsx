"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { useWasm } from "@/components/WasmProvider";
import { storage, useStorage } from "@/storage";

// Auth Context
const AuthContext = createContext(null);

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Login Button Component
export function LoginButton() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("LoginButton must be used within an AuthProvider");
  }
  const { login, isLoading } = context;

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
    >
      {isLoading ? "Loading..." : "Login"}
    </button>
  );
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { wasmModule, isLoading: isWasmLoading } = useWasm();
  const [idToken] = useStorage("id_token");

  // Initialize auth state
  useEffect(() => {
    const checkAuth = async () => {
      if (idToken) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [idToken]);

  const login = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response = await wasmModule.get_public_auth0_config();
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (!response.output) {
        throw new Error("No Auth0 config received");
      }

      const config = response.output.output;

      // Generate random state
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem("auth_state", state);

      // Construct Auth0 login URL
      const authUrl = new URL(`https://${config.domain}/authorize`);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", config.client_id);
      authUrl.searchParams.append("redirect_uri", config.login_redirect_uri);
      authUrl.searchParams.append("scope", "openid profile email");
      authUrl.searchParams.append("state", state);

      window.location.href = authUrl.toString();
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    }
  }, [wasmModule]);

  const logout = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response = await wasmModule.get_public_auth0_config();
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (!response.output) {
        throw new Error("No Auth0 config received");
      }

      const config = response.output.output;

      storage.clear(); // Clear all tokens
      setIsAuthenticated(false);
      setUser(null);

      const logoutUrl = new URL(`https://${config.domain}/v2/logout`);
      logoutUrl.searchParams.append("client_id", config.client_id);
      logoutUrl.searchParams.append("returnTo", config.logout_redirect_uri);

      window.location.href = logoutUrl.toString();
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);
    }
  }, [wasmModule]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: isLoading || isWasmLoading,
        user,
        error,
        login,
        logout,
        setUser,
        setError,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthCallback() {
  const router = useRouter();
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthCallback must be used within an AuthProvider");
  }
  const { setUser, setError, setIsAuthenticated } = context;
  const [processing, setProcessing] = useState(true);
  const { wasmModule, isLoading: isWasmLoading } = useWasm();

  useEffect(() => {
    if (!wasmModule || isWasmLoading) {
      return;
    }

    let mounted = true;

    // Get URL parameters once at the start
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const savedState = localStorage.getItem("auth_state");

    // Validate parameters immediately
    if (!code || !state) {
      setError("Missing required parameters");
      setProcessing(false);
      return;
    }

    if (state !== savedState) {
      setError("Invalid state parameter");
      setProcessing(false);
      return;
    }

    // Perform the authentication process
    (async () => {
      try {
        // Exchange code for identity
        console.log("Exchanging code for identity...");
        const exchangeResult = await wasmModule.exchange_code_for_identity({
          code,
        });

        if (!mounted) return;

        console.log("Exchange result:", exchangeResult);

        if (exchangeResult.error) {
          throw new Error(exchangeResult.error.message);
        }

        if (!exchangeResult.output) {
          throw new Error("No output received from identity exchange");
        }

        const tokens = exchangeResult.output.output;
        console.log("Tokens:", tokens);

        if (!tokens || !tokens.id_token) {
          throw new Error("Missing id_token in response");
        }

        // Store tokens using storage module
        storage.set("id_token", tokens.id_token);
        storage.set("access_token", tokens.access_token);

        if (tokens.refresh_token) {
          storage.set("refresh_token", tokens.refresh_token);
        }

        // Get user claims
        console.log("Getting user claims...");
        const claimsResult = await wasmModule.token_to_claims({
          token: tokens.id_token,
        });

        if (!mounted) return;

        console.log("Claims result:", claimsResult);

        if (claimsResult.error) {
          throw new Error(claimsResult.error.message);
        }

        if (!claimsResult.output) {
          throw new Error("No output received from claims");
        }

        const { output: claims } = claimsResult.output;
        console.log("Claims:", claims);

        if (!claims) {
          throw new Error("Invalid claims response structure");
        }

        setUser(claims);
        setIsAuthenticated(true);
        localStorage.removeItem("auth_state");

        // Use setTimeout to ensure state updates have propagated
        setTimeout(() => {
          if (mounted) {
            router.push("/");
          }
        }, 0);
      } catch (err) {
        console.error("Authentication error:", err);
        if (mounted) {
          setError(
            err instanceof Error
              ? `Authentication failed: ${err.message}`
              : "Unknown authentication error",
          );
        }
      } finally {
        if (mounted) {
          setProcessing(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    wasmModule,
    isWasmLoading,
    router,
    setError,
    setUser,
    setIsAuthenticated,
  ]);

  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Processing login...</p>
      </div>
    );
  }

  return null;
}
