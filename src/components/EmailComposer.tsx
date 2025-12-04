import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  Mail,
  Sparkles,
  X,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Commentemail from "./Commentemail";
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { IoDocument } from "react-icons/io5";
import { getUserSession } from "../utils/session";
import axios from "axios";
import { Deal } from "./DealDetailView";
import { apiAxios, getAuthToken } from "../api/apiUrl";
import { showToast } from "../utils/toast";
import { ConfirmationPopup } from "./LeadsPopup/ConfirmationPopup";

interface EmailComposerProps {
  mode: string;
  onClose: () => void;
  dealName: string;
  fetchEmails: () => void;
  selectedEmail?: any;
  onSubjectChange?: (subject: string) => void;
  generatedContent?: string;
  generatingContent?: boolean;
  clearSelectedEmail?: () => void;
  fetchComments: () => void;
  deal?: Deal;
}

const API_BASE_URL = "https://api.erpnext.ai/api/method/frappe.core.doctype.communication.email.make";
const AUTH_TOKEN = getAuthToken();
const SEARCH_API_URL = "https://api.erpnext.ai/api/method/frappe.desk.search.search_link";
const AI_GENERATE_API = "https://api.erpnext.ai/api/method/customcrm.email.email_generator.generate_email";

interface User {
  value: string;
  description: string;
}

interface EmailRecipient {
  id: string;
  email: string;
  label?: string;
}

