import React, { useState, useEffect } from "react";
import { IoCloseOutline, IoDocument } from "react-icons/io5";
import { BiLink } from "react-icons/bi";
import { LuMonitor, LuUpload } from "react-icons/lu";
import { Trash2 } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa6";

type FileWithPrivacy = {
  file: File;
  isPrivate: boolean;
};

interface LeadsFilesUploadPopupProps {
  show: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
  onUpload?: (files: File[] | string) => Promise<void>; // link or files
}

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

  if (!show) return null;

  /** ---- File Helpers ---- */
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

  /** ---- File Events ---- */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf"
    );

    if (dropped.length) {
      setFiles(dropped.map((f) => ({ file: f, isPrivate: true })));
      setAllPrivate(true);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf"
    );

    if (selected.length) {
      setFiles(selected.map((f) => ({ file: f, isPrivate: true })));
      setAllPrivate(true);
    }
  };

  const handleUpload = async () => {
    if (!onUpload) return;
    if (files.length === 0 && (!showLinkInput || !isValidLink(linkUrl))) return;

    setIsUploading(true);
    try {
      if (showLinkInput && isValidLink(linkUrl)) {
        await onUpload(linkUrl); // upload link
        
        setLinkUrl("");
        setShowLinkInput(false);

      } else {
        await onUpload(files.map((f) => f.file)); // upload files
        setFiles([]);
      }
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-400 ${
          theme === "dark" ? "bg-dark-secondary" : "bg-white"
        }`}
      >
        <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === "dark" ? "bg-dark-secondary" : "bg-white"}`}>
          {/* Close Button */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className={`rounded-md ${theme === "dark" ? "text-white" : "text-gray-400"} hover:text-gray-500`}
            >
              <IoCloseOutline size={24} />
            </button>
          </div>

          {/* Title */}
          <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
         Attach
          </h3>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-purple-500 bg-purple-500/10"
                : theme === "dark"
                ? "border-purple-500/30 bg-dark-tertiary"
                : "border-gray-300 bg-gray-50"
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
                  className={`w-full border rounded px-3 py-2 text-sm ${
                    theme === "dark"
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                />
              ) : (
                <>
                  <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    Drag and drop files here or upload from
                  </p>
                  <div className="flex justify-center gap-6">
                    <label
                      className={`flex flex-col items-center gap-2 text-sm cursor-pointer ${
                        theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-black"
                      }`}
                    >
                      <LuMonitor size={24} />
                      <span>Device</span>
                      <input type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleFileInput} />
                    </label>
                    <button
                      onClick={() => setShowLinkInput(true)}
                      className={`flex flex-col items-center gap-2 text-sm ${
                        theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-black"
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
                {files.map((f, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-md shadow-sm border ${
                      theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isImageFile(f.file.name) ? (
                        <img
                          src={URL.createObjectURL(f.file)}
                          alt={f.file.name}
                          className="w-14 h-14 object-cover rounded border border-gray-400"
                        />
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center border border-gray-400 rounded">
                          <IoDocument className={theme === "dark" ? "text-gray-300" : "text-gray-600"} size={20} />
                        </div>
                      )}
                      <div>
                        <p className={`text-sm font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                          {f.file.name}
                        </p>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {(f.file.size / 1024).toFixed(1)} KB
                        </p>
                        <label className="flex items-center gap-2 mt-1 text-xs">
                          <input
                            type="checkbox"
                            checked={f.isPrivate}
                            onChange={() =>
                              setFiles((prev) => prev.map((x, j) => (j === i ? { ...x, isPrivate: !x.isPrivate } : x)))
                            }
                          />
                          Private
                        </label>
                      </div>
                    </div>
                    <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}>
                      <Trash2 size={16} className={theme === "dark" ? "text-gray-300" : "text-gray-500"} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 sm:px-6 flex justify-between ${theme === "dark" ? "bg-dark-tertiary" : "bg-gray-50"}`}>
          <div className="flex gap-2">
            {showLinkInput && (
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl("");
                }}
                className={`px-3 py-2 text-sm rounded border ${theme === "dark" ? "text-white" : "bg-gray-50"}`}
              >
                <FaArrowLeft className="inline mr-1" /> Back
              </button>
            )}
            {files.length > 0 && (
              <button   className={`px-3 py-2 text-sm rounded border ${theme === "dark" ? "text-white" : "bg-gray-50"}`}
              >
                Remove all
              </button>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={(files.length === 0 && (!showLinkInput || !isValidLink(linkUrl))) || isUploading}
            className={`px-4 py-2 rounded text-white text-sm ${
              theme === "dark" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {isUploading ? (
              <span className="flex items-center">
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
