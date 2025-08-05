import React, { useEffect, useRef, useState } from "react";
import {
    Send,
    Paperclip,
    Smile,
    MessageSquare,
    Reply,
    CornerUpRight,
    Mail,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";
import Commentemailleads from "./Commentemailleads";
import EmojiPicker from "emoji-picker-react";
import { getUserSession } from "../../utils/session";

const showToast = (msg, opts) => alert(msg);

interface EmailComposerProps {
    onClose: () => void;
    lead: any;
    deal?: any;
    setListSuccess: (value: string) => void;
    refreshEmails: () => Promise<void>;
    replyData?: {
        recipient: string;
        cc: string;
        bcc: string;
        subject: string;
        message: string;
        isReplyAll?: boolean;
    };
    
}

const API_BASE_URL = "http://103.214.132.20:8002/api/method/frappe.core.doctype.communication.email.make";
const AUTH_TOKEN = "token 1b670b800ace83b:f82627cb56de7f6";

export default function EmailComposerleads({
    setListSuccess,
    lead,
    deal,
    onClose,
    refreshEmails,
    replyData,
   
}: EmailComposerProps) {
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
    const [showCc, setShowCc] = useState(false);
    const [showBCc, setShowBCc] = useState(false);
    const [ok, setok] = useState<string>('');
    //const [attachement, setAttachement] = useState<string[]>([])
    const [attachments, setAttachments] = useState<string[]>([]); // Array of attachment IDs
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [isSubjectEdited, setIsSubjectEdited] = useState(false);
    const shouldShowCc = emailForm.cc !== "" || showCc;
    const shouldShowBCc = emailForm.bcc !== "" || showBCc;
const hasMessageContent = emailForm.message.trim().length > 0;
    useEffect(() => {
        if (replyData) {
            setEmailForm({
                recipient: replyData.recipient || "",
                cc: replyData.cc || "",
                bcc: replyData.bcc || "", // Ensure BCC is set
                subject: replyData.subject || "",
                message: replyData.message || "",
            });
            // Auto-show fields if they have values
            if (replyData.cc) setShowCc(true);
            if (replyData.bcc) setShowBCc(true);
        }
    }, [replyData]);


    useEffect(() => {
        setListSuccess(ok);
    }, [ok]);



    const userSession = getUserSession();
    const senderUsername = userSession?.username || "Administrator";

    const sendEmail = async () => {
        if (!emailForm.recipient.trim() || !emailForm.message.trim() || !emailForm.subject.trim()) {
            showToast("Please fill all required fields", { type: "error" });
            return;
        }

        setLoading(true);
        try {

            const payload: any = {  // Use 'any' type or define a proper interface for the payload
                recipients: emailForm.recipient,
                cc: emailForm.cc,
                bcc: emailForm.bcc,
                subject: emailForm.subject,
                content: emailForm.message,
                send_email: 1,
                now: 1,
                sender_full_name: senderUsername,
                name: lead.name,
                doctype: "CRM Lead"
            };

            // Only add attachments if attachement has a value
            if (attachments.length>0) {attachments
                payload.attachments = attachments;
            }

            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    Authorization: AUTH_TOKEN,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setok("Email sent successfully");
                console.log("Email sent successfully", { type: "success" });
                setEmailForm({ recipient: "", cc: "", bcc: "", subject: "", message: "" });
                setUploadedFiles([]);
                setAttachments([]);
                //setAttachements([]); // Clear the attachment
                await refreshEmails();
                onClose(); // Close the composer after successful send
            } else {
                const errorData = await response.json();
                console.error("Failed to send email:", errorData);
                showToast(`Failed to send email: ${errorData?.message || response.statusText}`, { type: "error" });
            }
        } catch (error) {
            console.error("Error sending email:", error);
            showToast("Failed to send email", { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.target.files?.[0];
    //     if (!file) return;

    //     const formData = new FormData();
    //     formData.append("doctype", "CRM Lead");
    //     formData.append("docname", lead.name);
    //     formData.append("file", file);
    //     formData.append("is_private", "0");
    //     formData.append("folder", "Home/Attachments");

    //     try {
    //         const response = await fetch("http://103.214.132.20:8002/api/method/upload_file/", {
    //             method: "POST",
    //             headers: {
    //                 Authorization: AUTH_TOKEN,
    //             },
    //             body: formData,
    //         });

    //         const data = await response.json();

    //         if (response.ok && data.message?.file_url) {
    //            // showToast("File uploaded successfully", { type: "success" });

    //             const fileUrl = `http://103.214.132.20:8002${data.message.file_url}`;
    //             const fileName = data.message.file_name;
    //             const name = data.message.name;
    //             setAttachement(name)

    //             setUploadedFiles((prev) => [...prev, { name: fileName, url: fileUrl }]);

    //             // const previewHTML = fileName.match(/\.(jpg|jpeg|png|gif)$/i)
    //             //   ? `<br/><strong>📎 ${fileName}</strong><br/><img src="${fileUrl}" alt="${fileName}" style="max-width: 100%; height: auto;" />`
    //             //   : `<br/><strong>📎 ${fileName}</strong><br/><a href="${fileUrl}" target="_blank">${fileName}</a>`;

    //             // setEmailForm((prev) => ({
    //             //   ...prev,
    //             //   message: prev.message + previewHTML,
    //             // }));
    //         } else {
    //             showToast("Failed to upload file", { type: "error" });
    //             console.error("Upload error:", data);
    //         }
    //     } catch (err) {
    //         console.error("Upload failed:", err);
    //         showToast("Error uploading file", { type: "error" });
    //     }
    // };

// const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//   const files = event.target.files;
//   if (!files || files.length === 0) return;
//  const newAttachments = [];
//   for (const file of Array.from(files)) {
//     const formData = new FormData();
//     formData.append("doctype", "CRM Lead");
//     formData.append("docname", lead.name);
//     formData.append("file", file);
//     formData.append("is_private", "0");
//     formData.append("folder", "Home/Attachments");

//     try {
//       const response = await fetch("http://103.214.132.20:8002/api/method/upload_file/", {
//         method: "POST",
//         headers: {
//           Authorization: AUTH_TOKEN,
//         },
//         body: formData,
//       });

//       const data = await response.json();

//       if (response.ok && data.message?.file_url) {
//         const fileUrl = `http://103.214.132.20:8002${data.message.file_url}`;
//         const fileName = data.message.file_name;
//         const name = data.message.name;

//         setAttachement(name);
//         setUploadedFiles((prev) => [...prev, { name: fileName, url: fileUrl }]);
//       } else {
//         showToast(`Failed to upload ${file.name}`, { type: "error" });
//         console.error("Upload error:", data);
//       }
//     } catch (err) {
//       console.error("Upload failed:", err);
//       showToast(`Error uploading ${file.name}`, { type: "error" });
//     }
//   }
// };


const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const newAttachments: any[] = [];
  
  for (const file of Array.from(files)) {
    const formData = new FormData();
    formData.append("doctype", "CRM Lead");
    formData.append("docname", lead.name);
    formData.append("file", file);
    formData.append("is_private", "0");
    formData.append("folder", "Home/Attachments");

    try {
      const response = await fetch("http://103.214.132.20:8002/api/method/upload_file/", {
        method: "POST",
        headers: {
          Authorization: AUTH_TOKEN,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.message?.name) {
        const fileUrl = `http://103.214.132.20:8002${data.message.file_url}`;
        const fileName = data.message.file_name;
        const name = data.message.name;

        newAttachments.push(name); // Add to new attachments
        setUploadedFiles(prev => [...prev, { name: fileName, url: fileUrl }]);
      } else {
        showToast(`Failed to upload ${file.name}`, { type: "error" });
      }
    } catch (err) {
      console.error("Upload failed:", err);
      showToast(`Error uploading ${file.name}`, { type: "error" });
    }
  }

  // Add all new attachments to state
  setAttachments(prev => [...prev, ...newAttachments]);
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

    const onEmojiClick = (emojiData: any) => {
        setEmailForm(f => ({ ...f, message: f.message + emojiData.emoji }));
        setShowEmojiPicker(false);
    };


        useEffect(() => {
        if (replyData) {
            setEmailForm({
                recipient: replyData.recipient || "",
                cc: replyData.cc || "",
                bcc: replyData.bcc || "",
                subject: replyData.subject || "",
                message: replyData.message || "",
            });
            if (replyData.cc) setShowCc(true);
            if (replyData.bcc) setShowBCc(true);
            // If it's a reply, mark subject as edited to preserve the reply subject
            setIsSubjectEdited(true);
        } else {
            // For new emails, set the default subject with lead name
            setEmailForm(prev => ({
                ...prev,
                subject: isSubjectEdited ? prev.subject : `test (#${lead.name})`
            }));
        }
    }, [replyData, lead.name]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmailForm(f => ({ ...f, subject: e.target.value }));
        // Mark as edited when user changes the subject
        if (!isSubjectEdited) {
            setIsSubjectEdited(true);
        }
    };
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
                    className={`flex items-center gap-1  pb-2  ${!showComment
                        ? theme === "dark"
                            ? "px-2 py-2 rounded-xl bg-slate-500 text-black"
                            : "border-gray-800"
                        : "border-transparent"
                        }`}
                    type="button"
                    onClick={() => setShowComment(false)}
                >
                    <Mail size={20} className={`${showComment ? "text-gray-600" : "text-white"}`} />
                    Reply
                </button>
                <button
                    className={`flex items-center gap-1  ${showComment
                        ? theme === "dark"
                            ? "px-2 py-2 rounded-xl bg-slate-500 text-black"
                            : "text-gray-800 border-b-2 border-gray-800 pb-1"
                        : theme === "dark"
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                    type="button"
                    onClick={() => setShowComment(true)}
                >
                    <MessageSquare size={20} className={`${showComment ? "text-white" : "text-gray-600"}`} /> Comment
                </button>
                <div className="flex gap-5 justify-end ml-auto mr-10">
                    <button
                        className={`text-xl font-medium ${showCc ? (theme === "dark" ? "text-white" : "text-gray-800") : ""
                            }`}
                        onClick={() => setShowCc(!showCc)}
                    >
                        Cc
                    </button>
                    <button
                        className={`text-xl font-medium ${showBCc ? (theme === "dark" ? "text-white" : "text-gray-800") : ""
                            }`}
                        onClick={() => setShowBCc(!showBCc)}
                    >
                        Bcc
                    </button>
                </div>
            </div>

            {showComment ? (
                <Commentemailleads lead={lead} refreshEmails={refreshEmails} handleFileChange={handleFileChange}
                fileInputRef={fileInputRef} attachments={attachments}

                setAttachments={setAttachments}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                setEmailForm={setEmailForm}
                onClose={onClose} setShowCommentModal={undefined}   
                  />
            ) : (
                <div>
                    {/* Email Form */}
                    <div className="space-y-5 text-sm">
                        <div
                            className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-white" : "border-gray-300"
                                }`}
                        >
                            <span className={`w-12 ${theme === "dark" ? "text-white" : "text-gray-500"}`}>To:</span>
                            <input
                                type="email"
                                value={emailForm.recipient }
                                onChange={e => setEmailForm(f => ({ ...f, recipient: e.target.value }))}
                                className={`px-2 py-1 rounded font-medium outline-none flex-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                                    }`}
                                placeholder="Recipient email"
                            />
                        </div>

                        {shouldShowCc && (
                            <div
                                className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-white" : "border-gray-300"
                                    }`}
                            >
                                <span className={`w-12 ${theme === "dark" ? "text-white" : "text-gray-500"}`}>Cc:</span>
                                <input
                                    type="email"
                                    value={emailForm.cc}
                                    onChange={e => setEmailForm(f => ({ ...f, cc: e.target.value }))}
                                    className={`px-2 py-1 rounded font-medium outline-none flex-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                                        }`}
                                    placeholder="CC email"
                                />
                            </div>
                        )}

                        {shouldShowBCc && (
                            <div
                                className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-white" : "border-gray-300"
                                    }`}
                            >
                                <span className={`w-12 ${theme === "dark" ? "text-white" : "text-gray-500"}`}>Bcc:</span>
                                <input
                                    type="email"
                                    value={emailForm.bcc}
                                    onChange={e => setEmailForm(f => ({ ...f, bcc: e.target.value }))}
                                    className={`px-2 py-1 rounded font-medium outline-none flex-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
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
                                value={emailForm.subject }
                                 onChange={handleSubjectChange}
                               // onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
                                className={`px-2 py-1 rounded font-medium outline-none flex-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                                    }`}
                                placeholder="Subject"
                            />
                        </div>
                    </div>

                    <div>
                        {uploadedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-3">
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
                                                setEmailForm((prev) => ({
                                                    ...prev,
                                                    message: prev.message.replace(file.url, ""),
                                                }));
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
                            className={`w-full h-40 mt-3 rounded-md p-3 text-sm focus:outline-none focus:ring-1 ${theme === "dark"
                                ? "bg-white-31 border-gray-600 text-white focus:ring-gray-500"
                                : "bg-white border border-gray-300 text-gray-800 focus:ring-gray-300"
                                }`}
                            placeholder={isFocused?"":"@John,can you please check this?"}
                            value={emailForm.message}
                             onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                            onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))}
                        ></textarea>
                    </div>

                    <div
                        className={`flex justify-between items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                            }`}
                    >
                        <div className="flex items-center gap-4 relative">
                            <>
                                <Paperclip
                                    className="cursor-pointer"
                                    size={18}
                                    onClick={() => fileInputRef.current?.click()}
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

                        <div className="flex items-center gap-3">
                            <button
                                className="text-red-500 text-base font-semibold px-5 py-2"
                                onClick={() => {
                                    setEmailForm({ recipient: "", cc: "", bcc: "", subject: "", message: "" });
                                    onClose();
                                }}
                                type="button"
                            >
                                Discard
                            </button>
                            {/* <button
                                className="bg-purplebg text-base font-semibold text-white px-5 py-2 rounded-md flex items-center gap-1 hover:bg-purple-700"
                                onClick={sendEmail}
                                disabled={loading}
                                type="button"
                            >
                                <Send size={14} /> {loading ? "Sending..." : "Send"}
                            </button> */}
                             <button
                                className={`bg-purplebg text-base font-semibold text-white px-5 py-2 rounded-md flex items-center gap-1 hover:bg-purple-700 ${
                                    !hasMessageContent ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                onClick={sendEmail}
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