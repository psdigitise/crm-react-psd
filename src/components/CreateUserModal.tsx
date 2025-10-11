import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { getUserSession } from '../utils/session';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company: 'PSDigitise',
    role_profile_name: 'Only If Create',
    new_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: "",
    first_name: "",
    new_password: ""
  });


  if (!isOpen) return null;

  const validateForm = () => {
    const errors: any = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    }
    if (!formData.first_name.trim()) {
      errors.first_name = "First Name is required";
    }
    if (!formData.new_password.trim()) {
      errors.new_password = "Password is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0; // true if no errors
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // stop if validation fails
    }

    setLoading(true);

    try {
      const session = getUserSession();
      if (!session?.api_key || !session?.api_secret) {
        showToast('Authentication required', { type: 'error' });
        return;
      }

      const sessionCompany = session?.company || 'PSDigitise';

      const apiUrl = 'https://api.erpnext.ai/api/v2/document/User/';

      const payload = {
        ...formData,
        company: sessionCompany,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = "Failed to create user";

        try {
          const errorData = await response.json();

          if (errorData?.errors?.length > 0) {
            errorMsg = errorData.errors[0].message;
          } else if (errorData?.messages?.length > 0) {
            errorMsg = errorData.messages[0].message;
          }
        } catch {
          const errorText = await response.text();
          errorMsg = errorText;
        }

        // 🔹 Strip HTML tags before showing
        errorMsg = errorMsg.replace(/<[^>]*>/g, "").trim();

        showToast(errorMsg, { type: "error" });
        throw new Error(errorMsg);
      }

      const result = await response.json();
      showToast('User created successfully', { type: 'success' });
      onSubmit(result); // This will trigger the refresh in parent
      onClose();

      // Reset form
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        company: sessionCompany,
        role_profile_name: 'Only If Create',
        new_password: ''
      });

    } catch (error) {
      console.error('Error creating user:', error);
      //showToast('Failed to create user', { type: 'error' });
      if (!(error instanceof Error)) {
        showToast("Failed to create user", { type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full backdrop-blur-md ${theme === 'dark'
          ? 'bg-custom-gradient border-transparent !border-white border-2'
          : 'bg-white/90 border border-gray-200'
          }`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
            }`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Create User
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                  }`}
              >
                <X className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First Name"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
                {formErrors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>
                )}

              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="First Name"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Role Profile Name
                </label>
                <select
                  name="role_profile_name"
                  value={formData.role_profile_name}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="Only If Create">Only If Create</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-700"
                    }`}
                >
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="Password"
                    disabled={loading}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === "dark"
                      ? "bg-white-31 border-white text-white placeholder-gray-400"
                      : "bg-white/80 border-gray-300 text-black placeholder-gray-500"
                      }`}
                  />

                  {/* 👇 Eye icon at right end */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className={`w-5 h-5 ${theme === "dark" ? "text-white" : "text-black"
                        }`} />
                    ) : (
                      <Eye className={`w-5 h-5 ${theme === "dark" ? "text-white" : "text-gray-400"
                        }`} />
                    )}
                  </button>
                </div>
                {formErrors.new_password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.new_password}</p>
                )}
              </div>

            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={`px-6 py-2 rounded-lg transition-colors mr-4 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                  ? 'bg-purplebg hover:bg-purple-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}