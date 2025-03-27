'use client';

import React, { useState } from 'react';
import { Divider, Alert, Steps, Button, Modal } from 'antd';
import "@/styles/globals.css";
import ReportCreatedOn from '@/components/reports/created-on';
import SaveViewButton from '@/components/saved-views/save-view-button';
import { useReportsContext } from '@/contexts/reports-context';
import { extractProgress } from '@/utils/report-utils';
import Typography from '@/components/common/typography';
import PriceTracker from '@/components/reports/create-report/price-tracker';
import { useCreateReportStore } from '@/stores/create-report-store';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { validateReportInput, createReport } from '@/utils/report-utils/create-report-utils';
import { message } from 'antd';
import RegulatoryFrameworkTag from '@/components/reports/regulatory-framework-tag';
import SelectDocuments from '@/components/reports/create-report/document-selector';

const { Step } = Steps;

interface LayoutProps {
    children: React.ReactNode;
}

interface Step {
    title: string;
    content: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { filteredSelectedReports, reports } = useReportsContext();
    const { currentStep, selectedPath, selectedFramework } = useCreateReportStore();
    const { wasmModule } = useWasm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [isDocumentSelectorVisible, setIsDocumentSelectorVisible] = useState(false);
    const processingReport = filteredSelectedReports.find(report => report.status === "processing");
    const progress = processingReport ? extractProgress(processingReport.title) : undefined;

    const aiSteps = [
        { title: "Initial Analysis" },
        { title: "Review Selection" },
        { title: "Run Report" },
    ];

    const manualSteps = [
        { title: "Sections" },
        { title: "Groups" },
        { title: "Requirements" },
        { title: "Documents" }
    ];

    const steps = selectedPath === 'ai' ? aiSteps : manualSteps;

    const handleCreateReport = async () => {
        if (!wasmModule) return;

        setIsGeneratingReport(true);

        const valRep = await validateReportInput(wasmModule);
        setValidationResult(valRep);

        if (valRep.error) {
            messageApi.error(valRep.messages?.join('\n') || 'Validation failed');
            setIsGeneratingReport(false);
            return;
        }

        const createReportInput = valRep.input;

        if (createReportInput) {
            const res = await createReport(wasmModule, createReportInput);
            if (res.error) {
                messageApi.error("An error occurred creating the report");
                setIsGeneratingReport(false);
            } else {
                messageApi.success("Report is being generated");
                setIsGeneratingReport(false);
                const { resetState } = useCreateReportStore.getState();
                resetState();
            }
        } else {
            messageApi.error("An input error occurred when creating the report");
            setIsGeneratingReport(false);
        }
    };

    console.log("filteredSelectedReports", filteredSelectedReports, reports)

    return (
        <div>
            {contextHolder}
            <div className="w-full flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <Typography textSize="h4">New Documentation Review</Typography>
                    <RegulatoryFrameworkTag standard={selectedFramework} />
                </div>
                <div className="flex gap-4 items-center">
                    <PriceTracker></PriceTracker>
                    <Button onClick={() => setIsDocumentSelectorVisible(true)}>
                        Select Documents
                    </Button>
                    <Button loading={isGeneratingReport} type="primary" onClick={handleCreateReport}>
                        Create Report
                    </Button>
                </div>
            </div>

            <Modal
                title="Select Documents"
                open={isDocumentSelectorVisible}
                onCancel={() => setIsDocumentSelectorVisible(false)}
                width="80%"
                footer={null}
            >
                <SelectDocuments />
            </Modal>

            <Divider className="border-thin mt-2 mb-2" />

            <div className="mt-2">
                {processingReport && (
                    <div className="mb-4">
                        <Alert
                            message={`A report has only partially finished processing. Assessments will gradually be updated. ${progress ? `Progress: ${progress}%` : ""}`}
                            type="info"
                            closable
                        />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default Layout;
