import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  Reply,
} from "lucide-react";
import { useTheme } from './ThemeProvider';
import Emailpageleads from "./Emailpageleads";
import { getUserSession } from "../utils/session";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface CommentEmailProps {
  fetchComments: () => void;
  reference_name: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

// Dummy showToast for demo. Replace with your own toast/snackbar.
const showToast = (msg, opts) => alert(msg);

const API_BASE_URL = "http://103.214.132.20:8002/api/v2/document";
const AUTH_TOKEN = "token 1b670b800ace83b:f82627cb56de7f6";

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

  const sendComment = async () => {
    if (!comment.trim()) {
      showToast("Please type your comment.", { type: "warning" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://103.214.132.20:8002/api/method/frappe.desk.form.utils.add_comment`, {
        method: "POST",
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // subject: comment,
          // comment_type: "Comment",
          // reference_doctype,
          // reference_name,
          comment_by: CommentedBy,
          comment_email: email,
          content: comment,
          reference_doctype: "CRM Deal",
          reference_name: reference_name
        }),
      });

      if (response.ok) {
        //showToast("Comment added!", { type: "success" });
        setComment("");
        if (onSuccess) onSuccess();
        fetchComments();
        // ✅ Close popup after success
        if (onClose) onClose(); // or simply onClose?.()
      } else {
        throw new Error("Failed to add comment");
      }
    } catch (error) {
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
        {/* <button
          className={`flex items-center gap-1 pb-1 ${showReply
            ? theme === 'dark'
              ? 'border-b-2 border-white'
              : 'border-b-2 border-gray-800'
            : ''
            }`}
          type="button"
          onClick={() => setShowReply(true)}
        >
          <Reply size={14} /> Reply
        </button> */}
        {/* <button
          className={`flex items-center gap-1 ${!showReply
            ? theme === 'dark'
              ? 'border-b-2 border-white'
              : 'border-b-2 border-gray-800'
            : ''
            }`}
          type="button"
          onClick={() => setShowReply(false)}
        >
          <MessageSquare size={14} /> Comment
        </button> */}
      </div>

      {showReply ? (
        // <Emailpageleads
        // // You can pass props like deal, reference_doctype, reference_name if needed
        // />
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
            placeholder="Type your message..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={loading}
          ></textarea>
          {/* Action Buttons */}
          <div
            className={`flex justify-between items-center text-sm mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
          >
            <div className="flex items-center gap-4">
              <Paperclip className="cursor-pointer" size={18} />
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
              {/* <button
                className="text-red-500 text-base font-semibold px-5 py-2"
                type="button"
                onClick={() => setComment("")}
                disabled={loading}
              >
                Discard
              </button> */}
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
                className="bg-purplebg text-base font-semibold text-white px-5 py-2 rounded-md flex items-center gap-1 hover:bg-purple-700"
                onClick={sendComment}
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