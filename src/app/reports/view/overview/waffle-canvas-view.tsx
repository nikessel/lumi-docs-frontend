'use client';

import React from 'react';
import { ResponsiveWaffleCanvas } from '@nivo/waffle';
import { Report } from '@wasm';
import { generateWaffleDataFromReports } from '@/utils/advanced-charts-utils';
import { getComplianceColorCode } from '@/utils/formating';
import { useSelectedFilteredReportsContext } from '@/contexts/reports-context/selected-filtered-reports';


const calculateTotalNodes = (waffleData: Array<{ id: string; value: number }>): number => {
    return waffleData.reduce((sum, datum) => sum + datum.value, 0);
};

const WaffleChart: React.FC = () => {
    const { reports, loading, error } = useSelectedFilteredReportsContext();

    // Generate data using the utility function
    const waffleData = generateWaffleDataFromReports(reports);

    // Map data with colors based on the midpoint of the compliance interval
    const coloredWaffleData = waffleData.map((datum) => {
        const [start, end] = datum.id.split('-').map((num) => parseInt(num, 10)); // Extract start and end of the range
        const rangeMidpoint = (start + end) / 2; // Calculate the midpoint
        const color = getComplianceColorCode(rangeMidpoint); // Get the color for the midpoint
        return { ...datum, color };
    });

    return (
        <div style={{ minHeight: 300, height: "100%" }}>
            <ResponsiveWaffleCanvas
                data={coloredWaffleData}
                total={calculateTotalNodes(waffleData)}
                rows={calculateTotalNodes(waffleData) / 20 > 20 ? calculateTotalNodes(waffleData) / 20 : 20}
                columns={calculateTotalNodes(waffleData) / 20 > 20 ? calculateTotalNodes(waffleData) / 20 : 20}
                padding={0.5}
                valueFormat=".2f"
                margin={{ top: 10, right: -30, bottom: 10, left: 10 }}
                colors={{ datum: 'color' }}
                borderWidth={0.5}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 0.3]],
                }}
                legends={[
                    {
                        anchor: 'top-left',
                        direction: 'column',
                        translateX: -10,
                        itemsSpacing: 4,
                        itemWidth: 100,
                        itemHeight: 20,
                        symbolSize: 20,
                        itemTextColor: '#777',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemTextColor: '#000',
                                },
                            },
                        ],
                    },
                ]}
                animate={true}
                motionConfig="gentle"
            />
        </div>
    );
};

export default WaffleChart;
