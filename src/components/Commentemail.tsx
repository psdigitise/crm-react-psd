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

interface CommentEmailProps {
  fetchComments: () => void;
  reference_name: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

// Dummy showToast for demo. Replace with your own toast/snackbar.
const showToast = (msg, opts) => alert(msg);

const AUTH_TOKEN = "token 1b670b800ace83b:9f48cd1310e112b";
const UPLOAD_API_URL = "http://103.214.132.20:8002/api/method/upload_file";

export default function Commentemail({
  fetchComments,
  reference_name,
  onSuccess,
  onClose,
}: CommentEmailProps) {
  // ...rest of your code
  const { theme } = useTheme();
  const [showReply, setShowReply] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const userSession = getUserSession();
  const CommentedBy = userSession?.username || "Administrator";
  const email = userSession?.email || "Administrator";
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: File[]): Promise<string[]> {
    const uploadedFileIds: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("doctype", "CRM Deal");
      formData.append("docname", reference_name); // Use reference_name from props
      formData.append("type", "image");
      formData.append("file", file);
      formData.append("is_private", "0");
      formData.append("folder", "Home/Attachments");

      try {
        const response = await axios.post(UPLOAD_API_URL, formData, {
          headers: {
            Authorization: AUTH_TOKEN,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const sendComment = async () => {
    if (!comment.trim()) {
      showToast("Please type your comment.", { type: "warning" });
      return;
    }
    setLoading(true);
    try {
      let attachmentIds: string[] = [];

      // Step 1: Upload attachments if any
      if (uploadedFiles.length > 0) {
        attachmentIds = await uploadFiles(uploadedFiles);
      }

      // Step 2: Add the comment
      const commentResponse = await fetch(`http://103.214.132.20:8002/api/method/frappe.desk.form.utils.add_comment`, {
        method: "POST",
        headers: {
          Authorization: AUTH_TOKEN,
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

          await fetch(`http://103.214.132.20:8002/api/method/crm.api.comment.add_attachments`, {
            method: "POST",
            headers: {
              Authorization: AUTH_TOKEN,
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
      } else {
        throw new Error("Failed to add comment");
      }
    } catch (error) {
      console.error("Failed to add comment", error);
      console.log("Failed to add comment", { type: "error" });
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
          // deal={deal}
          onClose={() => setShowReply(false)} // <-- add this
        />
      ) : (
        <div>
          <textarea
            className={`w-full h-40 rounded-md p-3 text-sm focus:outline-none focus:ring-1 ${theme === 'dark'
              ? 'bg-white-31 border-gray-600 text-white focus:ring-gray-500'
              : 'bg-white border border-gray-300 text-gray-800 focus:ring-gray-300'
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
            //onChange={handleFileChange}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Check if file with same name already exists
                const isDuplicate = uploadedFiles.some(
                  existingFile => existingFile.name === file.name
                );

                if (!isDuplicate) {
                  setUploadedFiles((prev) => [...prev, file]);
                } else {
                  console.log("This file has already been attached", { type: "warning" });
                }

                // Clear the input to allow selecting the same file again if needed
                e.target.value = "";
              }
            }}
            multiple
            style={{ display: 'none' }}
          />
          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center border text-white px-3 py-1 rounded bg-white-31"
                >
                  <span className="mr-2 flex items-center gap-1 truncate max-w-[200px]">
                    {/* You can use a document icon here */}
                    <IoDocument className="text-base" />
                    {file.name}
                  </span>
                  <button
                    onClick={() =>
                      setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-white text-lg leading-none"
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
                className="cursor-pointer"
                size={18}
              onClick={() => fileInputRef.current?.click()}
              />
              <div className="relative">
                <Smile
                  className="cursor-pointer"
                  size={18}
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                />
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute z-50 bottom-full left-0 mt-2"
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
                className="text-red-500 text-base font-semibold px-5 py-2"
                type="button"
                onClick={() => {
                  setComment("");
                  if (onClose) onClose(); // <-- close the modal
                }}
                disabled={loading}
              >
                Discard
              </button>
              <button
                className={`text-base font-semibold px-5 py-2 rounded-md flex items-center gap-1 
    ${loading || !comment.trim()
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-purplebg text-white hover:bg-purple-700"
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