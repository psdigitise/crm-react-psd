// import React, { useState } from 'react';
// import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, User, Calendar, MapPin } from 'lucide-react';
// import { useTheme } from './ThemeProvider';
// import { showToast } from '../utils/toast';

// interface Contact {
//   id: string;
//   name: string;
//   first_name: string;
//   full_name: string;
//   status: string;
//   company_name: string;
//   email?: string;
//   phone?: string;
//   position?: string;
//   lastContact?: string;
//   assignedTo?: string;
//   middle_name?: string;
//   last_name?: string;
//   user?: string;
//   salutation?: string;
//   designation?: string;
//   gender?: string;
//   creation?: string;
//   modified?: string;
// }

// interface ContactDetailViewProps {
//   contact: Contact;
//   onBack: () => void;
//   onSave: (updatedContact: Contact) => void;
// }

// export function ContactDetailView({ contact, onBack, onSave }: ContactDetailViewProps) {
//   const { theme } = useTheme();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContact, setEditedContact] = useState<Contact>(contact);
//   const [loading, setLoading] = useState(false);

//   const handleSave = async () => {
//     try {
//       setLoading(true);

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${contact.id}`;

//       const response = await fetch(apiUrl, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//         },
//         body: JSON.stringify({
//           first_name: editedContact.first_name,
//           middle_name: editedContact.middle_name,
//           last_name: editedContact.last_name,
//           salutation: editedContact.salutation,
//           designation: editedContact.designation,
//           gender: editedContact.gender,
//           company_name: editedContact.company_name,
//           status: editedContact.status
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Contact updated successfully', { type: 'success' });
//       onSave(editedContact);
//       setIsEditing(false);
//     } catch (error) {
//       console.error('Error updating contact:', error);
//       showToast('Failed to update contact', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm('Are you sure you want to delete this contact?')) return;

//     try {
//       setLoading(true);

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${contact.id}`;

