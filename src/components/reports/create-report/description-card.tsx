import React, { useState } from "react";
import { Card, Typography, Spin, Input, Select, Radio, Button, Checkbox } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
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
    MisuseRiskLevel,
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
    PerformsSterilizationActivities,
    SoftwareSafetyClassification,
    SoftwareLifecycleModel,
    SoftwareRole,
    UoupComponentsStatus,
    HasOnlineComponent,
    IntegrationsPossible
} from "@wasm";
import Image from "next/image";
import DescriptionCardSkeleton from "./description-card-skeleton";

type DescriptionType = DeviceDescription | TrialDescription | CompanyDescription | Company;

interface DescriptionCardProps {
    description: DescriptionType | null;
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
    development_phase: DevelopmentLifeCyclePhase[];
    software_lifecycle_phase: SoftwareLifeCyclePhase[];
    device_risk_level: DeviceRiskLevel[];
    misuse_risk_level: MisuseRiskLevel[];
    safety_classification: SoftwareSafetyClassification[];
    development_lifecycle_model: SoftwareLifecycleModel[];
    role: SoftwareRole[];
    uoup_components: UoupComponentsStatus[];
    has_online_component: HasOnlineComponent[];
    integrations_possible: IntegrationsPossible[];

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
    quality_management_system_maturity: ['non_existent', 'ad_hoc', 'developing', 'implemented', 'certification_ready', 'certified', 'established', 'measured', 'optimizing', 'undetermined'],
    quality_certification: ['none', 'iso9001', 'iso13485', 'undetermined'],
    has_formal_quality_policy: ['no', 'yes', 'undetermined'],
    conducts_internal_audits: ['no', 'yes', 'undetermined'],
    performs_rework: ['no', 'yes', 'undetermined'],
    manages_customer_property: ['no', 'yes', 'undetermined'],
    includes_implantable_devices: ['no', 'yes', 'undetermined'],
    includes_sterile_devices: ['no', 'yes', 'undetermined'],
    performs_design_and_development: ['no', 'yes', 'undetermined'],
    performs_manufacturing: ['no', 'yes', 'undetermined'],
    performs_servicing: ['no', 'yes', 'undetermined'],
    performs_installation: ['no', 'yes', 'undetermined'],
    performs_distribution: ['no', 'yes', 'undetermined'],
    performs_post_market_activities: ['no', 'yes', 'undetermined'],
    performs_supplier_management: ['no', 'yes', 'undetermined'],
    performs_sterilization_activities: ['no', 'yes', 'undetermined'],

    // Device-related enums
    is_first_generation: ['yes', 'no'],
    market_status: ["not_launched", "pre_market", 'on_market', 'post_market', 'undetermined'],
    training_requirements: ['none', 'basic_instructions', 'structured_training', 'certification_required', 'periodic_retraining', 'undetermined'],
    contact_duration: ['transient', 'short_term', 'long_term', 'undetermined'],
    invasiveness: ['non_invasive', 'minimally_invasive', 'invasive', 'implantable', 'undetermined'],
    device_classification: ['class_i', 'class_iia', 'class_iib', 'class_iii', 'undetermined'],
    device_complexity: ['simple_mechanical', 'complex_electronic', 'integrated_software', 'undetermined'],
    automation_level: ['manual', 'semi_automated', 'fully_automated', 'undetermined'],
    software_dependency: ["integral", "add_on", "standalone", "undetermined"],
    user_interaction_level: ['none', 'low', 'moderate', 'high', 'undetermined'],
    is_sterile: ['yes', 'no', 'undetermined'],
    one_time_usage: ['yes', 'no', 'undetermined'],
    energy_source: ['battery', 'mains', 'other', 'undetermined'],
    sterilization_method: ['none', 'gamma_radiation', 'ethylene_oxide', 'steam', 'other', 'undetermined'],
    information_for_safety_usage: ['none', 'minor', 'significant', 'primary', 'undetermined'],
    development_phase: ['concept_and_feasibility', 'design_and_development', 'verification_and_validation', 'regulatory_submission_and_review', 'manufacturing', 'market_launch', 'post_market_surveillance', 'product_changes_modifications', 'obsolescence_end_of_life', 'undetermined'],
    software_lifecycle_phase: ['not_applicable', 'development_planning', 'requirements_analysis', 'architectural_design', 'detailed_design', 'unit_implementation_and_verification', 'integration_and_integration_testing', 'system_testing', 'software_release', 'problem_resolution', 'undetermined'],
    device_risk_level: ['low', 'medium', 'high', 'undetermined'],
    misuse_risk_level: ['low', 'moderate', 'high', 'undetermined'],
    safety_classification: ['a', 'b', 'c', 'undetermined'],
    development_lifecycle_model: ["v_model", "agile", "waterfall", "iterative", "undetermined"],
    role: ["minor", "important", "core", "only"],
    uoup_components: ["none", "minor", "significant", "primary", "undetermined"],
    has_online_component: ["no", "yes", "undetermined"],
    integrations_possible: ["no", "yes", "undetermined"],

