// "use client";
// import {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
//   type ReactNode,
//   type Dispatch,
//   type SetStateAction,
// } from "react";
// import type { StorageKey, Claims } from "@wasm";
// import { useRouter } from "next/navigation";
// import { useWasm } from "@/components/WasmProvider";
// import { storage, useStorage } from "@/storage";

// const SK = {
//   id_token: "id_token" as StorageKey,
//   access_token: "access_token" as StorageKey,
// } as const;

// interface AuthContextType {
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   user: Claims | null;
//   error: string | null;
//   login: () => Promise<void>;
//   signup: () => Promise<void>;
//   logout: () => Promise<void>;
//   setUser: Dispatch<SetStateAction<Claims | null>>;
//   setError: Dispatch<SetStateAction<string | null>>;
//   setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
// }

// export const AuthContext = createContext<AuthContextType | null>(null);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// const isTokenExpired = (claims: Claims | null): boolean => {
//   if (!claims?.exp) return true;
//   // Add a 60-second buffer to handle timing differences
//   return claims.exp * 1000 <= Date.now() + 60000;
// };

// export function LoginButton() {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("LoginButton must be used within an AuthProvider");
//   }

//   const { login, isLoading, isAuthenticated } = context;

//   return (
//     <button
//       onClick={login}
//       disabled={isLoading || isAuthenticated}
//       className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
//     >
//       {isLoading
//         ? "Loading..."
//         : isAuthenticated
//           ? "User already logged in"
//           : "Login"}
//     </button>
//   );
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useState<Claims | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const { wasmModule, isLoading: isWasmLoading } = useWasm();
//   const [idToken] = useStorage(SK.id_token);

//   const signup = useCallback(async () => {
//     if (!wasmModule) {
//       setError("WASM module not loaded");
//       return;
//     }

//     try {
//       const response = await wasmModule.get_public_auth0_config();
//       if (response.error || !response.output) {
//         throw new Error(response.error?.message || "No Auth0 config received");
//       }

//       const config = response.output.output;
//       const state = Math.random().toString(36).substring(7);
//       localStorage.setItem("auth_state", state);

//       const authUrl = new URL(`https://${config.domain}/authorize`);
//       authUrl.searchParams.append("response_type", "code");
//       authUrl.searchParams.append("client_id", config.client_id);
//       authUrl.searchParams.append("redirect_uri", config.login_redirect_uri);
//       authUrl.searchParams.append("scope", "openid profile email");
//       authUrl.searchParams.append("state", state);
//       authUrl.searchParams.append("screen_hint", "signup"); // 👈 **Forces Auth0 to show Sign-Up page**

//       window.location.href = authUrl.toString();
//     } catch (err) {
//       console.error("Signup error:", err);
//       setError(err instanceof Error ? err.message : "An unknown error occurred");
//     }
//   }, [wasmModule]);


//   // const handleEmailVerification = useCallback(async (email: string) => {
//   //   storage.clear();
//   //   setIsAuthenticated(false);
//   //   setUser(null);
//   //   const url = `/verify-email?email=${encodeURIComponent(email)}`;
//   //   window.location.href = url; // Use window.location.href instead of router.push
//   // }, []);

//   const login = useCallback(async () => {
//     if (!wasmModule) {
//       setError("WASM module not loaded");
//       return;
//     }

//     try {
//       const response = await wasmModule.get_public_auth0_config();

//       if (response.error || !response.output) {
//         throw new Error(response.error?.message || "No Auth0 config received");
//       }

//       const config = response.output.output;
//       const state = Math.random().toString(36).substring(7);
//       localStorage.setItem("auth_state", state);

//       const authUrl = new URL(`https://${config.domain}/authorize`);
//       authUrl.searchParams.append("response_type", "code");
//       authUrl.searchParams.append("client_id", config.client_id);
//       authUrl.searchParams.append("redirect_uri", config.login_redirect_uri);
//       authUrl.searchParams.append("scope", "openid profile email");
//       authUrl.searchParams.append("state", state);

//       window.location.href = authUrl.toString();
//     } catch (err) {
//       console.error("Login error:", err);
//       setError(
//         err instanceof Error ? err.message : "An unknown error occurred",
//       );
//     }
//   }, [wasmModule]);

//   const logout = useCallback(async () => {
//     if (!wasmModule) {
//       setError("WASM module not loaded");
//       return;
//     }

