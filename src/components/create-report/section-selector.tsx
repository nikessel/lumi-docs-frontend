import React, { useState } from "react";
import { List, Checkbox, Button } from "antd";
import { useCreateReportStore } from "@/stores/create-report-store";
import { formatPrice } from "../payment/price-tracker";

interface SectionDisplay {
    id: string;
    name: string;
    price_for_section: number;
}

interface SelectSectionsProps {
    sections: SectionDisplay[];
}

const SelectSections: React.FC<SelectSectionsProps> = ({ sections }) => {
    const {
        selectedSections,
        setSelectedSections,
    } = useCreateReportStore(); // Zustand store access


    const [allSectionsSelected, setAllSectionsSelected] = useState(true);

    const [showSections, setShowSections] = useState(false);

    const handleAllSectionsToggle = (checked: boolean) => {
        setAllSectionsSelected(checked);
        if (checked) {
            setSelectedSections(sections.map((section) => section.id)); // Select all sections
        } else {
            setSelectedSections([]);
        }
    };

    const handleSectionSelect = (id: string) => {
        if (selectedSections.includes(id)) {
            setSelectedSections(selectedSections.filter((sectionId) => sectionId !== id));
        } else {
            setSelectedSections([...selectedSections, id]);
        }
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
                    All Sections ({selectedSections.length}/{sections.length})
                </Checkbox>
                <Button type="link" onClick={toggleShowSections}>
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
                        <List.Item className="w-full">
                            <div className="flex justify-between items-center w-full">
                                <Checkbox
                                    checked={selectedSections.includes(section.id)}
                                    onChange={() => handleSectionSelect(section.id)}
                                >
                                    {section.name}
                                </Checkbox>
                                <div className="px-2 py-1 rounded-md text-primary bg-bg_secondary text-center text-xs">{formatPrice(section.price_for_section)}</div>
                            </div>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default SelectSections;
