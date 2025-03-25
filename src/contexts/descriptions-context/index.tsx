"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import { Device } from '@wasm';
import { useDeviceDescriptions } from '@/hooks/description-hooks';

interface DescriptionsContextType {
    deviceDescriptions: Device[];
    loading: boolean;
    error: string | null;
}

const DescriptionsContext = createContext<DescriptionsContextType | undefined>(undefined);

export const DescriptionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { deviceDescriptions, loading, error } = useDeviceDescriptions();

    return (
        <DescriptionsContext.Provider value={{ deviceDescriptions, loading, error }}>
            {children}
        </DescriptionsContext.Provider>
    );
};

export const useDescriptionsContext = (): DescriptionsContextType => {
    const context = useContext(DescriptionsContext);
    if (!context) {
        throw new Error('useDescriptionsContext must be used within a DescriptionsProvider');
    }
    return context;
}; 