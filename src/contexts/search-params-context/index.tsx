import React from "react"
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useMemo, useCallback } from "react";

type SearchParamKeys = "selectedReports" | "selectedTaskDocuments" | "searchQuery" | "compliance";

interface SearchParamsState {
    selectedReports: string[];
    selectedTaskDocuments: string[];
    searchQuery: string;
    compliance: [number, number] | null;
}

interface SearchParamsContextType extends SearchParamsState {
    // updateSearchParam: <T extends SearchParamKeys>(key: T, value: string | string[] | null) => void;
    toggleSelectedReport: (reportId: string) => void;
    toggleSelectedTaskDocuments: (documentId: string) => void;
    updateSearchQuery: (query: string) => void;
    updateComplianceRange: (range: [number, number] | null) => void;
}

const SearchParamsContext = createContext<SearchParamsContextType | null>(null);

export const SearchParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Extract and parse search params with strict typing
    const selectedReports = useMemo(() => {
        return searchParams.get("selectedReports")?.split(",") || [];
    }, [searchParams]);

    const selectedTaskDocuments = useMemo(() => {
        return searchParams.get("selectedTaskDocuments")?.split(",") || [];
    }, [searchParams]);

    const searchQuery = useMemo(() => searchParams.get("searchQuery") || "", [searchParams]);

    const compliance = useMemo(() => {
        const complianceParam = searchParams.get("compliance");
        if (!complianceParam) return null;
        const [min, max] = complianceParam.split(",").map(Number);
        return [min, max] as [number, number];
    }, [searchParams]);

    const updateSearchParam = useCallback(<T extends SearchParamKeys>(key: T, value: string | string[] | null) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        if (!value || (Array.isArray(value) && value.length === 0)) {
            newSearchParams.delete(key);
        } else {
            newSearchParams.set(key, Array.isArray(value) ? value.join(",") : value);
        }

        router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
    }, [router, searchParams]);

    const toggleSelectedReport = useCallback((reportId: string) => {
        const updatedReports = selectedReports.includes(reportId)
            ? selectedReports.filter((id) => id !== reportId)
            : [...selectedReports, reportId];

        updateSearchParam("selectedReports", updatedReports);
    }, [selectedReports, updateSearchParam]);

    const toggleSelectedTaskDocuments = useCallback((documentId: string) => {
        const updatedDocuments = selectedTaskDocuments.includes(documentId)
            ? selectedTaskDocuments.filter((id) => id !== documentId)
            : [...selectedTaskDocuments, documentId];

        updateSearchParam("selectedTaskDocuments", updatedDocuments);
    }, [selectedTaskDocuments, updateSearchParam]);

    const updateSearchQuery = useCallback((query: string) => {
        updateSearchParam("searchQuery", query || null);
    }, [updateSearchParam]);

    const updateComplianceRange = useCallback((range: [number, number] | null) => {
        updateSearchParam("compliance", range ? range.join(",") : null);
    }, [updateSearchParam]);

    return (
        <SearchParamsContext.Provider value={{
            selectedReports,
            selectedTaskDocuments,
            searchQuery,
            compliance,
            toggleSelectedReport,
            toggleSelectedTaskDocuments,
            updateSearchQuery,
            updateComplianceRange
        }}>
            {children}
        </SearchParamsContext.Provider>
    );
};

export const useSearchParamsState = () => {
    const context = useContext(SearchParamsContext);
    if (!context) {
        throw new Error("useSearchParamsState must be used within a SearchParamsProvider");
    }
    return context;
};