    // Trial-related enums
    lifecycle_phase: ['planning', 'site_selection', 'submission', 'initiation', 'enrollment', 'conduct', 'closeout', 'analysis', 'undetermined'],
    investigation_type: ['interventional', 'observational', 'registry', 'post_market', 'undetermined'],
    development_stage: ['early_feasibility', 'first_in_human', 'pivotal', 'post_market', 'undetermined'],
    is_first_in_human: ['no', 'yes', 'undetermined'],
    is_emergency_investigation: ['no', 'yes', 'undetermined'],
    is_long_term_investigation: ['no', 'yes', 'undetermined'],
    has_control_group: ['no', 'yes', 'undetermined'],
    uses_randomization: ['no', 'yes', 'undetermined'],
    uses_blinding: ['no', 'yes', 'undetermined'],
    has_multiple_treatment_groups: ['no', 'yes', 'undetermined'],
    has_interim_analyses: ['no', 'yes', 'undetermined'],
    is_multicenter: ['no', 'yes', 'undetermined'],
    is_multinational: ['no', 'yes', 'undetermined'],
    subject_to_gdpr: ['no', 'yes', 'undetermined'],
    enrolls_vulnerable_populations: ['no', 'yes', 'undetermined'],
    includes_healthy_volunteers: ['no', 'yes', 'undetermined'],
    enrolls_subjects_unable_to_consent: ['no', 'yes', 'undetermined'],
    enrolls_subjects_unable_to_read_write: ['no', 'yes', 'undetermined'],
    allows_emergency_enrollment: ['no', 'yes', 'undetermined'],
    provides_subject_compensation: ['no', 'yes', 'undetermined'],
    compensation_structure: ['none', 'expense_reimbursement', 'completion_bonus', 'per_visit', 'undetermined'],
    has_sponsor_investigator_relationship: ['no', 'yes', 'undetermined'],
    device_type: ['implantable', 'wearable', 'diagnostic', 'software', 'other', 'undetermined'],
    contains_medicinal_substances: ['no', 'yes', 'undetermined'],
    has_device_expiry_date: ['no', 'yes', 'undetermined'],
    special_device_handling_required: ['no', 'yes', 'undetermined'],
    trial_training_requirements: ['none', 'basic_instructions', 'structured_training', 'certification_required', 'periodic_retraining', 'undetermined'],
    uses_electronic_data_systems: ['no', 'yes', 'undetermined'],
    using_subject_diaries: ['no', 'yes', 'undetermined'],
    collects_biological_samples: ['no', 'yes', 'undetermined'],
    plans_future_sample_use: ['no', 'yes', 'undetermined'],
    requires_translations: ['no', 'yes', 'undetermined'],
    consent_requires_translation: ['no', 'yes', 'undetermined'],
    has_data_monitoring_committee: ['no', 'yes', 'undetermined'],
    has_independent_assessment_mechanisms: ['no', 'yes', 'undetermined'],
    has_additional_healthcare_arrangements: ['no', 'yes', 'undetermined']
};

const MULTI_SELECT_FIELDS = [
    'quality_management_system_maturity',
    'software_lifecycle_phase',
    'development_lifecycle_phase',
    'lifecycle_phase'
];

