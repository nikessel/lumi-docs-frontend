"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AuthCallback, AuthProvider } from "@/components/Auth0";
import useLoadingStore from "@/stores/global-loading-unification";


const WasmProvider = dynamic(() => import("@/components/WasmProvider"), {
  ssr: false,
  loading: () => <div>WASM PROVIDER LOADINGasd asd asd asd asd </div>,
});

export default function CallbackPage() {
  // const addLoadingComponent = useLoadingStore((state) => state.addLoadingComponent);
  // const removeLoadingComponent = useLoadingStore((state) => state.removeLoadingComponent);

  // useEffect(() => {
  //   const componentName = "WasmProvider";
  //   addLoadingComponent(componentName); // Signal the component is loading

  //   return () => {
  //     removeLoadingComponent(componentName); // Signal the component is no longer loading
  //   };
  // }, [addLoadingComponent, removeLoadingComponent]);

  return (
    // <WasmProvider>
    <div className="min-h-screen flex items-center justify-center">
      <AuthCallback />
    </div>
    // </WasmProvider>
  );
}
