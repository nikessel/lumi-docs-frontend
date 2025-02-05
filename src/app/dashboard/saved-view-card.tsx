import React from "react";
import { Button, Skeleton } from "antd";
import Typography from "@/components/typography";
import { genColor } from "@/utils/styling-utils";
import { useRouter } from "next/navigation";
import type { SavedView } from "@wasm";

interface SavedViewRenderProps {
    view?: SavedView; // Made optional for loading state
    isLoading: boolean;
    isEmpty?: boolean;
}

const SavedViewRender: React.FC<SavedViewRenderProps> = ({ view, isLoading, isEmpty }) => {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg shadow-sm">
                {/* Loading Icon and Title */}
                <div className="flex items-center gap-4">
                    <Skeleton.Avatar active size="small" shape="circle" />
                    <div>
                        <Skeleton className="mb-1" title={false} paragraph={{ rows: 1, width: 100 }} active />
                        <Skeleton title={false} paragraph={{ rows: 1, width: 150 }} active />
                    </div>
                </div>

                {/* Loading Button */}
                <Skeleton.Button active size="small" />
            </div>
        );
    }


    if (isEmpty) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                <Typography textSize="small" color="secondary">
                    Saved views will be shown here for easy navigation
                </Typography>
            </div>
        );
    }





    return (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg shadow-sm">
            {/* Icon and Title */}
            <div className="flex items-center gap-4">
                <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-xs"
                    style={{
                        color: genColor(view!.title).color,
                        backgroundColor: genColor(view!.title).backgroundColor,
                    }}
                >
                    {view!.title.charAt(0)}
                </div>
                <div>
                    <Typography className="font-medium mb-1">{view!.title}</Typography>
                    <Typography textSize="small" color="secondary">
                        {view!.description}
                    </Typography>
                </div>
            </div>

            {/* View Button */}
            <Button
                type="link"
                className="text-blue-500"
                onClick={() => router.push(view!.link)}
            >
                View
            </Button>
        </div>
    );
};

export default SavedViewRender;
