import { createContext, useContext, ReactNode } from "react";
import { useRequirementPrice } from "@/hooks/use-requirement-price";

interface RequirementPriceContextType {
    price: number | null;
    loading: boolean;
    error: string | null;
}

const RequirementPriceContext = createContext<RequirementPriceContextType | undefined>(undefined);

export const RequirementPriceProvider = ({ children }: { children: ReactNode }) => {
    const priceData = useRequirementPrice();

    return (
        <RequirementPriceContext.Provider value={priceData}>
            {children}
        </RequirementPriceContext.Provider>
    );
};

export const useRequirementPriceContext = () => {
    const context = useContext(RequirementPriceContext);
    if (!context) {
        throw new Error("useRequirementPriceContext must be used within a RequirementPriceProvider");
    }
    return context;
};