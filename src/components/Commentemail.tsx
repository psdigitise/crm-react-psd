import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Smile,
} from "lucide-react";
import { useTheme } from './ThemeProvider';
import Emailpageleads from "./Emailpageleads";
import { getUserSession } from "../utils/session";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import axios from "axios";
import { IoDocument } from "react-icons/io5";
import { getAuthToken } from "../api/apiUrl";
import { showToast } from "../utils/toast"; // Assuming you have this

interface CommentEmailProps {
  fetchComments: () => void;
  reference_name: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

//const AUTH_TOKEN =  getAuthToken();
// const token = getAuthToken();
const UPLOAD_API_URL = "https://api.erpnext.ai/api/method/upload_file";

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

export default function Commentemail({
  fetchComments,
  reference_name,
  onSuccess,
  onClose,
}: CommentEmailProps) {
  const { theme } = useTheme();
  const [showReply, setShowReply] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const userSession = getUserSession();
  const sessionfullname = userSession?.full_name;
  const CommentedBy = userSession?.username || sessionfullname;
  const email = userSession?.email;
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to validate file before upload
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      showToast(`Size exceeds the maximum allowed file size. Maximum size is 1MB.`, { type: 'error' });
      return false;
    }

    // Check file type (optional - you can remove this if you want to allow all file types)
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      showToast(`File type not allowed. Allowed types: images, PDF, Word, Excel, text files.`, { type: 'error' });
      return false;
    }

    return true;
  };

  async function uploadFiles(files: File[]): Promise<string[]> {
    const uploadedFileIds: string[] = [];

    for (const file of files) {
      // Validate file before upload
      if (!validateFile(file)) {
        throw new Error(`File validation failed for: ${file.name}`);
      }

      const formData = new FormData();
      formData.append("doctype", "CRM Deal");
      formData.append("docname", reference_name);
      formData.append("type", "image");
      formData.append("file", file);
      formData.append("is_private", "0");
      formData.append("folder", "Home/Attachments");

      try {
        const token = getAuthToken();
        const response = await axios.post(UPLOAD_API_URL, formData, {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        });

        const fileId = response.data?.message?.name;
        if (fileId) uploadedFileIds.push(fileId);
      } catch (error) {
        console.error("File upload error:", error);
        throw new Error("File upload failed");
      }
    }

    return uploadedFileIds;
  }

  // Handle file input change with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        showToast(`Size exceeds the maximum allowed file size. Maximum size is 1MB.`, { type: 'error' });
        e.target.value = "";
        return;
      }

      // Validate file type (optional)
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        showToast(`File type not allowed. Allowed types: images, PDF, Word, Excel, text files.`, { type: 'error' });
        e.target.value = "";
        return;
      }

      // Check for duplicates
      const isDuplicate = uploadedFiles.some(
        existingFile => existingFile.name === file.name
      );

      if (!isDuplicate) {
        setUploadedFiles((prev) => [...prev, file]);
        showToast(`File "${file.name}" added successfully.`, { type: 'success' });
      } else {
        showToast("This file has already been attached", { type: "warning" });
      }
      e.target.value = "";
    }
  };

  const sendComment = async () => {
    if (!comment.trim()) {
      showToast("Please type your comment.", { type: "warning" });
      return;
    }

    // Validate all attached files before sending
    for (const file of uploadedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File "${file.name}" exceeds maximum size of 1MB. Please remove it or choose a smaller file.`, { type: 'error' });
        return;
      }
    }

    setLoading(true);
    try {
      let attachmentIds: string[] = [];
      const token = getAuthToken();

      // Step 1: Upload attachments if any
      if (uploadedFiles.length > 0) {
        attachmentIds = await uploadFiles(uploadedFiles);
      }

      // Step 2: Add the comment
      const commentResponse = await fetch(`https://api.erpnext.ai/api/method/frappe.desk.form.utils.add_comment`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_by: CommentedBy,
          comment_email: email,
          content: comment,
          reference_doctype: "CRM Deal",
          reference_name: reference_name
        }),
      });

      const commentData = await commentResponse.json();

      if (commentResponse.ok) {
        // Step 3: If we have attachments, link them to the comment
        if (attachmentIds.length > 0) {
          const commentName = commentData.message.name; // Get the comment name/id from response

          await fetch(`https://api.erpnext.ai/api/method/crm.api.comment.add_attachments`, {
            method: "POST",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: commentName,
              attachments: attachmentIds
            }),
          });
        }

        // Success handling
        setComment("");
        setUploadedFiles([]);
        if (onSuccess) onSuccess();
        fetchComments();
        if (onClose) onClose();
        showToast("Comment added successfully!", { type: "success" });
      } else {
        throw new Error("Failed to add comment");
      }
    } catch (error) {
      console.error("Failed to add comment", error);
      showToast("Failed to add comment", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const addEmoji = (emoji: { native: string }) => {
    setComment(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Remove duplicate file handler
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`max-full mx-auto rounded-md shadow-sm p-4 space-y-4 mb-5 border ${theme === 'dark'
        ? 'bg-transparent text-white border-transparent'
        : 'bg-white text-gray-800 border-gray-500'
        }`}
    >
      {/* Top Action Tabs */}
      <div
        className={`flex gap-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
      >
      </div>

      {showReply ? (
        <Emailpageleads
          onClose={() => setShowReply(false)}
        />
      ) : (
        <div>
          <textarea
            className={`w-full h-40 rounded-md p-3 text-sm focus:outline-none focus:ring-1 ${theme === 'dark'
              ? 'bg-white-31 border-gray-600 text-white !placeholder-gray-400 focus:ring-gray-500'
              : 'bg-white border border-gray-300 text-gray-800 !placeholder-gray-400 focus:ring-gray-300'
              }`}
            placeholder="@John, Can you please check this?"
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={loading}
          ></textarea>

          {/* File upload section */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            style={{ display: 'none' }}
          />

          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center border px-3 py-1 rounded-md ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-800'
                    }`}
                >
                  <span className="mr-2 flex items-center gap-1 truncate max-w-[150px]">
                    <IoDocument className="text-base" />
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className={`text-lg leading-none ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-800'
                      }`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div
            className={`flex justify-between items-center text-sm mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
          >
            <div className="flex items-center gap-4">
              <Paperclip
                className={`cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                size={18}
                onClick={() => fileInputRef.current?.click()}
              />
              <div className="relative">
                <Smile
                  className={`cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  size={18}
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                />
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute z-50 bottom-full left-0 mb-2"
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={addEmoji}
                      theme={theme}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className={`text-base font-semibold px-5 py-2 transition-colors ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'
                  }`}
                type="button"
                onClick={() => {
                  setComment("");
                  setUploadedFiles([]);
                  if (onClose) onClose();
                }}
                disabled={loading}
              >
                Discard
              </button>
              <button
                className={`text-base font-semibold px-5 py-2 rounded-md flex items-center gap-1 transition-colors
                  ${loading || !comment.trim()
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : theme === 'dark'
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-purplebg hover:bg-purple-700 text-white"
                  }`}
                onClick={sendComment}
                disabled={loading || !comment.trim()}
                type="button"
              >
                <Send size={14} /> {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}