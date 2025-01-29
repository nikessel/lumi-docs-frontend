import React from 'react';
import { ResponsiveNetworkCanvas } from '@nivo/network';
import { Report } from '@wasm';
import { generateNetworkDataFromReports } from '@/utils/advanced-charts-utils';

type NetworkChartProps = {
    reports: Report[];
};

const NetworkChart: React.FC<NetworkChartProps> = ({ reports }) => {
    const networkData = generateNetworkDataFromReports(reports);
    return (
        <div style={{ height: 400, width: '100%' }}>
            <ResponsiveNetworkCanvas
                data={networkData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                nodeColor={(node) => (node as any).color}
                nodeSize={(node) => (node as any).size}
                linkThickness={2}
                linkColor={{ from: 'source.color', modifiers: [['darker', 0.3]] }}
                motionConfig="gentle"
                onClick={(node) => console.log('Clicked node:', node)}
            />
        </div>
    );
};

export default NetworkChart;
