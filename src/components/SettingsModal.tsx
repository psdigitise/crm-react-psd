import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  User,
  Users,
  Mail,
  Home,
  Phone,
  CheckCircle,
  AlertCircle,
  Lock,
  Info,
  Camera,
  Loader2,
  Key,
  Copy,
  Zap,
  ShoppingCart,
  AlertTriangle,
  Menu,
  ChevronLeft,
  ArrowBigUpDash,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { AUTH_TOKEN, getAuthToken } from '../api/apiUrl';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'profile' | 'aiUsage' | 'websiteIntegration' | 'upgradePlan';
}

interface UserProfile {
  email: string;
  first_name: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  user_image?: string;
}

interface PasswordChangeData {
  newPassword: string;
  confirmPassword: string;
}

interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface WebsiteIntegrationData {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  api_key?: string;
  api_secret?: string;
  isGenerated: boolean;
}

interface AIUsageData {
  company: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  credits_allocated: number;
  credits_used: number;
  credits_remaining: number;
  usage_breakdown: {
    email: number;
    score: number;
    report: number;
  };
}

interface FeatureRow {
  feature: string;
  standard: string | boolean;
  professional: string | boolean;
  enterprise: string | boolean;
}

const crmFeatures: FeatureRow[] = [
  { feature: 'Leads & Deals (Pipeline Management)', standard: true, professional: true, enterprise: 'Unlimited' },
  { feature: 'Contacts & Organizations', standard: true, professional: true, enterprise: true },
  { feature: 'Notes, Tasks & Call Logs', standard: true, professional: true, enterprise: true },
  { feature: 'Email Tracking (Opened / Not Opened)', standard: true, professional: 'Up to 6 Users', enterprise: 'Unlimited' },
  { feature: 'Website Lead Capture', standard: 'Standard', professional: true, enterprise: true },
  { feature: 'Lead Assignment Rules', standard: true, professional: 'Advanced', enterprise: 'Auto Sync' },
  { feature: 'Role-Based Access', standard: 'Basic', professional: 'Advanced', enterprise: 'Custom Roles' },
  { feature: 'Meta Ads Lead Sync', standard: 'Periodic Sync', professional: true, enterprise: 'Auto Sync' },
  { feature: 'AI Lead Score', standard: true, professional: 'Advanced', enterprise: true },
  { feature: 'AI Assist Email', standard: 'Basic', professional: 'Advanced', enterprise: true },
  { feature: 'Users', standard: 'Up to 3 Users', professional: 'Up to 6 Users', enterprise: 'Unlimited Users' },
  { feature: 'Advanced Features (AP, SLA, Storage, Manager)', standard: '-', professional: '-', enterprise: 'All Included' },
];

