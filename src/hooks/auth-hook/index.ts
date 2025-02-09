"use client";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useWasm } from "@/components/WasmProvider";

export const useAuth = () => {
    const { loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const router = useRouter();
    const { wasmModule } = useWasm();
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // Function to store tokens in localStorage
    const storeTokens = useCallback((accessToken: string, idToken: string) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("id_token", idToken);
    }, []);

    const logoutUser = useCallback(() => {
        logout({
            logoutParams: {
                returnTo: "http://localhost:3000/logout", // 👈 Ensure this URL matches your app's logout route
            },
        });

        // Optionally clear tokens from local storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("id_token");
    }, [logout]);


    // Function to exchange code for tokens
    const checkSession = useCallback(async () => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        // const state = params.get("state");
        // const savedState = localStorage.getItem("auth_state");

        if (!code) {
            setIsCheckingSession(false);
            console.error("234234easd242134 no code provided");

            return;
        }

        if (!wasmModule) {
            console.error("234234easd242134 WASM module not loaded");
            return;
        }

        // if (state !== savedState) {
        //     console.error("234234easd242134 Invalid state parameter");
        //     setIsCheckingSession(false);
        //     return;
        // }

        try {
            console.log("234234easd242134 Exchanging code for tokens...", code);

            const exchangeResult = await wasmModule.exchange_code_for_identity({ code });

            console.log("234234easd242134 exchangeResult", exchangeResult);

            if (!exchangeResult?.output?.output) {
                throw new Error("No output received from identity exchange");
            }

            const tokens = exchangeResult.output.output;

            if (!tokens.id_token || !tokens.access_token) {
                throw new Error("Missing tokens in response");
            }

            // Store tokens in localStorage
            storeTokens(tokens.access_token, tokens.id_token);

            // Remove code from URL
            //   window.history.replaceState({}, document.title, window.location.pathname);

            console.log("234234easd242134 Authentication successful, redirecting...");
            // router.push("/dashboard");
        } catch (err) {
            console.error("234234easd242134 Authentication error:", err);
            localStorage.removeItem("auth_state");
        } finally {
            setIsCheckingSession(false);
        }
    }, [wasmModule, storeTokens]);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    // Handle normal authentication flow
    // useEffect(() => {
    //     if (isAuthenticated) {
    //         getAccessTokenSilently().then((accessToken) => {
    //             const idToken = (user as any)?.id_token;
    //             storeTokens(accessToken, idToken);
    //         });
    //     }
    // }, [isAuthenticated, getAccessTokenSilently, user, storeTokens]);

    return { loginWithRedirect, logout: logoutUser, user, isAuthenticated, isCheckingSession };
};
