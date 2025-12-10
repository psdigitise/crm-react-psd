import React, { useEffect, useRef, useState } from "react";
import {
    Send,
    Paperclip,
    Smile,
    Mail,
    Sparkles,
    Sparkle,
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

interface AIResponse {
    message: {
        subject: string;
        body: string;
    };
}




const API_BASE_URL = "https://api.erpnext.ai/api/method/frappe.core.doctype.communication.email.make";
const AUTH_TOKEN = getAuthToken();
const SEARCH_API_URL = "https://api.erpnext.ai/api/method/frappe.desk.search.search_link";
const AI_GENERATE_API = "https://api.erpnext.ai/api/method/customcrm.email.email_generator.generate_email";

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
    const [emailForm, setEmailForm] = useState({
        recipient: "",
        recipientInput: "",
        cc: "",
        ccInput: "",
        bcc: "",
        bccInput: "",
        subject: "",
        message: "",
        aiPrompt: "",
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
    const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const recipientInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const userSession = getUserSession();
    const sessionfullname = userSession?.full_name;
    const senderUsername = userSession?.username || sessionfullname;





    const isValidEmail = (email: string) => {
        const emailRegex = /^([^<>]+<)?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(>)?$/;
        return emailRegex.test(email.trim());
    };

    const stripHtmlTags = (html: string): string => {
        if (!html) return "";
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    useEffect(() => {
        setShowComment(mode === "comment");

        if (replyData) {
            const plainTextMessage = stripHtmlTags(replyData.message || "");

            setEmailForm(prev => ({
                ...prev,
                recipient: replyData.recipient || "",
                cc: replyData.cc || "",
                bcc: replyData.bcc || "",
                subject: replyData.subject || "",
                message: plainTextMessage,
                recipientInput: "",
                ccInput: "",
                bccInput: "",
                aiPrompt: "",
            }));

            if (replyData.cc) setShowCc(true);
            if (replyData.bcc) setShowBCc(true);
            setIsSubjectEdited(true);
        } else {
            const leadName = lead?.name || "";
            const initialSubject = isSubjectEdited ? "" : `Re: ${leadName}`;

            setEmailForm(prev => ({
                ...prev,
                recipient: recipientEmail || '',
                recipientInput: "",
                subject: initialSubject,
                message: "",
                aiPrompt: "",
            }));
        }
    }, [replyData, mode, recipientEmail, lead]);

    useEffect(() => {
        setListSuccess(ok);
    }, [ok, setListSuccess]);

    const sendEmail = async () => {
        if (!lead) {
            showToast("No lead selected", { type: "error" });
            return;
        }

        const recipientEmails = emailForm.recipient
            .split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0);

        if (recipientEmails.length === 0 || !emailForm.message.trim() || !emailForm.subject.trim()) {
            showToast("All required fields must be filled before proceeding.", { type: "error" });
            return;
        }

        for (const email of recipientEmails) {
            if (!isValidEmail(email)) {
                showToast(`Invalid email address in 'To' field: ${email}`, { type: "error" });
                return;
            }
        }

        if (emailForm.cc.trim()) {
            const ccEmails = emailForm.cc.split(',').map(email => email.trim());
            for (const email of ccEmails) {
                if (!isValidEmail(email)) {
                    showToast(`Invalid email address in 'Cc' field: ${email}`, { type: "error" });
                    return;
                }
            }
        }

        if (emailForm.bcc.trim()) {
            const bccEmails = emailForm.bcc.split(',').map(email => email.trim());
            for (const email of bccEmails) {
                if (!isValidEmail(email)) {
                    showToast(`Invalid email address in 'Bcc' field: ${email}`, { type: "error" });
                    return;
                }
            }
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
                name: lead?.name || "",
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
                setEmailForm({
                    recipient: "",
                    recipientInput: "",
                    cc: "",
                    ccInput: "",
                    bcc: "",
                    bccInput: "",
                    subject: "",
                    message: "",
                    aiPrompt: "",
                });
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

        if (!lead) {
            showToast("No lead selected for attachment", { type: "error" });
            return;
        }

        const newAttachments: any[] = [];

        for (const file of Array.from(files)) {
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
            message: subject.trim() === "" ? "" : prev.message,
        }));

        if (subject.trim() !== "") {
            setIsSubjectEdited(true);
        }
    };

    // const generateEmailFromPrompt = async () => {
    //     if (!emailForm.aiPrompt.trim()) {
    //         showToast("Please enter a prompt for AI generation", { type: "error" });
    //         return;
    //     }

    //     try {
    //         setGeneratingContent(true);
    //         const response = await apiAxios.post(
    //             AI_GENERATE_API,
    //             { purpose: emailForm.aiPrompt.trim() },
    //             {
    //                 headers: {
    //                     Authorization: AUTH_TOKEN,
    //                     "Content-Type": "application/json",
    //                 },
    //             }
    //         );

    //         const data = response.data;
    //         console.log("AI Response:", data);

    //         // Debug: Check the exact structure
    //         console.log("Full response structure:", JSON.stringify(data, null, 2));

    //         let generatedSubject = "";
    //         let generatedBody = "";

    //         // Check multiple possible response structures
    //         if (data.message && typeof data.message === 'object') {
    //             // Check for nested message structure
    //             if (data.message.message && typeof data.message.message === 'object') {
    //                 // Nested: data.message.message.subject and data.message.message.body
    //                 generatedSubject = data.message.message.subject || "";
    //                 generatedBody = data.message.message.body || "";
    //             } else if (data.message.subject && data.message.body) {
    //                 // Direct: data.message.subject and data.message.body
    //                 generatedSubject = data.message.subject;
    //                 generatedBody = data.message.body;
    //             } else if (data.message.generated_content) {
    //                 // Alternative: generated_content field
    //                 generatedBody = data.message.generated_content;
    //                 generatedSubject = emailForm.subject || `Re: ${lead?.name || ""}`;
    //             }
    //         } else if (data.message && typeof data.message === 'string') {
    //             // String response
    //             generatedBody = data.message;
    //             generatedSubject = emailForm.subject || `Re: ${lead?.name || ""}`;
    //         } else if (data.generated_content) {
    //             // Top-level generated_content
    //             generatedBody = data.generated_content;
    //             generatedSubject = emailForm.subject || `Re: ${lead?.name || ""}`;
    //         }

    //         console.log("Extracted subject:", generatedSubject);
    //         console.log("Extracted body:", generatedBody);

    //         if (generatedBody) {
    //             // Update both subject and body fields
    //             setEmailForm(prev => ({
    //                 ...prev,
    //                 subject: generatedSubject || prev.subject || `Re: ${lead?.name || ""}`,
    //                 message: generatedBody,
    //             }));
    //             setIsSubjectEdited(true);
    //             showToast("Email content generated successfully!", { type: "success" });

    //             // Clear the AI prompt after successful generation
    //             setEmailForm(prev => ({ ...prev, aiPrompt: "" }));
    //         } else {
    //             console.error("Could not extract content from response. Full response:", data);
    //             showToast("Failed to generate email content. Please try again.", { type: "error" });
    //         }
    //     } catch (error: any) {
    //         console.error("Error generating email:", error);
    //         console.error("Error response:", error.response?.data);
    //         showToast(`Failed to generate email content: ${error.message}`, { type: "error" });
    //     } finally {
    //         setGeneratingContent(false);
    //     }
    // };



    const generateEmailFromPrompt = async () => {
        if (!emailForm.aiPrompt.trim()) {
            showToast("Please enter a prompt for AI generation", { type: "error" });
            return;
        }

        try {
            setGeneratingContent(true);

            // Build modify prompt if needed
            const formattedPrompt = `
Modify this email:
Subject: ${emailForm.subject || "No subject"}
Message: ${emailForm.message || "No message"}

Instruction: ${emailForm.aiPrompt.trim()}
        `.trim();

            const response = await apiAxios.post(
                AI_GENERATE_API,
                { purpose: formattedPrompt },
                {
                    headers: {
                        Authorization: AUTH_TOKEN,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data;

            // ---- NORMALIZE ALL STRUCTURES ----
            let subject = "";
            let body = "";

            // Case 1: customcrm returns message.message.subject/body
            if (data?.message?.message?.subject || data?.message?.message?.body) {
                subject = data.message.message.subject || "";
                body = data.message.message.body || "";
            }

            // Case 2: message.subject/body
            else if (data?.message?.subject || data?.message?.body) {
                subject = data.message.subject || "";
                body = data.message.body || "";
            }

            // Case 3: generated_content only
            else if (data?.message?.generated_content) {
                body = data.message.generated_content;
                subject = emailForm.subject;
            }

            // Case 4: fallback string
            else if (typeof data?.message === "string") {
                body = data.message;
                subject = emailForm.subject;
            }

            // ---- FINAL FALLBACK ----
            if (!body) {
                showToast("AI did not return valid content. Try again.", { type: "error" });
                setGeneratingContent(false);
                return;
            }

            // ---- UPDATE STATE ----
            setEmailForm(prev => ({
                ...prev,
                subject: subject || prev.subject,
                message: body,
                aiPrompt: "",   // reset prompt
            }));

            setIsSubjectEdited(true);
            showToast("Email content generated successfully!", { type: "success" });
        } catch (error) {
            console.error("AI Error:", error);
            showToast("Failed to generate email content", { type: "error" });
        } finally {
            console.log("Setting generatingContent to false");
            setGeneratingContent(false);
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
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [emailForm.recipient]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
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

    if (!lead) {
        return (
            <div className={`p-4 rounded-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
                <div className="text-center py-8">
                    <div className="text-red-500 mb-2">No lead selected</div>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

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
                    className={`flex items-center gap-1  transition-colors ${!showComment
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
                    className={`flex items-center gap-1  max-sm:pb-0 transition-colors ${showComment
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
                        {/* To Field */}
                        <div
                            className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}
                        >
                            <span className={`w-12 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>To:</span>
                            <div className="relative flex-1">
                                <div
                                    className={`flex flex-wrap gap-1 px-2 py-1 rounded min-h-[36px] ${theme === "dark"
                                        ? "bg-gray-700 border border-gray-600 focus-within:border-gray-400"
                                        : "bg-gray-50 border border-gray-300 focus-within:border-gray-500"
                                        }`}
                                    onClick={() => recipientInputRef.current?.focus()}
                                >
                                    {emailForm.recipient
                                        .split(',')
                                        .map(email => email.trim())
                                        .filter(email => email.length > 0)
                                        .map((email, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${theme === "dark"
                                                    ? "bg-gray-600 text-white"
                                                    : "bg-gray-200 text-gray-800"
                                                    }`}
                                            >
                                                <span>{email}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const emails = emailForm.recipient
                                                            .split(',')
                                                            .map(e => e.trim())
                                                            .filter(e => e !== email);
                                                        setEmailForm(f => ({ ...f, recipient: emails.join(', ') }));
                                                    }}
                                                    className={`text-xs ml-1 ${theme === "dark" ? "hover:text-gray-300" : "hover:text-gray-600"}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}

                                    <input
                                        ref={recipientInputRef}
                                        type="text"
                                        value={emailForm.recipientInput || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setEmailForm(f => ({ ...f, recipientInput: value }));
                                            if (value.trim()) {
                                                setShowSuggestions(true);
                                                const timeoutId = setTimeout(() => {
                                                    fetchUserSuggestions(value);
                                                }, 300);
                                                return () => clearTimeout(timeoutId);
                                            } else {
                                                setShowSuggestions(false);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && emailForm.recipientInput.trim()) {
                                                e.preventDefault();
                                                const newEmail = emailForm.recipientInput.trim();
                                                if (isValidEmail(newEmail)) {
                                                    const currentEmails = emailForm.recipient
                                                        .split(',')
                                                        .map(email => email.trim())
                                                        .filter(email => email.length > 0);

                                                    if (!currentEmails.includes(newEmail)) {
                                                        const updatedEmails = [...currentEmails, newEmail].join(', ');
                                                        setEmailForm(f => ({
                                                            ...f,
                                                            recipient: updatedEmails,
                                                            recipientInput: ''
                                                        }));
                                                    } else {
                                                        showToast("Email already added", { type: "info" });
                                                    }
                                                    setEmailForm(f => ({ ...f, recipientInput: '' }));
                                                } else {
                                                    showToast("Please enter a valid email address", { type: "error" });
                                                }
                                                setShowSuggestions(false);
                                            } else if (e.key === 'Backspace' && !emailForm.recipientInput && emailForm.recipient) {
                                                const emails = emailForm.recipient
                                                    .split(',')
                                                    .map(email => email.trim())
                                                    .filter(email => email.length > 0);

                                                if (emails.length > 0) {
                                                    emails.pop();
                                                    setEmailForm(f => ({
                                                        ...f,
                                                        recipient: emails.join(', ')
                                                    }));
                                                }
                                            } else if (e.key === 'Escape') {
                                                setShowSuggestions(false);
                                            } else if (e.key === ',') {
                                                e.preventDefault();
                                                const newEmail = emailForm.recipientInput.replace(',', '').trim();
                                                if (newEmail && isValidEmail(newEmail)) {
                                                    const currentEmails = emailForm.recipient
                                                        .split(',')
                                                        .map(email => email.trim())
                                                        .filter(email => email.length > 0);

                                                    if (!currentEmails.includes(newEmail)) {
                                                        const updatedEmails = [...currentEmails, newEmail].join(', ');
                                                        setEmailForm(f => ({
                                                            ...f,
                                                            recipient: updatedEmails,
                                                            recipientInput: ''
                                                        }));
                                                    }
                                                    setShowSuggestions(false);
                                                }
                                            }
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                if (emailForm.recipientInput.trim() && isValidEmail(emailForm.recipientInput.trim())) {
                                                    const currentEmails = emailForm.recipient
                                                        .split(',')
                                                        .map(email => email.trim())
                                                        .filter(email => email.length > 0);

                                                    const newEmail = emailForm.recipientInput.trim();
                                                    if (!currentEmails.includes(newEmail)) {
                                                        const updatedEmails = [...currentEmails, newEmail].join(', ');
                                                        setEmailForm(f => ({
                                                            ...f,
                                                            recipient: updatedEmails,
                                                            recipientInput: ''
                                                        }));
                                                    }
                                                }
                                                setShowSuggestions(false);
                                            }, 200);
                                        }}
                                        className={`px-2 py-1 rounded font-medium outline-none flex-1 placeholder:font-normal ${theme === "dark"
                                            ? "bg-gray-700 text-white placeholder:text-gray-400 "
                                            : "bg-gray-50 !text-gray-800 placeholder:!text-gray-500 "
                                            }`}
                                        placeholder={emailForm.recipient.split(',').filter(e => e.trim()).length > 0 ? "" : "Enter recipient email addresses"}
                                    />
                                </div>

                                {showSuggestions && (
                                    <div
                                        ref={suggestionsRef}
                                        className={`absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-y-auto rounded-md shadow-lg ${theme === "dark"
                                            ? "bg-gray-800 border border-gray-700"
                                            : "bg-white border border-gray-300"
                                            }`}
                                    >
                                        {searchLoading ? (
                                            <div className={`px-3 py-2 text-sm font-normal ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                                Loading...
                                            </div>
                                        ) : userSuggestions.length > 0 ? (
                                            userSuggestions.map((user, index) => (
                                                <div
                                                    key={index}
                                                    className={`px-3 py-2 cursor-pointer hover:bg-opacity-50 text-sm border-b font-normal ${theme === "dark"
                                                        ? "hover:bg-gray-700 border-gray-700 text-white"
                                                        : "hover:bg-gray-100 border-gray-200 text-gray-800"
                                                        }`}
                                                    onClick={() => {
                                                        const currentEmails = emailForm.recipient
                                                            .split(',')
                                                            .map(email => email.trim())
                                                            .filter(email => email.length > 0);

                                                        if (!currentEmails.includes(user.value)) {
                                                            const updatedEmails = [...currentEmails, user.value].join(', ');
                                                            setEmailForm(f => ({
                                                                ...f,
                                                                recipient: updatedEmails,
                                                                recipientInput: ''
                                                            }));
                                                        } else {
                                                            showToast("Email already added", { type: "info" });
                                                        }
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <div className="font-medium">{user.value}</div>
                                                    {user.description && (
                                                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                                            {user.description}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : emailForm.recipientInput.trim() && (
                                            <div className={`px-3 py-2 text-sm font-normal ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                                No users found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>



                        {/* Cc Field */}
                        {shouldShowCc && (
                            <div
                                className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}
                            >
                                <span className={`w-12 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Cc:</span>
                                <input
                                    type="text"
                                    value={emailForm.cc}
                                    onChange={(e) => setEmailForm(f => ({ ...f, cc: e.target.value }))}
                                    className={`px-2 py-1 rounded font-medium outline-none flex-1 placeholder:font-normal ${theme === "dark"
                                        ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                                        : "bg-gray-50 !text-gray-800 placeholder:!text-gray-500 border border-gray-300 focus:border-gray-500"
                                        }`}
                                    placeholder="Enter CC email addresses"
                                />
                            </div>
                        )}

                        {/* Bcc Field */}
                        {shouldShowBCc && (
                            <div
                                className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}
                            >
                                <span className={`w-12 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Bcc:</span>
                                <input
                                    type="text"
                                    value={emailForm.bcc}
                                    onChange={(e) => setEmailForm(f => ({ ...f, bcc: e.target.value }))}
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
                        </div>


                    </div>

                    {/* File attachments */}
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

                        {/* Message Textarea */}
                        <textarea
                            className={`w-full h-40 mt-3 rounded-md p-3 text-sm focus:outline-none focus:ring-1 ${theme === "dark"
                                ? "bg-white-31 border-gray-600 text-white focus:ring-gray-500 !placeholder-gray-200"
                                : "bg-white border border-gray-300 text-gray-800 focus:ring-gray-300 !placeholder-gray-500"
                                }`}
                            placeholder={isFocused ? "" : "Compose Your Email..."}
                            value={generatingContent ? "Generating email content..." : emailForm.message}
                            disabled={generatingContent}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))}
                        ></textarea>
                    </div>

                    {/* --- AI Assist (New Clean UI Like Screenshot) --- */}
                    <div
                        className={`mt-4 mb-2 w-full border rounded-lg px-4 py-3 flex items-center gap-3 
    ${theme === "dark" ? "bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30] border-gray-700" : "bg-gray-50 border-gray-300"}`}
                    >
                        <div className="flex flex-col w-full">

                            <span
                                className={`text-sm flex gap-2 font-semibold mb-2 
        ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
                            >
                                <Sparkle size={16} />
                                AI Assist
                            </span>
                            <p className={`text-xs flex gap-2 font-normal mb-2 
        ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>Describe the email you want to write and let AI do the rest</p>

                            <div className="flex items-center w-full gap-3">
                                <textarea

                                    value={emailForm.aiPrompt}
                                    onChange={(e) => setEmailForm(f => ({ ...f, aiPrompt: e.target.value }))}

                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            generateEmailFromPrompt();
                                        }
                                    }}

                                    placeholder="e.g., 'Follow up about our last meeting'"
                                    className={`flex-1 px-3 py-2 rounded-md text-sm outline-none
          ${theme === "dark"
                                            ? "bg-[#2a2a2a] text-white !placeholder-gray-400 border border-gray-700 focus:border-gray-500"
                                            : "bg-white text-gray-800 !placeholder-gray-500 border border-gray-300 focus:border-gray-500"
                                        }`}
                                />

                                <button
                                    type="button"
                                    onClick={generateEmailFromPrompt}
                                    disabled={generatingContent || !emailForm.aiPrompt.trim()}
                                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1
          ${theme === "dark"
                                            ? "bg-purple-600 hover:bg-purple-500 text-white disabled:bg-purple-800"
                                            : "bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-300"
                                        }`}
                                >
                                    <Sparkles size={16} />
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Bottom Action Bar */}
                    <div
                        className={`flex justify-between items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                            }`}
                    >
                        <div className="flex items-center gap-4 relative">
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
                                    setEmailForm({
                                        recipient: "",
                                        recipientInput: "",
                                        cc: "",
                                        ccInput: "",
                                        bcc: "",
                                        bccInput: "",
                                        subject: "",
                                        message: "",
                                        aiPrompt: "",
                                    });
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
        </div>
    );
}