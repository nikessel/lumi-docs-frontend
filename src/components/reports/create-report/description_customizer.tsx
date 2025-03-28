import React, { useState, useEffect } from 'react';
import { RegulatoryFramework } from '@wasm';
import { useDescriptionsContext } from '@/contexts/descriptions-context';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { getApplicableFieldPaths, getDefaultSelectionFieldPaths, getMultipleDefaultSelectedRequirementIds } from '@/utils/filter-utils';
import DescriptionCard from './description-card';
import type { Description, DeviceDescription, CompanyDescription, TrialDescription } from '@wasm';
import { GetMultipleDefaultSelectedRequirementIdsInput } from '@wasm';
import AISuggestionsReview from './ai-suggestions-review';

interface DescriptionCustomizerProps {
    selectedRegulatoryFramework: RegulatoryFramework;
}

export const DescriptionCustomizer: React.FC<DescriptionCustomizerProps> = ({
    selectedRegulatoryFramework,
}) => {
    const { devices, companies, trials, loading: descriptionsLoading, error } = useDescriptionsContext();
    const { wasmModule } = useWasm();
    const [fieldPaths, setFieldPaths] = useState<Map<string, string[]>>(new Map());
    const [loadingFieldPaths, setLoadingFieldPaths] = useState(true);
    const [defaultRequirements, setDefaultRequirements] = useState<string[]>([]);
    const [highlightChanges, setHighlightChanges] = useState(false);
    // State for descriptions with multi-select support
    const [deviceDescription, setDeviceDescription] = useState<DeviceDescription[]>([]);
    const [companyDescription, setCompanyDescription] = useState<CompanyDescription[]>([]);
    const [trialDescription, setTrialDescription] = useState<TrialDescription[]>([]);

    // Initialize descriptions when data is loaded
    useEffect(() => {
        if (!descriptionsLoading) {
            if (devices.length > 0) {
                setDeviceDescription([devices[0].description]);
            }
            if (companies.length > 0) {
                setCompanyDescription([companies[0].description]);
            }
            if (trials.length > 0) {
                setTrialDescription([trials[0].description]);
            }
        }
    }, [descriptionsLoading, devices, companies, trials]);

    useEffect(() => {
        console.log("USEEFFECTTTTTR", wasmModule, descriptionsLoading, deviceDescription, companyDescription, trialDescription)
        const fetchDefaultSelection = async () => {
            if (!wasmModule || descriptionsLoading) return;

            const frameworksAndDescriptions = new Map<number, [RegulatoryFramework, Description[]]>();

            let index = 0;
            for (const device of deviceDescription) {
                for (const company of companyDescription) {
                    for (const trial of trialDescription) {
                        const descriptions: Description[] = [];

                        if (device) descriptions.push({ device });
                        if (company) descriptions.push({ company });
                        if (trial) descriptions.push({ trial });

                        frameworksAndDescriptions.set(index, [selectedRegulatoryFramework, descriptions]);
                        index++;
                    }
                }
            }

            // Only proceed if we have actual data
            if (frameworksAndDescriptions.size === 0) {
                console.log("[fetchDefaultSelection] No data to process, skipping API call");
                setDefaultRequirements([]);
                return;
            }

            const input: GetMultipleDefaultSelectedRequirementIdsInput = {
                frameworks_and_descriptions: frameworksAndDescriptions
            };

            console.log("[fetchDefaultSelection] Input:", input);

            const { requirements, error } = await getMultipleDefaultSelectedRequirementIds(wasmModule, input);

            if (error) {
                console.error('[fetchDefaultSelection] Error:', error);
                setDefaultRequirements([]);
            } else {
                const uniqueRequirements = [...new Set(requirements)];
                setDefaultRequirements(uniqueRequirements);
                console.log("[fetchDefaultSelection] Requirements:", uniqueRequirements);
            }
        };

        fetchDefaultSelection();
    }, [wasmModule, selectedRegulatoryFramework, deviceDescription, companyDescription, trialDescription, descriptionsLoading]);

    // Function to handle description changes
    const handleDescriptionChange = React.useCallback((newDescriptions: any[], type: 'device' | 'company' | 'trial') => {
        switch (type) {
            case 'device':
                setDeviceDescription(newDescriptions);
                break;
            case 'company':
                setCompanyDescription(newDescriptions);
                break;
            case 'trial':
                setTrialDescription(newDescriptions);
                break;
        }
    }, []);

    useEffect(() => {
        const fetchFieldPaths = async () => {
            if (!wasmModule || descriptionsLoading) return;
            setLoadingFieldPaths(true);

            // Add a minimum delay to ensure loading state is visible
            const minDelay = new Promise(resolve => setTimeout(resolve, 500));

            try {
                const input = {
                    regulatory_framework: selectedRegulatoryFramework,
                    trial: trials.length > 0 ? trials[0] : undefined,
                    device: devices.length > 0 ? devices[0] : undefined,
                    company: companies.length > 0 ? companies[0] : undefined
                };

                const [{ fieldPaths: applicablePaths, error: applicableError }, { fieldPaths: defaultPaths, error: defaultError }] = await Promise.all([
                    getApplicableFieldPaths(wasmModule, input),
                    getDefaultSelectionFieldPaths(wasmModule, input)
                ]);

                if (applicableError) console.error('Applicable field paths error:', applicableError);
                if (defaultError) console.error('Default field paths error:', defaultError);

                // Merge the maps by combining arrays for each key
                const combinedPaths = new Map();
                for (const [key, value] of applicablePaths) {
                    combinedPaths.set(key, [...value]);
                }
                for (const [key, value] of defaultPaths) {
                    if (combinedPaths.has(key)) {
                        // Merge arrays and remove duplicates
                        combinedPaths.set(key, [...new Set([...combinedPaths.get(key), ...value])]);
                    } else {
                        combinedPaths.set(key, value);
                    }
                }

                // Wait for minimum delay before updating state
                await minDelay;
                setFieldPaths(combinedPaths);
            } catch (error) {
                console.error('Error fetching field paths:', error);
                await minDelay;
            } finally {
                setLoadingFieldPaths(false);
            }
        };

        fetchFieldPaths();
    }, [wasmModule, selectedRegulatoryFramework, devices, companies, trials, descriptionsLoading]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="flex gap-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <div className="w-1/2 flex flex-col gap-4">
                    {descriptionsLoading || loadingFieldPaths ? (
                        <DescriptionCard
                            description={[]}
                            title={"Loading"}
                            applicableFieldPaths={fieldPaths}
                            isLoading={descriptionsLoading || loadingFieldPaths}
                            onDescriptionChange={() => { }}
                            rootKey={'device'}
                            setHighlightChanges={setHighlightChanges}
                        />
                    ) : (
                        Array.from(fieldPaths.keys()).map((key) => {
                            const description = key === 'trial' ? trialDescription
                                : key === 'company' ? companyDescription
                                    : key === 'device' ? deviceDescription
                                        : null;

                            const handleDescriptionChangeForType = (newDescription: any) => {
                                handleDescriptionChange(newDescription, key as 'device' | 'company' | 'trial');
                            };

                            return (
                                <div key={key}>
                                    <DescriptionCard
                                        description={description ?? []}
                                        title={`${key.charAt(0).toUpperCase() + key.slice(1)} Information`}
                                        applicableFieldPaths={fieldPaths}
                                        isLoading={descriptionsLoading || loadingFieldPaths}
                                        onDescriptionChange={handleDescriptionChangeForType}
                                        rootKey={key as 'device' | 'company' | 'trial'}
                                        setHighlightChanges={setHighlightChanges}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="w-1/2">
                    {<AISuggestionsReview
                        onCustomize={() => { }}
                        requirementIds={defaultRequirements}
                        framework={selectedRegulatoryFramework}
                        isLoading={descriptionsLoading || loadingFieldPaths}
                        highlightChanges={highlightChanges}
                    />}
                </div>
            </div>
        </div>
    );
}; 