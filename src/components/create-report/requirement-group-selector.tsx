import React, { useEffect, useState } from "react";
import { List, Checkbox, Button } from "antd";

interface RequirementGroup {
    id: string;
    name: string;
}

interface SelectRequirementGroupsProps {
    requirementGroups: RequirementGroup[];
    selectedRequirementGroups: string[];
    setSelectedRequirementGroups: React.Dispatch<React.SetStateAction<string[]>>;
}

const SelectRequirementGroups: React.FC<SelectRequirementGroupsProps> = ({
    requirementGroups,
    selectedRequirementGroups,
    setSelectedRequirementGroups,
}) => {
    const [showGroups, setShowGroups] = useState(false);

    useEffect(() => {
        // Default to all groups selected
        if (requirementGroups.length > 0 && selectedRequirementGroups.length === 0) {
            setSelectedRequirementGroups(requirementGroups.map((group) => group.id));
        }
    }, [requirementGroups, selectedRequirementGroups, setSelectedRequirementGroups]);

    const handleAllGroupsToggle = (checked: boolean) => {
        if (checked) {
            setSelectedRequirementGroups(requirementGroups.map((group) => group.id)); // Select all groups
        } else {
            setSelectedRequirementGroups([]); // Deselect all groups
        }
    };

    const handleGroupSelect = (id: string) => {
        setSelectedRequirementGroups((prev) => {
            if (prev.includes(id)) {
                return prev.filter((groupId) => groupId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const toggleShowGroups = () => {
        setShowGroups((prev) => !prev);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center">
                <Checkbox
                    checked={selectedRequirementGroups.length === requirementGroups.length}
                    onChange={(e) => handleAllGroupsToggle(e.target.checked)}
                >
                    All Requirement Groups ({requirementGroups.length})
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
                            <Checkbox
                                checked={selectedRequirementGroups.includes(group.id)}
                                onChange={() => handleGroupSelect(group.id)}
                            >
                                {group.name}
                            </Checkbox>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default SelectRequirementGroups;
