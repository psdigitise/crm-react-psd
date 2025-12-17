import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  Mail,
  Sparkles,
  X,
  Loader2,
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
const CHECK_CREDITS_API = "https://api.erpnext.ai/api/method/customcrm.api.check_credits_available";
const ADD_ACTION_LOG_API = "https://api.erpnext.ai/api/method/customcrm.api.add_action_log";

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
    aiPrompt: "",
  });

  const [isSubjectEdited, setIsSubjectEdited] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [subjectToGenerate, setSubjectToGenerate] = useState("");
  const [quotedMessage, setQuotedMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Credit-related states
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [checkingCredits, setCheckingCredits] = useState(false);
  const [showCreditWarning, setShowCreditWarning] = useState(false);

  const userSession = getUserSession();
  const sessionfullname = userSession?.full_name;
  const senderUsername = userSession?.username || sessionfullname;
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

  const addEmoji = (emoji: { native: string; }) => {
    setEmailForm((prev) => ({
      ...prev,
      message: prev.message + emoji.native,
    }));
  };

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

  // Function to check email credits
  const checkEmailCredits = async (): Promise<number> => {
    setCheckingCredits(true);
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      const response = await apiAxios.post(
        CHECK_CREDITS_API,
        {
          type: 'email',
          company: sessionCompany
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      const creditsData = response.data.message;
      if (creditsData.status) {
        const credits = creditsData.available_credits || 0;
        setAvailableCredits(credits);
        // Reset warning when credits are sufficient
        setShowCreditWarning(false);
        return credits;
      } else {
        const credits = creditsData.available_credits || 0;
        // Set warning when credits are insufficient
        setShowCreditWarning(true);
        setAvailableCredits(credits);
        return credits; // Still return the credits value
      }
    } catch (error) {
      console.error('Error checking email credits:', error);
      showToast('Failed to check credits availability for email generation', { type: 'error' });
      return 0;
    } finally {
      setCheckingCredits(false);
    }
  };

  // Helper function to extract token usage from different response formats
  const extractTokenUsage = (data: any) => {
    const tokenUsage = data.message?.token_usage || {};

    return {
      inputTokens: tokenUsage.input_tokens || 0,
      outputTokens: tokenUsage.output_tokens || 0,
      usdCost: tokenUsage.usd_cost || tokenUsage.usd || 0,
      inrCost: tokenUsage.inr_cost || tokenUsage.inr || 0,
      totalTokens: tokenUsage.total_tokens || 0
    };
  };

  // Function to add action log for email generation
  const addEmailActionLog = async (
    inputTokens: number,
    outputTokens: number,
    usdCost: number,
    inrCost: number
  ) => {
    try {
      await apiAxios.post(
        ADD_ACTION_LOG_API,
        {
          doc: "CRM Deal",
          parent: dealName,
          type: "email",
          data_ctrx: inputTokens,
          output_token: outputTokens,
          usd: usdCost,
          inr: inrCost
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Email generation action log added successfully');
    } catch (logError) {
      console.error('Failed to add email action log:', logError);
    }
  };

  // Updated function for prompt-based generation with proper token extraction
  const generateEmailFromPrompt = async () => {
    if (!emailForm.aiPrompt.trim()) {
      showToast("Please enter a prompt for AI generation", { type: "error" });
      return;
    }

    // First check credits
    const creditsAvailable = await checkEmailCredits();

    // Check if credits are insufficient (less than or equal to 0)
    if (creditsAvailable <= 0) {
      showToast(`Insufficient credits. You have only ${availableCredits} credits available for email generation. Please add more to proceed.`, { type: 'error' });
      // Don't set showCreditWarning to false here, let the checkEmailCredits function handle it
      return;
    }

    const combinedPurpose = `
Modify this email:
Subject: ${emailForm.subject || "(no subject)"}

${emailForm.message || "(no message)"}

Instruction: ${emailForm.aiPrompt.trim()}
  `;
    const currentUserFirstName = userSession?.dealFullName || "";
    const senderName = userSession?.full_name || userSession?.username || "User";

    const payload = {
      purpose: combinedPurpose,
      recipient_name: currentUserFirstName, // <-- NEW PARAMETER
      sender_name: senderName,       // <-- NEW PARAMETER
    };

    try {
      setGenerating(true);

      const response = await apiAxios.post(
        AI_GENERATE_API,
        payload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      // Extract token usage and cost from response
      const { inputTokens, outputTokens, usdCost, inrCost } = extractTokenUsage(data);

      console.log("Token Usage:", { inputTokens, outputTokens, usdCost, inrCost });

      let generatedSubject = "";
      let generatedBody = "";

      if (data.message?.message) {
        generatedSubject = data.message.message.subject || emailForm.subject;
        generatedBody = data.message.message.body || "";
      } else if (data.message?.subject && data.message?.body) {
        generatedSubject = data.message.subject;
        generatedBody = data.message.body;
      } else if (data.message?.generated_content) {
        generatedBody = data.message.generated_content;
        generatedSubject = emailForm.subject;
      }

      if (generatedBody) {
        setEmailForm(prev => ({
          ...prev,
          subject: generatedSubject,
          message: generatedBody,
        }));

        // Add action log with correct token mapping
        await addEmailActionLog(inputTokens, outputTokens, usdCost, inrCost);

        showToast("Email improved successfully!", { type: "success" });

        // Clear prompt box
        setEmailForm(prev => ({ ...prev, aiPrompt: "" }));
      } else {
        showToast("Failed to generate improved email.", { type: "error" });
      }

    } catch (error: any) {
      console.error("AI Generate Error:", error);
      showToast(`AI Error: ${error.message}`, { type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  // Updated function for subject-based generation with proper token extraction
  const generateEmailFromSubject = async (subject: string) => {
    // First check credits
    const creditsAvailable = await checkEmailCredits();

    // Check if credits are insufficient (less than or equal to 0)
    if (creditsAvailable <= 0) {
      showToast(`Insufficient credits. You have only ${availableCredits} credits available for email generation. Please add more to proceed.`, { type: 'error' });
      // Don't set showCreditWarning to false here, let the checkEmailCredits function handle it
      return;
    }

    try {
      setGenerating(true);
      const response = await apiAxios.post(
        AI_GENERATE_API,
        { subject },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      // Extract token usage and cost from response
      const { inputTokens, outputTokens, usdCost, inrCost } = extractTokenUsage(data);

      console.log("Token Usage (subject):", { inputTokens, outputTokens, usdCost, inrCost });

      const generatedMessage = data.message?.generated_content || data.message?.message?.body || data.message?.body;

      if (generatedMessage) {
        setEmailForm((prev) => ({
          ...prev,
          message: generatedMessage
        }));

        // Add action log with correct token mapping
        await addEmailActionLog(inputTokens, outputTokens, usdCost, inrCost);

        showToast("Email content generated successfully!", { type: "success" });
      } else {
        showToast("Failed to generate email content", { type: "error" });
      }
    } catch (error: any) {
      console.error("Error generating email:", error);
      showToast(`Failed to generate email content: ${error.message}`, { type: "error" });
    } finally {
      setGenerating(false);
    }
  };

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
          Authorization: token,
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
      // Validate file before upload
      if (!validateFile(file)) {
        throw new Error(`File validation failed for: ${file.name}`);
      }

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
            Authorization: token,
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

  // Handle file input change with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        showToast(`Size exceeds the maximum allowed file size. Maximum size is 1MB.`, { type: 'error' });
        e.target.value = "";
        return;
      }

      // Validate file type (optional)
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        showToast(`File type not allowed. Allowed types: images, PDF, Word, Excel, text files.`, { type: 'error' });
        e.target.value = "";
        return;
      }

      // Check for duplicates
      const isDuplicate = uploadedFiles.some(
        existingFile => existingFile.name === file.name
      );

      if (!isDuplicate) {
        setUploadedFiles((prev) => [...prev, file]);
        showToast(`File "${file.name}" added successfully.`, { type: 'success' });
      } else {
        showToast("This file has already been attached", { type: "warning" });
      }
      e.target.value = "";
    }
  };

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

    // Validate all attached files before sending
    for (const file of uploadedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File "${file.name}" exceeds maximum size of 1MB. Please remove it or choose a smaller file.`, { type: 'error' });
        return;
      }
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
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast("Email sent successfully", { type: "success" });
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
      let quoted = selectedEmail.content || "";

      if (quoted.includes('<')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = quoted;
        quoted = tempDiv.textContent || tempDiv.innerText || "";
      }

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

  const getActiveInputRef = () => {
    if (suggestionsFor === "to" && toInputRef.current) return toInputRef;
    if (suggestionsFor === "cc" && ccInputRef.current) return ccInputRef;
    if (suggestionsFor === "bcc" && bccInputRef.current) return bccInputRef;
    return toInputRef;
  };

  // Check credits on component mount or when opening email composer
  useEffect(() => {
    if (!showComment) {
      checkEmailCredits();
    }
  }, [showComment]);

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
          className={`flex items-center gap-1 transition-colors ${!showComment
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
                        ? "bg-gray-700 text-white !placeholder-gray-400 border border-gray-600 focus:border-gray-400"
                        : "bg-gray-50 text-gray-800 !placeholder-gray-500 border border-gray-300 focus:border-gray-500"
                        }`}
                      placeholder={toRecipients.length === 0 ? "Recipient email" : ""}
                    />
                  </div>
                </div>
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
                          ? "bg-gray-700 text-white !placeholder-gray-400 border border-gray-600 focus:border-gray-400"
                          : "bg-gray-50 text-gray-800 !placeholder-gray-500 border border-gray-300 focus:border-gray-500"
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
                          ? "bg-gray-700 text-white !placeholder-gray-400 border border-gray-600 focus:border-gray-400"
                          : "bg-gray-50 text-gray-800 !placeholder-gray-500 border border-gray-300 focus:border-gray-500"
                          }`}
                        placeholder="BCC email"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subject Field */}
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
                className={`w-full px-2 py-1 rounded font-medium outline-none placeholder:font-normal ${theme === "dark"
                  ? "bg-gray-700 text-white !placeholder-gray-400 border border-gray-600 focus:border-gray-400"
                  : "bg-gray-50 text-gray-800 !placeholder-gray-500 border border-gray-300 focus:border-gray-500"
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

          {/* AI Assist Field */}
          <div
            className={`mt-4 mb-2 w-full border rounded-lg px-4 py-3 flex items-center gap-3 
    ${theme === "dark" ? "bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30 border-gray-700" : "bg-gray-50 border-gray-300"}`}
          >
            <div className="flex flex-col w-full">
              <span
                className={`text-sm flex gap-2 font-semibold mb-2 
        ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
              >
                <Sparkles size={16} />
                AI Assist {generating && <Loader2 className="w-3 h-3 animate-spin" />}
              </span>
              <p className={`text-xs flex gap-2 font-normal mb-2 
        ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                Describe the email you want to write and let AI do the rest

              </p>

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
                  disabled={generating || !emailForm.aiPrompt.trim()}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors
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
                  onChange={handleFileChange}
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