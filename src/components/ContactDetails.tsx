// // // import { Phone, Trash2, Link, Zap, User2, Mail } from "lucide-react";
// // // import { useTheme } from "./ThemeProvider";

// // // export default function ContactDetails() {
// // //   const { theme } = useTheme();
// // //   const isDark = theme === "dark";

// // //   return (
// // //     <div className={`min-h-screen flex ${isDark ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
// // //       {/* Sidebar */}
// // //       <div className={`w-80 border-r ${isDark ? "border-white bg-transparent" : "border-gray-300 bg-white"}`}>
// // //         {/* Header */}
// // //         <div className={`p-4 border-b ${isDark ? "border-white/20" : "border-gray-300"}`}>
// // //           <div className="flex items-center gap-3 mb-4">
// // //             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${isDark ? "bg-purple-800" : "bg-gray-200"}`}>
// // //               S
// // //             </div>
// // //             <div>
// // //               <h2 className="text-lg font-semibold">shalini 2344</h2>
// // //               <span className="text-xs text-gray-400 block">Tovo</span>
// // //             </div>
// // //           </div>

// // //           {/* Buttons */}
// // //           <div className="flex gap-2 mb-4">
// // //             <button className="flex items-center gap-1 border px-2 py-1 text-sm rounded text-green-600 border-green-600">
// // //               <Phone size={14} /> Make Call
// // //             </button>
// // //             <button className="flex items-center gap-1 text-red-500 border border-red-500 px-2 py-1 rounded text-sm">
// // //               <Trash2 size={14} /> Delete
// // //             </button>
// // //           </div>
// // //         </div>

// // //         {/* Details */}
// // //         <div className="p-4 space-y-2">
// // //           <h3 className="text-sm font-semibold mb-1">Details</h3>
// // //           {[
// // //             ["Salutation", "Add Salutation..."],
// // //             ["First Name", "shalini"],
// // //             ["Last Name", "2344"],
// // //             ["Email Address", "shalini@gmail.com"],
// // //             ["Mobile No", "9876543211"],
// // //             ["Gender", "Add Gender..."],
// // //             ["Company Name", "Tovo"],
// // //             ["Designation", "Add Designation..."],
// // //             ["Address", "Add Address..."],
// // //           ].map(([label, value], i) => (
// // //             <div key={i} className="text-sm flex gap-1">
// // //               <p className={`w-32 text-gray-500 ${isDark ? "text-white/80" : "text-gray-600"}`}>{label}:</p>
// // //               <p className={`${isDark ? "text-white" : "text-gray-800"}`}>{value}</p>
// // //             </div>
// // //           ))}
// // //         </div>
// // //       </div>

// // //       {/* Main Content */}
// // //       <div className="flex-1">
// // //         {/* Tabs */}
// // //         <div className={`flex items-center gap-6 border-b p-6 ${isDark ? "border-white/20" : "border-gray-300"}`}>
// // //           <button className="flex items-center gap-1 font-medium relative">
// // //             <Zap size={16} />
// // //             Deals
// // //             <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">1</span>
// // //           </button>
// // //          </div>

// // //         {/* Deals Table */}
// // //         <div className="p-6 overflow-x-auto">
// // //           <table className="min-w-full text-sm border-collapse">
// // //             <thead>
// // //               <tr className={`${isDark ? "bg-white/10" : "bg-gray-100"} text-left`}>
// // //                 <th className="p-2">Organization</th>
// // //                 <th className="p-2">Amount</th>
// // //                 <th className="p-2">Status</th>
// // //                 <th className="p-2">Email</th>
// // //                 <th className="p-2">Mobile no</th>
// // //                 <th className="p-2">Deal owner</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               <tr className="border-t">
// // //                 <td className="p-2 flex items-center gap-2">
// // //                   <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
// // //                     T
// // //                   </div>
// // //                   Tovo
// // //                 </td>
// // //                 <td className="p-2">₹ 0.00</td>
// // //                 <td className="p-2 flex items-center gap-1">
// // //                   <div className="w-3 h-3 rounded-full bg-gray-800"></div>
// // //                   Qualification
// // //                 </td>
// // //                 <td className="p-2 flex items-center gap-1 text-blue-500">
// // //                   <Mail size={14} /> shalini@gmail.com
// // //                 </td>
// // //                 <td className="p-2 flex items-center gap-1">
// // //                   <Phone size={14} /> 9876543211
// // //                 </td>
// // //                 <td className="p-2">
// // //                   <div className="flex items-center gap-1">
// // //                     <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold">
// // //                       M
// // //                     </div>
// // //                     mx techies
// // //                   </div>
// // //                 </td>
// // //               </tr>
// // //             </tbody>
// // //           </table>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import React, { useState } from 'react';
// // import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, User, Calendar, MapPin, Zap } from 'lucide-react';
// // import { useTheme } from './ThemeProvider';
// // import { showToast } from '../utils/toast';

