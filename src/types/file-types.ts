export type SupportedFileType = '.pdf' | '.txt' | '.md' | '.zip';

// Helper type to get file extension from a filename
export type GetFileExtension<T extends string> = T extends `${infer _}.${infer Ext}` ? `.${Ext}` : never;
