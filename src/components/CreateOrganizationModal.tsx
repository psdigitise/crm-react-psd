// import React, { useState } from 'react';
// import { X, ExternalLink } from 'lucide-react';
// import { useTheme } from './ThemeProvider';
// import { showToast } from '../utils/toast';

// interface CreateOrganizationModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: any) => void;
// }

// export function CreateOrganizationModal({ isOpen, onClose, onSubmit }: CreateOrganizationModalProps) {
//   const { theme } = useTheme();
//   const [formData, setFormData] = useState({
//     organization_name: '',
//     website: '',
//     address: '',
//     no_of_employees: '',
//     territory: '',
//     industry: '',
//     annual_revenue: ''
//   });
//   const [loading, setLoading] = useState(false);

//   if (!isOpen) return null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       // Prepare payload according to new API structure
//       const payload = {
//         doc: {
//           doctype: "CRM Organization",
//           organization_name: formData.organization_name,
//           website: formData.website,
//           address: formData.address,
//           annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : undefined,
//           industry: formData.industry,
//           no_of_employees: formData.no_of_employees,
//           territory: formData.territory
//         }
//       };

//       // Remove undefined fields from the doc object
//       Object.keys(payload.doc).forEach(key => {
//         if (payload.doc[key] === undefined || payload.doc[key] === '') {
//           delete payload.doc[key];
//         }
//       });

//       const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.client.insert';

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result = await response.json();
//       showToast('Organization created successfully', { type: 'success' });
//       onSubmit(result);
//       onClose();

//       // Reset form
//       setFormData({
//         organization_name: '',
//         website: '',
//         address: '',
//         no_of_employees: '',
//         territory: '',
//         industry: '',
//         annual_revenue: ''
//       });
//     } catch (error) {
//       console.error('Error creating organization:', error);
//       showToast('Failed to create organization', { type: 'error' });
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
//               Create Organization
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
//                   placeholder="Organization Name"
//                   required
//                   disabled={loading}
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
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   placeholder="Website"
//                   disabled={loading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white placeholder-gray-400'
//                     : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Address
//                 </label>
//                 <input
//                   type="text"
//                   name="address"
//                   value={formData.address}
//                   onChange={handleChange}
//                   placeholder="Address"
//                   disabled={loading}
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
//                   disabled={loading}
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
//                   <option value="500+">500+</option>
//                   <option value="1000+">1000+</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Territory
//                 </label>
//                 <input
//                   type="text"
//                   name="territory"
//                   value={formData.territory}
//                   onChange={handleChange}
//                   placeholder="Territory"
//                   disabled={loading}
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
//                   disabled={loading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white'
//                     : 'bg-gray-50/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="">Industry</option>
//                   <option value="Software">Software</option>
//                   <option value="Technology">Technology</option>
//                   <option value="Healthcare">Healthcare</option>
//                   <option value="Finance">Finance</option>
//                   <option value="Education">Education</option>
//                   <option value="Retail">Retail</option>
//                   <option value="Manufacturing">Manufacturing</option>
//                   <option value="Service">Service</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                   }`}>
//                   Annual Revenue
//                 </label>
//                 <input
//                   type="number"
//                   name="annual_revenue"
//                   value={formData.annual_revenue}
//                   onChange={handleChange}
//                   placeholder="Annual Revenue"
//                   disabled={loading}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                     ? 'bg-white-31 border-white text-white placeholder-gray-400'
//                     : 'bg-white/80 border-gray-300 placeholder-gray-500'
//                     }`}
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end mt-8">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
//                   ? 'bg-purplebg hover:bg-purple-700 text-white'
//                   : 'bg-gray-900 hover:bg-gray-800 text-white'
//                   }`}
//               >
//                 {loading ? 'Creating...' : 'Create'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreateOrganizationModal({ isOpen, onClose, onSubmit }: CreateOrganizationModalProps) {
  const theme = 'dark'; // Using dark theme as specified
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare payload according to new API structure
      const payload = {
        doc: {
          doctype: "CRM Organization",
          organization_name: formData.organization_name,
          website: formData.website,
          address: formData.address,
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
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      // alert('Organization created successfully');
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
      alert('Failed to create organization');
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

        <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full backdrop-blur-md bg-custom-gradient border-transparent !border-white border-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/30">
            <h3 className="text-lg font-semibold text-white">
              New Organization
            </h3>
            <div className="flex items-center space-x-2">
              <button className="p-1 rounded transition-colors hover:bg-purple-800/50">
                <ExternalLink className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded transition-colors hover:bg-purple-800/50"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* First row - Organization Name (full width) */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2 text-white">
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm bg-white-31 border-white text-white placeholder-gray-400"
                />
              </div>

              {/* Second row - Website and Annual Revenue */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Website"
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm bg-white-31 border-white text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Annual Revenue
                </label>
                <input
                  type="number"
                  name="annual_revenue"
                  value={formData.annual_revenue}
                  onChange={handleChange}
                  placeholder="₹ 0.00"
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm bg-white-31 border-white text-white placeholder-gray-400"
                />
              </div>

              {/* Third row - Territory (full width) */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2 text-white">
                  Territory
                </label>
                <input
                  type="text"
                  name="territory"
                  value={formData.territory}
                  onChange={handleChange}
                  placeholder="Territory"
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm bg-white-31 border-white text-white placeholder-gray-400"
                />
              </div>

              {/* Fourth row - No. of Employees and Industry */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  No. of Employees
                </label>
                <select
                  name="no_of_employees"
                  value={formData.no_of_employees}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm bg-white-31 border-white text-white"
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
                <label className="block text-sm font-semibold mb-2 text-white">
                  Industry
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm bg-white-31 border-white text-white"
                >
                  <option value="">Industry</option>
                  <option value="Software">Software</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Service">Service</option>
                </select>
              </div>

              {/* Fifth row - Address (full width) */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2 text-white">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm bg-white-31 border-white text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-purplebg hover:bg-purple-700 text-white"
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

export default CreateOrganizationModal;