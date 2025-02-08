import { RegulatoryFramework } from "@wasm";

interface PricingInfo {
    price: string;
    documents_included: number;
}

interface FrameworkInfo {
    id: RegulatoryFramework;
    description: string;
    pricing: PricingInfo;
}

export const getSupportedFrameworks = (): FrameworkInfo[] => {
    return [
        {
            id: "mdr",
            description:
                "The Medical Device Regulation (MDR) governs medical device requirements within the European Union, ensuring safety, quality, and compliance.",
            pricing: {
                price: "€1,500",
                documents_included: 1000,
            },
        },
        {
            id: "iso13485",
            description:
                "ISO 13485 is a globally recognized standard for quality management systems specific to the medical device industry.",
            pricing: {
                price: "€1,500",
                documents_included: 1000,
            },
        },
        {
            id: "iso14155",
            description:
                "ISO 14155 outlines the requirements for clinical investigations of medical devices involving human subjects to ensure scientific rigor and ethical compliance.",
            pricing: {
                price: "€1,500",
                documents_included: 1000,
            },
        },
        {
            id: "iso14971",
            description:
                "ISO 14971 provides a framework for the application of risk management to medical devices, focusing on identifying, assessing, and controlling risks.",
            pricing: {
                price: "€1,500",
                documents_included: 1000,
            },
        },
    ];
};
