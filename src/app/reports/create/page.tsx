'use client'
import React from "react";
import ReportCreator from "@/components/reports/create-report/report-creator";

const CreateReportModal: React.FC = () => {


    return (
        <div>
            <ReportCreator onReportSubmitted={() => console.log("false")} />
        </div>
    );
};

export default CreateReportModal;