const DescriptionCard: React.FC<DescriptionCardProps> = ({
    description,
    title,
    applicableFieldPaths,
    isLoading = false,
    onDescriptionChange
}) => {
    const [analysisMode, setAnalysisMode] = useState<'full' | 'affecting'>('affecting');
    const [initialDescription] = useState(description);

    const getValuesUpTo = (value: string, options: string[]): string[] => {
        const index = options.indexOf(value);
        return index === -1 ? [value] : options.slice(0, index + 1);
    };

    if (isLoading) {
        return <DescriptionCardSkeleton />;
    }

    if (!description) {
        return;
    }

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
        if (analysisMode === 'full') return true;
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

    const handleReset = () => {
        if (onDescriptionChange && initialDescription) {
            onDescriptionChange(initialDescription);
        }
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
                        style={{ width: 'auto', minWidth: '50px' }}
                        options={[
                            { value: '1st', label: '1st' },
                            { value: 'Later', label: 'Later' }
                        ]}
                    />
                );
            }

            if (typeof val === 'object' && val !== null) {
                if (Array.isArray(val)) {
                    const fieldName = currentPath.split('.').pop() || currentPath;
                    const enumOptions = fieldName in ENUM_FIELD_MAPPING ? ENUM_FIELD_MAPPING[fieldName as keyof EnumFieldMapping] : undefined;
                    const isMultiSelect = MULTI_SELECT_FIELDS.includes(fieldName);

                    if (enumOptions && isMultiSelect) {
                        return (
                            <Checkbox.Group
                                value={val}
                                onChange={(value) => handleValueChange(currentPath, value, currentLevel)}
                                style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}
                            >
                                {enumOptions.map((option: string) => (
                                    <Checkbox key={option} value={option}>
                                        {formatValue(option)}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        );
                    }

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
                            const isLongTextField = typeof v === 'string' && v.length > 30;
                            const fieldName = k;
                            const enumOptions = fieldName in ENUM_FIELD_MAPPING ? ENUM_FIELD_MAPPING[fieldName as keyof EnumFieldMapping] : undefined;
                            const isMultiSelect = enumOptions && MULTI_SELECT_FIELDS.includes(fieldName);
                            return (
                                <div key={k} className="mb-2">
                                    {isLongTextField || isMultiSelect ? (
                                        <div className="flex flex-col gap-2">
                                            <Typography.Text type="secondary">{formatKey(k)}:</Typography.Text>
                                            {renderValue(v, currentLevel + 1, newPath)}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2">
                                            <Typography.Text type="secondary">{formatKey(k)}:</Typography.Text>
                                            {renderValue(v, currentLevel + 1, newPath)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            }

            const fieldName = currentPath.split('.').pop() || currentPath;
            const enumOptions = fieldName in ENUM_FIELD_MAPPING ? ENUM_FIELD_MAPPING[fieldName as keyof EnumFieldMapping] : undefined;
            if (enumOptions) {
                const isMultiSelect = MULTI_SELECT_FIELDS.includes(fieldName);
                const currentValue = isMultiSelect ? (Array.isArray(val) ? val : getValuesUpTo(val, enumOptions)) : val;

                if (isMultiSelect) {
                    return (
                        <Checkbox.Group
                            value={currentValue}
                            onChange={(value) => handleValueChange(currentPath, value, currentLevel)}
                            style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}
                        >
                            {enumOptions.map((option: string) => (
                                <Checkbox key={option} value={option}>
                                    {formatValue(option)}
                                </Checkbox>
                            ))}
                        </Checkbox.Group>
                    );
                }

                return (
                    <Select
                        value={currentValue}
                        onChange={(value) => handleValueChange(currentPath, value, currentLevel)}
                        style={{ width: 'auto', minWidth: '50px' }}
                        options={enumOptions.map((option: string) => ({
                            value: option,
                            label: formatValue(option)
                        }))}
                    />
                );
            }

            // Check if the value is a string and longer than 30 characters
            if (typeof val === 'string' && val.length > 30) {
                return (
                    <Input.TextArea
                        value={val}
                        onChange={(e) => handleValueChange(currentPath, e.target.value, currentLevel)}
                        style={{ width: '100%', minHeight: '80px' }}
                        autoSize={{ minRows: 3 }}
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

        // Check if the value is an object (parent field)
        const isParentField = typeof value === 'object' && value !== null && !Array.isArray(value);
        const isLongTextField = typeof value === 'string' && value.length > 30;
        const fieldName = key;
        const enumOptions = fieldName in ENUM_FIELD_MAPPING ? ENUM_FIELD_MAPPING[fieldName as keyof EnumFieldMapping] : undefined;
        const isMultiSelect = enumOptions && MULTI_SELECT_FIELDS.includes(fieldName);

        return (
            <div key={key} className="mb-2" style={{ marginLeft: `${indent}px` }}>
                {isParentField ? (
                    <>
                        <Typography.Text type="secondary" className="block mb-2">{formattedKey}:</Typography.Text>
                        {renderValue(value, level + 1)}
                    </>
                ) : isLongTextField || isMultiSelect ? (
                    <div className="flex flex-col gap-2">
                        <Typography.Text type="secondary">{formattedKey}:</Typography.Text>
                        {renderValue(value, level + 1)}
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-2">
                        <Typography.Text type="secondary">{formattedKey}:</Typography.Text>
                        {renderValue(value, level + 1)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card
            title={
                <div >
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            {title}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={handleReset}
                                title="Reset to initial values"
                            />
                            <Radio.Group
                                value={analysisMode}
                                onChange={(e) => setAnalysisMode(e.target.value)}
                                optionType="button"
                                buttonStyle="solid"
                                size="small"
                                style={{ fontSize: '10px', fontWeight: 'normal' }}
                            >
                                <Radio.Button value="full">Full Analysis</Radio.Button>
                                <Radio.Button value="affecting">Key Factors</Radio.Button>
                            </Radio.Group>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="bg-[var(--bg-secondary)] text-[var(--primary)] mb-4 p-2 rounded-md text-xs font-normal flex items-center gap-2">
                <Image src="/assets/pngs/ai_blue.png" alt="AI" width={24} height={24} color="var(--primary)" />
                The information below is based on a review of all uploaded documents. Chaging Key Factors will update the suggestions to the right.
            </div>

            {Object.entries(description).map(([key, value]) => renderField(key, value, 0))}
        </Card>
    );
};

export default DescriptionCard; 