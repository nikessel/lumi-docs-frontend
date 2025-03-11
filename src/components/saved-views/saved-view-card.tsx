import React, { useState } from "react";
import { Button, Skeleton } from "antd";
import Typography from "@/components/common/typography";
import { genColor } from "@/utils/styling-utils";
import { useRouter } from "next/navigation";
import type { SavedView } from "@wasm";
import { deleteSavedView } from "@/utils/user-utils";
import { useWasm } from "@/contexts/wasm-context/WasmProvider";
import { DeleteOutlined } from "@ant-design/icons";

interface SavedViewRenderProps {
    view: SavedView | null;
    isLoading: boolean;
}

const SavedViewRender: React.FC<SavedViewRenderProps> = ({ view, isLoading }) => {
    const router = useRouter();
    const { wasmModule } = useWasm();
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!view) return;

        setIsDeleting(true);
        try {
            const result = await deleteSavedView(wasmModule, view.title, view.link);
            if (result.success) {
                console.log("View deleted successfully");
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error("Error deleting view:", error);
        } finally {
            setIsDeleting(false);
        }
    };

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
                <Skeleton.Button active size="small" />
            </div>
        );
    }

    if (view) {
        return (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg shadow-sm">
                {/* Icon and Title */}
                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center justify-center w-8 h-8 rounded-full text-xs"
                        style={{
                            color: genColor(view?.title)?.color,
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
                <div className="flex items-center gap-2">
                    <Button
                        type="link"
                        className="text-blue-500"
                        onClick={() => router.push(view!.link)}
                    >
                        View
                    </Button>
                    <Button
                        type="link"
                        danger

                        icon={<DeleteOutlined />}
                        loading={isDeleting}
                        onClick={handleDelete}
                    />
                </div>
            </div>
        );
    };
}

export default SavedViewRender;
