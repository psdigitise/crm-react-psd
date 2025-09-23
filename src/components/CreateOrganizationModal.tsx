import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { getUserSession } from '../utils/session';

// Address Modal Component (same as in CreateContactModal)
interface CreateAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: any) => void;
}

function CreateAddressModal({ isOpen, onClose, onSubmit }: CreateAddressModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    address_title: '',
    address_type: 'Billing',
    address_line1: '',
    city: '',
    country: 'India'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/v2/document/Address';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      showToast('Address created successfully', { type: 'success' });
      onSubmit(result);
      onClose();

      // Reset form
      setFormData({
        address_title: '',
        address_type: 'Billing',
        address_line1: '',
        city: '',
        country: 'India'
      });
    } catch (error) {
      console.error('Error creating address:', error);
      showToast('Failed to create address', { type: 'error' });
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
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full backdrop-blur-md ${theme === 'dark'
          ? 'bg-custom-gradient border-transparent'
          : 'bg-white/90 border border-gray-200'
          }`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
            }`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Create Address
            </h3>
            <button
              onClick={onClose}
              className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                }`}
            >
              <X className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address Title */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Address Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address_title"
                  value={formData.address_title}
                  onChange={handleChange}
                  placeholder="Address Title"
                  required
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>

              {/* Address Type */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Address Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="address_type"
                  value={formData.address_type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="Billing">Billing</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Office">Office</option>
                  <option value="Personal">Personal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Country */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>

              {/* Address Line 1 */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  placeholder="Address Line 1"
                  required
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>

              {/* City */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={`mr-3 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${theme === 'dark'
                  ? 'text-white border border-gray-600 hover:bg-gray-700'
                  : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                  ? 'bg-purplebg hover:bg-purple-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
              >
                {loading ? 'Creating...' : 'Create Address'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Updated Organization Modal Interface
interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreateOrganizationModal({ isOpen, onClose, onSubmit }: CreateOrganizationModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    organization_name: '',
    website: '',
    address: '',
    no_of_employees: '',
    territory: '',
    industry: '',
    annual_revenue: ''
  });
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [loadingTerritories, setLoadingTerritories] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
      fetchIndustries();
      fetchTerritories();
    }
  }, [isOpen]);

  const fetchIndustries = async () => {
    setLoadingIndustries(true);
    try {
      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Industry"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setIndustries(result.message || []);
    } catch (error) {
      console.error('Error fetching industries:', error);
      showToast('Failed to fetch industries', { type: 'error' });
    } finally {
      setLoadingIndustries(false);
    }
  };

  const fetchTerritories = async () => {
    setLoadingTerritories(true);
    try {
      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Territory"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setTerritories(result.message || []);
    } catch (error) {
      console.error('Error fetching territories:', error);
      showToast('Failed to fetch territories', { type: 'error' });
    } finally {
      setLoadingTerritories(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/v2/document/Address';

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setAddresses(result.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      showToast('Failed to fetch addresses', { type: 'error' });
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressCreated = (newAddress: any) => {
    // Add the new address to the list and select it
    setAddresses(prev => [...prev, newAddress]);
    setFormData(prev => ({ ...prev, address: newAddress.name || newAddress.address_title }));
    setShowAddressModal(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      // Prepare payload according to new API structure
      const payload = {
        doc: {
          doctype: "CRM Organization",
          organization_name: formData.organization_name,
          website: formData.website,
          address: formData.address,
          company: sessionCompany,
          annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : undefined,
          industry: formData.industry,
          no_of_employees: formData.no_of_employees,
          territory: formData.territory
        }
      };

      // Remove undefined fields from the doc object
      Object.keys(payload.doc).forEach(key => {
        if (payload.doc[key] === undefined || payload.doc[key] === '') {
          delete payload.doc[key];
        }
      });

      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.client.insert';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      showToast('Organization created successfully', { type: 'success' });
      onSubmit(result);
      onClose();

      // Reset form
      setFormData({
        organization_name: '',
        website: '',
        address: '',
        no_of_employees: '',
        territory: '',
        industry: '',
        annual_revenue: ''
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      showToast('Failed to create organization', { type: 'error' });
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
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

          <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full backdrop-blur-md ${theme === 'dark'
            ? 'bg-custom-gradient border-transparent !border-white border-2'
            : 'bg-white/90 border border-gray-200'
            }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
              }`}>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                New Organization
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
              <div className="grid grid-cols-2 gap-6">
                {/* First row - Organization Name (full width) */}
                <div className="col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    placeholder="Organization Name"
                    required
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 placeholder-gray-500'
                      }`}
                  />
                </div>

                {/* Second row - Website and Annual Revenue */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Website"
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
                    Annual Revenue
                  </label>
                  <input
                    type="number"
                    name="annual_revenue"
                    value={formData.annual_revenue}
                    onChange={handleChange}
                    placeholder="₹ 0.00"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 placeholder-gray-500'
                      }`}
                  />
                </div>

                {/* Third row - Territory (full width) */}
                <div className="col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    Territory
                  </label>
                  <select
                    name="territory"
                    value={formData.territory}
                    onChange={handleChange}
                    disabled={loading || loadingTerritories}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'bg-gray-50/80 border-gray-300'
                      }`}
                  >
                    <option value="">Select Territory</option>
                    {territories.map((territory: any) => (
                      <option key={territory.value} value={territory.value}>
                        {territory.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fourth row - No. of Employees and Industry */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    No. of Employees
                  </label>
                  <select
                    name="no_of_employees"
                    value={formData.no_of_employees}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'bg-gray-50/80 border-gray-300'
                      }`}
                  >
                    <option value="">No. of Employees</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    disabled={loading || loadingIndustries}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'bg-gray-50/80 border-gray-300'
                      }`}
                  >
                    <option value="">Industry</option>
                    {industries.map((industry: any) => (
                      <option key={industry.value} value={industry.value}>
                        {industry.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fifth row - Address with dropdown (full width) */}
                <div className="col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    Address
                  </label>
                  <div className="relative">
                    <select
                      name="address"
                      value={formData.address}
                      onChange={(e) => {
                        if (e.target.value === 'create_new') {
                          setShowAddressModal(true);
                          // Reset the select to the previous value
                          e.target.value = formData.address;
                        } else {
                          handleChange(e);
                        }
                      }}
                      disabled={loading || loadingAddresses}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm appearance-none ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white'
                        : 'bg-gray-50/80 border-gray-300'
                        }`}
                    >
                      {addresses.length > 0 ? (
                        <>
                          <option value="">Select Address</option>
                          {addresses.map((address: any) => (
                            <option key={address.name} value={address.name}>
                              {address.address_title || address.name}
                            </option>
                          ))}
                          <option
                            value="create_new"
                            className="font-medium"
                            style={{
                              borderTop: '1px solid #e5e7eb',
                              paddingTop: '8px',
                              marginTop: '4px'
                            }}
                          >
                            + Create New
                          </option>
                        </>
                      ) : (
                        <>
                          <option value="">No addresses available</option>
                          <option
                            value="create_new"
                            className="font-medium"
                            style={{
                              borderTop: '1px solid #e5e7eb',
                              paddingTop: '8px',
                              marginTop: '4px'
                            }}
                          >
                            + Create New
                          </option>
                        </>
                      )}
                    </select>

                    {/* Custom dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg className={`fill-current h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
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

      {/* Address Modal */}
      <CreateAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleAddressCreated}
      />
    </>
  );
}

export default CreateOrganizationModal;