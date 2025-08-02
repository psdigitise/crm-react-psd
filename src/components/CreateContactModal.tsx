
import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';


import { getUserSession } from '../utils/session';

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreateContactModal({ isOpen, onClose, onSubmit }: CreateContactModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    user: 'Administrator',
    status: 'Open',
    salutation: '',
    designation: '',
    gender: '',
    company_name: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const apiUrl = 'http://103.214.132.20:8002/api/v2/document/Contact/';

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
  //     showToast('Contact created successfully', { type: 'success' });
  //     onSubmit(result);
  //     onClose();

  //     // Reset form
  //     setFormData({
  //       first_name: '',
  //       middle_name: '',
  //       last_name: '',
  //       user: 'Administrator',
  //       status: 'Open',
  //       salutation: '',
  //       designation: '',
  //       gender: '',
  //       company_name: ''
  //     });
  //   } catch (error) {
  //     console.error('Error creating contact:', error);
  //     showToast('Failed to create contact', { type: 'error' });
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
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      if (!sessionCompany) {
        setError('Company information is missing from session.');
        return;
      }

      // Add company to payload
      const payload = {
        ...formData,
        company: sessionCompany, // ✅ Consistent session usage
      };


      const apiUrl = 'http://103.214.132.20:8002/api/v2/document/Contact/';

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
      showToast('Contact created successfully', { type: 'success' });
      onSubmit(result);
      onClose();

      // Reset form
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        user: 'Administrator',
        status: 'Open',
        salutation: '',
        designation: '',
        gender: '',
        company_name: ''
      });
    } catch (error) {
      console.error('Error creating contact:', error);
      showToast('Failed to create contact', { type: 'error' });
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

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full backdrop-blur-md ${theme === 'dark'
          ? 'bg-custom-gradient border-transparent'
          : 'bg-white/90 border border-gray-200'
          }`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
            }`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Create Contact
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Salutation
                </label>
                <select
                  name="salutation"
                  value={formData.salutation}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="">Salutation</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Dr">Dr</option>
                </select>
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
                  required
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="Middle Name"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
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
                  placeholder="Last Name"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Company Name"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Designation"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
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
                    ? 'bg-white-31 text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="Open">Open</option>
                  <option value="Replied">Replied</option>
                  <option value="Opportunity">Opportunity</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Lost Quotation">Lost Quotation</option>
                  <option value="Interested">Interested</option>
                  <option value="Converted">Converted</option>
                  <option value="Do Not Contact">Do Not Contact</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  User
                </label>
                <select
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="Administrator">👤 Administrator</option>
                  <option value="Manager">👤 Manager</option>
                  <option value="Sales Rep">👤 Sales Rep</option>
                </select>
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

function setError(arg0: string) {
  throw new Error('Function not implemented.');
}
