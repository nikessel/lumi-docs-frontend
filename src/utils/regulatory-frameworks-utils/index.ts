import { RegulatoryFramework } from "@wasm";

interface FrameworkInfo {
    id: RegulatoryFramework;
    description: string;
}

const FRAMEWORK_DESCRIPTIONS: Record<RegulatoryFramework, string> = {
    mdr: "The Medical Device Regulation (MDR) governs medical device requirements within the European Union, ensuring safety, quality, and compliance. Running a gap analysis on this collection is a high-level MDR compliance assessment, but does not take underlying standards into consideration.",
    iso13485: "ISO 13485 is a globally recognized standard for quality management systems specific to the medical device industry.",
    iso14155: "ISO 14155 outlines the requirements for clinical investigations of medical devices involving human subjects to ensure scientific rigor and ethical compliance.",
    iso14971: "ISO 14971 provides a framework for the application of risk management to medical devices, focusing on identifying, assessing, and controlling risks.",
    iec62304: "IEC 62304 defines the requirements for the development and maintenance of medical device software, ensuring software safety and effectiveness.",
    iec62366: "IEC 62366 specifies usability engineering processes for medical devices, focusing on risk management related to human factors and usability.",
    iso10993_10: "ISO 10993-10 describes procedures for the assessment of medical device materials for irritation and skin sensitization potential in biological evaluation.",
};

export const getSupportedFrameworks = (): FrameworkInfo[] => {
    return Object.entries(FRAMEWORK_DESCRIPTIONS).map(([id, description]) => ({
        id: id as RegulatoryFramework,
        description,
    }));
};
