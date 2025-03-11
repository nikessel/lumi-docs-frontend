import { create } from "zustand";
import { upload_file_chunk, create_file, new_file } from "@wasm";
import { toast } from "sonner";
import JSZip from "jszip";
import type { FileExtension } from "@wasm";

const BATCH_SIZE = 10; // Number of files to process simultaneously
const MAX_RETRIES = 3;
const CHUNK_SIZE = 1024 * 1024 * 5; // 5MB chunks
const VALID_EXTENSIONS: FileExtension[] = ["pdf", "txt", "md"];

interface UploadManagerState {
    isUploading: boolean;
    progress: number;
    uploadedFiles: number;
    totalFiles: number;
    estimatedTimeRemaining: number;
    startTime: Date | null;
    failedFiles: string[];
    filesAlreadyExisted: number;
    setIsUploading: (isUploading: boolean) => void;
    setProgress: (progress: number) => void;
    setUploadedFiles: (uploadedFiles: number) => void;
    setTotalFiles: (totalFiles: number) => void;
    uploadFiles: (files: File[], onUploadComplete: () => void, handleRefetchFiles: () => void) => Promise<void>;
    resetUploadSession: () => void
}

async function extractFilesFromZip(zipFile: File): Promise<File[]> {
    const zip = new JSZip();
    const content = await zip.loadAsync(zipFile);
    const extractedFiles: File[] = [];

    async function processZipEntry(entry: JSZip.JSZipObject, parentPath: string = ''): Promise<void> {
        const fullPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;

        if (entry.dir) {
            return;
        }

        // Handle nested zip files
        if (entry.name.toLowerCase().endsWith('.zip')) {
            try {
                const zipContent = await entry.async('blob');
                const nestedZip = new File([zipContent], entry.name);
                const nestedFiles = await extractFilesFromZip(nestedZip);
                extractedFiles.push(...nestedFiles.map(file => {
                    // Preserve the nested path structure
                    const nestedPath = `${parentPath}/${file.name}`.replace(/^\//, '');
                    return new File([file], nestedPath, { type: file.type });
                }));
            } catch (error) {
                console.error(`Failed to process nested zip file ${entry.name}:`, error);
                toast.error(`Failed to process nested zip file: ${entry.name}`);
            }
            return;
        }

        const extension = entry.name.split('.').pop()?.toLowerCase() as FileExtension;
        if (!VALID_EXTENSIONS.includes(extension)) {
            return;
        }

        try {
            const blob = await entry.async('blob');
            const file = new File([blob], fullPath, {
                type: `application/${extension}`,
            });
            extractedFiles.push(file);
        } catch (error) {
            console.error(`Failed to process file ${entry.name}:`, error);
        }
    }

    // Process all files in the zip, maintaining directory structure
    const processPromises = Object.values(content.files).map(async (entry) => {
        await processZipEntry(entry);
    });

    await Promise.all(processPromises);
    return extractedFiles;
}

async function processAndUploadFile(
    file: File,
    onProgress: (processed: number) => void,
    set: (fn: (state: UploadManagerState) => Partial<UploadManagerState>) => void
): Promise<void> {
    try {
        const filePath = file.name; // This now contains the full path from webkitRelativePath

        if (file.size === 0) {
          console.error(`File ${file.name} has zero size. Skipping upload.`);
          throw new Error(`Cannot upload empty file: ${file.name}`);
        }

        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        // Use `new_file` to create the file synchronously and retrieve the response
        const newFileResponse = new_file({
            path: filePath,
            size: file.size,
        });

        if (!newFileResponse.output) {
            throw new Error("Failed to generate new file with `new_file`.");
        }

        // Get the generated File object directly
        const newFile = newFileResponse.output.output;

        // Use `create_file` to finalize file creation asynchronously
        const createResponse = await create_file({ input: newFile });

        if (createResponse.error) {
            if (createResponse.error.kind === "AlreadyExists") {
                set((state) => ({ filesAlreadyExisted: state.filesAlreadyExisted + 1 }));
            }
            throw new Error(`File creation error: ${createResponse.error.kind} - ${createResponse.error.message}`);
        }

        // Add a small delay after file creation to ensure backend consistency
        await new Promise((resolve) => setTimeout(resolve, 100));

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const blob = file.slice(start, end);
            const arrayBuffer = await blob.arrayBuffer();
            const chunk = new Uint8Array(arrayBuffer);

            let retries = 0;
            let lastError = null;

            while (retries < MAX_RETRIES) {
                try {
                    const response = await upload_file_chunk({
                        file_id: newFile.id,
                        chunk: {
                            id: { parent_id: newFile.id, index: chunkIndex },
                            data: chunk,
                        },
                    });

                    if (response.error) {
                        throw new Error(`Upload error: ${response.error.kind} - ${response.error.message}`);
                    }

                    // If successful, update progress and break retry loop
                    onProgress(chunk.length);
                    break;
                } catch (error) {
                    lastError = error;
                    retries++;
                    if (retries === MAX_RETRIES) {
                        console.error(`Failed to upload chunk ${chunkIndex} after ${MAX_RETRIES} retries:`, error);
                        throw error;
                    }
                    // Exponential backoff
                    await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)));
                }
            }

            if (lastError) {
                throw lastError;
            }
        }
    } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        throw error;
    }
}


