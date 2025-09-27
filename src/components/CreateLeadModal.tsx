import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../api/apiUrl';


interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface Territory {
  value: string;
  description?: string;
}

interface Salutation {
  value: string;
  description?: string;
}

interface Gender {
  value: string;
  description?: string;
}

interface Industry {
  value: string;
  description?: string;
}

export function CreateLeadModal({ isOpen, onClose, onSubmit }: CreateLeadModalProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    salutation: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    organization: '',
    website: '',
    employees: '',
    territory: '',
    annualRevenue: '0.00',
    industry: '',
    status: 'New',
    leadOwner: 'Administrator'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<{ name: string; full_name: string; email: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoadingTerritories, setIsLoadingTerritories] = useState<boolean>(false);
  const [salutations, setSalutations] = useState<Salutation[]>([]);
  const [isLoadingSalutations, setIsLoadingSalutations] = useState<boolean>(false);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [isLoadingGenders, setIsLoadingGenders] = useState<boolean>(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchTerritories();
      fetchSalutations();
      fetchGenders();
      fetchIndustries();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setUsers([]);
        return;
      }

      const filters = encodeURIComponent(JSON.stringify([["company", "=", sessionCompany]]));
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/User?fields=["email"]&filters=${filters}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': getAuthToken(),
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchTerritories = async () => {
    setIsLoadingTerritories(true);

    try {
      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Territory"
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message && Array.isArray(data.message)) {
          const territoryOptions = data.message.map((item: any) => ({
            value: item.value,
            description: item.description
          }));
          setTerritories(territoryOptions);
        }
      } else {
        throw new Error('Failed to fetch territories');
      }
    } catch (error) {
      console.error('Error fetching territories:', error);
      setTerritories([]);
    } finally {
      setIsLoadingTerritories(false);
    }
  };

  const fetchSalutations = async () => {
    setIsLoadingSalutations(true);

    try {
      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify({
          txt: "",
          doctype: "Salutation",
          filters: null
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message && Array.isArray(data.message)) {
          const salutationOptions = data.message.map((item: any) => ({
            value: item.value,
            description: item.description
          }));
          setSalutations(salutationOptions);
        }
      } else {
        throw new Error('Failed to fetch salutations');
      }
    } catch (error) {
      console.error('Error fetching salutations:', error);
      setSalutations([]);
    } finally {
      setIsLoadingSalutations(false);
    }
  };

  const fetchGenders = async () => {
    setIsLoadingGenders(true);

    try {
      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify({
          txt: "",
          doctype: "Gender",
          filters: null
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message && Array.isArray(data.message)) {
          const genderOptions = data.message.map((item: any) => ({
            value: item.value,
            description: item.description
          }));
          setGenders(genderOptions);
        }
      } else {
        throw new Error('Failed to fetch genders');
      }
    } catch (error) {
      console.error('Error fetching genders:', error);
      setGenders([]);
    } finally {
      setIsLoadingGenders(false);
    }
  };

  const fetchIndustries = async () => {
    setIsLoadingIndustries(true);

    try {
      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Industry",
          filters: null
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message && Array.isArray(data.message)) {
          const industryOptions = data.message.map((item: any) => ({
            value: item.value,
            description: item.description
          }));
          setIndustries(industryOptions);
        }
      } else {
        throw new Error('Failed to fetch industries');
      }
    } catch (error) {
      console.error('Error fetching industries:', error);
      setIndustries([]);
    } finally {
      setIsLoadingIndustries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const isValidUrlOrEmail = (value: string): boolean => {
        // Email regex pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // URL regex pattern (supports http, https, and protocol-relative URLs)
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;

        return emailPattern.test(value) || urlPattern.test(value);
      };

      if (!sessionCompany) {
        setError('Company not found in session.');
        setIsLoading(false);
        return;
      }

      if (formData.website && !isValidUrlOrEmail(formData.website)) {
        setError('Please enter a valid website URL or email address');
        return;
      }

      const docPayload = {
        doctype: "CRM Lead",
        salutation: formData.salutation,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        mobile_no: formData.mobile,
        gender: formData.gender,
        organization: formData.organization,
        website: formData.website,
        no_of_employees: formData.employees,
        territory: formData.territory,
        annual_revenue: formData.annualRevenue,
        industry: formData.industry,
        status: formData.status,
        lead_owner: formData.leadOwner,
        company: sessionCompany,
      };

      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.client.insert';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken(),
        },
        body: JSON.stringify({
          doc: docPayload
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log(response);




      if (result.message) {
        setSuccess('Lead created successfully!');
        onSubmit({
          ...docPayload, // Your form data
          name: result.message.name // The generated ID from the server
        });


        setTimeout(() => {
          setFormData({
            salutation: '',
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            gender: '',
            organization: '',
            website: '',
            employees: '',
            territory: '',
            annualRevenue: '0.00',
            industry: '',
            status: 'New',
            leadOwner: 'Administrator'
          });

          navigate(`/leads/${result.message.name}`);

          setSuccess('');
          onClose();
        }, 1000);
      } else {
        throw new Error('No data returned from API');
      }

    } catch (error) {
      console.error('Error creating lead:', error);
      let errorMessage = 'Failed to create lead. Please try again.';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your network connection and ensure the API server is running.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full mx-4 backdrop-blur-md ${theme === 'dark'
          ? 'bg-custom-gradient border-transparent !border-white border-2'
          : 'bg-white/90 border border-gray-200'
          }`}>
          <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
            }`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Create Lead
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

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4">
              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Salutation
                </label>
                <select
                  name="salutation"
                  value={formData.salutation}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                  disabled={isLoading || isLoadingSalutations}
                >
                  <option value="">Select Salutation</option>
                  {salutations.map((salutation) => (
                    <option key={salutation.value} value={salutation.value}>
                      {salutation.description || salutation.value}
                    </option>
                  ))}
                </select>
                {isLoadingSalutations && (
                  <div className="mt-1 text-sm text-gray-500">Loading salutations...</div>
                )}
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={`w-full px-3 py-2  text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Mobile No
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Mobile No"
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                  disabled={isLoading}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Other">Other</option>
                  <option value="Prefer Not to say">Prefer Not to say</option>
                </select>
                {isLoadingGenders && (
                  <div className="mt-1 text-sm text-gray-500">Loading genders...</div>
                )}
              </div>
            </div>
            <div className='border-b mb-4'></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4">
              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Organization
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Organization"
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Website"
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Employees
                </label>
                <select
                  name="employees"
                  value={formData.employees}
                  onChange={handleChange}
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                  disabled={isLoading}
                >
                  <option value="">No. of Employees</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  {/* <option value="500+">500+</option> */}
                </select>
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Territory
                </label>
                <select
                  name="territory"
                  value={formData.territory}
                  onChange={handleChange}
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                  disabled={isLoading || isLoadingTerritories}
                >
                  <option value="">Select Territory</option>
                  {territories.map((territory) => (
                    <option key={territory.value} value={territory.value}>
                      {territory.description || territory.value}
                    </option>
                  ))}
                </select>
                {isLoadingTerritories && (
                  <div className="mt-1 text-sm text-gray-500">Loading territories...</div>
                )}
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Annual Revenue
                </label>
                <input
                  type="text"
                  name="annualRevenue"
                  value={formData.annualRevenue}
                  onChange={handleChange}
                  placeholder="₹ 0.00"
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Industry
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                  disabled={isLoading || isLoadingIndustries}
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.description || industry.value}
                    </option>
                  ))}
                </select>
                {isLoadingIndustries && (
                  <div className="mt-1 text-sm text-gray-500">Loading industries...</div>
                )}
              </div>
            </div>
            <div className='border-b mb-4'></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Status <span className="text-red-500"></span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full  text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                  disabled={isLoading}
                >
                  <option value="">Select Status</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Nurture">Nurture</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Unqualified">Unqualified</option>
                  <option value="Junk">Junk</option>
                </select>
              </div>
              <div className="md:col-start-2 lg:col-start-2">
                <label className={`block text-md font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Lead Owner
                </label>
                <select
                  name="leadOwner"
                  value={formData.leadOwner}
                  onChange={handleChange}
                  className={`w-full  text-sm  px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                  disabled={isLoading || isLoadingUsers}
                >
                  <option value="">Select Lead Owner</option>
                  {users.map(user => (
                    <option key={user.name} value={user.name}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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