import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  Reply,
} from "lucide-react";
import { useTheme } from '../ThemeProvider';
import EmailComposerleads from "./EmailComposerleads";
import EmojiPicker from "emoji-picker-react";
import { getAuthToken } from "../../api/apiUrl";
import { showToast } from "../../utils/toast";

const API_BASE_URL = "https://api.erpnext.ai/api/method";
//const AUTH_TOKEN = getAuthToken();
const token = getAuthToken();

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

interface CommentEmailProps {
  lead: {
    name: string;
    [key: string]: any;
  };
  setAttachments: React.Dispatch<React.SetStateAction<string[]>>
  reference_doctype?: string;
  reference_name?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  refreshEmails: () => Promise<void>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  attachments: string[];
  setShowCommentModal: any;
  uploadedFiles: { name: string; url: string }[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<{ name: string; url: string }[]>>;
  setEmailForm: React.Dispatch<React.SetStateAction<{
    recipient: string;
    cc: string;
    bcc: string;
    subject: string;
    message: string;
  }>>;
}

export default function Commentemailleads({
  reference_doctype = "",
  reference_name = "",
  onSuccess,
  onClose,
  lead,
  refreshEmails,
  fileInputRef,
  handleFileChange,
  attachments,
  setUploadedFiles,
  setEmailForm,
  uploadedFiles,
  setAttachments,
  setShowCommentModal
}: CommentEmailProps) {
  const { theme } = useTheme();
  const [showReply, setShowReply] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [attachmentsName, setAttachmentsName] = useState<string[]>([]);

  const hasMessageContent = comment.trim().length > 0;
  
  // Create a new file input ref for this component
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  
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

  const getUserInfo = () => {
    try {
      const session = sessionStorage.getItem('userSession');
      if (session) {
        const user = JSON.parse(session);
        const email = user.email;
        const username = user.username;

        console.log("Email:", email);
        console.log("Username:", username);

        return { email, username };
      }
    } catch (error) {
      console.error("Failed to parse session storage:", error);
    }
    return { email: "", username: "" };
  };

  useEffect(() => {
    const { email, username } = getUserInfo();
    console.log("Current user:", username, email);
  }, []);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const onEmojiClick = (emojiData: any) => {
    setComment(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Updated handleFileChange function with validation
  const handleCommentFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!lead) {
      showToast("No lead selected for attachment", { type: "error" });
      return;
    }

    const validFiles: File[] = [];

    // Validate all files first
    for (const file of Array.from(files)) {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    // If no valid files after validation, return early
    if (validFiles.length === 0) {
      if (commentFileInputRef.current) {
        commentFileInputRef.current.value = "";
      }
      return;
    }

    // Upload only valid files
    const newAttachments: any[] = [];
    const newUploadedFiles: { name: string; url: string }[] = [];

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append("doctype", "CRM Lead");
      formData.append("docname", lead?.name || "");
      formData.append("file", file);
      formData.append("is_private", "0");
      formData.append("folder", "Home/Attachments");

      try {
        const response = await fetch("https://api.erpnext.ai/api/method/upload_file/", {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.message?.name) {
          const fileUrl = `https://api.erpnext.ai${data.message.file_url}`;
          const fileName = data.message.file_name;
          const name = data.message.name;

          newAttachments.push(name);
          newUploadedFiles.push({ name: fileName, url: fileUrl });
          showToast(`File "${fileName}" uploaded successfully.`, { type: 'success' });
        } else {
          showToast(`Failed to upload ${file.name}`, { type: "error" });
        }
      } catch (err) {
        console.error("Upload failed:", err);
        showToast(`Error uploading ${file.name}`, { type: "error" });
      }
    }

    // Update state with new attachments
    setAttachments(prev => [...prev, ...newAttachments]);
    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

    if (commentFileInputRef.current) {
      commentFileInputRef.current.value = "";
    }
  };

  const sendComment = async () => {
    const { email, username } = getUserInfo();
    if (!comment.trim()) {
      showToast("Please type your comment.", { type: "warning" });
      return;
    }

    // Validate all attached files before sending
    if (uploadedFiles.length > 0) {
      showToast(`Validating ${uploadedFiles.length} attachment(s)...`, { type: 'info' });
    }

    setLoading(true);
    try {
      // First create the comment without attachments
      const response = await fetch(`${API_BASE_URL}/frappe.desk.form.utils.add_comment`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_by: username,
          comment_email: email,
          content: comment,
          reference_doctype: "CRM Lead",
          reference_name: lead.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const responseData = await response.json();
      const commentName = responseData.message.name;

      // Only proceed with attachments if there are any
      if (attachments.length > 0) {
        await addAttachmentsToComment(commentName, attachments);
      }

      showToast("Comment added successfully", { type: "success" });
      
      // ✅ Clear ALL form states after successful submission
      setComment("");
      setUploadedFiles([]);
      setAttachments([]);
      
      // ✅ Refresh the comments list
      await refreshEmails();
      
      // ✅ Call onSuccess if provided
      if (onSuccess) onSuccess();
      
      // ✅ CLOSE THE MODAL AUTOMATICALLY
      if (onClose) {
        onClose();
      }
      
      // ✅ Also close via setShowCommentModal if provided
      if (setShowCommentModal) {
        setShowCommentModal(false);
      }
      
    } catch (error: any) {
      console.error("Error adding comment:", error);
      showToast(error.message || "Failed to add comment", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const addAttachmentsToComment = async (commentName: string, attachmentNames: string[]) => {
    try {
      const response = await fetch(
        "https://api.erpnext.ai/api/method/crm.api.comment.add_attachments",
        {
          method: "POST",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: commentName,  // Single string, not array
            attachments: attachmentNames
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.exc_type
          ? `${result.exc_type}: ${result.message}`
          : result.message || "Failed to add attachments";
        throw new Error(errorMsg);
      }

      return result;
    } catch (error) {
      console.error("Error adding attachments:", error);
      throw error;
    }
  };

  const handleDiscard = () => {
    // Clear all input states
    setComment("");
    setUploadedFiles([]);
    setAttachments([]);

    // Close the modal if onClose is provided
    if (onClose) {
      onClose();
    }
    
    // Also close via setShowCommentModal if provided
    if (setShowCommentModal) {
      setShowCommentModal(false);
    }
  };

  // Remove file from attachments
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
        <EmailComposerleads
          deal={undefined}
          onClose={() => setShowReply(false)}
          lead={lead}
          setListSuccess={() => {}}
          refreshEmails={refreshEmails}
        />
      ) : (
        <div>
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3 mb-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center border px-3 py-1 rounded-md ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-800'
                    }`}
                >
                  <span className={`mr-2 flex items-center gap-1 truncate max-w-[150px] ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                    📎 {file.name}
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

          <textarea
            className={`w-full h-40 rounded-md p-3 text-sm focus:outline-none focus:ring-1 placeholder:font-normal ${theme === 'dark'
              ? 'bg-white-31 border-gray-600 text-white focus:ring-gray-500 !placeholder-gray-300'
              : 'bg-white border border-gray-300 text-gray-800 focus:ring-gray-300 !placeholder-gray-500'
              }`}
            value={comment}
            placeholder={isFocused ? "" : `Hi john\n \nCan you please provide more details on this...`}
            onChange={e => setComment(e.target.value)}
            disabled={loading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          ></textarea>
          
          {/* Action Buttons */}
          <div
            className={`flex justify-between items-center text-sm mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
          >
            <div className="flex items-center gap-4 relative">
              <Paperclip
                className={`cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                size={18}
                onClick={() => commentFileInputRef.current?.click()}
              />
              <input
                type="file"
                ref={commentFileInputRef}
                onChange={handleCommentFileChange}
                multiple
                style={{ display: "none" }}
              />
              <Smile
                className={`cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                size={18}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-8 left-8 z-10">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    width={300}
                    height={350}
                    skinTonesDisabled
                    searchDisabled={false}
                    previewConfig={{ showPreview: false }}
                    theme={theme === "dark" ? "dark" : "light"}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                className={`text-base font-semibold px-5 py-2 transition-colors ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'
                  }`}
                type="button"
                onClick={handleDiscard}
                disabled={loading}
              >
                Discard
              </button>
              <button
                className={`text-base font-semibold px-5 py-2 rounded-md flex items-center gap-1 transition-colors
                  ${loading || !hasMessageContent
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : theme === 'dark'
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-purplebg hover:bg-purple-700 text-white"
                  }`}
                onClick={sendComment}
                disabled={loading || !hasMessageContent}
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