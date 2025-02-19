import { Section, RequirementGroup, Requirement } from "@wasm";

export const getPriceForSection = (
    sectionId: string,
    requirementGroupsBySectionId: Record<string, RequirementGroup[]>,
    requirementsByGroupId: Record<string, Requirement[]>,
    pricePerReq: number
): number => {
    const groupsForSection = requirementGroupsBySectionId[sectionId] || [];
    const relatedRequirements = groupsForSection.flatMap(group => requirementsByGroupId[group.id] || []);
    return pricePerReq * relatedRequirements.length;
};

export const getPriceForGroup = (
    groupId: string,
    requirementsByGroupId: Record<string, Requirement[]>,
    pricePerReq: number
): number => {
    const requirementsForGroup = requirementsByGroupId[groupId] || [];
    return pricePerReq * requirementsForGroup.length;
};

export const getPriceForFramework = (
    frameworkId: string,
    sectionsByRegulatoryFramework: Record<string, Section[]>,
    requirementGroupsBySectionId: Record<string, RequirementGroup[]>,
    requirementsByGroupId: Record<string, Requirement[]>,
    pricePerReq: number
): number => {
    const sectionsForFramework = sectionsByRegulatoryFramework[frameworkId] || [];
    return sectionsForFramework.reduce((totalPrice, section) => {
        return totalPrice + getPriceForSection(section.id, requirementGroupsBySectionId, requirementsByGroupId, pricePerReq);
    }, 0);
};


// ✅ Format the price for EU locale
export const formatPrice = (value: number) =>
    new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0, // No decimal places
        maximumFractionDigits: 1,
    }).format(value);