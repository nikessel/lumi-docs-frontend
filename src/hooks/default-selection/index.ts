// import { useState, useEffect } from 'react';
// import type {
//     RegulatoryFramework,
//     Device,
//     DevelopmentLifeCyclePhase,
//     QmsMaturityLevel,
//     ManagesCustomerProperty,
//     IncludesSterileDevices,
//     IncludesImplantableDevices,
//     PerformsRework,
//     PerformsPostMarketActivities,
//     PerformsServicing,
//     PerformsInstallation,
//     PerformsDesignAndDevelopment,
//     TrialLifeCyclePhase,
//     DevelopmentStage,
//     DeviceRiskLevel,
//     DeviceType,
//     IsFirstInHuman,
//     ProvidesSubjectCompensation,
//     HasControlGroup,
//     IsMulticenter,
//     InvestigationType,
//     EnrollsVulnerablePopulations,
//     IsLongTermInvestigation,
//     MarketStatus,
//     InformationForSafetyUsage,
//     PerformsManufacturing,
//     DeviceTrainingRequirements,
//     SoftwareRole,
//     SoftwareSafetyClassification,
//     UoupComponentsStatus,
//     SoftwareLifeCyclePhase,
//     Company,
//     Trial
// } from '@wasm';
// import type * as WasmModule from "@wasm";
// import { getDefaultSelection } from '@/utils/filter-utils';
// import { useRequirementsContext } from '@/contexts/requirements-context';
// import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
// import { useCreateReportStore } from '@/stores/create-report-store';

// const DEVELOPMENT_LIFECYCLE_PHASES: DevelopmentLifeCyclePhase[] = [
//     'concept_and_feasibility',
//     'design_and_development',
//     'verification_and_validation',
//     'regulatory_submission_and_review',
//     'manufacturing',
//     'post_market_surveillance'
// ] as const;

// const QMS_MATURITY_LEVELS: QmsMaturityLevel[] = [
//     'non_existent',
//     'ad_hoc',
//     'developing',
//     'implemented',
//     'certification_ready',
//     'certified',
//     'established',
//     'measured',
//     'optimizing',
//     'undetermined'
// ] as const;

// const MANAGES_CUSTOMER_PROPERTY: ManagesCustomerProperty[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const INCLUDES_STERILE_DEVICES: IncludesSterileDevices[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const INCLUDES_IMPLANTABLE_DEVICES: IncludesImplantableDevices[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const PERFORMS_REWORK: PerformsRework[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const PERFORMS_POST_MARKET_ACTIVITIES: PerformsPostMarketActivities[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const PERFORMS_SERVICING: PerformsServicing[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const PERFORMS_INSTALLATION: PerformsInstallation[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const PERFORMS_DESIGN_AND_DEVELOPMENT: PerformsDesignAndDevelopment[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const PERFORMS_MANUFACTURING: PerformsManufacturing[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const ISO_13485_KEY_VARIABLES = {
//     QMS_MATURITY_LEVELS,
//     MANAGES_CUSTOMER_PROPERTY,
//     INCLUDES_STERILE_DEVICES,
//     INCLUDES_IMPLANTABLE_DEVICES,
//     PERFORMS_REWORK,
//     PERFORMS_POST_MARKET_ACTIVITIES,
//     PERFORMS_SERVICING,
//     PERFORMS_INSTALLATION,
//     PERFORMS_DESIGN_AND_DEVELOPMENT
// } as const;

// const TRIAL_LIFECYCLE_PHASES: TrialLifeCyclePhase[] = [
//     'planning',
//     'site_selection',
//     'submission',
//     'initiation',
//     'enrollment',
//     'conduct',
//     'closeout',
//     'analysis',
//     'undetermined'
// ] as const;

// const DEVELOPMENT_STAGES: DevelopmentStage[] = [
//     'early_feasibility',
//     'first_in_human',
//     'pivotal',
//     'post_market',
//     'undetermined'
// ] as const;

// const DEVICE_RISK_LEVELS: DeviceRiskLevel[] = [
//     'low',
//     'medium',
//     'high',
//     'undetermined'
// ] as const;

// const DEVICE_TYPES: DeviceType[] = [
//     'implantable',
//     'wearable',
//     'diagnostic',
//     'software',
//     'other',
//     'undetermined'
// ] as const;

