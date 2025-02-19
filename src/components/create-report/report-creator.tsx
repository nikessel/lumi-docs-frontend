import React, { useEffect, useState } from "react";
import { Button, Steps, Select, message } from "antd";
import SelectSections from "./section-selector";
import SelectDocuments from "./document-selector";
import Typography from "../typography";
import { getSupportedFrameworks } from "@/utils/regulatory-frameworks-utils";
import { formatRegulatoryFramework } from "@/utils/helpers";
import { useSectionsContext } from "@/contexts/sections-context";
import { useFilesContext } from "@/contexts/files-context";
import { useRequirementGroupsContext } from "@/contexts/requirement-group-context";
import { useRequirementsContext } from "@/contexts/requirements-context";
import SelectRequirementGroups from "./requirement-group-selector";
import { useCreateReportStore } from "@/stores/create-report-store";
import { validateReportInput } from "@/utils/report-utils/create-report-utils";
import { getPriceForSection, getPriceForGroup } from "@/utils/payment";
import { useRequirementPriceContext } from "@/contexts/price-context/use-requirement-price-context";
import { createReport } from "@/utils/report-utils/create-report-utils";
import { useWasm } from "../WasmProvider";
import { ValidateReportOutput as ValidateReportOutputType } from "@/utils/report-utils/create-report-utils";

const { Step } = Steps;

interface ReportCreatorProps {
    onReportSubmitted: () => void;
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
    const { wasmModule } = useWasm()
    const { userPrice } = useRequirementPriceContext()
    const [messageApi, contextHolder] = message.useMessage()
    const [isGeneratingReport, setIsGeneratingReport] = useState(false)
    const [validationResult, setValidationResult] = useState<ValidateReportOutputType | null>(null);

    useEffect(() => {
        const validate = async () => {
            const result = await validateReportInput(wasmModule);
            setValidationResult(result);
        };
        validate();
    }, [selectedSections, selectedRequirementGroups, selectedRequirements, files, wasmModule]);

    useEffect(() => {
        if (sectionsForRegulatoryFramework[selectedFramework] && sectionsSetForFramework !== selectedFramework) {
            setSelectedSections([sectionsForRegulatoryFramework[selectedFramework][0].id]);
            setSectionsSetForFramework(selectedFramework);
        }
    }, [sectionsForRegulatoryFramework, sectionsSetForFramework, selectedFramework, setSectionsSetForFramework, setSelectedSections]);

    useEffect(() => {
        if (!arraysAreEqual(groupsSetForSections, selectedSections)) {
            const relatedGroups = selectedSections.flatMap(sectionId => requirementGroupsBySectionId[sectionId] || []);
            setSelectedRequirementGroups(relatedGroups.map(group => group.id));
            setGroupsSetForSections(selectedSections);
        }
    }, [requirementGroupsBySectionId, groupsSetForSections, selectedSections, setGroupsSetForSections, setSelectedRequirementGroups]);

    useEffect(() => {
        if (!arraysAreEqual(requirementsSetForGroups, selectedRequirementGroups)) {
            const relatedRequirements = selectedRequirementGroups.flatMap(groupId => requirementsByGroupId[groupId] || []);
            setSelectedRequirements(relatedRequirements.map(req => req.id));
            setRequirementsSetForGroups(selectedRequirementGroups);
        }
    }, [requirementsByGroupId, requirementsSetForGroups, selectedRequirementGroups, setRequirementsSetForGroups, setSelectedRequirements]);

    useEffect(() => {
        if (files.length > 0) {
            setSelectedDocumentNumbers(files.map(file => file.number));
        }
    }, [files, setSelectedDocumentNumbers]);

    const steps = [
        {
            title: "Regulatory Framework",
            content: (
                <div className="pb-2">
                    <Typography textSize="h6" className="mb-4">Select Regulatory Framework</Typography>
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
                </div>
            ),
        },
        {
            title: "Sections",
            content: (
                <div>
                    <Typography textSize="h6" className="mb-4">Select Sections</Typography>
                    <Typography className="my-4 leading-6" color="secondary">
                        LumiDocs divides the analysis into {sectionsForRegulatoryFramework[selectedFramework].length} sections for {formatRegulatoryFramework(selectedFramework)}.
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
                                userPrice ? userPrice : 0
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
                    <Typography textSize="h6" className="mb-4">Select Requirement Groups</Typography>
                    <Typography className="my-4 leading-6" color="secondary">
                        Based on your selected sections, LumiDocs has identified {selectedSections
                            .flatMap((sectionId) => requirementGroupsBySectionId[sectionId] || []).length} requirement groups.
                        You can select a subset of these groups to include in the report.
                    </Typography>
                    <SelectRequirementGroups
                        requirementGroups={selectedSections
                            .flatMap((sectionId) => requirementGroupsBySectionId[sectionId] || [])
                            .map((group) => ({
                                id: group.id,
                                name: group.name || "Unknown",
                                price_for_group: getPriceForGroup(group.id, requirementsByGroupId, userPrice ? userPrice : 0),
                            }))
                        }
                    />
                </div>
            ),
        },
        {
            title: "Documents",
            content: (
                <div>
                    <Typography textSize="h6" className="mb-4">Select Documents</Typography>
                    <Typography className="my-4 leading-6" color="secondary">
                        LumiDocs will analyze all available documents to extract relevant information.
                        However, if you have conflicting versions, you can select specific documents below.
                    </Typography>
                    <SelectDocuments
                        documents={files.map(file => ({
                            id: file.id,
                            name: file.title,
                            number: file.number,
                        }))}
                    />
                </div>
            ),
        }
    ];

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

    const next = () => setCurrentStep(currentStep + 1);
    const prev = () => setCurrentStep(currentStep - 1);

    return (
        <div className="pt-4">
            {contextHolder}
            <Steps current={currentStep} className="mb-6" size="small">
                {steps.map((step, index) => (
                    <Step key={index} title={step.title} />
                ))}
            </Steps>

            <div className="mb-4">{steps[currentStep]?.content}</div>

            <div className="flex justify-between">
                <Button disabled={currentStep === 0} onClick={prev}>Back</Button>
                {currentStep === steps.length - 1 && validationResult?.error && (
                    <div className="bg-red-50 text-red-500 p-2 rounded-md mb-2">
                        <ul className="list-disc pl-4">
                            {validationResult?.messages.map((err: string, index: number) => (
                                <li key={index}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {currentStep === steps.length - 1 ? (
                    <Button loading={isGeneratingReport} type="primary" disabled={validationResult?.error} onClick={handleCreateReport}>
                        Create Report
                    </Button>
                ) : (
                    <Button type="primary" onClick={next} >
                        Next
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ReportCreator;
