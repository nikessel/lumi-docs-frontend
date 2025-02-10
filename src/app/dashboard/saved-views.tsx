import React from "react";
import Typography from "@/components/typography";
import { useUserContext } from "@/contexts/user-context";
import SavedViewRender from "./saved-view-card";

interface SavedViewsProps {
    isLoading: boolean;
}

const SavedViews: React.FC<SavedViewsProps> = ({ isLoading }) => {
    const { user } = useUserContext();
    const allSavedViews = user?.task_management?.saved_views || [];

    // Ensure at least 4 placeholders if there are fewer saved views
    const displayedViews = allSavedViews.length < 4
        ? [...allSavedViews, ...Array(4 - allSavedViews.length).fill(null)]
        : allSavedViews.slice(0, 4);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Typography textSize="h3">Saved Views</Typography>
            </div>

            {/* Top Views with Scrollable Container */}
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {displayedViews.map((view, index) => (
                    <SavedViewRender
                        key={index}
                        view={view || undefined}
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </div>
    );
};


export default SavedViews;
