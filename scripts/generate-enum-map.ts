// run the script: npx tsx scripts/generate-enum-map.ts from lumi-docs-frontend repo
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fieldToEnumOutputPath = path.join(__dirname, "../src/types/fieldToEnumMap.ts");

// ✅ STATIC: Map full response field paths to enum type names
export const fieldToEnumMapSeed: Record<string, string> = {
    // DeviceDescription
    "device.software_info.lifecycle_phase": "SoftwareLifeCyclePhase",
    "device.software_info.safety_classification": "SoftwareSafetyClassification",
    "device.software_info.role": "SoftwareRole",
    "device.software_info.development_lifecycle_model": "SoftwareLifecycleModel",
    "device.software_info.uoup_components": "UoupComponentsStatus",

    "device.market_info.market_status": "MarketStatus",
    "device.purpose_info.training_requirements": "DeviceTrainingRequirements",

    "device.physical_characteristics.energy_source": "EnergySource",
    "device.physical_characteristics.user_interaction_level": "InteractionLevel",

    "device.technical_info.device_complexity": "DeviceComplexity",
    "device.technical_info.automation_level": "AutomationLevel",
    "device.technical_info.software_dependency": "SoftwareDependency",

    "device.classification_info.contact_duration": "ContactDuration",
    "device.classification_info.invasiveness": "InvasivenessLevel",
    "device.classification_info.device_classification": "DeviceClassification",

    "device.safety_info.sterilization_method": "SterilizationMethod",
    "device.safety_info.is_sterile": "IsSterile",
    "device.safety_info.one_time_usage": "OneTimeUsage",
    "device.safety_info.information_for_safety_usage": "InformationForSafetyUsage",

    "device.risk_info.misuse_risk_level": "MisuseRiskLevel",

    "device.connectivity.has_online_component": "HasOnlineComponent",
    "device.connectivity.integrations_possible": "IntegrationsPossible",

    "device.basic_info.is_first_generation": "IsFirstGeneration",
    "device.life_cycle_info.development_phase": "DevelopmentLifeCyclePhase",

    // TrialDescription
    "trial.basic_info.investigation_type": "InvestigationType",
    "trial.basic_info.development_stage": "DevelopmentStage",
    "trial.basic_info.is_first_in_human": "IsFirstInHuman",
    "trial.basic_info.is_emergency_investigation": "IsEmergencyInvestigation",
    "trial.basic_info.is_long_term_investigation": "IsLongTermInvestigation",
    "trial.basic_info.lifecycle_phase": "TrialLifeCyclePhase",

    "trial.design_info.has_control_group": "HasControlGroup",
    "trial.design_info.uses_randomization": "UsesRandomization",
    "trial.design_info.uses_blinding": "UsesBlinding",
    "trial.design_info.has_multiple_treatment_groups": "HasMultipleTreatmentGroups",
    "trial.design_info.has_interim_analyses": "HasInterimAnalyses",

    "trial.site_geography.is_multicenter": "IsMulticenter",
    "trial.site_geography.is_multinational": "IsMultinational",
    "trial.site_geography.subject_to_gdpr": "SubjectToGdpr",

    "trial.population.enrolls_vulnerable_populations": "EnrollsVulnerablePopulations",
    "trial.population.includes_healthy_volunteers": "IncludesHealthyVolunteers",
    "trial.population.enrolls_subjects_unable_to_consent": "EnrollsSubjectsUnableToConsent",
    "trial.population.enrolls_subjects_unable_to_read_write": "EnrollsSubjectsUnableToReadWrite",
    "trial.population.allows_emergency_enrollment": "AllowsEmergencyEnrollment",

    "trial.financial.provides_subject_compensation": "ProvidesSubjectCompensation",
    "trial.financial.compensation_structure": "CompensationStructure",
    "trial.financial.has_sponsor_investigator_relationship": "HasSponsorInvestigatorRelationship",

    "trial.data_collection.uses_electronic_data_systems": "UsesElectronicDataSystems",
    "trial.data_collection.using_subject_diaries": "UsesSubjectDiaries",
    "trial.data_collection.collects_biological_samples": "CollectsBiologicalSamples",
    "trial.data_collection.plans_future_sample_use": "PlansFutureSampleUse",

    "trial.translation.requires_translations": "RequiresTranslations",
    "trial.translation.consent_requires_translation": "ConsentRequiresTranslation",

    "trial.monitoring.has_data_monitoring_committee": "HasDataMonitoringCommittee",
    "trial.monitoring.has_independent_assessment_mechanisms": "HasIndependentAssessmentMechanisms",
    "trial.monitoring.has_additional_healthcare_arrangements": "HasAdditionalHealthcareArrangements",
    "trial.trial_device.device_type": "DeviceType",
    "trial.trial_device.device_risk_level": "DeviceRiskLevel",
    "trial.trial_device.contains_medicinal_substances": "ContainsMedicinalSubstances",
    "trial.trial_device.has_device_expiry_date": "HasDeviceExpiryDate",
    "trial.trial_device.special_device_handling_required": "SpecialDeviceHandlingRequired",
    "trial.trial_device.training_requirements": "TrialTrainingRequirements",

    // CompanyDescription
    "company.process_scope.performs_design_and_development": "PerformsDesignAndDevelopment",
    "company.process_scope.performs_manufacturing": "PerformsManufacturing",
    "company.process_scope.performs_servicing": "PerformsServicing",
    "company.process_scope.performs_installation": "PerformsInstallation",
    "company.process_scope.performs_distribution": "PerformsDistribution",
    "company.process_scope.performs_post_market_activities": "PerformsPostMarketActivities",
    "company.process_scope.performs_supplier_management": "PerformsSupplierManagement",
    "company.process_scope.performs_sterilization_activities": "PerformsSterilizationActivities",
    "company.process_scope.performs_rework": "PerformsRework",
    "company.process_scope.manages_customer_property": "ManagesCustomerProperty",

    "company.quality_management.quality_certification": "QualityCertification",
    "company.quality_management.quality_management_system_maturity": "QmsMaturityLevel",
    "company.quality_management.has_formal_quality_policy": "HasFormalQualityPolicy",
    "company.quality_management.conducts_internal_audits": "ConductsInternalAudits",

    "company.product_portfolio.includes_implantable_devices": "IncludesImplantableDevices",
    "company.product_portfolio.includes_sterile_devices": "IncludesSterileDevices",

    "company.basic_info.company_type": "CompanyType"
};

const fieldToEnumOutput = `// AUTO-GENERATED FILE. DO NOT MODIFY.
export const FIELD_TO_ENUM_TYPE: Record<string, string> = ${JSON.stringify(fieldToEnumMapSeed, null, 2)};
`;

fs.writeFileSync(fieldToEnumOutputPath, fieldToEnumOutput, "utf-8");

console.log(`[Enum Generator] ✅ Wrote ${Object.keys(fieldToEnumMapSeed).length} mappings to fieldToEnumMap.ts`);