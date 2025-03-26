"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import { Device, Company, Trial } from '@wasm';
import { useDescriptions } from '@/hooks/description-hooks';

interface DescriptionsContextType {
    devices: Device[];
    companies: Company[];
    trials: Trial[];
    loading: boolean;
    error: string | null;
}

const DescriptionsContext = createContext<DescriptionsContextType | undefined>(undefined);

export const DescriptionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { devices, companies, trials, loading, error } = useDescriptions();

    return (
        <DescriptionsContext.Provider value={{ devices, companies, trials, loading, error }}>
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