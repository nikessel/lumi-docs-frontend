// import React, { useEffect } from 'react';
// import Typography from "../../common/typography";
// import SelectSections from "./section-selector";
// import { useCreateReportStore } from "@/stores/create-report-store";
// import { useSectionsContext } from "@/contexts/sections-context";
// import { useRequirementGroupsContext } from "@/contexts/requirement-group-context";
// import { useRequirementsContext } from "@/contexts/requirements-context";
// import { useWasm } from "@/contexts/wasm-context/WasmProvider";
// import { getPriceForSection } from "@/utils/payment";
// import { useRequirementPriceContext } from "@/contexts/price-context/use-requirement-price-context";
// import { RegulatoryFramework } from "@wasm";
// import { RequirementGroupWithSectionId } from "@/hooks/requirement-group-hooks";

// export const ReportContentDefaultSelection: React.FC = () => {
//     const {
//         selectedFramework,
//         setSelectedSections,
//         setSelectedRequirementGroups,
//         setSelectedRequirements,
//     } = useCreateReportStore();

//     const { sectionsForRegulatoryFramework } = useSectionsContext();
//     const { requirementGroupsBySectionId } = useRequirementGroupsContext();
//     const { requirementsByGroupId } = useRequirementsContext();
//     const { wasmModule } = useWasm();
//     const { userPrice, defaultPrice } = useRequirementPriceContext();

//     useEffect(() => {
//         const fetchDefaultSelections = async () => {
//             if (!wasmModule || !selectedFramework) return;

//             try {
//                 const response = await wasmModule.get_default_selected_requirement_ids({ input: selectedFramework as RegulatoryFramework });
//                 if (response.output?.output) {
//                     const defaultRequirements = response.output.output;
//                     console.log("response13123123123", response);

//                     setSelectedRequirements(defaultRequirements);

//                     // Find associated groups and sections for the default requirements
//                     const groupsResponse = await wasmModule.get_requirement_groups_by_section({ input: defaultRequirements[0] });
//                     if (groupsResponse.output?.output) {
//                         const groups: RequirementGroupWithSectionId[] = groupsResponse.output.output.map(group => ({
//                             ...group,
//                             section_id: defaultRequirements[0]
//                         }));
//                         setSelectedRequirementGroups(groups.map(group => group.id));
//                         setSelectedSections(groups.map(group => group.section_id));
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error fetching default selections:", error);
//             }
//         };

//         fetchDefaultSelections();
//     }, [wasmModule, selectedFramework, setSelectedRequirements, setSelectedSections, setSelectedRequirementGroups]);

//     return (
//         <div>
//             <Typography textSize="h6" className="mb-4">Select Report Content</Typography>
//             <Typography className="my-4 leading-6" color="secondary">
//                 Select the sections and requirements you want to include in your report.
//             </Typography>
//             <SelectSections
//                 sections={(sectionsForRegulatoryFramework[selectedFramework] || []).map(section => ({
//                     id: section.id,
//                     name: section.description,
//                     price_for_section: getPriceForSection(
//                         section.id,
//                         requirementGroupsBySectionId,
//                         requirementsByGroupId,
//                         userPrice ? userPrice : defaultPrice
//                     ),
//                 }))}
//             />
//         </div>
//     );
// };

// export default ReportContentDefaultSelection;
