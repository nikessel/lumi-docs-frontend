export function getComplianceColorCode(value: number): string {
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