//       const response = await fetch(apiUrl, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Contact deleted successfully', { type: 'success' });
//       onBack();
//     } catch (error) {
//       console.error('Error deleting contact:', error);
//       showToast('Failed to delete contact', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (field: keyof Contact, value: string) => {
//     setEditedContact(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   return (
//     <div className={`min-h-screen ${
//       theme === 'dark' 
//         ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary' 
//         : 'bg-gray-50'
//     }`}>
//       {/* Header */}
//       <div className={`border-b px-4 sm:px-6 py-4 ${
//         theme === 'dark' 
//           ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30' 
//           : 'bg-white border-gray-200'
//       }`}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onBack}
//               className={`p-2 rounded-lg transition-colors ${
//                 theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//               }`}
//             >
//               <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
//             </button>
//             <div>
//               <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                 {contact.name}
//               </h1>
//               <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                 {contact.id}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-2">
//             {!isEditing ? (
//               <>
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
//                     theme === 'dark' 
//                       ? 'bg-purplebg text-white hover:bg-purple-700' 
//                       : 'bg-gray-900 text-white hover:bg-gray-800'
//                   }`}
//                 >
//                   <Edit className="w-4 h-4" />
//                   <span>Edit</span>
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   disabled={loading}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   <span>Delete</span>
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={() => setIsEditing(false)}
//                   className={`px-4 py-2 rounded-lg transition-colors ${
//                     theme === 'dark' 
//                       ? 'border border-purple-500/30 text-white hover:bg-purple-800/50' 
//                       : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={loading}
//                   className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
//                     theme === 'dark' 
//                       ? 'bg-purplebg text-white hover:bg-purple-700' 
//                       : 'bg-purplebg text-white hover:purple-700'
//                   }`}
//                 >
//                   {loading ? 'Saving...' : 'Save'}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-4 sm:p-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Main Details */}
//           <div className="lg:col-span-2">
//             <div className={`rounded-lg shadow-sm border p-6 ${
//               theme === 'dark' 
//                 ? 'bg-custom-gradient border-white' 
//                 : 'bg-white border-gray-200'
//             }`}>
//               <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                 Contact Details
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                     Salutation
//                   </label>
//                   {isEditing ? (
//                     <select
//                       value={editedContact.salutation || ''}
//                       onChange={(e) => handleInputChange('salutation', e.target.value)}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         theme === 'dark' 
//                           ? 'bg-white-31 border-white text-white' 
//                           : 'border-gray-300'
//                       }`}
//                     >
//                       <option value="">Select Salutation</option>
//                       <option value="Mr">Mr</option>
//                       <option value="Ms">Ms</option>
//                       <option value="Mrs">Mrs</option>
//                       <option value="Dr">Dr</option>
//                     </select>
//                   ) : (
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                       {contact.salutation || 'N/A'}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                     First Name
//                   </label>
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       value={editedContact.first_name || ''}
//                       onChange={(e) => handleInputChange('first_name', e.target.value)}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         theme === 'dark' 
//                           ? 'bg-white-31 border-white text-white' 
//                           : 'border-gray-300'
//                       }`}
//                     />
//                   ) : (
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                       {contact.first_name || 'N/A'}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                     Last Name
//                   </label>
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       value={editedContact.last_name || ''}
//                       onChange={(e) => handleInputChange('last_name', e.target.value)}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         theme === 'dark' 
//                           ? 'bg-white-31 border-white text-white' 
//                           : 'border-gray-300'
//                       }`}
//                     />
//                   ) : (
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                       {contact.last_name || 'N/A'}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                     Gender
//                   </label>
//                   {isEditing ? (
//                     <select
//                       value={editedContact.gender || ''}
//                       onChange={(e) => handleInputChange('gender', e.target.value)}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         theme === 'dark' 
//                           ? 'bg-white-31 border-white text-white' 
//                           : 'border-gray-300'
//                       }`}
//                     >
//                       <option value="">Select Gender</option>
//                       <option value="Male">Male</option>
//                       <option value="Female">Female</option>
//                       <option value="Other">Other</option>
//                     </select>
//                   ) : (
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                       {contact.gender || 'N/A'}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                     Company Name
//                   </label>
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       value={editedContact.company_name || ''}
//                       onChange={(e) => handleInputChange('company_name', e.target.value)}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         theme === 'dark' 
//                           ? 'bg-white-31 border-white text-white' 
//                           : 'border-gray-300'
//                       }`}
//                     />
//                   ) : (
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                       {contact.company_name || 'N/A'}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                     Designation
//                   </label>
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       value={editedContact.designation || ''}
//                       onChange={(e) => handleInputChange('designation', e.target.value)}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         theme === 'dark' 
//                           ? 'bg-white-31 border-white text-white' 
//                           : 'border-gray-300'
//                       }`}
//                     />
//                   ) : (
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                       {contact.designation || 'N/A'}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                     Status
//                   </label>
//                   {isEditing ? (
//                     <select
//                       value={editedContact.status || ''}
//                       onChange={(e) => handleInputChange('status', e.target.value)}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         theme === 'dark' 
//                           ? 'bg-white-31 border-white text-white' 
//                           : 'border-gray-300'
//                       }`}
//                     >
//                       <option value="Open">Open</option>
//                       <option value="Replied">Replied</option>
//                       <option value="Opportunity">Opportunity</option>
//                       <option value="Quotation">Quotation</option>
//                       <option value="Lost Quotation">Lost Quotation</option>
//                       <option value="Interested">Interested</option>
//                       <option value="Converted">Converted</option>
//                       <option value="Do Not Contact">Do Not Contact</option>
//                     </select>
//                   ) : (
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
//                       contact.status === 'Open' 
//                         ? theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
//                         : theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {contact.status}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Contact Info Sidebar */}
//           <div className="space-y-6">
//             {/* Contact Information */}
//             <div className={`rounded-lg shadow-sm border p-6 ${
//               theme === 'dark' 
//                 ? 'bg-custom-gradient border-white' 
//                 : 'bg-white border-gray-200'
//             }`}>
//               <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                 Contact Information
//               </h3>

