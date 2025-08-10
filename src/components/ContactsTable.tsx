// import React, { useState, useEffect } from 'react';
// import { ChevronDown, ChevronUp, Mail, Phone, Building2, Loader2 } from 'lucide-react';
// import { useTheme } from './ThemeProvider';
// import { showToast } from '../utils/toast';

// import { getUserSession } from '../utils/session';

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
//   // API fields
//   middle_name?: string;
//   last_name?: string;
//   user?: string;
//   salutation?: string;
//   designation?: string;
//   gender?: string;
//   creation?: string;
//   modified?: string;
//   email_id?: string;
//   mobile_no?: string;
//   image?: string;
//   owner?: string;
// }

// interface ContactsTableProps {
//   searchTerm: string;
//   onContactClick?: (contact: Contact) => void;
// }

// export function ContactsTable({ searchTerm, onContactClick }: ContactsTableProps) {
//   const { theme } = useTheme();
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sortField, setSortField] = useState<keyof Contact | null>(null);
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

//   useEffect(() => {
//     fetchContacts();
//   }, []);

//   const fetchContacts = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const session = getUserSession();
      
//       if (!session) {
//         setContacts([]);
//         setLoading(false);
//         return;
//       }

//       const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';
      
//       const requestBody = {
//         doctype: "Contact",
//         filters: {},
//         order_by: "modified desc",
//         default_filters: {},
//         column_field: "status",
//         columns: JSON.stringify([
//           {"label": "Name", "type": "Data", "key": "full_name", "width": "17rem"},
//           {"label": "Email", "type": "Data", "key": "email_id", "width": "12rem"},
//           {"label": "Phone", "type": "Data", "key": "mobile_no", "width": "12rem"},
//           {"label": "Organization", "type": "Data", "key": "company_name", "width": "12rem"},
//           {"label": "Last Modified", "type": "Datetime", "key": "modified", "width": "8rem"}
//         ]),
//         kanban_columns: "[]",
//         kanban_fields: "[]",
//         page_length: 20,
//         page_length_count: 20,
//         rows: JSON.stringify(["name", "full_name", "company_name", "email_id", "mobile_no", "modified", "image"]),
//         title_field: "",
//         view: {
//           custom_view_name: 10,
//           view_type: "list",
//           group_by_field: "owner"
//         }
//       };

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `token ${session.api_key}:${session.api_secret}`
//         },
//         body: JSON.stringify(requestBody)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result = await response.json();

//       // Transform the API response data
//       const transformedContacts: Contact[] = result.message.data.map((apiContact: any) => ({
//         id: apiContact.name || Math.random().toString(),
//         name: apiContact.full_name || apiContact.first_name || 'Unknown',
//         first_name: apiContact.first_name || '',
//         full_name: apiContact.full_name || '',
//         status: apiContact.status || 'Open',
//         company_name: apiContact.company_name || 'N/A',
//         email: apiContact.email_id || 'N/A',
//         phone: apiContact.mobile_no || apiContact.phone || 'N/A',
//         position: apiContact.designation || 'N/A',
//         lastContact: formatDate(apiContact.modified),
//         assignedTo: apiContact.owner || 'N/A',
//         // Keep original API fields
//         middle_name: apiContact.middle_name,
//         last_name: apiContact.last_name,
//         user: apiContact.user,
//         salutation: apiContact.salutation,
//         designation: apiContact.designation,
//         gender: apiContact.gender,
//         creation: apiContact.creation,
//         modified: apiContact.modified,
//         email_id: apiContact.email_id,
//         mobile_no: apiContact.mobile_no,
//         image: apiContact.image,
//         owner: apiContact.owner
//       }));

//       setContacts(transformedContacts);
//     } catch (error) {
//       console.error('Error fetching contacts:', error);
//       setError(error instanceof Error ? error.message : 'Failed to fetch contacts');
//       showToast('Failed to fetch contacts', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString: string): string => {
//     if (!dateString) return 'N/A';

//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

