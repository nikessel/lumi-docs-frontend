import React, { useState, useEffect } from "react";
import { Slider, Drawer, Button, Radio, Switch, Badge, Divider } from "antd";
import { SlidersOutlined } from "@ant-design/icons";
import Typography from "@/components/typography";
import { useRouter, useSearchParams } from "next/navigation";
import type { Report } from "@wasm";
import SelectTaskDocuments from "./update-selected-task-documents";
import ComplianceFilter from "./compliance-filter";
import SearchRequirements from "./search-query";

interface FilterBarProps {
    reports?: Report[];
}

const FilterBar: React.FC<FilterBarProps> = ({ reports }) => {
    const [complianceRating, setComplianceRating] = useState<[number, number]>([0, 75]);
    const [acceptanceLevel, setAcceptanceLevel] = useState<number>(20);
    const [aggregation, setAggregation] = useState<string>("Show actual ratings");
    const [ignored, setIgnored] = useState<boolean>(true);
    const [taskCreated, setTaskCreated] = useState<boolean>(true);
    const [none, setNone] = useState<boolean>(true);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Update filters from URL on load
    useEffect(() => {
        const complianceRatingFromUrl = searchParams.get("complianceRating")?.split(",").map(Number) || [0, 75];
        const acceptanceLevelFromUrl = Number(searchParams.get("acceptanceLevel")) || 20;
        const aggregationFromUrl = searchParams.get("aggregation") || "Show actual ratings";
        const ignoredFromUrl = searchParams.get("ignored") !== "false"; // Default true
        const taskCreatedFromUrl = searchParams.get("taskCreated") !== "false"; // Default true
        const noneFromUrl = searchParams.get("none") !== "false"; // Default true

        setComplianceRating(complianceRatingFromUrl as [number, number]);
        setAcceptanceLevel(acceptanceLevelFromUrl);
        setAggregation(aggregationFromUrl);
        setIgnored(ignoredFromUrl);
        setTaskCreated(taskCreatedFromUrl);
        setNone(noneFromUrl);
    }, [searchParams]);

    // Update the URL with filters
    const updateUrlWithFilters = () => {
        const updatedSearchParams = new URLSearchParams(window.location.search);
        updatedSearchParams.set("complianceRating", complianceRating.join(","));
        updatedSearchParams.set("acceptanceLevel", String(acceptanceLevel));
        updatedSearchParams.set("aggregation", aggregation);
        updatedSearchParams.set("ignored", String(ignored));
        updatedSearchParams.set("taskCreated", String(taskCreated));
        updatedSearchParams.set("none", String(none));

        window.history.replaceState(
            { path: updatedSearchParams.toString() },
            "",
            `${window.location.pathname}?${updatedSearchParams.toString()}`
        );
    };

    // Update the URL whenever a filter changes
    useEffect(() => {
        updateUrlWithFilters();
    }, [complianceRating, acceptanceLevel, aggregation, ignored, taskCreated, none]);

    const showDrawer = () => {
        setIsDrawerVisible(true);
    };

    const closeDrawer = () => {
        setIsDrawerVisible(false);
    };

    return (
        <>
            {/* Button to open the drawer */}
            <Button size="small" icon={<SlidersOutlined />} onClick={showDrawer} type="primary">
                Filters
            </Button>
            {/* Drawer containing the filter controls */}
            <Drawer
                title="Filters"
                placement="right"
                onClose={closeDrawer}
                visible={isDrawerVisible}
                width={600}
            >
                {/* Compliance Rating Slider */}
                <div className="flex flex-col ">
                    <SearchRequirements />
                    <Divider />
                    <SelectTaskDocuments />
                    <Divider />
                    <ComplianceFilter />
                </div>
            </Drawer>
        </>
    );
};

export default FilterBar;

{/* <div className="py-2 mb-4 flex items-center justify-between w-full border-b b">
                    <Typography color="secondary">Compliance Rating</Typography>
                    <Slider
                        range
                        min={0}
                        max={100}
                        className="w-60"
                        value={complianceRating}
                        onChange={(value) => setComplianceRating(value as [number, number])}
                        tooltip={{
                            formatter: (value) => `${value}`,
                        }}
                    />
                </div>

//                 {/* Acceptance Level Slider */}
// <div className="py-2 mb-4 flex items-center justify-between w-full border-b b">
//     <Typography color="secondary">Acceptance level: {acceptanceLevel}</Typography>
//     <Slider
//         value={100 - acceptanceLevel}
//         onChange={(val) => setAcceptanceLevel(100 - val)}
//         max={100}
//         min={0}
//         reverse
//         className="w-60"
//         tooltip={{
//             formatter: (val) => `${100 - (val ?? 0)}`,
//         }}
//         trackStyle={{ backgroundColor: "var(--success)" }}
//     />
// </div>

// {/* Aggregation Radio Group */ }
// <div className="py-2 mb-4 flex items-center justify-between w-full border-b b">
//     <Typography color="secondary">Aggregation</Typography>
//     <Radio.Group
//         onChange={(e) => setAggregation(e.target.value)}
//         value={aggregation}
//     >
//         <Radio value="Acceptance based aggregation">Aggregate</Radio>
//         <Radio value="Show actual ratings">Actual ratings</Radio>
//     </Radio.Group>
// </div>

// {/* Implementation Status Switches */ }
// <div className="py-2 mb-4 flex items-center justify-between w-full border-b b">
//     <Typography color="secondary">Implementation status</Typography>
//     <div className="flex flex-col space-y-2 w-60">
//         <div className="flex justify-between items-center py-1">
//             <Typography>Ignored:</Typography>
//             <Switch checked={ignored} onChange={setIgnored} />
//         </div>
//         <div className="flex justify-between items-center py-1">
//             <Typography>Task Created:</Typography>
//             <Switch checked={taskCreated} onChange={setTaskCreated} />
//         </div>
//         <div className="flex justify-between items-center py-1">
//             <Typography>None:</Typography>
//             <Switch checked={none} onChange={setNone} />
//         </div>
//     </div>
// </div> */}
