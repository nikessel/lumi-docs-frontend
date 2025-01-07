import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

type SectionData = {
    compliance_rating: number;
    title: string;
    section_id: string;
};

type BarChartProps = {
    sectionListData: SectionData[];
};

const BarChart: React.FC<BarChartProps> = ({ sectionListData }) => {
    // Prepare data for the bar chart
    const data = sectionListData.map((section) => ({
        section: section.title, // Full title for tooltips
        compliance: section.compliance_rating, // Bar height value
    }));

    return (
        <div style={{ height: 100 }}>
            <ResponsiveBar
                data={data}
                keys={['compliance']}
                indexBy="section"
                margin={{ top: 10, right: 50, bottom: 10, left: 60 }}
                padding={0.3}
                colors={{ scheme: 'nivo' }}
                axisTop={null}
                axisRight={null}
                axisBottom={null}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Compliance (%)',
                    legendPosition: 'middle',
                    legendOffset: -50,
                }}
                label={(d) => `${d.value}%`} // Shows percentage on top of bars
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                tooltip={({ id, value, indexValue }) => (
                    <div
                        style={{
                            background: 'white',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    >
                        <strong>{indexValue}</strong>: {value}%
                    </div>
                )}
                animate={true}
                motionConfig="wobbly"
            />
        </div>
    );
};

export default BarChart;
