import React from "react";
import { Card, Typography, Spin, Input, Select } from "antd";
import type {
    DeviceDescription,
    TrialDescription,
    CompanyDescription,
    Company,
    QmsMaturityLevel,
    QualityCertification,
    HasFormalQualityPolicy,
    ConductsInternalAudits,
    DevelopmentLifeCyclePhase,
    TrialLifeCyclePhase,
    SoftwareLifeCyclePhase,
    DeviceRiskLevel,
    DevelopmentStage,
    RequiresTranslations,
    CustomizationLevel,
    InformationForSafetyUsage,
    EnergySource,
    SterilizationMethod,
    PerformsRework,
    ManagesCustomerProperty,
    IncludesImplantableDevices,
    IncludesSterileDevices,
    IsFirstGeneration,
    MarketStatus,
    DeviceTrainingRequirements,
    ContactDuration,
    InvasivenessLevel,
    DeviceClassification,
    DeviceComplexity,
    AutomationLevel,
    SoftwareDependency,
    UserInteractionLevel,
    IsSterile,
    OneTimeUsage,
    InvestigationType,
    IsFirstInHuman,
    IsEmergencyInvestigation,
    IsLongTermInvestigation,
    HasControlGroup,
    UsesRandomization,
    UsesBlinding,
    HasMultipleTreatmentGroups,
    HasInterimAnalyses,
    IsMulticenter,
    IsMultinational,
    SubjectToGdpr,
    EnrollsVulnerablePopulations,
    IncludesHealthyVolunteers,
    EnrollsSubjectsUnableToConsent,
    EnrollsSubjectsUnableToReadWrite,
    AllowsEmergencyEnrollment,
    ProvidesSubjectCompensation,
    CompensationStructure,
    HasSponsorInvestigatorRelationship,
    DeviceType,
    ContainsMedicinalSubstances,
    HasDeviceExpiryDate,
    SpecialDeviceHandlingRequired,
    TrialTrainingRequirements,
    UsesElectronicDataSystems,
    UsesSubjectDiaries,
    CollectsBiologicalSamples,
    PlansFutureSampleUse,
    ConsentRequiresTranslation,
    HasDataMonitoringCommittee,
    HasIndependentAssessmentMechanisms,
    HasAdditionalHealthcareArrangements,
    PerformsDesignAndDevelopment,
    PerformsManufacturing,
    PerformsServicing,
    PerformsInstallation,
    PerformsDistribution,
    PerformsPostMarketActivities,
    PerformsSupplierManagement,
    PerformsSterilizationActivities
} from "@wasm";

type DescriptionType = DeviceDescription | TrialDescription | CompanyDescription | Company;

interface DescriptionCardProps {
    description: DescriptionType;
    title: string;
    applicableFieldPaths?: Map<string, string[]>;
    isLoading?: boolean;
    onDescriptionChange?: (newDescription: DescriptionType) => void;
}