const TableCellContent = ({ value, theme }: { value: string | boolean, theme: 'light' | 'dark' }) => {
  const color = theme === 'dark' ? 'text-green-400' : 'text-green-600';
  const defaultText = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const dashText = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  if (value === true) {
    return <CheckCircle className={`w-5 h-5 mx-auto ${color}`} />;
  }
  if (value === false || value === '-') {
    return <span className={`block text-center ${dashText}`}>-</span>;
  }
  if (typeof value === 'string') {
    return <span className={`block text-center text-sm font-medium ${defaultText}`}>{value}</span>;
  }
  return null;
};

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 5MB in bytes (same as your existing limit)
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Component to render the full feature table
const CRMFeatureTable = ({ theme }: { theme: 'light' | 'dark' }) => {
  const tableHeaderClass = `py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`;
  const tableRowClass = `border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`;
  const tableCellClass = `py-3 px-4 whitespace-normal align-middle text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`mt-10 overflow-x-auto rounded-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className={tableHeaderClass} style={{ minWidth: '250px' }}>CRM Features</th>
            <th className={tableHeaderClass} style={{ minWidth: '100px' }}>Standard</th>
            <th className={tableHeaderClass} style={{ minWidth: '100px' }}>Professional</th>
            <th className={tableHeaderClass} style={{ minWidth: '100px' }}>Enterprise</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {crmFeatures.map((row) => (
            <tr key={row.feature} className={tableRowClass}>
              <td className={tableCellClass}>{row.feature}</td>
              <td className={tableCellClass}><TableCellContent value={row.standard} theme={theme} /></td>
              <td className={tableCellClass}><TableCellContent value={row.professional} theme={theme} /></td>
              <td className={tableCellClass}><TableCellContent value={row.enterprise} theme={theme} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export function SettingsModal({ isOpen, onClose, initialTab }: SettingsModalProps) {
  const { theme } = useTheme();
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isGeneratingIntegration, setIsGeneratingIntegration] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const [isLoadingAIUsage, setIsLoadingAIUsage] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    email: '',
    first_name: '',
    last_name: '',
    full_name: '',
    username: '',
    user_image: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [toastId, setToastId] = useState(0);
  const [websiteIntegrationData, setWebsiteIntegrationData] = useState<WebsiteIntegrationData>({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    isGenerated: false
  });
  const [aiUsageData, setAiUsageData] = useState<AIUsageData>({
    company: '',
    plan_id: '',
    start_date: '',
    end_date: '',
    credits_allocated: 0,
    credits_used: 0,
    credits_remaining: 0,
    usage_breakdown: {
      email: 0,
      score: 0,
      report: 0
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userSession = useMemo(() => getUserSession(), []);
  const sessionEmail = userSession?.email;
  const sessionUsername = userSession?.username;
  const sessionFullName = userSession?.full_name;
  const sessionCompany = userSession?.company;
  const sessionPlanId = userSession?.plan_id; // Default to '0' (Free)
  const token = getAuthToken();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
  if (isOpen) {
    setActiveSettingsTab(initialTab);
    
    // Only fetch profile if we have a session
    if (userSession?.email) {
      fetchUserProfile();
    }
  } else {
    // Reset form states when modal closes
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
    setIsChangingPassword(false);
  }
}, [isOpen, initialTab]); 

  // Check for mobile view on resize and initial load
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Close mobile menu when switching tabs on mobile
  useEffect(() => {
    if (isMobileView && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [activeSettingsTab, isMobileView]);

  // Fetch user profile when modal opens and profile tab is active
  useEffect(() => {
    if (isOpen && sessionEmail) {
      fetchUserProfile();
    }
  }, [isOpen, sessionEmail]);

  // Fetch AI usage data when AI Usage tab is active
  useEffect(() => {
  if (isOpen && activeSettingsTab === 'aiUsage' && userSession?.company) {
    fetchAIUsageData();
  }
}, [isOpen, activeSettingsTab]);

  
  useEffect(() => {
    if (activeSettingsTab === 'websiteIntegration' && userSession) {
      const existingApiKey = localStorage.getItem('website_integration_api_key');
      const existingApiSecret = localStorage.getItem('website_integration_api_secret');

      if (existingApiKey && existingApiSecret) {
        const nameParts = userSession.full_name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const company = userSession.company || '';

        const emailBase = company.toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 30);
        const email = emailBase ? `${emailBase}@gmail.com` : '';

        setWebsiteIntegrationData({
          first_name: firstName,
          last_name: lastName,
          email: email,
          company: company,
          api_key: existingApiKey,
          api_secret: existingApiSecret,
          isGenerated: true
        });
      } else {
        const nameParts = userSession.full_name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const company = userSession.company || '';

        const emailBase = company.toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 30);
        const email = emailBase ? `${emailBase}@gmail.com` : '';

        setWebsiteIntegrationData({
          first_name: firstName,
          last_name: lastName,
          email: email,
          company: company,
          isGenerated: false
        });
      }
    }
  }, [activeSettingsTab, userSession]);

  // Auto-remove toasts after 3 seconds
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const fetchAIUsageData = async () => {
    if (!sessionCompany) {
      showErrorToast('Company information not found');
      return;
    }

    setIsLoadingAIUsage(true);
    try {
      const response = await fetch(
        `https://api.erpnext.ai/api/method/customcrm.api.credits_usage?company=${encodeURIComponent(sessionCompany)}`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        const usageData = result.message;

        if (usageData) {
          setAiUsageData({
            company: usageData.company || '',
            plan_id: usageData.plan_id || '',
            start_date: usageData.start_date || '',
            end_date: usageData.end_date || '',
            credits_allocated: usageData.credits_allocated || 0,
            credits_used: usageData.credits_used || 0,
            credits_remaining: usageData.credits_remaining || 0,
            usage_breakdown: usageData.usage_breakdown || {
              email: 0,
              score: 0,
              report: 0
            }
          });
        } else {
          showErrorToast('No usage data available');
        }
      } else {
        const error = await response.json();
        console.error('Failed to fetch AI usage data:', error);
        showErrorToast('Failed to load AI usage data');
      }
    } catch (error) {
      console.error('Error fetching AI usage data:', error);
      showErrorToast('Error loading AI usage data');
    } finally {
      setIsLoadingAIUsage(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `https://api.erpnext.ai/api/v2/document/User/${encodeURIComponent(sessionEmail)}`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        const userData = result.data;

        setProfileData({
          email: userData.name || sessionEmail || '',
          first_name: userData.first_name || sessionFullName?.split(' ')[0] || '',
          last_name: userData.last_name || sessionFullName?.split(' ').slice(1).join(' ') || '',
          full_name: userData.full_name || sessionFullName || '',
          username: userData.username || sessionUsername || '',
          user_image: userData.user_image || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const nameParts = sessionFullName?.split(' ') || [];
      setProfileData({
        email: sessionEmail || '',
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        full_name: sessionFullName || '',
        username: sessionUsername || '',
        user_image: ''
      });
    }
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = toastId + 1;
    setToastId(id);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const showSuccessToast = (message: string) => {
    addToast('success', message);
  };

  const showErrorToast = (message: string) => {
    addToast('error', message);
  };

  const showInfoToast = (message: string) => {
    addToast('info', message);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleProfileUpdate = async () => {
    if (!sessionEmail || !profileData.first_name.trim()) {
      showErrorToast('First name is required');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        doctype: 'User',
        name: sessionEmail,
        fieldname: {
          first_name: profileData.first_name.trim(),
          last_name: profileData.last_name?.trim() || '',
          user_image: profileData.user_image || ''
        }
      };

      const response = await fetch('https://api.erpnext.ai/api/method/frappe.client.set_value', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated successfully:', result);
        showSuccessToast('Profile updated successfully!');

        if (userSession) {
          const updatedFullName = [profileData.first_name, profileData.last_name]
            .filter(Boolean)
            .join(' ');

          userSession.full_name = updatedFullName;
          localStorage.setItem('userSession', JSON.stringify(userSession));
        }
      } else {
        const error = await response.json();
        console.error('Failed to update profile:', error);
        showErrorToast(`Failed to update profile: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    const errors: Record<string, string> = {};

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      const firstError = Object.values(errors)[0];
      showErrorToast(firstError);
      return;
    }

    if (!sessionEmail) {
      showErrorToast('User email not found');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        doctype: 'User',
        name: sessionEmail,
        fieldname: 'new_password',
        value: passwordData.newPassword
      };

      const response = await fetch('https://api.erpnext.ai/api/method/frappe.client.set_value', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Password updated successfully:', result);
        showSuccessToast('Password updated successfully!');

        setPasswordData({
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
        setIsChangingPassword(false);
      } else {
        const error = await response.json();
        console.error('Failed to update password:', error);
        showErrorToast(`Failed to update password: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showErrorToast('Error updating password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleFileUpload function with validation
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      showErrorToast('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showErrorToast('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Additional validation: Check if file is actually an image
    if (!file.type.startsWith('image/')) {
      showErrorToast('Please upload a valid image file');
      return;
    }

    // Optional: Validate image dimensions if needed
    const validateImageDimensions = (file: File): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const width = img.width;
          const height = img.height;

          // Example: Check if image is too small or too large
          if (width < 50 || height < 50) {
            resolve(false); // Image too small
          } else if (width > 5000 || height > 5000) {
            resolve(false); // Image too large
          } else {
            resolve(true);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(false);
        };

        img.src = objectUrl;
      });
    };

    setIsUploadingPhoto(true);

    try {
      // Optional: Validate image dimensions
      const isValidDimensions = await validateImageDimensions(file);
      if (!isValidDimensions) {
        showErrorToast('Image dimensions are not suitable. Please use an image between 50x50 and 5000x5000 pixels.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('is_private', '0');
      formData.append('folder', 'Home');

      const uploadResponse = await fetch('https://api.erpnext.ai/api/method/upload_file', {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formData
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        console.log('File uploaded successfully:', uploadResult);

        const fileUrl = uploadResult.message?.file_url;

        if (fileUrl) {
          const updatedProfile = {
            ...profileData,
            user_image: fileUrl
          };
          setProfileData(updatedProfile);

          const updateData = {
            doctype: 'User',
            name: sessionEmail,
            fieldname: {
              user_image: fileUrl
            }
          };

          const updateResponse = await fetch('https://api.erpnext.ai/api/method/frappe.client.set_value', {
            method: 'POST',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });

          if (updateResponse.ok) {
            showSuccessToast('Profile photo updated successfully!');
          } else {
            showErrorToast('Photo uploaded but failed to update profile');
          }
        } else {
          showErrorToast('Failed to get file URL from response');
        }
      } else {
        const error = await uploadResponse.json();
        console.error('Failed to upload file:', error);
        showErrorToast(`Failed to upload photo: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showErrorToast('Error uploading photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file before upload
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showErrorToast('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        showErrorToast('Image size should be less than 1MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      handleFileUpload(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleGenerateWebsiteIntegration = async () => {
    if (!userSession) {
      showErrorToast('User session not found');
      return;
    }

    if (websiteIntegrationData.isGenerated) {
      showInfoToast('Credentials have already been generated');
      return;
    }

    setIsGeneratingIntegration(true);
    try {
      const nameParts = userSession.full_name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const company = userSession.company || '';

      const emailBase = company.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 30);
      const email = emailBase ? `${emailBase}@gmail.com` : '';

      const payload = {
        first_name: firstName,
        last_name: lastName || '',
        email: email,
        company: company
      };

      const response = await fetch('https://api.erpnext.ai/api/method/customcrm.email.website_integration.create_user_api', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Website integration user created:', result);

        if (result.message?.success) {
          localStorage.setItem('website_integration_api_key', result.message.api_key);
          localStorage.setItem('website_integration_api_secret', result.message.api_secret);

          setWebsiteIntegrationData(prev => ({
            ...prev,
            first_name: firstName,
            last_name: lastName,
            email: email,
            company: company,
            api_key: result.message.api_key,
            api_secret: result.message.api_secret,
            isGenerated: true
          }));
          showSuccessToast('Website integration user created successfully!');
        } else {
          showErrorToast(result.message?.message || 'Failed to create user');
        }
      } else {
        const error = await response.json();
        console.error('Failed to create website integration user:', error);
        showErrorToast(`Failed to create user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating website integration user:', error);
      showErrorToast('Error creating user. Please try again.');
    } finally {
      setIsGeneratingIntegration(false);
    }
  };

  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`${fieldName} copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy:', error);
      showErrorToast('Failed to copy to clipboard');
    }
  };

  const handlePayment = async (planName: string, amount: number, planId: string) => {
    if (!userSession || !userSession.email || !userSession.company) {
      showErrorToast('User session is invalid. Please log in again.');
      return;
    }

    if (!(window as any).Razorpay) {
      showErrorToast('Payment gateway is not loaded. Please try again in a moment.');
      return;
    }

    setIsProcessingPayment(planId);

    const options = {
      key: 'rzp_live_RbHLiSn5xiGADx',
      amount: amount * 100,
      currency: 'INR',
      name: 'CRM Plan Upgrade',
      description: `Payment for ${planName}`,
      handler: async (response: any) => {
        console.log('Razorpay success response:', response);
        const { razorpay_payment_id, razorpay_order_id } = response;

        try {
          const payload = {
            company: userSession.company,
            amount: amount,
            plan: planId,
            order_id: razorpay_order_id || `ORD_${Date.now()}`,
            payment_id: razorpay_payment_id,
            created_at: new Date().toISOString().split('T')[0],
            created_by: userSession.email,
            status: 'success'
          };

          const apiResponse = await fetch('https://api.erpnext.ai/api/method/customcrm.payment.update_company', {
            method: 'POST',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (apiResponse.ok) {
            await apiResponse.json();
            showSuccessToast(`Successfully upgraded to ${planName}!`);

            // **Update Local Session with new plan_id**
            if (userSession) {
              userSession.plan_id = planId;
              localStorage.setItem('userSession', JSON.stringify(userSession));
            }

          } else {
            const error = await apiResponse.json();
            console.error('Failed to update company plan:', error);
            showErrorToast(`Payment successful, but failed to update plan: ${error.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error updating company plan:', error);
          showErrorToast('Payment successful, but an error occurred while updating your plan.');
        } finally {
          setIsProcessingPayment(null);
        }
      },
      prefill: {
        name: userSession.full_name || '',
        email: userSession.email || '',
      },
      theme: {
        color: theme === 'dark' ? '#8B5CF6' : '#2563EB'
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
          showInfoToast('Payment was Cancelled.');
          setIsProcessingPayment(null);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', async (response: any) => {
      console.error('Razorpay payment failed:', response.error);
      showErrorToast(`Payment failed: ${response.error.description}`);

      if (userSession?.company && userSession?.email) {
        try {
          const { order_id, payment_id } = response.error.metadata;
          const metadata = response.error?.metadata || {};

          const payload = {
            company: userSession.company,
            amount: amount,
            plan: planId,
            order_id: order_id || `ORD_FAIL_${Date.now()}`,
            payment_id: payment_id,
            created_at: new Date().toISOString().split('T')[0],
            created_by: userSession.email,
            status: 'failed'
          };

          const apiResponse = await fetch('https://api.erpnext.ai/api/method/customcrm.payment.update_company', {
            method: 'POST',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (apiResponse.ok) {
            console.log('Failed payment attempt logged successfully.');
          } else {
            console.error('Failed to log the failed payment attempt:', await apiResponse.text());
          }
        } catch (error) {
          console.error('Error logging the failed payment attempt:', error);
        }
      }
      setIsProcessingPayment(null);
    });
    rzp.open();
  };

  const handleBuyMoreActions = () => {
    showInfoToast('Redirecting to purchase page...');
    setTimeout(() => {
      showSuccessToast('Purchase page opened in a new tab');
    }, 500);
  };

  const handleContactSales = async () => {
    if (!userSession || !userSession.email || !userSession.full_name || !userSession.company) {
      showErrorToast('User details are incomplete. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name1: userSession.full_name,
        email: userSession.email,
        company: userSession.company,
      };

      const response = await fetch('https://api.erpnext.ai/api/v2/document/On Request Form', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('On Request Form submitted successfully:', result);
        showSuccessToast('Sales team contacted! We will be in touch shortly.');
      } else {
        const errorText = await response.text();
        console.error('Failed to submit On Request Form:', errorText);
        showErrorToast(`Failed to contact sales. Error: ${errorText.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error('Error submitting On Request Form:', error);
      showErrorToast('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getToastStyles = (type: 'success' | 'error' | 'info') => {
    const baseStyles = "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-sm";

    if (theme === 'dark') {
      switch (type) {
        case 'success':
          return `${baseStyles} bg-green-900 border border-green-800 text-green-200`;
        case 'error':
          return `${baseStyles} bg-red-900 border border-red-800 text-red-200`;
        case 'info':
          return `${baseStyles} bg-blue-900 border border-blue-800 text-blue-200`;
      }
    } else {
      switch (type) {
        case 'success':
          return `${baseStyles} bg-green-50 border border-green-200 text-green-800`;
        case 'error':
          return `${baseStyles} bg-red-50 border border-red-200 text-red-800`;
        case 'info':
          return `${baseStyles} bg-blue-50 border border-blue-200 text-blue-800`;
      }
    }
  };

  const getToastIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const calculatePercentage = (used: number, total: number) => {
    return Math.min(100, Math.max(0, (used / total) * 100));
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const settingsSections = [
    {
      title: 'System Configuration',
      items: [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'aiUsage', label: 'AI Usage', icon: Zap },
        { id: 'websiteIntegration', label: 'Website Integration', icon: Key },
        { id: 'upgradePlan', label: 'Update your plan', icon: ArrowBigUpDash },
      ],
    },
  ];

  // Mobile hamburger menu component
  const MobileMenu = () => (
    <div className={`fixed inset-0 z-[75] ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Mobile Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Settings Menu
        </h2>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="p-4">
        {settingsSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className={`text-xs font-semibold uppercase mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSettingsTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSettingsTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg text-base transition-colors ${isActive
                        ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600')
                        : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="w-5 h-5" />}
                        <span>{item.label}</span>
                        {isActive && (
                          <ChevronLeft className="w-5 h-5 ml-auto transform rotate-180" />
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // Function to determine which card to highlight as the *suggested* next upgrade
  const getUpgradeSuggestionId = (currentPlanId: string) => {
    switch (currentPlanId) {
      case '0': // Free/Initial -> Suggest Standard (Plan 1)
        return '1';
      case '1': // Standard -> Suggest Professional (Plan 2)
        return '2';
      case '2': // Professional -> No automated suggestion
        return null;
      default:
        return null;
    }
  };

  const getPlanDetails = (planId: string) => {
    switch (planId) {
      case '0':
        return { name: 'Free Plan', color: 'bg-green-500' };
      case '1':
        return { name: 'STANDARD PLAN CRM', color: 'bg-blue-500' };
      case '2':
        return { name: 'PROFESSIONAL PLAN – CRM Pro', color: 'bg-purple-500' };
      case '3':
        return { name: 'ENTERPRISE PLAN – CRM Max', color: 'bg-yellow-500' };
      default:
        return { name: 'Unknown Plan', color: 'bg-gray-500' };
    }
  };

  const renderPlanCard = (planName: string, amount: number | 'On Request', planId: string, description: string, highlightAsCurrent: boolean, highlightAsSuggested: boolean) => {
    const isCurrentPlan = sessionPlanId === planId;
    const isEnterprise = planId === '3';

    // Determine card styles
    let cardClassName = `border rounded-xl p-6 text-center relative shadow-lg transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`;
    let highlightClassName = '';

    if (isCurrentPlan) {
      // Current plan highlight (strong border)
      highlightClassName = theme === 'dark'
        ? 'border-green-500 ring-2 ring-green-500'
        : 'border-green-600 ring-2 ring-600';
    } else if (highlightAsSuggested && !isEnterprise) {
      // Suggested plan highlight (medium border)
      highlightClassName = theme === 'dark'
        ? 'border-purple-500 ring-2 ring-purple-500'
        : 'border-blue-500 ring-2 ring-blue-500';
    } else {
      // Default styles
      highlightClassName = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    }

    // Determine button styles
    const isButtonDisabled = isCurrentPlan || (isProcessingPayment !== null && !isEnterprise);
    let buttonClassName = `mt-6 w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center `;

    if (isCurrentPlan) {
      buttonClassName += theme === 'dark'
        ? 'bg-green-700 text-white cursor-not-allowed'
        : 'bg-green-600 text-white cursor-not-allowed';
    } else if (isProcessingPayment === planId) {
      buttonClassName += 'bg-gray-500 text-gray-300 cursor-not-allowed';
    } else if (isEnterprise) {
      buttonClassName += theme === 'dark'
        ? 'bg-purple-600 text-white hover:bg-purple-700'
        : 'bg-purple-600 text-white hover:bg-purple-700';
    } else {
      buttonClassName += theme === 'dark'
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-blue-600 text-white hover:bg-blue-700';
    }


    const handlePlanAction = () => {
      if (isCurrentPlan) return;
      if (isEnterprise) {
        handleContactSales();
      } else {
        handlePayment(planName, amount as number, planId);
      }
    };

    return (
      <div className={`${cardClassName} ${highlightClassName}`}>
        {isCurrentPlan && (
          <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-green-500 shadow-md">
            Current Plan
          </div>
        )}
        {highlightAsSuggested && !isCurrentPlan && !isEnterprise && (
          <div className={`absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 rounded-full text-xs font-bold text-white ${theme === 'dark' ? 'bg-purple-500' : 'bg-blue-500'} shadow-md`}>
            Recommended
          </div>
        )}

        <h3 className={`text-xl font-semibold ${isCurrentPlan ? (theme === 'dark' ? 'text-green-400' : 'text-green-700') : (theme === 'dark' ? 'text-gray-200' : 'text-gray-800')}`}>
          {planName}
        </h3>
        <ul className={`text-center mt-4 space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <li>{description}</li>
        </ul>
        <p className={`text-2xl font-bold mt-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {typeof amount === 'number' ? `₹${amount.toLocaleString()}/mo` : amount}
        </p>
        <button
          onClick={handlePlanAction}
          disabled={isButtonDisabled}
          className={buttonClassName}
        >
          {isCurrentPlan ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Active Plan
            </>
          ) : isProcessingPayment === planId ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : isEnterprise ? (
            'Contact Sales'
          ) : (
            'Buy Now'
          )}
        </button>
      </div>
    );
  };

  // Main content component
  const renderContent = () => {
    //const upgradeSuggestionId = getUpgradeSuggestionId(sessionPlanId);

    switch (activeSettingsTab) {
      case 'profile':
        return (
          <div className="p-4 md:p-8">
            {/* ... (Existing Profile Tab Content) ... */}
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="relative group">
                  <div
                    onClick={handlePhotoClick}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-semibold cursor-pointer transition-all duration-200 overflow-hidden border-2 ${theme === 'dark'
                      ? 'bg-gray-700 text-white border-gray-600 hover:border-purple-500'
                      : 'bg-gray-200 text-gray-700 border-gray-300 hover:border-blue-500'
                      } ${profileData.user_image ? 'border-solid' : 'border-dashed'}`}
                  >
                    {profileData.user_image ? (
                      <>
                        <img
                          src={`https://api.erpnext.ai${profileData.user_image}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUploadingPhoto ? (
                            <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" />
                          ) : (
                            <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {isUploadingPhoto ? (
                          <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mb-1" />
                        ) : (
                          <>
                            <div className="text-xl md:text-2xl font-semibold mb-1">
                              {profileData.first_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-xs">Upload</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isUploadingPhoto && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        Uploading...
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePhotoClick}
                    disabled={isUploadingPhoto}
                    className={`absolute -bottom-2 -right-2 p-1.5 rounded-full shadow-lg ${theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } transition-colors ${isUploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Camera className="w-3 h-3 md:w-4 md:h-4" />
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    disabled={isUploadingPhoto}
                  />
                </div>

                <div>
                  <h3 className={`text-lg md:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {profileData.full_name || profileData.first_name || 'User'}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {profileData.email || 'No email'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsChangingPassword(true)}
                className={`px-4 py-2 flex items-center justify-center md:justify-start rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  First name *
                </label>
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last name
                </label>
                <input
                  type="text"
                  value={profileData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end">
              <button
                onClick={handleProfileUpdate}
                disabled={isLoading || !profileData.first_name.trim()}
                className={`px-6 py-3 flex items-center rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } ${isLoading || !profileData.first_name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </div>
        );

      case 'aiUsage':
        return (
          <div className="p-4 md:p-6">
            {/* ... (Existing AI Usage Tab Content) ... */}
            {/* Header with Refresh Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  AI Usage
                </h3>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track your AI feature usage and manage your plan
                </p>
              </div>
            </div>

            {/* Loading State */}
            {isLoadingAIUsage ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className={`w-12 h-12 animate-spin mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading AI usage data...
                </p>
              </div>
            ) : (
              <>
                {/* Main Usage Card */}
                <div className={`rounded-xl p-4 md:p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                    <div>
                      <h4 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        Monthly Usage Summary
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Period: {aiUsageData.start_date} to {aiUsageData.end_date}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {aiUsageData.credits_used} / {aiUsageData.credits_allocated} Credits
                      </span>
                      <span className={`text-sm font-medium ${aiUsageData.credits_remaining < 10 ? 'text-red-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {aiUsageData.credits_remaining} remaining
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full ${getUsageColor((aiUsageData.credits_used / aiUsageData.credits_allocated) * 100)} transition-all duration-500`}
                        style={{ width: `${calculatePercentage(aiUsageData.credits_used, aiUsageData.credits_allocated)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Used</span>
                        <Zap className={`w-4 h-4 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                      </div>
                      <div className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        {aiUsageData.credits_used}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Remaining</span>
                        <AlertTriangle className={`w-4 h-4 ${aiUsageData.credits_remaining < 10 ? 'text-red-400' : theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                      </div>
                      <div className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'} ${aiUsageData.credits_remaining < 10 ? 'text-red-500' : ''}`}>
                        {aiUsageData.credits_remaining}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monthly Limit</span>
                        <Info className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                      </div>
                      <div className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        {aiUsageData.credits_allocated}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Usage Table */}
                <div className={`rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  {/* Table Header */}
                  <div className={`grid grid-cols-2 p-4 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Feature</div>
                    <div className={`font-medium text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Credits Used</div>
                    {/* <div className={`font-medium text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</div> */}
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {/* AI Email Assist */}
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center">
                        <Mail className={`w-4 h-4 mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          AI Email Assist
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                          {aiUsageData.usage_breakdown.email}
                        </span>
                        {aiUsageData.credits_allocated > 0 && (
                          <div className="w-16 md:w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${getUsageColor(calculatePercentage(aiUsageData.usage_breakdown.email, aiUsageData.credits_allocated))}`}
                              style={{ width: `${calculatePercentage(aiUsageData.usage_breakdown.email, aiUsageData.credits_allocated)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Lead Score */}
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          AI Lead Score
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                          {aiUsageData.usage_breakdown.score}
                        </span>
                        {aiUsageData.credits_allocated > 0 && (
                          <div className="w-16 md:w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${getUsageColor(calculatePercentage(aiUsageData.usage_breakdown.score, aiUsageData.credits_allocated))}`}
                              style={{ width: `${calculatePercentage(aiUsageData.usage_breakdown.score, aiUsageData.credits_allocated)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Company Intelligence Report */}
                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Company Intelligence
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                          {aiUsageData.usage_breakdown.report}
                        </span>
                        {aiUsageData.credits_allocated > 0 && (
                          <div className="w-16 md:w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${getUsageColor(calculatePercentage(aiUsageData.usage_breakdown.report, aiUsageData.credits_allocated))}`}
                              style={{ width: `${calculatePercentage(aiUsageData.usage_breakdown.report, aiUsageData.credits_allocated)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Table Footer */}
                  <div className={`p-4 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-evenly">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total credits used this month
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {aiUsageData.credits_used} / {aiUsageData.credits_allocated}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buy More Button */}
                <button
                  onClick={handleBuyMoreActions}
                  className={`w-full justify-self-end md:w-auto mt-6 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md'
                    }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy More
                </button>
              </>
            )}
          </div>
        );

      case 'websiteIntegration':
        return (
          <div className="p-4 md:p-8">
            {/* ... (Existing Website Integration Tab Content) ... */}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Website Integration
                </h3>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Generate API credentials for website integration
                </p>
              </div>

              {!websiteIntegrationData.isGenerated && !showHelp && (
                <button
                  onClick={handleGenerateWebsiteIntegration}
                  disabled={isGeneratingIntegration}
                  className={`px-4 py-2 flex items-center justify-center md:justify-start rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } ${isGeneratingIntegration ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isGeneratingIntegration ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Credentials'
                  )}
                </button>
              )}
            </div>

            {/* Show Help Section */}
            {showHelp ? (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    How to use API Credentials
                  </h4>
                  <button
                    onClick={() => setShowHelp(false)}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                  <h5 className={`font-medium mb-4 text-lg ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                    How to use these credentials:
                  </h5>
                  <ul className={`space-y-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Use the API Key and Secret for authentication</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Include them in the Authorization header of your API requests</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Store them securely in your application configuration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Do not commit them to version control systems</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Credentials can only be generated once</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              /* Show API Credentials or Initial State */
              websiteIntegrationData.isGenerated ? (
                <div>
                  <h4 className={`text-lg font-medium mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    API Credentials
                  </h4>

                  {/* Success Message */}
                  <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-start">
                      <CheckCircle className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`} />
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
                          Website integration user created successfully!
                        </p>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                          Use these credentials for API authentication.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* API Key and Secret */}
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        API Key
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={websiteIntegrationData.api_key || ''}
                          readOnly
                          className={`flex-1 px-4 py-3 rounded-lg border font-mono text-sm truncate ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-gray-300'
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                            }`}
                        />
                        <button
                          onClick={() => handleCopyToClipboard(websiteIntegrationData.api_key || '', 'API Key')}
                          className={`px-4 py-3 rounded-lg flex items-center justify-center ${theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        API Secret
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={websiteIntegrationData.api_secret || ''}
                          readOnly
                          className={`flex-1 px-4 py-3 rounded-lg border font-mono text-sm truncate ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-gray-300'
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                            }`}
                        />
                        <button
                          onClick={() => handleCopyToClipboard(websiteIntegrationData.api_secret || '', 'API Secret')}
                          className={`px-4 py-3 rounded-lg flex items-center justify-center ${theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Keep this secret secure and never share it publicly.
                        </p>
                        <button
                          onClick={() => setShowHelp(true)}
                          className={`flex items-center text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                          <Info className="w-4 h-4 mr-1" />
                          Help
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Initial State */
                <div className={`p-6 md:p-8 text-center border-2 border-dashed rounded-lg ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex flex-col items-center justify-center">
                    <Key className={`w-12 h-12 mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <h4 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Generate API Credentials
                    </h4>
                    <p className={`text-sm max-w-md mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click the "Generate Credentials" button to create API credentials for website integration.
                      These credentials will be automatically generated using your account information.
                    </p>

                    <button
                      onClick={handleGenerateWebsiteIntegration}
                      disabled={isGeneratingIntegration}
                      className={`px-6 py-3 flex items-center rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } ${isGeneratingIntegration ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isGeneratingIntegration ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Credentials...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Generate Credentials
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        );

      case 'upgradePlan':
        const currentPlan = sessionPlanId || '0';
        const suggestedPlan = getUpgradeSuggestionId(currentPlan);

        return (
          <div className="p-6">
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Upgrade Your Plan
            </h2>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Your current plan is: <span className={`font-semibold`}>{getPlanDetails(currentPlan).name}</span>.
            </p>
            <p className={`text-sm mb-9 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Choose the plan that's right for you and unlock more features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* STANDARD PLAN CRM (Plan ID 1) */}
              {renderPlanCard(
                'STANDARD PLAN CRM',
                1500,
                '1',
                'Best for Growing Teams',
                currentPlan === '1', // isCurrent
                suggestedPlan === '1' // isSuggested
              )}

              {/* PROFESSIONAL PLAN – CRM Pro (Plan ID 2) */}
              {renderPlanCard(
                'PROFESSIONAL PLAN – CRM Pro',
                2500,
                '2',
                'For Large Teams & Enterprises',
                currentPlan === '2', // isCurrent
                suggestedPlan === '2' // isSuggested
              )}

              {/* ENTERPRISE PLAN – CRM Max (Plan ID 3) */}
              {renderPlanCard(
                'ENTERPRISE PLAN – CRM Max',
                'On Request',
                '3',
                'For Multi-Location Companies',
                currentPlan === '3', // isCurrent
                false // Never suggest Enterprise, only "On Request"
              )}
            </div>
            <CRMFeatureTable theme={theme} />
          </div>
        );

      default:
        return (
          <div className="p-8 text-center">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Settings
            </h3>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Select a setting category from the menu.
            </p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={getToastStyles(toast.type)}
          >
            {getToastIcon(toast.type)}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-current opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Main Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 md:p-4">
        <div
          className={`w-full h-full md:h-auto md:max-w-5xl md:max-h-[90vh] rounded-none md:rounded-xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className={`flex items-center justify-between p-4 md:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              {isMobileView && !isMobileMenuOpen && (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <h2 className={`text-xl md:text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex h-[calc(100vh-100px)] md:h-[calc(90vh-100px)]">
            {/* Desktop Sidebar Navigation (hidden on mobile) */}
            {!isMobileView && (
              <div className={`w-64 border-r overflow-y-auto ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <nav className="p-4">
                  {settingsSections.map((section) => (
                    <div key={section.title} className="mb-6">
                      <h3 className={`text-xs font-semibold uppercase mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {section.title}
                      </h3>
                      <ul className="space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeSettingsTab === item.id;
                          return (
                            <li key={item.id}>
                              <button
                                onClick={() => setActiveSettingsTab(item.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                                  ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-blue-600 border border-blue-200')
                                  : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  {Icon && <Icon className="w-4 h-4" />}
                                  {item.label}
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileView && isMobileMenuOpen && <MobileMenu />}

      {/* Password Change Modal */}
      {isChangingPassword && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[80]"
            onClick={() => {
              setPasswordData({ newPassword: '', confirmPassword: '' });
              setPasswordErrors({});
              setIsChangingPassword(false);
            }}
          />

          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div
              className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Change Password
                </h2>
                <button
                  onClick={() => {
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                    setIsChangingPassword(false);
                  }}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white !placeholder-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-900 !placeholder-gray-500'
                        } ${passwordErrors.newPassword ? 'border-red-500' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>
                    )}
                    {!passwordErrors.newPassword && passwordData.newPassword && passwordData.newPassword.length < 8 && (
                      <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        Password must be at least 8 characters
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white !placeholder-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-900 !placeholder-gray-500'
                        } ${passwordErrors.confirmPassword ? 'border-red-500' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Confirm new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => {
                      setPasswordData({ newPassword: '', confirmPassword: '' });
                      setPasswordErrors({});
                      setIsChangingPassword(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isLoading
                      ? 'opacity-50 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      'Update'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}