'use client';
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Progress } from "antd";
import { formatSectionTitle } from "@/utils/helpers";

interface SectionCardProps {
    title: string;
    compliance_rating: number;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, compliance_rating }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const highlightedSections = searchParams.get("highlightedSections")?.split(",") || [];

    const isHighlighted = highlightedSections.includes(encodeURIComponent(title));

    const toggleHighlight = () => {
        const updatedSections = isHighlighted
            ? highlightedSections.filter((section) => section !== encodeURIComponent(title))
            : [...highlightedSections, encodeURIComponent(title)];

        // Update the URL with the new highlightedSections
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (updatedSections.length > 0) {
            newSearchParams.set("highlightedSections", updatedSections.join(","));
        } else {
            newSearchParams.delete("highlightedSections");
        }

        // Update the URL without refreshing the page
        router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
    };

    return (
        <div
            onClick={toggleHighlight}
            className={`h-full w-52 p-2 text-center rounded-lg cursor-pointer transition-all border
        ${isHighlighted ? "border-primary bg-bg_secondary" : "border-border bg-muted"}`}
        >
            <div className="flex flex-col justify-between items-center h-full">
                <div className={` mb-2 font-semibold text-small_custom ${isHighlighted ? "text-primary" : "text-text_primary"}`}>
                    {formatSectionTitle(title)}
                </div>
                <div className="mt-auto">
                    <Progress type="circle" strokeColor={`${isHighlighted ? "var(--primary)" : "gray"}`} percent={compliance_rating} size={50} />
                </div>
            </div>
        </div>
    );
};

export default SectionCard;
