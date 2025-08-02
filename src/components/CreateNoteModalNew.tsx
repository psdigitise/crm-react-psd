
import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

import { getUserSession } from '../utils/session';

interface CreateNoteModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  leadName?: string;
}

export function CreateNoteModalNew({ isOpen, onClose, onSubmit, leadName }: CreateNoteModalNewProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    reference_doctype: 'CRM Lead',
    reference_docname: leadName || ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const apiUrl = 'http://103.214.132.20:8002/api/v2/document/FCRM Note/';

  //     const response = await fetch(apiUrl, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
  //       },
  //       body: JSON.stringify(formData)
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //     }

  //     const result = await response.json();
  //     showToast('Note created successfully', { type: 'success' });
  //     onSubmit(result);
  //     onClose();

  //     // Reset form
  //     setFormData({
  //       title: '',
  //       content: '',
  //       reference_doctype: 'CRM Lead',
  //       reference_docname: leadName || ''
  //     });
  //   } catch (error) {
  //     console.error('Error creating note:', error);
  //     showToast('Failed to create note', { type: 'error' });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // try {
    //   // Get company from sessionStorage
    //   const sessionCompany = sessionStorage.getItem('company') || '';

    //   // Add company to payload
    //   const payload = {
    //     ...formData,
    //     company: sessionCompany, // <-- add this line
    //   };
    try {
      // Get company from session
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      // Add company to payload
      const payload = {
        ...formData,
        company: sessionCompany,
      };
      const apiUrl = 'http://103.214.132.20:8002/api/v2/document/FCRM Note/';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      showToast('Note created successfully', { type: 'success' });
      onSubmit(result);
      onClose();

      // Reset form
      setFormData({
        title: '',
        content: '',
        reference_doctype: 'CRM Lead',
        reference_docname: leadName || ''
      });
    } catch (error) {
      console.error('Error creating note:', error);
      showToast('Failed to create note', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
              <button className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                }`}>
                <ExternalLink className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
              </button>
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
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Note Title"
                  required
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
                  Reference Document Type
                </label>
                <select
                  name="reference_doctype"
                  value={formData.reference_doctype}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="CRM Lead">CRM Lead</option>
                  <option value="CRM Deal">CRM Deal</option>
                  <option value="Contact">Contact</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Reference Document Name
                </label>
                <input
                  type="text"
                  name="reference_docname"
                  value={formData.reference_docname}
                  onChange={handleChange}
                  placeholder="Document Name"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter note content..."
                  rows={6}
                  required
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
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