import React from 'react';
import { ResponsiveTreeMapCanvas } from '@nivo/treemap';
import type { Report, SectionAssessment, RequirementAssessment, RequirementGroupAssessment } from '@wasm';

type SectionData = {
    section_id: string;
    title: string;
    compliance_rating: number;
};

type TreeMapProps = {
    sectionListData: SectionData[];
    reports: Report[];
};

const TreeMap: React.FC<TreeMapProps> = ({ sectionListData, reports }) => {
    // Transform data to fit Nivo TreeMapCanvas format
    const buildTreeMapData = () => {
        const report = reports[0]; // Assuming a single report for simplicity
        return {
            name: 'Sections',
            children: sectionListData.map((section, sectionIndex) => {
                const sectionAssessment = report.section_assessments.find(
                    (assessment) => assessment.section_id === section.section_id
                );

                return {
                    name: `Section ${sectionIndex + 1}`,
                    children: sectionAssessment?.requirement_assessments?.map((req, reqIndex) => {
                        if (req.type === 'requirement_group' && 'assessments' in req.content) {
                            return {
                                name: `Group ${reqIndex + 1}`,
                                children: req.content.assessments?.map((assessment: any, assessmentIndex: any) => ({
                                    name: `Req ${assessmentIndex + 1}`,
                                    value: assessment.compliance_rating,
                                })) || [],
                            };
                        }

                        if (req.type === 'requirement') {
                            return {
                                name: `Req ${reqIndex + 1}`,
                                value: req.content.compliance_rating,
                            };
                        }

                        return null;
                    }).filter(Boolean) || [],
                };
            }),
        };
    };

    const treeMapData = buildTreeMapData();

    return (
        <div style={{ height: 600 }}>
            <ResponsiveTreeMapCanvas
                data={treeMapData}
                identity="name"
                value="value"
                valueFormat={(value) => `${value}%`}
                label={(node) => node.data.name}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.5]] }}
                tooltip={({ node }) => (
                    <div
                        style={{
                            background: 'white',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    >
                        <strong>{node.data.name}</strong>: {node.value}%
                    </div>
                )}
            />
        </div>
    );
};

export default TreeMap;
