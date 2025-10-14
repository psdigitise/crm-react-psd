import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { getAuthToken } from '../api/apiUrl';

interface Deal {
  name: string;
  organization_name: string;
  website: string;
  no_of_employees: string;
  territory: string;
  annual_revenue: string;
  industry: string;
  salutation: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  gender: string;
  status: string;
  deal_owner: string;
  organization_id?: string;
  contact_id?: string;
}

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const API_BASE_URL = 'https://api.erpnext.ai/api';
const AUTH_TOKEN = getAuthToken();

export function CreateDealModal({ isOpen, onClose, onSubmit }: CreateDealModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Deal>({
    name: '',
    organization_name: '',
    website: '',
    no_of_employees: '',
    territory: '',
    annual_revenue: '0.00',
    industry: '',
    salutation: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile_no: '',
    gender: '',
    status: 'Qualification',
    deal_owner: 'Administrator',
    organization_id: '',
    contact_id: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<{ name: string; full_name: string; email: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  // New state variables for toggle buttons
  const [useExistingOrganization, setUseExistingOrganization] = useState(false);
  const [useExistingContact, setUseExistingContact] = useState(false);
  const [organizationOptions, setOrganizationOptions] = useState<string[]>([]);
  const [contactOptions, setContactOptions] = useState<string[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  // New state variables for dynamic dropdowns
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [territoryOptions, setTerritoryOptions] = useState<string[]>([]);
  const [genderOptions, setGenderOptions] = useState<string[]>([]);
  const [salutationOptions, setSalutationOptions] = useState<string[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(false);
  const [isLoadingTerritories, setIsLoadingTerritories] = useState(false);
  const [isLoadingGenders, setIsLoadingGenders] = useState(false);
  const [isLoadingSalutations, setIsLoadingSalutations] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      fetchUsers(); // Use the new function
      fetchIndustryOptions();
      fetchTerritoryOptions();
      fetchGenderOptions();
      fetchSalutationOptions();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setUsers([]);
        setIsLoadingUsers(false);
        return;
      }

      const apiUrl = 'https://api.erpnext.ai/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN,
        },
        body: JSON.stringify({
          txt: "",
          doctype: "User",
          filters: {
            company: sessionCompany
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.message && Array.isArray(result.message)) {
          const userOptions = result.message.map((item: any) => ({
            name: item.value, // This will be passed to the API (email)
            email: item.value, // Email for display
            full_name: item.description || item.value // Full name for display
          }));
          setUsers(userOptions);
        }
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch dynamic dropdown options
  const fetchIndustryOptions = async () => {
    try {
      setIsLoadingIndustries(true);
      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Industry"
        })
      });

      if (response.ok) {
        const result = await response.json();
        const industries = result.message?.map((item: any) => item.value) || [];
        setIndustryOptions(industries);
      }
    } catch (error) {
      console.error('Error fetching industries:', error);
      setIndustryOptions([]);
    } finally {
      setIsLoadingIndustries(false);
    }
  };

  const fetchTerritoryOptions = async () => {
    try {
      setIsLoadingTerritories(true);
      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Territory"
        })
      });

      if (response.ok) {
        const result = await response.json();
        const territories = result.message?.map((item: any) => item.value) || [];
        setTerritoryOptions(territories);
      }
    } catch (error) {
      console.error('Error fetching territories:', error);
      setTerritoryOptions([]);
    } finally {
      setIsLoadingTerritories(false);
    }
  };

  const fetchGenderOptions = async () => {
    try {
      setIsLoadingGenders(true);
      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "Gender"
        })
      });

      if (response.ok) {
        const result = await response.json();
        const genders = result.message?.map((item: any) => item.value) || [];
        setGenderOptions(genders);
      }
    } catch (error) {
      console.error('Error fetching genders:', error);
      setGenderOptions([]);
    } finally {
      setIsLoadingGenders(false);
    }
  };

  const fetchSalutationOptions = async () => {
    try {
      setIsLoadingSalutations(true);
      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "Salutation",
          filters: null
        })
      });

      if (response.ok) {
        const result = await response.json();
        const salutations = result.message?.map((item: any) => item.value) || [];
        setSalutationOptions(salutations);
      }
    } catch (error) {
      console.error('Error fetching salutations:', error);
      setSalutationOptions([]);
    } finally {
      setIsLoadingSalutations(false);
    }
  };

  const fetchOrganizationOptions = async () => {
    try {
      setIsLoadingOrganizations(true);
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setOrganizationOptions([]);
        setIsLoadingOrganizations(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Organization",
          filters: [["company", "=", sessionCompany]]
        })
      });

      if (response.ok) {
        const result = await response.json();
        setOrganizationOptions(result.message?.map((org: any) => org.value) || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizationOptions([]);
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  const fetchContactOptions = async () => {
    try {
      setIsLoadingContacts(true);
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setContactOptions([]);
        setIsLoadingContacts(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "Contact",
          filters: [["company", "=", sessionCompany]]
        })
      });

      if (response.ok) {
        const result = await response.json();
        const contacts = result.message || [];
        const names = contacts
          .map((contact: any) => contact.value)
          .filter((name: string | undefined) => !!name && name.trim() !== "");

        setContactOptions(Array.from(new Set(names)));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContactOptions([]);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Add URL validation function
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is allowed

    // Regular expression for URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    // Test basic pattern
    if (!urlPattern.test(url)) {
      return false;
    }

    // Additional check for valid TLD (optional but recommended)
    const tldPattern = /\.[a-z]{2,}$/i;
    if (!tldPattern.test(url)) {
      return false;
    }

    return true;
  };
  // Add validation function
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Organization validation
    if (useExistingOrganization) {
      if (!formData.organization_id) {
        newErrors.organization_id = 'Please select an organization';
      }
    } else {
      if (!formData.organization_name?.trim()) {
        newErrors.organization_name = 'Organization name is required';
      }
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    // Deal Owner validation
    if (!formData.deal_owner) {
      newErrors.deal_owner = 'Deal owner is required';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., example.com or https://example.com)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.mobile_no) {
      if (!/^\d+$/.test(formData.mobile_no)) {
        newErrors.mobile_no = 'Invalid mobile number (digits only allowed)';
      } else if (formData.mobile_no.length < 10) {
        newErrors.mobile_no = 'Please enter at least 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setErrors({});

    // Validate form before submission
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      if (!sessionCompany) {
        setError('Company not found in session');
        setIsLoading(false);
        return;
      }

      // Prepare the payload according to the API requirements
      const apiPayload = {
        args: {
          //organization: sessionCompany, // Using company from session
          organization_name: formData.organization_name,
          website: formData.website,
          no_of_employees: formData.no_of_employees,
          territory: formData.territory,
          annual_revenue: formData.annual_revenue,
          industry: formData.industry,
          contact: useExistingContact ? formData.contact_id : null,
          salutation: formData.salutation,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          mobile_no: formData.mobile_no,
          gender: formData.gender,
          status: formData.status,
          deal_owner: formData.deal_owner,
          company: sessionCompany,
          organization_id: useExistingOrganization ? formData.organization_id : null,
        }
      };

      const apiUrl = `https://api.erpnext.ai/api/method/crm.fcrm.doctype.crm_deal.crm_deal.create_deal`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN,
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log('Deal created successfully:', result);

      setSuccess('Deal created successfully!');
      onSubmit(result);

      if (result.message) {
        setSuccess('Dead created successfully!');
        const createdDeal = result.message.deal || result.message.data || result.message;
        onSubmit(createdDeal);

        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            organization_name: '',
            website: '',
            no_of_employees: '',
            territory: '',
            annual_revenue: '0.00',
            industry: '',
            salutation: '',
            first_name: '',
            last_name: '',
            email: '',
            mobile_no: '',
            gender: '',
            status: 'Qualification',
            deal_owner: 'Administrator',
            organization_id: '',
            contact_id: '',
          });
          setUseExistingOrganization(false);
          setUseExistingContact(false);
          setSuccess('');
          onClose();
        }, 2000);
      }

    } catch (error) {
      let errorMessage = 'Failed to create deal. Please try again.';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your network connection.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleOrganizationMode = () => {
    const newMode = !useExistingOrganization;
    setUseExistingOrganization(newMode);

    // Clear organization fields and errors when switching modes
    setFormData(prev => ({
      ...prev,
      organization_name: '',
      organization_id: ''
    }));

    // Clear organization-related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.organization_name;
      delete newErrors.organization_id;
      return newErrors;
    });

    // Fetch organizations if switching to existing mode
    if (newMode) {
      fetchOrganizationOptions();
    }
  };

  const toggleContactMode = () => {
    const newMode = !useExistingContact;
    setUseExistingContact(newMode);

    // Clear contact fields when switching modes
    setFormData(prev => ({
      ...prev,
      salutation: '',
      first_name: '',
      last_name: '',
      email: '',
      mobile_no: '',
      gender: '',
      contact_id: ''
    }));

    // Clear contact-related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.contact_id;
      delete newErrors.email;
      delete newErrors.mobile_no;
      return newErrors;
    });

    // Fetch contacts if switching to existing mode
    if (newMode) {
      fetchContactOptions();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full mx-4 backdrop-blur-md ${theme === 'dark'
          ? 'bg-custom-gradient border-transparent !border-white border-2'
          : 'bg-white/90 border border-gray-200'
          }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
            }`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Create Deal
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

          {/* Success/Error Messages */}
          {success && (
            <div className={`mx-4 sm:mx-6 mt-4 p-4 rounded-lg border ${theme === 'dark'
              ? 'bg-green-900/30 border-green-500/30 text-green-300'
              : 'bg-green-50 border-green-200 text-green-800'
              }`}>
              <p className="text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className={`mx-4 sm:mx-6 mt-4 p-4 rounded-lg border ${theme === 'dark'
              ? 'bg-red-900/30 border-red-500/30 text-red-300'
              : 'bg-red-50 border-red-200 text-red-800'
              }`}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Organization Toggle */}
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Choose Existing Organization
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useExistingOrganization}
                    onChange={toggleOrganizationMode}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
                   rounded-full peer dark:bg-gray-700 
                   peer-checked:bg-blue-600 
                   after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                   after:bg-white after:border-gray-300 after:border after:rounded-full 
                   after:h-5 after:w-5 after:transition-all 
                   peer-checked:after:translate-x-full peer-checked:after:border-white"
                  ></div>
                </label>
              </div>

              {/* Contact Toggle */}
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Choose Existing Contact
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useExistingContact}
                    onChange={toggleContactMode}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
                   rounded-full peer dark:bg-gray-700 
                   peer-checked:bg-blue-600 
                   after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                   after:bg-white after:border-gray-300 after:border after:rounded-full 
                   after:h-5 after:w-5 after:transition-all 
                   peer-checked:after:translate-x-full peer-checked:after:border-white"
                  ></div>
                </label>
              </div>
            </div>
            <div className='border-b mb-4'></div>


            <div className="grid grid-cols-1 mb-4 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Organization Fields */}
              {useExistingOrganization ? (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Select Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="organization_id"
                    value={formData.organization_id}
                    onChange={handleChange}
                    disabled={isLoading || isLoadingOrganizations}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'bg-gray-50/80 border-gray-300'
                      }`}
                  >
                    <option value="">Select Organization</option>
                    {organizationOptions.map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                  {errors.organization_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.organization_id}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                      placeholder="Organization Name"

                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 placeholder-gray-500'
                        }`}
                    />
                    {errors.organization_name && (
                      <p className="text-sm text-red-500 mt-1">{errors.organization_name}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="Website"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 placeholder-gray-500'
                        }`}
                    />
                    {errors.website && (
                      <p className="text-sm text-red-500 mt-1">{errors.website}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      No. of Employees
                    </label>
                    <select
                      name="no_of_employees"
                      value={formData.no_of_employees}
                      onChange={handleChange}
                      disabled={isLoading}
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
                      <option value="500-1000">500-1000</option>
                      <option value="1000+">1000+</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Territory
                    </label>
                    <select
                      name="territory"
                      value={formData.territory}
                      onChange={handleChange}
                      disabled={isLoading || isLoadingTerritories}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white'
                        : 'bg-gray-50/80 border-gray-300'
                        }`}
                    >
                      <option value="">Territory</option>
                      {territoryOptions.map(territory => (
                        <option key={territory} value={territory}>{territory}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Annual Revenue
                    </label>
                    <input
                      type="text"
                      name="annual_revenue"
                      value={formData.annual_revenue}
                      onChange={handleChange}
                      placeholder="₹ 0.00"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 placeholder-gray-500'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      disabled={isLoading || isLoadingIndustries}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white'
                        : 'bg-gray-50/80 border-gray-300'
                        }`}
                    >
                      <option value="">Industry</option>
                      {industryOptions.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className='border-b mb-4'></div>
            <div className="grid grid-cols-1 mb-4 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Contact Fields */}
              {useExistingContact ? (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Select Contact
                  </label>
                  <select
                    name="contact_id"
                    value={formData.contact_id}
                    onChange={handleChange}
                    disabled={isLoading || isLoadingContacts}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'bg-gray-50/80 border-gray-300'
                      }`}
                  >
                    <option value="">Select Contact</option>
                    {contactOptions.map(contact => (
                      <option key={contact} value={contact}>{contact}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Salutation
                    </label>
                    <select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      disabled={isLoading || isLoadingSalutations}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white'
                        : 'bg-gray-50/80 border-gray-300'
                        }`}
                    >
                      <option value="">Salutation</option>
                      {salutationOptions.map(salutation => (
                        <option key={salutation} value={salutation}>{salutation}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First Name"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 placeholder-gray-500'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last Name"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 placeholder-gray-500'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 placeholder-gray-500'
                        }`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Mobile No
                    </label>
                    <input
                      type="text"
                      name="mobile_no"
                      value={formData.mobile_no}
                      onChange={handleChange}
                      placeholder="Mobile No"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 placeholder-gray-500'
                        }`}
                    />
                    {errors.mobile_no && (
                      <p className="text-sm text-red-500 mt-1">{errors.mobile_no}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={isLoading || isLoadingGenders}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white'
                        : 'bg-gray-50/80 border-gray-300'
                        }`}
                    >
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Other">Other</option>
                      <option value="Prefer Not to say">Prefer Not to say</option>
                      {/* {genderOptions.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))} */}
                    </select>
                  </div>
                </>
              )}

            </div>
            <div className='border-b mb-4'></div>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">

              {/* Row 5 - Status and Deal Owner */}
              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="Qualification">Qualification</option>
                  <option value="Demo/Making">Demo/Making</option>
                  <option value="Proposal/Quotation">Proposal/Quotation</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Ready to Close">Ready To Close</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                )}
              </div>
              <div className="md:col-start-2 lg:col-start-2">
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Deal Owner
                </label>
                <select
                  name="deal_owner"
                  value={formData.deal_owner}
                  onChange={handleChange}
                  disabled={isLoading || isLoadingUsers}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="">Select a Deal Owner</option>
                  {users.map(user => (
                    <option key={user.name} value={user.name}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Footer */}
            <div className="flex justify-end mt-6 sm:mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${theme === 'dark'
                  ? 'bg-purplebg hover:bg-purple-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? 'Creating...' : 'Create'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}