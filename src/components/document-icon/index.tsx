import React from "react";
import { genColor } from "@/utils/styling-utils";

interface DocumentIconProps {
    documentTitle: string;
    letters: string;
    size?: "small" | "medium" | "large";
}

const sizeMap = {
    small: "w-6 h-6 text-xs",
    medium: "w-8 h-8 text-sm",
    large: "w-10 h-10 text-base",
};

const DocumentIcon: React.FC<DocumentIconProps> = ({ documentTitle, letters, size = "medium" }) => {

    const color = genColor(documentTitle);

    return (
        <div
            className={`flex items-center justify-center rounded-full ${sizeMap[size]}`}
            style={{
                color: color.color,
                backgroundColor: color.backgroundColor
            }}
        >
            {letters}
        </div>
    );
};

export default DocumentIcon; 