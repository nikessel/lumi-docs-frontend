import type { Section, RegulatoryFramework } from "@wasm";
import type * as WasmModule from "@wasm";

export async function fetchSectionsByIds(
    wasmModule: typeof WasmModule | null,
    sectionIds: string[]
): Promise<{ sections: Section[]; errors: { [id: string]: string } }> {
    console.log(`📌 Fetching sections for IDs: ${sectionIds.join(", ")}`);

    const result: { sections: Section[]; errors: { [id: string]: string } } = {
        sections: [],
        errors: {},
    };

    if (sectionIds.length === 0) {
        console.warn("⚠️ No section IDs provided.");
        return result;
    }

    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        return result;
    }

    const fetchPromises = sectionIds.map(async (id) => {
        try {
            console.log(`🔄 Fetching section with ID: ${id}`);
            const response = await wasmModule.get_sections({ input: [id] });

            if (response.output) {
                const section = response.output.output[0];
                console.log(`✅ Successfully fetched section: ${id}`);
                result.sections.push(section);
            } else if (response.error) {
                console.error(`❌ Error fetching section ${id}: ${response.error.message}`);
                result.errors[id] = response.error.message;
            }
        } catch (err) {
            console.error(`❌ Failed to fetch section ${id}:`, err);
            result.errors[id] = "Failed to fetch section";
        }
    });

    await Promise.all(fetchPromises);

    return result;
}

export async function fetchSectionsByRegulatoryFramework(
    wasmModule: typeof WasmModule | null,
    regulatoryFramework: RegulatoryFramework
): Promise<{ sections: Section[]; error?: string }> {
    console.log(`📌 Fetching sections for framework: ${regulatoryFramework}`);

    const result: { sections: Section[]; error?: string } = { sections: [] };

    if (!wasmModule) {
        console.error("❌ WASM module not loaded.");
        result.error = "WASM module not available";
        return result;
    }

    try {
        console.log(`🔄 Requesting sections for framework: ${regulatoryFramework}`);
        const response = await wasmModule.get_sections_by_regulatory_framework({ input: regulatoryFramework });

        if (response.error) {
            console.error(`❌ Error fetching sections: ${response.error.message}`);
            throw new Error(response.error.message);
        }

        if (response.output?.output) {
            result.sections = response.output.output;
            console.log(`✅ Successfully fetched ${result.sections.length} sections for framework: ${regulatoryFramework}`);
        }
    } catch (error) {
        console.error(`❌ Failed to fetch sections for framework ${regulatoryFramework}:`, error);
        result.error = (error as Error).message || "Unknown error occurred";
    }

    return result;
}

