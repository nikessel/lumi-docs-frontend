import type {
    RegulatoryFramework,
    Device,
    DevelopmentLifeCyclePhase,
    QmsMaturityLevel,
    ManagesCustomerProperty,
    IncludesSterileDevices,
    IncludesImplantableDevices,
    PerformsRework,
    PerformsPostMarketActivities,
    PerformsServicing,
    PerformsInstallation,
    PerformsDesignAndDevelopment,
    TrialLifeCyclePhase,
    DevelopmentStage,
    DeviceRiskLevel,
    DeviceType,
    IsFirstInHuman,
    ProvidesSubjectCompensation,
    HasControlGroup,
    IsMulticenter,
    InvestigationType,
    EnrollsVulnerablePopulations,
    IsLongTermInvestigation,
    MarketStatus,
    InformationForSafetyUsage,
    PerformsManufacturing,
    DeviceTrainingRequirements,
    SoftwareRole,
    SoftwareSafetyClassification,
    UoupComponentsStatus,
    SoftwareLifeCyclePhase,
    Company,
    Trial
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

export const MANAGES_CUSTOMER_PROPERTY: ManagesCustomerProperty[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const INCLUDES_STERILE_DEVICES: IncludesSterileDevices[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const INCLUDES_IMPLANTABLE_DEVICES: IncludesImplantableDevices[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const PERFORMS_REWORK: PerformsRework[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const PERFORMS_POST_MARKET_ACTIVITIES: PerformsPostMarketActivities[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const PERFORMS_SERVICING: PerformsServicing[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const PERFORMS_INSTALLATION: PerformsInstallation[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const PERFORMS_DESIGN_AND_DEVELOPMENT: PerformsDesignAndDevelopment[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const PERFORMS_MANUFACTURING: PerformsManufacturing[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const ISO_13485_KEY_VARIABLES = {
    QMS_MATURITY_LEVELS,
    MANAGES_CUSTOMER_PROPERTY,
    INCLUDES_STERILE_DEVICES,
    INCLUDES_IMPLANTABLE_DEVICES,
    PERFORMS_REWORK,
    PERFORMS_POST_MARKET_ACTIVITIES,
    PERFORMS_SERVICING,
    PERFORMS_INSTALLATION,
    PERFORMS_DESIGN_AND_DEVELOPMENT
} as const;

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

export const DEVELOPMENT_STAGES: DevelopmentStage[] = [
    'early_feasibility',
    'first_in_human',
    'pivotal',
    'post_market',
    'undetermined'
] as const;

export const DEVICE_RISK_LEVELS: DeviceRiskLevel[] = [
    'low',
    'medium',
    'high',
    'undetermined'
] as const;

export const DEVICE_TYPES: DeviceType[] = [
    'implantable',
    'wearable',
    'diagnostic',
    'software',
    'other',
    'undetermined'
] as const;

export const IS_FIRST_IN_HUMAN: IsFirstInHuman[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const PROVIDES_SUBJECT_COMPENSATION: ProvidesSubjectCompensation[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const HAS_CONTROL_GROUP: HasControlGroup[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const IS_MULTICENTER: IsMulticenter[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const INVESTIGATION_TYPES: InvestigationType[] = [
    'interventional',
    'observational',
    'registry',
    'post_market',
    'undetermined'
] as const;

export const ENROLLS_VULNERABLE_POPULATIONS: EnrollsVulnerablePopulations[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const IS_LONG_TERM_INVESTIGATION: IsLongTermInvestigation[] = [
    'no',
    'yes',
    'undetermined'
] as const;

export const ISO_14155_KEY_VARIABLES = {
    TRIAL_LIFECYCLE_PHASES,
    DEVELOPMENT_STAGES,
    DEVICE_RISK_LEVELS,
    DEVICE_TYPES,
    IS_FIRST_IN_HUMAN,
    PROVIDES_SUBJECT_COMPENSATION,
    HAS_CONTROL_GROUP,
    IS_MULTICENTER,
    INVESTIGATION_TYPES,
    ENROLLS_VULNERABLE_POPULATIONS,
    IS_LONG_TERM_INVESTIGATION
} as const;

export const MARKET_STATUS: MarketStatus[] = [
    'not_launched',
    'pre_market',
    'on_market',
    'post_market',
    'undetermined'
] as const;

export const INFORMATION_FOR_SAFETY_USAGE: InformationForSafetyUsage[] = [
    'none',
    'minor',
    'significant',
    'primary',
    'undetermined'
] as const;

export const TRAINING_REQUIREMENTS: DeviceTrainingRequirements[] = [
    'none',
    'basic_instructions',
    'structured_training',
    'certification_required',
    'periodic_retraining',
    'undetermined'
] as const;

export const SOFTWARE_ROLE: SoftwareRole[] = [
    'minor',
    'important',
    'core',
    'only'
] as const;

export const SOFTWARE_SAFETY_CLASSIFICATION: SoftwareSafetyClassification[] = [
    'a',
    'b',
    'c',
    'undetermined'
] as const;

export const UOUP_COMPONENTS: UoupComponentsStatus[] = [
    'none',
    'minor',
    'significant',
    'primary',
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

export const ISO_14971_KEY_VARIABLES = {
    QMS_MATURITY_LEVELS,
    MARKET_STATUS,
    DEVELOPMENT_LIFECYCLE_PHASES,
    PERFORMS_MANUFACTURING,
    INFORMATION_FOR_SAFETY_USAGE,
} as const;

export const ISO_62366_KEY_VARIABLES = {
    DEVELOPMENT_LIFECYCLE_PHASES,
    INFORMATION_FOR_SAFETY_USAGE,
    TRAINING_REQUIREMENTS,
    SOFTWARE_ROLE,
    SOFTWARE_SAFETY_CLASSIFICATION,
    UOUP_COMPONENTS
} as const;

export const ISO_62304_KEY_VARIABLES = {
    SOFTWARE_LIFECYCLE_PHASE,
    SOFTWARE_SAFETY_CLASSIFICATION,
    DEVELOPMENT_LIFECYCLE_PHASES
} as const;

export type Phase = typeof DEVELOPMENT_LIFECYCLE_PHASES[number];

// Define specific input types for each regulatory framework
export type Iso14971Input = {
    regulatoryFramework: 'iso14971';
    device: Device;
    company: Company;
};

export type Iso14155Input = {
    regulatoryFramework: 'iso14155';
    trial: Trial;
};

export type Iso13485Input = {
    regulatoryFramework: 'iso13485';
    company: Company;
};

export type Iso62304Input = {
    regulatoryFramework: 'iec62304';
    device: Device;
};

export type Iso62366Input = {
    regulatoryFramework: 'iec62366';
    device: Device;
};