// // interface Contact {
// //   id: string;
// //   name: string;
// //   first_name: string;
// //   full_name: string;
// //   status: string;
// //   company_name: string;
// //   email?: string;
// //   phone?: string;
// //   position?: string;
// //   lastContact?: string;
// //   assignedTo?: string;
// //   middle_name?: string;
// //   last_name?: string;
// //   user?: string;
// //   salutation?: string;
// //   designation?: string;
// //   gender?: string;
// //   creation?: string;
// //   modified?: string;
// // }

// // interface ContactDetailViewProps {
// //   contact: Contact;
// //   onBack: () => void;
// //   onSave: (updatedContact: Contact) => void;
// // }

// //  export default function ContactDetails({ contact, onBack, onSave }: ContactDetailViewProps) {
// //   const { theme } = useTheme();
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [editedContact, setEditedContact] = useState<Contact>(contact);
// //   const [loading, setLoading] = useState(false);
// //   const isDark = theme === "dark";

// //   const handleSave = async () => {
// //     try {
// //       setLoading(true);

// //       const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${contact.id}`;

// //       const response = await fetch(apiUrl, {
// //         method: 'PATCH',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
// //         },
// //         body: JSON.stringify({
// //           salutation: editedContact.salutation,
// //           first_name: editedContact.first_name,
// //           middle_name: editedContact.middle_name,
// //           last_name: editedContact.last_name,
// //           email: editedContact.email,
// //           phone: editedContact.phone,
// //           gender: editedContact.gender,
// //           company_name: editedContact.company_name,
// //           designation: editedContact.designation
// //         })
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
// //       }

// //       showToast('Contact updated successfully', { type: 'success' });
// //       onSave(editedContact);
// //       setIsEditing(false);
// //     } catch (error) {
// //       console.error('Error updating contact:', error);
// //       showToast('Failed to update contact', { type: 'error' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleDelete = async () => {
// //     if (!confirm('Are you sure you want to delete this contact?')) return;

// //     try {
// //       setLoading(true);

// //       const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${contact.id}`;

// //       const response = await fetch(apiUrl, {
// //         method: 'DELETE',
// //         headers: {
// //           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
// //         }
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
// //       }

// //       showToast('Contact deleted successfully', { type: 'success' });
// //       onBack();
// //     } catch (error) {
// //       console.error('Error deleting contact:', error);
// //       showToast('Failed to delete contact', { type: 'error' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleInputChange = (field: keyof Contact, value: string) => {
// //     setEditedContact(prev => ({
// //       ...prev,
// //       [field]: value
// //     }));
// //   };

// //   const renderField = (label: string, field: keyof Contact, isEditing: boolean) => {
// //     const value = isEditing ? editedContact[field] : contact[field];
// //     return (
// //       <div key={field} className="text-sm flex gap-1">
// //         <p className={`w-32 ${isDark ? "text-white/80" : "text-gray-600"}`}>{label}:</p>
// //         {isEditing ? (
// //           <input
// //             type="text"
// //             value={value || ''}
// //             onChange={(e) => handleInputChange(field, e.target.value)}
// //             className={`flex-1 ${isDark ? 'bg-dark-secondary text-white' : 'bg-white'} border rounded px-2 py-1`}
// //           />
// //         ) : (
// //           <p className={isDark ? "text-white" : "text-gray-800"}>{value || `Add ${label}...`}</p>
// //         )}
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className={`min-h-screen flex ${isDark ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
// //       {/* Sidebar - Keeping your exact design */}
// //       <div className={`w-80 border-r ${isDark ? "border-white bg-transparent" : "border-gray-300 bg-white"}`}>
// //         {/* Header */}
// //         <div className={`p-4 border-b ${isDark ? "border-white/20" : "border-gray-300"}`}>
// //           <div className="flex items-center gap-3 mb-4">
// //             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${isDark ? "bg-purple-800" : "bg-gray-200"}`}>
// //               {contact.first_name?.[0] || 'C'}
// //             </div>
// //             <div>
// //               <h2 className="text-lg font-semibold">{contact.full_name || contact.name}</h2>
// //               <span className="text-xs text-gray-400 block">{contact.company_name || 'No company'}</span>
// //             </div>
// //           </div>

