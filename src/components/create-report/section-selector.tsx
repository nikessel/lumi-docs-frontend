import React, { useState } from "react";
import { List, Checkbox, Button } from "antd";

interface Section {
    id: string;
    name: string;
}

interface SelectSectionsProps {
    sections: Section[];
    selectedSections: string[];
    setSelectedSections: React.Dispatch<React.SetStateAction<string[]>>;
}

const SelectSections: React.FC<SelectSectionsProps> = ({
    sections,
    selectedSections,
    setSelectedSections,
}) => {
    const [allSectionsSelected, setAllSectionsSelected] = useState(true);
    const [showSections, setShowSections] = useState(false);

    const handleAllSectionsToggle = (checked: boolean) => {
        setAllSectionsSelected(checked);
        if (checked) {
            setSelectedSections(sections.map((section) => section.id)); // Select all sections
        } else {
            setSelectedSections([]); // Deselect all sections
        }
    };

    const handleSectionSelect = (id: string) => {
        setSelectedSections((prev) => {
            if (prev.includes(id)) {
                return prev.filter((sectionId) => sectionId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const toggleShowSections = () => {
        setShowSections((prev) => !prev);
    };

    return (
        <div className="space-y-4">
            {/* All Sections Checkbox with Show Sections Button */}
            <div className="flex items-center">
                <Checkbox
                    checked={selectedSections.length === sections.length}
                    onChange={(e) => handleAllSectionsToggle(e.target.checked)}
                >
                    All Sections ({sections.length})
                </Checkbox>
                <Button
                    type="link"
                    onClick={toggleShowSections}

                >
                    {showSections ? "Hide sections" : "Show sections"}
                </Button>
            </div>

            {/* Show List of Sections When Toggled */}
            {showSections && (
                <List
                    header="Select Sections"
                    bordered
                    dataSource={sections}
                    renderItem={(section) => (
                        <List.Item>
                            <Checkbox
                                checked={selectedSections.includes(section.id)}
                                onChange={() => handleSectionSelect(section.id)}
                            >
                                {section.name}
                            </Checkbox>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default SelectSections;
