import { create } from "zustand";
import { upload_file_chunk, create_file, new_file } from "@wasm";
import { toast } from "sonner";
import JSZip from "jszip";

const BATCH_SIZE = 10; // Number of files to process simultaneously
const MAX_RETRIES = 3;
const CHUNK_SIZE = 1024 * 1024 * 5; // 5MB chunks

interface UploadManagerState {
  isUploading: boolean;
  progress: number;
  uploadedFiles: number;
  totalFiles: number;
  estimatedTimeRemaining: number;
  startTime: Date | null;
  failedFiles: string[];
  setIsUploading: (isUploading: boolean) => void;
  setProgress: (progress: number) => void;
  setUploadedFiles: (uploadedFiles: number) => void;
  setTotalFiles: (totalFiles: number) => void;
  uploadFiles: (files: File[]) => Promise<void>;
}

async function extractFilesFromZip(zipFile: File): Promise<File[]> {
  const zip = new JSZip();
  const content = await zip.loadAsync(zipFile);
  const extractedFiles: File[] = [];

  for (const [path, zipEntry] of Object.entries(content.files)) {
    if (zipEntry.dir || path.toLowerCase().endsWith('.zip')) {
      continue;
    }

    const extension = path.split('.').pop()?.toLowerCase();
    if (!['pdf', 'txt', 'md'].includes(extension || '')) {
      continue;
    }

    const blob = await zipEntry.async('blob');
    const file = new File([blob], path.split('/').pop() || path, {
      type: `application/${extension}`,
    });
    extractedFiles.push(file);
  }

  return extractedFiles;
}

async function processAndUploadFile(
  file: File,
  onProgress: (processed: number) => void
): Promise<void> {
  try {
    console.debug(`Processing file ${file.name}`);
    const fileName = file.name;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Use `new_file` to create the file synchronously and retrieve the response
    const newFileResponse = new_file({
      path: fileName,
      size: file.size,
    });

    if (!newFileResponse.output) {
      throw new Error("Failed to generate new file with `new_file`.");
    }

    // Get the generated File object directly
    const newFile = newFileResponse.output.output;

    console.debug(`Generated new file:`, newFile);

    // Use `create_file` to finalize file creation asynchronously
    const createResponse = await create_file({ input: newFile });

    if (createResponse.error) {
      throw new Error(`File creation error: ${createResponse.error.kind} - ${createResponse.error.message}`);
    }

    console.debug(`File successfully created on the backend:`, createResponse);

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

  setIsUploading: (isUploading: boolean) => set({ isUploading }),
  setProgress: (progress: number) => set({ progress }),
  setUploadedFiles: (uploadedFiles: number) => set({ uploadedFiles }),
  setTotalFiles: (totalFiles: number) => set({ totalFiles }),

  uploadFiles: async (files: File[]) => {
    const state = get();
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
      
      // Process zip files first
      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.zip')) {
          try {
            const extractedFiles = await extractFilesFromZip(file);
            console.debug(`Extracted ${extractedFiles.length} files from ${file.name}`);
            allFiles.push(...extractedFiles);
          } catch (error) {
            console.error(`Failed to process zip file ${file.name}:`, error);
            toast.error(`Failed to process zip file: ${file.name}`);
          }
        } else {
          allFiles.push(file);
        }
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
              });
            } catch (error) {
              failedFiles.push(file.name);
              console.error(`Failed to upload ${file.name}:`, error);
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
      toast.error(error instanceof Error ? error.message : "Failed to upload files");
    } finally {
      set({ isUploading: false });
    }
  },
}));