// const IS_FIRST_IN_HUMAN: IsFirstInHuman[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const PROVIDES_SUBJECT_COMPENSATION: ProvidesSubjectCompensation[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const HAS_CONTROL_GROUP: HasControlGroup[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const IS_MULTICENTER: IsMulticenter[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const INVESTIGATION_TYPES: InvestigationType[] = [
//     'interventional',
//     'observational',
//     'registry',
//     'post_market',
//     'undetermined'
// ] as const;

// const ENROLLS_VULNERABLE_POPULATIONS: EnrollsVulnerablePopulations[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const IS_LONG_TERM_INVESTIGATION: IsLongTermInvestigation[] = [
//     'no',
//     'yes',
//     'undetermined'
// ] as const;

// const ISO_14155_KEY_VARIABLES = {
//     TRIAL_LIFECYCLE_PHASES,
//     DEVELOPMENT_STAGES,
//     DEVICE_RISK_LEVELS,
//     DEVICE_TYPES,
//     IS_FIRST_IN_HUMAN,
//     PROVIDES_SUBJECT_COMPENSATION,
//     HAS_CONTROL_GROUP,
//     IS_MULTICENTER,
//     INVESTIGATION_TYPES,
//     ENROLLS_VULNERABLE_POPULATIONS,
//     IS_LONG_TERM_INVESTIGATION
// } as const;

// const MARKET_STATUS: MarketStatus[] = [
//     'not_launched',
//     'pre_market',
//     'on_market',
//     'post_market',
//     'undetermined'
// ] as const;

// const INFORMATION_FOR_SAFETY_USAGE: InformationForSafetyUsage[] = [
//     'none',
//     'minor',
//     'significant',
//     'primary',
//     'undetermined'
// ] as const;

// const TRAINING_REQUIREMENTS: DeviceTrainingRequirements[] = [
//     'none',
//     'basic_instructions',
//     'structured_training',
//     'certification_required',
//     'periodic_retraining',
//     'undetermined'
// ] as const;

// const SOFTWARE_ROLE: SoftwareRole[] = [
//     'minor',
//     'important',
//     'core',
//     'only'
// ] as const;

// const SOFTWARE_SAFETY_CLASSIFICATION: SoftwareSafetyClassification[] = [
//     'a',
//     'b',
//     'c',
//     'undetermined'
// ] as const;

// const UOUP_COMPONENTS: UoupComponentsStatus[] = [
//     'none',
//     'minor',
//     'significant',
//     'primary',
//     'undetermined'
// ] as const;

// const SOFTWARE_LIFECYCLE_PHASE: SoftwareLifeCyclePhase[] = [
//     'not_applicable',
//     'development_planning',
//     'requirements_analysis',
//     'architectural_design',
//     'detailed_design',
//     'unit_implementation_and_verification',
//     'integration_and_integration_testing',
//     'system_testing',
//     'software_release',
//     'problem_resolution',
//     'undetermined'
// ] as const;

// const ISO_14971_KEY_VARIABLES = {
//     QMS_MATURITY_LEVELS,
//     MARKET_STATUS,
//     DEVELOPMENT_LIFECYCLE_PHASES,
//     PERFORMS_MANUFACTURING,
//     INFORMATION_FOR_SAFETY_USAGE,
// } as const;

// const ISO_62366_KEY_VARIABLES = {
//     DEVELOPMENT_LIFECYCLE_PHASES,
//     INFORMATION_FOR_SAFETY_USAGE,
//     TRAINING_REQUIREMENTS,
//     SOFTWARE_ROLE,
//     SOFTWARE_SAFETY_CLASSIFICATION,
//     UOUP_COMPONENTS
// } as const;

// const ISO_62304_KEY_VARIABLES = {
//     SOFTWARE_LIFECYCLE_PHASE,
//     SOFTWARE_SAFETY_CLASSIFICATION,
//     DEVELOPMENT_LIFECYCLE_PHASES
// } as const;

// type Phase = typeof DEVELOPMENT_LIFECYCLE_PHASES[number];

// // Define specific input types for each regulatory framework
// type Iso14971Input = {
//     regulatoryFramework: 'iso14971';
//     device: Device;
//     company: Company;
// };

// type Iso14155Input = {
//     regulatoryFramework: 'iso14155';
//     trial: Trial;
// };

// type Iso13485Input = {
//     regulatoryFramework: 'iso13485';
//     company: Company;
// };

// type Iso62304Input = {
//     regulatoryFramework: 'iec62304';
//     device: Device;
// };

// type Iso62366Input = {
//     regulatoryFramework: 'iec62366';
//     device: Device;
// };

