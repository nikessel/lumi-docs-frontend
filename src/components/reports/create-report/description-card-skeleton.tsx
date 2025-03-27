import React from "react";
import { Card, Typography, Skeleton } from "antd";
import Image from "next/image";

const DescriptionCardSkeleton: React.FC = () => {
    return (
        <Card
            title={
                <div>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Skeleton.Input size="small" style={{ width: 120 }} active />
                        </div>
                        <div className="flex gap-1">
                            <Skeleton.Input size="small" style={{ width: 80 }} active />
                            <Skeleton.Input size="small" style={{ width: 80 }} active />
                        </div>
                    </div>
                </div>
            }
        >
            <div className="bg-[var(--bg-secondary)] text-[var(--primary)] mb-4 p-2 rounded-md text-xs font-normal flex items-center gap-2">
                <Image src="/assets/pngs/ai_blue.png" alt="AI" width={24} height={24} color="var(--primary)" />
                <Skeleton.Input size="small" style={{ width: 300 }} active />
            </div>

            {/* Generate multiple skeleton rows to mimic the content */}
            {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="mb-2">
                    <div className="flex items-center justify-between gap-2">
                        <Skeleton.Input size="small" style={{ width: 150 }} active />
                        <Skeleton.Input size="small" style={{ width: 100 }} active />
                    </div>
                </div>
            ))}

            {/* Add some nested content skeletons */}
            {[1, 2].map((index) => (
                <div key={`nested-${index}`} className="mb-2">
                    <Typography.Text type="secondary" className="block mb-2">
                        <Skeleton.Input size="small" style={{ width: 150 }} active />
                    </Typography.Text>
                    <div className="flex items-center justify-between gap-2">
                        <Skeleton.Input size="small" style={{ width: 150 }} active />
                        <Skeleton.Input size="small" style={{ width: 90 }} active />
                    </div>
                </div>
            ))}
        </Card>
    );
};

export default DescriptionCardSkeleton; 