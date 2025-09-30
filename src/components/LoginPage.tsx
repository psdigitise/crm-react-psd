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
  
  // Login form validation states
  const [emailError, setEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  
  // Add state for the phone number
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

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

  // Register form validation states
  const [registerEmailError, setRegisterEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [employeesError, setEmployeesError] = useState('');

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

  // Login form validation functions
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

  const validateLoginPassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone) {
      return "Phone number is required";
    }
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  // Register form validation functions
  const validateFirstName = (firstName: string) => {
    if (!firstName) {
      return "Full name is required";
    }
    if (firstName.length < 2) {
      return "Full name must be at least 2 characters long";
    }
    return "";
  };

  const validateCompanyName = (companyName: string) => {
    if (!companyName) {
      return "Company name is required";
    }
    if (companyName.length < 2) {
      return "Company name must be at least 2 characters long";
    }
    return "";
  };

  const validateEmployees = (employees: string) => {
    if (!employees) {
      return "Number of employees is required";
    }
    const num = parseInt(employees);
    if (isNaN(num) || num < 1) {
      return "Please enter a valid number of employees";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
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

  // Login input change handlers with validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setLoginPasswordError(validateLoginPassword(value));
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneError(validatePhone(value));
  };

  // Register input change handlers with validation
  const handleFirstNameChange = (value: string) => {
    setRegisterData(prev => ({ ...prev, first_name: value }));
    setFirstNameError(validateFirstName(value));
  };

  const handleRegisterEmailChange = (value: string) => {
    setRegisterData(prev => ({ ...prev, email: value }));
    setRegisterEmailError(validateEmail(value));
  };

  const handleCompanyNameChange = (value: string) => {
    setCompanyData(prev => ({ ...prev, company_name: value }));
    setCompanyNameError(validateCompanyName(value));
  };

  const handleEmployeesChange = (value: string) => {
    setCompanyData(prev => ({ ...prev, no_employees: value }));
    setEmployeesError(validateEmployees(value));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const emailValidation = validateEmail(email);
    const passwordValidation = validateLoginPassword(password);
    
    setEmailError(emailValidation);
    setLoginPasswordError(passwordValidation);
    
    if (emailValidation || passwordValidation) {
      return; // Don't submit if validation fails
    }
    
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
          Authorization: AUTH_TOKEN,
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
    
    // Validate all fields before submission
    const firstNameValidation = validateFirstName(registerData.first_name);
    const emailValidation = validateEmail(registerData.email);
    const phoneValidation = validatePhone(phoneNumber);
    const companyNameValidation = validateCompanyName(companyData.company_name);
    const employeesValidation = validateEmployees(companyData.no_employees);
    
    setFirstNameError(firstNameValidation);
    setRegisterEmailError(emailValidation);
    setPhoneError(phoneValidation);
    setCompanyNameError(companyNameValidation);
    setEmployeesError(employeesValidation);
    
    if (firstNameValidation || emailValidation || phoneValidation || companyNameValidation || employeesValidation) {
      // setError("Please fix the validation errors Below");
      return;
    }
    
    setLoading(true);
    setError("");

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
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2A2352] to-black flex items-center justify-center px-4">
      {/* Toast Component */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 ">
              <img src="../../public/assets/images/Erpnextlogo.png" alt="" className={`w-[300px] h-100 filter invert brightness-0 saturate-100 sepia hue-rotate-[90deg] contrast-125`} />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 p-8">
          {isRegisterMode ? (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-6">
              <h1 className="text-[1.7rem] text-center font-[600] text-white">
                Create Account
              </h1>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={registerData.first_name}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="John"
                    disabled={loading}
                  />
                </div>
                {firstNameError && (
                  <p className="text-red-400 text-sm mt-1">{firstNameError}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => handleRegisterEmailChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
                {registerEmailError && (
                  <p className="text-red-400 text-sm mt-1">{registerEmailError}</p>
                )}
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </div>
                {phoneError && (
                  <p className="text-red-400 text-sm mt-1">{phoneError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={companyData.company_name}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="Your Company"
                    disabled={loading}
                  />
                </div>
                {companyNameError && (
                  <p className="text-red-400 text-sm mt-1">{companyNameError}</p>
                )}
              </div>

              {/* No. of Employees Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  No. of Employees <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <input
                    type="number"
                    value={companyData.no_employees || ""}
                    onChange={(e) => handleEmployeesChange(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="50"
                    disabled={loading}
                  />
                </div>
                {employeesError && (
                  <p className="text-red-400 text-sm mt-1">{employeesError}</p>
                )}
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
              <h1 className="text-[1.7rem] text-center font-[600] text-white">
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
                <label className="block text-sm font-medium text-white mb-1">
                  Email Address
                </label>
                <div className="relative border border-white rounded-lg">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="Enter Email Address"
                    disabled={loading}
                  />
                </div>
                {emailError && (
                  <p className="text-red-400 text-sm mt-1">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Password
                </label>
                <div className="relative border border-white rounded-lg">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="••••••"
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
                {loginPasswordError && (
                  <p className="text-red-400 text-sm mt-1">{loginPasswordError}</p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
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
                  <span className="px-2 bg-transparent text-white">or</span>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError('');
                }}
                className="w-full bg-white border border-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
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