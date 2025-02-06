import React, { useState, useEffect, useMemo } from "react";
import { Button, Steps, Select } from "antd";
import SelectSections from "./section-selector";
import SelectDocuments from "./document-selector";
import Typography from "../typography";
import { getSupportedFrameworks } from "@/utils/regulatory-frameworks-utils";
import { formatRegulatoryFramework } from "@/utils/helpers";
import type { RegulatoryFramework, RequirementGroup, Requirement } from "@wasm";
import { useWasm } from '@/components/WasmProvider';
import { useSectionsForRegulatoryFrameworks } from "@/hooks/section-hooks";
import { useFiles } from '@/hooks/files-hooks';
import { notification } from "antd";
import { useRequirementGroupsForSectionIds } from "@/hooks/requirement-group-hooks";
import { useRequirementsForGroupIds } from "@/hooks/requirement-hooks";
import SelectRequirementGroups from "./requirement-group-selector";
import { useCreateReportStore } from "@/stores/create-report-store";
import EmbeddedPaymentForm from "../payment/embedded-payment-form";
import { validateReportInput } from "@/utils/report-utils/create-report-utils";
import { getPriceForSection, getPriceForGroup } from "@/utils/payment";

const { Step } = Steps;

interface ReportCreatorProps {
    onReportSubmitted: () => void;
}

const arraysAreEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) {
        return false; // Different lengths mean the arrays are not equal
    }

    // Compare elements (ignoring order)
    return arr1.every((item) => arr2.includes(item)) && arr2.every((item) => arr1.includes(item));
};

