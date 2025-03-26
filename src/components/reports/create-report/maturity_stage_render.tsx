import React, { useMemo, useState, useEffect } from 'react';
import { DevelopmentLifeCyclePhase, RegulatoryFramework, Company, Trial } from '@wasm';
import { useDescriptionsContext } from '@/contexts/descriptions-context';
import { Spin, Tag, Tooltip, Card, Typography } from 'antd';
// import { CloseOutlined } from '@ant-design/icons';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
// import { useDefaultSelectionFetcher } from '@/hooks/default-selection';
// import { useSectionsContext } from '@/contexts/sections-context';
// import { useRequirementsContext } from '@/contexts/requirements-context';
// import { useCreateReportStore } from '@/stores/create-report-store';
// import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import DescriptionCard from './description-card';

const { Title, Paragraph } = Typography;

interface DevelopmentLifecycleTimelineProps {
    selectedRegulatoryFramework: RegulatoryFramework;
    onReady: () => void;
}

// const developmentLifeCyclePhases: DevelopmentLifeCyclePhase[] = [
//     'concept_and_feasibility',
//     'design_and_development',
//     'verification_and_validation',
//     'regulatory_submission_and_review',
//     'manufacturing',
//     'market_launch',
//     'post_market_surveillance',
//     'product_changes_modifications',
//     'obsolescence_end_of_life'
// ];

// const formatStageName = (stage: DevelopmentLifeCyclePhase): string => {
//     return stage
//         .split('_')
//         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(' ');
// };

export const DevelopmentLifecycleTimeline: React.FC<DevelopmentLifecycleTimelineProps> = ({
    selectedRegulatoryFramework,
    onReady
}) => {
    const { devices, companies, trials, loading: descriptionsLoading, error } = useDescriptionsContext();
    const { wasmModule } = useWasm();
    const [readyCards, setReadyCards] = useState<Set<string>>(new Set());

    const currentStage = useMemo(() => {
        if (descriptionsLoading || error || devices.length === 0) {
            return null;
        }

        // Get the first device's development phase
        const firstDevice = devices[0];
        return firstDevice.description.life_cycle_info.development_phase;
    }, [devices, descriptionsLoading, error]);

    // const {
    //     stageRequirements,
    //     completedStages,
    //     attemptedStages,
    //     stagesProcessed
    // } = useDefaultSelectionFetcher({
    //     currentStage,
    //     wasmModule,
    //     devices,
    //     selectedRegulatoryFramework,
    //     developmentLifeCyclePhases
    // });

    // Use the default selection fetcher hook
    // const defaultSelection = useDefaultSelectionFetcher({
    //     wasmModule,
    //     ...(selectedRegulatoryFramework === 'iso14155' && trials.length > 0
    //         ? { regulatoryFramework: 'iso14155' as const, trial: trials[0] }
    //         : selectedRegulatoryFramework === 'iso14971' && devices.length > 0 && companies.length > 0
    //             ? { regulatoryFramework: 'iso14971' as const, device: devices[0], company: companies[0] }
    //             : selectedRegulatoryFramework === 'iso13485' && companies.length > 0
    //                 ? { regulatoryFramework: 'iso13485' as const, company: companies[0] }
    //                 : selectedRegulatoryFramework === 'iec62304' && devices.length > 0
    //                     ? { regulatoryFramework: 'iec62304' as const, device: devices[0] }
    //                     : selectedRegulatoryFramework === 'iec62366' && devices.length > 0
    //                         ? { regulatoryFramework: 'iec62366' as const, device: devices[0] }
    //                         : { regulatoryFramework: 'iso14155' as const, trial: trials[0] })
    // });

    // Log the default selection results
    // useEffect(() => {
    //     if (selectedRegulatoryFramework === 'iso14155') {
    //         console.log('Default Selection Results:', {
    //             allRequirements: defaultSelection.allRequirements,
    //             requirementsByPhase: defaultSelection.requirementsByPhase,
    //             variableImpact: defaultSelection.variableImpact
    //         });
    //     }
    // }, [defaultSelection, selectedRegulatoryFramework]);

    const handleCardReady = (cardId: string) => {
        setReadyCards(prev => {
            const newSet = new Set(prev);
            newSet.add(cardId);
            return newSet;
        });
    };

    // Check if all required cards are ready
    useEffect(() => {
        const isIso14155 = selectedRegulatoryFramework === 'iso14155';
        const requiredCards = isIso14155 ? ['trial', 'company'] : ['company', 'device'];
        const allCardsReady = requiredCards.every(card => readyCards.has(card));

        if (allCardsReady) {
            onReady();
        }
    }, [readyCards, selectedRegulatoryFramework, onReady]);


    if (descriptionsLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="flex gap-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {selectedRegulatoryFramework === 'iso14155' ? (
                    <>
                        {trials.length > 0 && (
                            <div className="flex-1">
                                <DescriptionCard
                                    description={trials[0].description}
                                    title="Trial Information"
                                    onReady={() => handleCardReady('trial')}
                                />
                            </div>
                        )}
                        {companies.length > 0 && (
                            <div className="flex-1">
                                <DescriptionCard
                                    description={companies[0].description}
                                    title="Company Information"
                                    onReady={() => handleCardReady('company')}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {companies.length > 0 && (
                            <div className="flex-1">
                                <DescriptionCard
                                    description={companies[0].description}
                                    title="Company Information"
                                    onReady={() => handleCardReady('company')}
                                />
                            </div>
                        )}
                        {devices.length > 0 && (
                            <div className="flex-1">
                                <DescriptionCard
                                    description={devices[0].description}
                                    title="Device Information"
                                    onReady={() => handleCardReady('device')}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Display the variable impact results */}
            {/* {selectedRegulatoryFramework === 'iso14155' && defaultSelection.variableImpact && (
                <div className="mt-8">
                    <Title level={4}>Variable Impact Analysis</Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(defaultSelection.variableImpact).map(([key, impact]) => (
                            <Card key={key} title={key.replace(/_/g, ' ').toUpperCase()}>
                                <Paragraph>Current Value: {impact.currentValue}</Paragraph>
                                <Paragraph>Possible Values:</Paragraph>
                                <ul className="list-disc pl-5">
                                    {impact.possibleValues.map((value, index) => (
                                        <li key={index}>
                                            {value.value}: {value.uniqueRequirements.length} new requirements
                                            (Total: {value.totalRequirements})
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                </div>
            )} */}
        </div>
    );
}; 