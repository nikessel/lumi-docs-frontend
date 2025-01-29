export type ContentType =
    | "ChapterHeader"
    | "SubHeader"
    | "SubSubHeader"
    | "Text"
    | "Image"
    | "Link"
    | "CodeBlock"
    | "List"
    | "Table"
    | "Callout"
    | "Video";

export interface ContentItem {
    type: ContentType;
    text?: string; // For Text, Headers, Callout, etc.
    color?: "primary" | "secondary"; // For Text
    size?: "small" | "default"; // For Text
    src?: string; // For Image, Video
    alt?: string; // For Image
    url?: string; // For Link
    listItems?: string[]; // For List
    tableData?: { headers: string[]; rows: string[][] }; // For Table
    calloutType?: "success" | "info" | "warning" | "error"; // For Callout
    code?: string; // For CodeBlock
}

export interface Chapter {
    id: string;
    title: string;
    content: ContentItem[];
}

export interface DocumentationData {
    title: string;
    chapters: Chapter[];
}
