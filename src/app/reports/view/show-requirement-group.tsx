import React, { useState, useEffect } from "react";
import { Collapse, Typography, Button, List, Tooltip } from "antd";
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from 'next/navigation';
import { FullscreenOutlined } from "@ant-design/icons"

const { Panel } = Collapse;

interface RequirementAssessment {
    requirement_id?: string;
    compliance_rating: number;
    details: string;
    summary: string;
    findings: string[];
    sources: string[];
    references?: any[];
}

interface RequirementGroup {
    title: string;
    description: string;
    id: string;
    requirement_assessments: RequirementAssessment[];
    requirement_groups: RequirementGroup[];
}

function getBackgroundColorFromNumber(number: number) {
    const uniqueTextColors = [
        "#FF5733", // Vibrant Red-Orange
        "#33FF57", // Bright Green
        "#3357FF", // Vivid Blue
        "#FFC300", // Bright Yellow
        "#FF33A8", // Pink-Magenta
        "#8D33FF", // Deep Purple
        "#33FFF6", // Aqua Cyan
        "#FF8D33", // Orange
        "#57FF33"  // Lime Green
    ];
    // Use modulo operator to loop through the colors
    return uniqueTextColors[number % uniqueTextColors.length];
}

// Mock data for testing
const mockData: RequirementGroup = {
    title: "Requirement Group 1",
    description: "Top-level group description",
    id: "group_1",
    requirement_assessments: [
        {
            requirement_id: "req_1",
            compliance_rating: 70,
            details: "Details for req_1",
            summary: "Summary for req_1",
            findings: ["Finding 1"],
            sources: ["Doc 1"],
            references: [],
        },
        {
            requirement_id: "req_2",
            compliance_rating: 50,
            details: "Details for req_2",
            summary: "Summary for req_2",
            findings: ["Finding 2"],
            sources: ["Doc 2"],
            references: [],
        },
    ],
    requirement_groups: [
        {
            title: "Sub Group 1",
            description: "Description for Sub Group 1",
            id: "sub_group_1",
            requirement_assessments: [
                {
                    requirement_id: "req_3",
                    compliance_rating: 90,
                    details: "Details for req_3",
                    summary: "Summary for req_3",
                    findings: ["Finding 3"],
                    sources: ["Doc 3"],
                    references: [],
                },
                {
                    requirement_id: "req_4",
                    compliance_rating: 40,
                    details: "Details for req_4",
                    summary: "Summary for req_4",
                    findings: ["Finding 4"],
                    sources: ["Doc 4"],
                    references: [],
                },
            ],
            requirement_groups: [
                {
                    title: "Sub Sub Group 1",
                    description: "Description for Sub Sub Group 1",
                    id: "sub_sub_group_1",
                    requirement_assessments: [
                        {
                            requirement_id: "req_5",
                            compliance_rating: 80,
                            details: "Details for req_5",
                            summary: "Summary for req_5",
                            findings: ["Finding 5"],
                            sources: ["Doc 5"],
                            references: [],
                        },
                        {
                            requirement_id: "req_6",
                            compliance_rating: 30,
                            details: "Details for req_6",
                            summary: "Summary for req_6",
                            findings: ["Finding 6"],
                            sources: ["Doc 6"],
                            references: [],
                        },
                    ],
                    requirement_groups: [],
                },
                {
                    title: "Sub Sub Group 2",
                    description: "Description for Sub Sub Group 2",
                    id: "sub_sub_group_2",
                    requirement_assessments: [
                        {
                            requirement_id: "req_7",
                            compliance_rating: 60,
                            details: "Details for req_7",
                            summary: "Summary for req_7",
                            findings: ["Finding 7"],
                            sources: ["Doc 7"],
                            references: [],
                        },
                    ],
                    requirement_groups: [],
                },
            ],
        },
        {
            title: "Sub Group 2",
            description: "Description for Sub Group 2",
            id: "sub_group_2",
            requirement_assessments: [
                {
                    requirement_id: "req_8",
                    compliance_rating: 75,
                    details: "Details for req_8",
                    summary: "Summary for req_8",
                    findings: ["Finding 8"],
                    sources: ["Doc 8"],
                    references: [],
                },
                {
                    requirement_id: "req_9",
                    compliance_rating: 55,
                    details: "Details for req_9",
                    summary: "Summary for req_9",
                    findings: ["Finding 9"],
                    sources: ["Doc 9"],
                    references: [],
                },
            ],
            requirement_groups: [],
        },
    ],
};