// // Union type of all possible input combinations
// type DefaultSelectionInput =
//     | Iso14971Input
//     | Iso14155Input
//     | Iso13485Input
//     | Iso62304Input
//     | Iso62366Input;

// interface RequirementsByPhase {
//     allRequirements: string[];
//     requirementsByPhase: Record<Phase, string[]>;
//     variableImpact?: {
//         [key: string]: {
//             currentValue: string;
//             possibleValues: {
//                 value: string;
//                 uniqueRequirements: string[];
//                 totalRequirements: number;
//             }[];
//         };
//     };
// }

// const createEmptyRequirementsByPhase = (): Record<Phase, string[]> => {
//     return DEVELOPMENT_LIFECYCLE_PHASES.reduce((acc, phase) => {
//         acc[phase] = [];
//         return acc;
//     }, {} as Record<Phase, string[]>);
// };

// export const useDefaultSelectionFetcher = ({
//     wasmModule,
//     ...input
// }: {
//     wasmModule: typeof WasmModule | null;
// } & DefaultSelectionInput): RequirementsByPhase => {
//     const [requirementsByPhase, setRequirementsByPhase] = useState<RequirementsByPhase>({
//         allRequirements: [],
//         requirementsByPhase: createEmptyRequirementsByPhase()
//     });

//     const { setSelectedSections, setSelectedRequirementGroups, setSelectedRequirements } = useCreateReportStore();
//     const { requirementsByGroupId } = useRequirementsContext();
//     const { requirementGroupsBySectionId } = useRequirementGroupsContext();

//     useEffect(() => {
//         const fetchRequirements = async () => {
//             if (!wasmModule) return;

//             const phasesRequirements = createEmptyRequirementsByPhase();
//             let allUniqueRequirements: string[] = [];
//             let variableImpact: RequirementsByPhase['variableImpact'] = {};

//             // Handle different frameworks differently
//             switch (input.regulatoryFramework) {
//                 case 'iso14971': {
//                     const result = await getDefaultSelection(wasmModule, [
//                         { device: input.device.description },
//                         { company: input.company.description }
//                     ], input.regulatoryFramework);

//                     if (!result.error) {
//                         allUniqueRequirements = result.requirements;
//                     }
//                     break;
//                 }

//                 case 'iso14155': {
//                     console.log('[ISO14155_DEBUG] Starting ISO 14155 case');
//                     console.log('[ISO14155_DEBUG] Input trial description:', input.trial.description);

//                     // First get the default selection as-is
//                     const baseResult = await getDefaultSelection(wasmModule, [
//                         { trial: input.trial.description }
//                     ], input.regulatoryFramework);

//                     console.log('[ISO14155_DEBUG] Base result:', baseResult);

//                     if (!baseResult.error) {
//                         allUniqueRequirements = baseResult.requirements;
//                         console.log('[ISO14155_DEBUG] Initial requirements:', allUniqueRequirements);
//                     } else {
//                         console.error('[ISO14155_DEBUG] Error in base result:', baseResult.error);
//                     }

//                     // Now try each key variable with different values
//                     const trialDescription = input.trial.description;
//                     console.log('[ISO14155_DEBUG] Trial description:', trialDescription);

//                     // Map the key to the correct nested property
//                     const keyToPropertyMap: Record<keyof typeof ISO_14155_KEY_VARIABLES, string> = {
//                         TRIAL_LIFECYCLE_PHASES: 'basic_info.lifecycle_phase',
//                         DEVELOPMENT_STAGES: 'basic_info.development_stage',
//                         DEVICE_RISK_LEVELS: 'device_info.risk_level',
//                         DEVICE_TYPES: 'device_info.device_type',
//                         IS_FIRST_IN_HUMAN: 'design_info.is_first_in_human',
//                         PROVIDES_SUBJECT_COMPENSATION: 'financial_info.provides_subject_compensation',
//                         HAS_CONTROL_GROUP: 'design_info.has_control_group',
//                         IS_MULTICENTER: 'design_info.is_multicenter',
//                         INVESTIGATION_TYPES: 'design_info.investigation_type',
//                         ENROLLS_VULNERABLE_POPULATIONS: 'population_info.enrolls_vulnerable_populations',
//                         IS_LONG_TERM_INVESTIGATION: 'design_info.is_long_term_investigation'
//                     };

//                     console.log('[ISO14155_DEBUG] Key to property map:', keyToPropertyMap);

//                     // Helper function to create a modified trial description
//                     const createModifiedTrial = (key: keyof typeof ISO_14155_KEY_VARIABLES, value: any) => {
//                         console.log(`[ISO14155_DEBUG] Creating modified trial for key: ${key}, value: ${value}`);

