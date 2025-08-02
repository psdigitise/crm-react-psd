
import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

import { getUserSession } from '../utils/session';

interface CreateCallLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  leadName?: string;
}

export function CreateCallLogModal({ isOpen, onClose, onSubmit, leadName }: CreateCallLogModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    status: 'Ringing',
    type: 'Outgoing',
    duration: '',
    reference_doctype: 'CRM Lead',
    id: leadName || ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // try {

    //   const sessionCompany = sessionStorage.getItem('company') || '';

    //   // Add company to payload
    //   const payload = {
    //     ...formData,
    //     company: sessionCompany, // <-- add this line
    //   };


    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      // Add company to payload
      const payload = {
        ...formData,
        company: sessionCompany,
      };




      const apiUrl = 'http://103.214.132.20:8002/api/v2/document/CRM Call Log/';

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
      showToast('Call log created successfully', { type: 'success' });
      onSubmit(result);
      onClose();

      // Reset form
      setFormData({
        from: '',
        to: '',
        status: 'Ringing',
        type: 'Outgoing',
        duration: '',
        reference_doctype: 'CRM Lead',
        id: leadName || ''
      });
    } catch (error) {
      console.error('Error creating call log:', error);
      showToast('Failed to create call log', { type: 'error' });
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
              Create Call Log
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
                  From
                </label>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  placeholder="From Number"
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
                  To
                </label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  placeholder="To Number"
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
                  <option value="Ringing">Ringing</option>
                  <option value="Answered">Answered</option>
                  <option value="Busy">Busy</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="Incoming">Incoming</option>
                  <option value="Outgoing">Outgoing</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Duration (seconds)
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Duration in seconds"
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
                  Reference ID
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="Reference ID"
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