"use client";
import React from "react"
import { createContext, useContext } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { useAuthConfig } from "./auth-config";
import LoadingLogoScreen from "@/components/loading-screen"; // Create a simple loading screen if necessary

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext({});

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const { authConfig, isLoading, error } = useAuthConfig();

    if (isLoading) {
        return <LoadingLogoScreen>Loading authentication...</LoadingLogoScreen>;
    }

    if (error || !authConfig) {
        return <div>Error loading authentication: {error}</div>;
    }

    return (
        <Auth0Provider
            domain={authConfig.domain}
            clientId={authConfig.client_id}
            authorizationParams={{
                redirect_uri: "http://localhost:3000/",
                scope: "openid profile email",
            }}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0Provider>
    );
};
