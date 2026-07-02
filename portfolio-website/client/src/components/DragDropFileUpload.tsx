import React, { useRef, useCallback, useState } from "react";
import { Upload, FileCheck, CircleAlert as AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropFileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  acceptedFormats?: string[];
  isLoading?: boolean;
  disabled?: boolean;
  maxSize?: number; // in bytes
}

/**
 * DragDropFileUpload Component
 * Provides an intuitive drag-and-drop file upload zone with visual feedback
 * Supports both drag-drop and click-to-upload interactions
 */
export function DragDropFileUpload({
  onFileSelect,
  accept = ".xlsx,.xls,.csv,.pdf",
  acceptedFormats = ["Excel (.xlsx, .xls)", "CSV (.csv)", "PDF (.pdf)"],
  isLoading = false,
  disabled = false,
  maxSize = 50 * 1024 * 1024, // 50MB default
}: DragDropFileUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      // Check file size
      if (file.size > maxSize) {
        setError(
          `File is too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB`
        );
        return false;
      }

      // Check file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const acceptedExtensions = accept
        .split(",")
        .map((ext) => ext.trim().replace(".", ""));

      if (!fileExtension || !acceptedExtensions.includes(fileExtension)) {
        setError(
          `Invalid file type. Please upload: ${acceptedFormats.join(", ")}`
        );
        return false;
      }

      return true;
    },
    [accept, acceptedFormats, maxSize]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      setIsDragging(true);
    }
  }, [disabled, isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isLoading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          onFileSelect(file);
        }
      }
    },
    [disabled, isLoading, validateFile, onFileSelect]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
      // Reset input to allow selecting the same file again
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    },
    [validateFile, onFileSelect]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isLoading) {
      fileRef.current?.click();
    }
  }, [disabled, isLoading]);

  return (
    <div className="space-y-3">
      {/* Main Upload Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer",
          isDragging && !disabled && !isLoading
            ? "border-[#c9a84c] bg-[#c9a84c]/10 scale-105"
            : "border-white/20 hover:border-[#c9a84c]/50 hover:bg-white/5",
          (disabled || isLoading) && "opacity-60 cursor-not-allowed"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <>
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-[#c9a84c]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-[#c9a84c] rounded-full animate-spin" />
              </div>
              <p className="text-[#c9a84c] font-semibold text-lg">
                Importing data...
              </p>
              <p className="text-gray-400 text-sm">
                Creating client accounts and policies from your file
              </p>
            </>
          ) : isDragging ? (
            <>
              <FileCheck className="text-[#c9a84c] animate-bounce" size={48} />
              <p className="text-[#c9a84c] font-semibold text-lg">
                Drop your file here
              </p>
              <p className="text-gray-400 text-sm">
                Release to upload and import
              </p>
            </>
          ) : (
            <>
              <Upload className="text-gray-400" size={48} />
              <div>
                <p className="text-white font-semibold text-lg">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-400 text-sm">
                  {acceptedFormats.join(", ")}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-400 font-semibold text-sm">Upload Error</p>
            <p className="text-red-300/80 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isLoading}
      />
    </div>
  );
}
