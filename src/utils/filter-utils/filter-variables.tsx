import type {
    DevelopmentLifeCyclePhase,
    QmsMaturityLevel,
    TrialLifeCyclePhase,
    SoftwareLifeCyclePhase,
} from '@wasm';

export const DEVELOPMENT_LIFECYCLE_PHASES: DevelopmentLifeCyclePhase[] = [
    'concept_and_feasibility',
    'design_and_development',
    'verification_and_validation',
    'regulatory_submission_and_review',
    'manufacturing',
    'post_market_surveillance'
] as const;

export const QMS_MATURITY_LEVELS: QmsMaturityLevel[] = [
    'non_existent',
    'ad_hoc',
    'developing',
    'implemented',
    'certification_ready',
    'certified',
    'established',
    'measured',
    'optimizing',
    'undetermined'
] as const;

export const TRIAL_LIFECYCLE_PHASES: TrialLifeCyclePhase[] = [
    'planning',
    'site_selection',
    'submission',
    'initiation',
    'enrollment',
    'conduct',
    'closeout',
    'analysis',
    'undetermined'
] as const;

export const SOFTWARE_LIFECYCLE_PHASE: SoftwareLifeCyclePhase[] = [
    'not_applicable',
    'development_planning',
    'requirements_analysis',
    'architectural_design',
    'detailed_design',
    'unit_implementation_and_verification',
    'integration_and_integration_testing',
    'system_testing',
    'software_release',
    'problem_resolution',
    'undetermined'
] as const;
