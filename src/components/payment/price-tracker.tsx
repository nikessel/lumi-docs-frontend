import React from "react";
import { Tooltip } from "antd";
import { useCreateReportStore } from "@/stores/create-report-store";
import { calculateReportPrice } from "@/utils/report-utils/create-report-utils";
import { useSpring, animated } from "@react-spring/web";
import { formatPrice } from "@/utils/payment";
import { useRequirementPriceContext } from "@/contexts/price-context/use-requirement-price-context";
import { useUserContext } from "@/contexts/user-context";

const PriceTracker: React.FC = () => {
    const { selectedSections, selectedRequirementGroups, selectedRequirements } = useCreateReportStore();
    const { userPrice, defaultPrice } = useRequirementPriceContext();
    const { user } = useUserContext();
    console.log("userPrice", userPrice, user);

    const priceToUse = userPrice || defaultPrice;
    let totalPrice = calculateReportPrice(priceToUse ? priceToUse : 0);
    let totalPriceDefault = calculateReportPrice(defaultPrice ? defaultPrice : 0);

    if (selectedSections.length === 0 || selectedRequirementGroups.length === 0) {
        totalPrice = 0;
        totalPriceDefault = 0;
    }

    const { animatedPrice } = useSpring({
        from: { animatedPrice: 0 },
        to: { animatedPrice: totalPrice },
        config: { tension: 60, friction: 10, clamp: true },
    });

    const tooltipContent = `
    Reports are priced per requirement, which are divided into sections and groups.
    You have currently selected
    ${selectedSections.length} sections,
    ${selectedRequirementGroups.length} groups, and
    ${selectedRequirements.length} requirements.
  `;

    return (
        <Tooltip title={tooltipContent} placement="top">
            <div className="px-2 py-1 rounded-md text-primary bg-bg_secondary text-center flex items-center gap-2">
                {userPrice && defaultPrice && (
                    <span className="line-through text-gray-500">
                        {formatPrice(totalPriceDefault)}
                    </span>
                )}
                <animated.span>
                    {animatedPrice.to((value) => formatPrice(value))}
                </animated.span>
            </div>
        </Tooltip>
    );
};

export default PriceTracker;
