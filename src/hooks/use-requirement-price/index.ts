import { useState, useEffect } from "react";
import { logLumiDocsContext } from "@/utils/logging-utils";

interface UseRequirementPrice {
    price: number | null;
    loading: boolean;
    error: string | null;
}

export const useRequirementPrice = (): UseRequirementPrice => {
    const [price, setPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                setLoading(true);

                const response = await fetch("/api/get-requirement-price");
                if (!response.ok) {
                    throw new Error("Failed to fetch requirement price");
                }

                const { price } = await response.json();
                if (!price) throw new Error("Invalid price data from Stripe");

                logLumiDocsContext(`Fetched requirement price: ${price / 100} EUR`, "success");
                setPrice(price / 100); // Convert cents to EUR
            } catch (err) {
                logLumiDocsContext(`Error fetching requirement price: ${err}`, "error");
                setError(err instanceof Error ? err.message : "Failed to fetch requirement price");
            } finally {
                setLoading(false);
            }
        };
        if (!price) {
            fetchPrice();
        }
    }, [price]);

    return { price, loading, error };
};
