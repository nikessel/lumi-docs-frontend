import { Section, RequirementGroup, Requirement } from "@wasm";

export const PRICE_PER_REQUIREMENT_IN_EURO = 5;

export const getPriceForSection = (
    sectionId: string,
    requirementGroupsBySectionId: Record<string, RequirementGroup[]>,
    requirementsByGroupId: Record<string, Requirement[]>
): number => {
    const groupsForSection = requirementGroupsBySectionId[sectionId] || [];
    const relatedRequirements = groupsForSection.flatMap(group => requirementsByGroupId[group.id] || []);
    return PRICE_PER_REQUIREMENT_IN_EURO * relatedRequirements.length;
};

export const getPriceForGroup = (
    groupId: string,
    requirementsByGroupId: Record<string, Requirement[]>
): number => {
    const requirementsForGroup = requirementsByGroupId[groupId] || [];
    return PRICE_PER_REQUIREMENT_IN_EURO * requirementsForGroup.length;
};

export const getPriceForFramework = (
    frameworkId: string,
    sectionsByRegulatoryFramework: Record<string, Section[]>,
    requirementGroupsBySectionId: Record<string, RequirementGroup[]>,
    requirementsByGroupId: Record<string, Requirement[]>
): number => {
    const sectionsForFramework = sectionsByRegulatoryFramework[frameworkId] || [];
    return sectionsForFramework.reduce((totalPrice, section) => {
        return totalPrice + getPriceForSection(section.id, requirementGroupsBySectionId, requirementsByGroupId);
    }, 0);
};


// ✅ Format the price for EU locale
export const formatPrice = (value: number) =>
    new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0, // No decimal places
        maximumFractionDigits: 0,
    }).format(value);