//                         // Create a deep copy of the trial description
//                         const modifiedTrial = JSON.parse(JSON.stringify(trialDescription));

//                         // Set the value in the nested structure
//                         const propertyPath = keyToPropertyMap[key];
//                         console.log(`[ISO14155_DEBUG] Property path: ${propertyPath}`);

//                         const pathParts = propertyPath.split('.');
//                         let current: any = modifiedTrial;

//                         // Navigate to the parent object
//                         for (let i = 0; i < pathParts.length - 1; i++) {
//                             const part = pathParts[i];
//                             console.log(`[ISO14155_DEBUG] Navigating to: ${part}`);

//                             // If the path part doesn't exist, create it
//                             if (!current[part]) {
//                                 current[part] = {};
//                             }
//                             current = current[part];
//                         }

//                         // Set the value at the final path
//                         const finalPart = pathParts[pathParts.length - 1];
//                         console.log(`[ISO14155_DEBUG] Setting ${finalPart} to ${value}`);
//                         current[finalPart] = value;

//                         console.log(`[ISO14155_DEBUG] Modified trial:`, modifiedTrial);
//                         return modifiedTrial;
//                     };

//                     // Initialize variable impact tracking
//                     for (const [key] of Object.entries(ISO_14155_KEY_VARIABLES)) {
//                         const propertyPath = keyToPropertyMap[key as keyof typeof ISO_14155_KEY_VARIABLES];
//                         const pathParts = propertyPath.split('.');
//                         let current: any = trialDescription;

//                         // Navigate to the value
//                         for (let i = 0; i < pathParts.length - 1; i++) {
//                             const part = pathParts[i];
//                             if (!current[part]) {
//                                 console.log(`[ISO14155_DEBUG] Warning: Path part ${part} does not exist in trial description`);
//                                 current = undefined;
//                                 break;
//                             }
//                             current = current[part];
//                         }

//                         const finalPart = pathParts[pathParts.length - 1];
//                         const currentValue = current ? current[finalPart] : undefined;

//                         console.log(`[ISO14155_DEBUG] Current value for ${key}:`, currentValue);
//                         console.log(`[ISO14155_DEBUG] Full path: ${propertyPath}`);
//                         console.log(`[ISO14155_DEBUG] Current object:`, current);

//                         variableImpact[key] = {
//                             currentValue,
//                             possibleValues: []
//                         };
//                     }

//                     console.log('[ISO14155_DEBUG] Variable impact initialized:', variableImpact);

//                     // Try each key variable
//                     for (const [key, values] of Object.entries(ISO_14155_KEY_VARIABLES)) {
//                         console.log(`\n[ISO14155_DEBUG] Processing key: ${key}`);
//                         console.log('[ISO14155_DEBUG] Available values:', values);

//                         for (const value of values) {
//                             // Skip the current value as we already have that in our base result
//                             const propertyPath = keyToPropertyMap[key as keyof typeof ISO_14155_KEY_VARIABLES];
//                             const pathParts = propertyPath.split('.');
//                             let current: any = trialDescription;

//                             // Navigate to the value
//                             for (let i = 0; i < pathParts.length - 1; i++) {
//                                 const part = pathParts[i];
//                                 if (!current[part]) {
//                                     console.log(`[ISO14155_DEBUG] Warning: Path part ${part} does not exist in trial description`);
//                                     current = undefined;
//                                     break;
//                                 }
//                                 current = current[part];
//                             }

//                             const finalPart = pathParts[pathParts.length - 1];
//                             const currentValue = current ? current[finalPart] : undefined;

//                             if (currentValue === value) {
//                                 console.log(`[ISO14155_DEBUG] Skipping ${value} as it's the current value`);
//                                 continue;
//                             }

//                             console.log(`[ISO14155_DEBUG] Trying value: ${value} for key: ${key}`);
//                             const modifiedTrial = createModifiedTrial(key as keyof typeof ISO_14155_KEY_VARIABLES, value);
//                             console.log(`[ISO14155_DEBUG] Modified trial:`, modifiedTrial);

//                             try {
//                                 const result = await getDefaultSelection(wasmModule, [
//                                     { trial: modifiedTrial }
//                                 ], input.regulatoryFramework);

//                                 console.log(`[ISO14155_DEBUG] Result for ${key} with value ${value}:`, result);

