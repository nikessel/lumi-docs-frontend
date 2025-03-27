import React, { useMemo, useState, useEffect } from 'react';
import { RegulatoryFramework } from '@wasm';
import { useDescriptionsContext } from '@/contexts/descriptions-context';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { getApplicableFieldPaths, getDefaultSelectionFieldPaths, getMultipleDefaultSelectedRequirementIds } from '@/utils/filter-utils';
import DescriptionCard from './description-card';
import type { Device, Company, Trial, Description, DeviceDescription, CompanyDescription, TrialDescription } from '@wasm';
import { GetDefaultSelectedRequirementIdsInput, GetMultipleDefaultSelectedRequirementIdsInput } from '@wasm';
import AISuggestionsReview from './ai-suggestions-review';

// Define which fields can have multiple values
const MULTI_SELECT_FIELDS = [
    'quality_management.quality_management_system_maturity',
    'software_info.lifecycle_phase',
    'basic_info.lifecycle_phase'
] as const;

type MultiSelectField = typeof MULTI_SELECT_FIELDS[number];

// Create a type that allows arrays for multi-select fields
type MultiSelectDeviceDescription = Omit<DeviceDescription, MultiSelectField> & {
    'software_info.lifecycle_phase'?: DeviceDescription['software_info']['lifecycle_phase'] | DeviceDescription['software_info']['lifecycle_phase'][];
};

type MultiSelectCompanyDescription = Omit<CompanyDescription, MultiSelectField> & {
    'quality_management.quality_management_system_maturity'?: CompanyDescription['quality_management']['quality_management_system_maturity'] | CompanyDescription['quality_management']['quality_management_system_maturity'][];
};

type MultiSelectTrialDescription = Omit<TrialDescription, MultiSelectField> & {
    'basic_info.lifecycle_phase'?: TrialDescription['basic_info']['lifecycle_phase'] | TrialDescription['basic_info']['lifecycle_phase'][];
};

interface DescriptionCustomizerProps {
    selectedRegulatoryFramework: RegulatoryFramework;
}

