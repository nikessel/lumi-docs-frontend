import { saveData, getData, getMetadata } from "@/utils/db-utils";
import type { Section, RegulatoryFramework } from "@wasm";
import type * as WasmModule from "@wasm";
import { dbName, dbVersion } from "@/utils/db-utils";

// Extended type for cached sections
interface CachedSection extends Section {
    timestamp?: number;
}

const SECTIONS_STORE_NAME = "sections";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function fetchSectionsByIds(
    wasmModule: typeof WasmModule | null,
    sectionIds: string[]
): Promise<{ sections: Section[]; errors: { [id: string]: string } }> {
    const result: { sections: Section[]; errors: { [id: string]: string } } = {
        sections: [],
        errors: {},
    };
    console.log("SECTUIONS BEFOEE")
    // Fetch cached sections
    const cachedSections = await getData<CachedSection>(dbName, SECTIONS_STORE_NAME, dbVersion) || [];
    console.log("SECTUIONS AFTER")

    const sectionsToFetch: string[] = [];
    const validCachedSections: Section[] = [];

    // Check cache for valid entries
    sectionIds.forEach((sectionId) => {
        const cachedSection = cachedSections.find((section) => section.id === sectionId);

        const isExpired = cachedSection?.timestamp
            ? Date.now() - cachedSection.timestamp > CACHE_TTL
            : true;

        if (cachedSection && !isExpired) {
            console.log(`Using cached section for ID: ${sectionId}`);
            validCachedSections.push(cachedSection);
        } else {
            sectionsToFetch.push(sectionId);
        }
    });

    // Include valid cached sections in the result
    result.sections.push(...validCachedSections);

    if (sectionsToFetch.length === 0) {
        // All required sections were found in the cache
        return result;
    }

    if (!wasmModule) {
        sectionsToFetch.forEach((id) => {
            result.errors[id] = "WASM module not loaded";
        });
        return result;
    }

    console.log(`Fetching sections for IDs: ${sectionsToFetch.join(", ")}`);

    const fetchPromises = sectionsToFetch.map(async (id) => {
        try {
            const response = await wasmModule.get_sections({ input: [id] });

            if (response.output) {
                const section = response.output.output[0];

                // Save fetched section to cache
                await saveData(dbName, SECTIONS_STORE_NAME, [{ ...section, timestamp: Date.now() }], dbVersion, false);

                result.sections.push(section);
            } else if (response.error) {
                result.errors[id] = response.error.message;
            }
        } catch (err: unknown) {
            console.error(`Error fetching section with ID: ${id}`, err);
            result.errors[id] = "Failed to fetch section";
        }
    });

    // Wait for all fetch operations to complete
    await Promise.all(fetchPromises);

    return result;
}

export async function fetchSectionsByRegulatoryFramework(
    wasmModule: typeof WasmModule | null,
    regulatoryFramework: RegulatoryFramework
): Promise<{ sections: Section[]; error?: string }> {
    const result: { sections: Section[]; error?: string } = { sections: [] };

    try {
        // Fetch cached sections
        const cachedSections = await getData<CachedSection>(dbName, SECTIONS_STORE_NAME, dbVersion) || [];

        // Check if cached data exists and is valid
        const validCache = cachedSections.find(
            (entry) => entry.regulatory_framework === regulatoryFramework &&
                Date.now() - (entry.timestamp || 0) < CACHE_TTL
        );

        if (validCache) {
            console.log(`Using cached sections for framework: ${regulatoryFramework}`);
            result.sections = cachedSections.filter(
                (section) => section.regulatory_framework === regulatoryFramework
            );
            return result;
        }

        // If no valid cache, fetch from WASM
        if (!wasmModule) {
            throw new Error("WASM module not loaded");
        }

        console.log(`Fetching sections for framework: ${regulatoryFramework}`);
        const response = await wasmModule.get_sections_by_regulatory_framework({
            input: regulatoryFramework,
        });

        if (response.error) {
            throw new Error(response.error.message);
        }

        if (response.output?.output) {
            result.sections = response.output.output;

            // Cache the fetched data
            const sectionsWithTimestamp = result.sections.map((section) => ({
                ...section,
                timestamp: Date.now(),
            }));
            await saveData(
                "regulatoryFrameworkCache",
                SECTIONS_STORE_NAME,
                sectionsWithTimestamp,
                1
            );
        }
    } catch (error) {
        console.error(`Error fetching sections for framework ${regulatoryFramework}:`, error);
        result.error = (error as Error).message || "Unknown error occurred";
    }

    return result;
}
