// import React, { useState, useEffect } from 'react';
// import { X, ExternalLink, Plus } from 'lucide-react';
// import { useTheme } from './ThemeProvider';
// import { showToast } from '../utils/toast';
// import { getUserSession } from '../utils/session';

// // New Address Modal Component
// interface CreateAddressModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (address: any) => void;
// }

// function CreateAddressModal({ isOpen, onClose, onSubmit }: CreateAddressModalProps) {
//   const { theme } = useTheme();
//   const [formData, setFormData] = useState({
//     address_title: '',
//     address_type: 'Billing',
//     address_line1: '',
//     city: '',
//     country: 'India'
//   });
//   const [loading, setLoading] = useState(false);

//   if (!isOpen) return null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const session = getUserSession();
//       if (!session) {
//         showToast('Session not found', { type: 'error' });
//         return;
//       }

//       const apiUrl = 'https://api.erpnext.ai/api/v2/document/Address';

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': AUTH_TOKEN
//         },
//         body: JSON.stringify(formData)
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
//       }

//       const result = await response.json();
//       showToast('Address created successfully', { type: 'success' });
//       onSubmit(result);
//       onClose();

//       // Reset form
//       setFormData({
//         address_title: '',
//         address_type: 'Billing',
//         address_line1: '',
//         city: '',
//         country: 'India'
//       });
//     } catch (error) {
//       console.error('Error creating address:', error);
//       showToast('Failed to create address', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-[60] overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//         <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

//         <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full backdrop-blur-md ${theme === 'dark'
//             ? 'bg-custom-gradient border-transparent'
//             : 'bg-white/90 border border-gray-200'
//           }`}>
//           <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
//             }`}>
//             <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               Create Address
//             </h3>
//             <button
//               onClick={onClose}
//               className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//                 }`}
//             >
//               <X className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Address Title */}
//               <div className="md:col-span-2">
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Address Title <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="address_title"
//                   value={formData.address_title}
//                   onChange={handleChange}
//                   placeholder="Address Title"
//                   required
//                   disabled={loading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 text-white placeholder-gray-400'
//                       : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               {/* Address Type */}
//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Address Type <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="address_type"
//                   value={formData.address_type}
//                   onChange={handleChange}
//                   required
//                   disabled={loading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 text-white'
//                       : 'bg-gray-50/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="Billing">Billing</option>
//                   <option value="Shipping">Shipping</option>
//                   <option value="Office">Office</option>
//                   <option value="Personal">Personal</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>

//               {/* Country */}
//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Country <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   placeholder="Country"
//                   required
//                   disabled={loading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 text-white placeholder-gray-400'
//                       : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               {/* Address Line 1 */}
//               <div className="md:col-span-2">
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Address <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="address_line1"
//                   value={formData.address_line1}
//                   onChange={handleChange}
//                   placeholder="Address Line 1"
//                   required
//                   disabled={loading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 text-white placeholder-gray-400'
//                       : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               {/* City */}
//               <div className="md:col-span-2">
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   City <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleChange}
//                   placeholder="City"
//                   required
//                   disabled={loading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 text-white placeholder-gray-400'
//                       : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>
//             </div>

//             {/* Submit Buttons */}
//             <div className="flex justify-end mt-6">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={loading}
//                 className={`mr-3 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${theme === 'dark'
//                     ? 'text-white border border-gray-600 hover:bg-gray-700'
//                     : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
//                   }`}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
//                     ? 'bg-purplebg hover:bg-purple-700 text-white'
//                     : 'bg-gray-900 hover:bg-gray-800 text-white'
//                   }`}
//               >
//                 {loading ? 'Creating...' : 'Create Address'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Updated Contact Modal Interface
// interface CreateContactModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: any) => void;
// }

// export function CreateContactModal({ isOpen, onClose, onSubmit }: CreateContactModalProps) {
//   const { theme } = useTheme();
//   const [formData, setFormData] = useState({
//     salutation: '',
//     first_name: '',
//     middle_name: '',
//     last_name: '',
//     gender: '',
//     company_name: '',
//     designation: '',
//     email_id: '',
//     phone: '',
//     address: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [addresses, setAddresses] = useState([]);
//   const [loadingAddresses, setLoadingAddresses] = useState(false);
//   const [showAddressModal, setShowAddressModal] = useState(false);
//   const [showAddressDropdown, setShowAddressDropdown] = useState(false);
//   const [addressSearch, setAddressSearch] = useState('');

