import React, { useEffect, useState } from "react";
import { List, Checkbox, Button } from "antd";
import { useCreateReportStore } from "@/stores/create-report-store";
import { formatPrice } from "@/utils/payment";
import { useRequirementGroupsContext } from "@/contexts/requirement-group-context";
import { useRequirementsContext } from "@/contexts/requirements-context";
import { useRequirementPriceContext } from "@/contexts/price-context/use-requirement-price-context";
import { getPriceForGroup } from "@/utils/payment";

const SelectRequirementGroups: React.FC = () => {
    const { selectedSections } = useCreateReportStore.getState();
    const { requirementGroupsBySectionId } = useRequirementGroupsContext();
    const { requirementsByGroupId } = useRequirementsContext();
    const { userPrice, defaultPrice } = useRequirementPriceContext();
    const { selectedRequirementGroups, setSelectedRequirementGroups } = useCreateReportStore.getState();

    const [showGroups, setShowGroups] = useState(false);
    const [allGroupsSelected, setAllGroupsSelected] = useState(true);

    // Compute requirement groups based on selected sections
    const requirementGroups = selectedSections
        .flatMap((sectionId) => requirementGroupsBySectionId[sectionId] || [])
        .map((group) => ({
            id: group.id,
            name: group.name || "Unknown",
            price_for_group: getPriceForGroup(group.id, requirementsByGroupId, userPrice ? userPrice : defaultPrice),
        }));

    useEffect(() => {
        setAllGroupsSelected(selectedRequirementGroups.length === requirementGroups.length);
    }, [selectedRequirementGroups, requirementGroups]);

    const handleAllGroupsToggle = (checked: boolean) => {
        setAllGroupsSelected(checked);
        if (checked) {
            setSelectedRequirementGroups(requirementGroups.map((group) => group.id)); // Select all groups
        } else {
            setSelectedRequirementGroups([]); // Deselect all groups
        }
    };

    const handleGroupSelect = (id: string) => {
        if (selectedRequirementGroups.includes(id)) {
            setSelectedRequirementGroups(
                selectedRequirementGroups.filter((groupId) => groupId !== id)
            );
        } else {
            setSelectedRequirementGroups([...selectedRequirementGroups, id]);
        }
    };

    const toggleShowGroups = () => {
        setShowGroups((prev) => !prev);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center">
                <Checkbox
                    checked={allGroupsSelected}
                    onChange={(e) => handleAllGroupsToggle(e.target.checked)}
                >
                    All Requirement Groups ({selectedRequirementGroups.length}/{requirementGroups.length})
                </Checkbox>
                <Button type="link" onClick={toggleShowGroups}>
                    {showGroups ? "Hide groups" : "Show groups"}
                </Button>
            </div>

            {showGroups && (
                <List
                    header="Select Requirement Groups"
                    bordered
                    dataSource={requirementGroups}
                    renderItem={(group) => (
                        <List.Item>
                            <div className="flex justify-between items-center w-full">
                                <Checkbox
                                    checked={selectedRequirementGroups.includes(group.id)}
                                    onChange={() => handleGroupSelect(group.id)}
                                >
                                    {group.name}
                                </Checkbox>
                                <div className="px-2 py-1 rounded-md text-primary bg-bg_secondary text-center text-xs">{formatPrice(group.price_for_group)}</div>
                            </div>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default SelectRequirementGroups;
