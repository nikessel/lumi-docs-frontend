// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/components/Auth0"; // Update this to the correct path for your `useAuth`
// import { useWasm } from "@/components/WasmProvider";


// const PROTECTED_ROUTES = ["/dashboard", "/reports", "/tasks", "/files", "/standards"];

// export const useAuthRedirectMiddleware = (): void => {
//     const { isAuthenticated, isLoading, login } = useAuth();
//     const { wasmModule, error } = useWasm()
//     const router = useRouter();

//     console.log("wasmModule", wasmModule, isAuthenticated, isLoading)

//     useEffect(() => {
//         if (isLoading) return;

//         const currentPath = window.location.pathname;

//         // Check if the user is authenticated
//         if (!isAuthenticated && !isLoading && wasmModule) {
//             // Check if the current route is protected
//             if (PROTECTED_ROUTES.includes(currentPath)) {
//                 console.warn("User is not authenticated. Redirecting to login...");
//                 // login();
//             }
//         }
//     }, [isAuthenticated, isLoading, login, router]);
// };