//   // Fetch addresses on component mount
//   useEffect(() => {
//     if (isOpen) {
//       fetchAddresses();
//     }
//   }, [isOpen]);

//   const fetchAddresses = async () => {
//     setLoadingAddresses(true);
//     try {
//       const session = getUserSession();
//       if (!session) {
//         showToast('Session not found', { type: 'error' });
//         return;
//       }

//       const apiUrl = 'https://api.erpnext.ai/api/v2/document/Address';

//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Authorization': AUTH_TOKEN
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result = await response.json();
//       setAddresses(result.data || []);
//     } catch (error) {
//       console.error('Error fetching addresses:', error);
//       showToast('Failed to fetch addresses', { type: 'error' });
//     } finally {
//       setLoadingAddresses(false);
//     }
//   };

//   const handleAddressCreated = (newAddress: any) => {
//     // Add the new address to the list and select it
//     setAddresses(prev => [...prev, newAddress]);
//     setFormData(prev => ({ ...prev, address: newAddress.name || newAddress.address_title }));
//     setShowAddressModal(false);
//   };

//   // Filter addresses based on search
//   const filteredAddresses = addresses.filter((address: any) =>
//     address.address_title?.toLowerCase().includes(addressSearch.toLowerCase()) ||
//     address.address_type?.toLowerCase().includes(addressSearch.toLowerCase()) ||
//     address.country?.toLowerCase().includes(addressSearch.toLowerCase())
//   );

//   // Select address from dropdown
//   const selectAddress = (address: any) => {
//     setFormData(prev => ({ ...prev, address: address.name }));
//     setShowAddressDropdown(false);
//     setAddressSearch('');
//   };

//   // Clear address selection
//   const clearAddress = () => {
//     setFormData(prev => ({ ...prev, address: '' }));
//     setShowAddressDropdown(false);
//     setAddressSearch('');
//   };

//   if (!isOpen) return null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const session = getUserSession();
//       if (!session) {
//         showToast('Session not found', { type: 'error' });
//         return;
//       }
//       const doc = {
//         doctype: "Contact",
//         salutation: formData.salutation,
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         gender: formData.gender,
//         company_name: formData.company_name,
//         designation: formData.designation,
//         ...(formData.middle_name && { middle_name: formData.middle_name }),
//         ...(formData.email_id && {
//           email_ids: [{ email_id: formData.email_id }]
//         }),
//         ...(formData.phone && {
//           phone_nos: [{ phone: formData.phone }]
//         }),
//         ...(formData.address && {
//           address: formData.address
//         })
//       };

//       const payload = { doc };

//       const apiUrl = 'https://api.erpnext.ai/api/method/frappe.client.insert';

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': AUTH_TOKEN
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
//       }

//       const result = await response.json();
//       showToast('Contact created successfully', { type: 'success' });
//       onSubmit(result);
//       onClose();

//       // Reset form
//       setFormData({
//         salutation: '',
//         first_name: '',
//         middle_name: '',
//         last_name: '',
//         gender: '',
//         company_name: '',
//         designation: '',
//         email_id: '',
//         phone: '',
//         address: ''
//       });
//     } catch (error) {
//       console.error('Error creating contact:', error);
//       showToast('Failed to create contact', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   return (
//     <>
//       <div className="fixed inset-0 z-50 overflow-y-auto">
//         <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//           <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

//           <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full backdrop-blur-md ${theme === 'dark'
//               ? 'bg-custom-gradient border-transparent'
//               : 'bg-white/90 border border-gray-200'
//             }`}>
//             <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
//               }`}>
//               <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                 New Contact
//               </h3>
//               <div className="flex items-center space-x-2">
//                 <button className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//                   }`}>
//                   <ExternalLink className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                 </button>
//                 <button
//                   onClick={onClose}
//                   className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//                     }`}
//                 >
//                   <X className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6">
//               <div className="space-y-4">
//                 {/* Salutation */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                     }`}>
//                     Salutation
//                   </label>
//                   <select
//                     name="salutation"
//                     value={formData.salutation}
//                     onChange={handleChange}
//                     disabled={loading}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                         ? 'bg-white-31 text-white'
//                         : 'bg-gray-50/80 border-gray-300'
//                       }`}
//                   >
//                     <option value="">Salutation</option>
//                     <option value="Mr">Mr</option>
//                     <option value="Ms">Ms</option>
//                     <option value="Mrs">Mrs</option>
//                     <option value="Dr">Dr</option>
//                     <option value="Prof">Prof</option>
//                   </select>
//                 </div>

