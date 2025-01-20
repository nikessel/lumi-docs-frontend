export function genColor(text: string) {
    if (!text || typeof text !== "string") {
        // Return default colors for invalid or missing input
        return { color: "#91bba8", backgroundColor: "#e9f1ed" };
    }

    // Split text into words and pick the first letter from the second word (if available) or first word
    const splitString = text.split(" ");
    const initial = splitString[1]?.[0]?.toUpperCase() || splitString[0]?.[0]?.toUpperCase();

    // Return color scheme based on the initial
    switch (initial) {
        case "A": return { color: "#470054", backgroundColor: "#ece5ed" };
        case "B": return { color: "#91bba8", backgroundColor: "#e9f1ed" };
        case "C": return { color: "#c39239", backgroundColor: "#f3e9d7" };
        case "D": return { color: "#517036", backgroundColor: "#edf0ea" };
        case "E": return { color: "#c39239", backgroundColor: "#f3e9d7" };
        case "F": return { color: "#470054", backgroundColor: "#ece5ed" };
        case "G": return { color: "#91bba8", backgroundColor: "#e9f1ed" };
        case "H": return { color: "#517036", backgroundColor: "#edf0ea" };
        case "I": return { color: "#308014", backgroundColor: "#d5e5d0" };
        case "J": return { color: "#7d93c8", backgroundColor: "#e5e9f4" };
        case "K": return { color: "#752326", backgroundColor: "#e3d3d3" };
        case "L": return { color: "#b28a93", backgroundColor: "#efe7e9" };
        case "M": return { color: "#752326", backgroundColor: "#e3d3d3" };
        case "N": return { color: "#b28a93", backgroundColor: "#efe7e9" };
        case "O": return { color: "#470054", backgroundColor: "#ece5ed" };
        case "P": return { color: "#7d93c8", backgroundColor: "#e5e9f4" };
        case "Q": return { color: "#b28a93", backgroundColor: "#efe7e9" };
        case "R": return { color: "#7d93c8", backgroundColor: "#e5e9f4" };
        case "S": return { color: "#687181", backgroundColor: "#e0e2e5" };
        case "T": return { color: "#470054", backgroundColor: "#ece5ed" };
        case "U": return { color: "#687181", backgroundColor: "#e0e2e5" };
        case "V": return { color: "#308014", backgroundColor: "#d5e5d0" };
        case "X": return { color: "#308014", backgroundColor: "#d5e5d0" };
        default: return { color: "#91bba8", backgroundColor: "#e9f1ed" };
    }
}

export const formatStatus = (status: string | undefined): string => {
    if (!status) return "";
    return status
        .replace(/_/g, " ") // Replace underscores with spaces
        .toLowerCase() // Convert to lowercase
        .split(" ") // Split into words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
        .join(" "); // Join back into a string
};