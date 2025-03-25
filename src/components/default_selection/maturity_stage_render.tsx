import React, { useMemo } from 'react';
import { DevelopmentLifeCyclePhase, RegulatoryFramework } from '@wasm';
import { useDescriptionsContext } from '@/contexts/descriptions-context';
import { Spin } from 'antd';

interface DevelopmentLifecycleTimelineProps {
    selectedRegulatoryFramework: RegulatoryFramework;
}

const stages: DevelopmentLifeCyclePhase[] = [
    'concept_and_feasibility',
    'design_and_development',
    'verification_and_validation',
    'regulatory_submission_and_review',
    'manufacturing',
    'market_launch',
    'post_market_surveillance',
    'product_changes_modifications',
    'obsolescence_end_of_life'
];

const formatStageName = (stage: DevelopmentLifeCyclePhase): string => {
    return stage
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const DevelopmentLifecycleTimeline: React.FC<DevelopmentLifecycleTimelineProps> = ({
    selectedRegulatoryFramework
}) => {
    const { deviceDescriptions, loading, error } = useDescriptionsContext();

    console.log("deviceDescriptions", deviceDescriptions);

    const currentStage = useMemo(() => {
        if (loading || error || deviceDescriptions.length === 0) {
            return null;
        }

        // Get the first device's development phase
        const firstDevice = deviceDescriptions[0];

        return firstDevice.description.life_cycle_info.development_phase;

    }, [deviceDescriptions, loading, error]);

    const getStageStatus = (stage: DevelopmentLifeCyclePhase) => {
        if (loading) return 'loading';
        if (!currentStage) return 'inactive';

        const stageIndex = stages.indexOf(stage);
        const currentStageIndex = stages.indexOf(currentStage);

        if (stageIndex === currentStageIndex) return 'current';
        if (stageIndex < currentStageIndex) return 'completed';
        return 'inactive';
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-[8px] left-0 right-0 h-0.5 bg-muted" />

            {/* Stages */}
            <div className="relative flex justify-between">
                {stages.map((stage) => {
                    const status = getStageStatus(stage);
                    return (
                        <div
                            key={stage}
                            className="flex flex-col items-center"
                        >
                            {/* Stage dot */}
                            <div className="w-4 h-4 mb-2">
                                {status === 'loading' ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                ) : (
                                    <div
                                        className={`w-4 h-4 rounded-full ${status === 'current'
                                            ? 'bg-blue-500'
                                            : status === 'completed'
                                                ? 'bg-green-500'
                                                : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>

                            {/* Stage name */}
                            <div className="text-center max-w-[100px]">
                                <span className={`text-xs ${status === 'current'
                                    ? 'text-blue-500'
                                    : status === 'completed'
                                        ? 'text-green-500'
                                        : status === 'loading'
                                            ? 'text-gray-400'
                                            : 'text-gray-400'
                                    }`}>
                                    {formatStageName(stage)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 