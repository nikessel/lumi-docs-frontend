import { createContext, useContext, ReactNode } from "react";
import {
    useUserContext
} from "../user-context";
interface RequirementPriceContextType {
    userPrice: number;
    defaultPrice: number;
    loading: boolean;
    error: string | null;
}

const RequirementPriceContext = createContext<RequirementPriceContextType | undefined>(undefined);

const PRICE_MAP: Record<string, number> = {
    "milsoe1992@gmail.com": 0.5,
    "chris@medtechconsult.online": 0.5,
    "admin@lumi-docs.com": 0.5,
    "test@lumi-docs.com": 0.5,
    "frederik.hjort@metiscompliance.dk": 0.5
};

export const RequirementPriceProvider = ({ children }: { children: ReactNode }) => {
    const user = useUserContext();
    const email = user?.user?.email
    const defaultPrice = 5;
    const userPrice = email ? PRICE_MAP[email] : defaultPrice;

    const priceData = { userPrice, defaultPrice, loading: false, error: null };

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
