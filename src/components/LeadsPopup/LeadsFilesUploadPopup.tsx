import React, { useState, useEffect } from "react";
import { IoCloseOutline, IoDocument } from "react-icons/io5";
import { BiLink } from "react-icons/bi";
import { LuMonitor, LuUpload } from "react-icons/lu";
import { Trash2 } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa6";
import { showToast } from "../../utils/toast"; // Make sure to import your toast utility

type FileWithPrivacy = {
  file: File;
  isPrivate: boolean;
};

interface LeadsFilesUploadPopupProps {
  show: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
  onUpload?: (files: File[] | string) => Promise<void>;
}

// File upload configuration
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];
const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];

const LeadsFilesUploadPopup: React.FC<LeadsFilesUploadPopupProps> = ({
  show,
  onClose,
  theme = "light",
  onUpload,
}) => {
  const [files, setFiles] = useState<FileWithPrivacy[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [allPrivate, setAllPrivate] = useState(true);

  useEffect(() => {
    if (show) {
      setAllPrivate(true);
      setFiles((prev) => prev.map((f) => ({ ...f, isPrivate: true })));
    }
  }, [show]);

  // Add this line back - it was missing in your new code
  if (!show) return null;

  // Function to validate file before adding
  const validateFile = (file: File): { isValid: boolean; message?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        message: `Size exceeds the maximum allowed file size. Maximum size is 1MB.`
      };
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type) && 
        !ALLOWED_FILE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return {
        isValid: false,
        message: `File type not allowed. Allowed types: images, PDF, Word, Excel, text files.`
      };
    }

    return { isValid: true };
  };

  const isImageFile = (name: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name);

  const isValidLink = (url: string) => {
    try {
      const parsed = new URL(url);
      return (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        (parsed.pathname.endsWith(".pdf") || /\.(jpg|jpeg|png|webp|gif)$/i.test(parsed.pathname))
      );
    } catch {
      return false;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const dropped = Array.from(e.dataTransfer.files);
    const validFiles: FileWithPrivacy[] = [];
    let hasInvalidFiles = false;

    dropped.forEach((file) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push({ file, isPrivate: true });
      } else {
        hasInvalidFiles = true;
        showToast(validation.message || "Invalid file", { type: 'error' });
      }
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
      setAllPrivate(true);
      if (validFiles.length < dropped.length) {
        showToast(`Added ${validFiles.length} file(s). Some files were skipped due to validation errors.`, { 
          type: 'warning' 
        });
      }
    } else if (hasInvalidFiles) {
      showToast("No valid files were added. Please check file size (max 1MB) and type.", { type: 'error' });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const validFiles: FileWithPrivacy[] = [];
    let hasInvalidFiles = false;

    selected.forEach((file) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push({ file, isPrivate: true });
      } else {
        hasInvalidFiles = true;
        showToast(validation.message || "Invalid file", { type: 'error' });
      }
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
      setAllPrivate(true);
      if (validFiles.length < selected.length) {
        showToast(`Added ${validFiles.length} file(s). Some files were skipped due to validation errors.`, { 
          type: 'warning' 
        });
      }
    } else if (hasInvalidFiles) {
      showToast("No valid files were added. Please check file size (max 1MB) and type.", { type: 'error' });
    }

    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!onUpload) return;
    if (files.length === 0 && (!showLinkInput || !isValidLink(linkUrl))) return;

    // Validate all files before upload
    const invalidFiles = files.filter(f => {
      const validation = validateFile(f.file);
      return !validation.isValid;
    });

    if (invalidFiles.length > 0) {
      showToast(`${invalidFiles.length} file(s) failed validation. Please remove them before uploading.`, { 
        type: 'error' 
      });
      return;
    }

    setIsUploading(true);
    try {
      if (showLinkInput && isValidLink(linkUrl)) {
        await onUpload(linkUrl);
        setLinkUrl("");
        setShowLinkInput(false);
      } else {
        await onUpload(files.map((f) => f.file));
        setFiles([]);
      }
      onClose();
      showToast("Files uploaded successfully!", { type: 'success' });
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("Failed to upload files", { type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Check if file exceeds size limit
  const isFileTooLarge = (file: File): boolean => {
    return file.size > MAX_FILE_SIZE;
  };

  // Theme-based styles
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondaryColor = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-white";
  const bgSecondaryColor = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const borderColor = theme === "dark" ? "border-gray-600" : "border-gray-300";
  const inputBgColor = theme === "dark" ? "bg-gray-700" : "bg-white";
  const placeholderColor = theme === "dark" ? "placeholder-gray-400" : "placeholder-gray-500";
  const hoverBgColor = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const dropzoneBgColor = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const errorColor = theme === "dark" ? "text-red-400" : "text-red-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border ${borderColor} ${bgColor}`}
      >
        <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${bgColor}`}>
          {/* Close Button */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className={`rounded-md ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-400 hover:text-gray-500"}`}
            >
              <IoCloseOutline size={24} />
            </button>
          </div>

          {/* Title */}
          <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>
            Attach Files
          </h3>
          
          {/* File size warning */}
          <p className={`text-xs mb-4 font-normal ${textSecondaryColor}`}>
            Maximum file size: 1MB. Allowed types: Images, PDF, Word, Excel, Text files
          </p>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
              ? theme === "dark"
                ? "border-purple-500 bg-purple-900/30"
                : "border-purple-500 bg-purple-50"
              : `${borderColor} ${dropzoneBgColor}`
              }`}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {files.length === 0 ? (
              showLinkInput ? (
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Paste file link (image or PDF)"
                  className={`w-full border rounded px-3 py-2 text-sm font-normal ${inputBgColor} ${textColor} ${borderColor} ${placeholderColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              ) : (
                <>
                  <p className={`text-sm mb-6 font-normal ${textSecondaryColor}`}>
                    Drag and drop files here or upload from
                  </p>
                  <div className="flex justify-center gap-6">
                    <label
                      className={`flex flex-col items-center gap-2 text-sm cursor-pointer font-normal ${textSecondaryColor} hover:${textColor} transition-colors`}
                    >
                      <LuMonitor size={24} />
                      <span>Device</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" 
                        className="hidden" 
                        onChange={handleFileInput} 
                      />
                    </label>
                    <button
                      onClick={() => setShowLinkInput(true)}
                      className={`flex flex-col items-center gap-2 text-sm font-normal ${textSecondaryColor} hover:${textColor} transition-colors`}
                    >
                      <BiLink size={24} />
                      <span>Link</span>
                    </button>
                  </div>
                </>
              )
            ) : (
              <div className="space-y-4">
                {files.map((f, i) => {
                  const isTooLarge = isFileTooLarge(f.file);
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-4 rounded-md shadow-sm border ${isTooLarge ? 'border-red-500' : borderColor} ${bgColor}`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {isImageFile(f.file.name) ? (
                          <img
                            src={URL.createObjectURL(f.file)}
                            alt={f.file.name}
                            className="w-14 h-14 object-cover rounded border border-gray-400 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 flex items-center justify-center border border-gray-400 rounded flex-shrink-0">
                            <IoDocument className={textSecondaryColor} size={20} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className={`text-sm font-medium truncate ${isTooLarge ? errorColor : textColor}`}>
                            {f.file.name}
                          </p>
                          <p className={`text-xs font-normal ${textSecondaryColor}`}>
                            {formatFileSize(f.file.size)}
                            {isTooLarge && <span className={`ml-2 ${errorColor}`}> (Exceeds 1MB)</span>}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                        className={`p-2 rounded-md flex-shrink-0 ${theme === "dark" ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"} transition-colors`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
                
                {/* Validation summary */}
                {files.some(f => isFileTooLarge(f.file)) && (
                  <div className={`text-xs p-2 rounded ${theme === "dark" ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-600"}`}>
                    <p className="font-medium">⚠️ Files marked in red exceed the 1MB limit and cannot be uploaded.</p>
                    <p className="mt-1">Please remove them or select smaller files.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 sm:px-6 flex justify-between ${bgSecondaryColor}`}>
          <div className="flex gap-2">
            {showLinkInput && (
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl("");
                }}
                className={`px-3 py-2 text-sm rounded border font-medium ${borderColor} ${textColor} ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-50"} transition-colors`}
              >
                <FaArrowLeft className="inline mr-1" /> Back
              </button>
            )}
            {files.length > 0 && (
              <button
                onClick={() => setFiles([])}
                className={`px-3 py-2 text-sm rounded border font-medium ${borderColor} ${textColor} ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-50"} transition-colors`}
              >
                Remove all
              </button>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={
              (files.length === 0 && (!showLinkInput || !isValidLink(linkUrl))) || 
              isUploading ||
              files.some(f => isFileTooLarge(f.file)) // Disable if any file is too large
            }
            className={`px-4 py-2 rounded text-white text-sm font-medium ${theme === "dark" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
              } disabled:opacity-50 transition-colors`}
          >
            {isUploading ? (
              <span className="flex items-center font-medium">
                <LuUpload className="animate-pulse mr-2" /> Uploading...
              </span>
            ) : (
              "Attach"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadsFilesUploadPopup;