'use client';

import React from "react";
import SectionCard from "./sections-selector";

interface SectionMetaListProps {
    data: { title: string; compliance_rating: number }[];
}

const SectionMetaList: React.FC<SectionMetaListProps> = ({ data }) => {
    return (
        <div className="flex overflow-x-auto gap-4 mt-4 p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {data.map((item, index) => (
                <div key={index} className="flex-shrink-0">
                    <SectionCard
                        title={item.title}
                        compliance_rating={item.compliance_rating}
                    />
                </div>
            ))}
        </div>
    );
};

export default SectionMetaList;
