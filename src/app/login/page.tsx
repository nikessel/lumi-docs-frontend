'use client'
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";

const AutoLogin = () => {
    const { loginWithRedirect, clearTokens, logout } = useAuth();

    console.log("LOGGING...");

    useEffect(() => {
        const initiateLogin = async () => {
            logout()
            clearTokens();
            loginWithRedirect();
        };

        initiateLogin();
    }, [loginWithRedirect, clearTokens, logout]);

    return null;
};

export default AutoLogin;