export const useUploadManager = create<UploadManagerState>()((set, get) => ({
    isUploading: false,
    progress: 0,
    uploadedFiles: 0,
    totalFiles: 0,
    estimatedTimeRemaining: 0,
    startTime: null,
    failedFiles: [],
    filesAlreadyExisted: 0,

    setIsUploading: (isUploading: boolean) => set({ isUploading }),
    setProgress: (progress: number) => set({ progress }),
    setUploadedFiles: (uploadedFiles: number) => set({ uploadedFiles }),
    setTotalFiles: (totalFiles: number) => set({ totalFiles }),

    uploadFiles: async (files: File[], onUploadComplete: () => void, handleRefetchFiles: () => void) => {
        const state = get();

        set({ filesAlreadyExisted: 0 });

        if (state.isUploading) {
            toast.error("An upload is already in progress");
            return;
        }

        set({
            isUploading: true,
            progress: 0,
            uploadedFiles: 0,
            totalFiles: 0,
            startTime: new Date(),
            failedFiles: [],
        });

        try {
            let allFiles: File[] = [];
            let skippedFiles: string[] = [];

            // Process zip files first
            for (const file of files) {
                const extension = file.name.split('.').pop()?.toLowerCase() as FileExtension;

                if (extension === "zip") {
                    try {
                        const extractedFiles = await extractFilesFromZip(file);
                        console.debug(`Extracted ${extractedFiles.length} files from ${file.name}`);
                        allFiles.push(...extractedFiles);
                    } catch (error) {
                        console.error(`Failed to process zip file ${file.name}:`, error);
                    }
                } else if (VALID_EXTENSIONS.includes(extension)) {
                    allFiles.push(file);
                } else {
                    skippedFiles.push(file.name);
                }
            }

            if (skippedFiles.length > 0) {
                toast.warning(`Skipped ${skippedFiles.length} unsupported files: ${skippedFiles.join(', ')}`);
            }

            const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
            let uploadedSize = 0;
            const failedFiles: string[] = [];

            set({ totalFiles: allFiles.length });
            console.debug(`Starting upload of ${allFiles.length} files`);

            // Process files in smaller batches
            for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
                const batch = allFiles.slice(i, i + BATCH_SIZE);
                await Promise.all(
                    batch.map(async (file) => {
                        try {
                            await processAndUploadFile(file, (processed: number) => {
                                uploadedSize += processed;
                                set({
                                    progress: uploadedSize / totalSize,
                                    uploadedFiles: get().uploadedFiles + 1,
                                });
                            }, set);
                            handleRefetchFiles()
                        } catch (error) {
                            failedFiles.push(file.name);
                        }
                    })
                );

                // Add a small delay between batches
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (failedFiles.length > 0) {
                toast.error(`Upload completed with ${failedFiles.length} failed files`);
            } else {
                toast.success(`Successfully uploaded ${allFiles.length} files`);
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            onUploadComplete()
            set({ isUploading: false });
        }
    },
    resetUploadSession: () => {
        set({
            isUploading: false,
            progress: 0,
            uploadedFiles: 0,
            totalFiles: 0,
            estimatedTimeRemaining: 0,
            startTime: null,
            failedFiles: [],
            filesAlreadyExisted: 0,
        });
    },
}));
