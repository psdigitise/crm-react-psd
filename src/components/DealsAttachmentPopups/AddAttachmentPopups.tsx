import React, { useState, useEffect } from 'react';
import { IoCloseOutline, IoDocument } from 'react-icons/io5';
import { BiLink } from 'react-icons/bi';
import { LuMonitor, LuUpload } from 'react-icons/lu';
import { Trash2 } from 'lucide-react';
import { FaArrowLeft } from 'react-icons/fa6';
import { AUTH_TOKEN } from '../../api/apiUrl';
import { showToast } from '../../utils/toast'; // Import your toast utility

type FileWithPrivacy = {
  file: File;
  isPrivate: boolean;
  fromLink?: string; // for linked files
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
  dealName: string;
  fetchAttachments: any,
};

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

const UploadAttachmentPopup: React.FC<Props> = ({
  isOpen,
  onClose,
  theme = 'dark',
  dealName,
  fetchAttachments
}) => {
  const [files, setFiles] = useState<FileWithPrivacy[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [allPrivate, setAllPrivate] = useState(true);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAllPrivate(true);
      setFiles(prev =>
        prev.map(file => ({ ...file, isPrivate: true }))
      );
    }
  }, [isOpen]);

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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isFileTooLarge = (file: File): boolean => {
    return file.size > MAX_FILE_SIZE;
  };

  if (!isOpen) return null;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles: FileWithPrivacy[] = [];
    let hasInvalidFiles = false;

    droppedFiles.forEach((file) => {
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
      if (validFiles.length < droppedFiles.length) {
        showToast(`Added ${validFiles.length} file(s). Some files were skipped due to validation errors.`, { 
          type: 'warning' 
        });
      }
    } else if (hasInvalidFiles) {
      showToast("No valid files were added. Please check file size (max 1MB) and type.", { type: 'error' });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: FileWithPrivacy[] = [];
    let hasInvalidFiles = false;

    selectedFiles.forEach((file) => {
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
      if (validFiles.length < selectedFiles.length) {
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
      const token = AUTH_TOKEN;

      // If link input is shown and valid, upload using from_link
      if (showLinkInput && isValidLink(linkUrl)) {
        const formData = new FormData();
        formData.append("doctype", "CRM Deal");
        formData.append("docname", dealName);
        formData.append("file_url", linkUrl);
        formData.append("is_private", "0");
        formData.append("folder", "Home/Attachments");

        const response = await fetch("https://api.erpnext.ai/api/method/upload_file", {
          method: "POST",
          headers: {
            Authorization: AUTH_TOKEN,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for link: ${linkUrl}`);
        }

        const data = await response.json();
        console.log("Link upload successful:", data);
        fetchAttachments();
        showToast("File uploaded successfully!", { type: 'success' });
        
        // Clear input after success
        setLinkUrl('');
        setShowLinkInput(false);
        onClose();
        return;
      }

      // Upload local files
      let successCount = 0;
      let errorCount = 0;

      for (const fileItem of files) {
        try {
          const formData = new FormData();
          formData.append("doctype", "CRM Deal");
          formData.append("docname", dealName);
          formData.append("type", fileItem.file.type || "application/octet-stream");
          formData.append("file", fileItem.file);
          formData.append("is_private", "0");
          formData.append("folder", "Home/Attachments");

          const response = await fetch("https://api.erpnext.ai/api/method/upload_file", {
            method: "POST",
            headers: {
              Authorization: AUTH_TOKEN,
            },
            body: formData,
          });

          if (!response.ok) {
            errorCount++;
            console.error(`Upload failed for file: ${fileItem.file.name}`);
            continue; // Continue with next file instead of throwing
          }

          const data = await response.json();
          console.log("Upload successful:", data);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error uploading ${fileItem.file.name}:`, error);
        }
      }

      // Show summary toast
      if (successCount > 0) {
        showToast(`${successCount} file(s) uploaded successfully!`, { type: 'success' });
      }
      if (errorCount > 0) {
        showToast(`${errorCount} file(s) failed to upload.`, { type: 'error' });
      }

      fetchAttachments();
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      showToast("Failed to upload files", { type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isImageFile = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const isValidLink = (url: string) => {
    try {
      const parsed = new URL(url);
      return (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        (parsed.pathname.endsWith('.pdf') || /\.(jpg|jpeg|png|webp|gif)$/i.test(parsed.pathname))
      );
    } catch {
      return false;
    }
  };

  // Check if any file exceeds size limit
  const hasInvalidFiles = files.some(f => isFileTooLarge(f.file));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-400 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to overlay
      >
        <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
          {/* Close */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className={`rounded-md ${theme === 'dark' ? 'text-white' : 'text-gray-400'} hover:text-gray-500 focus:outline-none`}
              onClick={onClose}
            >
              <IoCloseOutline size={24} />
            </button>
          </div>

          {/* Header */}
          <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Attach File
          </h3>

          {/* File size warning */}
          <p className={`text-xs mb-4 font-normal ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Maximum file size: 1MB. Allowed types: Images, PDF, Word, Excel, Text files
          </p>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : theme === 'dark'
                ? 'border-purple-500/30 bg-dark-tertiary'
                : 'border-gray-300 bg-gray-50'
              }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {files.length === 0 ? (
              showLinkInput ? (
                <div>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring ${theme === 'dark'
                      ? 'bg-gray-800 text-white border-gray-600 focus:ring-purple-500'
                      : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                </div>
              ) : (
                <>
                  <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Drag and drop files here or upload from
                  </p>
                  <div className="flex justify-center gap-6">
                    <label
                      className={`flex flex-col items-center gap-2 text-sm cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
                        }`}
                    >
                      <LuMonitor size={24} />
                      <span>Device</span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={handleFileInput}
                      />
                    </label>
                    <button
                      onClick={() => setShowLinkInput((prev) => !prev)}
                      className={`flex flex-col items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
                        }`}
                    >
                      <BiLink size={24} />
                      <span>Link</span>
                    </button>
                  </div>
                </>
              )
            ) : (
              <div className="space-y-4">
                {files.map((fileItem, index) => {
                  const isTooLarge = isFileTooLarge(fileItem.file);
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-md shadow-sm border ${isTooLarge ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {isImageFile(fileItem.file.name) ? (
                          <img
                            src={URL.createObjectURL(fileItem.file)}
                            alt={fileItem.file.name}
                            className="w-14 h-14 object-cover rounded border border-gray-400 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 flex items-center justify-center border border-gray-400 rounded flex-shrink-0">
                            <IoDocument
                              className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <div>
                            <p
                              className={`text-sm font-medium ${isTooLarge ? 'text-red-500' : theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                              style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                              }}
                            >
                              {fileItem.file.name}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatFileSize(fileItem.file.size)}
                              {isTooLarge && <span className="ml-2 text-red-500">(Exceeds 1MB)</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className={`p-2 rounded-full self-center ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                          }`}
                      >
                        <Trash2 size={16} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} />
                      </button>
                    </div>
                  );
                })}
                
                {/* Validation summary */}
                {hasInvalidFiles && (
                  <div className={`text-xs p-2 rounded ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'}`}>
                    <p className="font-medium">⚠️ Files marked in red exceed the 1MB limit and cannot be uploaded.</p>
                    <p className="mt-1">Please remove them or select smaller files.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-4 py-3 sm:px-6 sm:flex items-center justify-between ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}
        >
          {/* Left: Remove all button (conditionally shown) */}
          <div className="flex items-center">
            {showLinkInput && (
              <button
                type="button"
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }}
                className={`inline-flex items-center gap-2 justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:text-sm ${theme === 'dark'
                  ? 'border-gray-600 bg-dark-accent text-white hover:bg-purple-500/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <FaArrowLeft className="text-base" />
                <span>Back to file upload</span>
              </button>
            )}
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => setFiles([])}
                className={`inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:text-sm ${theme === 'dark'
                  ? 'border-gray-600 bg-dark-accent text-white hover:bg-purple-500/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Remove all
              </button>
            )}
          </div>

          {/* Right: Attach button */}
          <div className="flex gap-3 items-center mt-3 sm:mt-0">
            <button
              type="button"
              onClick={handleUpload}
              disabled={
                (files.length === 0 && (!showLinkInput || !isValidLink(linkUrl))) || 
                isUploading ||
                hasInvalidFiles // Disable if any file is too large
              }
              className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${theme === 'dark'
                ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                } ${(files.length === 0 && (!showLinkInput || !isValidLink(linkUrl))) || isUploading || hasInvalidFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <LuUpload className="animate-pulse mr-2" />
                  Uploading...
                </span>
              ) : (
                `Attach`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadAttachmentPopup;