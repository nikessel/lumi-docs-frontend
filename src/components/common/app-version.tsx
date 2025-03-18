import { useWasm } from "@/contexts/wasm-context/WasmProvider";
import { useEffect, useState } from "react";

export default function AppVersion() {
    const { wasmModule } = useWasm();
    const [version, setVersion] = useState<string>("");

    useEffect(() => {
        const fetchVersion = async () => {
            if (wasmModule) {
                try {
                    const response = await wasmModule.app_version();
                    if (response.output) {
                        setVersion(response.output.output);
                    }
                } catch (error) {
                    console.error("Failed to fetch app version:", error);
                }
            }
        };

        fetchVersion();
    }, [wasmModule]);

    if (!version) return null;

    return (
        <div className="text-xs text-gray-400 text-center py-2">
            © 2025 LumiDocs. All rights reserved. Version: {version}
        </div>
    );
}

// © 2025 LumiDocs. All rights reserved. | Privacy Policy | Terms of Service | Contact Us