// //           {/* Buttons */}
// //           <div className="flex gap-2 mb-4">
// //             <button className="flex items-center gap-1 border px-2 py-1 text-sm rounded text-green-600 border-green-600">
// //               <Phone size={14} /> Make Call
// //             </button>
// //             <button 
// //               onClick={handleDelete}
// //               disabled={loading}
// //               className="flex items-center gap-1 text-red-500 border border-red-500 px-2 py-1 rounded text-sm disabled:opacity-50"
// //             >
// //               <Trash2 size={14} /> Delete
// //             </button>
// //           </div>
// //         </div>

// //         {/* Details - Now showing actual API data */}
// //         <div className="p-4 space-y-2">
// //           <h3 className="text-sm font-semibold mb-1">Details</h3>
// //           {renderField("Salutation", "salutation", isEditing)}
// //           {renderField("First Name", "first_name", isEditing)}
// //           {renderField("Last Name", "last_name", isEditing)}
// //           {renderField("Email Address", "email", isEditing)}
// //           {renderField("Mobile No", "phone", isEditing)}
// //           {renderField("Gender", "gender", isEditing)}
// //           {renderField("Company Name", "company_name", isEditing)}
// //           {renderField("Designation", "designation", isEditing)}
// //           {renderField("Address", "position", isEditing)}
// //         </div>
// //       </div>

// //       {/* Main Content - Keeping your exact design */}
// //       <div className="flex-1">
// //         {/* Tabs */}
// //         <div className={`flex items-center gap-6 border-b p-6 ${isDark ? "border-white/20" : "border-gray-300"}`}>
// //           <button className="flex items-center gap-1 font-medium relative">
// //             <Zap size={16} />
// //             Deals
// //             <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">1</span>
// //           </button>
// //         </div>

// //         {/* Deals Table */}
// //         <div className="p-6 overflow-x-auto">
// //           <table className="min-w-full text-sm border-collapse">
// //             <thead>
// //               <tr className={`${isDark ? "bg-white/10" : "bg-gray-100"} text-left`}>
// //                 <th className="p-2">Organization</th>
// //                 <th className="p-2">Amount</th>
// //                 <th className="p-2">Status</th>
// //                 <th className="p-2">Email</th>
// //                 <th className="p-2">Mobile no</th>
// //                 <th className="p-2">Deal owner</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               <tr className="border-t">
// //                 <td className="p-2 flex items-center gap-2">
// //                   <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
// //                     {contact.company_name?.[0] || 'C'}
// //                   </div>
// //                   {contact.company_name || 'No company'}
// //                 </td>
// //                 <td className="p-2">₹ 0.00</td>
// //                 <td className="p-2 flex items-center gap-1">
// //                   <div className="w-3 h-3 rounded-full bg-gray-800"></div>
// //                   Qualification
// //                 </td>
// //                 <td className="p-2 flex items-center gap-1 text-blue-500">
// //                   <Mail size={14} /> {contact.email || 'No email'}
// //                 </td>
// //                 <td className="p-2 flex items-center gap-1">
// //                   <Phone size={14} /> {contact.phone || 'No phone'}
// //                 </td>
// //                 <td className="p-2">
// //                   <div className="flex items-center gap-1">
// //                     <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold">
// //                       {contact.assignedTo?.[0] || 'U'}
// //                     </div>
// //                     {contact.assignedTo || 'Unassigned'}
// //                   </div>
// //                 </td>
// //               </tr>
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>

