import { RequirementWithGroupId } from "@/hooks/requirement-hooks";
import { RequirementGroupWithSectionId } from "@/hooks/requirement-group-hooks";
import { RegulatoryFramework, Section } from "@wasm";

export const PRICE_PER_REQUIREMENT_IN_EURO = 5;

export const getPriceForSection = (sectionId: string, allGroups: RequirementGroupWithSectionId[], allRequirements: RequirementWithGroupId[]): number => {
    const relatedGroups = allGroups.filter((group) => group.section_id === sectionId);
    const relatedRequirements = allRequirements.filter((requirement) =>
        relatedGroups.some((group) => group.id === requirement.group_id)
    );
    return PRICE_PER_REQUIREMENT_IN_EURO * relatedRequirements.length;
};

export const getPriceForGroup = (groupId: string, allRequirements: RequirementWithGroupId[]): number => {
    const relatedRequirements = allRequirements.filter(
        (requirement) => requirement.group_id === groupId
    );

    return PRICE_PER_REQUIREMENT_IN_EURO * relatedRequirements.length;
};

export const getPriceForFramework = (framework: RegulatoryFramework, allSections: Section[], allGroups: RequirementGroupWithSectionId[], allRequirements: RequirementWithGroupId[]) => {
    let price = 0
    const relatedSections = allSections.filter((section) => section.regulatory_framework === framework)
    relatedSections.forEach((section) => {
        price = price + getPriceForSection(section.id, allGroups, allRequirements)
    })
    return price
}

// Format the price for EU locale
export const formatPrice = (value: number) =>
    new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0, // No decimal places
        maximumFractionDigits: 0,
    }).format(value);