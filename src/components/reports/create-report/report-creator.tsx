import React, { useEffect, useState } from "react";
import { Button, Steps, Select, message, Row, Col, Card, Typography } from "antd";
import SelectSections from "./section-selector";
import SelectDocuments from "./document-selector";
import SelectRequirementGroups from "./requirement-group-selector";
import SelectRequirements from "./requirement-selector";
import { getSupportedFrameworks } from "@/utils/regulatory-frameworks-utils";
import { formatRegulatoryFramework } from "@/utils/helpers";
import { useSectionsContext } from "@/contexts/sections-context";
import { useFilesContext } from "@/contexts/files-context";
import { useRequirementGroupsContext } from "@/contexts/requirement-group-context";
import { useRequirementsContext } from "@/contexts/requirements-context";
import { useCreateReportStore } from "@/stores/create-report-store";
import { validateReportInput } from "@/utils/report-utils/create-report-utils";
import { getPriceForSection, getPriceForGroup, getPriceForRequirement } from "@/utils/payment";
import { useRequirementPriceContext } from "@/contexts/price-context/use-requirement-price-context";
import { createReport } from "@/utils/report-utils/create-report-utils";
import { useWasm } from "../../../contexts/wasm-context/WasmProvider";
import { ValidateReportOutput as ValidateReportOutputType } from "@/utils/report-utils/create-report-utils";
import { useDocumentsContext } from "@/contexts/documents-context";
import Image from "next/image";
import { DevelopmentLifecycleTimeline } from "@/components/reports/create-report/maturity_stage_render";
import { RegulatoryFramework } from '@wasm';
import AISuggestionsReview from './ai-suggestions-review';


const { Step } = Steps;
const { Title, Paragraph } = Typography;

interface ReportCreatorProps {
    onReportSubmitted: () => void;
}

interface Step {
    title: string;
    content: React.ReactNode;
}

const arraysAreEqual = (arr1: string[], arr2: string[]): boolean =>
    arr1.length === arr2.length && arr1.every((item) => arr2.includes(item));

