// import type * as WasmModule from "@wasm";
// import type { Description, Trial, TrialLifeCyclePhase, DevelopmentStage, DeviceRiskLevel, DeviceType, IsFirstInHuman, ProvidesSubjectCompensation, HasControlGroup, IsMulticenter, InvestigationType, EnrollsVulnerablePopulations, IsLongTermInvestigation } from '@wasm';
// import { getDefaultSelection } from '@/utils/filter-utils';

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

// interface VariableImpact {
//     currentValue: string;
//     possibleValues: {
//         value: string;
//         uniqueRequirements: string[];
//         totalRequirements: number;
//     }[];
// }

// interface Iso14155ImpactAnalysis {
//     allUniqueRequirements: string[];
//     variableImpact: Record<keyof typeof ISO_14155_KEY_VARIABLES, VariableImpact>;
// }

// export const analyzeIso14155Impact = async (
//     wasmModule: typeof WasmModule,
//     trial: Trial
// ): Promise<Iso14155ImpactAnalysis> => {
//     console.log('[ISO14155_DEBUG] Starting ISO 14155 impact analysis');
//     console.log('[ISO14155_DEBUG] Input trial description:', trial.description);

//     // First get the default selection as-is
//     const baseResult = await getDefaultSelection(wasmModule, [
//         { trial: trial.description }
//     ], 'iso14155');

//     console.log('[ISO14155_DEBUG] Base result:', baseResult);

//     let allUniqueRequirements: string[] = [];
//     if (!baseResult.error) {
//         allUniqueRequirements = baseResult.requirements;
//         console.log('[ISO14155_DEBUG] Initial requirements:', allUniqueRequirements);
//     } else {
//         console.error('[ISO14155_DEBUG] Error in base result:', baseResult.error);
//     }

//     // Map the key to the correct nested property
//     const keyToPropertyMap: Record<keyof typeof ISO_14155_KEY_VARIABLES, string> = {
//         TRIAL_LIFECYCLE_PHASES: 'basic_info.lifecycle_phase',
//         DEVELOPMENT_STAGES: 'basic_info.development_stage',
//         DEVICE_RISK_LEVELS: 'device_info.risk_level',
//         DEVICE_TYPES: 'device_info.device_type',
//         IS_FIRST_IN_HUMAN: 'design_info.is_first_in_human',
//         PROVIDES_SUBJECT_COMPENSATION: 'financial_info.provides_subject_compensation',
//         HAS_CONTROL_GROUP: 'design_info.has_control_group',
//         IS_MULTICENTER: 'design_info.is_multicenter',
//         INVESTIGATION_TYPES: 'design_info.investigation_type',
//         ENROLLS_VULNERABLE_POPULATIONS: 'population_info.enrolls_vulnerable_populations',
//         IS_LONG_TERM_INVESTIGATION: 'design_info.is_long_term_investigation'
//     };

//     // Helper function to create a modified trial description
//     const createModifiedTrial = (key: keyof typeof ISO_14155_KEY_VARIABLES, value: any) => {
//         // Create a deep copy of the trial description
//         const modifiedTrial = JSON.parse(JSON.stringify(trial.description));

//         // Set the value in the nested structure
//         const propertyPath = keyToPropertyMap[key];
//         const pathParts = propertyPath.split('.');
//         let current: any = modifiedTrial;

//         // Navigate to the parent object
//         for (let i = 0; i < pathParts.length - 1; i++) {
//             const part = pathParts[i];
//             if (!current[part]) {
//                 current[part] = {};
//             }
//             current = current[part];
//         }

//         // Set the value at the final path
//         const finalPart = pathParts[pathParts.length - 1];
//         current[finalPart] = value;

//         return modifiedTrial;
//     };

//     // Initialize variable impact tracking
//     const variableImpact: Record<keyof typeof ISO_14155_KEY_VARIABLES, VariableImpact> = {} as any;

//     for (const [key] of Object.entries(ISO_14155_KEY_VARIABLES)) {
//         const propertyPath = keyToPropertyMap[key as keyof typeof ISO_14155_KEY_VARIABLES];
//         const pathParts = propertyPath.split('.');
//         let current: any = trial.description;

//         // Navigate to the value
//         for (let i = 0; i < pathParts.length - 1; i++) {
//             const part = pathParts[i];
//             if (!current[part]) {
//                 current = undefined;
//                 break;
//             }
//             current = current[part];
//         }

//         const finalPart = pathParts[pathParts.length - 1];
//         const currentValue = current ? current[finalPart] : undefined;

//         variableImpact[key as keyof typeof ISO_14155_KEY_VARIABLES] = {
//             currentValue: currentValue || 'undetermined',
//             possibleValues: []
//         };
//     }

//     // Try each key variable
//     for (const [key, values] of Object.entries(ISO_14155_KEY_VARIABLES)) {
//         for (const value of values) {
//             // Skip the current value as we already have that in our base result
//             const propertyPath = keyToPropertyMap[key as keyof typeof ISO_14155_KEY_VARIABLES];
//             const pathParts = propertyPath.split('.');
//             let current: any = trial.description;

//             // Navigate to the value
//             for (let i = 0; i < pathParts.length - 1; i++) {
//                 const part = pathParts[i];
//                 if (!current[part]) {
//                     current = undefined;
//                     break;
//                 }
//                 current = current[part];
//             }

//             const finalPart = pathParts[pathParts.length - 1];
//             const currentValue = current ? current[finalPart] : undefined;

//             if (currentValue === value) {
//                 continue;
//             }

//             const modifiedTrial = createModifiedTrial(key as keyof typeof ISO_14155_KEY_VARIABLES, value);

//             try {
//                 const result = await getDefaultSelection(wasmModule, [
//                     { trial: modifiedTrial }
//                 ], 'iso14155');

//                 if (!result.error) {
//                     const newUniqueRequirements = result.requirements.filter(req => !allUniqueRequirements.includes(req));
//                     allUniqueRequirements = [...allUniqueRequirements, ...newUniqueRequirements];

//                     // Track the impact of this value
//                     variableImpact[key as keyof typeof ISO_14155_KEY_VARIABLES].possibleValues.push({
//                         value,
//                         uniqueRequirements: newUniqueRequirements,
//                         totalRequirements: result.requirements.length
//                     });
//                 }
//             } catch (err) {
//                 console.error(`[ISO14155_DEBUG] Error fetching requirements for ${key} with value ${value}:`, err);
//             }
//         }
//     }

//     return {
//         allUniqueRequirements,
//         variableImpact
//     };
// };
