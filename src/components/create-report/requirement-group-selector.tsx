import React, { useEffect, useState } from "react";
import { List, Checkbox, Button } from "antd";
import { useCreateReportStore } from "@/stores/create-report-store";
import { formatPrice } from "@/utils/payment";

interface RequirementGroupDisplay {
    id: string;
    name: string;
    price_for_group: number;
}

interface SelectRequirementGroupsProps {
    requirementGroups: RequirementGroupDisplay[];
}

const SelectRequirementGroups: React.FC<SelectRequirementGroupsProps> = ({
    requirementGroups,
}) => {
    const { selectedRequirementGroups, setSelectedRequirementGroups } = useCreateReportStore.getState();

    const [showGroups, setShowGroups] = useState(false);

    const [allGroupsSelected, setAllGroupsSelected] = useState(true);
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
            // Remove the group if it already exists
            setSelectedRequirementGroups(
                selectedRequirementGroups.filter((groupId) => groupId !== id)
            );
        } else {
            // Add the group if it doesn't exist
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
