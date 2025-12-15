import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

import { getUserSession } from '../utils/session';
import { AUTH_TOKEN, getAuthToken } from '../api/apiUrl';

interface CreateNoteModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  leadName?: string;
  onNoteCreated?: () => void;
}

interface ValidationErrors {
  title?: string;
  content?: string;
}

export function CreateNoteModalNew({ 
  isOpen, 
  onClose, 
  onSubmit, 
  leadName, 
  onNoteCreated 
}: CreateNoteModalNewProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    reference_doctype: 'CRM Lead',
    reference_docname: leadName || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  if (!isOpen) return null;

  // Validation function
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.trim().length < 2) return 'Title must be at least 2 characters long';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        return '';
      
      case 'content':
        if (!value.trim()) return 'Content is required';
        if (value.trim().length < 10) return 'Content must be at least 10 characters long';
        if (value.trim().length > 5000) return 'Content must be less than 5000 characters';
        return '';
      
      default:
        return '';
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      title: validateField('title', formData.title),
      // content: validateField('content', formData.content)
    };

    setErrors(newErrors);
    return !newErrors.title && !newErrors.content;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate field on change and update errors
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      showToast('Please fill required fields', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Get company from session
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const token = getAuthToken();

      // Prepare the document data according to the API specification
      const docData = {
        doctype: "FCRM Note",
        title: formData.title.trim(),
        content: formData.content.trim(),
        company: sessionCompany,
        reference_doctype: formData.reference_doctype,
        reference_docname: formData.reference_docname
      };

      // Updated API endpoint and request body
      const apiUrl = 'https://api.erpnext.ai/api/method/frappe.client.insert';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           'Authorization': token
        },
        body: JSON.stringify({
          doc: docData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      showToast('Note created successfully', { type: 'success' });
      onSubmit(result);
      
      // Call the refresh callback if provided
      if (onNoteCreated) {
        onNoteCreated();
      }
      
      onClose();

      // Reset form and errors
      setFormData({
        title: '',
        content: '',
        reference_doctype: 'CRM Lead',
        reference_docname: leadName || ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating note:', error);
      showToast('Failed to create note', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full backdrop-blur-md ${theme === 'dark'
          ? 'bg-custom-gradient border-transparent !border-white border-2'
          : 'bg-white/90 border border-gray-200'
          }`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
            }`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Create Note
            </h3>
            <div className="flex items-center space-x-2">
              {/* <button className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                }`}>
                <ExternalLink className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
              </button> */}
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
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Title <span className='text-red-500'>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Note Title"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white !placeholder-gray-100'
                    : 'bg-white/80 border-gray-300 !placeholder-gray-500'
                    } ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Content 
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter note content..."
                  rows={6}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white !placeholder-gray-100'
                    : 'bg-white/80 border-gray-300 !placeholder-gray-500'
                    } ${errors.content ? 'border-red-500' : ''}`}
                />
               
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                  ? 'bg-purplebg hover:bg-purple-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}