//       if (diffInHours < 1) return 'Just now';
//       if (diffInHours < 24) return `${diffInHours} hours ago`;
//       if (diffInHours < 48) return '1 day ago';
//       if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;

//       return date.toLocaleDateString();
//     } catch {
//       return dateString;
//     }
//   };

//   const handleSort = (field: keyof Contact) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   };

//   const filteredData = contacts.filter(item =>
//     Object.values(item).some(value =>
//       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const sortedData = [...filteredData].sort((a, b) => {
//     if (!sortField) return 0;

//     const aValue = a[sortField] ?? '';
//     const bValue = b[sortField] ?? '';

//     if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
//     if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
//     return 0;
//   });

//   const SortButton = ({ field, children }: { field: keyof Contact; children: React.ReactNode }) => (
//     <button
//       onClick={() => handleSort(field)}
//       className={`flex items-center space-x-1 text-left font-medium hover:text-gray-700 ${theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-900'
//         }`}
//     >
//       <span>{children}</span>
//       {sortField === field && (
//         sortDirection === 'asc'
//           ? <ChevronUp className="w-4 h-4" />
//           : <ChevronDown className="w-4 h-4" />
//       )}
//     </button>
//   );

//   if (loading) {
//     return (
//       <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
//         ? 'bg-custom-gradient border-transparent !rounded-none'
//         : 'bg-white border-gray-200'
//         }`}>
//         <div className="flex items-center justify-center">
//           <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purplebg' : 'text-blue-600'}`} />
//           <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading contacts...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
//         ? 'bg-custom-gradient border-transparent !rounded-none'
//         : 'bg-white border-gray-200'
//         }`}>
//         <div className="text-center">
//           <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading contacts</div>
//           <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
//           <button
//             onClick={fetchContacts}
//             className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
//               ? 'bg-purplebg text-white hover:bg-purple-700'
//               : 'bg-purplebg text-white hover:purple-700'
//               }`}
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
//       ? 'bg-custom-gradient border-transparent !rounded-none'
//       : 'bg-white border-gray-200'
//       }`}>
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-b-purplebg' : 'bg-gray-50 border-gray-200'
//             }`}>
//             <tr className="divide-x-[1px]">
//               <th className="px-6 py-3 text-left">
//                 <input
//                   type="checkbox"
//                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="name">Name</SortButton>
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="email">Email</SortButton>
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="phone">Phone</SortButton>
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="company_name">Organization</SortButton>
//               </th>
//               {/* <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="position">Position</SortButton>
//               </th> */}
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="lastContact">Last Contact</SortButton>
//               </th>
//               {/* <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="assignedTo">Assigned To</SortButton>
//               </th> */}
//             </tr>
//           </thead>
//           <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
//             {sortedData.map((contact) => (
//               <tr
//                 key={contact.id}
//                 className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
//                   }`}
//                 onClick={() => onContactClick && onContactClick(contact)}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
//                   <input
//                     type="checkbox"
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
//                       }`}>
//                       <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                         }`}>
//                         {contact.name.charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                     <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.name}</div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                     <Mail className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                     {contact.email}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                     <Phone className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                     {contact.phone}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <Building2 className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                     <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.company_name}</div>
//                   </div>
//                 </td>
//                 {/* <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {contact.position}
//                 </td> */}
//                 <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                   {contact.lastContact}
//                 </td>
//                 {/* <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
//                       }`}>
//                       <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                         }`}>
//                         {contact.assignedTo?.charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                     <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.assignedTo}</div>
//                   </div>
//                 </td> */}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {sortedData.length === 0 && !loading && (
//         <div className="text-center py-12">
//           <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No results found</div>
//           <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
//             Try adjusting your search criteria
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Mail, Phone, Building2, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

import { getUserSession } from '../utils/session';

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
  // API fields
  middle_name?: string;
  last_name?: string;
  user?: string;
  salutation?: string;
  designation?: string;
  gender?: string;
  creation?: string;
  modified?: string;
  email_id?: string;
  mobile_no?: string;
  image?: string;
  owner?: string;
}

