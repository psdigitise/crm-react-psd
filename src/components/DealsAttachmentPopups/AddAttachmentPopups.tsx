import React, { useState, useEffect } from 'react';
import { IoCloseOutline, IoDocument } from 'react-icons/io5';
import { BiLink } from 'react-icons/bi';
import { LuMonitor, LuUpload } from 'react-icons/lu';
import { Trash2 } from 'lucide-react';
import { FaArrowLeft } from 'react-icons/fa6';

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

    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter(file =>
        file.type.startsWith('image/') ||
        file.type === 'application/pdf'
      );

    if (droppedFiles.length) {
      const filesWithPrivacy: FileWithPrivacy[] = droppedFiles.map(file => ({
        file,
        isPrivate: true
      }));
      setFiles(filesWithPrivacy);
      setAllPrivate(true);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
      .filter(file =>
        file.type.startsWith('image/') ||
        file.type === 'application/pdf'
      );

    if (selectedFiles.length) {
      const filesWithPrivacy: FileWithPrivacy[] = selectedFiles.map(file => ({
        file,
        isPrivate: true
      }));
      setFiles(filesWithPrivacy);
      setAllPrivate(true);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 && (!showLinkInput || !isValidLink(linkUrl))) return;

    setIsUploading(true);
    try {
      const token = "1b670b800ace83b:f82627cb56de7f6";

      // If link input is shown and valid, upload using from_link
      if (showLinkInput && isValidLink(linkUrl)) {
        const formData = new FormData();
        formData.append("doctype", "CRM Deal");
        formData.append("docname", dealName);
        formData.append("file_url", linkUrl);
        formData.append("is_private", "0"); // or "0" if you want it public
        formData.append("folder", "Home/Attachments");

        const response = await fetch("http://103.214.132.20:8002/api/method/upload_file", {
          method: "POST",
          headers: {
            Authorization: `token ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for link: ${linkUrl}`);
        }

        const data = await response.json();
        console.log("Link upload successful:", data);
        fetchAttachments();
        // Clear input after success
        setLinkUrl('');
        setShowLinkInput(false);

        // if (onFilesUploaded) {
        //   onFilesUploaded([{ name: linkUrl } as File]); // or any mock info if needed
        // }

        onClose();
        return;
      }

      // Upload local files
      for (const fileItem of files) {
        const formData = new FormData();
        formData.append("doctype", "CRM Deal");
        formData.append("docname", dealName);
        formData.append("type", isImageFile(fileItem.file.name) ? "image" : "file");
        formData.append("file", fileItem.file);
        formData.append("is_private", fileItem.isPrivate ? "1" : "0");
        formData.append("folder", "Home/Attachments");

        const response = await fetch("http://103.214.132.20:8002/api/method/upload_file", {
          method: "POST",
          headers: {
            Authorization: `token ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for file: ${fileItem.file.name}`);
        }

        const data = await response.json();
        console.log("Upload successful:", data);
        fetchAttachments();
      }

      // if (onFilesUploaded) {
      //   onFilesUploaded(files.map(f => f.file));
      // }

      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
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
          <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Attach File
          </h3>

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
                    placeholder="https://example.com"
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
                        accept="image/*,.pdf"
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
                  {showLinkInput && (
                    <div className="mt-4">
                      <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="Paste file link (image or PDF)"
                        className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring ${theme === 'dark'
                          ? 'bg-gray-800 text-white border-gray-600 focus:ring-purple-500'
                          : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500'
                          }`}
                      />
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="space-y-4">
                {files.map((fileItem, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-md shadow-sm border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {isImageFile(fileItem.file.name) ? (
                        <img
                          src={URL.createObjectURL(fileItem.file)}
                          alt={fileItem.file.name}
                          className="w-14 h-14 object-cover rounded border border-gray-400"
                        />
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center border border-gray-400 rounded">
                          <IoDocument
                            className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div>
                          <p
                            className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'
                              }`}
                          >
                            {fileItem.file.name}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {(fileItem.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`private-${index}`}
                            checked={fileItem.isPrivate}
                            onChange={() =>
                              setFiles((prev) =>
                                prev.map((f, i) => (i === index ? { ...f, isPrivate: !f.isPrivate } : f))
                              )
                            }
                            className={`rounded ${theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-purple-500'
                              : 'bg-white border-gray-300 text-blue-500'
                              }`}
                          />
                          <label
                            htmlFor={`private-${index}`}
                            className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            Private
                          </label>
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
                ))}
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

          {/* Right: Attach + Set all as public/private */}
          <div className="flex gap-3 items-center mt-3 sm:mt-0">
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const newPrivacy = !allPrivate;
                  setFiles(prev => prev.map(f => ({ ...f, isPrivate: newPrivacy })));
                  setAllPrivate(newPrivacy);
                }}
                className={`inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:text-sm ${theme === 'dark'
                  ? 'border-gray-600 bg-dark-accent text-white hover:bg-purple-500/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {allPrivate ? 'Set all as public' : 'Set all as private'}
              </button>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={(files.length === 0 && (!showLinkInput || !isValidLink(linkUrl))) || isUploading}
              className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${theme === 'dark'
                ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                } ${(files.length === 0 && (!showLinkInput || !isValidLink(linkUrl))) || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