export default function EmailOrCommentComposer({
  deal,
  onClose,
  mode,
  dealName,
  fetchEmails,
  selectedEmail,
  clearSelectedEmail,
  fetchComments,
  onSubjectChange,
  generatedContent,
  generatingContent
}: EmailComposerProps) {
  const { theme } = useTheme();

  const [showComment, setShowComment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Multi-select states
  const [toRecipients, setToRecipients] = useState<EmailRecipient[]>([]);
  const [ccRecipients, setCcRecipients] = useState<EmailRecipient[]>([]);
  const [bccRecipients, setBccRecipients] = useState<EmailRecipient[]>([]);
  const [currentToInput, setCurrentToInput] = useState("");
  const [currentCcInput, setCurrentCcInput] = useState("");
  const [currentBccInput, setCurrentBccInput] = useState("");

  // Autocomplete states
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestionsFor, setSuggestionsFor] = useState<"to" | "cc" | "bcc">("to");

  const toInputRef = useRef<HTMLInputElement>(null);
  const ccInputRef = useRef<HTMLInputElement>(null);
  const bccInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
    aiPrompt: "", // New AI prompt field
  });

  const [isSubjectEdited, setIsSubjectEdited] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [subjectToGenerate, setSubjectToGenerate] = useState("");
  const [quotedMessage, setQuotedMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const userSession = getUserSession();
  const sessionfullname = userSession?.full_name;
  const senderUsername = userSession?.username || sessionfullname;

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

      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        toInputRef.current &&
        !toInputRef.current.contains(event.target as Node) &&
        ccInputRef.current &&
        !ccInputRef.current.contains(event.target as Node) &&
        bccInputRef.current &&
        !bccInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const fetchUserSuggestions = async (searchText: string) => {
    if (!searchText.trim()) {
      setUserSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const session = getUserSession();
    const sessionCompany = session?.company;

    setSearchLoading(true);
    try {

      const payload = {
        txt: searchText,
        doctype: "User",
        filters: sessionCompany ? { company: sessionCompany } : null
      };

      const response = await axios.post(SEARCH_API_URL, payload, {
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.message) {
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

  const isValidEmail = (email: string) => {
    const emailRegex = /^([^<>]+<)?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(>)?$/;
    return emailRegex.test(email.trim());
  };

  const extractEmailFromDisplayString = (input: string): string => {
    const match = input.match(/<([^>]+)>/);
    return match ? match[1] : input;
  };

  const handleAddRecipient = (type: "to" | "cc" | "bcc", email: string) => {
    if (!email.trim()) return;

    const emailAddress = extractEmailFromDisplayString(email);

    if (!isValidEmail(emailAddress)) {
      showToast(`Invalid email address: ${email}`, { type: "error" });
      return;
    }

    const newRecipient: EmailRecipient = {
      id: Date.now().toString(),
      email: emailAddress,
      label: email.includes("<") ? email : undefined
    };

    switch (type) {
      case "to":
        if (!toRecipients.some(r => r.email === emailAddress)) {
          setToRecipients(prev => [...prev, newRecipient]);
        }
        setCurrentToInput("");
        break;
      case "cc":
        if (!ccRecipients.some(r => r.email === emailAddress)) {
          setCcRecipients(prev => [...prev, newRecipient]);
        }
        setCurrentCcInput("");
        break;
      case "bcc":
        if (!bccRecipients.some(r => r.email === emailAddress)) {
          setBccRecipients(prev => [...prev, newRecipient]);
        }
        setCurrentBccInput("");
        break;
    }

    setShowSuggestions(false);
  };

  const handleRemoveRecipient = (type: "to" | "cc" | "bcc", id: string) => {
    switch (type) {
      case "to":
        setToRecipients(prev => prev.filter(r => r.id !== id));
        break;
      case "cc":
        setCcRecipients(prev => prev.filter(r => r.id !== id));
        break;
      case "bcc":
        setBccRecipients(prev => prev.filter(r => r.id !== id));
        break;
    }
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "to" | "cc" | "bcc"
  ) => {
    const inputValue = type === "to" ? currentToInput :
      type === "cc" ? currentCcInput : currentBccInput;

    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddRecipient(type, inputValue);
    } else if (e.key === 'Backspace' && !inputValue) {
      switch (type) {
        case "to":
          if (toRecipients.length > 0) {
            setToRecipients(prev => prev.slice(0, -1));
          }
          break;
        case "cc":
          if (ccRecipients.length > 0) {
            setCcRecipients(prev => prev.slice(0, -1));
          }
          break;
        case "bcc":
          if (bccRecipients.length > 0) {
            setBccRecipients(prev => prev.slice(0, -1));
          }
          break;
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "to" | "cc" | "bcc"
  ) => {
    const value = e.target.value;

    switch (type) {
      case "to":
        setCurrentToInput(value);
        break;
      case "cc":
        setCurrentCcInput(value);
        break;
      case "bcc":
        setCurrentBccInput(value);
        break;
    }

    if (value.trim()) {
      setSuggestionsFor(type);
      setShowSuggestions(true);
      fetchUserSuggestions(value);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (user: User) => {
    switch (suggestionsFor) {
      case "to":
        handleAddRecipient("to", user.value);
        break;
      case "cc":
        handleAddRecipient("cc", user.value);
        break;
      case "bcc":
        handleAddRecipient("bcc", user.value);
        break;
    }
  };

  const renderRecipientChips = (recipients: EmailRecipient[], type: "to" | "cc" | "bcc") => {
    return recipients.map(recipient => (
      <div
        key={recipient.id}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${theme === "dark"
          ? "bg-gray-700 text-gray-200 border border-gray-600"
          : "bg-gray-100 text-gray-700 border border-gray-300"
          }`}
      >
        <span className="truncate max-w-[120px] sm:max-w-[150px]">
          {recipient.label || recipient.email}
        </span>
        <button
          type="button"
          onClick={() => handleRemoveRecipient(type, recipient.id)}
          className={`ml-1 rounded-full p-0.5 hover:bg-opacity-20 ${theme === "dark"
            ? "hover:bg-gray-500 text-gray-300"
            : "hover:bg-gray-400 text-gray-500"
            }`}
        >
          <X size={12} />
        </button>
      </div>
    ));
  };

  const UPLOAD_API_URL = "https://api.erpnext.ai/api/method/upload_file";

  async function uploadFiles(files: File[]): Promise<string[]> {
    const uploadedFileIds: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("doctype", "CRM Deal");
      formData.append("docname", dealName);
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

  const sendEmail = async () => {
    if (toRecipients.length === 0) {
      showToast("Please add at least one recipient in 'To' field.", { type: "error" });
      return;
    }

    for (const recipient of ccRecipients) {
      if (!isValidEmail(recipient.email)) {
        showToast(`Invalid email address in 'Cc' field.`, { type: "error" });
        return;
      }
    }

    for (const recipient of bccRecipients) {
      if (!isValidEmail(recipient.email)) {
        showToast(`Invalid email address in 'Bcc' field.`, { type: "error" });
        return;
      }
    }

    if (!emailForm.message.trim() || !emailForm.subject.trim()) {
      showToast("Please fill all required fields", { type: "error" });
      return;
    }

    setLoading(true);

    try {
      let attachmentIds: string[] = [];

      if (uploadedFiles.length > 0) {
        attachmentIds = await uploadFiles(uploadedFiles);
      }

      const recipientsString = toRecipients.map(r => r.email).join(", ");
      const ccString = ccRecipients.map(r => r.email).join(", ");
      const bccString = bccRecipients.map(r => r.email).join(", ");

      // For the quoted message, keep it as plain text
      // For the new message, wrap it in HTML
      const newMessageHtml = `<div style="white-space: pre-wrap; font-family: sans-serif;">${emailForm.message}</div>`;
      
      const fullMessage = quotedMessage
        ? `${newMessageHtml}\n\n---\n\n${quotedMessage}`
        : newMessageHtml;

      const payload = {
        recipients: recipientsString,
        cc: ccString,
        bcc: bccString,
        subject: emailForm.subject,
        content: fullMessage,
        send_email: 1,
        name: dealName,
        now: 1,
        doctype: "CRM Deal",
        sender_full_name: senderUsername,
        attachments: attachmentIds,
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
        setToRecipients([]);
        setCcRecipients([]);
        setBccRecipients([]);
        setCurrentToInput("");
        setCurrentCcInput("");
        setCurrentBccInput("");
        setEmailForm({ subject: "", message: "", aiPrompt: "" });
        setUploadedFiles([]);
        setQuotedMessage("");
        setShowCC(false);
        setShowBCC(false);

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
      // Extract and clean the quoted message
      let quoted = selectedEmail.content || "";
      
      // Remove HTML tags from the quoted message
      if (quoted.includes('<')) {
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = quoted;
        quoted = tempDiv.textContent || tempDiv.innerText || "";
      }
      
      // Clean up any remaining HTML entities
      quoted = quoted
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      const recipientEmail = selectedEmail.from || "";
      if (recipientEmail) {
        setToRecipients([{
          id: "1",
          email: extractEmailFromDisplayString(recipientEmail),
          label: recipientEmail.includes("<") ? recipientEmail : undefined
        }]);
      }

      if (selectedEmail.cc && mode === "reply-all") {
        const ccEmails = selectedEmail.cc.split(',').map((email: string) => email.trim());
        const ccRecipients = ccEmails.map((email: string, index: number) => ({
          id: `cc-${index}`,
          email: extractEmailFromDisplayString(email),
          label: email.includes("<") ? email : undefined
        }));
        setCcRecipients(ccRecipients);
      }

      if (selectedEmail.bcc && mode === "reply-all") {
        const bccEmails = selectedEmail.bcc.split(',').map((email: string) => email.trim());
        const bccRecipients = bccEmails.map((email: string, index: number) => ({
          id: `bcc-${index}`,
          email: extractEmailFromDisplayString(email),
          label: email.includes("<") ? email : undefined
        }));
        setBccRecipients(bccRecipients);
      }

      setEmailForm(prev => ({
        ...prev,
        subject: selectedEmail.subject?.startsWith("Re:")
          ? selectedEmail.subject
          : `Re: ${selectedEmail.subject}`,
        message: "",
        aiPrompt: ""
      }));

      setQuotedMessage(quoted);
      setShowCC(mode === "reply-all" && !!selectedEmail.cc);
      setShowBCC(mode === "reply-all" && !!selectedEmail.bcc);
    }
  }, [mode, selectedEmail]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subject = e.target.value;
    setEmailForm(f => ({ ...f, subject }));

    if (onSubjectChange) {
      onSubjectChange(subject);
    }
  };

  const handleConfirmGenerate = async () => {
    await generateEmailFromSubject(subjectToGenerate);
    setShowConfirmationPopup(false);
    setIsSubjectEdited(true);
  };

  const handleGenerateButtonClick = () => {
    if (emailForm.subject.trim()) {
      setSubjectToGenerate(emailForm.subject);
      setShowConfirmationPopup(true);
    }
  };

  useEffect(() => {
    if (mode === "new") {
      setToRecipients([]);
      setCcRecipients([]);
      setBccRecipients([]);
      setCurrentToInput("");
      setCurrentCcInput("");
      setCurrentBccInput("");
      setEmailForm({ subject: "", message: "", aiPrompt: "" });
      setUploadedFiles([]);
      setQuotedMessage("");
      setShowCC(false);
      setShowBCC(false);
      setShowComment(false);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "new" && deal) {
      setEmailForm(prev => ({
        ...prev,
        subject: dealName
      }));
    }
  }, [mode, deal]);

  async function generateEmailFromSubject(subject: string) {
    try {
      setGenerating(true);
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
        setEmailForm((prev) => ({ ...prev, message: generatedMessage }));
      }
    } catch (error) {
      console.error("Error generating email:", error);
      showToast("Failed to generate email content", { type: "error" });
    } finally {
      setGenerating(false);
    }
  }

  // NEW FUNCTION: Generate email from AI prompt
  const generateEmailFromPrompt = async () => {
    if (!emailForm.aiPrompt.trim()) {
      showToast("Please enter a prompt for AI generation", { type: "error" });
      return;
    }

    try {
      setGenerating(true);
      const response = await apiAxios.post(
        AI_GENERATE_API,
        { purpose: emailForm.aiPrompt.trim() },
        {
          headers: {
            Authorization: AUTH_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      
      let generatedSubject = "";
      let generatedBody = "";
      
      if (data.message && typeof data.message === 'object') {
        if (data.message.message && typeof data.message.message === 'object') {
          generatedSubject = data.message.message.subject || "";
          generatedBody = data.message.message.body || "";
        } else if (data.message.subject && data.message.body) {
          generatedSubject = data.message.subject;
          generatedBody = data.message.body;
        } else if (data.message.generated_content) {
          generatedBody = data.message.generated_content;
          generatedSubject = emailForm.subject || `Re: ${dealName || ""}`;
        }
      } else if (data.message && typeof data.message === 'string') {
        generatedBody = data.message;
        generatedSubject = emailForm.subject || `Re: ${dealName || ""}`;
      } else if (data.generated_content) {
        generatedBody = data.generated_content;
        generatedSubject = emailForm.subject || `Re: ${dealName || ""}`;
      }

      if (generatedBody) {
        setEmailForm(prev => ({
          ...prev,
          subject: generatedSubject || prev.subject || `Re: ${dealName || ""}`,
          message: generatedBody,
        }));
        setIsSubjectEdited(true);
        showToast("Email content generated successfully!", { type: "success" });
        
        // Clear the AI prompt after successful generation
        setEmailForm(prev => ({ ...prev, aiPrompt: "" }));
      } else {
        showToast("Failed to generate email content. Please try again.", { type: "error" });
      }
    } catch (error: any) {
      console.error("Error generating email:", error);
      showToast(`Failed to generate email content: ${error.message}`, { type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const getActiveInputRef = () => {
    if (suggestionsFor === "to" && toInputRef.current) return toInputRef;
    if (suggestionsFor === "cc" && ccInputRef.current) return ccInputRef;
    if (suggestionsFor === "bcc" && bccInputRef.current) return bccInputRef;
    return toInputRef;
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
          <MessageSquare
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
              className={`text-xl font-medium ${showCC ? (theme === "dark" ? "text-white" : "text-gray-800") : ""}`}
              onClick={() => setShowCC(!showCC)}
            >
              Cc
            </button>
            <button
              className={`text-xl font-medium ${showBCC ? (theme === "dark" ? "text-white" : "text-gray-800") : ""}`}
              onClick={() => setShowBCC(!showBCC)}
            >
              Bcc
            </button>
          </div>
        )}
      </div>

      {showComment ? (
        <Commentemail
          fetchComments={fetchComments}
          reference_name={dealName}
          onClose={onClose}
        />
      ) : (
        <div className="relative">
          {/* Email Form */}
          <div className="space-y-4 text-sm">
            {/* To Field */}
            <div
              className={`flex items-start gap-4 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
            >
              <div className="flex items-center w-12">
                <span className={`${theme === "dark" ? "text-white" : "text-gray-700"}`}>To:</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1 mb-1">
                  {renderRecipientChips(toRecipients, "to")}
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      ref={toInputRef}
                      type="text"
                      value={currentToInput}
                      onChange={(e) => handleInputChange(e, "to")}
                      onKeyDown={(e) => handleInputKeyDown(e, "to")}
                      onFocus={() => setSuggestionsFor("to")}
                      className={`w-full px-2 py-1 rounded font-medium outline-none placeholder:font-normal ${theme === "dark"
                        ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                        : "bg-gray-50 text-gray-800 placeholder:text-gray-500 border border-gray-300 focus:border-gray-500"
                        }`}
                      placeholder={toRecipients.length === 0 ? "Recipient email" : ""}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assist Field - ALWAYS VISIBLE below To field */}
            <div
              className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}
            >
              <span className={`w-16 font-medium flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                AI Assist:
              </span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={emailForm.aiPrompt}
                  onChange={(e) => setEmailForm(f => ({ ...f, aiPrompt: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      generateEmailFromPrompt();
                    }
                  }}
                  className={`px-2 py-1 rounded font-medium outline-none flex-1 placeholder:font-normal ${theme === "dark"
                    ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                    : "bg-gray-50 text-gray-800 placeholder:text-gray-500 border border-gray-300 focus:border-gray-500"
                    }`}
                  placeholder="Describe the email you want to write (e.g., 'client followup reminder')"
                />
                <button
                  type="button"
                  onClick={generateEmailFromPrompt}
                  disabled={generating || !emailForm.aiPrompt.trim()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white disabled:bg-purple-800'
                    : 'bg-purplebg hover:bg-purple-700 text-white disabled:bg-purple-300'
                    }`}
                >
                  <span>{generating ? "Generating..." : "Generate"}</span>
                </button>
              </div>
            </div>

            {/* CC Field */}
            {showCC && (
              <div
                className={`flex items-start gap-4 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"
                  }`}
              >
                <div className="flex items-center w-12">
                  <span className={`${theme === "dark" ? "text-white" : "text-gray-700"}`}>CC:</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {renderRecipientChips(ccRecipients, "cc")}
                    <div className="relative flex-1 min-w-[200px]">
                      <input
                        ref={ccInputRef}
                        type="text"
                        value={currentCcInput}
                        onChange={(e) => handleInputChange(e, "cc")}
                        onKeyDown={(e) => handleInputKeyDown(e, "cc")}
                        onFocus={() => setSuggestionsFor("cc")}
                        className={`w-full px-2 py-1 rounded font-medium outline-none placeholder:font-normal ${theme === "dark"
                          ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                          : "bg-gray-50 text-gray-800 placeholder:text-gray-500 border border-gray-300 focus:border-gray-500"
                          }`}
                        placeholder="CC email"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BCC Field */}
            {showBCC && (
              <div
                className={`flex items-start gap-4 border-b pb-2 ${theme === "dark" ? "border-gray-600" : "border-gray-300"
                  }`}
              >
                <div className="flex items-center w-12">
                  <span className={`${theme === "dark" ? "text-white" : "text-gray-700"}`}>BCC:</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {renderRecipientChips(bccRecipients, "bcc")}
                    <div className="relative flex-1 min-w-[200px]">
                      <input
                        ref={bccInputRef}
                        type="text"
                        value={currentBccInput}
                        onChange={(e) => handleInputChange(e, "bcc")}
                        onKeyDown={(e) => handleInputKeyDown(e, "bcc")}
                        onFocus={() => setSuggestionsFor("bcc")}
                        className={`w-full px-2 py-1 rounded font-medium outline-none placeholder:font-normal ${theme === "dark"
                          ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                          : "bg-gray-50 text-gray-800 placeholder:text-gray-500 border border-gray-300 focus:border-gray-500"
                          }`}
                        placeholder="BCC email"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subject Field - REMOVED the Generate button */}
            <div
              className={`flex items-center gap-2 border-b pb-1 ${theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
            >
              <div className="flex items-center w-12">
                <span className={`${theme === "dark" ? "text-white" : "text-gray-700"}`}>Subject:</span>
              </div>
              <input
                type="text"
                value={emailForm.subject}
                onChange={handleSubjectChange}
                className={`px-2 py-1 rounded font-medium outline-none flex-1 placeholder:font-normal ${theme === "dark"
                  ? "bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-400"
                  : "bg-gray-50 text-gray-800 placeholder:text-gray-500 border border-gray-300 focus:border-gray-500"
                  }`}
                placeholder="Enter email subject"
              />
            </div>

            {generatingContent && (
              <div className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Generating content...
              </div>
            )}

            {generatedContent && (
              <div className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <p className="font-medium mb-2">Suggested content:</p>
                <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className={`absolute z-50 max-h-60 overflow-y-auto rounded-md shadow-lg border ${theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
                }`}
              style={{
                width: getActiveInputRef().current?.offsetWidth || '300px',
                left: getActiveInputRef().current?.offsetLeft || 0,
                top: (getActiveInputRef().current?.offsetTop || 0) + (getActiveInputRef().current?.offsetHeight || 0) + 2
              }}
            >
              {searchLoading ? (
                <div className={`px-3 py-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Loading...
                </div>
              ) : userSuggestions.length > 0 ? (
                userSuggestions.map((user, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-full text-left px-3 py-2 cursor-pointer hover:bg-opacity-50 text-sm border-b last:border-b-0 ${theme === "dark"
                      ? "hover:bg-gray-700 border-gray-700 text-white"
                      : "hover:bg-gray-100 border-gray-200 text-gray-800"
                      }`}
                    onClick={() => handleSuggestionClick(user)}
                  >
                    <div className="font-medium truncate">{user.value}</div>
                    {user.description && (
                      <div className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {user.description}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className={`px-3 py-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  No users found
                </div>
              )}
            </div>
          )}

          {/* Message Area */}
          <div className="mt-4">
            <textarea
              className={`w-full h-40 rounded-md p-3 text-sm focus:outline-none focus:ring-1 ${theme === "dark"
                ? "bg-white-31 border-gray-600 text-white focus:ring-gray-500 !placeholder-gray-400"
                : "bg-white border border-gray-300 text-gray-800 focus:ring-gray-300 !placeholder-gray-500"
                }`}
              placeholder={isFocused ? "" : "@John,can you please check this?"}
              value={generating ? "Generating email content..." : emailForm.message}
              disabled={generating}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))}
            />

            {quotedMessage && (
              <div
                className={`mt-4 border-l-4 pl-4 italic font-semibold text-sm ${theme === "dark" ? "border-gray-500 text-gray-300" : "border-gray-600 text-gray-700"
                  }`}
              >
                "{quotedMessage.length > 200 ? quotedMessage.substring(0, 200) + '...' : quotedMessage}"
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center border px-3 py-1 rounded-md ${theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-800"
                      }`}
                  >
                    <span className="mr-2 flex items-center gap-1 truncate max-w-[150px]">
                      <IoDocument className="text-base" />
                      {file.name}
                    </span>
                    <button
                      onClick={() =>
                        setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      className={`text-lg leading-none ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            className={`flex justify-between items-center text-sm mt-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
          >
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <Paperclip size={18} className={theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const isDuplicate = uploadedFiles.some(
                        existingFile => existingFile.name === file.name
                      );

                      if (!isDuplicate) {
                        setUploadedFiles((prev) => [...prev, file]);
                      } else {
                        showToast("This file has already been attached", { type: "warning" });
                      }
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              <div className="relative">
                <Smile
                  className={`cursor-pointer ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"}`}
                  size={18}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                />
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute z-50 bottom-full left-0 mb-2"
                  >
                    <Picker data={data} onEmojiSelect={addEmoji} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className={`text-base font-semibold px-5 py-2 transition-colors ${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-600"
                  }`}
                onClick={() => {
                  setToRecipients([]);
                  setCcRecipients([]);
                  setBccRecipients([]);
                  setCurrentToInput("");
                  setCurrentCcInput("");
                  setCurrentBccInput("");
                  setEmailForm({ subject: "", message: "", aiPrompt: "" });
                  setUploadedFiles([]);
                  setQuotedMessage("");
                  setShowCC(false);
                  setShowBCC(false);
                  setShowEmojiPicker(false);
                  setUserSuggestions([]);
                  setShowSuggestions(false);

                  if (clearSelectedEmail) clearSelectedEmail();
                  if (onClose) onClose();
                }}
                type="button"
              >
                Discard
              </button>

              <button
                className={`text-base font-semibold px-5 py-2 rounded-md flex items-center gap-1 transition-colors
                  ${theme === "dark"
                    ? "bg-purple-600 hover:bg-purple-500 text-white"
                    : "bg-purplebg hover:bg-purple-700 text-white"
                  }
                  ${loading || !emailForm.message.trim() || toRecipients.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
                onClick={sendEmail}
                disabled={loading || !emailForm.message.trim() || toRecipients.length === 0}
                type="button"
              >
                {loading ? "Sending..." : "Send"}
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
          setIsSubjectEdited(true);
        }}
        title="Generate Email Content?"
        message="Do you want to automatically generate an email body based on the subject?"
        isLoading={generating}
      />
    </div>
  );
}