type EnumFieldMapping = {
    // Company-related enums
    quality_management_system_maturity: QmsMaturityLevel[];
    quality_certification: QualityCertification[];
    has_formal_quality_policy: HasFormalQualityPolicy[];
    conducts_internal_audits: ConductsInternalAudits[];
    performs_rework: PerformsRework[];
    manages_customer_property: ManagesCustomerProperty[];
    includes_implantable_devices: IncludesImplantableDevices[];
    includes_sterile_devices: IncludesSterileDevices[];
    performs_design_and_development: PerformsDesignAndDevelopment[];
    performs_manufacturing: PerformsManufacturing[];
    performs_servicing: PerformsServicing[];
    performs_installation: PerformsInstallation[];
    performs_distribution: PerformsDistribution[];
    performs_post_market_activities: PerformsPostMarketActivities[];
    performs_supplier_management: PerformsSupplierManagement[];
    performs_sterilization_activities: PerformsSterilizationActivities[];

    // Device-related enums
    is_first_generation: IsFirstGeneration[];
    market_status: MarketStatus[];
    training_requirements: DeviceTrainingRequirements[];
    contact_duration: ContactDuration[];
    invasiveness: InvasivenessLevel[];
    device_classification: DeviceClassification[];
    device_complexity: DeviceComplexity[];
    automation_level: AutomationLevel[];
    software_dependency: SoftwareDependency[];
    user_interaction_level: UserInteractionLevel[];
    is_sterile: IsSterile[];
    one_time_usage: OneTimeUsage[];
    energy_source: EnergySource[];
    sterilization_method: SterilizationMethod[];
    information_for_safety_usage: InformationForSafetyUsage[];
    development_lifecycle_phase: DevelopmentLifeCyclePhase[];
    software_lifecycle_phase: SoftwareLifeCyclePhase[];
    device_risk_level: DeviceRiskLevel[];

    // Trial-related enums
    lifecycle_phase: TrialLifeCyclePhase[];
    investigation_type: InvestigationType[];
    development_stage: DevelopmentStage[];
    is_first_in_human: IsFirstInHuman[];
    is_emergency_investigation: IsEmergencyInvestigation[];
    is_long_term_investigation: IsLongTermInvestigation[];
    has_control_group: HasControlGroup[];
    uses_randomization: UsesRandomization[];
    uses_blinding: UsesBlinding[];
    has_multiple_treatment_groups: HasMultipleTreatmentGroups[];
    has_interim_analyses: HasInterimAnalyses[];
    is_multicenter: IsMulticenter[];
    is_multinational: IsMultinational[];
    subject_to_gdpr: SubjectToGdpr[];
    enrolls_vulnerable_populations: EnrollsVulnerablePopulations[];
    includes_healthy_volunteers: IncludesHealthyVolunteers[];
    enrolls_subjects_unable_to_consent: EnrollsSubjectsUnableToConsent[];
    enrolls_subjects_unable_to_read_write: EnrollsSubjectsUnableToReadWrite[];
    allows_emergency_enrollment: AllowsEmergencyEnrollment[];
    provides_subject_compensation: ProvidesSubjectCompensation[];
    compensation_structure: CompensationStructure[];
    has_sponsor_investigator_relationship: HasSponsorInvestigatorRelationship[];
    device_type: DeviceType[];
    contains_medicinal_substances: ContainsMedicinalSubstances[];
    has_device_expiry_date: HasDeviceExpiryDate[];
    special_device_handling_required: SpecialDeviceHandlingRequired[];
    trial_training_requirements: TrialTrainingRequirements[];
    uses_electronic_data_systems: UsesElectronicDataSystems[];
    using_subject_diaries: UsesSubjectDiaries[];
    collects_biological_samples: CollectsBiologicalSamples[];
    plans_future_sample_use: PlansFutureSampleUse[];
    requires_translations: RequiresTranslations[];
    consent_requires_translation: ConsentRequiresTranslation[];
    has_data_monitoring_committee: HasDataMonitoringCommittee[];
    has_independent_assessment_mechanisms: HasIndependentAssessmentMechanisms[];
    has_additional_healthcare_arrangements: HasAdditionalHealthcareArrangements[];
};

