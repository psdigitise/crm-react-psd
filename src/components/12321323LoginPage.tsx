import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  Building2,
  CheckCircle,
  X
} from 'lucide-react';
import { setUserSession } from '../utils/session';
import { FiPhone } from 'react-icons/fi';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FaFacebook } from 'react-icons/fa';
import { apiAxios } from '../api/apiUrl';

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
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
          }`}
      >
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <X className="w-5 h-5 text-red-600" />
        )}
        <p className="text-sm font-medium max-w-sm">{message}</p>
        <button
          onClick={onClose}
          className={`ml-2 ${type === 'success'
              ? 'text-green-600 hover:text-green-800'
              : 'text-red-600 hover:text-red-800'
            }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ---------- Google Signup Modal ---------- */

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
        return !value
          ? 'First name is required'
          : value.length < 2
            ? 'First name must be at least 2 characters'
            : '';
      case 'last_name':
        return !value
          ? 'Last name is required'
          : value.length < 2
            ? 'Last name must be at least 2 characters'
            : '';
      case 'phone':
        return !value ? 'Phone number is required' : '';
      case 'company':
        return !value
          ? 'Company name is required'
          : value.length < 2
            ? 'Company name must be at least 2 characters'
            : '';
      case 'no_employees':
        return !value
          ? 'Number of employees is required'
          : !/^\d+$/.test(value)
            ? 'Please enter a valid number'
            : '';
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
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
                  onChange={e => handleInputChange('first_name', e.target.value)}
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
                  onChange={e => handleInputChange('last_name', e.target.value)}
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
                  onChange={e => handleInputChange('phone', e.target.value)}
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
                  onChange={e => handleInputChange('company', e.target.value)}
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
                value={userData.no_employees || ''}
                onChange={e => {
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
                onChange={e => setAgreeToTerms(e.target.checked)}
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

/* ---------- Helpers ---------- */

function getTodayISODate() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}


const CustomGoogleLoginButton: React.FC<{
  onSuccess: (response: any) => void;
  onError: () => void;
}> = ({ onSuccess, onError }) => {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isGoogleButtonReady, setIsGoogleButtonReady] = useState(false);

  // Create a ref to store the GoogleLogin instance
  const googleLoginRef = useRef<any>(null);

  useEffect(() => {
    // Check for Google button periodically until it's ready
    const checkGoogleButton = () => {
      if (buttonContainerRef.current) {
        const googleButton = buttonContainerRef.current.querySelector('[role="button"]');
        if (googleButton) {
          // Hide all text spans
          const spans = googleButton.querySelectorAll('span');
          spans.forEach(span => {
            span.style.display = 'none';
            span.style.visibility = 'hidden';
            span.style.opacity = '0';
            span.style.width = '0';
            span.style.height = '0';
            span.style.overflow = 'hidden';
          });
          
          // Force button dimensions
          (googleButton as HTMLElement).style.width = '48px';
          (googleButton as HTMLElement).style.height = '48px';
          (googleButton as HTMLElement).style.borderRadius = '50%';
          (googleButton as HTMLElement).style.padding = '0';
          (googleButton as HTMLElement).style.minWidth = '48px';
          (googleButton as HTMLElement).style.overflow = 'hidden';
          
          setIsGoogleButtonReady(true);
          return true;
        }
      }
      return false;
    };

    // Try multiple times with increasing delays
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryToFindButton = () => {
      if (attempts >= maxAttempts) return;
      
      if (checkGoogleButton()) {
        return;
      }
      
      attempts++;
      setTimeout(tryToFindButton, 100 * attempts);
    };

    // Start checking
    tryToFindButton();

    // Also try on mount
    const immediateTimer = setTimeout(() => {
      if (!isGoogleButtonReady) {
        checkGoogleButton();
      }
    }, 500);

    return () => {
      clearTimeout(immediateTimer);
    };
  }, []);

  const handleCustomIconClick = () => {
    // Try multiple ways to trigger the Google login
    if (buttonContainerRef.current) {
      const googleButton = buttonContainerRef.current.querySelector('[role="button"]') as HTMLElement;
      
      if (googleButton) {
        // Method 1: Direct click
        googleButton.click();
        
        // Method 2: Dispatch click event
        setTimeout(() => {
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          googleButton.dispatchEvent(clickEvent);
        }, 10);
        
        // Method 3: Try focusing and pressing Enter
        setTimeout(() => {
          googleButton.focus();
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            bubbles: true
          });
          googleButton.dispatchEvent(enterEvent);
        }, 20);
      } else {
        // If button not found, try to trigger Google's script directly
        console.warn('Google button not found, attempting alternative method');
        
        // Look for Google's global callback
        if (window.google && (window.google as any).accounts && (window.google as any).accounts.id) {
          // Try to trigger the one-tap or button prompt
          try {
            (window.google as any).accounts.id.prompt();
          } catch (e) {
            console.error('Failed to trigger Google login:', e);
            onError();
          }
        } else {
          console.error('Google auth not loaded');
          onError();
        }
      }
    }
  };

  // Alternative approach: Use Google's custom button render
  const handleGoogleLoginMount = (ref: any) => {
    googleLoginRef.current = ref;
  };

  return (
    <div className="relative">
      {/* Custom Google Icon Button */}
      <div 
        className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-200"
        onClick={handleCustomIconClick}
        aria-label="Sign in with Google"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCustomIconClick();
          }
        }}
      >
        {/* Google Icon SVG */}
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      </div>

      {/* Hidden Google Login Button - ALWAYS VISIBLE but hidden visually */}
      <div 
        ref={buttonContainerRef} 
        className="absolute inset-0 w-12 h-12 overflow-hidden"
        style={{
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1
        }}
      >
        <GoogleLogin 
          onSuccess={onSuccess}
          onError={onError}
          size="large"
          width="48"
          theme="filled_blue"
          shape="circle"
          text="continue_with"
          useOneTap={false}
          logo_alignment="center"
          type="icon"
          // Use the ux_mode prop for better control
          ux_mode="popup"
          // Ensure it's always rendered
          isSignedIn={false}
          auto_select={false}
        />
      </div>
    </div>
  );
};



