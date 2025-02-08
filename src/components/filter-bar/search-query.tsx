import React, { useState, useEffect } from "react";
import { Input } from "antd";
import { useSearchParamsState } from "@/contexts/search-params-context";
import Typography from "../typography";
const SearchRequirements: React.FC = () => {
    const { searchQuery, updateSearchQuery } = useSearchParamsState();
    const [inputValue, setInputValue] = useState(searchQuery);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (inputValue !== searchQuery) {
                updateSearchQuery(inputValue);
            }
        }, 1000);

        return () => clearTimeout(handler);
    }, [inputValue, searchQuery, updateSearchQuery]);

    return (
        <div>
            <Typography className="my-1" textSize="h4">Search Query</Typography>
            <Typography className="my-4" color="secondary">Search for assessments where the query is part of either the assessment, title, or description</Typography>
            <Input
                placeholder="Search requirements..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                allowClear
            />
        </div>
    );
};

export default SearchRequirements;
