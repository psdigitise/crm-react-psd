import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { getUserSession } from '../utils/session';
import { AUTH_TOKEN, getAuthToken } from '../api/apiUrl';

// Address Modal Component
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
  const [errors, setErrors] = useState({
    address_title: '',
    address_line1: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'address_title':
        if (!value.trim()) {
          error = 'Address title is required';
        } else if (value.trim().length < 2) {
          error = 'Address title must be at least 2 characters long';
        }
        break;
      case 'address_line1':
        if (!value.trim()) {
          error = 'Address is required';
        } else if (value.trim().length < 5) {
          error = 'Address must be at least 5 characters long';
        }
        break;
      case 'city':
        if (!value.trim()) {
          error = 'City is required';
        } else if (value.trim().length < 2) {
          error = 'City must be at least 2 characters long';
        }
        break;
      case 'country':
        if (!value.trim()) {
          error = 'Country is required';
        }
        break;
      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {
      address_title: validateField('address_title', formData.address_title),
      address_line1: validateField('address_line1', formData.address_line1),
      city: validateField('city', formData.city),
      country: validateField('country', formData.country)
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== '');
  };

  // In CreateOrganizationModal component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the validation errors', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const token = getAuthToken();
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

      // Step 1: Create the organization
      const createApiUrl = 'https://api.erpnext.ai/api/method/frappe.client.insert';

      const createResponse = await fetch(createApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(payload)
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();

        // Check if it's a duplicate entry error (409 Conflict)
        if (createResponse.status === 409) {
          showToast('An organization with this name already exists', { type: 'error' });
          return;
        }

        throw new Error(`HTTP ${createResponse.status}: ${createResponse.statusText} - ${errorText}`);
      }

      const createResult = await createResponse.json();

      // Step 2: Immediately fetch the updated data
      try {
        await fetchUpdatedOrganizations();
      } catch (refreshError) {
        console.error('Failed to refresh table data:', refreshError);
        // Don't fail the entire operation if refresh fails
      }

      showToast('Organization created successfully', { type: 'success' });

      // Call onSubmit with the created result
      onSubmit(createResult);
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
      setErrors({
        organization_name: '',
        website: '',
        annual_revenue: ''
      });
    } catch (error) {
      console.error('Error creating organization:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('DuplicateEntryError') || error.message.includes('409')) {
          showToast('An organization with this name already exists', { type: 'error' });
        } else {
          showToast('Failed to create organization', { type: 'error' });
        }
      } else {
        showToast('Failed to create organization', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Add this function to fetch updated organizations (IN THE CreateOrganizationModal COMPONENT)
  const fetchUpdatedOrganizations = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const token = getAuthToken();

      if (!session) return;

      // This is the same API call used in OrganizationsTable
      const refreshApiUrl = 'https://api.erpnext.ai/api/method/crm.api.doc.get_data';

      const refreshPayload = {
        doctype: "CRM Organization",
        filters: {
          company: sessionCompany
        },
        order_by: "modified desc",
        default_filters: {},
        column_field: "status",
        columns: JSON.stringify([
          { label: "Organization", type: "Data", key: "organization_name", width: "16rem" },
          { label: "Website", type: "Data", key: "website", width: "14rem" },
          { label: "Industry", type: "Link", key: "industry", options: "CRM Industry", width: "92px" },
          { label: "Annual Revenue", type: "Currency", key: "annual_revenue", width: "14rem" },
          { label: "Last Modified", type: "Datetime", key: "modified", width: "8rem" }
        ]),
        kanban_columns: JSON.stringify([]),
        kanban_fields: JSON.stringify([]),
        page_length: 1000,
        page_length_count: 1000,
        rows: JSON.stringify([
          "name", "organization_name", "organization_logo", "website", "industry",
          "currency", "annual_revenue", "modified", "owner", "creation",
          "modified_by", "_assign", "_liked_by", "territory", "no_of_employees"
        ]),
        title_field: "",
        view: {
          custom_view_name: 8,
          view_type: "list",
          group_by_field: "owner"
        }
      };

      const response = await fetch(refreshApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(refreshPayload)
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      // You can optionally return the data or just let it refresh
      return await response.json();
    } catch (error) {
      console.error('Error refreshing organizations:', error);
      throw error;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Validate the field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
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
                  Address Title <span className='text-red-500'>*</span>
                </label>
                <input
                  type="text"
                  name="address_title"
                  value={formData.address_title}
                  onChange={handleChange}
                  placeholder="Address Title"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    } ${errors.address_title ? 'border-red-500' : ''}`}
                />
                {errors.address_title && (
                  <p className="text-red-500 text-xs mt-1">{errors.address_title}</p>
                )}
              </div>

              {/* Address Type */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Address Type
                </label>
                <select
                  name="address_type"
                  value={formData.address_type}
                  onChange={handleChange}
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
                  Country <span className='text-red-500'>*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    } ${errors.country ? 'border-red-500' : ''}`}
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                )}
              </div>

              {/* Address Line 1 */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Address <span className='text-red-500'>*</span>
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  placeholder="Address Line 1"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    } ${errors.address_line1 ? 'border-red-500' : ''}`}
                />
                {errors.address_line1 && (
                  <p className="text-red-500 text-xs mt-1">{errors.address_line1}</p>
                )}
              </div>

              {/* City */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  City <span className='text-red-500'>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    } ${errors.city ? 'border-red-500' : ''}`}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
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
  onRefresh?: () => void;
}

