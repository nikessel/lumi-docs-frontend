import React from "react";
import { List, Checkbox, Button } from "antd";

interface Group {
    id: string | number;
    name: string;
}

interface Requirement {
    id: string | number;
    name: string;
}

interface RequirementsStepProps {
    groups: Group[];
    requirements: Requirement[];
    selectedGroups: (string | number)[];
    selectedRequirements: (string | number)[];
    setSelectedGroups: React.Dispatch<React.SetStateAction<(string | number)[]>>;
    setSelectedRequirements: React.Dispatch<React.SetStateAction<(string | number)[]>>;
    onBack: () => void;
    onConfirm: () => void;
}

const RequirementsStep: React.FC<RequirementsStepProps> = ({
    groups,
    requirements,
    selectedGroups,
    selectedRequirements,
    setSelectedGroups,
    setSelectedRequirements,
    onBack,
    onConfirm,
}) => {
    const handleGroupSelect = (id: string | number) => {
        setSelectedGroups((prev) =>
            prev.includes(id) ? prev.filter((groupId) => groupId !== id) : [...prev, id]
        );
    };

    const handleRequirementSelect = (id: string | number) => {
        setSelectedRequirements((prev) =>
            prev.includes(id) ? prev.filter((reqId) => reqId !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-4">
            {/* Requirement Groups */}
            <List
                header="Select Requirement Groups"
                bordered
                dataSource={groups}
                renderItem={(group) => (
                    <List.Item>
                        <Checkbox
                            checked={selectedGroups.includes(group.id)}
                            onChange={() => handleGroupSelect(group.id)}
                        >
                            {group.name}
                        </Checkbox>
                    </List.Item>
                )}
            />

            {/* Requirements */}
            <List
                header="Select Requirements"
                bordered
                dataSource={requirements}
                renderItem={(req) => (
                    <List.Item>
                        <Checkbox
                            checked={selectedRequirements.includes(req.id)}
                            onChange={() => handleRequirementSelect(req.id)}
                        >
                            {req.name}
                        </Checkbox>
                    </List.Item>
                )}
            />

            <div className="space-y-2">
                <Button block onClick={onConfirm} disabled={selectedGroups.length === 0}>
                    Confirm Selection
                </Button>
                <Button block onClick={onBack}>
                    Back
                </Button>
            </div>
        </div>
    );
};

export default RequirementsStep;
