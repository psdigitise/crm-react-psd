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
const AUTH_TOKEN = "token 1b670b800ace83b:889d6aca3f96abd";

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
    setAttachments:React.Dispatch<React.SetStateAction<string[]>>
  reference_doctype?: string;
  reference_name?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  
    refreshEmails: () => Promise<void>;
      handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
       fileInputRef?: React.RefObject<HTMLInputElement>;
        attachments: string[];
        setShowCommentModal:any;
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
  onClose, // <-- add this
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
  
}:CommentEmailProps) {
  // ...rest of your code
  console.log('1bf',lead.name);
  
  const { theme } = useTheme();
  const [showReply, setShowReply] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [attachmentsName,setAttachmentsName]=useState<string[]>([])
  
const hasMessageContent = comment.trim().length > 0;
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




// const addAttachmentsToComment = async (commentName: string[], attachmentNames: string[]) => {
//   // Validate inputs
//   if (!commentName || attachmentNames.length === 0) {
//     showToast("Comment name and at least one attachment are required", { type: "error" });
//     return;
//   }

//   try {
//     const response = await fetch(
//       "http://103.214.132.20:8002/api/method/crm.api.comment.add_attachments", 
//       {
//         method: "POST",
//         headers: {
//           "Authorization": AUTH_TOKEN,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: commentName,  // Should be a single string, not an array
//           attachments: attachmentNames  // Array of attachment IDs
//         }),
//       }
//     );

//     const result = await response.json();

//     if (!response.ok) {
//       // Handle Frappe-specific error format
//       const errorMsg = result.exc_type 
//         ? `${result.exc_type}: ${result.message}`
//         : result.message || "Failed to add attachments";
//       throw new Error(errorMsg);
//     }

//     showToast(result.message || "Attachments added successfully", { type: "success" });
//     return result;
//   } catch (error) {
//     console.error("Error adding attachments:", error);
//     showToast(error.message || "Error adding attachments", { type: "error" });
//     throw error;
//   }
// };

// Usage example - should be triggered by an event, not in useEffect
// const handleAddAttachments = async () => {
//   try {
//     await addAttachmentsToComment(attachmentsName,attachments);
//   } catch (error) {
//     // Error already handled in the function
//   }
// };

//   const sendComment = async () => {
//      const { email, username } = getUserInfo();
//     if (!comment.trim()) {
//       showToast("Please type your comment.", { type: "warning" });
//       return;
//     }
//     setLoading(true);
//     try {
//     //  const response = await fetch(`${API_BASE_URL}/Comment`, {

//       const response = await fetch(`${API_BASE_URL}/frappe.desk.form.utils.add_comment`, {
//         method: "POST",
//         headers: {
//           Authorization: AUTH_TOKEN,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//          comment_by:username,
//          comment_email:email,
//          content:comment,
//          reference_doctype:"CRM Lead",
//          reference_name:lead.name,
//          //attachments:attachments
//           // comment_type: "Comment",
//           // reference_doctype,
//           // reference_name,
//         }),
//       });
// console.log("12k",response)
//       if (response.ok) {
//           const responseData = await response.json();
//             console.log("Full response:", responseData.message.name);
//             setAttachmentsName(responseData.message.name)
//           //  handleAddAttachments()
//           await addAttachmentsToComment(attachmentsName,attachments);
//         console.log("Comment added!", { type: "success" });
//         // setComment("");
//         // setAttachement([]);
//           setUploadedFiles([]);  // Clears the displayed attachments
//       setAttachments([]);    // Clears the attachment IDs
//       setComment("");   
//         await refreshEmails();
//         if (onSuccess) onSuccess();
//       } else {
//         throw new Error("Failed to add comment");
//       }
//     } catch (error) {
//       showToast("Failed to add comment", { type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

    const onEmojiClick = (emojiData: any) => {
    setComment(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const sendComment = async () => {
  const { email, username } = getUserInfo();
  if (!comment.trim()) {
    console.log("Please type your comment.", { type: "warning" });
    return;
  }
  
  setLoading(true);
  try {
    // First create the comment without attachments
    const response = await fetch(`${API_BASE_URL}/frappe.desk.form.utils.add_comment`, {
      method: "POST",
      headers: {
        Authorization: AUTH_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment_by: username,
        comment_email: email,
        content: comment,
        reference_doctype: "CRM Lead",
        reference_name: lead.name,
        // Remove attachments from here as this endpoint doesn't expect them
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

    console.log("Comment added successfully", { type: "success" });
    setUploadedFiles([]);
    setAttachments([]);
    setComment("");
    
    await refreshEmails();
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error adding comment:", error);
    console.log(error.message || "Failed to add comment", { type: "error" });
  } finally {
    setLoading(false);
  }
};

const addAttachmentsToComment = async (commentName: string, attachmentNames: string[]) => {
  try {
    const response = await fetch(
      "http://103.214.132.20:8002/api/method/crm.api.comment.add_attachments", 
      {
        method: "POST",
        headers: {
          "Authorization": AUTH_TOKEN,
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
};

// const handleDiscard = () => {
//   // Clear all input states
//   setComment("");
//   setUploadedFiles([]);
//   setAttachments([]);
//    setShowCommentModal(false);
//   // Close the modal if onClose is provided
//   if (onClose) {
//     onClose();
//   }
// };
// const addAttachmentsToComment = async (commentName: string[], attachmentNames: string[]) => {
//   try {
//     const response = await fetch("http://103.214.132.20:8002/api/method/crm.api.comment.add_attachments", {
//       method: "POST",
//       headers: {
//         "Authorization": AUTH_TOKEN,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name: commentName,
//         attachments: attachmentNames
//       }),
//     });

//     const result = await response.json();

//     if (response.ok) {
//       showToast(result.message || "Attachments added successfully", { type: "success" });
//       return result.message;
//     } else {
//       showToast(result.message || "Failed to add attachments", { type: "error" });
//       throw new Error(result.message || "Failed to add attachments");
//     }
//   } catch (error) {
//     console.error("Error adding attachments:", error);
//     showToast("Error adding attachments", { type: "error" });
//     throw error;
//   }
// };

// useEffect(()=>{
// addAttachmentsToComment(attachments,attachmentsName)
// },[attachments,attachmentsName])




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
             {uploadedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-3 mb-2">
                                {uploadedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center border text-white px-3 py-1 rounded bg-white-31"
                                    >
                                        <span className="mr-2 flex items-center gap-1 truncate max-w-[200px]">
                                            📎 {file.name}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
                                                // setEmailForm((prev) => ({
                                                //     ...prev,
                                                //     message: prev.message.replace(file.url, ""),
                                                // }));
                                            }}
                                            className="text-white text-lg leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

          <textarea
            className={`w-full h-40 rounded-md p-3 text-sm focus:outline-none focus:ring-1 ${theme === 'dark'
              ? 'bg-white-31 border-gray-600 text-white focus:ring-gray-500'
              : 'bg-white border border-gray-300 text-gray-800 focus:ring-gray-300'
              }`}
            
            value={comment}
            placeholder={isFocused?"":`Hi john\n \nCan you please provide more details on this...`}
            onChange={e => setComment(e.target.value)}
            disabled={loading}
             onFocus={() => setIsFocused(true)}
             onBlur={()=>setIsFocused(false)}
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
              {/* <Paperclip className="cursor-pointer" size={18} /> */}
               <>
                                              <Paperclip
                                                  className="cursor-pointer"
                                                  size={18}
                                                  onClick={() => fileInputRef?.current?.click()}
                                              />
                                              <input
                                                  type="file"
                                                  ref={fileInputRef}
                                                  onChange={handleFileChange}

                                                  multiple
                                                  style={{ display: "none" }}
                                              />
                                          </>
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
                // onClick={() => {
                //   setComment("");
                //   if (onClose) onClose(); // <-- close the modal
                // }}
                onClick={handleDiscard}
                disabled={loading}
              >
                Discard
              </button>
              <button
               // className="bg-purplebg text-base font-semibold text-white px-5 py-2 rounded-md flex items-center gap-1 hover:bg-purple-700"
                className={`bg-purplebg text-base font-semibold text-white px-5 py-2 rounded-md flex items-center gap-1 hover:bg-purple-700 ${
                                    !hasMessageContent ? "opacity-50 cursor-not-allowed" : ""
                                }`}
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