"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { StorageKey, Claims } from "@wasm";
import { useRouter } from "next/navigation";
import { useWasm } from "@/components/WasmProvider";
import { storage, useStorage } from "@/storage";

const SK = {
  id_token: "id_token" as StorageKey,
  access_token: "access_token" as StorageKey,
} as const;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Claims | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: Dispatch<SetStateAction<Claims | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const isTokenExpired = (claims: Claims | null): boolean => {
  if (!claims?.exp) return true;
  // Add a 60-second buffer to handle timing differences
  return claims.exp * 1000 <= Date.now() + 60000;
};

export function LoginButton() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("LoginButton must be used within an AuthProvider");
  }
  const { login, isLoading, isAuthenticated } = context;

  return (
    <button
      onClick={login}
      disabled={isLoading || isAuthenticated}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
    >
      {isLoading
        ? "Loading..."
        : isAuthenticated
          ? "User already logged in"
          : "Login"}
    </button>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Claims | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { wasmModule, isLoading: isWasmLoading } = useWasm();
  const [idToken] = useStorage(SK.id_token);

  const login = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response = await wasmModule.get_public_auth0_config();
      if (response.error || !response.output) {
        throw new Error(response.error?.message || "No Auth0 config received");
      }

      const config = response.output.output;
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem("auth_state", state);

      const authUrl = new URL(`https://${config.domain}/authorize`);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", config.client_id);
      authUrl.searchParams.append("redirect_uri", config.login_redirect_uri);
      authUrl.searchParams.append("scope", "openid profile email");
      authUrl.searchParams.append("state", state);

      window.location.href = authUrl.toString();
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    }
  }, [wasmModule]);

  const logout = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }

    try {
      const response = await wasmModule.get_public_auth0_config();
      if (response.error || !response.output) {
        throw new Error(response.error?.message || "No Auth0 config received");
      }

      const config = response.output.output;
      storage.clear();
      setIsAuthenticated(false);
      setUser(null);

      const logoutUrl = new URL(`https://${config.domain}/v2/logout`);
      logoutUrl.searchParams.append("client_id", config.client_id);
      logoutUrl.searchParams.append("returnTo", config.logout_redirect_uri);

      window.location.href = logoutUrl.toString();
    } catch (err) {
      console.error("Logout error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    }
  }, [wasmModule]);

  const checkSession = useCallback(async () => {
    if (!wasmModule || !idToken) {
      setIsLoading(false);
      return;
    }

    try {
      const claimsResult = await wasmModule.token_to_claims({
        token: idToken,
      });

      if (claimsResult.error || !claimsResult.output) {
        throw new Error(claimsResult.error?.message || "Failed to get claims");
      }

      const { output: claims } = claimsResult.output;

      if (isTokenExpired(claims)) {
        storage.clear();
        setIsAuthenticated(false);
        setUser(null);
        await login();
        return;
      }

      setUser(claims);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Session check failed:", err);
      storage.clear();
      setIsAuthenticated(false);
      setUser(null);
      await login();
    } finally {
      setIsLoading(false);
    }
  }, [wasmModule, idToken, login]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (user && isTokenExpired(user)) {
        checkSession();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, user, checkSession]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading: isLoading || isWasmLoading,
    user,
    error,
    login,
    logout,
    setUser,
    setError,
    setIsAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
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

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const savedState = localStorage.getItem("auth_state");

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

    (async () => {
      try {
        const exchangeResult = await wasmModule.exchange_code_for_identity({
          code,
        });

        if (!mounted) return;

        if (exchangeResult.error) {
          throw new Error(exchangeResult.error.message);
        }

        if (!exchangeResult.output) {
          throw new Error("No output received from identity exchange");
        }

        const tokens = exchangeResult.output.output;

        if (!tokens || !tokens.id_token) {
          throw new Error("Missing id_token in response");
        }

        storage.set(SK.id_token, tokens.id_token);
        storage.set(SK.access_token, tokens.access_token);

        const claimsResult = await wasmModule.token_to_claims({
          token: tokens.id_token,
        });

        if (!mounted) return;

        if (claimsResult.error) {
          throw new Error(claimsResult.error.message);
        }

        if (!claimsResult.output) {
          throw new Error("No output received from claims");
        }

        const { output: claims } = claimsResult.output;

        if (!claims) {
          throw new Error("Invalid claims response structure");
        }

        setUser(claims);
        setIsAuthenticated(true);
        localStorage.removeItem("auth_state");

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
