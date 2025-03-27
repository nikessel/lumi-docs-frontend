'use client'
import React from "react";
import { DescriptionCustomizer } from "@/components/reports/create-report/description_customizer";
import { useCreateReportStore } from "@/stores/create-report-store";
import { RegulatoryFramework } from "@wasm";
const CreateReportModal: React.FC = () => {

    const { selectedFramework } = useCreateReportStore();


    return (
        <div>
            <DescriptionCustomizer selectedRegulatoryFramework={selectedFramework as RegulatoryFramework} />
        </div>
    );
};

export default CreateReportModal;