// //       {/* Edit/Save buttons in header - Keeping your exact design */}
// //       <div className={`fixed top-0 right-0 p-4 ${isDark ? "bg-dark-secondary" : "bg-white"}`}>
// //         <div className="flex items-center space-x-2">
// //           {!isEditing ? (
// //             <button
// //               onClick={() => setIsEditing(true)}
// //               className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
// //                 isDark 
// //                   ? 'bg-purplebg text-white hover:bg-purple-700' 
// //                   : 'bg-gray-900 text-white hover:bg-gray-800'
// //               }`}
// //             >
// //               <Edit className="w-4 h-4" />
// //               <span>Edit</span>
// //             </button>
// //           ) : (
// //             <>
// //               <button
// //                 onClick={() => setIsEditing(false)}
// //                 className={`px-4 py-2 rounded-lg transition-colors ${
// //                   isDark 
// //                     ? 'border border-purple-500/30 text-white hover:bg-purple-800/50' 
// //                     : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
// //                 }`}
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleSave}
// //                 disabled={loading}
// //                 className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
// //                   isDark 
// //                     ? 'bg-purplebg text-white hover:bg-purple-700' 
// //                     : 'bg-purplebg text-white hover:purple-700'
// //                 }`}
// //               >
// //                 {loading ? 'Saving...' : 'Save'}
// //               </button>
// //             </>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// import React, { useState } from 'react';
// import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, User, Calendar, MapPin, Zap } from 'lucide-react';
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
//   reference_deals?: Array<{
//     deal_name: string;
//     organization: string;
//     amount: number;
//     status: string;
//     email: string;
//     mobile_no: string;
//     owner: string;
//   }>;
// }

// interface ContactDetailViewProps {
//   contact: Contact;
//   onBack: () => void;
//   onSave: (updatedContact: Contact) => void;
// }

// export default function ContactDetails({ contact, onBack, onSave }: ContactDetailViewProps) {
//   const { theme } = useTheme();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedContact, setEditedContact] = useState<Contact>(contact);
//   const [loading, setLoading] = useState(false);
//   const isDark = theme === "dark";
  

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
//           salutation: editedContact.salutation,
//           first_name: editedContact.first_name,
//           middle_name: editedContact.middle_name,
//           last_name: editedContact.last_name,
//           email: editedContact.email,
//           phone: editedContact.phone,
//           gender: editedContact.gender,
//           company_name: editedContact.company_name,
//           designation: editedContact.designation
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