//                 {/* First Name and Last Name */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                       }`}>
//                       First Name
//                     </label>
//                     <input
//                       type="text"
//                       name="first_name"
//                       value={formData.first_name}
//                       onChange={handleChange}
//                       placeholder="First Name"
//                       required
//                       disabled={loading}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                           ? 'bg-white-31 text-white placeholder-gray-400'
//                           : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                         }`}
//                     />
//                   </div>

//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                       }`}>
//                       Last Name
//                     </label>
//                     <input
//                       type="text"
//                       name="last_name"
//                       value={formData.last_name}
//                       onChange={handleChange}
//                       placeholder="Last Name"
//                       disabled={loading}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                           ? 'bg-white-31 text-white placeholder-gray-400'
//                           : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                         }`}
//                     />
//                   </div>
//                 </div>

//                 {/* Email Address */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                     }`}>
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     name="email_id"
//                     value={formData.email_id}
//                     onChange={handleChange}
//                     placeholder="Email Address"
//                     disabled={loading}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                         ? 'bg-white-31 text-white placeholder-gray-400'
//                         : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                       }`}
//                   />
//                 </div>

//                 {/* Mobile No and Gender */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                       }`}>
//                       Mobile No
//                     </label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       placeholder="Mobile No"
//                       disabled={loading}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                           ? 'bg-white-31 text-white placeholder-gray-400'
//                           : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                         }`}
//                     />
//                   </div>

//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                       }`}>
//                       Gender
//                     </label>
//                     <select
//                       name="gender"
//                       value={formData.gender}
//                       onChange={handleChange}
//                       disabled={loading}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                           ? 'bg-white-31 text-white'
//                           : 'bg-gray-50/80 border-gray-300'
//                         }`}
//                     >
//                       <option value="">Gender</option>
//                       <option value="Male">Male</option>
//                       <option value="Female">Female</option>
//                       <option value="Other">Other</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Company Name */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                     }`}>
//                     Company Name
//                   </label>
//                   <input
//                     type="text"
//                     name="company_name"
//                     value={formData.company_name}
//                     onChange={handleChange}
//                     placeholder="Company Name"
//                     disabled={loading}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                         ? 'bg-white-31 text-white placeholder-gray-400'
//                         : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                       }`}
//                   />
//                 </div>

//                 {/* Designation */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                     }`}>
//                     Designation
//                   </label>
//                   <input
//                     type="text"
//                     name="designation"
//                     value={formData.designation}
//                     onChange={handleChange}
//                     placeholder="Designation"
//                     disabled={loading}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                         ? 'bg-white-31 text-white placeholder-gray-400'
//                         : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                       }`}
//                   />
//                 </div>

//                 {/* Address with custom searchable dropdown */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                     }`}>
//                     Address
//                   </label>
//                   <div className="relative">
//                     {/* Custom Searchable Dropdown */}
//                     <div className="relative">
//                       <input
//                         type="text"
//                         name="address_search"
//                         placeholder="Address"
//                         disabled={loading || loadingAddresses}
//                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm cursor-pointer ${theme === 'dark'
//                             ? 'bg-white-31 text-white placeholder-gray-400'
//                             : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                           }`}
//                         onClick={() => setShowAddressDropdown(true)}
//                         value={formData.address ? addresses.find(addr => addr.name === formData.address)?.address_title || formData.address : ''}
//                         readOnly
//                       />

//                       {/* Dropdown arrow */}
//                       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
//                         <svg className={`fill-current h-4 w-4 transition-transform ${showAddressDropdown ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//                           <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
//                         </svg>
//                       </div>

//                       {/* Custom Dropdown */}
//                       {showAddressDropdown && (
//                         <div className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg backdrop-blur-md ${theme === 'dark'
//                             ? 'bg-white-31 border-purple-500/30'
//                             : 'bg-white border-gray-200'
//                           }`}>