// Function to convert a description with multi-select fields into multiple backend descriptions
function convertToBackendDescriptions<T extends DeviceDescription | CompanyDescription | TrialDescription>(
    description: MultiSelectDeviceDescription | MultiSelectCompanyDescription | MultiSelectTrialDescription,
    type: 'device' | 'company' | 'trial'
): Description[] {
    console.log('000000000 Input description:', description);
    console.log('000000000 Type:', type);

    // Find all multi-select fields that have multiple values
    const multiSelectValues = MULTI_SELECT_FIELDS.reduce((acc: { [key: string]: any[] }, field) => {
        // Split the field path into parts (e.g., 'quality_management.quality_management_system_maturity' -> ['quality_management', 'quality_management_system_maturity'])
        const parts = field.split('.');
        let currentValue: any = description;

        // Navigate through the nested structure
        for (const part of parts) {
            if (currentValue && typeof currentValue === 'object') {
                currentValue = currentValue[part as keyof typeof currentValue];
            } else {
                currentValue = undefined;
                break;
            }
        }

        console.log(`Checking field ${field}:`, currentValue);
        if (Array.isArray(currentValue) && currentValue.length > 1) {
            acc[field] = currentValue;
        }
        return acc;
    }, {});

    console.log('000000000 Found multi-select values:', multiSelectValues);

    // If no multi-select fields have multiple values, return the original description
    if (Object.keys(multiSelectValues).length === 0) {
        console.log('000000000 No multi-select fields found, returning original description');
        return [{
            device: type === 'device' ? description as DeviceDescription : undefined,
            company: type === 'company' ? description as CompanyDescription : undefined,
            trial: type === 'trial' ? description as TrialDescription : undefined
        } as Description];
    }

    // Create all possible combinations
    const combinations = Object.entries(multiSelectValues).reduce((acc: any[], [field, values]) => {
        console.log(`000000000 Processing field ${field} with values:`, values);
        if (acc.length === 0) {
            // First multi-select field
            const result = values.map(value => {
                // Create a deep copy of the description
                const newDesc = JSON.parse(JSON.stringify(description));
                // Split the field path and set the value in the nested structure
                const parts = field.split('.');
                let current: any = newDesc;
                for (let i = 0; i < parts.length - 1; i++) {
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = value;
                return newDesc;
            });
            console.log('000000000 First field combinations:', result);
            return result;
        } else {
            // Subsequent multi-select fields
            const result = acc.flatMap(desc =>
                values.map(value => {
                    // Create a deep copy of the description
                    const newDesc = JSON.parse(JSON.stringify(desc));
                    // Split the field path and set the value in the nested structure
                    const parts = field.split('.');
                    let current: any = newDesc;
                    for (let i = 0; i < parts.length - 1; i++) {
                        current = current[parts[i]];
                    }
                    current[parts[parts.length - 1]] = value;
                    return newDesc;
                })
            );
            console.log(`000000000 Combinations after processing ${field}:`, result);
            return result;
        }
    }, []);

    console.log('Final combinations:', combinations);

    // Convert combinations to Description objects
    const result = combinations.map(desc => ({
        device: type === 'device' ? desc as DeviceDescription : undefined,
        company: type === 'company' ? desc as CompanyDescription : undefined,
        trial: type === 'trial' ? desc as TrialDescription : undefined
    } as Description));

    console.log('Final result:', result);
    return result;
}

export const DescriptionCustomizer: React.FC<DescriptionCustomizerProps> = ({
    selectedRegulatoryFramework,
}) => {
    const { devices, companies, trials, loading: descriptionsLoading, error } = useDescriptionsContext();
    const { wasmModule } = useWasm();
    const [fieldPaths, setFieldPaths] = useState<Map<string, string[]>>(new Map());
    const [loadingFieldPaths, setLoadingFieldPaths] = useState(true);
    const [defaultRequirements, setDefaultRequirements] = useState<string[]>([]);

    // State for descriptions with multi-select support
    const [deviceDescription, setDeviceDescription] = useState<MultiSelectDeviceDescription | null>(null);
    const [companyDescription, setCompanyDescription] = useState<MultiSelectCompanyDescription | null>(null);
    const [trialDescription, setTrialDescription] = useState<MultiSelectTrialDescription | null>(null);

    // Initialize descriptions when data is loaded
    useEffect(() => {
        if (devices.length > 0) {
            setDeviceDescription(devices[0].description as MultiSelectDeviceDescription);
        }
        if (companies.length > 0) {
            setCompanyDescription(companies[0].description as MultiSelectCompanyDescription);
        }
        if (trials.length > 0) {
            setTrialDescription(trials[0].description as MultiSelectTrialDescription);
        }
    }, [devices, companies, trials]);

    // Function to handle description changes
    const handleDescriptionChange = (newDescription: any, type: 'device' | 'company' | 'trial') => {
        switch (type) {
            case 'device':
                setDeviceDescription(newDescription as MultiSelectDeviceDescription);
                break;
            case 'company':
                setCompanyDescription(newDescription as MultiSelectCompanyDescription);
                break;
            case 'trial':
                setTrialDescription(newDescription as MultiSelectTrialDescription);
                break;
        }
    };

    // Function to fetch default selection for multiple descriptions
    const fetchDefaultSelection = async () => {
        if (!wasmModule) return;

        const allDescriptions: Description[] = [];

        // Convert and add trial descriptions
        if (trialDescription) {
            allDescriptions.push(...convertToBackendDescriptions(trialDescription, 'trial'));
        }

        // Convert and add device descriptions
        if (deviceDescription) {
            allDescriptions.push(...convertToBackendDescriptions(deviceDescription, 'device'));
        }

        // Convert and add company descriptions
        if (companyDescription) {
            allDescriptions.push(...convertToBackendDescriptions(companyDescription, 'company'));
        }

        // Only proceed if we have descriptions to process
        if (allDescriptions.length === 0) {
            setDefaultRequirements([]);
            return;
        }

        const frameworksAndDescriptions = new Map<number, [RegulatoryFramework, Description[]]>();

        // Group descriptions by type
        const deviceDescriptions = allDescriptions.filter((desc): desc is Description & { device: DeviceDescription } =>
            'device' in desc && desc.device !== undefined);
        const companyDescriptions = allDescriptions.filter((desc): desc is Description & { company: CompanyDescription } =>
            'company' in desc && desc.company !== undefined);
        const trialDescriptions = allDescriptions.filter((desc): desc is Description & { trial: TrialDescription } =>
            'trial' in desc && desc.trial !== undefined);

        // Create entries for each combination
        let index = 0;
        deviceDescriptions.forEach(deviceDesc => {
            companyDescriptions.forEach(companyDesc => {
                trialDescriptions.forEach(trialDesc => {
                    // Create an array of three separate Description objects
                    const descriptions: Description[] = [
                        { device: deviceDesc.device },
                        { company: companyDesc.company },
                        { trial: trialDesc.trial }
                    ];

                    frameworksAndDescriptions.set(index, [selectedRegulatoryFramework, descriptions]);
                    index++;
                });
            });
        });

        const input: GetMultipleDefaultSelectedRequirementIdsInput = {
            frameworks_and_descriptions: frameworksAndDescriptions
        };

        console.log("Input for getMultipleDefaultSelectedRequirementIds:", input);
        const { requirements, error } = await getMultipleDefaultSelectedRequirementIds(wasmModule, input);

        if (error) {
            console.error('Error fetching default selection:', error);
            setDefaultRequirements([]);
        } else {
            // Remove duplicates from requirements
            const uniqueRequirements = [...new Set(requirements)];
            console.log("Requirements:asdasdasdasd", uniqueRequirements, error);

            setDefaultRequirements(uniqueRequirements);
        }
    };

    // Call fetchDefaultSelection when descriptions change
    useEffect(() => {
        fetchDefaultSelection();
    }, [deviceDescription, companyDescription, trialDescription]);

    useEffect(() => {
        const fetchFieldPaths = async () => {
            if (!wasmModule) return;
            setLoadingFieldPaths(true);

            const input = {
                regulatory_framework: selectedRegulatoryFramework,
                trial: trials.length > 0 ? trials[0] : undefined,
                device: devices.length > 0 ? devices[0] : undefined,
                company: companies.length > 0 ? companies[0] : undefined
            };

            const { fieldPaths: applicablePaths, error: applicableError } = await getApplicableFieldPaths(wasmModule, input);
            const { fieldPaths: defaultPaths, error: defaultError } = await getDefaultSelectionFieldPaths(wasmModule, input);

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

            setFieldPaths(combinedPaths);
            setLoadingFieldPaths(false);
        };

        fetchFieldPaths();
    }, [wasmModule, selectedRegulatoryFramework, devices, companies, trials]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="flex gap-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <div className="w-1/2 flex flex-col gap-4">
                    {descriptionsLoading || loadingFieldPaths ? (
                        <DescriptionCard
                            description={null}
                            title={"Loading"}
                            applicableFieldPaths={fieldPaths}
                            isLoading={descriptionsLoading || loadingFieldPaths}
                            onDescriptionChange={() => { }}
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
                                        description={description}
                                        title={`${key.charAt(0).toUpperCase() + key.slice(1)} Information`}
                                        applicableFieldPaths={fieldPaths}
                                        isLoading={descriptionsLoading || loadingFieldPaths}
                                        onDescriptionChange={handleDescriptionChangeForType}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="w-1/2">
                    <AISuggestionsReview
                        onCustomize={() => { }}
                        requirementIds={defaultRequirements}
                        framework={selectedRegulatoryFramework}
                        isLoading={descriptionsLoading || loadingFieldPaths}
                    />
                </div>
            </div>
        </div>
    );
}; 