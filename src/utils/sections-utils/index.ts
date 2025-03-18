import type { Section, RegulatoryFramework } from "@wasm";
import type * as WasmModule from "@wasm";
import { fetchWrapper } from "../error-handling-utils/fetchWrapper";

export async function fetchSectionsByIds(
    wasmModule: typeof WasmModule | null,
    sectionIds: string[]
): Promise<{ sections: Section[]; errors: { [id: string]: string } }> {
    console.log(`📌 Fetching sections for IDs: ${sectionIds.join(", ")}`);

    if (sectionIds.length === 0) {
        console.warn("⚠️ No section IDs provided.");
        return { sections: [], errors: {} };
    }

    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return { sections: [], errors: Object.fromEntries(sectionIds.map(id => [id, "WASM module not loaded"])) };
    }

    const results: { sections: Section[]; errors: { [id: string]: string } } = { sections: [], errors: {} };

    const fetchPromises = sectionIds.map(async (id) => {
        const { data, error } = await fetchWrapper(() => wasmModule.get_sections({ input: [id] }));

        if (data?.output?.output?.[0]) {
            results.sections.push(data.output.output[0]);
        } else {
            results.errors[id] = error || `Failed to fetch section ${id}`;
            console.error(`❌ Error fetching section ${id}: ${error}`);
        }
    });

    await Promise.allSettled(fetchPromises); // Ensures all requests complete

    return results;
}


export async function fetchSectionsByRegulatoryFramework(
    wasmModule: typeof WasmModule | null,
    regulatoryFramework: RegulatoryFramework
): Promise<{ sections: Section[]; error?: string }> {
    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return { sections: [], error: "WASM module not available" };
    }

    const { data, error } = await fetchWrapper(() =>
        wasmModule.get_sections_by_regulatory_framework({ input: regulatoryFramework })
    );

    return {
        sections: data?.output?.output || [],
        error: error || undefined,
    };
}


