"use client";
import type { StorageKey } from "@wasm";

class Storage {
  private static instance: Storage;

  private constructor() {}

  public static getInstance(): Storage {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }

  set(key: StorageKey, value: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  }

  get(key: StorageKey): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }

  remove(key: StorageKey): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === "undefined") return;
    this.remove("id_token");
    this.remove("access_token");
  }
}

export const storage = Storage.getInstance();

// React hook for storage
import { useState, useEffect } from "react";

export function useStorage(key: StorageKey) {
  const [value, setValue] = useState<string | null>(() => storage.get(key));

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        setValue(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  const setStorageValue = (newValue: string | null) => {
    if (newValue === null) {
      storage.remove(key);
    } else {
      storage.set(key, newValue);
    }
    setValue(newValue);
  };

  return [value, setStorageValue] as const;
}