interface ContactsTableProps {
  searchTerm: string;
  onContactClick?: (contact: Contact) => void;
}

export function ContactsTable({ searchTerm, onContactClick }: ContactsTableProps) {
  const { theme } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Contact | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = getUserSession();
      
      if (!session) {
        setContacts([]);
        setLoading(false);
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';
      
      const requestBody = {
        doctype: "Contact",
        filters: {},
        order_by: "modified desc",
        default_filters: {},
        column_field: "status",
        columns: JSON.stringify([
          {"label": "Name", "type": "Data", "key": "full_name", "width": "17rem"},
          {"label": "Email", "type": "Data", "key": "email_id", "width": "12rem"},
          {"label": "Phone", "type": "Data", "key": "mobile_no", "width": "12rem"},
          {"label": "Organization", "type": "Data", "key": "company_name", "width": "12rem"},
          {"label": "Last Modified", "type": "Datetime", "key": "modified", "width": "8rem"}
        ]),
        kanban_columns: "[]",
        kanban_fields: "[]",
        page_length: 20,
        page_length_count: 20,
        rows: JSON.stringify(["name", "full_name", "company_name", "email_id", "mobile_no", "modified", "image"]),
        title_field: "",
        view: {
          custom_view_name: 10,
          view_type: "list",
          group_by_field: "owner"
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Transform the API response data
      const transformedContacts: Contact[] = result.message.data.map((apiContact: any) => ({
        id: apiContact.name || Math.random().toString(),
        name: apiContact.full_name || apiContact.first_name || 'Unknown',
        first_name: apiContact.first_name || '',
        full_name: apiContact.full_name || '',
        status: apiContact.status || 'Open',
        company_name: apiContact.company_name || 'N/A',
        email: apiContact.email_id || 'N/A',
        phone: apiContact.mobile_no || apiContact.phone || 'N/A',
        position: apiContact.designation || 'N/A',
        lastContact: formatDate(apiContact.modified),
        assignedTo: apiContact.owner || 'N/A',
        // Keep original API fields
        middle_name: apiContact.middle_name,
        last_name: apiContact.last_name,
        user: apiContact.user,
        salutation: apiContact.salutation,
        designation: apiContact.designation,
        gender: apiContact.gender,
        creation: apiContact.creation,
        modified: apiContact.modified,
        email_id: apiContact.email_id,
        mobile_no: apiContact.mobile_no,
        image: apiContact.image,
        owner: apiContact.owner
      }));

      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch contacts');
      showToast('Failed to fetch contacts', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInHours < 48) return '1 day ago';
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;

      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = contacts.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField] ?? '';
    const bValue = b[sortField] ?? '';

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortButton = ({ field, children }: { field: keyof Contact; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center space-x-1 text-left font-medium hover:text-gray-700 ${theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-900'
        }`}
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc'
          ? <ChevronUp className="w-4 h-4" />
          : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
        ? 'bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-center">
          <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purplebg' : 'text-blue-600'}`} />
          <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading contacts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
        ? 'bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        <div className="text-center">
          <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading contacts</div>
          <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
          <button
            onClick={fetchContacts}
            className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
              ? 'bg-purplebg text-white hover:bg-purple-700'
              : 'bg-purplebg text-white hover:purple-700'
              }`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
      ? 'bg-custom-gradient border-transparent !rounded-none'
      : 'bg-white border-gray-200'
      }`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-b-purplebg' : 'bg-gray-50 border-gray-200'
            }`}>
            <tr className="divide-x-[1px]">
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="name">Name</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="email">Email</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="phone">Phone</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="company_name">Organization</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="lastContact">Last Contact</SortButton>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
            {sortedData.map((contact) => (
              <tr
                key={contact.id}
                className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                  }`}
                onClick={() => onContactClick && onContactClick(contact)}
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
                      }`}>
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                        }`}>
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Mail className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                    {contact.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Phone className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                    {contact.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                    <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.company_name}</div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                  {contact.lastContact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No results found</div>
          <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
            Try adjusting your search criteria
          </div>
        </div>
      )}
    </div>
  );
}