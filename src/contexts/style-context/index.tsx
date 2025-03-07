import React, { createContext, useContext, useState } from 'react';

export type FontSize = 'xs' | 'normal' | 'large';

interface StyleContextType {
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fontSize, setFontSize] = useState<FontSize>('xs');

    return (
        <StyleContext.Provider value={{ fontSize, setFontSize }}>
            {children}
        </StyleContext.Provider>
    );
};

export const useStyle = () => {
    const context = useContext(StyleContext);
    if (context === undefined) {
        throw new Error('useStyle must be used within a StyleProvider');
    }
    return context;
};

// Utility function to get text size class based on fontSize setting
export const getTextSizeClass = (fontSize: FontSize) => {
    switch (fontSize) {
        case 'xs':
            return 'text-xs';
        case 'normal':
            return 'text-sm';
        case 'large':
            return 'text-base';
        default:
            return 'text-sm';
    }
};

// Utility function to get padding class based on fontSize setting
export const getPaddingClass = (fontSize: FontSize) => {
    switch (fontSize) {
        case 'xs':
            return 'py-0 px-2';
        case 'normal':
            return 'py-2 px-3';
        case 'large':
            return 'py-4 px-4';
        default:
            return 'py-2 px-3';
    }
};

// Utility function to get indentation/spacing for navigation
export const getIndentClass = (fontSize: FontSize) => {
    switch (fontSize) {
        case 'xs':
            return 'ml-4';
        case 'normal':
            return 'ml-6';
        case 'large':
            return 'ml-8';
        default:
            return 'ml-6';
    }
}; 