import React from 'react';
import { Card, List, Skeleton } from 'antd';

const AISuggestionsReviewSkeleton: React.FC = () => {
    return (
        <Card
            title={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Skeleton.Input size="small" style={{ width: 200 }} active />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton.Button size="small" active />
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <Skeleton.Input active />
                </div>
                <List
                    className="flex-1 overflow-auto"
                    size="small"
                    dataSource={[1, 2, 3]} // Show 3 skeleton sections
                    renderItem={() => (
                        <List.Item>
                            <div className="w-full">
                                <div className="flex items-center gap-2">
                                    <Skeleton.Input size="small" style={{ width: 300 }} active />
                                </div>
                                <div className="mt-2 space-y-2">
                                    {[1, 2].map((groupIndex) => (
                                        <div key={groupIndex} className="ml-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Skeleton.Input size="small" style={{ width: 200 }} active />
                                            </div>
                                            <div className="ml-4 space-y-1">
                                                {[1, 2, 3].map((reqIndex) => (
                                                    <div key={reqIndex} className="flex items-center gap-2">
                                                        <Skeleton.Input size="small" style={{ width: 250 }} active />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        </Card>
    );
};

export default AISuggestionsReviewSkeleton; 