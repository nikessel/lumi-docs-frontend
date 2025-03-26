import React, { useMemo, useState, useEffect } from 'react';
import { RegulatoryFramework } from '@wasm';
import { useDescriptionsContext } from '@/contexts/descriptions-context';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { getApplicableFieldPaths, getDefaultSelectionFieldPaths, getDefaultSelection } from '@/utils/filter-utils';
import DescriptionCard from './description-card';
import type { Device, Company, Trial, Description, DeviceDescription, CompanyDescription, TrialDescription } from '@wasm';
import { GetDefaultSelectedRequirementIdsInput } from '@wasm';

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

    // State for descriptions
    const [deviceDescription, setDeviceDescription] = useState<DeviceDescription | null>(null);
    const [companyDescription, setCompanyDescription] = useState<CompanyDescription | null>(null);
    const [trialDescription, setTrialDescription] = useState<TrialDescription | null>(null);

    // Initialize descriptions when data is loaded
    useEffect(() => {
        if (devices.length > 0) {
            setDeviceDescription(devices[0].description);
        }
        if (companies.length > 0) {
            setCompanyDescription(companies[0].description);
        }
        if (trials.length > 0) {
            setTrialDescription(trials[0].description);
        }
    }, [devices, companies, trials]);

    // Function to fetch default selection
    const fetchDefaultSelection = async () => {
        if (!wasmModule) return;
        const descriptions: Description[] = [];

        if (trialDescription) {
            descriptions.push({ trial: trialDescription });
        }
        if (deviceDescription) {
            descriptions.push({ device: deviceDescription });
        }
        if (companyDescription) {
            descriptions.push({ company: companyDescription });
        }

        const input: GetDefaultSelectedRequirementIdsInput = {
            regulatory_framework: selectedRegulatoryFramework,
            descriptions,
        };
        const { requirements, error } = await getDefaultSelection(wasmModule, input);

        console.log("eteteteterasdasdqw34", requirements, input)

        if (error) {
            console.error('Error fetching default selection:', error);
        } else {
            console.log('Number of default selected requirements:', requirements.length);
            setDefaultRequirements(requirements);
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

            console.log('Combined Field Paths:', Object.fromEntries(combinedPaths));
            setFieldPaths(combinedPaths);
            setLoadingFieldPaths(false);
        };

        fetchFieldPaths();
    }, [wasmModule, selectedRegulatoryFramework, devices, companies, trials]);

    if (descriptionsLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {defaultRequirements.length}
            <div className="flex gap-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {Array.from(fieldPaths.keys()).map((key) => {
                    const description = key === 'trial' && trialDescription
                        ? trialDescription
                        : key === 'company' && companyDescription
                            ? companyDescription
                            : key === 'device' && deviceDescription
                                ? deviceDescription
                                : null;

                    if (!description) return null;

                    const handleDescriptionChange = (newDescription: any) => {
                        switch (key) {
                            case 'trial':
                                setTrialDescription(newDescription);
                                break;
                            case 'company':
                                setCompanyDescription(newDescription);
                                break;
                            case 'device':
                                setDeviceDescription(newDescription);
                                break;
                        }
                    };

                    return (
                        <div key={key} className="flex-1">
                            <DescriptionCard
                                description={description}
                                title={`${key.charAt(0).toUpperCase() + key.slice(1)} Information`}
                                applicableFieldPaths={fieldPaths}
                                isLoading={loadingFieldPaths}
                                onDescriptionChange={handleDescriptionChange}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 