export function CreateOrganizationModal({ isOpen, onClose, onSubmit, onRefresh }: CreateOrganizationModalProps) {
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
  const [errors, setErrors] = useState({
    organization_name: '',
    website: '',
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

  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'organization_name':
        if (!value.trim()) {
          error = 'Organization name is required';
        } else if (value.trim().length < 2) {
          error = 'Organization name must be at least 2 characters long';
        } else if (!/^[a-zA-Z0-9\s\-&.]+$/.test(value)) {
          error = 'Organization name contains invalid characters';
        }
        break;
      case 'website':
        if (value.trim() && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value.trim())) {
          error = 'Please enter a valid website URL';
        }
        break;
      case 'annual_revenue':
        if (value.trim() && isNaN(Number(value))) {
          error = 'Annual revenue must be a valid number';
        } else if (value.trim() && Number(value) < 0) {
          error = 'Annual revenue cannot be negative';
        }
        break;
      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {
      organization_name: validateField('organization_name', formData.organization_name),
      website: validateField('website', formData.website),
      annual_revenue: validateField('annual_revenue', formData.annual_revenue)
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== '');
  };

  const fetchIndustries = async () => {
    setLoadingIndustries(true);
    try {
      const session = getUserSession();
      const token = getAuthToken();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'https://api.erpnext.ai/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
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
      const token = getAuthToken();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'https://api.erpnext.ai/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
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
      const token = getAuthToken();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const sessionCompany = session?.company;

      // Build URL with filter parameter
      let apiUrl = 'https://api.erpnext.ai/api/v2/document/Address';

      // Add filter if session company exists
      if (sessionCompany) {
        const params = new URLSearchParams({
          filters: JSON.stringify({ company: sessionCompany })
        });
        apiUrl += `?${params.toString()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
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

  const handleAddressCreated = async (newAddress: any) => {
    try {
      // First, immediately refetch addresses to get the latest data
      await fetchAddresses();

      // The API response might have the address data in different formats
      const createdAddress = newAddress.data || newAddress.message || newAddress;

      if (createdAddress && createdAddress.name) {
        // Select the newly created address after a short delay to ensure fetch is complete
        setTimeout(() => {
          setFormData(prev => ({ ...prev, address: createdAddress.name }));
        }, 300);
      }
    } catch (error) {
      console.error('Error handling created address:', error);
    } finally {
      setShowAddressModal(false);
    }
  };

  if (!isOpen) return null;

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the validation errors', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const token = getAuthToken();
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

      const apiUrl = 'https://api.erpnext.ai/api/method/frappe.client.insert';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Check if it's a duplicate entry error (409 Conflict)
        if (response.status === 409) {
          showToast('An organization with this name already exists', { type: 'error' });
          return;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      showToast('Organization created successfully', { type: 'success' });

      // Call onSubmit with the created result
      onSubmit(result);

      // Call onRefresh if provided (this will trigger table refresh)
      if (onRefresh) {
        onRefresh();
      }

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
      setErrors({
        organization_name: '',
        website: '',
        annual_revenue: ''
      });
    } catch (error) {
      console.error('Error creating organization:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('DuplicateEntryError') || error.message.includes('409')) {
          showToast('An organization with this name already exists', { type: 'error' });
        } else {
          showToast('Failed to create organization', { type: 'error' });
        }
      } else {
        showToast('Failed to create organization', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Validate the field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'create_new') {
      setShowAddressModal(true);
    } else {
      handleChange(e);
    }
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
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white !placeholder-gray-100'
                      : 'bg-white/80 border-gray-300 !placeholder-gray-500'
                      } ${errors.organization_name ? 'border-red-500' : ''}`}
                  />
                  {errors.organization_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.organization_name}</p>
                  )}
                </div>

                {/* Second row - Website and Annual Revenue */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Website"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white !placeholder-gray-100'
                      : 'bg-white/80 border-gray-300 !placeholder-gray-500'
                      } ${errors.website ? 'border-red-500' : ''}`}
                  />
                  {errors.website && (
                    <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    Annual Revenue
                  </label>
                  <input
                    type="text"
                    name="annual_revenue"
                    value={formData.annual_revenue}
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleChange(e);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!/[0-9.]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="₹ 0.00"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white !placeholder-gray-100'
                      : 'bg-white/80 border-gray-300 !placeholder-gray-500'
                      } ${errors.annual_revenue ? 'border-red-500' : ''}`}
                  />
                  {errors.annual_revenue && (
                    <p className="text-red-500 text-xs mt-1">{errors.annual_revenue}</p>
                  )}
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
                      onChange={handleAddressChange}
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