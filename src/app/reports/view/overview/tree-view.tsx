import React from 'react';
import { ResponsiveTree } from '@nivo/tree';

type TreeNode = {
    id: string;
    children?: TreeNode[];
};

type TreeProps = {
    numberOfGroups?: number; // Default: 10
    requirementsPerGroup?: number; // Default: 10
};

const generateMockTreeData = (groups: number, requirementsPerGroup: number): TreeNode => {
    return {
        id: 'Root',
        children: Array.from({ length: groups }).map((_, groupIndex) => ({
            id: `Group ${groupIndex + 1}`,
            children: Array.from({ length: requirementsPerGroup }).map((_, reqIndex) => ({
                id: `${groupIndex + 1}-${reqIndex + 1}`, // Unique ID for the requirement
            })),
        })),
    };
};

const getNodeColor = (node: TreeNode): string => {
    const colors = [
        'rgb(106,176,76)', // Green
        'rgb(252,215,0)', // Yellow
        'rgb(234,67,53)', // Red
        'rgba(106,176,76,0.5)', // Opaque Green
    ];

    // Extract the last digit from the ID
    const lastDigit = parseInt(node.id.slice(-1), 10);

    // Use the last digit to determine the color
    return colors[lastDigit % colors.length];
};

const Tree: React.FC<TreeProps> = ({
    numberOfGroups = 10,
    requirementsPerGroup = 10,
}) => {
    const treeData = generateMockTreeData(numberOfGroups, requirementsPerGroup);

    return (
        <div style={{ height: 500, position: 'relative' }}>
            {/* Legend */}
            {/* <div
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    zIndex: 10,
                }}
            >
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li className="flex items-center">
                        <span
                            style={{
                                display: 'inline-block',
                                width: '15px',
                                height: '15px',
                                backgroundColor: 'rgb(106,176,76)',
                                marginRight: '10px',
                            }}
                        ></span>
                        <div>{`> 80`}</div>
                    </li>
                    <li className="flex items-center">
                        <span
                            style={{
                                display: 'inline-block',
                                width: '15px',
                                height: '15px',
                                backgroundColor: 'rgb(252,215,0)',
                                marginRight: '10px',
                            }}
                        ></span>
                        <div>{`> 60`}</div>
                    </li>
                    <li className="flex items-center">
                        <span
                            style={{
                                display: 'inline-block',
                                width: '15px',
                                height: '15px',
                                backgroundColor: 'rgb(234,67,53)',
                                marginRight: '10px',
                            }}
                        ></span>
                        <div>{`< 40 `}</div>

                    </li>
                    <li className="flex items-center">
                        <span
                            style={{
                                display: 'inline-block',
                                width: '15px',
                                height: '15px',
                                backgroundColor: 'rgba(106,176,76,0.5)',
                                marginRight: '10px',
                            }}
                        ></span>
                        All tasks implemented
                    </li>
                </ul>
            </div> */}
            <ResponsiveTree<TreeNode>
                data={treeData}
                identity="id"
                margin={{ top: 20, right: 10, bottom: 90, left: 10 }}
                nodeColor={(node) => getNodeColor(node)} // Use the color function
                linkThickness={2}
                activeLinkThickness={8}
                inactiveLinkThickness={2}
                nodeSize={8}
                fixNodeColorAtDepth={10}
                activeNodeSize={24}
                inactiveNodeSize={5}
                layout="top-to-bottom"
                enableLabel={true} // Enable labels globally
                label={(node) => (node.depth === 1 ? node.id : '')} // Only display labels for groups
                linkColor={{
                    from: 'target.color',
                    modifiers: [['opacity', 0.4]],
                }}
                motionConfig="stiff"
                nodeTooltip={({ node }) => (
                    <div
                        style={{
                            background: 'white',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    >
                        <strong>{node.id}, compliance: xx%</strong>
                    </div>
                )}
                onNodeMouseEnter={(node) => {
                    console.log('Hovered Node:', node.id, 'Color:', getNodeColor(node.data));
                }}
                onNodeClick={(node) => console.log(node)}
                onLinkMouseEnter={(link) => {
                    console.log('Hovered Link:', link.source.id, '→', link.target.id);
                }}
                onLinkMouseMove={(link) => {
                    console.log('Moving over Link:', link.source.id, '→', link.target.id);
                }}
                onLinkMouseLeave={(link) => {
                    console.log('Mouse left Link:', link.source.id, '→', link.target.id);
                }}
                onLinkClick={(link) => {
                    console.log('Clicked Link:', link.source.id, '→', link.target.id);
                }}
                linkTooltip={({ link }) => (
                    <div
                        style={{
                            background: 'white',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    >
                        <strong>Link:</strong> {link.source.id} → {link.target.id}
                    </div>
                )}
                linkTooltipAnchor="top"
            />
        </div>
    );
};

export default Tree;


