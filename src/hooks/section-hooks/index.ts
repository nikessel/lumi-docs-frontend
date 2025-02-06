import { useEffect, useState } from 'react';
import { useWasm } from '@/components/WasmProvider';
import { fetchSectionsByIds } from '@/utils/sections-utils';
import { Section, Report, RegulatoryFramework } from '@wasm';

interface UseFilteredReportSections {
    sections: Section[];
    loading: boolean;
    error: string | null;
}

export const useFilteredReportSections = (reports: Report[]): UseFilteredReportSections => {
    const { wasmModule } = useWasm();
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSections = async () => {
            if (!wasmModule || reports.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Extract all section IDs from the reports
                const allSectionIds = reports.flatMap((report) =>
                    Array.from(report.section_assessments.keys())
                );

                const { sections, errors } = await fetchSectionsByIds(wasmModule, allSectionIds);

                if (Object.keys(errors).length > 0) {
                    console.error("Errors fetching sections:", errors);
                    setError("Some sections could not be fetched.");
                }

                setSections(sections);
            } catch (err: any) {
                console.error(err);
                setError(err?.message || "Failed to fetch sections.");
            } finally {
                setLoading(false);
            }
        };

        fetchSections();
    }, [wasmModule, reports]);

    return { sections, loading, error };
};

// Hook: Use Sections for Regulatory Frameworks
interface UseSectionsForFrameworks {
    sections: Section[];
    loading: boolean;
    error: string | null;
}

export const useSectionsForRegulatoryFrameworks = (
    frameworks: RegulatoryFramework[]
): UseSectionsForFrameworks => {
    const { wasmModule } = useWasm();
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("TESTasdasd RESPONSE useffect")

        const fetchSections = async () => {
            if (!wasmModule || frameworks.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const allSections: Section[] = [];
                for (const framework of frameworks) {
                    const response = await wasmModule.get_sections_by_regulatory_framework({ input: framework });
                    console.log("TESTasdasd RESPONSE", response)

                    if (response.error) {
                        throw new Error(response.error.message);
                    }
                    allSections.push(...(response.output?.output || []));
                }

                setSections(allSections);
            } catch (err: any) {
                console.error(err);
                setError(err?.message || 'Failed to fetch sections.');
            } finally {
                setLoading(false);
            }
        };

        fetchSections();
    }, [wasmModule, frameworks]);

    return { sections, loading, error };
};