//     try {
//       const response = await wasmModule.get_public_auth0_config();
//       if (response.error || !response.output) {
//         throw new Error(response.error?.message || "No Auth0 config received");
//       }

//       const config = response.output.output;
//       storage.clear();
//       setIsAuthenticated(false);
//       setUser(null);

//       const logoutUrl = new URL(`https://${config.domain}/v2/logout`);
//       logoutUrl.searchParams.append("client_id", config.client_id);
//       logoutUrl.searchParams.append("returnTo", config.logout_redirect_uri);

//       window.location.href = logoutUrl.toString();
//     } catch (err) {
//       console.error("Logout error:", err);
//       setError(
//         err instanceof Error ? err.message : "An unknown error occurred",
//       );
//     }
//   }, [wasmModule]);

//   const checkSession = useCallback(async () => {

//     if (!wasmModule || !idToken) {
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const claimsResult = await wasmModule.token_to_claims({
//         token: idToken,
//       });

//       const existsResponse = await wasmModule.user_exists();
//       const userExists = existsResponse.output?.output;

//       if (!userExists) {
//         return;
//       }


//       // if (claimsResult.error) {
//       //   if (claimsResult.error.kind === "EmailNotVerified") {
//       //     const emailMatch =
//       //       claimsResult.error.message.match(/for email: (.+?)$/);
//       //     const email = emailMatch ? emailMatch[1] : "";
//       //     handleEmailVerification(email);
//       //     return;
//       //   }
//       //   throw new Error(claimsResult.error.message);
//       // }

//       if (!claimsResult.output?.output) {
//         throw new Error("Failed to get claims");
//       }

//       const claims = claimsResult.output.output;

//       if (isTokenExpired(claims)) {
//         storage.clear();
//         setIsAuthenticated(false);
//         setUser(null);
//         await login();
//         return;
//       }

//       // if (!claims.email_verified) {
//       //   handleEmailVerification(claims.email);
//       //   return;
//       // }

//       setUser(claims);
//       setIsAuthenticated(true);
//     } catch (err) {
//       console.error("Session check failed:", err);
//       storage.clear();
//       setIsAuthenticated(false);
//       setUser(null);
//       await login();
//     } finally {
//       setIsLoading(false);
//     }
//   }, [wasmModule, idToken, login]);

//   useEffect(() => {
//     checkSession();
//   }, [checkSession]);

//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const interval = setInterval(() => {
//       if (user && isTokenExpired(user)) {
//         checkSession();
//       }
//     }, 60000); // Check every minute

//     return () => clearInterval(interval);
//   }, [isAuthenticated, user, checkSession]);

//   const contextValue: AuthContextType = {
//     isAuthenticated,
//     isLoading: isLoading || isWasmLoading,
//     user,
//     error,
//     login,
//     signup,
//     logout,
//     setUser,
//     setError,
//     setIsAuthenticated,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
//   );
// }

// export function AuthCallback() {
//   const router = useRouter();
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("AuthCallback must be used within an AuthProvider");
//   }
//   const { setUser, setError, setIsAuthenticated } = context;
//   const [processing, setProcessing] = useState(true);
//   const { wasmModule, isLoading: isWasmLoading } = useWasm();

//   // const params = new URLSearchParams(window.location.search);
//   // const code = params.get("code");

//   // useEffect(() => {
//   //   const handleCallback = async () => {
//   //     try {
//   //       if (!code) throw new Error("Authorization code is missing");

//   //       const response = await fetch("/api/auth/callback", {
//   //         method: "POST",
//   //         headers: { "Content-Type": "application/json" },
//   //         body: JSON.stringify({ code }),
//   //       });

//   //       console.log("!!!!!!", response)

//   //       const data = await response.json();

//   //       if (!response.ok) {
//   //         throw new Error(data.error || "Failed to fetch user info");
//   //       }

//   //       setUser(data.user); // Save user info
//   //       //setLoading(false);

//   //       if (!data.user.email_verified) {
//   //         alert("Email not verified. Please verify your email.");
//   //       } else {
//   //         console.log("User info:", data.user);
//   //       }
//   //     } catch (err) {
//   //       //setError(err.message);
//   //       //setLoading(false);
//   //     }
//   //   };

//   //   handleCallback();
//   // }, [code]);


//   // const handleEmailVerification = useCallback(
//   //   async (email: string) => {
//   //     // storage.clear();
//   //     // setIsAuthenticated(false);
//   //     // setUser(null);
//   //     const url = `/verify-email?email=${encodeURIComponent(email)}`;
//   //     window.location.href = url;
//   //   },
//   //   [],
//   // );

//   useEffect(() => {
//     if (!wasmModule || isWasmLoading) {
//       return;
//     }

//     let mounted = true;

//     const params = new URLSearchParams(window.location.search);
//     const code = params.get("code");
//     const state = params.get("state");
//     const savedState = localStorage.getItem("auth_state");

//     if (!code || !state) {
//       setError("Missing required parameters");
//       setProcessing(false);
//       return;
//     }

//     if (state !== savedState) {
//       setError("Invalid state parameter");
//       setProcessing(false);
//       return;
//     }

//     (async () => {
//       try {

//         const exchangeResult = await wasmModule.exchange_code_for_identity({
//           code,
//         });

//         // console.log("exchangeResult", exchangeResult)

//         if (!mounted) return;

//         // if (exchangeResult.error) {
//         //   if (exchangeResult.error.kind === "EmailNotVerified") {
//         //     console.log("exchangeResult INSIDE", exchangeResult)

//         //     // storage.set(SK.id_token, tokens.id_token);
//         //     // storage.set(SK.access_token, tokens.access_token);
//         //     const emailMatch =
//         //       exchangeResult.error.message.match(/for email: (.+?)$/);
//         //     // handleEmailVerification(emailMatch?.[1] || "");
//         //     return;
//         //   }
//         //   console.error(exchangeResult.error.message);
//         // }

//         const tokensTest = exchangeResult?.output?.output;

//         if (tokensTest?.id_token) {
//           const claimsResultTest = await wasmModule.token_to_claims({
//             token: tokensTest.id_token,
//           });
//           console.log("exchangeResult claimsResultTest", claimsResultTest)
//         }

//         if (!exchangeResult.output?.output) {
//           throw new Error("No output received from identity exchange");
//         }

//         const tokens = exchangeResult.output.output;

//         if (!tokens.id_token) {
//           throw new Error("Missing id_token in response");
//         }

//         storage.set(SK.id_token, tokens.id_token);
//         storage.set(SK.access_token, tokens.access_token);

//         const claimsResult = await wasmModule.token_to_claims({
//           token: tokens.id_token,
//         });

//         if (!mounted) return;

//         // if (claimsResult.error) {
//         //   if (claimsResult.error.kind === "EmailNotVerified") {
//         //     const emailMatch =
//         //       claimsResult.error.message.match(/for email: (.+?)$/);
//         //     handleEmailVerification(emailMatch?.[1] || "");
//         //     return;
//         //   }
//         //   throw new Error(claimsResult.error.message);
//         // }

//         if (!claimsResult.output?.output) {
//           throw new Error("No output received from claims");
//         }

//         const claims = claimsResult.output.output;

//         // if (!claims.email_verified) {
//         //   handleEmailVerification(claims.email);
//         //   return;
//         // }

//         const existsResponse = await wasmModule.user_exists();
//         const userExists = existsResponse.output?.output;

//         if (!userExists) {
//           setTimeout(() => {
//             if (mounted) {
//               window.location.href = "/signup"; // 👈 Redirects to profile completion
//             }
//           }, 0);
//           return;
//         }

//         setUser(claims);
//         setIsAuthenticated(true);
//         localStorage.removeItem("auth_state");

//         setProcessing(false)
//         setTimeout(() => {
//           if (mounted) {
//             // router.push("/dashboard")
//             window.location.href = "/dashboard";
//           }
//         }, 0);

//       } catch (err) {
//         if (!mounted) return;
//         console.error("Authentication error:", err);
//         storage.clear();
//         setIsAuthenticated(false);
//         setUser(null);
//         setError(
//           err instanceof Error
//             ? `Authentication failed: ${err.message}`
//             : "Unknown authentication error",
//         );
//       } finally {
//         if (mounted) {
//           setProcessing(false);
//         }
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [
//     wasmModule,
//     isWasmLoading,
//     router,
//     setError,
//     setUser,
//     setIsAuthenticated,
//   ]);

//   return <div></div>
// }
