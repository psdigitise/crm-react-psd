
// import React, { useState } from 'react';
// import { X, ExternalLink, Loader2 } from 'lucide-react';
// import { useTheme } from './ThemeProvider';
// import { getUserSession } from '../utils/session';

// interface Deal {
//   name: string;
//   organization_name: string;
//   website: string;
//   no_of_employees: string;
//   territory: string;
//   annual_revenue: string;
//   industry: string;
//   salutation: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   mobile_no: string;
//   gender: string;
//   status: string;
//   deal_owner: string;
// }

// interface CreateDealModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: Deal) => void;
// }

// export function CreateDealModal({ isOpen, onClose, onSubmit }: CreateDealModalProps) {
//   const { theme } = useTheme();
//   const [formData, setFormData] = useState<Deal>({
//     name: '',
//     organization_name: '',
//     website: '',
//     no_of_employees: '',
//     territory: '',
//     annual_revenue: '0.00',
//     industry: '',
//     salutation: '',
//     first_name: '',
//     last_name: '',
//     email: '',
//     mobile_no: '',
//     gender: '',
//     status: 'Qualification',
//     deal_owner: 'Administrator',
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   if (!isOpen) return null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const session = getUserSession();
//       const sessionCompany = session?.company || '';

//       if (!sessionCompany) {
//         setError('Company not found in session');
//         return;
//       }

//       // Add company to payload
//       const apiPayload = {
//         ...formData,
//         company: sessionCompany, // ✅ consistent session usage
//       };

//       const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v2/document/CRM Deal`;
//       // const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v2/document/CRM Deal`;

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//         },
//         body: JSON.stringify(apiPayload)
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
//       }

//       const result = await response.json();
//       console.log('Deal created successfully:', result);

//       setSuccess('Deal created successfully!');
//       onSubmit(result);

//       // Reset form after successful submission
//       setTimeout(() => {
//         setFormData({
//           name: '',
//           organization_name: '',
//           website: '',
//           no_of_employees: '',
//           territory: '',
//           annual_revenue: '0.00',
//           industry: '',
//           salutation: '',
//           first_name: '',
//           last_name: '',
//           email: '',
//           mobile_no: '',
//           gender: '',
//           status: 'Qualification',
//           deal_owner: 'Administrator'
//         });
//         setSuccess('');
//         onClose();
//       }, 2000);

//     } catch (error) {
//       console.error('Error creating deal:', error);

//       let errorMessage = 'Failed to create deal. Please try again.';

//       if (error instanceof TypeError && error.message.includes('fetch')) {
//         errorMessage = 'Unable to connect to the server. Please check your network connection and ensure the API server is running.';
//       } else if (error instanceof Error) {
//         errorMessage = error.message;
//       }

//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//         <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

//         <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full backdrop-blur-md ${theme === 'dark'
//           ? 'bg-custom-gradient border-transparent !border-white border-2'
//           : 'bg-white/90 border border-gray-200'
//           }`}>
//           <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
//             }`}>
//             <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               Create Deal
//             </h3>
//             <div className="flex items-center space-x-2">
//               <button className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//                 }`}>
//                 <ExternalLink className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//               </button>
//               <button
//                 onClick={onClose}
//                 className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//                   }`}
//               >
//                 <X className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//               </button>
//             </div>
//           </div>

//           {/* Success/Error Messages */}
//           {success && (
//             <div className={`mx-4 sm:mx-6 mt-4 p-4 rounded-lg border ${theme === 'dark'
//               ? 'bg-green-900/30 border-green-500/30 text-green-300'
//               : 'bg-green-50 border-green-200 text-green-800'
//               }`}>
//               <p className="text-sm">{success}</p>
//             </div>
//           )}