const ENUM_FIELD_MAPPING: EnumFieldMapping = {
    // Company-related enums
    quality_management_system_maturity: ['non_existent', 'ad_hoc', 'developing', 'implemented', 'certification_ready', 'certified', 'established', 'measured', 'optimizing', 'undetermined'] as QmsMaturityLevel[],
    quality_certification: ['none', 'iso9001', 'iso13485', 'undetermined'] as QualityCertification[],
    has_formal_quality_policy: ['no', 'yes', 'undetermined'] as HasFormalQualityPolicy[],
    conducts_internal_audits: ['no', 'yes', 'undetermined'] as ConductsInternalAudits[],
    performs_rework: ['no', 'yes', 'undetermined'] as PerformsRework[],
    manages_customer_property: ['no', 'yes', 'undetermined'] as ManagesCustomerProperty[],
    includes_implantable_devices: ['no', 'yes', 'undetermined'] as IncludesImplantableDevices[],
    includes_sterile_devices: ['no', 'yes', 'undetermined'] as IncludesSterileDevices[],
    performs_design_and_development: ['no', 'yes', 'undetermined'] as PerformsDesignAndDevelopment[],
    performs_manufacturing: ['no', 'yes', 'undetermined'] as PerformsManufacturing[],
    performs_servicing: ['no', 'yes', 'undetermined'] as PerformsServicing[],
    performs_installation: ['no', 'yes', 'undetermined'] as PerformsInstallation[],
    performs_distribution: ['no', 'yes', 'undetermined'] as PerformsDistribution[],
    performs_post_market_activities: ['no', 'yes', 'undetermined'] as PerformsPostMarketActivities[],
    performs_supplier_management: ['no', 'yes', 'undetermined'] as PerformsSupplierManagement[],
    performs_sterilization_activities: ['no', 'yes', 'undetermined'] as PerformsSterilizationActivities[],

    // Device-related enums
    is_first_generation: ['yes', 'no'] as IsFirstGeneration[],
    market_status: ['on_market', 'post_market', 'undetermined'] as MarketStatus[],
    training_requirements: ['none', 'basic_instructions', 'structured_training', 'certification_required', 'periodic_retraining', 'undetermined'] as DeviceTrainingRequirements[],
    contact_duration: ['transient', 'short_term', 'long_term', 'undetermined'] as ContactDuration[],
    invasiveness: ['non_invasive', 'minimally_invasive', 'invasive', 'implantable', 'undetermined'] as InvasivenessLevel[],
    device_classification: ['class_i', 'class_iia', 'class_iib', 'class_iii', 'undetermined'] as DeviceClassification[],
    device_complexity: ['simple', 'complex_electronic', 'integrated_software', 'undetermined'] as DeviceComplexity[],
    automation_level: ['manual', 'semi_automated', 'fully_automated', 'undetermined'] as AutomationLevel[],
    software_dependency: ['none', 'standalone', 'add_on', 'undetermined'] as SoftwareDependency[],
    user_interaction_level: ['none', 'low', 'moderate', 'high', 'undetermined'] as UserInteractionLevel[],
    is_sterile: ['yes', 'no', 'undetermined'] as IsSterile[],
    one_time_usage: ['yes', 'no', 'undetermined'] as OneTimeUsage[],
    energy_source: ['battery', 'mains', 'other', 'undetermined'] as EnergySource[],
    sterilization_method: ['none', 'gamma_radiation', 'ethylene_oxide', 'steam', 'other', 'undetermined'] as SterilizationMethod[],
    information_for_safety_usage: ['none', 'minor', 'significant', 'primary', 'undetermined'] as InformationForSafetyUsage[],
    development_lifecycle_phase: ['concept_and_feasibility', 'design_and_development', 'verification_and_validation', 'regulatory_submission_and_review', 'manufacturing', 'market_launch', 'post_market_surveillance', 'product_changes_modifications', 'obsolescence_end_of_life', 'undetermined'] as DevelopmentLifeCyclePhase[],
    software_lifecycle_phase: ['not_applicable', 'development_planning', 'requirements_analysis', 'architectural_design', 'detailed_design', 'unit_implementation_and_verification', 'integration_and_integration_testing', 'system_testing', 'software_release', 'problem_resolution', 'undetermined'] as SoftwareLifeCyclePhase[],
    device_risk_level: ['low', 'medium', 'high', 'undetermined'] as DeviceRiskLevel[],

    // Trial-related enums
    lifecycle_phase: ['planning', 'recruitment', 'conduct', 'follow_up', 'analysis', 'reporting', 'publication', 'archiving', 'undetermined'] as TrialLifeCyclePhase[],
    investigation_type: ['interventional', 'observational', 'registry', 'post_market', 'undetermined'] as InvestigationType[],
    development_stage: ['early_feasibility', 'first_in_human', 'pivotal', 'post_market', 'undetermined'] as DevelopmentStage[],
    is_first_in_human: ['no', 'yes', 'undetermined'] as IsFirstInHuman[],
    is_emergency_investigation: ['no', 'yes', 'undetermined'] as IsEmergencyInvestigation[],
    is_long_term_investigation: ['no', 'yes', 'undetermined'] as IsLongTermInvestigation[],
    has_control_group: ['no', 'yes', 'undetermined'] as HasControlGroup[],
    uses_randomization: ['no', 'yes', 'undetermined'] as UsesRandomization[],
    uses_blinding: ['no', 'yes', 'undetermined'] as UsesBlinding[],
    has_multiple_treatment_groups: ['no', 'yes', 'undetermined'] as HasMultipleTreatmentGroups[],
    has_interim_analyses: ['no', 'yes', 'undetermined'] as HasInterimAnalyses[],
    is_multicenter: ['no', 'yes', 'undetermined'] as IsMulticenter[],
    is_multinational: ['no', 'yes', 'undetermined'] as IsMultinational[],
    subject_to_gdpr: ['no', 'yes', 'undetermined'] as SubjectToGdpr[],
    enrolls_vulnerable_populations: ['no', 'yes', 'undetermined'] as EnrollsVulnerablePopulations[],
    includes_healthy_volunteers: ['no', 'yes', 'undetermined'] as IncludesHealthyVolunteers[],
    enrolls_subjects_unable_to_consent: ['no', 'yes', 'undetermined'] as EnrollsSubjectsUnableToConsent[],
    enrolls_subjects_unable_to_read_write: ['no', 'yes', 'undetermined'] as EnrollsSubjectsUnableToReadWrite[],
    allows_emergency_enrollment: ['no', 'yes', 'undetermined'] as AllowsEmergencyEnrollment[],
    provides_subject_compensation: ['no', 'yes', 'undetermined'] as ProvidesSubjectCompensation[],
    compensation_structure: ['none', 'expense_reimbursement', 'completion_bonus', 'per_visit', 'undetermined'] as CompensationStructure[],
    has_sponsor_investigator_relationship: ['no', 'yes', 'undetermined'] as HasSponsorInvestigatorRelationship[],
    device_type: ['implantable', 'wearable', 'diagnostic', 'software', 'other', 'undetermined'] as DeviceType[],
    contains_medicinal_substances: ['no', 'yes', 'undetermined'] as ContainsMedicinalSubstances[],
    has_device_expiry_date: ['no', 'yes', 'undetermined'] as HasDeviceExpiryDate[],
    special_device_handling_required: ['no', 'yes', 'undetermined'] as SpecialDeviceHandlingRequired[],
    trial_training_requirements: ['none', 'basic_instructions', 'structured_training', 'certification_required', 'periodic_retraining', 'undetermined'] as TrialTrainingRequirements[],
    uses_electronic_data_systems: ['no', 'yes', 'undetermined'] as UsesElectronicDataSystems[],
    using_subject_diaries: ['no', 'yes', 'undetermined'] as UsesSubjectDiaries[],
    collects_biological_samples: ['no', 'yes', 'undetermined'] as CollectsBiologicalSamples[],
    plans_future_sample_use: ['no', 'yes', 'undetermined'] as PlansFutureSampleUse[],
    requires_translations: ['no', 'yes', 'undetermined'] as RequiresTranslations[],
    consent_requires_translation: ['no', 'yes', 'undetermined'] as ConsentRequiresTranslation[],
    has_data_monitoring_committee: ['no', 'yes', 'undetermined'] as HasDataMonitoringCommittee[],
    has_independent_assessment_mechanisms: ['no', 'yes', 'undetermined'] as HasIndependentAssessmentMechanisms[],
    has_additional_healthcare_arrangements: ['no', 'yes', 'undetermined'] as HasAdditionalHealthcareArrangements[]
};

