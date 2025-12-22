import { useState } from "react";
import { Mail, CheckCircle, X, ArrowLeft } from "lucide-react";
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
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                {type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                    <X className="w-5 h-5 text-red-600" />
                )}
                <p className="text-sm font-medium max-w-sm">{message}</p>
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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Toast state
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error'
    });

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

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return "Email is required";
        }
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailValidation = validateEmail(email);
        if (emailValidation) {
            setError(emailValidation);
            showToast(emailValidation, 'error');
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Prepare form data for password reset request
            const formData = new FormData();
            formData.append('cmd', 'frappe.core.doctype.user.user.reset_password');
            formData.append('user', email);

            // Make API call using Axios
            const response = await axios.post('https://api.erpnext.ai/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setIsSuccess(true);
                showToast("Password reset instructions have been sent to your email!", 'success');
            } else {
                setIsSuccess(true); // Still show success for security reasons
                showToast("If an account exists with this email, reset instructions have been sent.", 'success');
            }

        } catch (error: any) {
            let errorMessage = "Failed to send reset email. Please try again.";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Handle 404 response with "not found" message
                    if (error.response.status === 404 && error.response.data?.message === "not found") {
                        errorMessage = "No account found with this email address.";
                    }
                    // Check for nested error messages in different formats
                    else if (error.response.data?.message?.error) {
                        const apiError = error.response.data.message.error;

                        if (apiError === "Not a valid system user") {
                            errorMessage = "No account found with this email address.";
                        } else if (apiError) {
                            errorMessage = apiError;
                        }
                    }
                    // Direct message check
                    else if (error.response.data?.message) {
                        const apiMessage = error.response.data.message;

                        if (apiMessage === "not found" || apiMessage === "Not a valid system user") {
                            errorMessage = "No account found with this email address.";
                        } else if (apiMessage) {
                            errorMessage = apiMessage;
                        }
                    }
                    // Generic server error
                    else if (error.response.status >= 400) {
                        errorMessage = `Error: ${error.response.status}. Please try again.`;
                    }
                } else if (error.request) {
                    errorMessage = "No response from server. Please check your connection.";
                }
            } else {
                errorMessage = error instanceof Error ? error.message : errorMessage;
            }

            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
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
                            <h1 className="text-xl font-medium text-white mb-2">Check Your Email</h1>
                            <p className="text-gray-300 text-sm mb-4">
                                We've sent password reset instructions to your email. The reset link will <span className="text-yellow-300 font-medium">expire in 20 minutes</span>
                            </p>
                            <p className="text-white font-medium">{email}</p>
                        </div>

                        <div className="space-y-3">
                            <button
                               onClick={() => navigate("/")}
                                className="w-full bg-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Back to Login
                            </button>
                            {/* <button
                                onClick={() => {
                                    setIsSuccess(false);
                                    setEmail("");
                                    setError("");
                                }}
                                className="w-full bg-transparent border border-white text-white py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
                            >
                                Try Another Email
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#2A2352] to-black flex items-center justify-center p-4">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2">
                        <img
                            src="../../app/public/assets/images/Erpnextlogo.png"
                            alt="ERPNext.ai"
                            className="w-[300px] mb-2 "
                        />
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 p-8">

                    <div className="text-center mb-8">
                        <h1 className="text-[1.7rem] font-[600] text-white mb-2">Forgot Password</h1>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Email Address
                            </label>
                            <div className="relative border border-white rounded-lg">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white !placeholder-gray-400 focus:outline-none"
                                    placeholder="your@email.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className={`w-full py-3 rounded-lg font-medium transition-colors ${!loading && email
                                ? 'bg-white text-[#2D243C] hover:bg-gray-100'
                                : 'bg-gray-200 text-black cursor-not-allowed'
                                }`}
                        >
                            {loading ? "Sending Instructions..." : "Send Reset Instructions"}
                        </button>
                       
                        <div className="flex justify-center mt-4">
                            <button
                               onClick={() => navigate("/")}
                                className="flex items-center gap-2 text-white mb-6 hover:text-gray-300 transition-colors hover:underline"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}