//                                 if (!result.error) {
//                                     const newUniqueRequirements = result.requirements.filter(req => !allUniqueRequirements.includes(req));
//                                     allUniqueRequirements = [...allUniqueRequirements, ...newUniqueRequirements];
//                                     console.log(`[ISO14155_DEBUG] Updated allUniqueRequirements:`, allUniqueRequirements);

//                                     // Track the impact of this value
//                                     variableImpact[key].possibleValues.push({
//                                         value,
//                                         uniqueRequirements: newUniqueRequirements,
//                                         totalRequirements: result.requirements.length
//                                     });
//                                     console.log(`[ISO14155_DEBUG] Updated variable impact for key:`, key, variableImpact[key]);
//                                 } else {
//                                     console.error(`[ISO14155_DEBUG] Error in result for ${key} with value ${value}:`, result.error);
//                                 }
//                             } catch (err) {
//                                 console.error(`[ISO14155_DEBUG] Error fetching requirements for ${key} with value ${value}:`, err);
//                             }
//                         }
//                     }

//                     console.log('[ISO14155_DEBUG] Final variable impact:', variableImpact);
//                     console.log('[ISO14155_DEBUG] Final allUniqueRequirements:', allUniqueRequirements);
//                     break;
//                 }

//                 case 'iso13485': {
//                     const result = await getDefaultSelection(wasmModule, [
//                         { company: input.company.description }
//                     ], input.regulatoryFramework);

//                     if (!result.error) {
//                         allUniqueRequirements = result.requirements;
//                     }
//                     break;
//                 }

//                 case 'iec62304':
//                 case 'iec62366': {
//                     const currentPhase = input.device.description.life_cycle_info.development_phase as Phase;
//                     const currentPhaseIndex = DEVELOPMENT_LIFECYCLE_PHASES.indexOf(currentPhase);

//                     if (currentPhaseIndex === -1) return;

//                     // Fetch requirements for all phases up to and including current phase
//                     for (let i = 0; i <= currentPhaseIndex; i++) {
//                         const phase = DEVELOPMENT_LIFECYCLE_PHASES[i];

//                         const phaseDevice = {
//                             device: {
//                                 ...input.device.description,
//                                 life_cycle_info: {
//                                     ...input.device.description.life_cycle_info,
//                                     development_phase: phase
//                                 }
//                             }
//                         };

//                         try {
//                             const result = await getDefaultSelection(wasmModule, [phaseDevice], input.regulatoryFramework);

//                             if (!result.error) {
//                                 const newUniqueRequirements = result.requirements.filter(req => !allUniqueRequirements.includes(req));
//                                 allUniqueRequirements = [...allUniqueRequirements, ...newUniqueRequirements];
//                                 phasesRequirements[phase] = newUniqueRequirements;
//                             }
//                         } catch (err) {
//                             console.error(`Error fetching requirements for phase ${phase}:`, err);
//                         }
//                     }
//                     break;
//                 }
//             }

//             // Update store with all unique requirements
//             setSelectedRequirements(allUniqueRequirements);

//             // Find and update requirement groups
//             const selectedRequirementGroups = new Set<string>();
//             Object.entries(requirementsByGroupId).forEach(([groupId, requirements]) => {
//                 if (requirements.some(req => allUniqueRequirements.includes(req.id))) {
//                     selectedRequirementGroups.add(groupId);
//                 }
//             });

//             // Find and update sections
//             const selectedSections = new Set<string>();
//             Object.entries(requirementGroupsBySectionId).forEach(([sectionId, groups]) => {
//                 if (groups.some(group => selectedRequirementGroups.has(group.id))) {
//                     selectedSections.add(sectionId);
//                 }
//             });

//             setSelectedSections(Array.from(selectedSections));
//             setSelectedRequirementGroups(Array.from(selectedRequirementGroups));

//             setRequirementsByPhase({
//                 allRequirements: allUniqueRequirements,
//                 requirementsByPhase: phasesRequirements,
//                 variableImpact
//             });
//         };

//         fetchRequirements();
//     }, [wasmModule, input, requirementsByGroupId, requirementGroupsBySectionId]);

//     return requirementsByPhase;
// };

// const validateInputCombination = (
//     framework: RegulatoryFramework,
//     device?: Device,
//     company?: Company,
//     trial?: Trial
// ): boolean => {
//     switch (framework) {
//         case 'iso14971':
//             return !!(device && company);
//         case 'iso14155':
//             return !!trial;
//         case 'iso13485':
//             return !!company;
//         case 'iec62304':
//         case 'iec62366':
//             return !!device;
//         default:
//             return false;
//     }
// };
