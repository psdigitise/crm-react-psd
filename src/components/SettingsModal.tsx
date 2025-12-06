import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { AUTH_TOKEN } from '../api/apiUrl';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  totalActions: number;
  usedActions: number;
  remainingActions: number;
  features: Array<{
    name: string;
    used: number;
    remaining: number | null;
    total?: number;
    isUnlimited?: boolean;
  }>;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme } = useTheme();
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isGeneratingIntegration, setIsGeneratingIntegration] = useState(false);
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
    totalActions: 100,
    usedActions: 78,
    remainingActions: 22,
    features: [
      { name: 'AI Lead Score', used: 32, remaining: 18, total: 50 },
      { name: 'AI Email Assist', used: 20, remaining: 30, total: 50 },
      { name: 'Company Intelligence', used: 6, remaining: null, isUnlimited: true },
    ]
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userSession = getUserSession();
  const sessionEmail = userSession?.email;
  const sessionUsername = userSession?.username;
  const sessionFullName = userSession?.full_name;
  const sessionCompany = userSession?.company;

  // Fetch user profile when modal opens and profile tab is active
  useEffect(() => {
    if (isOpen && sessionEmail) {
      fetchUserProfile();
      // In a real app, you would fetch AI usage data from an API
      // fetchAIUsageData();
    }
  }, [isOpen, sessionEmail]);

  // Initialize website integration data when tab is active
  useEffect(() => {
    if (activeSettingsTab === 'websiteIntegration' && userSession) {
      // Check if credentials already exist in storage
      const existingApiKey = localStorage.getItem('website_integration_api_key');
      const existingApiSecret = localStorage.getItem('website_integration_api_secret');
      
      if (existingApiKey && existingApiSecret) {
        // Use existing credentials
        const nameParts = userSession.full_name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const company = userSession.company || '';
        
        // Generate email from company name
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
        // Initialize without generation
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

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `https://api.erpnext.ai/api/v2/document/User/${encodeURIComponent(sessionEmail)}`,
        {
          headers: {
            'Authorization': AUTH_TOKEN,
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
      // Fallback to session data
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
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated successfully:', result);
        showSuccessToast('Profile updated successfully!');
        
        // Update session storage with new name
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
    // Validate password
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
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Password updated successfully:', result);
        showSuccessToast('Password updated successfully!');
        
        // Reset form and close modal
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

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      showErrorToast('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    
    if (file.size > maxSize) {
      showErrorToast('Image size should be less than 5MB');
      return;
    }
    
    setIsUploadingPhoto(true);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('is_private', '0');
      formData.append('folder', 'Home');
      
      // Upload the file
      const uploadResponse = await fetch('https://api.erpnext.ai/api/method/upload_file', {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
        },
        body: formData
      });
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        console.log('File uploaded successfully:', uploadResult);
        
        // Get the file URL from the response
        const fileUrl = uploadResult.message?.file_url;
        
        if (fileUrl) {
          // Update profile with the new image URL
          const updatedProfile = {
            ...profileData,
            user_image: fileUrl
          };
          setProfileData(updatedProfile);
          
          // Update the user record with the new image URL
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
              'Authorization': AUTH_TOKEN,
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
      handleFileUpload(file);
    }
    // Reset the input so the same file can be selected again
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
    
    // Clear error when user starts typing
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
      // Use session data directly
      const nameParts = userSession.full_name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const company = userSession.company || '';
      
      // Generate email from company name
      const emailBase = company.toLowerCase()
        .replace(/\s+/g, '')  // Remove spaces
        .replace(/[^a-z0-9]/g, '')  // Remove special characters
        .substring(0, 30);  // Limit length
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
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Website integration user created:', result);
        
        if (result.message?.success) {
          // Store credentials locally
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

  const handleBuyMoreActions = () => {
    // In a real app, this would open a payment modal or redirect to a purchase page
    showInfoToast('Redirecting to purchase page...');
    // Simulate API call
    setTimeout(() => {
      showSuccessToast('Purchase page opened in a new tab');
      // window.open('https://your-app.com/pricing', '_blank');
    }, 500);
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

  if (!isOpen) return null;

  const settingsSections = [
    {
      title: 'System Configuration',
      items: [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'aiUsage', label: 'AI Usage', icon: Zap },
        { id: 'websiteIntegration', label: 'Website Integration', icon: Key },
      ],
    },
  ];

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
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className={`w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              Settings
            </h2>
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
          <div className="flex h-[calc(90vh-100px)]">
            {/* Sidebar Navigation */}
            <div className={`w-64 border-r overflow-y-auto ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
              <nav className="p-4">
                {settingsSections.map((section) => (
                  <div key={section.title} className="mb-6">
                    <h3 className={`text-xs font-semibold uppercase mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
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

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
              {activeSettingsTab === 'profile' && (
                <div className="p-8">
                  {/* Profile Section */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      {/* Profile Photo Upload Area */}
                      <div className="relative group">
                        <div
                          onClick={handlePhotoClick}
                          className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold cursor-pointer transition-all duration-200 overflow-hidden border-2 ${theme === 'dark'
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
                                  // Fallback to initials if image fails to load
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {/* Upload overlay */}
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {isUploadingPhoto ? (
                                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                                ) : (
                                  <Camera className="w-8 h-8 text-white" />
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              {isUploadingPhoto ? (
                                <Loader2 className="w-8 h-8 animate-spin mb-1" />
                              ) : (
                                <>
                                  <div className="text-2xl font-semibold mb-1">
                                    {profileData.first_name?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                  <span className="text-xs">Upload</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Upload indicator */}
                        {isUploadingPhoto && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              Uploading...
                            </div>
                          </div>
                        )}
                        
                        {/* Change Photo Button */}
                        <button
                          onClick={handlePhotoClick}
                          disabled={isUploadingPhoto}
                          className={`absolute -bottom-2 -right-2 p-1.5 rounded-full shadow-lg ${theme === 'dark'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } transition-colors ${isUploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          className="hidden"
                          disabled={isUploadingPhoto}
                        />
                      </div>
                      
                      <div>
                        <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {profileData.full_name || profileData.first_name || 'User'}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {profileData.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className={`px-4 py-2 flex items-center rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={isLoading || !profileData.first_name.trim()}
                      className={`px-4 py-2 flex items-center rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
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
              )}

              {activeSettingsTab === 'aiUsage' && (
                <div className="p-6">
                  {/* AI Usage Header */}
                  <div className="mb-8">
                    <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      AI Usage
                    </h3>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Track your AI feature usage and manage your plan
                    </p>
                  </div>

                  {/* Main Usage Card */}
                  <div className={`rounded-xl p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                          Monthly Usage Summary
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Resets on the 1st of each month
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                        This Month
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {aiUsageData.usedActions} / {aiUsageData.totalActions} Actions
                        </span>
                        <span className={`text-sm font-medium ${aiUsageData.remainingActions < 10 ? 'text-red-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {aiUsageData.remainingActions} remaining
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-full ${getUsageColor((aiUsageData.usedActions / aiUsageData.totalActions) * 100)} transition-all duration-500`}
                          style={{ width: `${calculatePercentage(aiUsageData.usedActions, aiUsageData.totalActions)}%` }}
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
                        <div className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{aiUsageData.usedActions}</div>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Remaining</span>
                          <AlertTriangle className={`w-4 h-4 ${aiUsageData.remainingActions < 10 ? 'text-red-400' : theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                        </div>
                        <div className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'} ${aiUsageData.remainingActions < 10 ? 'text-red-500' : ''}`}>
                          {aiUsageData.remainingActions}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monthly Limit</span>
                          <Info className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                        </div>
                        <div className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{aiUsageData.totalActions}</div>
                      </div>
                    </div>

                   
                    
                  </div>

                  {/* Feature Usage Table */}
                  <div className={`rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    {/* Table Header */}
                    <div className={`grid grid-cols-3 p-4 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Feature</div>
                      <div className={`font-medium text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Used</div>
                      <div className={`font-medium text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Remaining</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {aiUsageData.features.map((feature, index) => (
                        <div key={index} className="grid grid-cols-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center">
                            <Zap className={`w-4 h-4 mr-3 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                            <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {feature.name}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center">
                            <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                              {feature.used}
                            </span>
                            {feature.total && (
                              <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                <div 
                                  className={`h-full ${getUsageColor(calculatePercentage(feature.used, feature.total))}`}
                                  style={{ width: `${calculatePercentage(feature.used, feature.total)}%` }}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-end">
                            {feature.isUnlimited ? (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                                -
                              </span>
                            ) : feature.remaining !== null ? (
                              <span className={`text-lg font-semibold ${feature.remaining < 5 ? 'text-red-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                {feature.remaining}
                              </span>
                            ) : (
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Table Footer */}
                    <div className={`p-4 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total actions this month
                        </span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {aiUsageData.usedActions} / {aiUsageData.totalActions}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                      onClick={handleBuyMoreActions}
                      className={` self-end mt-5 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all hover:scale-[1.02] ${theme === 'dark'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md'
                        }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy More 
                    </button>

                 
                 
                </div>
              )}

              {activeSettingsTab === 'websiteIntegration' && (
                <div className="p-8">
                  {/* Header with Generate Button */}
                  <div className="flex items-center justify-between mb-8">
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
                        className={`px-4 py-2 flex items-center rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
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

                  {/* Show Help Section when help button is clicked */}
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
                          title="Close help"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Help Content */}
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
                    /* Show API Credentials Section when credentials are generated */
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
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={websiteIntegrationData.api_key || ''}
                                readOnly
                                className={`flex-1 px-4 py-3 rounded-lg border font-mono text-sm ${theme === 'dark'
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
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={websiteIntegrationData.api_secret || ''}
                                readOnly
                                className={`flex-1 px-4 py-3 rounded-lg border font-mono text-sm ${theme === 'dark'
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
                            
                            {/* Help Button - Only show when credentials are generated */}
                            <div className="flex items-center justify-between mt-2">
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
                      /* Show initial state before generation */
                      <div className={`p-8 text-center border-2 border-dashed rounded-lg ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
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

                  {/* Loading State */}
                  {isGeneratingIntegration && (
                    <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-300'}`}>
                      <p className={`text-sm flex items-center justify-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating API credentials...
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {activeSettingsTab !== 'profile' && activeSettingsTab !== 'aiUsage' && activeSettingsTab !== 'websiteIntegration' && (
                <div className="p-8 text-center">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {settingsSections.flatMap(s => s.items).find(i => i.id === activeSettingsTab)?.label}
                  </h3>
                  <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Content for this section is not yet implemented.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isChangingPassword && (
        <>
          {/* Backdrop with Blur */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[80]"
            onClick={() => {
              setPasswordData({ newPassword: '', confirmPassword: '' });
              setPasswordErrors({});
              setIsChangingPassword(false);
            }}
          />

          {/* Password Change Modal */}
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div
              className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
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

              {/* Modal Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                          : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
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

                  {/* Confirm Password */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                          : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                        } ${passwordErrors.confirmPassword ? 'border-red-500' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Confirm new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
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