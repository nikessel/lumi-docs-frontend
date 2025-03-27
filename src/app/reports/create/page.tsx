'use client'
import React from "react";
import { DescriptionCustomizer } from "@/components/reports/create-report/description_customizer";
import { useCreateReportStore } from "@/stores/create-report-store";
import { RegulatoryFramework } from "@wasm";
import SelectFramework from "@/components/reports/create-report/select-framework";

const CreateReportModal: React.FC = () => {

    const { selectedFramework } = useCreateReportStore();


    return (
        <div>
            {selectedFramework ? <DescriptionCustomizer selectedRegulatoryFramework={selectedFramework as RegulatoryFramework} /> : <SelectFramework />}
        </div>
    );
};

export default CreateReportModal;
