import React from "react";
import { Button } from "antd";
import Typography from "@/components/typography";
import { useUserContext } from "@/contexts/user-context";
import SavedViewRender from "./saved-view-card";

interface SavedViewsProps {
    isLoading: boolean;
}

const SavedViews: React.FC<SavedViewsProps> = ({ isLoading }) => {
    const { user, loading: userLoading, error } = useUserContext();
    const allSavedViews = user?.task_management?.saved_views || [];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Typography textSize="h3">Saved Views</Typography>
            </div>

            {/* Top Views with Scrollable Container */}
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {isLoading
                    ? Array.from({ length: 10 }).map((_, index) => (
                        <SavedViewRender key={index} isLoading={true} />
                    ))
                    : allSavedViews.map((view, index) => (
                        <SavedViewRender key={index} view={view} isLoading={false} />
                    ))}
            </div>
        </div>
    );
};

export default SavedViews;
