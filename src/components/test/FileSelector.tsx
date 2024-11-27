import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { useUploadManager } from "@/components/test/UploadManagerStore";
import type { FileExtension } from "@wasm";
import { toast } from "sonner";

const SUPPORTED_EXTENSIONS: FileExtension[] = ["pdf", "txt", "md", "zip"];

export function FileSelector() {
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const uploadManager = useUploadManager();

  const processFiles = useCallback((files: File[]) => {
    const validFiles = files.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() as FileExtension;
      return ext && SUPPORTED_EXTENSIONS.includes(ext);
    });

    console.debug(`Processing ${validFiles.length} valid files`);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    try {
      await uploadManager.uploadFiles(selectedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload files",
      );
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files) as File[];
      processFiles(files);
    },
    [processFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files) as File[];
        processFiles(files);
      }
    },
    [processFiles],
  );

  return (
    <div className="space-y-6">
      <div
        className={`w-full border-2 rounded-lg flex flex-col items-center justify-center transition-colors p-8 ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-blue-500 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">Upload Files</p>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Drag & drop files here, or use the options below
        </p>
        <div className="flex space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileSelect}
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>
          <input
            type="file"
            ref={folderInputRef}
            className="hidden"
            // @ts-ignore
            webkitdirectory=""
            onChange={handleFileSelect}
          />
          <Button
            variant="default"
            onClick={() => folderInputRef.current?.click()}
          >
            Select Folder
          </Button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Files selected: {selectedFiles.length}
            </p>
            <Button onClick={handleUpload} disabled={uploadManager.isUploading}>
              {uploadManager.isUploading ? (
                <>
                  Uploading {uploadManager.uploadedFiles} of {uploadManager.totalFiles}...
                </>
              ) : (
                "Upload Files"
              )}
            </Button>
          </div>
          {uploadManager.isUploading && (
            <div className="space-y-2">
              <Progress value={uploadManager.progress * 100} />
              <p className="text-sm text-gray-600 text-center">
                {Math.round(uploadManager.progress * 100)}% complete
              </p>
            </div>
          )}
          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>Supported file types: {SUPPORTED_EXTENSIONS.join(", ")}</p>
        <p className="text-red-500 mt-1">
          Note: Nested zip files are not supported
        </p>
      </div>
    </div>
  );
}
