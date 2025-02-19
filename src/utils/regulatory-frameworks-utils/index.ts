import { RegulatoryFramework } from "@wasm";

interface FrameworkInfo {
    id: RegulatoryFramework;
    description: string;
}

export const getSupportedFrameworks = (): FrameworkInfo[] => {
    return [
        {
            id: "mdr",
            description:
                "The Medical Device Regulation (MDR) governs medical device requirements within the European Union, ensuring safety, quality, and compliance."
        },
        {
            id: "iso13485",
            description:
                "ISO 13485 is a globally recognized standard for quality management systems specific to the medical device industry."
        },
        {
            id: "iso14155",
            description:
                "ISO 14155 outlines the requirements for clinical investigations of medical devices involving human subjects to ensure scientific rigor and ethical compliance."
        },
        {
            id: "iso14971",
            description:
                "ISO 14971 provides a framework for the application of risk management to medical devices, focusing on identifying, assessing, and controlling risks."
        },
    ];
};