//   const renderField = (label: string, field: keyof Contact, isEditing: boolean) => {
//     const value = isEditing ? editedContact[field] : contact[field];
//     return (
//       <div key={field} className="text-sm flex gap-1">
//         <p className={`w-32 ${isDark ? "text-white/80" : "text-gray-600"}`}>{label}:</p>
//         {isEditing ? (
//           <input
//             type="text"
//             value={value || ''}
//             onChange={(e) => handleInputChange(field, e.target.value)}
//             className={`flex-1 ${isDark ? 'bg-dark-secondary text-white' : 'bg-white'} border rounded px-2 py-1`}
//           />
//         ) : (
//           <p className={isDark ? "text-white" : "text-gray-800"}>{value || `Add ${label}...`}</p>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className={`min-h-screen flex ${isDark ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
//       {/* Sidebar */}
//       <div className={`w-80 border-r ${isDark ? "border-white bg-transparent" : "border-gray-300 bg-white"}`}>
//         {/* Header */}
//         <div className={`p-4 border-b ${isDark ? "border-white/20" : "border-gray-300"}`}>
//           <div className="flex items-center gap-3 mb-4">
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${isDark ? "bg-purple-800" : "bg-gray-200"}`}>
//               {contact.first_name?.[0] || 'C'}
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold">{contact.full_name || contact.name}</h2>
//               <span className="text-xs text-gray-400 block">{contact.company_name || 'No company'}</span>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-2 mb-4">
//             <button className="flex items-center gap-1 border px-2 py-1 text-sm rounded text-green-600 border-green-600">
//               <Phone size={14} /> Make Call
//             </button>
//             <button
//               onClick={handleDelete}
//               disabled={loading}
//               className="flex items-center gap-1 text-red-500 border border-red-500 px-2 py-1 rounded text-sm disabled:opacity-50"
//             >
//               <Trash2 size={14} /> Delete
//             </button>
//           </div>
//         </div>

//         {/* Details */}
//         <div className="p-4 space-y-2">
//           <h3 className="text-sm font-semibold mb-1">Details</h3>
//           {renderField("Salutation", "salutation", isEditing)}
//           {renderField("First Name", "first_name", isEditing)}
//           {renderField("Last Name", "last_name", isEditing)}
//           {renderField("Email Address", "email", isEditing)}
//           {renderField("Mobile No", "phone", isEditing)}
//           {renderField("Gender", "gender", isEditing)}
//           {renderField("Company Name", "company_name", isEditing)}
//           {renderField("Designation", "designation", isEditing)}
//           {renderField("Address", "position", isEditing)}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1">
//         {/* Tabs */}
//         <div className={`flex items-center gap-6 border-b p-6 ${isDark ? "border-white/20" : "border-gray-300"}`}>
//           <button className="flex items-center gap-1 font-medium relative">
//             <Zap size={16} />
//             Deals
//             <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">
//               {contact.reference_deals?.length || 0}
//             </span>
//           </button>
//         </div>

//         {/* Deals Table */}
//         <div className="p-6 overflow-x-auto">
//           <table className="min-w-full text-sm border-collapse">
//             <thead>
//               <tr className={`${isDark ? "bg-white/10" : "bg-gray-100"} text-left`}>
//                 <th className="p-2">Organization</th>
//                 <th className="p-2">Amount</th>
//                 <th className="p-2">Status</th>
//                 <th className="p-2">Email</th>
//                 <th className="p-2">Mobile no</th>
//                 <th className="p-2">Deal owner</th>
//               </tr>
//             </thead>
//             <tbody>
//               {contact.reference_deals?.length ? (
//                 contact.reference_deals.map((deal, index) => (
//                   <tr key={index} className="border-t">
//                     <td className="p-2 flex items-center gap-2">
//                       <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
//                         {deal.organization?.[0] || 'O'}
//                       </div>
//                       {deal.organization || 'No organization'}
//                     </td>
//                     <td className="p-2">₹ {deal.amount?.toLocaleString() || '0.00'}</td>
//                     <td className="p-2 flex items-center gap-1">
//                       <div className="w-3 h-3 rounded-full bg-gray-800"></div>
//                       {deal.status || 'Qualification'}
//                     </td>
//                     <td className="p-2 flex items-center gap-1 text-blue-500">
//                       <Mail size={14} /> {deal.email || 'No email'}
//                     </td>
//                     <td className="p-2 flex items-center gap-1">
//                       <Phone size={14} /> {deal.mobile_no || 'No phone'}
//                     </td>
//                     <td className="p-2">
//                       <div className="flex items-center gap-1">
//                         <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold">
//                           {deal.owner?.[0] || 'U'}
//                         </div>
//                         {deal.owner || 'Unassigned'}
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr className="border-t">
//                   <td colSpan={6} className="p-4 text-center text-gray-500">
//                     No deals found for this contact
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Edit/Save buttons in header */}
//       <div className={`fixed top-0 right-0 p-4 ${isDark ? "bg-dark-secondary" : "bg-white"}`}>
//         <div className="flex items-center space-x-2">
//           {!isEditing ? (
//             <button
//               onClick={() => setIsEditing(true)}
//               className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${isDark
//                   ? 'bg-purplebg text-white hover:bg-purple-700'
//                   : 'bg-gray-900 text-white hover:bg-gray-800'
//                 }`}
//             >
//               <Edit className="w-4 h-4" />
//               <span>Edit</span>
//             </button>
//           ) : (
//             <>
//               <button
//                 onClick={() => setIsEditing(false)}
//                 className={`px-4 py-2 rounded-lg transition-colors ${isDark
//                     ? 'border border-purple-500/30 text-white hover:bg-purple-800/50'
//                     : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={loading}
//                 className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${isDark
//                     ? 'bg-purplebg text-white hover:bg-purple-700'
//                     : 'bg-purplebg text-white hover:purple-700'
//                   }`}
//               >
//                 {loading ? 'Saving...' : 'Save'}
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, User, Calendar, MapPin, Zap } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

interface Contact {
  id: string;
  name: string;
  first_name: string;
  full_name: string;
  status: string;
  company_name: string;
  email?: string;
  phone?: string;
  position?: string;
  lastContact?: string;
  assignedTo?: string;
  middle_name?: string;
  last_name?: string;
  user?: string;
  salutation?: string;
  designation?: string;
  gender?: string;
  creation?: string;
  modified?: string;
  reference_deals?: Array<{
    deal_name: string;
    organization: string;
    amount: number;
    status: string;
    email: string;
    mobile_no: string;
    owner: string;
  }>;
}

interface ContactDetailViewProps {
  contact: Contact;
  onBack: () => void;
  onSave: (updatedContact: Contact) => void;
}