//                           {/* Search Input */}
//                           <div className="p-3 border-b border-gray-200">
//                             <div className="relative">
//                               <input
//                                 type="text"
//                                 placeholder="Search"
//                                 value={addressSearch}
//                                 onChange={(e) => setAddressSearch(e.target.value)}
//                                 autoFocus
//                                 className={`w-full px-3 py-2 pl-8 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
//                                     ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
//                                     : 'bg-white border-gray-300 placeholder-gray-500'
//                                   }`}
//                               />
//                               {/* Search icon */}
//                               <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
//                                 <svg className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                 </svg>
//                               </div>
//                               {/* Clear search */}
//                               {addressSearch && (
//                                 <button
//                                   type="button"
//                                   onClick={() => setAddressSearch('')}
//                                   className="absolute inset-y-0 right-0 pr-2 flex items-center"
//                                 >
//                                   <X className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
//                                 </button>
//                               )}
//                             </div>
//                           </div>

//                           {/* Address List */}
//                           <div className="max-h-48 overflow-y-auto">
//                             {filteredAddresses.length > 0 ? (
//                               filteredAddresses.map((address: any) => (
//                                 <div
//                                   key={address.name}
//                                   className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
//                                     formData.address === address.name ? 'bg-blue-50' : ''
//                                   } ${theme === 'dark' ? 'hover:bg-gray-700 border-gray-600' : ''
//                                     }`}
//                                   onClick={() => selectAddress(address)}
//                                 >
//                                   <div className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                                     {address.address_title}-{address.address_type}
//                                   </div>
//                                   <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//                                     {address.country}
//                                   </div>
//                                 </div>
//                               ))
//                             ) : (
//                               <div className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                                 {addressSearch ? 'No addresses found' : 'No addresses available'}
//                               </div>
//                             )}
//                           </div>

//                           {/* Actions */}
//                           <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setShowAddressDropdown(false);
//                                 setAddressSearch('');
//                                 setShowAddressModal(true);
//                               }}
//                               className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-sm font-medium border-b ${theme === 'dark' 
//                                   ? 'text-white hover:bg-gray-700 border-gray-600' 
//                                   : 'text-gray-700 border-gray-200'
//                                 }`}
//                             >
//                               <Plus className="w-4 h-4 mr-2" />
//                               Create New
//                             </button>
//                             <button
//                               type="button"
//                               onClick={clearAddress}
//                               className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-sm font-medium ${theme === 'dark' 
//                                   ? 'text-white hover:bg-gray-700' 
//                                   : 'text-gray-700'
//                                 }`}
//                             >
//                               <X className="w-4 h-4 mr-2" />
//                               Clear
//                             </button>
//                           </div>
//                         </div>
//                       )}

//                       {/* Click outside handler */}
//                       {showAddressDropdown && (
//                         <div 
//                           className="fixed inset-0 z-40" 
//                           onClick={() => {
//                             setShowAddressDropdown(false);
//                             setAddressSearch('');
//                           }}
//                         />
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div className="flex justify-center mt-8">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`w-full px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
//                       ? 'bg-black hover:bg-gray-900 text-white'
//                       : 'bg-black hover:bg-gray-900 text-white'
//                     }`}
//                 >
//                   {loading ? 'Creating...' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* Address Modal */}
//       <CreateAddressModal
//         isOpen={showAddressModal}
//         onClose={() => setShowAddressModal(false)}
//         onSubmit={handleAddressCreated}
//       />
//     </>
//   );
// }
import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Plus } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { getUserSession } from '../utils/session';
import { AUTH_TOKEN } from '../api/apiUrl';

