import { create } from "zustand";
import { upload_file_chunk, create_file } from "@wasm";
import type { FileExtension } from "@wasm";
import { toast } from "sonner";

export interface ProcessedFile {
  file: {
    id: string;
    path: string;
    size: number;
  };
  chunks: Uint8Array[];
}

interface UploadManagerState {
  isUploading: boolean;
  progress: number;
  uploadedFiles: number;
  totalFiles: number;
  estimatedTimeRemaining: number;
  startTime: Date | null;
  setIsUploading: (isUploading: boolean) => void;
  setProgress: (progress: number) => void;
  setUploadedFiles: (uploadedFiles: number) => void;
  setTotalFiles: (totalFiles: number) => void;
  uploadFiles: (files: ProcessedFile[]) => Promise<void>;
}

export const useUploadManager = create<UploadManagerState>()((set, get) => ({
  isUploading: false,
  progress: 0,
  uploadedFiles: 0,
  totalFiles: 0,
  estimatedTimeRemaining: 0,
  startTime: null,

  setIsUploading: (isUploading: boolean) => set({ isUploading }),
  setProgress: (progress: number) => set({ progress }),
  setUploadedFiles: (uploadedFiles: number) => set({ uploadedFiles }),
  setTotalFiles: (totalFiles: number) => set({ totalFiles }),

  uploadFiles: async (files: ProcessedFile[]) => {
    const state = get();
    if (state.isUploading) {
      toast.error("An upload is already in progress");
      return;
    }

    set({
      isUploading: true,
      progress: 0,
      uploadedFiles: 0,
      totalFiles: files.length,
      startTime: new Date(),
    });

    const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);
    let uploadedSize = 0;

    try {
      // Process files sequentially
      for (const file of files) {
        console.debug(`Creating file: ${file.file.path}`);

        await create_file({
          input: {
            id: file.file.id,
            path: file.file.path,
            title: file.file.path.split("/").pop() || file.file.path,
            extension: file.file.path
              .split(".")
              .pop()
              ?.toLowerCase() as FileExtension,
            size: file.file.size,
            total_chunks: file.chunks.length,
            uploaded: false,
            multipart_upload_id: undefined,
            multipart_upload_part_ids: undefined,
            created_date: new Date().toISOString(),
            status: "uploading",
          },
        });

        // Upload chunks
        for (let i = 0; i < file.chunks.length; i++) {
          console.debug(
            `Uploading chunk ${i + 1}/${file.chunks.length} for file ${file.file.path}`,
          );

          const chunk = {
            id: { parent_id: file.file.id, index: i },
            data: file.chunks[i],
          };

          const response = await upload_file_chunk({
            file_id: file.file.id,
            chunk,
          });

          // Check for client-side error in response
          if (response.error) {
            const errorKind = response.error.kind || "Unknown Error Kind";
            const errorMessage =
              response.error.message || "Unknown Error Message";

            // Log the entire error object for detailed inspection
            console.error(`Chunk upload error: ${errorKind} - ${errorMessage}`);

            toast.error(
              `Error uploading chunk: ${errorKind} - ${errorMessage}`,
            );
            throw new Error(`Upload failed for chunk ${i + 1}`);
          }

          uploadedSize += file.chunks[i].length;
          set({
            progress: uploadedSize / totalSize,
            uploadedFiles: get().uploadedFiles + 1,
          });
        }

        console.debug(`Completed upload for file: ${file.file.path}`);
      }

      toast.success(`Upload complete: ${files.length} files uploaded`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload files",
      );
    } finally {
      set({ isUploading: false });
    }
  },
}));