const ReportCreator: React.FC<ReportCreatorProps> = ({ onReportSubmitted }) => {
    const {
        currentStep,
        selectedFramework,
        selectedSections,
        selectedDocumentNumbers,
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
        resetState,
    } = useCreateReportStore();

    const frameworks = getSupportedFrameworks();

    const frameworkIds = useMemo(() => [selectedFramework as RegulatoryFramework], [selectedFramework]);

    const { wasmModule } = useWasm();

    const { sections } = useSectionsForRegulatoryFrameworks(frameworkIds)

    const allSectionIds = useMemo(() => sections.map(f => f.id), [sections]);

    const { requirementGroups: allRequirementGroups, loading: allRequirementGroupsLoading } = useRequirementGroupsForSectionIds(allSectionIds)

    const allRequirementGroupsIds = useMemo(() => allRequirementGroups.map(f => f.id), [allRequirementGroups]);

    const { requirements: allRequirements, loading: allRequirementsLoading } = useRequirementsForGroupIds(allRequirementGroupsIds)

    const { files } = useFiles()

    const { requirementGroups, loading: requirementGroupsLoading } = useRequirementGroupsForSectionIds(selectedSections)

    const requrementGroupIds = useMemo(() => requirementGroups.map(f => f.id), [requirementGroups]);

    const { requirements, loading: requirementsLoading } = useRequirementsForGroupIds(selectedRequirementGroups)

    const requirementIds = useMemo(() => requirements.map(f => f.id), [requirements]);

    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (sections && sections.length > 0 && sectionsSetForFramework !== selectedFramework) {
            setSelectedSections([sections[0].id]);
            setSectionsSetForFramework(selectedFramework)
        }
    }, [sections]);

    useEffect(() => {
        if (requirementGroups && !arraysAreEqual(groupsSetForSections, selectedSections)) {
            setSelectedRequirementGroups(requirementGroups.map((group) => group.id));
            setGroupsSetForSections(selectedSections)
        }
    }, [requirementGroups]);

    useEffect(() => {
        if (requirementIds && !arraysAreEqual(requirementsSetForGroups, selectedRequirementGroups)) {
            setSelectedRequirements(requirementIds);
            setRequirementsSetForGroups(selectedRequirementGroups)
        }
    }, [requirementIds]);


    useEffect(() => {
        if (files && Array.isArray(files)) {
            setSelectedDocumentNumbers(files.map((file) => file.number));
        }
    }, [files]);

    // const getPriceForSection = (sectionId: string, allGroups: RequirementGroupWithSectionId[], allRequirements: RequirementWithGroupId[]): number => {
    //     const relatedGroups = allGroups.filter((group) => group.section_id === sectionId);
    //     const relatedRequirements = allRequirements.filter((requirement) =>
    //         relatedGroups.some((group) => group.id === requirement.group_id)
    //     );
    //     return PRICE_PER_REQUIREMENT_IN_EURO * relatedRequirements.length;
    // };

    // const getPriceForGroup = (groupId: string, allRequirements: RequirementWithGroupId[]): number => {
    //     const relatedRequirements = allRequirements.filter(
    //         (requirement) => requirement.group_id === groupId
    //     );

    //     return PRICE_PER_REQUIREMENT_IN_EURO * relatedRequirements.length;
    // };

    const steps = [
        {
            title: "Regulatory Framework",
            content: (
                <div className="pb-2">
                    <Typography textSize="h6" className="mb-4">Select Regulatory Framework</Typography>
                    <Typography className="my-4 leading-6" color="secondary" >Select the regulatory framework you wish to validate your documents against</Typography>
                    <Select
                        showSearch
                        value={selectedFramework}
                        onChange={setSelectedFramework}
                        options={frameworks.map((framework) => ({
                            label: formatRegulatoryFramework(framework.id),
                            value: framework.id,
                        }))}
                        style={{ width: "100%" }}
                        placeholder="Select Regulatory Framework"
                    />
                    <Typography className="my-4 leading-6" color="secondary">{selectedFramework ? frameworks.find((standard) => standard.id === selectedFramework)?.description : ""}</Typography>
                </div>
            ),
        },
        {
            title: "Sections",
            content: (
                <div>
                    <Typography textSize="h6" className="mb-4">Select Sections</Typography>
                    <Typography className="my-4 leading-6" color="secondary" >As default LumiDocs divides the analysis into {sections.length} sections related to {formatRegulatoryFramework(selectedFramework)}. If you are only interested in a subset of these sections, you can select them below.</Typography>
                    <SelectSections
                        sections={sections.map((section) => ({
                            id: section.id,
                            name: section.description,
                            price_for_section: getPriceForSection(section.id, allRequirementGroups, allRequirements),
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
                        Based on your selected sections, LumiDocs has identified {requirementGroups.length} requirement groups. You can select a subset of these groups to include in the report below.
                    </Typography>
                    <SelectRequirementGroups
                        requirementGroups={requirementGroups.map((group) => ({
                            id: group.id,
                            name: group.name,
                            price_for_group: getPriceForGroup(group.id, allRequirements)
                        }))}
                    />
                </div>
            ),
        },
        {
            title: "Documents",
            content: (
                <div>
                    <Typography textSize="h6" className="mb-4">Select Documents</Typography>
                    <Typography className="my-4 leading-6" color="secondary">LumiDocs will read through all the available documents to identify the most relevant information. However, if you have conflicting versions or ambigious information (e.g. several products or trials), you can select specific documents to validate against {formatRegulatoryFramework(selectedFramework)} below.</Typography>
                    <SelectDocuments
                        documents={files.map((file) => ({
                            id: file.id,
                            name: file.title,
                            number: file.number,
                        }))}
                    />
                </div>
            ),
        },
        {
            title: "Payment",
            content: (
                <div>
                    <EmbeddedPaymentForm quantity={selectedRequirements.length} />
                </div>
            ),
        },
    ];

    const next = () => {
        setCurrentStep(currentStep + 1);
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    // const handleReportCreation = async () => {

    //     if (!wasmModule) {
    //         api.error({
    //             message: "Error",
    //             description: "WASM module is not loaded. Please try again.",
    //         });
    //         return;
    //     }

    //     // Initialize filter object with all properties as undefined
    //     const filter = {
    //         sections_to_include: selectedSections.length > 0 ? selectedSections : undefined,
    //         requirements_to_include: requirementIds.length > 0 ? requirementIds : undefined,
    //         requirement_groups_to_include: requrementGroupIds.length > 0 ? requrementGroupIds : undefined,
    //         document_numbers_to_include: selectedDocumentNumbers.length > 0 ? selectedDocumentNumbers : undefined,
    //     };

    //     const input = {
    //         regulatory_framework: selectedFramework as RegulatoryFramework,
    //         filter,
    //     };

    //     let errorResponse: string = ""

    //     try {
    //         // Set the button to loading state
    //         setIsSubmittingReport(true)

    //         // Call the WASM module's create report function
    //         const response = await wasmModule.create_report(input);

    //         errorResponse = response.error?.message || ""

    //         console.log("RESPONSE!!!", response)
    //         if (response.error) {
    //             throw new Error(response.error.message);
    //         }

    //         // Notify success
    //         api.success({
    //             message: "Success",
    //             description: "The report was successfully created. Please allow 24 hours processing time.",
    //             placement: "topRight"
    //         });

    //         // Clear the state and close the modal
    //         setSelectedFramework("mdr");
    //         setSelectedSections([]);
    //         setSelectedDocumentNumbers([]);
    //         setCurrentStep(0);
    //         onReportSubmitted()
    //     } catch (error) {
    //         // Notify failure
    //         api.error({
    //             message: "Error",
    //             description: errorResponse || "Failed to create the report. Please try again.",
    //         });
    //     } finally {
    //         // Reset the loading state of the button
    //         setIsSubmittingReport(false)
    //     }
    // };

    const validationResult = validateReportInput();

    return (
        <div className="pt-4">
            {contextHolder}

            <Steps current={currentStep} className="mb-6" size="small">
                {steps.map((step, index) => (
                    <Step key={index} title={step.title} />
                ))}
            </Steps>

            <div className="mb-4">{steps[currentStep].content}</div>

            <div className="flex justify-between">
                <Button disabled={currentStep === 0} onClick={prev}>
                    Back
                </Button>
                {currentStep === steps.length - 2 && (
                    validationResult.error ? <div className="bg-red-50 text-red-500 p-2 rounded-md">To create a report you must select at least 1 section, 1 group, and 1 document</div> : null
                )}
                {currentStep < steps.length - 1 && (
                    <Button type="primary" onClick={next} disabled={validationResult.error && currentStep === steps.length - 2}>
                        Next
                    </Button>
                )}

            </div>
        </div>
    );
};

export default ReportCreator;