export default function ContactDetails({ contact, onBack, onSave }: ContactDetailViewProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact>(contact);
  const [loading, setLoading] = useState(false);
  const isDark = theme === "dark";


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
          salutation: editedContact.salutation,
          first_name: editedContact.first_name,
          middle_name: editedContact.middle_name,
          last_name: editedContact.last_name,
          email: editedContact.email,
          phone: editedContact.phone,
          gender: editedContact.gender,
          company_name: editedContact.company_name,
          designation: editedContact.designation
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

  const renderField = (label: string, field: keyof Contact, isEditing: boolean) => {
    const value = isEditing ? editedContact[field] : contact[field];
    return (
      <div key={field} className="text-sm flex gap-1">
        <p className={`w-32 ${isDark ? "text-white/80" : "text-gray-600"}`}>{label}:</p>
        {isEditing ? (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`flex-1 ${isDark ? 'bg-dark-secondary text-white' : 'bg-white'} border rounded px-2 py-1`}
          />
        ) : (
          <p className={isDark ? "text-white" : "text-gray-800"}>{value || `Add ${label}...`}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
      {/* Sidebar */}
      <div className={`w-80 border-r ${isDark ? "border-white bg-transparent" : "border-gray-300 bg-white"}`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? "border-white/20" : "border-gray-300"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${isDark ? "bg-purple-800" : "bg-gray-200"}`}>
              {contact.first_name?.[0] || 'C'}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{contact.full_name || contact.name}</h2>
              <span className="text-xs text-gray-400 block">{contact.company_name || 'No company'}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2 mb-4 transition-all duration-300">

            <button className="flex items-center gap-1 border px-2 py-1 text-sm rounded text-green-600 border-green-600">
              <Phone size={14} /> Make Call
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-1 text-red-500 border border-red-500 px-2 py-1 rounded text-sm disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className={`border px-2 py-1 rounded text-sm ${theme === "dark"
                    ? "border-white text-white"
                    : "border-gray-300 text-gray-700"
                  } disabled:opacity-50`}
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`border px-2 py-1 rounded text-sm ${theme === "dark"
                      ? "border-white text-white"
                      : "border-gray-300 text-gray-700"
                    } disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-sm ${theme === "dark"
                      ? "bg-purple-600 text-white"
                      : "bg-blue-600 text-white"
                    } disabled:opacity-50`}
                >
                  {loading ? 'Saving...' : (
                    <>
                      Save
                    </>
                  )}
                </button>
              </>
            )}

          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold mb-1">Details</h3>
          {renderField("Salutation", "salutation", isEditing)}
          {renderField("First Name", "first_name", isEditing)}
          {renderField("Last Name", "last_name", isEditing)}
          {renderField("Email Address", "email", isEditing)}
          {renderField("Mobile No", "phone", isEditing)}
          {renderField("Gender", "gender", isEditing)}
          {renderField("Company Name", "company_name", isEditing)}
          {renderField("Designation", "designation", isEditing)}
          {renderField("Address", "position", isEditing)}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Tabs */}
        <div className={`flex items-center gap-6 border-b p-6 ${isDark ? "border-white/20" : "border-gray-300"}`}>
          <button className="flex items-center gap-1 font-medium relative">
            <Zap size={16} />
            Deals
            <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">
              {contact.reference_deals?.length || 0}
            </span>
          </button>
        </div>

        {/* Deals Table */}
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className={`${isDark ? "bg-white/10" : "bg-gray-100"} text-left`}>
                <th className="p-2">Organization</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Email</th>
                <th className="p-2">Mobile no</th>
                <th className="p-2">Deal owner</th>
              </tr>
            </thead>
            <tbody>
              {contact.reference_deals?.length ? (
                contact.reference_deals.map((deal, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                        {deal.organization?.[0] || 'O'}
                      </div>
                      {deal.organization || 'No organization'}
                    </td>
                    <td className="p-2">₹ {deal.amount?.toLocaleString() || '0.00'}</td>
                    <td className="p-2 flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                      {deal.status || 'Qualification'}
                    </td>
                    <td className="p-2 flex items-center gap-1 text-blue-500">
                      <Mail size={14} /> {deal.email || 'No email'}
                    </td>
                    <td className="p-2 flex items-center gap-1">
                      <Phone size={14} /> {deal.mobile_no || 'No phone'}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold">
                          {deal.owner?.[0] || 'U'}
                        </div>
                        {deal.owner || 'Unassigned'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No deals found for this contact
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Save buttons in header */}
      {/* <div className={`fixed top-0 right-0 p-4 ${isDark ? "bg-dark-secondary" : "bg-white"}`}>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${isDark
                ? 'bg-purplebg text-white hover:bg-purple-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDark
                  ? 'border border-purple-500/30 text-white hover:bg-purple-800/50'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${isDark
                  ? 'bg-purplebg text-white hover:bg-purple-700'
                  : 'bg-purplebg text-white hover:purple-700'
                  }`}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div> */}
    </div>
  );
}