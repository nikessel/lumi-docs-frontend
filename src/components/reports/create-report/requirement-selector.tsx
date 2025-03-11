import React, { useEffect, useState } from "react";
import { List, Checkbox, Button } from "antd";
import { useCreateReportStore } from "@/stores/create-report-store";
import { formatPrice } from "@/utils/payment";

interface RequirementDisplay {
    id: string;
    name: string;
    price_for_requirement: number;
}

interface SelectRequirementsProps {
    requirements: RequirementDisplay[];
}

const SelectRequirements: React.FC<SelectRequirementsProps> = ({
    requirements,
}) => {
    const { selectedRequirements, setSelectedRequirements } = useCreateReportStore.getState();

    const [showRequirements, setShowRequirements] = useState(false);
    const [allRequirementsSelected, setAllRequirementsSelected] = useState(true);

    useEffect(() => {
        setAllRequirementsSelected(selectedRequirements.length === requirements.length);
    }, [selectedRequirements, requirements]);

    const handleAllRequirementsToggle = (checked: boolean) => {
        setAllRequirementsSelected(checked);
        if (checked) {
            setSelectedRequirements(requirements.map((req) => req.id)); // Select all requirements
        } else {
            setSelectedRequirements([]); // Deselect all requirements
        }
    };

    const handleRequirementSelect = (id: string) => {
        if (selectedRequirements.includes(id)) {
            // Remove the requirement if it already exists
            setSelectedRequirements(
                selectedRequirements.filter((reqId) => reqId !== id)
            );
        } else {
            // Add the requirement if it doesn't exist
            setSelectedRequirements([...selectedRequirements, id]);
        }
    };

    const toggleShowRequirements = () => {
        setShowRequirements((prev) => !prev);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center">
                <Checkbox
                    checked={allRequirementsSelected}
                    onChange={(e) => handleAllRequirementsToggle(e.target.checked)}
                >
                    All Requirements ({selectedRequirements.length}/{requirements.length})
                </Checkbox>
                <Button type="link" onClick={toggleShowRequirements}>
                    {showRequirements ? "Hide requirements" : "Show requirements"}
                </Button>
            </div>

            {showRequirements && (
                <List
                    header="Select Requirements"
                    bordered
                    dataSource={requirements}
                    renderItem={(requirement) => (
                        <List.Item>
                            <div className="flex justify-between items-center w-full">
                                <Checkbox
                                    checked={selectedRequirements.includes(requirement.id)}
                                    onChange={() => handleRequirementSelect(requirement.id)}
                                >
                                    {requirement.name}
                                </Checkbox>
                                <div className="px-2 py-1 rounded-md text-primary bg-bg_secondary text-center text-xs">{formatPrice(requirement.price_for_requirement)}</div>
                            </div>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default SelectRequirements; 