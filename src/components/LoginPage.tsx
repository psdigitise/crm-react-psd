import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2, CheckCircle, X } from 'lucide-react';
import { setUserSession } from '../utils/session';
import { FiPhone } from 'react-icons/fi';
import axios from 'axios';
import { apiAxios, AUTH_TOKEN } from '../api/apiUrl';
import { CrmSetupModal } from './LoginPopups/CrmSetupModal';

interface LoginPageProps {
  onLogin: () => void;
}

interface LoginResponse {
  message: {
    success_key: number;
    message: string;
    sid?: string;
    api_key?: string | null;
    api_secret?: string | null;
    username?: string;
    email?: string;
    company?: string | null;
    warning?: string;
    full_name?: string;
  };
}

interface RegisterData {
  email: string;
  first_name: string;
  company: string;
  role_profile_name: string;
  new_password: string;
}

interface CompanyData {
  company_logo: File | null;
  start_date: string;
  company_name: string;
  no_employees: string;
}

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
        type === 'success' 
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
          className={`ml-2 ${
            type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function getTodayISODate() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // "2025-07-22"
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState("");
  // Add state for the phone number
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    first_name: '',
    company: '',
    role_profile_name: 'Only If Create',
    new_password: ''
  });

  // Company form state
  const [companyData, setCompanyData] = useState<CompanyData>({
    company_logo: null,
    start_date: getTodayISODate(),
    company_name: '',
    no_employees: ''
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

  const validatePassword = (password: string) => {
    const capitalRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (!capitalRegex.test(password)) {
      return "Password must contain at least one capital letter.";
    }
    if (!numberRegex.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    return "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('usr', email);
      formData.append('pwd', password);

      const response = await fetch('http://103.214.132.20:8002/api/method/customcrm.api.login', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          Authorization: 'token 1b670b800ace83b:f32066fea74d0fe',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: LoginResponse = await response.json();

      if (result.message && result.message.success_key === 1) {
        const sessionData = {
          company: result.message.company || '',
          username: result.message.username || '',
          email: result.message.email || email,
          full_name: result.message.full_name || '',
          sid: result.message.sid || '',
          api_key: result.message.api_key || '',
          api_secret: result.message.api_secret || ''
        };

        setUserSession(sessionData);
        onLogin();
      } else {
        const errorMessage = result.message?.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (error instanceof Error) {
        setError(`Connection error: ${error.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!registerData.email || !registerData.first_name || !companyData.company_name || !companyData.no_employees) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ First validate that company name is unique
      const checkCompanyResponse = await fetch(
        `http://103.214.132.20:8002/api/v2/document/Company?filters=[["name","=","${companyData.company_name}"]]`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_TOKEN,
          },
        }
      );

      if (checkCompanyResponse.ok) {
        const existingCompanies = await checkCompanyResponse.json();
        if (existingCompanies.data && existingCompanies.data.length > 0) {
          throw new Error("This company name is already registered, Kindly choose another name.");
        }
      }

      // 2️⃣ Validate that email doesn't exist
      const checkUserResponse = await fetch(
        `http://103.214.132.20:8002/api/v2/document/User?filters=[["email","=","${registerData.email}"]]`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_TOKEN,
          },
        }
      );

      if (checkUserResponse.ok) {
        const existingUsers = await checkUserResponse.json();
        if (existingUsers.data && existingUsers.data.length > 0) {
          throw new Error("This email address is already registered, Please use a different email address.");
        }
      }

      // 3️⃣ Create company
      const companyPayload = {
        company_name: companyData.company_name,
        email_id: registerData.email,
        no_employees: companyData.no_employees,
      };

      const companyResponse = await fetch(
        "http://103.214.132.20:8002/api/v2/document/Company/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_TOKEN,
          },
          body: JSON.stringify(companyPayload),
        }
      );

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create company: ${companyResponse.status}`);
      }

      const companyResult = await companyResponse.json();
      console.log("Company created:", companyResult);

      // 4️⃣ Create user
      const userDoc = {
        doctype: "User",
        email: registerData.email,
        first_name: registerData.first_name,
        role_profile_name: registerData.role_profile_name,
        company: companyData.company_name,
        phone: phoneNumber,
        enabled: 1,
        user_type: "System User",
      };

      const userResponse = await apiAxios.post(
        "/api/method/frappe.client.save",
        { doc: userDoc },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_TOKEN,
          },
        }
      );

      if (!userResponse.data || !userResponse.data.message) {
        // If user creation fails, delete the company
        try {
          await fetch(
            `http://103.214.132.20:8002/api/v2/document/Company/${encodeURIComponent(companyData.company_name)}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: AUTH_TOKEN,
              },
            }
          );
        } catch (rollbackError) {
          console.error("Failed to rollback company creation:", rollbackError);
        }
        throw new Error("User creation failed: No response message");
      }

      // ✅ Success - setup session and show toast
      const sessionData = {
        full_name: registerData.first_name,
        email: registerData.email,
        phone: phoneNumber,
        username: registerData.email,
        company: companyData.company_name,
        sid: "",
        api_key: "",
        api_secret: "",
      };

      // Reset forms
      const userEmail = registerData.email;
      const userName = registerData.first_name;
      
      setRegisterData({
        email: "",
        first_name: "",
        company: "",
        role_profile_name: "Only If Create",
        new_password: "",
      });
      setCompanyData({
        company_logo: null,
        start_date: getTodayISODate(),
        company_name: "",
        no_employees: "",
      });

      setEmail(userEmail);
      setIsRegisterMode(false);
      setError("");

      // Show success toast
      showToast(
        `Your account has been successfully created. You will receive an activation email at your registered email address.`,
        'success'
      );

    } catch (error) {
      let errorMessage = "Registration failed";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || "Registration failed";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      showToast(errorMessage, 'error');

    } finally {
      setLoading(false);
    }
  };

  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));

    if (field === 'new_password') {
      const error = validatePassword(value);
      setPasswordError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundImage: "url(../../public/assets/images/bg-circle.png)", backgroundRepeat: "no-repeat", backgroundSize: "cover" }}>
      {/* Toast Component */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 ">
            <img src="../../public/assets/images/Erpnextlogo.png" alt="" className={`w-[300px] h-100`} />
            {/* <span className="text-2xl font-bold">
              <span className="text-blue-600">PS</span>
              <span className="text-green-500">Digitise</span>
            </span> */}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/100 rounded-xl shadow-md border border-gray-300 p-8">
          {isRegisterMode ? (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-6">
              <h1 className="text-[1.7rem] text-center font-[600] text-gray-900">
                Create Account
              </h1>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-gray-400 rounded-lg">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={registerData.first_name}
                    onChange={(e) => handleRegisterInputChange('first_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-black !placeholder-gray-500 focus:outline-none"
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-gray-400 rounded-lg">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-black !placeholder-gray-500 focus:outline-none"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-gray-400 rounded-lg">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-black !placeholder-gray-500 focus:outline-none"
                    placeholder="Enter phone number"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-gray-400 rounded-lg">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={companyData.company_name}
                    onChange={(e) =>
                      setCompanyData((prev) => ({ ...prev, company_name: e.target.value }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-black !placeholder-gray-500 focus:outline-none"
                    placeholder="Your Company"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* No. of Employees Field */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  No. of Employees <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-gray-400 rounded-lg">
                  <input
                    type="number"
                    value={companyData.no_employees || ""}
                    onChange={(e) =>
                      setCompanyData((prev) => ({
                        ...prev,
                        no_employees: e.target.value,
                      }))
                    }
                    className="w-full pl-4 pr-4 py-3 border border-white rounded-lg bg-transparent text-black !placeholder-gray-500 focus:outline-none"
                    placeholder="50"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!passwordError}
                className="w-full bg-gradient-to-r from-[#35bce7] to-[#082a87] text-[#ffffff] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Switch to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError('');
                  }}
                  className="text-md font-medium text-black"
                  disabled={loading}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              <h1 className="text-[1.7rem] text-center font-[600] text-gray-900">
                Login to ERPNext.ai
              </h1>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-md font-medium text-black mb-1">
                  Email Address
                </label>
                <div className="relative border border-gray-400 rounded-lg">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white !placeholder-shown:font-[20px] rounded-lg bg-transparent text-black !placeholder-gray-500 focus:outline-none"
                    placeholder="Enter Email Address"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-md font-medium text-black mb-1">
                  Password
                </label>
                <div className="relative border border-gray-400 rounded-lg">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-black !placeholder-gray-500 focus:outline-none"
                    placeholder="••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-md font-medium text-black"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full items-center bg-gradient-to-r from-[#35bce7] to-[#082a87] text-[#ffffff] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {loading ? (
                  <>
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError('');
                }}
                className="w-full bg-white border border-[#35bce7] text-[#35bce7] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                Create New Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}