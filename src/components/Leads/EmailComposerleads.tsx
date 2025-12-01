import React, { useEffect, useRef, useState } from "react";
import {
    Send,
    Paperclip,
    Smile,
    Mail,
    Sparkles,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";
import Commentemailleads from "./Commentemailleads";
import EmojiPicker from "emoji-picker-react";
import { getUserSession } from "../../utils/session";
import { FaRegComment } from "react-icons/fa6";
import { apiAxios, getAuthToken } from "../../api/apiUrl";
import { showToast } from "../../utils/toast";
import axios from "axios";
import { ConfirmationPopup } from "../LeadsPopup/ConfirmationPopup";
// const showToast = (msg, opts) => alert(msg);

interface EmailComposerProps {
    mode?: "reply" | "reply-all" | "comment";
    onClose: () => void;
    lead: any;
    deal?: any;
    setListSuccess: (value: string) => void;
    refreshEmails: () => Promise<void>;
    onSuccess?: () => void;
    replyData?: {
        recipient: string;
        cc: string;
        bcc: string;
        subject: string;
        message: string;
        isReplyAll?: boolean;
    };
    recipientEmail?: string;
}

interface User {
    value: string;
    description: string;
}

const API_BASE_URL = "https://api.erpnext.ai/api/method/frappe.core.doctype.communication.email.make";
const AUTH_TOKEN = getAuthToken();
const SEARCH_API_URL = "https://api.erpnext.ai/api/method/frappe.desk.search.search_link";

export default function EmailComposerleads({
    mode = "reply",
    setListSuccess,
    lead,
    deal,
    onClose,
    refreshEmails,
    replyData,
    recipientEmail,
}: EmailComposerProps) {
    const { theme } = useTheme();
    const [showComment, setShowComment] = useState(mode === "comment");
    const isCommentMode = mode === "comment";
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
    const [attachments, setAttachments] = useState<string[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [isSubjectEdited, setIsSubjectEdited] = useState(false);
    const shouldShowCc = emailForm.cc !== "" || showCc;
    const shouldShowBCc = emailForm.bcc !== "" || showBCc;
    const hasMessageContent = emailForm.message.trim().length > 0;
    const [generatingContent, setGeneratingContent] = useState(false);
    const [lastGeneratedSubject, setLastGeneratedSubject] = useState<string>("");
    const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const recipientInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const userSession = getUserSession();
    const sessionfullname = userSession?.full_name;
    const senderUsername = userSession?.username || sessionfullname;
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [subjectToGenerate, setSubjectToGenerate] = useState("");

    // const isValidEmail = (email: string) => {
    //     // Simple regex for email validation
    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     return emailRegex.test(email);
    // };
    const isValidEmail = (email: string) => {
        // Allow both plain and display-name email formats
        const emailRegex = /^([^<>]+<)?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(>)?$/;
        return emailRegex.test(email.trim());
    };

    useEffect(() => {
        // Set initial mode based on prop
        setShowComment(mode === "comment");

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
            setIsSubjectEdited(true);
        } else {
            setEmailForm(prev => ({
                ...prev,
                recipient: recipientEmail || '', // ✨ Use the prop here
                subject: isSubjectEdited ? prev.subject : `Re: ${lead.name}`
            }));
        }
    }, [replyData, lead.name, mode, isSubjectEdited]);

    useEffect(() => {
        setListSuccess(ok);
    }, [ok, setListSuccess]);

    //  const htmlMessage = `<div style="white-space: pre-wrap; font-family: sans-serif;">${emailForm.message}</div>`;
    // const htmlMessage = <div className="white-space: pre-wrap; font-family: sans-serif;">`${emailForm.message}`</div>;
    // const htmlMessage = (
    //     <div
    //         style={{ whiteSpace: "pre-wrap", fontFamily: "sans-serif" }}
    //         dangerouslySetInnerHTML={{ __html: emailForm.message }}
    //     />
    // );



    const sendEmail = async () => {
        if (!emailForm.recipient.trim() || !emailForm.message.trim() || !emailForm.subject.trim()) {
            showToast("All required fields must be filled before proceeding.", { type: "error" });
            return;
        }

        // Validate the main recipient's email
        if (emailForm.recipient.trim() && !isValidEmail(emailForm.recipient)) {
            showToast("Invalid email address in 'To' field.", { type: "error" });
            return;
        }

        // Validate the CC emails (if any)
        if (emailForm.cc.trim()) {
            const ccEmails = emailForm.cc.split(',').map(email => email.trim());
            for (const email of ccEmails) {
                if (!isValidEmail(email)) {
                    // showToast(`Invalid email address in 'Cc' field: ${email}`, { type: "error" });
                    showToast(`Invalid email address in 'Cc' field.`, { type: "error" });
                    return;
                }
            }
        }

        // Validate the BCC emails (if any)
        if (emailForm.bcc.trim()) {
            const bccEmails = emailForm.bcc.split(',').map(email => email.trim());
            for (const email of bccEmails) {
                if (!isValidEmail(email)) {
                    // showToast(`Invalid email address in 'Bcc' field: ${email}`, { type: "error" });
                    showToast(`Invalid email address in 'Bcc' field,`, { type: "error" });
                    return;
                }
            }
        }

        // This is your existing code
        if (!emailForm.recipient.trim() || !emailForm.message.trim() || !emailForm.subject.trim()) {
            showToast("Please fill all required fields", { type: "error" });
            return;
        }

        setLoading(true);

        try {
            const htmlMessage = `<div style="white-space: pre-wrap; font-family: sans-serif;">${emailForm.message}</div>`;
            const payload: any = {
                recipients: emailForm.recipient,
                cc: emailForm.cc,
                bcc: emailForm.bcc,
                subject: emailForm.subject,
                content: htmlMessage,
                send_email: 1,
                now: 1,
                sender_full_name: senderUsername,
                name: lead.name,
                doctype: "CRM Lead"
            };

            if (attachments.length > 0) {
                payload.attachments = JSON.stringify(attachments);
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
                console.log("Email sent successfully");
                setEmailForm({ recipient: "", cc: "", bcc: "", subject: "", message: "" });
                setUploadedFiles([]);
                setAttachments([]);
                await refreshEmails();
                onClose();
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
                const response = await fetch("https://api.erpnext.ai/api/method/upload_file/", {
                    method: "POST",
                    headers: {
                        Authorization: AUTH_TOKEN,
                    },
                    body: formData,
                });

                const data = await response.json();

                if (response.ok && data.message?.name) {
                    const fileUrl = `https://api.erpnext.ai${data.message.file_url}`;
                    const fileName = data.message.file_name;
                    const name = data.message.name;

                    newAttachments.push(name);
                    setUploadedFiles(prev => [...prev, { name: fileName, url: fileUrl }]);
                } else {
                    showToast(`Failed to upload ${file.name}`, { type: "error" });
                }
            } catch (err) {
                console.error("Upload failed:", err);
                showToast(`Error uploading ${file.name}`, { type: "error" });
            }
        }

        setAttachments(prev => [...prev, ...newAttachments]);

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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

    const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const subject = e.target.value;
        setEmailForm(prev => ({
            ...prev,
            subject,
            // 👇 if subject is cleared, also clear the message
            message: subject.trim() === "" ? "" : prev.message,
        }));

        if (subject.trim() !== "") {
            setIsSubjectEdited(true);
        }
    };

    const generateEmailFromSubject = async (subject: string) => {
        if (!subject.trim()) return;

        if (subject === lastGeneratedSubject && !isSubjectEdited) return;

        try {
            setGeneratingContent(true);
            const response = await apiAxios.post(
                "/api/method/customcrm.email.email_generator.generate_email",
                { subject },
                {
                    headers: {
                        Authorization: AUTH_TOKEN,
                        "Content-Type": "application/json",
                    },
                }
            );

            const generatedMessage = response.data?.message;
            if (generatedMessage) {
                setEmailForm(prev => ({ ...prev, message: generatedMessage }));
                setLastGeneratedSubject(subject);
            }
        } catch (error) {
            console.error("Error generating email:", error);
            showToast("Failed to generate email content", { type: "error" });
        } finally {
            setGeneratingContent(false);
        }
    };

    const handleConfirmGenerate = async () => {
        await generateEmailFromSubject(subjectToGenerate);
        setShowConfirmationPopup(false);
        setIsSubjectEdited(true); // ✨ ADD THIS LINE
    };

    // Add this new function to handle the button click
    const handleGenerateButtonClick = () => {
        // Only show the popup if there is a subject to generate from
        if (emailForm.subject.trim()) {
            setSubjectToGenerate(emailForm.subject);
            setShowConfirmationPopup(true);
        }
    };

    const handleCommentSubmit = async (commentData: any) => {
        await refreshEmails();
        onClose();
    };

    const fetchUserSuggestions = async (searchText: string) => {
        if (!searchText.trim()) {
            setUserSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setSearchLoading(true);
        try {
            const session = getUserSession();
            const sessionCompany = session?.company;
            const payload = { txt: searchText, doctype: "User", filters: sessionCompany ? { company: sessionCompany } : null };
            const response = await axios.post(SEARCH_API_URL, payload, {
                headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
            });

            if (response.data && response.data.message) {
                const suggestions = response.data.message.map((user: any) => ({
                    value: user.value,
                    description: user.description || user.value
                }));
                setUserSuggestions(suggestions);
                setShowSuggestions(suggestions.length > 0);
            }
        } catch (error) {
            console.error("Error fetching user suggestions:", error);
            setUserSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmailForm(f => ({ ...f, recipient: value }));
        if (value.trim()) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (user: User) => {
        setEmailForm(f => ({ ...f, recipient: user.value }));
        setShowSuggestions(false);
    };

    const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUserSuggestions(emailForm.recipient);
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId);
    }, [emailForm.recipient]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
            // Close suggestions when clicking outside
            if (
                suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
                recipientInputRef.current && !recipientInputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            className={`max-full mx-auto w-[96%] rounded-md shadow-sm p-4 space-y-4 mb-5 border ${theme === "dark"
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
                    className={`flex items-center gap-1 pb-2 transition-colors ${!showComment
                        ? theme === "dark"
                            ? "px-2 py-2 rounded-xl bg-slate-500 text-white"
                            : "text-gray-800 border-b-2 border-gray-800"
                        : theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                    type="button"
                    onClick={() => setShowComment(false)}
                >
                    <Mail
                        size={20}
                        className={
                            !showComment
                                ? theme === "dark"
                                    ? "text-white"
                                    : "text-gray-800"
                                : theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                        }
                    />
                    Reply
                </button>
                <button
                    className={`flex items-center gap-1 pb-2 max-sm:pb-0 transition-colors ${showComment
                        ? theme === "dark"
                            ? "px-2 py-2 rounded-xl bg-slate-500 text-white"
                            : "text-gray-800 border-b-2 border-gray-800"
                        : theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                    type="button"
                    onClick={() => setShowComment(true)}
                >
                    <FaRegComment
                        size={20}
                        className={
                            showComment
                                ? theme === "dark"
                                    ? "text-white"
                                    : "text-gray-800"
                                : theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                        }
                    />
                    Comment
                </button>

                {/* Conditionally render Cc/Bcc buttons only in Reply mode */}
                {!showComment && (
                    <div className="flex gap-5 justify-end ml-auto mr-10">
                        <button
                            className={`text-xl font-medium ${showCc ? (theme === "dark" ? "text-white" : "text-gray-800") : ""}`}
                            onClick={() => setShowCc(!showCc)}
                        >
                            Cc
                        </button>
                        <button
                            className={`text-xl font-medium ${showBCc ? (theme === "dark" ? "text-white" : "text-gray-800") : ""}`}
                            onClick={() => setShowBCc(!showBCc)}
                        >
                            Bcc
                        </button>
                    </div>
                )}
            </div>

            {showComment ? (
                <Commentemailleads
                    lead={lead}
                    refreshEmails={refreshEmails}
                    handleFileChange={handleFileChange}
                    fileInputRef={fileInputRef}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                    setEmailForm={setEmailForm}
                    onClose={onClose}
                    onSubmitSuccess={handleCommentSubmit}
                />
            ) : (
                <div>
                    {/* Email Form */}
                    <div className="space-y-5 text-sm">
                        <div
                            className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}
                        >
                            <span className={`w-12 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>To:</span>
                            <div className="relative flex-1">
                                <input
                                    ref={recipientInputRef}
                                    type="email"
                                    value={emailForm.recipient}
                                    onChange={handleRecipientChange}
                                    onKeyDown={handleRecipientKeyDown}
                                    className={`px-2 py-1 rounded font-medium outline-none w-full placeholder:font-normal ${theme === "dark"
                                            ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                                            : "bg-gray-50 !text-gray-800 placeholder:!text-gray-500 border border-gray-300 focus:border-gray-500"
                                        }`}
                                    placeholder="Enter recipient email address"
                                />
                                {showSuggestions && (
                                    <div ref={suggestionsRef} className={`absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-y-auto rounded-md shadow-lg ${theme === "dark"
                                            ? "bg-gray-800 border border-gray-700"
                                            : "bg-white border border-gray-300"
                                        }`}>
                                        {searchLoading ? (
                                            <div className={`px-3 py-2 text-sm font-normal ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                                                }`}>Loading...</div>
                                        ) : userSuggestions.length > 0 ? (
                                            userSuggestions.map((user, index) => (
                                                <div
                                                    key={index}
                                                    className={`px-3 py-2 cursor-pointer hover:bg-opacity-50 text-sm border-b font-normal ${theme === "dark"
                                                            ? "hover:bg-gray-700 border-gray-700 text-white"
                                                            : "hover:bg-gray-100 border-gray-200 text-gray-800"
                                                        }`}
                                                    onClick={() => handleSuggestionClick(user)}
                                                >
                                                    <div className="font-medium">{user.value}</div>
                                                    {user.description && (
                                                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                                                            }`}>{user.description}</div>
                                                    )}
                                                </div>
                                            ))
                                        ) : emailForm.recipient.trim() && (
                                            <div className={`px-3 py-2 text-sm font-normal ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                                                }`}>No users found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {shouldShowCc && (
                            <div
                                className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}
                            >
                                <span className={`w-12 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Cc:</span>
                                <input
                                    type="email"
                                    value={emailForm.cc}
                                    onChange={e => setEmailForm(f => ({ ...f, cc: e.target.value }))}
                                    className={`px-2 py-1 rounded font-medium outline-none flex-1 placeholder:font-normal ${theme === "dark"
                                            ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                                            : "bg-gray-50 !text-gray-800 placeholder:!text-gray-500 border border-gray-300 focus:border-gray-500"
                                        }`}
                                    placeholder="Enter CC email addresses"
                                />
                            </div>
                        )}

                        {shouldShowBCc && (
                            <div
                                className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}
                            >
                                <span className={`w-12 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Bcc:</span>
                                <input
                                    type="email"
                                    value={emailForm.bcc}
                                    onChange={e => setEmailForm(f => ({ ...f, bcc: e.target.value }))}
                                    className={`px-2 py-1 rounded font-medium outline-none flex-1 placeholder:font-normal ${theme === "dark"
                                            ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                                            : "bg-gray-50 !text-gray-800 placeholder:!text-gray-500 border border-gray-300 focus:border-gray-500"
                                        }`}
                                    placeholder="Enter BCC email addresses"
                                />
                            </div>
                        )}

                        <div
                            className={`flex items-center gap-2 border-b pb-1 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}
                        >
                            <span className={`w-12 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Subject:</span>
                            <input
                                type="text"
                                value={emailForm.subject}
                                onChange={handleSubjectChange}
                                className={`px-2 py-1 rounded font-medium outline-none flex-1 placeholder:font-normal ${theme === "dark"
                                        ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                                        : "bg-gray-50 !text-gray-800 placeholder:!text-gray-500 border border-gray-300 focus:border-gray-500"
                                    }`}
                                placeholder="Enter email subject"
                            />
                            {!replyData && (
                                <button
                                    type="button"
                                    onClick={handleGenerateButtonClick}
                                    disabled={!emailForm.subject.trim()}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${theme === 'dark'
                                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Sparkles size={16} />
                                    <span className="hidden sm:inline">Generate</span>
                                </button>
                            )}
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
                                        <span className={`mr-2 flex items-center gap-1 truncate max-w-[200px] ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                                            📎 {file.name}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
                                                setAttachments((prev) => prev.filter((_, i) => i !== index));
                                            }}
                                             className={`text-lg leading-none ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <textarea
                            className={`w-full h-40 mt-3 rounded-md p-3 text-sm focus:outline-none focus:ring-1 ${theme === "dark"
                                ? "bg-white-31 border-gray-600 text-white focus:ring-gray-500 !placeholder-gray-200"
                                : "bg-white border border-gray-300 text-gray-800 focus:ring-gray-300 !placeholder-gray-500"
                                }`}
                            placeholder={isFocused ? "" : "@John,can you please check this?"}
                            value={generatingContent ? "Loading content..." : emailForm.message}
                            disabled={generatingContent}
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
                                className={`text-base font-semibold px-5 py-2 transition-colors ${theme === "dark"
                                    ? "text-red-400 hover:text-red-300"
                                    : "text-red-500 hover:text-red-600"
                                    }`}
                                onClick={() => {
                                    setEmailForm({ recipient: "", cc: "", bcc: "", subject: "", message: "" });
                                    onClose();
                                }}
                                type="button"
                            >
                                Discard
                            </button>
                            <button
                                className={`text-base font-semibold px-5 py-2 rounded-md flex items-center gap-1 transition-colors ${theme === "dark"
                                    ? "bg-purple-600 hover:bg-purple-500 text-white"
                                    : "bg-purplebg hover:bg-purple-700 text-white"
                                    } ${!hasMessageContent ? "opacity-50 cursor-not-allowed" : ""}`}
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
            <ConfirmationPopup
                show={showConfirmationPopup}
                onConfirm={handleConfirmGenerate}
                onCancel={() => {
                    setShowConfirmationPopup(false);
                    setIsSubjectEdited(true); // ✨ ADD THIS LINE
                }}
                title="Generate Email Content?"
                message="Do you want to automatically generate an email body based on the subject?"
                isLoading={generatingContent}
            />
        </div>
    );
}