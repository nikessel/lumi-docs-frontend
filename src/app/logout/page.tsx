'use client'
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/Auth0"
import Image from "next/image";
import { useRouter } from "next/navigation";
import Typography from "@/components/typography";

export default function LogoutScreen() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <div className="flex justify-center h-full">
      <div className="text-center">
        <Typography className="mt-8 mb-16 justify-center" textSize="h2">You were logged out</Typography>
        <Image
          src={require("@/assets/undraw_close-tab_jr11.svg")}
          alt="Signed Out Illustration"
          width={400}
          height={400}
          className="mb-6"
        />
        <div className="flex justify-center mt-8 gap-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={login}
          >
            Login
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/documentation")}
          >
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useContext } from "react";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import { AuthProvider, AuthContext } from "@/components/Auth0";

// const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
//   ssr: false,
//   loading: () => <div>Loading WASM provider...</div>,
// });

// export default function LogoutPage() {
//   const router = useRouter();
//   const authContext = useContext(AuthContext);

//   if (!authContext) {
//     throw new Error("LogoutPage must be used within an AuthProvider");
//   }

//   const { logout, isLoading, isAuthenticated } = authContext;

//   useEffect(() => {
//     const handleLogout = async () => {
//       if (isAuthenticated) {
//         await logout();
//       }
//     };

//     handleLogout();
//   }, [logout, isAuthenticated]);

//   return (
//     <WasmProvider>
//       <AuthProvider>
//         <div className="flex flex-col items-center justify-center min-h-screen">
//           {isLoading ? (
//             <div>
//               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//               <p>Logging out...</p>
//             </div>
//           ) : (
//             <>
//               <p className="mb-4">You have been logged out.</p>
//               <button
//                 onClick={() => router.push("/")}
//                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//               >
//                 Go to Home
//               </button>
//             </>
//           )}
//         </div>
//       </AuthProvider>
//     </WasmProvider>
//   );
// }
