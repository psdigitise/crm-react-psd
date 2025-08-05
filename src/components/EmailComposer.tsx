import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  Reply,
  Mail,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Commentemail from "./Commentemail";
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { HiOutlineDocument } from "react-icons/hi";
import { IoDocument } from "react-icons/io5";
import { getUserSession } from "../utils/session"; // Update with correct path
import axios from "axios";


interface EmailComposerProps {
  mode: string;
  onClose: () => void;
  dealName: string; // Add this prop
  fetchEmails: () => void; // <- Add this line
  selectedEmail?: any; // Add this line
  clearSelectedEmail?: () => void; // Add this line
  fetchComments:() => void;

}

// Dummy showToast for demo. Replace with your own.
const showToast = (msg, opts) => alert(msg);

const API_BASE_URL = "http://103.214.132.20:8002/api/method/frappe.core.doctype.communication.email.make";
const AUTH_TOKEN = "token 1b670b800ace83b:f82627cb56de7f6"; // Replace with your actual token

export default function EmailOrCommentComposer({ deal, onClose, mode, dealName, fetchEmails, selectedEmail, clearSelectedEmail,fetchComments }: EmailComposerProps) {
  const { theme } = useTheme();

  const [showComment, setShowComment] = useState(false);
  const [emailForm, setEmailForm] = useState({
    recipient: "",
    cc: "",
    bcc: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const userSession = getUserSession();
  const senderUsername = userSession?.username || "Administrator";
  const [quotedMessage, setQuotedMessage] = useState("");
  const addEmoji = (emoji: { native: string; }) => {
    setEmailForm((prev) => ({
      ...prev,
      message: prev.message + emoji.native,
    }))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
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

  const UPLOAD_API_URL = "http://103.214.132.20:8002/api/method/upload_file";

  async function uploadFiles(files: File[]): Promise<string[]> {
    const uploadedFileIds: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("doctype", "CRM Deal");
      formData.append("docname", dealName); // required to attach to a specific document
      formData.append("type", "image");
      formData.append("file", file);
      formData.append("is_private", "0"); // or "0" if public
      formData.append("folder", "Home/Attachments");

      try {
        const response = await axios.post(UPLOAD_API_URL, formData, {
          headers: {
            Authorization: AUTH_TOKEN,
            "Content-Type": "multipart/form-data",
          },
        });

        const fileId = response.data?.message?.name; // or file_url
        if (fileId) uploadedFileIds.push(fileId);
      } catch (error) {
        console.error("File upload error:", error);
        throw new Error("File upload failed");
      }
    }

    return uploadedFileIds;
  }

  const sendEmail = async () => {
    if (!emailForm.recipient.trim() || !emailForm.message.trim() || !emailForm.subject.trim()) {
      showToast("Please fill all required fields", { type: "error" });
      return;
    }

    setLoading(true);

    try {
      let attachmentIds: string[] = [];

      // Step 1: Upload attachments
      if (uploadedFiles.length > 0) {
        attachmentIds = await uploadFiles(uploadedFiles);
      }
      // Combine the new message with the quoted message if it exists
      const fullMessage = quotedMessage
        ? `${emailForm.message}\n\n---\n\n${quotedMessage}`
        : emailForm.message;

      // Step 2: Construct and send email
      const payload = {
        recipients: emailForm.recipient,
        cc: emailForm.cc,
        bcc: emailForm.bcc,
        subject: emailForm.subject,
        content: fullMessage,
        send_email: 1,
        name: dealName,
        now: 1,
        doctype: "CRM Deal",
        sender_full_name: senderUsername,
        attachments: attachmentIds, // pass uploaded file IDs
      };

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setEmailForm({ recipient: "", cc: "", bcc: "", subject: "", message: "" });
        setUploadedFiles([]);
        fetchEmails();
        onClose?.();
        if (clearSelectedEmail) clearSelectedEmail();
      } else {
        const errorData = await response.json();
        showToast(`Failed to send email: ${errorData?.message || response.statusText}`, { type: "error" });
      }
    } catch (error) {
      console.error("Send email error:", error);
      showToast("Failed to send email", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowComment(mode === "comment");
  }, [mode]);


  useEffect(() => {
    if (selectedEmail && (mode === "reply" || mode === "reply-all")) {
      const quoted = selectedEmail.content || "";

      setEmailForm({
        recipient: selectedEmail.from || "",
        cc: mode === "reply-all" ? selectedEmail.cc || "" : "",
        bcc: mode === "reply-all" ? selectedEmail.bcc || "" : "",
        subject: selectedEmail.subject?.startsWith("Re:") ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
        message: "", // Leave main input empty
      });

      setQuotedMessage(quoted);
      setShowCC(mode === "reply-all" && !!selectedEmail.cc);
      setShowBCC(mode === "reply-all" && !!selectedEmail.bcc);
    }
  }, [mode, selectedEmail]);

  useEffect(() => {
    if (mode === "new") {
      setEmailForm({
        recipient: "",
        cc: "",
        bcc: "",
        subject: "",
        message: "",
      });
      setUploadedFiles([]);
      setQuotedMessage("");
      setShowCC(false);
      setShowBCC(false);
      setShowComment(false); // switch to "Reply" tab
    }
  }, [mode]);


  return (
    <div
      className={`max-full mx-auto rounded-md shadow-sm p-4 space-y-4 mb-5 border ${theme === "dark"
        ? "bg-transparent text-white border-transparent"
        : "bg-white text-gray-800 border-gray-500"
        }`}
    >
      {/* Top Action Tabs */}
      <div
        className={`flex gap-4 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
      >
        <button
          className={`flex items-center gap-1 border-b-2 pb-1 ${!showComment
            ? theme === "dark"
              ? "border-white"
              : "border-gray-800"
            : "border-transparent"
            }`}
          type="button"
          onClick={() => setShowComment(false)}
        >
          <Mail size={14} /> Reply
        </button>
        <button
          className={`flex items-center gap-1 ${showComment
            ? theme === "dark"
              ? "text-white border-b-2 border-white pb-1"
              : "text-gray-800 border-b-2 border-gray-800 pb-1"
            : theme === "dark"
              ? "text-white"
              : "text-gray-400"
            }`}
          type="button"
          onClick={() => setShowComment(true)}
        >
          <MessageSquare size={14} /> Comment
        </button>
      </div>
      {/* Show only one: Email or Comment */}
      {showComment ? (
        <Commentemail
          // reference_doctype="CRM Deal"
          fetchComments={fetchComments}
          reference_name={dealName} // <-- pass it heres
          onClose={() => onClose(false)}
        />
      ) : (
        <div>
          {/* Email Form */}
          <div className="space-y-5 text-sm">
            <div
              className={`flex items-start justify-between border-b pb-2 ${theme === "dark" ? "border-white" : "border-gray-300"
                }`}
            >
              <span className={`w-12 ${theme === "dark" ? "text-white" : "text-gray-500"}`}>To:</span>
              <input
                type="email"
                value={emailForm.recipient}
                onChange={e => setEmailForm(f => ({ ...f, recipient: e.target.value }))}
                className={`px-2 py-1 rounded font-medium outline-none flex-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                placeholder="Recipient email"
              />
              <div className="flex gap-2 ml-2 mt-1">
                <span
                  className={`cursor-pointer select-none ${theme === "dark" ? "text-gray-300" : "text-gray-500"
                    } hover:underline`}
                  onClick={() => setShowCC((v) => !v)}
                >
                  CC
                </span>
                <span
                  className={`cursor-pointer select-none ${theme === "dark" ? "text-gray-300" : "text-gray-500"
                    } hover:underline`}
                  onClick={() => setShowBCC((v) => !v)}
                >
                  BCC
                </span>
              </div>
            </div>
            {/* CC Field - only shown when showCC is true */}
            {showCC && (
              <div
                className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-white" : "border-gray-300"
                  }`}
              >
                <span className={`w-12 ${theme === "dark" ? "text-white" : "text-gray-500"
                  }`}>CC:</span>
                <input
                  type="email"
                  value={emailForm.cc}
                  onChange={(e) =>
                    setEmailForm((f) => ({ ...f, cc: e.target.value }))
                  }
                  className={`px-2 py-1 rounded font-medium outline-none flex-1 ${theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                    }`}
                  placeholder="CC email"
                />
              </div>
            )}

            {/* BCC Field - only shown when showBCC is true */}
            {showBCC && (
              <div
                className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-white" : "border-gray-300"
                  }`}
              >
                <span className={`w-12 ${theme === "dark" ? "text-white" : "text-gray-500"
                  }`}>BCC:</span>
                <input
                  type="email"
                  value={emailForm.bcc}
                  onChange={(e) =>
                    setEmailForm((f) => ({ ...f, bcc: e.target.value }))
                  }
                  className={`px-2 py-1 rounded font-medium outline-none flex-1 ${theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                    }`}
                  placeholder="BCC email"
                />
              </div>
            )}

            <div
              className={`flex items-center gap-2 border-b pb-1 ${theme === "dark" ? "border-white" : "border-gray-300"
                }`}
            >
              <span className={`w-12 ${theme === "dark" ? "text-white" : "text-gray-500"}`}>Subject:</span>
              <input
                type="text"
                value={emailForm.subject}
                onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
                className={`flex-1 bg-transparent outline-none ${theme === "dark" ? "text-white" : "text-gray-600"}`}
                placeholder="Subject"
              />
            </div>
          </div>
          <div>
            <textarea
              className={`w-full h-40 rounded-md p-3 text-sm focus:outline-none focus:ring-1 ${theme === "dark"
                ? "bg-white-31 border-gray-600 text-white focus:ring-gray-500"
                : "bg-white border border-gray-300 text-gray-800 focus:ring-gray-300"
                }`}
              placeholder="Type your message..."
              value={emailForm.message}
              onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))}
            />

            {quotedMessage && (
              <div
                className={`mt-4 border-l-4 pl-4 italic font-semibold text-sm ${theme === "dark" ? "border-gray-500 text-gray-300" : "border-gray-600 text-gray-700"
                  }`}
              >
                “{quotedMessage}”
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center border text-white px-3 py-1 rounded bg-white-31"
                  >
                    <span className="mr-2 flex items-center gap-1 truncate max-w-[200px]">
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
          </div>

          <div
            className={`flex justify-between items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
          >
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <Paperclip size={18} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFiles((prev) => [...prev, file]);
                      console.log("Selected file:", file);
                    }
                  }}

                />
              </label>
              <div className="relative">
                <Smile
                  className="cursor-pointer"
                  size={18}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                />

                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute z-50 bottom-full left-0 mt-2"
                  >
                    <Picker data={data} onEmojiSelect={addEmoji} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="text-red-500 text-base font-semibold px-5 py-2"
                onClick={() => {
                  setEmailForm({ recipient: "", cc: "", bcc: "", subject: "", message: "" });
                  if (onClose) onClose();
                  if (clearSelectedEmail) clearSelectedEmail(); // Clear selected email
                }}
                type="button"
              >
                Discard
              </button>
              <button
                className="bg-purplebg text-base font-semibold text-white px-5 py-2 rounded-md flex items-center gap-1 hover:bg-purple-700"
                onClick={sendEmail}
                disabled={loading}
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