// Aggregation Icons
const getAggregationIcon = (
    averageScore: number,
    hasLowScores: boolean,
    acceptanceLevel: number
) => {
    if (averageScore < acceptanceLevel) {
        return <CloseCircleOutlined style={{ color: "red" }} />;
    }
    if (hasLowScores) {
        return <WarningOutlined style={{ color: "orange" }} />;
    }
    return <CheckCircleOutlined style={{ color: "green" }} />;
};

const RequirementGroup = ({
    data,
    acceptanceLevel,
    aggregation,
    level
}: {
    data: typeof mockData;
    acceptanceLevel: number;
    aggregation: string;
    level: number
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Calculate compliance ratings
    const allScores = [
        ...data.requirement_assessments.map((r) => r.compliance_rating),
        ...data.requirement_groups.flatMap((group) =>
            group.requirement_assessments.map((r) => r.compliance_rating)
        ),
    ];


    const averageScore =
        allScores.reduce((sum, score) => sum + score, 0) / (allScores.length || 1);

    const hasLowScores = allScores.some((score) => score < acceptanceLevel);

    // Handle aggregation logic
    const displayRating =
        aggregation === "Acceptance based aggregation" ? (
            getAggregationIcon(averageScore, hasLowScores, acceptanceLevel)
        ) : (
            `${Math.round(averageScore)}`
        );

    const getRequirementDisplayRating = (
        complianceRating: number,
    ) => {
        if (aggregation === "Acceptance based aggregation") {
            return complianceRating < acceptanceLevel ? (
                <CloseCircleOutlined style={{ color: "red" }} />
            ) : (
                <CheckCircleOutlined style={{ color: "green" }} />
            );
        }
        return <Typography.Text>{Math.round(complianceRating)}</Typography.Text>;
    };

    // Determine default open state based on aggregation logic
    const defaultOpen = aggregation === "Acceptance based aggregation" && hasLowScores;

    return (
        <Collapse
            defaultActiveKey={defaultOpen ? ["1"] : []}
            onChange={() => setIsOpen((prev) => !prev)}
            style={{ backgroundColor: "white", borderTop: "none", borderRight: "none", borderBottom: "none", borderColor: getBackgroundColorFromNumber(level), borderRadius: 0 }}
            size="small"
        >
            <Panel
                style={{ backgroundColor: "white" }}
                header={
                    <div style={{}} className="flex justify-between items-center ">
                        <div className="flex items-center gap-4">
                            <Tooltip title={`Average Score: ${averageScore}`}>
                                {displayRating}
                            </Tooltip>
                            <Typography >{data.title}</Typography>
                            <Button size="small" icon={<FullscreenOutlined />}></Button>

                        </div>

                    </div>
                }
                key="1"
            >
                <List
                    dataSource={data.requirement_assessments}
                    renderItem={(item) => (
                        <List.Item>
                            <div className="flex gap-4 items-center w-full">
                                <Tooltip title={`Score: ${item.compliance_rating}`}>
                                    {getRequirementDisplayRating(item.compliance_rating)}
                                </Tooltip>
                                <Typography.Text>{item.requirement_id}</Typography.Text>
                                <Typography.Text>{item.compliance_rating}</Typography.Text>
                            </div>
                        </List.Item>
                    )}
                />
                <div className="mt-4">
                    {data.requirement_groups.map((group) => (
                        <RequirementGroup
                            key={group.id}
                            data={group}
                            acceptanceLevel={acceptanceLevel}
                            aggregation={aggregation}
                            level={level + 1}
                        />
                    ))}
                </div>
            </Panel>
        </Collapse>
    );
};

const RequirementGroups = () => {
    const searchParams = useSearchParams();
    const [acceptanceLevel, setAcceptanceLevel] = useState(
        Number(searchParams.get("acceptanceLevel") || 60)
    );
    const [aggregation, setAggregation] = useState(
        searchParams.get("aggregation") || "Show actual ratings"
    );

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const newAcceptanceLevel = Number(searchParams.get("acceptanceLevel") || 60);
        const newAggregation = searchParams.get("aggregation") || "Show actual ratings";

        timer = setTimeout(() => {
            setAcceptanceLevel(newAcceptanceLevel);
            setAggregation(newAggregation);
        }, 300); // Delay of 300ms

        return () => {
            clearTimeout(timer);
        };
    }, [searchParams]);

    return (
        <div className="py-4">
            <RequirementGroup
                data={mockData}
                acceptanceLevel={acceptanceLevel}
                aggregation={aggregation}
                level={0}
            />
        </div>
    );
};

export default RequirementGroups;
