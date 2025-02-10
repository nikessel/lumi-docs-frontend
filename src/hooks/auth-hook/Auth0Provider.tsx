"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useAuthConfig } from "./auth-config";
import { useWasm } from "@/components/WasmProvider";
import LoadingLogoScreen from "@/components/loading-screen";
import { useRouter } from "next/navigation";

interface AuthContextType {
    loginWithRedirect: () => void;
    logout: () => void;
    isAuthenticated: boolean;
    isCheckingSession: boolean;
    isLoading: boolean;
    clearTokens: () => void,
    triggerReAuth: () => void
}

// Create Context with Default Empty Values
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { authConfig, isLoading, error } = useAuthConfig();

    if (isLoading) {
        return null;
    }

    if (error || !authConfig) {
        return null;
    }

    return (
        <Auth0Provider
            domain={authConfig.domain}
            clientId={authConfig.client_id}
            authorizationParams={{
                redirect_uri: authConfig.login_redirect_uri,
                scope: "openid profile email",
            }}
            cacheLocation="localstorage"
        >
            <AuthContextProvider>{children}</AuthContextProvider>
        </Auth0Provider>
    );
};

// **Wrap `useAuth0` inside `AuthContext` and handle session checking**
const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { logout, user } = useAuth0();
    const { wasmModule } = useWasm();
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const hasFetched = useRef(false);
    const { authConfig, isLoading: configLoading, error } = useAuthConfig();
    const router = useRouter();

    const didSendRequestRef = useRef<boolean>(false)

    const storeTokens = useCallback((accessToken: string, idToken: string) => {
        localStorage.setItem("access_token", accessToken.replace(/^"|"$/g, ""));
        localStorage.setItem("id_token", idToken.replace(/^"|"$/g, ""));
    }, []);

    const logoutUser = useCallback(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("id_token");

        if (!authConfig) {
            return
        }

        logout({
            logoutParams: {
                returnTo: authConfig.logout_redirect_uri,
            },
        });
    }, [logout, authConfig]);

    const clearTokens = useCallback(async () => {
        await Promise.resolve(); // Ensures the function behaves asynchronously
        localStorage.removeItem("access_token");
        localStorage.removeItem("id_token");
        localStorage.removeItem("auth_state");
        setIsAuthenticated(false);
        setIsCheckingSession(false);
    }, []);



    const login = useCallback(async () => {
        if (!wasmModule) {
            console.log("WASM module not loaded");
            return;
        }

        if (!authConfig) {
            return
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
            authUrl.searchParams.append("redirect_uri", authConfig.login_redirect_uri);
            authUrl.searchParams.append("scope", "openid profile email");
            authUrl.searchParams.append("state", state);

            window.location.href = authUrl.toString();
        } catch (err) {
            console.error("Login error:", err);
            console.log(
                err instanceof Error ? err.message : "An unknown error occurred",
            );
        }
    }, [wasmModule, authConfig]);

    const checkSession = useCallback(async () => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const savedState = localStorage.getItem("auth_state");

        if (!code) {
            setIsCheckingSession(false);
            return;
        }

        if (!wasmModule) {
            return;
        }

        if (state !== savedState) {
            return;
        }

        if (!didSendRequestRef.current) {
            try {
                setIsLoading(true)
                didSendRequestRef.current = true

                const exchangeResult = await wasmModule.exchange_code_for_identity({
                    code: code.replace(/^"|"$/g, ""),
                });

                if (!exchangeResult?.output?.output) {
                    throw new Error("No output received from identity exchange");
                }

                const tokens = exchangeResult.output.output;

                if (!tokens.id_token || !tokens.access_token) {
                    throw new Error("Missing tokens in response");
                }

                storeTokens(tokens.access_token, tokens.id_token);

                const user = await wasmModule.get_user()

                if (user.error?.kind === "NotFound") {
                    router.push("/signup")
                } else {
                    setIsAuthenticated(true)
                }

            } catch (err) {
                localStorage.removeItem("auth_state");
            } finally {
                setIsLoading(false)
                setIsCheckingSession(false);
            }
        }

    }, [wasmModule, storeTokens]);

    // Run session check on mount
    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const checkAuthStatus = useCallback(async () => {
        if (!wasmModule || hasFetched.current) return; // Ensure wasmModule is loaded and prevent re-fetching
        try {
            setIsLoading(true)
            hasFetched.current = true; // Mark as fetched

            const res = await wasmModule.get_user();

            if (res?.output?.output && !res.error?.kind) {
                setIsAuthenticated((prev) => (!prev ? true : prev));
            } else {
                setIsAuthenticated((prev) => (prev ? false : prev));
            }
        } catch (error) {
            console.error("❌ Error fetching user:", error);
        } finally {
            setIsLoading(false); // Ensure loading state is turned off only once
        }
    }, [wasmModule]);

    const triggerReAuth = useCallback(() => {
        hasFetched.current = false; // Allow re-fetching
        checkAuthStatus(); // Manually trigger the user fetch
    }, [checkAuthStatus]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    return (
        <AuthContext.Provider value={{ triggerReAuth, loginWithRedirect: login, isLoading, logout: logoutUser, isAuthenticated, isCheckingSession, clearTokens }}>
            {children}
        </AuthContext.Provider>
    );
};

// **Custom Hook to Use Auth**
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};



// "use client";
// import React from "react"
// import { createContext, useContext } from "react";
// import { Auth0Provider } from "@auth0/auth0-react";
// import { useAuthConfig } from "./auth-config";
// import LoadingLogoScreen from "@/components/loading-screen"; // Create a simple loading screen if necessary

// interface AuthProviderProps {
//     children: React.ReactNode;
// }

// const AuthContext = createContext({});

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//     const { authConfig, isLoading, error } = useAuthConfig();

//     if (isLoading) {
//         return <LoadingLogoScreen>Loading authentication...</LoadingLogoScreen>;
//     }

//     if (error || !authConfig) {
//         return <div>Error loading authentication: {error}</div>;
//     }

//     return (
//         <Auth0Provider
//             domain={authConfig.domain}
//             clientId={authConfig.client_id}
//             authorizationParams={{
//                 redirect_uri: "http://localhost:3000/",
//                 scope: "openid profile email",
//             }}
//             cacheLocation="localstorage"
//         >
//             {children}
//         </Auth0Provider>
//     );
// };
