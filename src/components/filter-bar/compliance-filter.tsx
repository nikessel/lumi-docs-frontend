import React, { useState, useEffect } from "react";
import { Slider } from "antd";
import { useSearchParamsState } from "@/contexts/search-params-context";
import Typography from "../typography";

const ComplianceFilter: React.FC = () => {
    const { compliance, updateComplianceRange } = useSearchParamsState();
    const [sliderValue, setSliderValue] = useState<[number, number]>(compliance || [0, 100]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (sliderValue !== compliance) {
                updateComplianceRange(sliderValue);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(handler);
    }, [sliderValue, compliance, updateComplianceRange]);

    return (
        <div>
            <Typography className="my-1" textSize="h4">Compliance rating</Typography>
            <Typography className="my-4" color="secondary">Search for assessments where the compliance rating is within the provided interval. NB! the filter is on requirement assessments, so sections and groups can occur outside the interval</Typography>
            <Slider
                range
                min={0}
                max={100}
                value={sliderValue}
                onChange={(value) => setSliderValue(value as [number, number])}
            />
        </div>
    );
};

export default ComplianceFilter;
