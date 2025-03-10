export function getSimplefiedComplianceColorCode(value: number): string {
    if (value < 0 || value > 100) {
        throw new Error("Value must be between 0 and 100");
    }

    if (value < 33.33) {
        return "#ff0000"; // Dark Red
    } else if (value < 66.66) {
        return "#FF8C00"; // Dark Orange
    } else {
        return "#008000"; // Dark Green
    }
}

export function getComplianceColorCode(value: number): string {
    if (value < 0 || value > 100) {
        throw new Error("Value must be between 0 and 100");
    }

    const colors = [
        "#FF0000", // Red
        "#FF3300", // Red(Orange)
        "#FF6600",
        "#FF9900",
        "#FFCC00", // Gold
        "#FFFF00", // Yellow
        "#CCFF00",
        "#99FF00",
        "#66FF00",
        "#33FF00",
        "#00FF00", // Lime
    ];

    // Determine index based on value (0-100 split into 10 segments)
    const index = Math.min(Math.floor(value / 10), colors.length - 1);

    return colors[index];
}
