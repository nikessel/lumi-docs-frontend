import React, { useState, useEffect, useCallback } from "react";
import { useWasm } from "@/components/WasmProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Device } from "@wasm";

function mapReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Map) {
    return Object.fromEntries(value as Map<string, unknown>);
  }
  return value;
}

export function DeviceList() {
  const { wasmModule } = useWasm();
  const [devices, setDevices] = useState<Device[]>([]);
  const [blobUrls, setBlobUrls] = useState<{ [id: string]: string }>({});
  const [error, setError] = useState("");
  const fetchDevices = useCallback(async () => {
    if (!wasmModule) {
      setError("WASM module not loaded");
      return;
    }
    try {
      const response = await wasmModule.get_all_devices();
      if (response.output) {
        const devicesData = response.output.output;
        setDevices(devicesData);
        // Create Blob URLs for each device
        const newBlobUrls: { [id: string]: string } = {};
        devicesData.forEach((device) => {
          const jsonString = JSON.stringify(device, mapReplacer, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          newBlobUrls[device.id] = url;
        });
        // Revoke previous Blob URLs before setting new ones
        setBlobUrls(oldUrls => {
          Object.values(oldUrls).forEach(url => URL.revokeObjectURL(url));
          return newBlobUrls;
        });
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError("Failed to fetch devices");
    }
  }, [wasmModule]);

  const handleCreateDevice = () => {
    if (!wasmModule) return;
    
    wasmModule.create_device()
      .then(response => {
        if (!response.error) {
          // Refresh in the background
          fetchDevices();
        } else {
          console.error("Error creating device:", response.error.message);
        }
      })
      .catch(err => {
        console.error("Error creating device:", err);
      });
  };

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(blobUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [blobUrls]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Devices</CardTitle>
        <Button 
          onClick={handleCreateDevice}
        >
          Create Device
        </Button>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <p>No devices available.</p>
        ) : (
          <ul className="list-none pl-0">
            {devices.map((device) => (
              <li key={device.id} className="flex items-center gap-2 mb-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(
                      `/test/devices/${device.id}`,
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                >
                  View
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    window.open(
                      blobUrls[device.id],
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                >
                  Open JSON
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default DeviceList;
