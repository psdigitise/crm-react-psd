
import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

import { getUserSession } from '../utils/session';
import { AUTH_TOKEN } from '../api/apiUrl';

interface CreateTodoModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreateTodoModalNew({ isOpen, onClose, onSubmit }: CreateTodoModalNewProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    status: 'Open',
    date: '',
    description: '',
    reference_type: 'CRM Deal'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const apiUrl = 'http://103.214.132.20:8002/api/v2/document/ToDo/';

  //     const response = await fetch(apiUrl, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': AUTH_TOKEN
  //       },
  //       body: JSON.stringify(formData)
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //     }

  //     const result = await response.json();
  //     showToast('Todo created successfully', { type: 'success' });
  //     onSubmit(result);
  //     onClose();

  //     // Reset form
  //     setFormData({
  //       status: 'Open',
  //       date: '',
  //       description: '',
  //       reference_type: 'CRM Deal'
  //     });
  //   } catch (error) {
  //     console.error('Error creating todo:', error);
  //     showToast('Failed to create todo', { type: 'error' });
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
      // Get session from utility
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      // Prepare payload with company
      const payload = {
        ...formData,
        company: sessionCompany,
      };

      const apiUrl = 'http://103.214.132.20:8002/api/v2/document/ToDo/';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      showToast('Todo created successfully', { type: 'success' });
      onSubmit(result);
      onClose();

      // Reset form
      setFormData({
        status: 'Open',
        date: '',
        description: '',
        reference_type: 'CRM Deal'
      });
    } catch (error) {
      console.error('Error creating todo:', error);
      showToast('Failed to create todo', { type: 'error' });
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

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full backdrop-blur-md ${theme === 'dark'
          ? 'bg-custom-gradient border-transparent !border-white border-2'
          : 'bg-white/90 border border-gray-200'
          }`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
            }`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Create TODO
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
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-white/80 border-gray-300'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Reference Type
                </label>
                <select
                  name="reference_type"
                  value={formData.reference_type}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="CRM Deal">CRM Deal</option>
                  <option value="CRM Lead">CRM Lead</option>
                  <option value="Contact">Contact</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter TODO description..."
                  rows={4}
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