//               <div className="space-y-4">
//                 <div className="flex items-center space-x-3">
//                   <Mail className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Email</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{contact.email || 'N/A'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <Phone className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Phone</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{contact.phone || 'N/A'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <Building2 className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Company</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{contact.company_name}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <User className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Assigned To</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{contact.assignedTo || 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>


//             {/* Activity Timeline */}
//             <div className={`rounded-lg shadow-sm border p-6 ${
//               theme === 'dark' 
//                 ? 'bg-custom-gradient border-white' 
//                 : 'bg-white border-gray-200'
//             }`}>
//               <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                 Recent Activity
//               </h3>

//               <div className="space-y-4">
//                 <div className="flex items-start space-x-3">
//                   <Calendar className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Created</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
//                       {contact.creation ? new Date(contact.creation).toLocaleDateString() : 'N/A'}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start space-x-3">
//                   <Calendar className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Last Modified</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
//                       {contact.lastContact || 'N/A'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, User, Calendar, MapPin } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import ContactDetails from './ContactDetails';

interface Contact {
    id: string;
    name: string;
    salutation?: string;
    first_name: string;
    last_name?: string;
    full_name: string;
    email?: string;
    phone?: string;
    gender?: string;
    company_name: string;
    status: string;
    position?: string;
    lastContact?: string;
    assignedTo?: string;
    middle_name?: string;
    user?: string;
    designation?: string;
    creation?: string;
    modified?: string;
}

interface ContactDetailViewProps {
    contact: Contact;
    onBack: () => void;
    onSave: (updatedContact: Contact) => void;
}

export function ContactDetailView({ contact, onBack, onSave }: ContactDetailViewProps) {
    const { theme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContact, setEditedContact] = useState<Contact>(contact);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        try {
            setLoading(true);

            const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${contact.id}`;

            const response = await fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
                },
                body: JSON.stringify({
                    first_name: editedContact.first_name,
                    middle_name: editedContact.middle_name,
                    last_name: editedContact.last_name,
                    salutation: editedContact.salutation,
                    designation: editedContact.designation,
                    gender: editedContact.gender,
                    company_name: editedContact.company_name,
                    status: editedContact.status
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            showToast('Contact updated successfully', { type: 'success' });
            onSave(editedContact);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating contact:', error);
            showToast('Failed to update contact', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            setLoading(true);

            const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${contact.id}`;

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            showToast('Contact deleted successfully', { type: 'success' });
            onBack();
        } catch (error) {
            console.error('Error deleting contact:', error);
            showToast('Failed to delete contact', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof Contact, value: string) => {
        setEditedContact(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className={`min-h-screen ${theme === 'dark'
            ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
            : 'bg-gray-50'
            }`}>
            {/* Header */}
            <div className={`border-b px-4 sm:px-6 py-4 ${theme === 'dark'
                ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBack}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                                }`}
                        >
                            <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                        </button>
                        <div>
                            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {contact.name}
                            </h1>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                {contact.id}
                            </p>
                        </div>
                    </div>

                    {/* <div className="flex items-center space-x-2">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark'
                                        ? 'bg-purplebg text-white hover:bg-purple-700'
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                                        ? 'border border-purple-500/30 text-white hover:bg-purple-800/50'
                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${theme === 'dark'
                                        ? 'bg-purplebg text-white hover:bg-purple-700'
                                        : 'bg-purplebg text-white hover:purple-700'
                                        }`}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </>
                        )}
                    </div> */}
                </div>
            </div>


            <ContactDetails contact={contact} onBack={onBack} onSave={onSave} />
        </div>
    );
}
