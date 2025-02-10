'use client'
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth-hook/Auth0Provider";

const AutoLogin = () => {
  const { loginWithRedirect, clearTokens, logout } = useAuth();

  console.log("LOGGING...");

  useEffect(() => {
    const initiateLogin = async () => {
      logout()
      await clearTokens();
      loginWithRedirect();
    };

    initiateLogin();
  }, [loginWithRedirect, clearTokens]);

  return null;
};

export default AutoLogin;
