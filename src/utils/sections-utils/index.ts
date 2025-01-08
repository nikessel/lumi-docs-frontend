import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils";
import type { Section } from "@wasm";
import type * as WasmModule from "@wasm";
import { dbName, dbVersion } from "@/utils/db-utils";

const SECTIONS_STORE_NAME = "sections";
const DB_VERSION = dbVersion;
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchSectionsByIds(
    wasmModule: typeof WasmModule | null,
    sectionIds: string[]
): Promise<{ sections: Section[]; errors: { [id: string]: string } }> {
    const result: { sections: Section[]; errors: { [id: string]: string } } = {
        sections: [],
        errors: {},
    };

    const cachedSections = await getData<Section>(dbName, SECTIONS_STORE_NAME, DB_VERSION);
    const sectionsToFetch = sectionIds.filter(
        (id) => !cachedSections.some((section) => section.id === id)
    );

    result.sections.push(...cachedSections.filter((section) => sectionIds.includes(section.id)));

    if (!wasmModule) {
        sectionsToFetch.forEach((id) => {
            result.errors[id] = "WASM module not loaded";
        });
        return result;
    }

    const fetchPromises = sectionsToFetch.map(async (id) => {
        try {
            const response = await wasmModule.get_sections({ input: [id] });
            if (response.output) {
                const section = response.output.output[0];
                await saveData(dbName, SECTIONS_STORE_NAME, [section], DB_VERSION, false);
                result.sections.push(section);
            } else if (response.error) {
                result.errors[id] = response.error.message;
            }
        } catch (err: unknown) {
            result.errors[id] = "Failed to fetch section";
        }
    });

    await Promise.all(fetchPromises);
    return result;
}






















// import { saveData, getData, getMetadata, saveMetadata } from "@/utils/db-utils";
// import type { Section, IdType } from "@wasm";

// import type * as WasmModule from "@wasm";

// const DB_NAME = "SectionsCacheDB";
// const STORE_NAME = "sections";
// const DB_VERSION = 1;
// const CACHE_TTL = 5 * 60 * 1000;

// export async function fetchSectionsByIds(
//     wasmModule: typeof WasmModule | null,
//     sectionIds: IdType[]
// ): Promise<{
//     sections: Section[];
//     error: string | null;
// }> {
//     const result: {
//         sections: Section[];
//         error: string | null;
//     } = {
//         sections: [],
//         error: null,
//     };


//     if (!sectionIds || sectionIds.length === 0) {
//         result.error = "No section IDs provided";
//         return result;
//     }

//     // Fetch cached sections
//     const cachedSections = await getData<Section>(DB_NAME, STORE_NAME, DB_VERSION);
//     const lastFetchTimestamp = await getMetadata(DB_NAME, "lastFetch", DB_VERSION);

//     const isExpired = lastFetchTimestamp
//         ? Date.now() - lastFetchTimestamp > CACHE_TTL
//         : true;

//     // Check for cached sections
//     const foundSections: Section[] = [];
//     const missingIds: IdType[] = [];

//     sectionIds.forEach((id) => {
//         const cachedSection = cachedSections.find((section) => section.id === id);
//         if (cachedSection) {
//             foundSections.push(cachedSection);
//         } else {
//             missingIds.push(id);
//         }
//     });

//     // If all sections are found in the cache and not expired, return them
//     if (missingIds.length === 0 && !isExpired) {
//         console.log("Using cached sections data");
//         result.sections = foundSections;
//         return result;
//     }

//     if (!wasmModule) {
//         result.error = "WASM module not loaded";
//         return result;
//     }

//     console.log("Fetching missing sections data from WASM");

//     try {
//         // const response = await wasmModule.get_all_sections();
//         const response = await wasmModule.get_sections({ input: missingIds });
//         // await wasmModule.get_all_sections()

//         if (response.output) {
//             let fetchedSections = response.output.output;

//             // Combine cached and fetched sections
//             const combinedSections = [...foundSections, ...fetchedSections];

//             // Save sections and metadata
//             await saveData(DB_NAME, STORE_NAME, combinedSections, DB_VERSION, true);
//             await saveMetadata(DB_NAME, "lastFetch", Date.now(), DB_VERSION);

//             result.sections = combinedSections;
//         } else if (response.error) {
//             result.error = response.error.message;
//         }
//     } catch (err) {
//         console.error("Error fetching sections by IDs:", err);
//         result.error = "Failed to fetch sections by IDs";
//     }

//     return result;
// }


// export async function fetchSections(
//     wasmModule: typeof WasmModule | null
// ): Promise<{
//     sections: Section[];
//     error: string | null;
// }> {
//     const result: {
//         sections: Section[];
//         error: string | null;
//     } = {
//         sections: [],
//         error: null,
//     };

//     // Fetch cached sections
//     const cachedSections = await getData<Section>(DB_NAME, STORE_NAME, DB_VERSION);
//     const isFullFetch = await getMetadata(DB_NAME, "fullFetch", DB_VERSION);
//     const lastFetchTimestamp = await getMetadata(DB_NAME, "lastFetch", DB_VERSION);

//     const isExpired = lastFetchTimestamp
//         ? Date.now() - lastFetchTimestamp > CACHE_TTL
//         : true;

//     if (cachedSections.length > 0 && !isExpired && isFullFetch) {
//         console.log("Using cached sections data");
//         result.sections = cachedSections;
//         return result;
//     }

//     if (!wasmModule) {
//         result.error = "WASM module not loaded";
//         return result;
//     }

//     console.log("Fetching refreshing sections data");

//     try {
//         const response = await wasmModule.get_all_sections();

//         if (response.output) {
//             const sectionsData = response.output.output;

//             // Save sections and metadata
//             await saveData(DB_NAME, STORE_NAME, sectionsData, DB_VERSION, true);
//             await saveMetadata(DB_NAME, "fullFetch", true, DB_VERSION);
//             await saveMetadata(DB_NAME, "lastFetch", Date.now(), DB_VERSION);

//             result.sections = sectionsData;
//         } else if (response.error) {
//             result.error = response.error.message;
//         }
//     } catch (err) {
//         console.error("Error fetching sections:", err);
//         result.error = "Failed to fetch sections";
//     }

//     return result;
// }
