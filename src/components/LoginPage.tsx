import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';
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
  no_employees:string;
}

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
    no_employees:''
  });
  const [showCrmModal, setShowCrmModal] = useState(false); // Add state for modal

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
      // 1️⃣ First call Company API
      const companyPayload = {
        company_name: companyData.company_name,
        email_id: registerData.email, // use register email
        no_employees: companyData.no_employees, // take from a state
      };

      const companyResponse = await fetch(
        "http://103.214.132.20:8002/api/v2/document/Company/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_TOKEN, // include token if required
          },
          body: JSON.stringify(companyPayload),
        }
      );

      if (!companyResponse.ok) {
        throw new Error("Failed to create company");
      }

      const companyResult = await companyResponse.json();
      console.log("Company created:", companyResult);

      // 2️⃣ Now create User using frappe.client.save
      const userDoc = {
        doctype: "User",
        email: registerData.email,
        first_name: registerData.first_name,
        role_profile_name: registerData.role_profile_name,
        company: companyData.company_name, // link company name
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

      if (userResponse.data && userResponse.data.message) {
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

        setUserSession(sessionData);
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
          no_employees:"",
        });
        setEmail(registerData.email);
        setIsRegisterMode(false);
        setError("");
        onLogin();
        setShowCrmModal(true);
      } else {
        throw new Error("Registration failed: No response message");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
          error.message ||
          "Registration failed"
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred during registration.");
      }
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

  const handleCrmSetupComplete = () => {
    // Close the modal and proceed to the main app
    setShowCrmModal(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2A2352] to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-blue-600">PS</span>
              <span className="text-green-500">Digitise</span>
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isRegisterMode ? 'Create Account' : 'Login to PSDigitise'}
          </h1>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 p-8">
          {isRegisterMode ? (
            /* Register Form */
            // <form onSubmit={handleRegister} className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={registerData.first_name}
                    onChange={(e) => handleRegisterInputChange('first_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>
              </div>


              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                    // className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Phone icon instead of lock */}
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="Enter phone number"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={companyData.company_name}
                    onChange={(e) =>
                      setCompanyData((prev) => ({ ...prev, company_name: e.target.value }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="Your Company"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* No. of Employees Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  No. of Employees <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={companyData.no_employees || ""}
                    onChange={(e) =>
                      setCompanyData((prev) => ({
                        ...prev,
                        no_employees: e.target.value,
                      }))
                    }
                    className="w-full pl-4 pr-4 py-3 border border-white rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="50"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!passwordError}
                className="w-full bg-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
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
                  className="text-sm text-white"
                  disabled={loading}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder=""
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
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

              {/* Company Name Field */}



              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-white"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"

              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
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
                className="w-full bg-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                Create New Account
              </button>
            </form>
          )}
        </div>
      </div>
      <CrmSetupModal
        isOpen={showCrmModal}
        onClose={handleCrmSetupComplete}
      />
    </div>
  );
}