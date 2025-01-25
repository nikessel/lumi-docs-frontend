import React from "react";
import { Tooltip } from "antd";
import { useCreateReportStore } from "@/stores/create-report-store";
import { calculateReportPrice } from "@/utils/report-utils/create-report-utils";
import { useSpring, animated } from "@react-spring/web";

// Format the price for EU locale
export const formatPrice = (value: number) =>
    new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0, // No decimal places
        maximumFractionDigits: 0,
    }).format(value);

const PriceTracker: React.FC = () => {
    const { selectedSections, selectedRequirementGroups, selectedRequirements } = useCreateReportStore(); // Access Zustand store

    let totalPrice = calculateReportPrice();

    // If no sections or groups are selected, the price is 0
    if (selectedSections.length === 0 || selectedRequirementGroups.length === 0) {
        totalPrice = 0;
    }

    // Spring animation for the price
    const { animatedPrice } = useSpring({
        from: { animatedPrice: 0 },
        to: { animatedPrice: totalPrice },
        config: { tension: 60, friction: 10, clamp: true }, // Controls the smoothness of the animation
    });

    const tooltipContent = `
    Reports are priced per requirements, which are divided into sections and groups.
    You have currently selected
    ${selectedSections.length} sections,
    ${selectedRequirementGroups.length} groups, and
    ${selectedRequirements.length} Requirements
  `;

    return (
        <Tooltip title={tooltipContent} placement="top">
            <div className="px-2 py-1 rounded-md text-primary bg-bg_secondary text-center">
                <animated.span>
                    {animatedPrice.to((value) => formatPrice(Math.round(value)))}
                </animated.span>
            </div>
        </Tooltip>
    );
};

export default PriceTracker;
