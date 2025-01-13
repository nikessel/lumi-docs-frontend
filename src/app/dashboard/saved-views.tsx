import React from "react";
import { Button } from "antd";
import Typography from "@/components/typography";
import { genColor } from "@/utils/styling-utils";

export interface SavedView {
    icon: string;
    title: string;
    description: string;
    onView: () => void;
}

interface SavedViewsProps {
    views: SavedView[];
}

const SavedViews: React.FC<SavedViewsProps> = ({ views }) => {
    const topViews = views.slice(0, 3); // Display only the top 5 views

    return (
        <div className="">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Typography textSize="h3">Saved Views</Typography>
                <Button type="link" className="p-0 text-blue-500">
                    View All
                </Button>
            </div>

            <div className="space-y-4">
                {topViews.map((view, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg shadow-sm"
                    >
                        {/* Icon and Title */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs " style={{ color: genColor(view.title).color, backgroundColor: genColor(view.title).backgroundColor }}>
                                {view.icon}
                            </div>
                            <div>
                                <Typography className="font-medium">{view.title}</Typography>
                                <Typography textSize="small" color="secondary">
                                    {view.description}
                                </Typography>
                            </div>
                        </div>

                        {/* View Button */}
                        <Button
                            type="link"
                            className="text-blue-500"
                            onClick={view.onView}
                        >
                            View
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedViews;
