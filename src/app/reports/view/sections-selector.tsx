import React, { useState } from "react";
import Typography from "@/components/typography";
import { Progress } from "antd";

interface SectionCardProps {
    title: string;
    compliance_rating: number;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, compliance_rating }) => {
    const [isSelected, setIsSelected] = useState(false);

    const handleCardClick = () => {
        setIsSelected(!isSelected);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`w-52 p-2 text-center rounded-lg cursor-pointer transition-all border
        ${isSelected ? "border-primary bg-bg_secondary" : "border-border bg-muted"}`}
        >
            <div className="flex flex-col justify-between items-center h-full">
                <div className={`mb-2 font-semibold text-small_custom ${isSelected ? "text-primary" : "text-text_primary"}`}>
                    {title}
                </div>
                <div className="mt-auto">
                    <Progress type="circle" strokeColor={`${isSelected ? "var(--primary)" : "gray"}`} percent={compliance_rating} size={50} />
                </div>
            </div>
        </div >
    );
};

export default SectionCard;