// New Address Modal Component
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the validation errors', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'https://api.erpnext.ai/api/v2/document/Address';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
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
      setErrors({
        address_title: '',
        address_line1: '',
        city: '',
        country: ''
      });
    } catch (error) {
      console.error('Error creating address:', error);
      showToast('Failed to create address', { type: 'error' });
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
                  Address Title
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
                  Country
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
                  Address
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
                  City
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

// Updated Contact Modal Interface
interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreateContactModal({ isOpen, onClose, onSubmit }: CreateContactModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    salutation: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    company_name: '',
    designation: '',
    email_id: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({
    first_name: '',
    email_id: '',
    phone: '',
    company_name: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Fetch addresses on component mount
  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          error = 'First name is required';
        } else if (value.trim().length < 2) {
          error = 'First name must be at least 2 characters long';
        } else if (!/^[a-zA-Z\s]*$/.test(value)) {
          error = 'First name can only contain letters and spaces';
        }
        break;
      case 'email_id':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value.trim() && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value.trim())) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'company_name':
        if (value.trim() && value.trim().length < 2) {
          error = 'Company name must be at least 2 characters long';
        }
        break;
      case 'designation':
        if (value.trim() && value.trim().length < 2) {
          error = 'Designation must be at least 2 characters long';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors = {
      first_name: validateField('first_name', formData.first_name),
      email_id: validateField('email_id', formData.email_id),
      phone: validateField('phone', formData.phone),
      company_name: validateField('company_name', formData.company_name),
      designation: validateField('designation', formData.designation)
    };
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const sessionCompany = session?.company;

      let apiUrl = 'https://api.erpnext.ai/api/v2/document/Address';

      if (sessionCompany) {
        const params = new URLSearchParams({
          filters: JSON.stringify({ company: sessionCompany })
        });
        apiUrl += `?${params.toString()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': AUTH_TOKEN
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
    
    if (!validateForm()) {
      showToast('Please fix the validation errors', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }
      const doc = {
        doctype: "Contact",
        salutation: formData.salutation,
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
        company: sessionCompany,
        company_name: formData.company_name,
        designation: formData.designation,
        ...(formData.middle_name && { middle_name: formData.middle_name }),
        ...(formData.email_id && {
          email_ids: [{ email_id: formData.email_id }]
        }),
        ...(formData.phone && {
          phone_nos: [{ phone: formData.phone }]
        }),
        ...(formData.address && {
          address: formData.address
        })
      };

      const payload = { doc };

      const apiUrl = 'https://api.erpnext.ai/api/method/frappe.client.insert';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      showToast('Contact created successfully', { type: 'success' });
      onSubmit(result);
      onClose();

      // Reset form
      setFormData({
        salutation: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        company_name: '',
        designation: '',
        email_id: '',
        phone: '',
        address: ''
      });
      setErrors({
        first_name: '',
        email_id: '',
        phone: '',
        company_name: '',
        designation: ''
      });
    } catch (error) {
      console.error('Error creating contact:', error);
      showToast('Failed to create contact', { type: 'error' });
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
      // Reset the select to the previous value
      e.target.value = formData.address;
    } else {
      handleChange(e);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

          <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full backdrop-blur-md ${theme === 'dark'
            ? 'bg-custom-gradient border-transparent'
            : 'bg-white/90 border border-gray-200'
            }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'
              }`}>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                New Contact
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
              <div className="space-y-4">
                {/* Salutation */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                    <option value="Prof">Prof</option>
                  </select>
                </div>

                {/* First Name and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                      }`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First Name"
                      disabled={loading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 placeholder-gray-500'
                        } ${errors.first_name ? 'border-red-500' : ''}`}
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                </div>

                {/* Email Address */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email_id"
                    value={formData.email_id}
                    onChange={handleChange}
                    placeholder="Email Address"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                      ? 'bg-white-31 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 placeholder-gray-500'
                      } ${errors.email_id ? 'border-red-500' : ''}`}
                  />
                  {errors.email_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.email_id}</p>
                  )}
                </div>

                {/* Mobile No and Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                      }`}>
                      Mobile No
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Mobile No"
                      disabled={loading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                        ? 'bg-white-31 text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 placeholder-gray-500'
                        } ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Other">Other</option>
                      <option value="Prefer Not to say">Prefer Not to say</option>
                    </select>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                      } ${errors.company_name ? 'border-red-500' : ''}`}
                  />
                  {errors.company_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                      } ${errors.designation ? 'border-red-500' : ''}`}
                  />
                  {errors.designation && (
                    <p className="text-red-500 text-xs mt-1">{errors.designation}</p>
                  )}
                </div>

                {/* Address with custom dropdown */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                        ? 'bg-white-31 text-white'
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

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${theme === 'dark'
                    ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
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

export default CreateContactModal;