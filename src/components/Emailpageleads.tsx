
import React, { useState } from "react";
import {
    Send,
    Paperclip,
    Smile,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

// Dummy showToast for demo. Replace with your own.
const showToast = (msg, opts) => alert(msg);

const API_BASE_URL = "http://103.214.132.20:8002/api/v2/document";
const AUTH_TOKEN = "token 1b670b800ace83b:f82627cb56de7f6";

export default function Emailpageleads({ deal, onClose }) {
    const { theme } = useTheme();

    const [showCC, setShowCC] = useState(false);
    const [showBCC, setShowBCC] = useState(false);
    const [emailForm, setEmailForm] = useState({
        recipient: "",
        cc: "",
        bcc: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);

    const sendEmail = async () => {
        if (!emailForm.recipient.trim() || !emailForm.message.trim()) {
            showToast("Please fill all required fields", { type: "error" });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Email Queue`, {
                method: "POST",
                headers: {
                    Authorization: AUTH_TOKEN,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sender: "hariprasad@psdigitise.com",
                    recipients: [{ recipient: emailForm.recipient, status: "Not Sent" }],
                    cc: emailForm.cc,
                    bcc: emailForm.bcc,
                    subject: emailForm.subject,
                    message: emailForm.message,
                    reference_doctype: "CRM Deal",
                    reference_name: deal?.name || "",
                }),
            });

            if (response.ok) {
                showToast("Email queued successfully", { type: "success" });
                setEmailForm({ recipient: "", cc: "", bcc: "", subject: "", message: "" });
                setShowCC(false);
                setShowBCC(false);
                // ✅ Close popup after success
                if (onClose) onClose(); // or simply onClose?.()
            } else {
                throw new Error("Failed to queue email");
            }
        } catch (error) {
            console.error("Error queueing email:", error);
            showToast("Failed to queue email", { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`max-full mx-auto rounded-md shadow-sm p-4 space-y-4 mb-5 border ${theme === "dark"
                ? "bg-transparent text-white border-transparent"
                : "bg-white text-gray-800 border-gray-500"
                }`}
        >
            {/* Email Form */}
            <div className="space-y-5 text-sm">
                {/* To, CC, BCC Row */}
                <div
                    className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-white" : "border-gray-300"
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
                    <span
                        className={`ml-2 cursor-pointer select-none ${theme === "dark" ? "text-gray-300" : "text-gray-500"} hover:underline`}
                        onClick={() => setShowCC(v => !v)}
                    >
                        CC
                    </span>
                    <span
                        className={`ml-2 cursor-pointer select-none ${theme === "dark" ? "text-gray-300" : "text-gray-500"} hover:underline`}
                        onClick={() => setShowBCC(v => !v)}
                    >
                        BCC
                    </span>
                </div>
                {/* CC Field */}
                {showCC && (
                    <div className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-white" : "border-gray-300"}`}>
                        <span className={`w-12 ${theme === "dark" ? "text-white" : "text-gray-500"}`}>CC:</span>
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
                {/* BCC Field */}
                {showBCC && (
                    <div className={`flex items-center gap-2 border-b pb-2 ${theme === "dark" ? "border-white" : "border-gray-300"}`}>
                        <span className={`w-12 ${theme === "dark" ? "text-white" : "text-gray-500"}`}>BCC:</span>
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
                {/* Subject */}
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
            {/* Message */}
            <div>
                <textarea
                    className={`w-full h-40 rounded-md p-3 text-sm focus:outline-none focus:ring-1 ${theme === "dark"
                        ? "bg-white-31 border-gray-600 text-white focus:ring-gray-500"
                        : "bg-white border border-gray-300 text-gray-800 focus:ring-gray-300"
                        }`}
                    placeholder="Type your message..."
                    value={emailForm.message}
                    onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))}
                ></textarea>
            </div>
            {/* Action Buttons */}
            <div
                className={`flex justify-between items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
            >
                <div className="flex items-center gap-4">
                    <Paperclip className="cursor-pointer" size={18} />
                    <Smile className="cursor-pointer" size={18} />
                </div>
                <div className="flex items-center gap-3">
                    {/* <button
                        className="text-red-500 text-base font-semibold px-5 py-2"
                        onClick={() => {
                            setEmailForm({ recipient: "", cc: "", bcc: "", subject: "", message: "" });
                            setShowCC(false);
                            setShowBCC(false);
                        }}
                        type="button"
                    >
                        Discard
                    </button> */}
                    <button
                        className="text-red-500 text-base font-semibold px-5 py-2"
                        onClick={() => {
                            setEmailForm({ recipient: "", cc: "", bcc: "", subject: "", message: "" });
                            setShowCC(false);
                            setShowBCC(false);
                            if (onClose) onClose(); // <-- close the modal
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
    );
}