const CustomFacebookLoginButton: React.FC<{
  onSuccess: (response: any) => void;
  onError: (error: string) => void;
  loading: boolean;
}> = ({ onSuccess, onError, loading }) => {
  const handleFacebookLogin = async () => {
    try {
      // Load Facebook SDK if not already loaded
      if (!window.FB) {
        await loadFacebookSDK();
        await initializeFacebookSDK();
      }

      window.FB.login((response: any) => {
        if (response.authResponse) {
          onSuccess(response);
        } else {
          onError('Facebook login was cancelled.');
        }
      }, { scope: 'public_profile,email' });
    } catch (error) {
      onError('Failed to initialize Facebook login.');
    }
  };

  const loadFacebookSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.FB) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
      document.body.appendChild(script);
    });
  };

  const initializeFacebookSDK = () => {
    return new Promise((resolve) => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: '1367001254781663',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        resolve(true);
      };
    });
  };

  return (
    <button
      type="button"
      onClick={handleFacebookLogin}
      disabled={loading}
      className=" flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      title="Continue with Facebook"
    >
      <FaFacebook className="w-12 h-12" />
    </button>
  );
};

// Extend Window interface to include FB
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

/* ---------- Main Component ---------- */

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // Google signup modal state
  const [showGoogleSignupModal, setShowGoogleSignupModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '+91',
    company: '',
    no_employees: ''
  });

  // Login form validation states
  const [emailError, setEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');

  // Phone
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

  /* ---------- Validation ---------- */

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validateLoginPassword = (value: string) => {
    if (!value) return 'Password is required';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
    return '';
  };

  const validateFirstName = (firstName: string) => {
    if (!firstName) return 'Full name is required';
    if (firstName.length < 2) return 'Full name must be at least 2 characters long';
    return '';
  };

  const validateCompanyName = (companyName: string) => {
    if (!companyName) return 'Company name is required';
    if (companyName.length < 2)
      return 'Company name must be at least 2 characters long';
    return '';
  };

  const validateEmployees = (employees: string) => {
    if (!employees) return 'Number of employees is required';
    const num = parseInt(employees);
    if (isNaN(num) || num < 1) return 'Please enter a valid number of employees';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    const capitalRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (!capitalRegex.test(value)) {
      return 'Password must contain at least one capital letter.';
    }
    if (!numberRegex.test(value)) {
      return 'Password must contain at least one number.';
    }
    if (!specialCharRegex.test(value)) {
      return 'Password must contain at least one special character.';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return '';
  };

  /* ---------- Change Handlers ---------- */

  // Login
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setLoginPasswordError(validateLoginPassword(value));
  };

  // Phone
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneError(validatePhone(value));
  };

  // Register
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


  const handleGoogleUserDataChange = (newUserData: any) => {
    setGoogleUserData(newUserData);
  };

  /* ---------- Login (Email/Password) ---------- */

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

      const response = await fetch(
        'https://api.erpnext.ai/api/method/customcrm.api.login',
        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
            // Authorization:"token 03e70b45d943129:40caf2b1273e23e"
          }
        }
      );

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
        showToast('Successfully logged in!', 'success');
        window.location.reload();
      } else {
        const errorMessage =
          result.message?.message ||
          'Login failed. Please check your credentials.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        const errorMsg =
          'Unable to connect to the server. Please check your internet connection and try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      } else if (err instanceof Error) {
        const errorMsg = `Connection error: ${err.message}`;
        setError(errorMsg);
        showToast(errorMsg, 'error');
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Register (Email/Password) – WORKING VERSION ---------- */

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

    if (
      firstNameValidation ||
      emailValidation ||
      phoneValidation ||
      companyNameValidation ||
      employeesValidation
    ) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1️⃣ Check if company name is unique
      const checkCompanyResponse = await fetch(
        `https://api.erpnext.ai/api/v2/document/Company?filters=[["name","=","${companyData.company_name}"]]`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: "token 03e70b45d943129:40caf2b1273e23e"
          }
        }
      );

      if (checkCompanyResponse.ok) {
        const existingCompanies = await checkCompanyResponse.json();
        if (existingCompanies.data && existingCompanies.data.length > 0) {
          throw new Error(
            'This company name is already registered, Kindly choose another name.'
          );
        }
      }

      // 2️⃣ Validate that email doesn't exist
      const checkUserResponse = await fetch(
        `https://api.erpnext.ai/api/v2/document/User?filters=[["email","=","${registerData.email}"]]`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: "token 03e70b45d943129:40caf2b1273e23e"
          }
        }
      );

      if (checkUserResponse.ok) {
        const existingUsers = await checkUserResponse.json();
        if (existingUsers.data && existingUsers.data.length > 0) {
          throw new Error(
            'This email address is already registered, Please use a different email address.'
          );
        }
      }

      // 3️⃣ Create company
      const companyPayload = {
        company_name: companyData.company_name,
        email_id: registerData.email,
        no_employees: companyData.no_employees,
        plan_id: "0"
      };

      const companyResponse = await fetch(
        'https://api.erpnext.ai/api/v2/document/Company/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: "token 03e70b45d943129:40caf2b1273e23e"
          },
          body: JSON.stringify(companyPayload)
        }
      );

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create company: ${companyResponse.status}`
        );
      }

      const companyResult = await companyResponse.json();
      console.log('Company created:', companyResult);

      // 4️⃣ Create user
      const userDoc = {
        doctype: 'User',
        email: registerData.email,
        first_name: registerData.first_name,
        role_profile_name: registerData.role_profile_name,
        company: companyData.company_name,
        phone: phoneNumber,
        enabled: 1,
        user_type: 'System User'
      };

      const userResponse = await apiAxios.post(
        '/api/method/frappe.client.save',
        { doc: userDoc },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: "token 03e70b45d943129:40caf2b1273e23e"
          }
        }
      );

      if (!userResponse.data || !userResponse.data.message) {
        // If user creation fails, delete the company
        try {
          await fetch(
            `https://api.erpnext.ai/api/v2/document/Company/${encodeURIComponent(
              companyData.company_name
            )}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: "token 03e70b45d943129:40caf2b1273e23e"
              }
            }
          );
        } catch (rollbackError) {
          console.error('Failed to rollback company creation:', rollbackError);
        }
        throw new Error('User creation failed: No response message');
      }

      // ✅ Success - setup (if needed) & show toast
      const userEmail = registerData.email;

      setRegisterData({
        email: '',
        first_name: '',
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

      setEmail(userEmail);
      setIsRegisterMode(false);
      setError('');

      showToast(
        'Your account has been successfully created. You will receive an activation email at your registered email address.',
        'success'
      );
    } catch (err: any) {
      let errorMessage = 'Registration failed';

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message || err.message || 'Registration failed';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Google / Facebook ---------- */

  const extractUserInfoFromToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      return {
        email: payload.email,
        first_name: payload.given_name || payload.name?.split(' ')[0] || 'User',
        last_name: payload.family_name || payload.name?.split(' ')[1] || '',
        phone: '+91',
        company: '',
        no_employees: ''
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return {
        email: '',
        first_name: 'User',
        last_name: '',
        phone: '+91',
        company: '',
        no_employees: ''
      };
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    setLoading(true);
    setError('');

    try {
      const token = credentialResponse.credential;

      if (!token) {
        throw new Error('No credential received from Google');
      }

      const userInfo = extractUserInfoFromToken(token);

      if (!userInfo.email) {
        throw new Error('Could not extract email from Google token');
      }

      // Store token AND credential response for later use
      localStorage.setItem('google_token', token);
      localStorage.setItem('google_credential', JSON.stringify(credentialResponse));

      // Check if user exists with token in params
      const checkResponse = await axios.get(
        'https://api.erpnext.ai/api/method/customcrm.google_auth.check_user_exists',
        {
          params: { token },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const checkData = checkResponse.data;
      const userExists = checkData?.message?.exists === true;

      if (userExists) {
        // User exists - proceed with simple login
        const loginRes = await axios.get(
          'https://api.erpnext.ai/api/method/customcrm.google_auth.login_with_google',
          {
            params: { token },
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const loginData = loginRes.data;

        if (loginData.message && loginData.message.success_key === 1) {
          const sessionData = {
            company: loginData.message.company || '',
            username: loginData.message.username || '',
            email: loginData.message.email || '',
            full_name: loginData.full_name || '',
            sid: loginData.message.sid || '',
            api_key: loginData.message.api_key || '',
            api_secret: loginData.message.api_secret || '',
            role_profile: loginData.message.role_profile || ''
          };

          setUserSession(sessionData);
          // Clean up stored credentials after successful login
          localStorage.removeItem('google_token');
          localStorage.removeItem('google_credential');
          onLogin();
          showToast('Successfully logged in with Google!', 'success');
          window.location.reload();
        } else {
          throw new Error(
            loginData.message?.message ||
            'Google login failed. Please try again.'
          );
        }
      } else {
        // User doesn't exist - show modal to collect additional info
        setGoogleUserData({
          email: checkData.message?.email || userInfo.email,
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          phone: '+91',
          company: '',
          no_employees: ''
        });
        setShowGoogleSignupModal(true);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'An unexpected error occurred during Google login.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAccountCreation = async (userData: any) => {
  setLoading(true);

  try {
    const storedCredential = localStorage.getItem('google_credential');
    if (!storedCredential) {
      throw new Error('Google credential not found');
    }

    const credentialResponse = JSON.parse(storedCredential);
    const token = credentialResponse.credential;

    if (!token) {
      throw new Error('Google token not found');
    }

    const loginRes = await axios.get(
      'https://api.erpnext.ai/api/method/customcrm.google_auth.login_with_google',
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
          'Content-Type': 'application/json'
        }
      }
    );

    const loginData = loginRes.data;

    if (loginData.message && loginData.message.success_key === 1) {
      const sessionData = {
        company: loginData.message.company || '',
        username: loginData.message.username || '',
        email: loginData.message.email || '',
        full_name: loginData.full_name || '',
        sid: loginData.message.sid || '',
        api_key: loginData.message.api_key || '',
        api_secret: loginData.message.api_secret || '',
        role_profile: loginData.message.role_profile || ''
      };

      setUserSession(sessionData);
      setShowGoogleSignupModal(false);
      localStorage.removeItem('google_token');
      localStorage.removeItem('google_credential');

      onLogin();
      showToast('Account created successfully!', 'success');
      
      // ADD THIS LINE - Reload after successful account creation
      window.location.reload();
      
      navigate('/dashboard');
    } else {
      throw new Error(
        loginData.message?.message || 'Failed to create account'
      );
    }
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Failed to create account';
    setError(errorMessage);
    showToast(errorMessage, 'error');
  } finally {
    setLoading(false);
  }
};

  const handleFacebookLogin = async (response: any) => {
    try {
      setLoading(true);
      setError('');

      const token = response.accessToken;

      if (!token) {
        throw new Error('Failed to get Facebook access token.');
      }

      localStorage.setItem('facebook_token', token);

      const formData = new FormData();
      formData.append('token', token);

      const loginRes = await axios.post(
        'https://api.erpnext.ai/api/method/customcrm.facebook_auth.login_with_facebook',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const data = loginRes.data;

      if (data?.message?.success_key === 1) {
        const sessionData = {
          company: data.message.company || '',
          username: data.message.username || '',
          email: data.message.email || '',
          full_name: data.full_name || '',
          sid: data.message.sid || '',
          api_key: data.message.api_key || '',
          api_secret: data.message.api_secret || '',
          role_profile: data.message.role_profile || ''
        };

        setUserSession(sessionData);
        localStorage.removeItem('facebook_token');

        showToast('Successfully logged in with Facebook!', 'success');

        onLogin();
        window.location.reload();
      } else {
        throw new Error(data.message?.message || 'Facebook login failed.');
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Facebook login failed.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookError = (error: string) => {
    setError(error);
    showToast(error, 'error');
  };

  /* ---------- JSX ---------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2A2352] to-black flex items-center justify-center px-4">
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Google Signup Modal */}
      <GoogleSignupModal
        isOpen={showGoogleSignupModal}
        onClose={() => setShowGoogleSignupModal(false)}
        onAgree={handleGoogleAccountCreation}
        userData={googleUserData}
        onUserDataChange={handleGoogleUserDataChange}
      />

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center">
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

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 p-8">
          {isRegisterMode ? (
            /* ---------- Register Form (working) ---------- */
            <form onSubmit={handleRegister} className="space-y-6">
              <h1 className="text-[1.7rem] text-center font-[600] text-white">
                Create Account
              </h1>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={registerData.first_name}
                    onChange={e => handleFirstNameChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="John"
                    disabled={loading}
                  />
                </div>
                {firstNameError && (
                  <p className="text-red-400 text-sm mt-1">{firstNameError}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={e => handleRegisterEmailChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
                {registerEmailError && (
                  <p className="text-red-400 text-sm mt-1">{registerEmailError}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => handlePhoneChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </div>
                {phoneError && (
                  <p className="text-red-400 text-sm mt-1">{phoneError}</p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={companyData.company_name}
                    onChange={e => handleCompanyNameChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="Your Company"
                    disabled={loading}
                  />
                </div>
                {companyNameError && (
                  <p className="text-red-400 text-sm mt-1">{companyNameError}</p>
                )}
              </div>

              {/* Employees */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  No. of Employees <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-white rounded-lg">
                  <input
                    type="text"
                    value={companyData.no_employees || ''}
                    onChange={e => {
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
                disabled={loading || !!passwordError}
                className="w-full bg-white text-[#2D243C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
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
            /* ---------- Login Form ---------- */
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

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Email Address
                </label>
                <div className="relative border border-white rounded-lg">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-transparent text-white placeholder-white focus:outline-none"
                    placeholder="Enter Email Address"
                    disabled={loading}
                  />
                </div>
                {emailError && (
                  <p className="text-red-400 text-sm mt-1">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Password
                </label>
                <div className="relative border border-white rounded-lg">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
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
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {loginPasswordError && (
                  <p className="text-red-400 text-sm mt-1">
                    {loginPasswordError}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-md font-medium text-white hover:underline"
                  disabled={loading}
                  onClick={() => navigate('/ForgotPassword')}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
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

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white">or</span>
                </div>
              </div>

              
              <div className="flex justify-center gap-6">
               
                <CustomGoogleLoginButton
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    showToast('Google login failed. Please try again.', 'error');
                  }}
                />

                
                <CustomFacebookLoginButton
                  onSuccess={handleFacebookLogin}
                  onError={handleFacebookError}
                  loading={loading}
                />
              </div>

              {/* Create New Account */}
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