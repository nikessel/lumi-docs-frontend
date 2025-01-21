import React, { createContext, useContext, ReactNode } from 'react';
import { useRegulatoryFrameworks } from '@/hooks/regulatory-frameworks-hooks'; // Assuming the hook is defined here
import { RegulatoryFramework } from '@wasm';

interface FrameworkInfo {
    id: RegulatoryFramework;
    description: string;
}

interface RegulatoryFrameworksContextType {
    frameworks: FrameworkInfo[];
    loading: boolean;
    error: string | null;
}

const RegulatoryFrameworksContext = createContext<RegulatoryFrameworksContextType | undefined>(undefined);

export const RegulatoryFrameworksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { frameworks, loading, error } = useRegulatoryFrameworks();

    return (
        <RegulatoryFrameworksContext.Provider value={{ frameworks, loading, error }}>
            {children}
        </RegulatoryFrameworksContext.Provider>
    );
};

export const useRegulatoryFrameworksContext = (): RegulatoryFrameworksContextType => {
    const context = useContext(RegulatoryFrameworksContext);
    if (!context) {
        throw new Error('useRegulatoryFrameworksContext must be used within a RegulatoryFrameworksProvider');
    }
    return context;
};