const DescriptionCard: React.FC<DescriptionCardProps> = ({
    description,
    title,
    applicableFieldPaths,
    isLoading = false,
    onDescriptionChange
}) => {
    const formatKey = (key: string) => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatValue = (value: string) => {
        return value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const isFieldApplicable = (key: string) => {
        if (!applicableFieldPaths) return true;
        return Array.from(applicableFieldPaths.values()).some(paths =>
            paths.some(path => path.includes(key))
        );
    };

    const handleValueChange = (key: string, value: any, level: number = 0) => {
        if (!onDescriptionChange) return;

        const updateNestedObject = (obj: any, path: string[], newValue: any): any => {
            if (path.length === 1) {
                return { ...obj, [path[0]]: newValue };
            }
            return {
                ...obj,
                [path[0]]: updateNestedObject(obj[path[0]], path.slice(1), newValue)
            };
        };

        const newDescription = { ...description };
        const path = key.split('.');
        const updatedDescription = updateNestedObject(newDescription, path, value);
        onDescriptionChange(updatedDescription);
    };

    const renderField = (key: string, value: any, level: number = 0) => {
        if (key === 'company_type' || !isFieldApplicable(key)) {
            return null;
        }

        const formattedKey = formatKey(key);
        const indent = level * 16;

        const renderValue = (val: any, currentLevel: number = 0, currentPath: string = key): React.ReactNode => {
            if (key.toLowerCase() === 'generation') {
                return (
                    <Select
                        value={val ? '1st' : 'Later'}
                        onChange={(value) => handleValueChange(currentPath, value === '1st', currentLevel)}
                        style={{ width: 'auto' }}
                        options={[
                            { value: '1st', label: '1st' },
                            { value: 'Later', label: 'Later' }
                        ]}
                    />
                );
            }

            if (typeof val === 'object' && val !== null) {
                if (Array.isArray(val)) {
                    return val.map((item, index) =>
                        renderValue(item, currentLevel, `${currentPath}[${index}]`)
                    );
                }
                return (
                    <div style={{ marginLeft: `${currentLevel * 16}px` }}>
                        {Object.entries(val).map(([k, v]) => {
                            if (k === 'company_type' || !isFieldApplicable(k)) {
                                return null;
                            }
                            const newPath = `${currentPath}.${k}`;
                            return (
                                <div key={k} className="mb-2">
                                    <Typography.Text type="secondary">{formatKey(k)}:</Typography.Text>
                                    <div style={{ marginLeft: '8px' }}>
                                        {renderValue(v, currentLevel + 1, newPath)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            }

            // Handle enum fields
            const fieldName = currentPath.split('.').pop() || currentPath;
            const enumOptions = fieldName in ENUM_FIELD_MAPPING ? ENUM_FIELD_MAPPING[fieldName as keyof EnumFieldMapping] : undefined;
            if (enumOptions) {
                return (
                    <Select
                        value={val}
                        onChange={(value) => handleValueChange(currentPath, value, currentLevel)}
                        style={{ width: 'auto' }}
                        options={enumOptions.map((option: string) => ({
                            value: option,
                            label: formatValue(option)
                        }))}
                    />
                );
            }

            return (
                <Input
                    value={String(val)}
                    onChange={(e) => handleValueChange(currentPath, e.target.value, currentLevel)}
                    style={{ width: 'auto' }}
                />
            );
        };

        return (
            <div key={key} className="" style={{ marginLeft: `${indent}px` }}>
                <Typography.Text type="secondary">{formattedKey}:</Typography.Text>
                <div style={{ marginLeft: '8px' }}>
                    {renderValue(value, level + 1)}
                </div>
            </div>
        );
    };

    return (
        <Card
            title={
                <div className="flex items-center gap-2">
                    {title}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-blue-500">
                            <Spin size="small" />
                            <span>Analyzing {title}</span>
                        </div>
                    )}
                </div>
            }
            className="w-full [&_.ant-card-head]:relative [&_.ant-card-head]:border-b-0"
            headStyle={{
                borderBottom: 'none',
                position: 'relative'
            }}
            extra={
                <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 w-full ${isLoading ? 'animate-[loading-border_2s_ease-in-out_infinite]' : ''
                        }`}
                />
            }
        >
            {Object.entries(description).map(([key, value]) => renderField(key, value, 0))}
        </Card>
    );
};

export default DescriptionCard; 