import { useEffect, useState } from "react";
import { Eye, EyeOff, CheckCircle, X, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                {type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                    <X className="w-5 h-5 text-red-600" />
                )}
                <p className="text-sm font-medium max-w-xs sm:max-w-sm">{message}</p>
                <button
                    onClick={onClose}
                    className={`ml-2 ${type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                        }`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default function PasswordResetPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isFromActivation, setIsFromActivation] = useState(false);
    const [showRedirectOption, setShowRedirectOption] = useState(false);
    const navigate = useNavigate();

    // Toast state
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error'
    });

    // Password validation rules
    const rules = {
        minLength: { test: (s: string | any[]) => s.length >= 8, message: "At least 8 characters" },
        uppercase: { test: (s: string) => /[A-Z]/.test(s), message: "At least one uppercase letter" },
        number: { test: (s: string) => /[0-9]/.test(s), message: "At least one number" },
        special: { test: (s: string) => /[^A-Za-z0-9]/.test(s), message: "At least one special character" },
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({
            isVisible: true,
            message,
            type
        });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const isPasswordValid = (Object.keys(rules) as Array<keyof typeof rules>).every(
        (k) => rules[k].test(password)
    );
    const isConfirmValid = confirmPassword === password && password.length > 0;
    const canSubmit = isPasswordValid && isConfirmValid;

    // Detect if user came from activation
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('from') === 'activation') {
            setIsFromActivation(true);
        }
    }, []);


    // const handleSubmit = async () => {
    //     if (!canSubmit) return;

    //     setLoading(true);
    //     setError("");
    //     setShowRedirectOption(false);

    //     try {
    //         const urlParams = new URLSearchParams(window.location.search);
    //         const key = urlParams.get("key");

    //         if (!key) {
    //             showToast("Reset link is invalid.", "error");
    //             return;
    //         }

    //         const formData = new FormData();
    //         formData.append("key", key);
    //         formData.append("new_password", password);
    //         formData.append("confirm_password", confirmPassword);
    //         formData.append("cmd", "frappe.core.doctype.user.user.update_password");
    //         const response = await axios.post(
    //             "https://api.erpnext.ai/",
    //             formData,
    //             {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data",
    //                 },
    //                 withCredentials: true,
    //                 validateStatus: (status) => status >= 200 && status < 400, // 👈 allow 302
    //             }
    //         );
    const handleSubmit = async () => {
        if (!canSubmit) return;

        setLoading(true);
        setError("");
        setShowRedirectOption(false);

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const key = urlParams.get("key");

            if (!key) {
                showToast("Reset link is invalid.", "error");
                setLoading(false);
                return;
            }

            // Step 1: Fetch CSRF token
            const tokenResponse = await axios.get(
                "https://api.erpnext.ai/api/method/frappe.auth.get_logged_user",
                {
                    withCredentials: true,
                }
            );

            const csrfToken = tokenResponse.data.csrf_token;

            // Step 2: Make the password reset request with CSRF token
            const formData = new FormData();
            formData.append("key", key);
            formData.append("new_password", password);
            formData.append("confirm_password", confirmPassword);
            formData.append("cmd", "frappe.core.doctype.user.user.update_password");

            const response = await axios.post(
                "https://api.erpnext.ai/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-Frappe-CSRF-Token": csrfToken,
                    },
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 400,
                }
            );

            // ✅ SUCCESS (200 or 302)
            // Check if there's an error in the response data
            if (response.data?.message?.error || response.data?.exc) {
                const apiError = response.data.message?.error || response.data.message || "Failed to update password. Please try again.";
                showToast(apiError, "error");

                // Show redirect option for expired/invalid links
                if (
                    apiError.toLowerCase().includes("expired") ||
                    apiError.toLowerCase().includes("invalid") ||
                    apiError.toLowerCase().includes("used")
                ) {
                    setShowRedirectOption(true);
                }
                return;
            }

            // Password updated successfully
            showToast("Password updated successfully!", "success");
            setIsSuccess(true);

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = "https://crm.erpnext.ai/app/";
            }, 1500);
        } catch (error: any) {
            // ❌ ONLY REAL ERRORS COME HERE (network errors, etc.)
            if (axios.isAxiosError(error)) {
                const apiError =
                    error.response?.data?.message?.error ||
                    error.response?.data?.message ||
                    "Failed to update password. Please try again.";

                showToast(apiError, "error");

                // Show redirect option for expired/invalid links
                if (
                    apiError.toLowerCase().includes("expired") ||
                    apiError.toLowerCase().includes("invalid") ||
                    apiError.toLowerCase().includes("used")
                ) {
                    setShowRedirectOption(true);
                }
            } else {
                showToast("Something went wrong. Please try again.", "error");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleRedirectToForgotPassword = () => {
        navigate("/ForgotPassword");
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-[#2A2352] to-black flex items-center justify-center p-4">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={hideToast}
                />

                <div className="w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-xl font-medium text-white mb-2">Password Updated</h1>
                            <p className="text-gray-300 text-sm">Success! You are good to go 👍</p>
                        </div>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#2A2352] to-black flex items-center justify-center p-4 sm:p-6">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            <div className="w-full max-w-md mx-auto">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2">
                        <img
                            src="/app/assets/images/Erpnextlogo.png"
                            alt="ERPNext.ai"
                            className="w-[300px] filter invert brightness-0 saturate-100 sepia hue-rotate-[90deg] contrast-125"
                        />
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-[1.7rem] font-[600] text-white mb-2">
                            {isFromActivation ? "Set Your Password" : "Reset Password"}
                        </h1>
                        <p className="text-gray-300 text-sm">
                            {isFromActivation
                                ? "Create a new password for your account."
                                : "Enter your new password below."}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* New Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                New Password123
                            </label>
                            <div className="relative border border-white rounded-lg">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-12 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-gray-300 focus:outline-none"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {password && (
                                <div className="mt-3 space-y-1">
                                    {Object.entries(rules).map(([key, rule]) => (
                                        <div key={key} className={`text-xs flex items-center gap-2 ${rule.test(password) ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {rule.test(password) ? (
                                                <CheckCircle className="w-3 h-3" />
                                            ) : (
                                                <div className="w-3 h-3 border border-current rounded-full" />
                                            )}
                                            <span>{rule.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Confirm Password
                            </label>
                            <div className="relative border border-white rounded-lg">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-4 pr-12 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-gray-300 focus:outline-none"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmPassword && (
                                <div className={`mt-2 text-xs flex items-center gap-2 ${isConfirmValid ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {isConfirmValid ? (
                                        <CheckCircle className="w-3 h-3" />
                                    ) : (
                                        <X className="w-3 h-3" />
                                    )}
                                    <span>{isConfirmValid ? 'Passwords match' : 'Passwords do not match'}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || loading}
                            className={`w-full py-3 rounded-lg font-medium transition-colors ${canSubmit && !loading
                                ? 'bg-white text-[#2D243C] hover:bg-gray-200'
                                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                } flex items-center justify-center`}
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            {loading ? "Updating..." : "Reset Password"}
                        </button>

                        {/* Additional redirect option at the bottom */}
                        {showRedirectOption && (
                            <div className="text-center pt-4 border-t border-gray-600">
                                <button
                                    onClick={handleRedirectToForgotPassword}
                                    className="flex items-center justify-center gap-2 text-white hover:text-gray-300 font-medium text-sm transition-colors group mx-auto"
                                >
                                    Need a new reset link? Click here
                                    {/* <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" /> */}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}