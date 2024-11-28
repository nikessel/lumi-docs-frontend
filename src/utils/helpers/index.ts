export function formatRegulatoryFramework(input: string) {
    // Use a regular expression to find the boundary between letters and numbers
    const formatted = input.replace(/([a-zA-Z])(?=\d)|(?<=\d)([a-zA-Z])/g, "$1 $2");

    // Capitalize all letters in the string
    return formatted.toUpperCase();
}