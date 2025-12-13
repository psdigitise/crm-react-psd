import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2, CheckCircle, X } from 'lucide-react';
import { setUserSession } from '../utils/session';
import { FiPhone } from 'react-icons/fi';
import axios from 'axios';
import { apiAxios, AUTH_TOKEN } from '../api/apiUrl';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

interface LoginPageProps {
  onLogin: () => void;
}

interface LoginResponse {
  full_name: string;
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
    role_profile?: string;
  };
}

interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
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
      }, 5000);

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

interface GoogleSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: (userData: any) => void;
  userData: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company?: string;
    no_employees?: string;
  };
  onUserDataChange: (userData: any) => void;
}

const GoogleSignupModal: React.FC<GoogleSignupModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  userData,
  onUserDataChange
}) => {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    no_employees: ''
  });

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'first_name':
        return !value ? 'First name is required' : value.length < 2 ? 'First name must be at least 2 characters' : '';
      case 'last_name':
        return !value ? 'Last name is required' : value.length < 2 ? 'Last name must be at least 2 characters' : '';
      case 'phone':
        return !value ? 'Phone number is required' : '';
      case 'company':
        return !value ? 'Company name is required' : value.length < 2 ? 'Company name must be at least 2 characters' : '';
      case 'no_employees':
        return !value ? 'Number of employees is required' : !/^\d+$/.test(value) ? 'Please enter a valid number' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    onUserDataChange({ ...userData, [field]: value });

    const error = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = () => {
    return (
      userData.first_name &&
      userData.last_name &&
      userData.phone &&
      userData.company &&
      userData.no_employees &&
      agreeToTerms &&
      !Object.values(formErrors).some(error => error)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Complete Your Sign Up</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <p>
              Please complete your profile to create an account for
              <span className="font-medium"> {userData.email}</span>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter first name"
                />
                {formErrors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
                />
                {formErrors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter mobile number"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter company name"
                />
                {formErrors.company && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.company}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. of Employees <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userData.no_employees || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    handleInputChange('no_employees', value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter number of employees"
              />
              {formErrors.no_employees && (
                <p className="text-red-500 text-xs mt-1">{formErrors.no_employees}</p>
              )}
            </div>

            <div className="flex items-start space-x-3 pt-4">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms-agreement" className="text-sm">
                I agree to the Terms of service and Privacy policies of erpnext.ai
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onAgree(userData)}
              disabled={!isFormValid()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getTodayISODate() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const [showGoogleSignupModal, setShowGoogleSignupModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '+93',
    company: '',
    no_employees: ''
  });

  const [emailError, setEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    role_profile_name: 'Only If Create',
    new_password: ''
  });

  const [registerEmailError, setRegisterEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [employeesError, setEmployeesError] = useState('');

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

  // const checkUserExists = async (email: string) => {
  //   try {
  //     const response = await fetch(
  //       "https://api.erpnext.ai/api/method/customcrm.google_auth.check_user_exists",
  //       {
  //         method: "POST",
  //         credentials: 'include',
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ email }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     return data.message && data.message.exists === true;
  //   } catch (error) {
  //     console.error("Error checking user existence:", error);
  //     return false;
  //   }
  // };

  const checkUserExists = async (token: string) => {
    try {
      const response = await axios.get(
        "https://api.erpnext.ai/api/method/customcrm.google_auth.check_user_exists",
        {
          params: { token }, // sends ?token=xxxx
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data?.message?.exists === true;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };


  const extractUserInfoFromToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      return {
        email: payload.email,
        first_name: payload.given_name || payload.name?.split(' ')[0] || 'User',
        last_name: payload.family_name || payload.name?.split(' ')[1] || '',
        phone: '+93',
        company: '',
        no_employees: ''
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return {
        email: '',
        first_name: 'User',
        last_name: '',
        phone: '+93',
        company: '',
        no_employees: ''
      };
    }
  };

  const createUserWithGoogle = async (userData: any, token: string) => {
    try {
      const response = await fetch(
        "https://api.erpnext.ai/api/method/customcrm.google_auth.create_user_with_google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            company: userData.company,
            no_employees: userData.no_employees
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.message && data.message.success_key === 1) {
        return data;
      } else {
        throw new Error(data.message?.message || "Account creation failed");
      }
    } catch (error) {
      console.error("Error creating user account:", error);
      throw error;
    }
  };

  // const handleGoogleLogin = async (credentialResponse: any) => {
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const token = credentialResponse.credential;

  //     if (!token) {
  //       throw new Error("No credential received from Google");
  //     }

  //     const userInfo = extractUserInfoFromToken(token);

  //     if (!userInfo.email) {
  //       throw new Error("Could not extract email from Google token");
  //     }

  //     const userExists = await checkUserExists(token);

  //     if (userExists) {
  //       const res = await fetch(
  //         "https://api.erpnext.ai/api/method/customcrm.google_auth.login_with_google",
  //         {
  //           method: "GET",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ token }),
  //         }
  //       );

  //       if (!res.ok) {
  //         throw new Error(`Google login failed: ${res.statusText}`);
  //       }

  //       const data = await res.json();

  //       if (data.message && data.message.success_key === 1) {
  //         const sessionData = {
  //           company: data.message.company || "",
  //           username: data.message.username || "",
  //           email: data.message.email || "",
  //           full_name: data.full_name || "",
  //           sid: data.message.sid || "",
  //           api_key: data.message.api_key || "",
  //           api_secret: data.message.api_secret || "",
  //           role_profile: data.message.role_profile || "",
  //         };

  //         setUserSession(sessionData);
  //         onLogin();
  //         showToast("Successfully logged in with Google!", 'success');
  //       } else {
  //         throw new Error(
  //           data.message?.message || "Google login failed. Please try again."
  //         );
  //       }
  //     } else {
  //       setGoogleUserData(userInfo);
  //       setShowGoogleSignupModal(true);
  //     }
  //   } catch (err: any) {
  //     setError(err.message || "An unexpected error occurred during Google login.");
  //     showToast(err.message || "An unexpected error occurred during Google login.", 'error');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleGoogleLogin = async (credentialResponse: any) => {
    setLoading(true);
    setError("");

    try {
      const token = credentialResponse.credential;

      if (!token) {
        throw new Error("No credential received from Google");
      }

      const userInfo = extractUserInfoFromToken(token);

      if (!userInfo.email) {
        throw new Error("Could not extract email from Google token");
      }

      // Store token AND credential response for later use
      localStorage.setItem('google_token', token);
      localStorage.setItem('google_credential', JSON.stringify(credentialResponse));

      // Check if user exists with token in params
      const checkResponse = await axios.get(
        "https://api.erpnext.ai/api/method/customcrm.google_auth.check_user_exists",
        {
          params: { token },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const checkData = checkResponse.data;
      const userExists = checkData?.message?.exists === true;

      if (userExists) {
        // User exists - proceed with simple login
        const loginRes = await axios.get(
          "https://api.erpnext.ai/api/method/customcrm.google_auth.login_with_google",
          {
            params: { token },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const loginData = loginRes.data;

        if (loginData.message && loginData.message.success_key === 1) {
          const sessionData = {
            company: loginData.message.company || "",
            username: loginData.message.username || "",
            email: loginData.message.email || "",
            full_name: loginData.full_name || "",
            sid: loginData.message.sid || "",
            api_key: loginData.message.api_key || "",
            api_secret: loginData.message.api_secret || "",
            role_profile: loginData.message.role_profile || "",
          };

          setUserSession(sessionData);
          // Clean up stored credentials after successful login
          localStorage.removeItem('google_token');
          localStorage.removeItem('google_credential');
          onLogin();
          showToast("Successfully logged in with Google!", "success");
          window.location.reload();
        } else {
          throw new Error(
            loginData.message?.message || "Google login failed. Please try again."
          );
        }
      } else {
        // User doesn't exist - show modal to collect additional info
        setGoogleUserData({
          email: checkData.message?.email || userInfo.email,
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          phone: '+93',
          company: '',
          no_employees: ''
        });
        setShowGoogleSignupModal(true);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred during Google login.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };


  // const handleGoogleAccountCreation = async (userData: any) => {
  //   setLoading(true);

  //   try {
  //     const token = localStorage.getItem('google_token');
  //     if (!token) {
  //       throw new Error("Google token not found");
  //     }

  //     const result = await createUserWithGoogle(userData, token);

  //     if (result.message.success_key === 1) {
  //       const sessionData = {
  //         company: result.message.company || "",
  //         username: result.message.username || "",
  //         email: result.message.email || "",
  //         full_name: result.full_name || "",
  //         sid: result.message.sid || "",
  //         api_key: result.message.api_key || "",
  //         api_secret: result.message.api_secret || "",
  //         role_profile: result.message.role_profile || "",
  //       };

  //       setUserSession(sessionData);
  //       setShowGoogleSignupModal(false);
  //       onLogin();
  //       showToast("Account created successfully!", 'success');
  //     } else {
  //       throw new Error(result.message?.message || "Failed to create account");
  //     }
  //   } catch (error: any) {
  //     setError(error.message || "Failed to create account");
  //     showToast(error.message || "Failed to create account", 'error');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleGoogleAccountCreation = async (userData: any) => {
    setLoading(true);

    try {
      // Retrieve the stored credential response
      const storedCredential = localStorage.getItem('google_credential');
      if (!storedCredential) {
        throw new Error("Google credential not found");
      }

      const credentialResponse = JSON.parse(storedCredential);
      const token = credentialResponse.credential;

      if (!token) {
        throw new Error("Google token not found");
      }

      // Call login API with user data as query parameters
      const loginRes = await axios.get(
        "https://api.erpnext.ai/api/method/customcrm.google_auth.login_with_google",
        {
          params: {
            token: token,
            redirect_to: 'dashboard',
            company: userData.company,
            first_name: userData.first_name,
            last_name: userData.last_name,
            mobile_no: userData.phone,
            no_of_emp: userData.no_employees
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const loginData = loginRes.data;

      if (loginData.message && loginData.message.success_key === 1) {
        const sessionData = {
          company: loginData.message.company || "",
          username: loginData.message.username || "",
          email: loginData.message.email || "",
          full_name: loginData.full_name || "",
          sid: loginData.message.sid || "",
          api_key: loginData.message.api_key || "",
          api_secret: loginData.message.api_secret || "",
          role_profile: loginData.message.role_profile || "",
        };

        setUserSession(sessionData);
        setShowGoogleSignupModal(false);
        // Clean up stored credentials
        localStorage.removeItem('google_token');
        localStorage.removeItem('google_credential');
        onLogin();
        showToast("Account created successfully!", 'success');
        window.location.reload();
      } else {
        throw new Error(loginData.message?.message || "Failed to create account");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to create account";
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleUserDataChange = (newUserData: any) => {
    setGoogleUserData(newUserData);
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

  const validateFirstName = (firstName: string) => {
    if (!firstName) {
      return "First name is required";
    }
    if (firstName.length < 2) {
      return "First name must be at least 2 characters long";
    }
    return "";
  };

  const validateLastName = (lastName: string) => {
    if (!lastName) {
      return "Last name is required";
    }
    if (lastName.length < 2) {
      return "Last name must be at least 2 characters long";
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

  const handleFirstNameChange = (value: string) => {
    setRegisterData(prev => ({ ...prev, first_name: value }));
    setFirstNameError(validateFirstName(value));
  };

  const handleLastNameChange = (value: string) => {
    setRegisterData(prev => ({ ...prev, last_name: value }));
    setLastNameError(validateLastName(value));
  };

  const handleRegisterEmailChange = (value: string) => {
    setRegisterData(prev => ({ ...prev, email: value }));
    setRegisterEmailError(validateEmail(value));
  };

  const handleCompanyNameChange = (value: string) => {
    setCompanyData(prev => ({ ...prev, company_name: value }));
    setCompanyNameError(validateCompanyName(value));
    setRegisterData(prev => ({ ...prev, company: value }));
  };

  const handleEmployeesChange = (value: string) => {
    setCompanyData(prev => ({ ...prev, no_employees: value }));
    setEmployeesError(validateEmployees(value));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = validateEmail(email);
    const passwordValidation = validateLoginPassword(password);

    setEmailError(emailValidation);
    setLoginPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('usr', email);
      formData.append('pwd', password);

      const response = await fetch('https://api.erpnext.ai/api/method/customcrm.api.login', {
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
          full_name: result.full_name || result.message.full_name || '',
          sid: result.message.sid || '',
          api_key: result.message.api_key || '',
          api_secret: result.message.api_secret || '',
          role_profile: result.message.role_profile || ''
        };

        setUserSession(sessionData);
        onLogin();
        showToast("Successfully logged in!", 'success');
      } else {
        const errorMessage = result.message?.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const errorMsg = 'Unable to connect to the server. Please check your internet connection and try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      } else if (error instanceof Error) {
        setError(`Connection error: ${error.message}`);
        showToast(`Connection error: ${error.message}`, 'error');
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstNameValidation = validateFirstName(registerData.first_name);
    const lastNameValidation = validateLastName(registerData.last_name);
    const emailValidation = validateEmail(registerData.email);
    const phoneValidation = validatePhone(phoneNumber);
    const companyNameValidation = validateCompanyName(companyData.company_name);
    const employeesValidation = validateEmployees(companyData.no_employees);

    setFirstNameError(firstNameValidation);
    setLastNameError(lastNameValidation);
    setRegisterEmailError(emailValidation);
    setPhoneError(phoneValidation);
    setCompanyNameError(companyNameValidation);
    setEmployeesError(employeesValidation);

    if (firstNameValidation || lastNameValidation || emailValidation || phoneValidation || companyNameValidation || employeesValidation) {
      showToast("Please fill all required fields correctly", 'error');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const registerPayload = {
        email: registerData.email,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        phone: phoneNumber,
        company: registerData.company,
        no_employees: companyData.no_employees,
        role_profile_name: registerData.role_profile_name,
        new_password: registerData.new_password || 'TempPassword123!'
      };

      const response = await fetch('https://api.erpnext.ai/api/method/customcrm.api.register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: AUTH_TOKEN,
        },
        body: JSON.stringify(registerPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.message && result.message.success_key === 1) {
        showToast("Account created successfully! Please check your email for verification.", 'success');
        setIsRegisterMode(false);
        setRegisterData({
          email: '',
          first_name: '',
          last_name: '',
          company: '',
          role_profile_name: 'Only If Create',
          new_password: ''
        });
        setCompanyData({
          company_logo: null,
          start_date: getTodayISODate(),
          company_name: '',
          no_employees: ''
        });
        setPhoneNumber('');
      } else {
        throw new Error(result.message?.message || "Registration failed");
      }
    } catch (error: any) {
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
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <GoogleSignupModal
        isOpen={showGoogleSignupModal}
        onClose={() => setShowGoogleSignupModal(false)}
        onAgree={handleGoogleAccountCreation}
        userData={googleUserData}
        onUserDataChange={handleGoogleUserDataChange}
      />

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 ">
              <img
                src="/app/assets/images/Erpnextlogo.png"
                alt="Erpnext Logo"
                className="w-[300px] h-100 filter invert brightness-0 saturate-100 sepia hue-rotate-[90deg] contrast-125"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 p-8">
          {isRegisterMode ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <h1 className="text-[1.7rem] text-center font-[600] text-white">
                Create Account
              </h1>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  First Name <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={registerData.last_name}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="Doe"
                    disabled={loading}
                  />
                </div>
                {lastNameError && (
                  <p className="text-red-400 text-sm mt-1">{lastNameError}</p>
                )}
              </div>

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

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  No. of Employees <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <input
                    type="text"
                    value={companyData.no_employees || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        handleEmployeesChange(value);
                      }
                    }}
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
                disabled={loading}
                className="w-full bg-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-left mb-4">
                <h1 className="text-3xl font-bold text-white">Sign in</h1>
                <p className="text-sm text-gray-300 mt-1 italic">to access CRM</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

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

              <div className="text-right">
                <button
                  type="button"
                  className="text-md font-medium text-white hover:underline"
                  disabled={loading}
                  onClick={() => navigate("/ForgotPassword")}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white">or</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    console.log("Google Login Failed");
                    showToast("Google login failed. Please try again.", 'error');
                  }}
                />
              </div>

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