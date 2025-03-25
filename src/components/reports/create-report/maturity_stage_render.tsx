import React, { useMemo, useState, useEffect } from 'react';
import { DevelopmentLifeCyclePhase, RegulatoryFramework, Company } from '@wasm';
import { useDescriptionsContext } from '@/contexts/descriptions-context';
import { Spin, Tag, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { getDefaultSelection } from '@/utils/filter-utils';
import { useWasm } from '@/contexts/wasm-context/WasmProvider';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useCreateReportStore } from '@/stores/create-report-store';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import DescriptionCard from './description-card';
import { getAllCompanies } from '@/utils/description-utils';

interface DevelopmentLifecycleTimelineProps {
    selectedRegulatoryFramework: RegulatoryFramework;
    onReady: () => void;
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
    selectedRegulatoryFramework,
    onReady
}) => {
    const { deviceDescriptions, loading, error } = useDescriptionsContext();
    const { wasmModule } = useWasm();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(false);
    const [companiesError, setCompaniesError] = useState<string | null>(null);
    const [completedStages, setCompletedStages] = useState<Set<DevelopmentLifeCyclePhase>>(new Set());
    const [attemptedStages, setAttemptedStages] = useState<Set<DevelopmentLifeCyclePhase>>(new Set());
    const [stageRequirements, setStageRequirements] = useState<Record<DevelopmentLifeCyclePhase, { requirements: string[], loading: boolean, error: string | null }>>(
        stages.reduce((acc, stage) => ({ ...acc, [stage]: { requirements: [], loading: false, error: null } }), {} as Record<DevelopmentLifeCyclePhase, { requirements: string[], loading: boolean, error: string | null }>)
    );

    const { sectionsForRegulatoryFramework } = useSectionsContext();
    const { requirementGroupsBySectionId } = useRequirementGroupsContext();
    const { requirementsByGroupId } = useRequirementsContext();

    const {
        setSelectedFramework,
        setSelectedSections,
        setSelectedDocumentNumbers,
        setSelectedRequirementGroups,
        setSelectedRequirements,
    } = useCreateReportStore();

    const currentStage = useMemo(() => {
        if (loading || error || deviceDescriptions.length === 0) {
            return null;
        }

        // Get the first device's development phase
        const firstDevice = deviceDescriptions[0];
        return firstDevice.description.life_cycle_info.development_phase;
    }, [deviceDescriptions, loading, error]);

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!wasmModule) return;
            setCompaniesLoading(true);
            setCompaniesError(null);
            try {
                const { companies: fetchedCompanies, error } = await getAllCompanies(wasmModule);
                if (error) {
                    setCompaniesError(error);
                } else {
                    setCompanies(fetchedCompanies);
                }
            } catch (err) {
                setCompaniesError(err instanceof Error ? err.message : 'Failed to fetch companies');
            } finally {
                setCompaniesLoading(false);
            }
        };

        fetchCompanies();
    }, [wasmModule]);

    useEffect(() => {
        const fetchRequirementsForStages = async () => {
            if (!currentStage || !wasmModule || deviceDescriptions.length === 0) return;

            const currentStageIndex = stages.indexOf(currentStage);
            let allUniqueRequirements: string[] = [];

            // Fetch requirements for all stages up to and including current stage
            for (let i = 0; i <= currentStageIndex; i++) {
                const stage = stages[i];
                if (stageRequirements[stage].loading) continue; // Skip if already loading

                setStageRequirements(prev => ({
                    ...prev,
                    [stage]: { ...prev[stage], loading: true, error: null }
                }));

                try {
                    // Create a modified device description for this stage
                    const stageDeviceDescriptions = deviceDescriptions.map(device => ({
                        device: {
                            ...device.description,
                            life_cycle_info: {
                                ...device.description.life_cycle_info,
                                development_phase: stage
                            }
                        }
                    }));

                    // Start timing the minimum loading duration
                    const startTime = Date.now();

                    const result = await getDefaultSelection(wasmModule, stageDeviceDescriptions, selectedRegulatoryFramework);

                    // Calculate remaining time to meet minimum loading duration
                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, 500 - elapsedTime); // 500ms minimum loading time
                    await new Promise(resolve => setTimeout(resolve, remainingTime));

                    if (!result.error) {
                        // Get unique requirements for this stage that haven't been seen before
                        const newUniqueRequirements = result.requirements.filter(req => !allUniqueRequirements.includes(req));
                        allUniqueRequirements = [...allUniqueRequirements, ...newUniqueRequirements];

                        setStageRequirements(prev => ({
                            ...prev,
                            [stage]: { requirements: newUniqueRequirements, loading: false, error: null }
                        }));

                        // Mark this stage as completed
                        setCompletedStages(prev => new Set([...prev, stage]));
                    } else {
                        setStageRequirements(prev => ({
                            ...prev,
                            [stage]: { requirements: [], loading: false, error: result.error }
                        }));
                    }
                } catch (err) {
                    console.error(`Error fetching requirements for stage ${stage}:`, err);
                    setStageRequirements(prev => ({
                        ...prev,
                        [stage]: { requirements: [], loading: false, error: err instanceof Error ? err.message : 'Unknown error occurred' }
                    }));
                }

                // Mark this stage as attempted
                setAttemptedStages(prev => new Set([...prev, stage]));
            }

            // Update the selected requirements with all unique requirements
            setSelectedRequirements(allUniqueRequirements);

            // Find all requirement groups that contain our selected requirements
            const selectedRequirementGroups = new Set<string>();
            Object.entries(requirementsByGroupId).forEach(([groupId, requirements]) => {
                if (requirements.some(req => allUniqueRequirements.includes(req.id))) {
                    selectedRequirementGroups.add(groupId);
                }
            });

            // Find all sections that contain our selected requirement groups
            const selectedSections = new Set<string>();
            Object.entries(requirementGroupsBySectionId).forEach(([sectionId, groups]) => {
                if (groups.some(group => selectedRequirementGroups.has(group.id))) {
                    selectedSections.add(sectionId);
                }
            });

            // Update the selected sections and requirement groups
            setSelectedSections(Array.from(selectedSections));
            setSelectedRequirementGroups(Array.from(selectedRequirementGroups));

            onReady();
        };

        fetchRequirementsForStages();
    }, [currentStage, wasmModule, deviceDescriptions, selectedRegulatoryFramework]);

    const getStageStatus = (stage: DevelopmentLifeCyclePhase) => {
        if (loading) return 'loading';
        if (!currentStage) return 'inactive';

        const stageIndex = stages.indexOf(stage);
        const currentStageIndex = stages.indexOf(currentStage);

        // For stages up to and including current stage
        if (stageIndex <= currentStageIndex) {
            // If we haven't attempted to load this stage yet, show it as loading
            if (!attemptedStages.has(stage)) {
                return 'loading';
            }

            // Only mark as current or completed if we have received the default selections
            if (stageIndex === currentStageIndex) {
                return completedStages.has(stage) ? 'current' : 'loading';
            }
            if (stageIndex < currentStageIndex) {
                return completedStages.has(stage) ? 'completed' : 'loading';
            }
        }

        // For stages after current stage
        // Only show loading if we haven't checked all stages up to current stage yet
        const allStagesUpToCurrentChecked = stages
            .slice(0, currentStageIndex + 1)
            .every(s => attemptedStages.has(s));

        if (!allStagesUpToCurrentChecked) {
            return 'loading';
        }

        return 'inactive';
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="flex gap-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {deviceDescriptions.length > 0 && (
                    <div className="flex-1">
                        <DescriptionCard
                            description={deviceDescriptions[0].description}
                            title="Device Information"
                        />
                    </div>
                )}
                {companies.length > 0 && (
                    <div className="flex-1">
                        <DescriptionCard
                            description={companies[0].description}
                            title="Company Information"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}; 