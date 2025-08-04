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

// Dummy showToast for demo. Replace with your own toast/snackbar.
const showToast = (msg, opts) => alert(msg);

// const API_BASE_URL = "http://103.214.132.20:8002/api/v2/document";
const API_BASE_URL = "http://103.214.132.20:8002/api/method";
const AUTH_TOKEN = "token 1b670b800ace83b:f82627cb56de7f6";

// export default function CommentCreate({
//   reference_doctype = "",
//   reference_name = "",
//   onSuccess,
//   onClose,
// }) {

interface CommentEmailProps {
  lead: {
    name: string;
    [key: string]: any;
  };
  reference_doctype?: string;
  reference_name?: string;
  onSuccess?: () => void;
  onClose?: () => void;
    refreshEmails: () => Promise<void>;
}
export default function Commentemailleads({
  
  reference_doctype = "",
  reference_name = "",
  onSuccess,
  onClose, // <-- add this
  lead,
  refreshEmails
}:CommentEmailProps) {
  // ...rest of your code
  console.log('1bf',lead.name);
  
  const { theme } = useTheme();
  const [showReply, setShowReply] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

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

  const sendComment = async () => {
     const { email, username } = getUserInfo();
    if (!comment.trim()) {
      showToast("Please type your comment.", { type: "warning" });
      return;
    }
    setLoading(true);
    try {
    //  const response = await fetch(`${API_BASE_URL}/Comment`, {

      const response = await fetch(`${API_BASE_URL}/frappe.desk.form.utils.add_comment`, {
        method: "POST",
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
         comment_by:username,
         comment_email:email,
         content:comment,
         reference_doctype:"CRM Lead",
         reference_name:lead.name
          // comment_type: "Comment",
          // reference_doctype,
          // reference_name,
        }),
      });

      if (response.ok) {
        console.log("Comment added!", { type: "success" });
        setComment("");
        await refreshEmails();
        if (onSuccess) onSuccess();
      } else {
        throw new Error("Failed to add comment");
      }
    } catch (error) {
      showToast("Failed to add comment", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

    const onEmojiClick = (emojiData: any) => {
    setComment(prev => prev + emojiData.emoj);
    setShowEmojiPicker(false);
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
        <EmailComposerleads
          // deal={deal}
          onClose={() => setShowReply(false)} // <-- add this
          deal={undefined}        />
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
              {/* <Paperclip className="cursor-pointer" size={18} />
              <Smile className="cursor-pointer" size={18} /> */}
                
            <div className="flex items-center gap-4 relative">
              <Paperclip className="cursor-pointer" size={18} />
              <Smile 
                className="cursor-pointer" 
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