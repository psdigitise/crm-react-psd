import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { getUserSession } from '../utils/session';
import { AUTH_TOKEN } from '../api/apiUrl';

interface CreateCallLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onSuccess?: () => void;
  leadName?: string;
  isEditMode?: boolean;
  OwnersOptions?: any[];
}

export function CreateCallLogModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  leadName,
  isEditMode = false,
  OwnersOptions = []
}: CreateCallLogModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    status: 'Ringing',
    type: 'Outgoing',
    duration: '',
    reference_doctype: '',
    id: leadName || '',
    caller: '',
    receiver: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [userOptions, setUserOptions] = useState<{ value: string; label: string; }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Theme-based styling
  const cardBgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const inputBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      const response = await fetch(
        'https://api.erpnext.ai/api/method/frappe.desk.search.search_link',
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            txt: "",
            doctype: "User",
            filters: sessionCompany ? { company: sessionCompany } : null
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const options = data.message.map((item: { value: string; description: string; }) => ({
          value: item.value,
          label: item.description || item.value
        }));
        setUserOptions(options);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast('Failed to load user list', { type: 'error' });
    } finally {
      setUsersLoading(false);
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'type':
        if (!value.trim()) return 'Type is required';
        return '';
      
      case 'to':
        if (!value.trim()) return 'To field is required';
        return '';
      
      case 'from':
        if (!value.trim()) return 'From field is required';
        return '';
      
     
      
      case 'duration':
        if (value && (parseInt(value) < 0 || isNaN(parseInt(value)))) {
          return 'Duration must be a positive number';
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate all fields
    newErrors.type = validateField('type', formData.type);
    newErrors.to = validateField('to', formData.to);
    newErrors.from = validateField('from', formData.from);
    newErrors.caller = validateField('caller', formData.caller);
    newErrors.receiver = validateField('receiver', formData.receiver);
    newErrors.duration = validateField('duration', formData.duration);
    
    setErrors(newErrors);
    
    // Check if any errors exist
    return !Object.values(newErrors).some(error => error !== '');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      showToast('Please fix the validation errors', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Prepare the document data according to the new API structure
      const doc: any = {
        doctype: "CRM Call Log",
        from: formData.from,
        to: formData.to,
        status: formData.status,
        type: formData.type,
        //duration: formData.duration,
        reference_doctype: formData.reference_doctype,
        id: randomId,
        receiver: formData.receiver,
        caller: formData.caller,
        telephony_medium: "Manual",
        reference_docname: leadName || '', // Assuming leadName is the reference document name
        company: sessionCompany
      };

      if (formData.duration) {
        doc.duration = formData.duration;
      }

      const apiUrl = 'https://api.erpnext.ai/api/method/frappe.client.insert';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify({
          doc: doc
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      showToast(`Call log ${isEditMode ? 'updated' : 'created'} successfully`, { type: 'success' });
      onSubmit(result);
      if (onSuccess) {
        await onSuccess();
      }
      onClose();

      // Reset form
      setFormData({
        from: '',
        to: '',
        status: 'Ringing',
        type: 'Outgoing',
        duration: '',
        reference_doctype: '',
        id: leadName || '',
        caller: '',
        receiver: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating call log:', error);
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} call log`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    const updatedFormData = { ...formData };

    if (name === 'type') {
      // Reset caller/receiver when type changes
      updatedFormData.type = value;
      updatedFormData.caller = value === 'Incoming' ? '' : formData.caller;
      updatedFormData.receiver = value === 'Outgoing' ? '' : formData.receiver;
    } else {
      updatedFormData[name as keyof typeof formData] = value;
    }

    setFormData(updatedFormData);

    // Validate the changed field in real-time
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      from: '',
      to: '',
      status: 'Ringing',
      type: 'Outgoing',
      duration: '',
      reference_doctype: '',
      id: leadName || '',
      caller: '',
      receiver: ''
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-2xl ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
          {isEditMode ? 'Edit Call Log' : 'New Call Log'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Field */}
            <div>
              <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                Type 
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } ${errors.type ? 'border-red-500' : ''}`}
              >
                <option value="Outgoing">Outgoing</option>
                <option value="Incoming">Incoming</option>
                {/* <option value="Missed">Missed</option> */}
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type}</p>
              )}
            </div>

            {/* To Field */}
            <div>
              <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                } ${errors.to ? 'border-red-500' : ''}`}
                placeholder="To"
              />
              {errors.to && (
                <p className="text-red-500 text-xs mt-1">{errors.to}</p>
              )}
            </div>

            {/* From Field */}
            <div>
              <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                From <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                } ${errors.from ? 'border-red-500' : ''}`}
                placeholder="From"
              />
              {errors.from && (
                <p className="text-red-500 text-xs mt-1">{errors.from}</p>
              )}
            </div>

            {/* Status Field */}
            <div>
              <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {["Initiated", "Ringing", "In Progress", "Completed", "Failed", "Busy", "No Answer", "Queued", "Canceled"].map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Duration Field */}
            <div>
              <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                Duration
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                } ${errors.duration ? 'border-red-500' : ''}`}
                placeholder="Call duration in seconds"
                min="0"
              />
              {errors.duration && (
                <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Caller Field (for Outgoing calls) */}
            {formData.type === 'Outgoing' && (
              <div>
                <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                  Caller
                </label>
                <select
                  name="caller"
                  value={formData.caller}
                  onChange={handleChange}
                  disabled={loading || usersLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${usersLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
                    errors.caller ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select Caller</option>
                  {userOptions.map((user) => (
                    <option key={user.value} value={user.value}>
                      {user.label}
                    </option>
                  ))}
                </select>
                {usersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading users...</p>
                )}
                {errors.caller && (
                  <p className="text-red-500 text-xs mt-1">{errors.caller}</p>
                )}
              </div>
            )}

            {/* Receiver Field (for Incoming calls) */}
            {formData.type === 'Incoming' && (
              <div>
                <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                  Call Received By 
                </label>
                <select
                  name="receiver"
                  value={formData.receiver}
                  onChange={handleChange}
                  disabled={loading || usersLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${usersLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
                    errors.receiver ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select Receiver</option>
                  {userOptions.map((user) => (
                    <option key={user.value} value={user.value}>
                      {user.label}
                    </option>
                  ))}
                </select>
                {usersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading users...</p>
                )}
                {errors.receiver && (
                  <p className="text-red-500 text-xs mt-1">{errors.receiver}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 text-white hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${
                theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              <span>
                {loading
                  ? (isEditMode ? 'Updating...' : 'Creating...')
                  : (isEditMode ? 'Update' : 'Create')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}