const ReportCreator: React.FC<ReportCreatorProps> = ({ onReportSubmitted }) => {
    const {
        currentStep,
        selectedFramework,
        selectedSections,
        selectedRequirementGroups,
        selectedRequirements,
        selectedDocumentNumbers,
        sectionsSetForFramework,
        setSectionsSetForFramework,
        groupsSetForSections,
        setGroupsSetForSections,
        requirementsSetForGroups,
        setRequirementsSetForGroups,
        setCurrentStep,
        setSelectedFramework,
        setSelectedSections,
        setSelectedDocumentNumbers,
        setSelectedRequirementGroups,
        setSelectedRequirements,
    } = useCreateReportStore();

    const frameworks = getSupportedFrameworks();
    const { sectionsForRegulatoryFramework } = useSectionsContext();
    const { requirementGroupsBySectionId } = useRequirementGroupsContext();
    const { requirementsByGroupId } = useRequirementsContext();
    const { files } = useFilesContext();
    const { documents } = useDocumentsContext()
    const { wasmModule } = useWasm()
    const { userPrice, defaultPrice } = useRequirementPriceContext()
    const [messageApi, contextHolder] = message.useMessage()
    const [isGeneratingReport, setIsGeneratingReport] = useState(false)
    const [validationResult, setValidationResult] = useState<ValidateReportOutputType | null>(null);
    const [selectedPath, setSelectedPath] = useState<'ai' | 'manual' | null>(null);
    const [steps, setSteps] = useState<Step[]>([])
    const [nextDisabled, setNextDisabled] = useState(false)

    const next = () => {
        if (currentStep === 1 && selectedPath) {
            const builtSteps = selectedPath === 'ai' ? aiPathSteps : manualPathSteps;
            setSteps(builtSteps);
            setCurrentStep(2); // Start of stepper
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const prev = () => {
        if (currentStep === 2) {
            // Leaving stepper to go back to method selection
            setSelectedPath(null);
            setSteps([]);
            setCurrentStep(1);
        } else if (currentStep === 1) {
            // Leaving method selection to go back to framework selection
            setCurrentStep(0);
        } else if (currentStep > 2) {
            // Regular stepper back
            setCurrentStep(currentStep - 1);
        }
    };

    useEffect(() => {
        if (selectedPath === "ai" && currentStep === 2) {
            setNextDisabled(true)
        } else {
            setNextDisabled(false)
        }
    }, [selectedPath, currentStep])

    const aiStepDescriptions = [
        { title: "Initial Analysis", description: "Let our AI engine estimate the maturity of your documentation" },
        { title: "Review Selection", description: "Review the selected requirements" },
        { title: "Run Report", description: "Run the report" },
    ];

    const manualStepDescriptions = [
        { title: "Sections", description: `Select from ${sectionsForRegulatoryFramework[selectedFramework]?.length || 0} sections` },
        { title: "Groups", description: `Select from ${sectionsForRegulatoryFramework[selectedFramework]?.flatMap(section => requirementGroupsBySectionId[section.id] || []).length || 0} groups` },
        {
            title: "Requirements", description: `Select from ${sectionsForRegulatoryFramework[selectedFramework]?.flatMap(section =>
                requirementGroupsBySectionId[section.id]?.flatMap(group => requirementsByGroupId[group.id] || []) || []
            ).length || 0} requirements`
        },
        { title: "Documents", description: "Pick documents to analyze" }
    ];

    const handleSelectPath = (path: 'ai' | 'manual') => {
        setSelectedPath(path);

        const builtSteps = path === 'ai' ? aiPathSteps : manualPathSteps;
        setSteps(builtSteps);

        setCurrentStep(2); // jump directly to the first real step
    };

    const handleSelectFramework = (framework: RegulatoryFramework) => {
        setSelectedFramework(framework);

        // Get all sections for the selected framework
        const allSections = sectionsForRegulatoryFramework[framework] || [];
        setSelectedSections(allSections.map(section => section.id));

        // Get all requirement groups for the selected sections
        const allGroups = allSections.flatMap(section => requirementGroupsBySectionId[section.id] || []);
        setSelectedRequirementGroups(allGroups.map(group => group.id));

        // Get all requirements for the selected groups
        const allRequirements = allGroups.flatMap(group => requirementsByGroupId[group.id] || []);
        setSelectedRequirements(allRequirements.map(req => req.id));
    };

    const baseSteps: Step[] = [
        {
            title: "Regulatory Framework",
            content: (
                <div className="pb-2">
                    <Typography.Title level={4} className="mb-4">Select Regulatory Framework</Typography.Title>
                    <Typography className="my-4 leading-6" color="secondary">
                        Select the regulatory framework you wish to validate your documents against.
                    </Typography>
                    <Select
                        showSearch
                        value={selectedFramework}
                        onChange={handleSelectFramework}
                        options={frameworks.map(framework => ({
                            label: formatRegulatoryFramework(framework.id),
                            value: framework.id,
                        }))}
                        style={{ width: "100%" }}
                        placeholder="Select Regulatory Framework"
                    />
                    <Typography className="my-4 leading-6" color="secondary">
                        {selectedFramework ? frameworks.find(fw => fw.id === selectedFramework)?.description : ""}
                    </Typography>
                </div>
            ),
        },
        {
            title: "Method",
            content: (
                <div className="pb-2">
                    {/* <Typography.Title level={4} className="mb-4">Choose Selection Method</Typography.Title>
                    <Typography className="my-4 leading-6" color="secondary">
                        Select how you would like to proceed with the report creation.
                    </Typography> */}

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card

                                onClick={() => handleSelectPath('manual')}
                                className="h-full cursor-pointer group relative"
                            >
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                                <Title level={4}>Manual Selection</Title>
                                <Paragraph>
                                    Select between {sectionsForRegulatoryFramework[selectedFramework]?.length || 0} sections,
                                    customize to exactly what you need.
                                </Paragraph>
                                <Steps
                                    direction="vertical"
                                    current={-1}
                                    items={manualStepDescriptions.map(step => ({ title: step.title, description: step.description }))}
                                    size="small"
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card

                                onClick={() => handleSelectPath('ai')}
                                className="h-full cursor-pointer border-l-4 border-blue-500 group relative"
                            >
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Image src="/assets/pngs/ai.png" alt="AI" width={24} height={24} className="mb-2" />
                                    <Title level={4}>AI-Powered Selection</Title>
                                </div>
                                <Paragraph>
                                    We will analyze your documentation, estimate the maturity and suggest the most relevant requirements.
                                </Paragraph>
                                <Steps
                                    direction="vertical"
                                    current={-1}
                                    items={aiStepDescriptions.map(step => ({ title: step.title, description: step.description }))}
                                    size="small"
                                />
                            </Card>
                            <div className="text-xs text-blue-500 text-center mt-2">Recommended</div>
                        </Col>
                    </Row>

                    {selectedPath && (
                        <div className="mt-8">
                            <Button type="primary" onClick={next}>
                                Continue with {selectedPath === 'ai' ? 'AI-Powered' : 'Manual'} Selection
                            </Button>
                        </div>
                    )}
                </div>
            ),
        }
    ];


    const onDefaultSelectionsReady = () => {
        setNextDisabled(false)
    }

    const handleCustomizeSelection = () => {
        setSelectedPath('manual');
        setCurrentStep(2); // Start of manual selection flow
    };

    const aiPathSteps: Step[] = [
        {
            title: "Analysis",
            content: (
                <div>
                    <DevelopmentLifecycleTimeline onReady={onDefaultSelectionsReady} selectedRegulatoryFramework={selectedFramework as RegulatoryFramework} />
                </div>
            ),
        },
        {
            title: "Review",
            content: (
                <div>
                    <AISuggestionsReview onCustomize={handleCustomizeSelection} />
                </div>
            ),
        },
        {
            title: "Documents",
            content: (
                <div>
                    <Typography className="my-4 leading-6" color="secondary">
                        Select the documents that will be analyzed by our AI to generate the report.
                    </Typography>
                    <SelectDocuments />
                </div>
            ),
        }
    ];

    const manualPathSteps: Step[] = [
        {
            title: "Sections",
            content: (
                <div>
                    <Typography.Title level={4} className="mb-4">Select Sections</Typography.Title>
                    <Typography className="my-4 leading-6" color="secondary">
                        LumiDocs divides the analysis into {sectionsForRegulatoryFramework[selectedFramework]?.length} sections for {formatRegulatoryFramework(selectedFramework)}.
                        You can select a subset of these sections below.
                    </Typography>
                    <SelectSections
                        sections={(sectionsForRegulatoryFramework[selectedFramework] || []).map(section => ({
                            id: section.id,
                            name: section.description,
                            price_for_section: getPriceForSection(
                                section.id,
                                requirementGroupsBySectionId,
                                requirementsByGroupId,
                                userPrice ? userPrice : defaultPrice
                            ),
                        }))}
                    />
                </div>
            ),
        },
        {
            title: "Requirement Groups",
            content: (
                <div>
                    <Typography.Title level={4} className="mb-4">Select Requirement Groups</Typography.Title>
                    <Typography className="my-4 leading-6" color="secondary">
                        Based on your selected sections, LumiDocs has identified {selectedSections
                            .flatMap((sectionId) => requirementGroupsBySectionId[sectionId] || [])?.length} requirement groups.
                        You can select a subset of these groups to include in the report.
                    </Typography>
                    <SelectRequirementGroups />
                </div>
            ),
        },
        {
            title: "Requirements",
            content: (
                <div>
                    <Typography.Title level={4} className="mb-4">Select Requirements</Typography.Title>
                    <Typography className="my-4 leading-6" color="secondary">
                        Based on your selected requirement groups, LumiDocs has identified {selectedRequirementGroups
                            .flatMap((groupId) => requirementsByGroupId[groupId] || [])?.length} requirements.
                        You can select a subset of these requirements to include in the report.
                    </Typography>
                    <SelectRequirements />
                </div>
            ),
        },
        {
            title: "Manual Documents",
            content: (
                <div>
                    <Typography.Title level={4} className="mb-4">Select Documents for Manual Analysis</Typography.Title>
                    <Typography className="my-4 leading-6" color="secondary">
                        Select the documents that will be analyzed against your chosen requirements.
                    </Typography>
                    <SelectDocuments />
                </div>
            ),
        }
    ];


    useEffect(() => {

        const steps: Step[] = selectedPath === 'ai'
            ? aiPathSteps
            : selectedPath === 'manual'
                ? manualPathSteps
                : baseSteps;

        setSteps(steps)

    }, [selectedFramework, selectedPath])

    const resetToFrameworkSelection = () => {
        setSelectedPath(null);
        setCurrentStep(0);
    };

    useEffect(() => {
        if (currentStep === 0) {
            setSelectedPath(null)
        }
    }, [currentStep])

    useEffect(() => {
        const validate = async () => {
            const result = await validateReportInput(wasmModule);
            setValidationResult(result);
        };
        validate();
    }, [selectedSections, selectedRequirementGroups, selectedRequirements, files, wasmModule, selectedDocumentNumbers]);

    // useEffect(() => {
    //     if (sectionsForRegulatoryFramework[selectedFramework] && sectionsSetForFramework !== selectedFramework) {
    //         setSelectedSections([sectionsForRegulatoryFramework[selectedFramework][0].id]);
    //         setSectionsSetForFramework(selectedFramework);
    //     }
    // }, [sectionsForRegulatoryFramework, sectionsSetForFramework, selectedFramework, setSectionsSetForFramework, setSelectedSections]);

    // useEffect(() => {
    //     if (!arraysAreEqual(groupsSetForSections, selectedSections)) {
    //         const relatedGroups = selectedSections.flatMap(sectionId => requirementGroupsBySectionId[sectionId] || []);
    //         setSelectedRequirementGroups(relatedGroups.map(group => group.id));
    //         setGroupsSetForSections(selectedSections);
    //     }
    // }, [requirementGroupsBySectionId, groupsSetForSections, selectedSections, setGroupsSetForSections, setSelectedRequirementGroups]);

    // useEffect(() => {
    //     if (!arraysAreEqual(requirementsSetForGroups, selectedRequirementGroups)) {
    //         const relatedRequirements = selectedRequirementGroups.flatMap(groupId => requirementsByGroupId[groupId] || []);
    //         setSelectedRequirements(relatedRequirements.map(req => req.id));
    //         setRequirementsSetForGroups(selectedRequirementGroups);
    //     }
    // }, [requirementsByGroupId, requirementsSetForGroups, selectedRequirementGroups, setRequirementsSetForGroups, setSelectedRequirements]);

    useEffect(() => {
        if (documents.length > 0) {
            setSelectedDocumentNumbers(documents.map(document => document.number));
        }
    }, [documents, setSelectedDocumentNumbers]);



    // const steps: Step[] = selectedPath === 'ai'
    //     ? aiPathSteps
    //     : selectedPath === 'manual'
    //         ? manualPathSteps
    //         : baseSteps;

    const handleCreateReport = async () => {
        if (!wasmModule) return

        setIsGeneratingReport(true)

        const valRep = await validateReportInput(wasmModule)


        const createReportInput = !valRep.error ? valRep.input : undefined

        if (createReportInput) {
            const res = await createReport(wasmModule, createReportInput)
            if (res.error) {
                messageApi.error("An error occured creating the report")
                setIsGeneratingReport(false)
            } else {
                messageApi.success("Report is being generated")
                onReportSubmitted()
                setIsGeneratingReport(false)
                const { resetState } = useCreateReportStore.getState();
                resetState()
            }
        } else {
            messageApi.error("An input error ocurred when creating the report")
            setIsGeneratingReport(false)

        }
    }


    return (
        <div className="pt-4">
            {contextHolder}

            {selectedPath && currentStep >= 2 && (
                <Steps current={currentStep - 2} className="mb-6" size="small">
                    {steps.map((step, index) => (
                        <Step key={index} title={step.title} />
                    ))}
                </Steps>
            )}

            <div className="mb-4">
                {currentStep === 0 && (
                    <div className="pb-2">
                        <Typography.Title level={4} className="mb-4">Select Regulatory Framework</Typography.Title>
                        <Typography className="my-4 leading-6" color="secondary">
                            Select the regulatory framework you wish to validate your documents against.
                        </Typography>
                        <Select
                            showSearch
                            value={selectedFramework}
                            onChange={setSelectedFramework}
                            options={frameworks.map(framework => ({
                                label: formatRegulatoryFramework(framework.id),
                                value: framework.id,
                            }))}
                            style={{ width: "100%" }}
                            placeholder="Select Regulatory Framework"
                        />
                        <Typography className="my-4 leading-6" color="secondary">
                            {selectedFramework ? frameworks.find(fw => fw.id === selectedFramework)?.description : ""}
                        </Typography>
                        {selectedFramework && (
                            <div className="mt-4 w-full flex justify-end">
                                <Button type="primary" onClick={next}>
                                    Continue
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="pb-2">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card

                                    onClick={() => handleSelectPath('manual')}
                                    className="h-full cursor-pointer group relative"
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                    <Title level={4}>Manual Selection</Title>
                                    <Paragraph>
                                        Select between {sectionsForRegulatoryFramework[selectedFramework]?.length || 0} sections,
                                        customize to exactly what you need.
                                    </Paragraph>
                                    <Steps
                                        direction="vertical"
                                        current={-1}
                                        items={manualStepDescriptions.map(step => ({ title: step.title, description: step.description }))}
                                        size="small"
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card

                                    onClick={() => handleSelectPath('ai')}
                                    className="h-full cursor-pointer border-l-4 border-blue-500 group relative"
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Image src="/assets/pngs/ai.png" alt="AI" width={24} height={24} className="mb-2" />
                                        <Title level={4}>AI-Powered Selection</Title>
                                    </div>
                                    <Paragraph>
                                        We will analyze your documentation, estimate the maturity and suggest the most relevant requirements.
                                    </Paragraph>
                                    <Steps
                                        direction="vertical"
                                        current={-1}
                                        items={aiStepDescriptions.map(step => ({ title: step.title, description: step.description }))}
                                        size="small"
                                    />
                                </Card>
                                <div className="text-xs text-blue-500 text-center mt-2">Recommended</div>
                            </Col>
                        </Row>
                    </div>
                )}

                {currentStep >= 2 && steps[currentStep - 2]?.content}
            </div>

            <div className="flex justify-between mt-6">
                {currentStep > 0 && (
                    <Button onClick={prev}>Back</Button>
                )}

                {currentStep >= 2 && (
                    <div className="flex gap-4 justify-end w-full">
                        {currentStep === steps.length + 2 && validationResult?.error && (
                            <div className="bg-red-50 text-red-500 p-2 rounded-md mb-2">
                                <ul className="list-disc pl-4">
                                    {validationResult?.messages.map((err: string, index: number) => (
                                        <li key={index}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {selectedPath === 'manual' && currentStep === 5 || selectedPath === 'ai' && currentStep === 4 ? (
                            <Button loading={isGeneratingReport} type="primary" disabled={validationResult?.error} onClick={handleCreateReport}>
                                Create Report
                            </Button>
                        ) : (
                            <Button type="primary" onClick={next} disabled={nextDisabled}>
                                Next
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>

    );
};

export default ReportCreator;