//           {error && (
//             <div className={`mx-4 sm:mx-6 mt-4 p-4 rounded-lg border ${theme === 'dark'
//               ? 'bg-red-900/30 border-red-500/30 text-red-300'
//               : 'bg-red-50 border-red-200 text-red-800'
//               }`}>
//               <p className="text-sm">{error}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Organization Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="organization_name"
//                   value={formData.organization_name}
//                   onChange={handleChange}
//                   placeholder="Enter organization name "
//                   required
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white placeholder-gray-400'
//                     : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Website
//                 </label>
//                 <input
//                   type="text"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   placeholder="Website"
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white placeholder-gray-400'
//                     : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   No. of Employees
//                 </label>
//                 <select
//                   name="no_of_employees"
//                   value={formData.no_of_employees}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white'
//                     : 'bg-gray-50/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="">No. of Employees</option>
//                   <option value="1-10">1-10</option>
//                   <option value="11-50">11-50</option>
//                   <option value="51-200">51-200</option>
//                   <option value="201-500">201-500</option>
//                   <option value="500-1000">500-1000</option>
//                   <option value="1000+">1000+</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Territory
//                 </label>
//                 <select
//                   name="territory"
//                   value={formData.territory}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white'
//                     : 'bg-gray-50/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="">Territory</option>
//                   <option value="US">US</option>
//                   <option value="India">India</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Annual Revenue
//                 </label>
//                 <input
//                   type="text"
//                   name="annual_revenue"
//                   value={formData.annual_revenue}
//                   onChange={handleChange}
//                   placeholder="₹ 0.00"
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white placeholder-gray-400'
//                     : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Industry
//                 </label>
//                 <select
//                   name="industry"
//                   value={formData.industry}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white'
//                     : 'bg-gray-50/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="">Industry</option>
//                   <option value="Education">Education</option>
//                   <option value="Service">Service</option>
//                   <option value="Software">Software</option>
//                   <option value="Sports">Sports</option>
//                   <option value="Technology">Technology</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Salutation
//                 </label>
//                 <select
//                   name="salutation"
//                   value={formData.salutation}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white'
//                     : 'bg-gray-50/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="">Salutation</option>
//                   <option value="Dr">Dr</option>
//                   <option value="Madam">Madam</option>
//                   <option value="Master">Master</option>
//                   <option value="Miss">Miss</option>
//                   <option value="Mr">Mr</option>
//                   <option value="Mrs">Mrs</option>
//                   <option value="Ms">Ms</option>
//                   <option value="Prof">Prof</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   name="first_name"
//                   value={formData.first_name}
//                   onChange={handleChange}
//                   placeholder="First Name"
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white placeholder-gray-400'
//                     : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   name="last_name"
//                   value={formData.last_name}
//                   onChange={handleChange}
//                   placeholder="Last Name"
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white placeholder-gray-400'
//                     : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="Email"
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white placeholder-gray-400'
//                     : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Mobile No
//                 </label>
//                 <input
//                   type="text"
//                   name="mobile_no"
//                   value={formData.mobile_no}
//                   onChange={handleChange}
//                   placeholder="Mobile No"
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white placeholder-gray-400'
//                     : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Gender
//                 </label>
//                 <select
//                   name="gender"
//                   value={formData.gender}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white'
//                     : 'bg-gray-50/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="">Gender</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Others">Others</option>
//                   <option value="Transgender">Transgender</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Status <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   required
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white'
//                     : 'bg-gray-50/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="Qualification">Qualification</option>
//                   <option value="Demo/Making">Demo/Making</option>
//                   <option value="Proposal/Quotation">Proposal/Quotation</option>
//                   <option value="Negotiation">Negotiation</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Deal Owner
//                 </label>
//                 <select
//                   name="deal_owner"
//                   value={formData.deal_owner}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white'
//                     : 'bg-gray-50/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="Administrator">Administrator</option>
//                   <option value="DEMO">DEMO</option>
//                   <option value="Guest">Guest</option>
//                 </select>
//               </div>
//             </div>

//             <div className="flex justify-end mt-6 sm:mt-8">
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${theme === 'dark'
//                   ? 'bg-purplebg hover:bg-purple-700 text-white'
//                   : 'bg-gray-900 hover:bg-gray-800 text-white'
//                   }`}
//               >
//                 {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
//                 <span>{isLoading ? 'Creating...' : 'Create'}</span>
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';

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
}

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Deal) => void;
}

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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<{ name: string; full_name: string; email: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingUsers(true);

      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setUsers([]);
        setIsLoadingUsers(false);
        return;
      }

      const filters = encodeURIComponent(JSON.stringify([["company", "=", sessionCompany]]));
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/User?fields=["name","email"]&filters=${filters}`;

      fetch(apiUrl, {
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        }
      })
        .then(res => res.json())
        .then(data => {
          setUsers(data.data || []);
        })
        .catch(() => setUsers([]))
        .finally(() => setIsLoadingUsers(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      if (!sessionCompany) {
        setError('Company not found in session');
        setIsLoading(false);
        return;
      }

      // Add company to payload
      const apiPayload = {
        ...formData,
        company: sessionCompany,
      };

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v2/document/CRM Deal`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      setSuccess('Deal created successfully!');
      onSubmit(result);

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
          deal_owner: 'Administrator'
        });
        setSuccess('');
        onClose();
      }, 2000);

    } catch (error) {
      let errorMessage = 'Failed to create deal. Please try again.';
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Row 1 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  placeholder="Organization Name"
                  required
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-300 placeholder-gray-500'
                    }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
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
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
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
              {/* Row 2 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Territory
                </label>
                <select
                  name="territory"
                  value={formData.territory}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="">Territory</option>
                  <option value="US">US</option>
                  <option value="India">India</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
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
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Industry
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="">Industry</option>
                  <option value="Education">Education</option>
                  <option value="Service">Service</option>
                  <option value="Software">Software</option>
                  <option value="Sports">Sports</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
              {/* Row 3 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Salutation
                </label>
                <select
                  name="salutation"
                  value={formData.salutation}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="">Salutation</option>
                  <option value="Dr">Dr</option>
                  <option value="Madam">Madam</option>
                  <option value="Master">Master</option>
                  <option value="Miss">Miss</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Prof">Prof</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
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
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
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
              {/* Row 4 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
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
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
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
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-gray-50/80 border-gray-300'
                    }`}
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>
              {/* Row 5 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
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
                </select>
              </div>
              <div className="md:col-start-2 lg:col-start-3">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
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
                  <option value="Administrator">Administrator</option>
                  {users.map(user => (
                    <option key={user.name} value={user.name}>
                      {user.email}
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