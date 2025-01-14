export function formatRegulatoryFramework(input: string) {
    // Use a regular expression to find the boundary between letters and numbers
    const formatted = input.replace(/([a-zA-Z])(?=\d)|(?<=\d)([a-zA-Z])/g, "$1 $2");

    // Capitalize all letters in the string
    return formatted.toUpperCase();
}

export function formatSectionTitle(title: string): string {
    return title
        .split("_") // Split the string by underscores
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(" "); // Join the words with spaces
}

export const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(1)} kB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
        return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
};