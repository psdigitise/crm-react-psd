
// // import React, { useState, useEffect } from 'react';
// // import { ChevronDown, ChevronUp, Globe, Building2, DollarSign, Users, Loader2 } from 'lucide-react';
// // import { useTheme } from './ThemeProvider';
// // import { showToast } from '../utils/toast';

// // import { getUserSession } from '../utils/session';

// // interface Organization {
// //   id: string;
// //   name: string;
// //   organization_name: string;
// //   website: string;
// //   territory: string;
// //   industry: string;
// //   no_of_employees?: string;
// //   currency?: string;
// //   annual_revenue?: string;
// //   location?: string;
// //   lastModified?: string;
// //   // API fields
// //   creation?: string;
// //   modified?: string;
// // }

// // interface OrganizationsTableProps {
// //   searchTerm: string;
// //   onOrganizationClick?: (organization: Organization) => void;
// // }

// // export function OrganizationsTable({ searchTerm, onOrganizationClick }: OrganizationsTableProps) {
// //   const { theme } = useTheme();
// //   const [organizations, setOrganizations] = useState<Organization[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [sortField, setSortField] = useState<keyof Organization | null>(null);
// //   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

// //   useEffect(() => {
// //     fetchOrganizations();
// //   }, []);

// //   const fetchOrganizations = async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);

// //       const session = getUserSession();

// //       if (!session) {
// //         setOrganizations([]);
// //         setLoading(false);
// //         return;
// //       }

// //       const apiUrl = `http://103.214.132.20:8002/api/method/crm.api.doc.get_data`;

// //       const requestBody = {
// //         doctype: "CRM Organization",
// //         filters: {},
// //         order_by: "modified desc",
// //         default_filters: {},
// //         column_field: "status",
// //         columns: JSON.stringify([
// //           { label: "Organization", type: "Data", key: "organization_name", width: "16rem" },
// //           { label: "Website", type: "Data", key: "website", width: "14rem" },
// //           { label: "Industry", type: "Link", key: "industry", options: "CRM Industry", width: "92px" },
// //           { label: "Annual Revenue", type: "Currency", key: "annual_revenue", width: "14rem" },
// //           { label: "Last Modified", type: "Datetime", key: "modified", width: "8rem" }
// //         ]),
// //         kanban_columns: JSON.stringify([]),
// //         kanban_fields: JSON.stringify([]),
// //         page_length: 20,
// //         page_length_count: 20,
// //         rows: JSON.stringify([
// //           "name", "organization_name", "organization_logo", "website", "industry", 
// //           "currency", "annual_revenue", "modified", "owner", "creation", 
// //           "modified_by", "_assign", "_liked_by", "territory", "no_of_employees"
// //         ]),
// //         title_field: "",
// //         view: {
// //           custom_view_name: 8,
// //           view_type: "list",
// //           group_by_field: "owner"
// //         }
// //       };

// //       const response = await fetch(apiUrl, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': `token ${session.api_key}:${session.api_secret}`
// //         },
// //         body: JSON.stringify(requestBody)
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
// //       }

// //       const result = await response.json();
      
// //       // Transform API data to match our Organization interface
// //       const transformedOrganizations: Organization[] = result.message.data.map((apiOrg: any) => ({
// //         id: apiOrg.name || Math.random().toString(),
// //         name: apiOrg.organization_name || 'Unknown',
// //         organization_name: apiOrg.organization_name || '',
// //         website: apiOrg.website || 'N/A',
// //         territory: apiOrg.territory || 'N/A',
// //         industry: apiOrg.industry || 'N/A',
// //         no_of_employees: apiOrg.no_of_employees || 'N/A',
// //         currency: apiOrg.currency || 'INR',
// //         annual_revenue: apiOrg.annual_revenue ? `${apiOrg.currency || 'INR'} ${apiOrg.annual_revenue}` : 'N/A',
// //         location: apiOrg.territory || 'N/A',
// //         lastModified: formatDate(apiOrg.modified),
// //         // Keep original API fields
// //         creation: apiOrg.creation,
// //         modified: apiOrg.modified
// //       }));

// //       setOrganizations(transformedOrganizations);
// //     } catch (error) {
// //       console.error('Error fetching organizations:', error);
// //       setError(error instanceof Error ? error.message : 'Failed to fetch organizations');
// //       showToast('Failed to fetch organizations', { type: 'error' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const formatDate = (dateString: string): string => {
// //     if (!dateString) return 'N/A';

// //     try {
// //       const date = new Date(dateString);
// //       const now = new Date();
// //       const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

// //       if (diffInHours < 1) return 'Just now';
// //       if (diffInHours < 24) return `${diffInHours} hours ago`;
// //       if (diffInHours < 48) return '1 day ago';
// //       if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;

// //       return date.toLocaleDateString();
// //     } catch {
// //       return dateString;
// //     }
// //   };

// //   const handleSort = (field: keyof Organization) => {
// //     if (sortField === field) {
// //       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
// //     } else {
// //       setSortField(field);
// //       setSortDirection('asc');
// //     }
// //   };

// //   const filteredData = organizations.filter(item =>
// //     Object.values(item).some(value =>
// //       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
// //     )
// //   );

// //   const sortedData = [...filteredData].sort((a, b) => {
// //     if (!sortField) return 0;

// //     const aValue = a[sortField] ?? '';
// //     const bValue = b[sortField] ?? '';

// //     if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
// //     if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
// //     return 0;
// //   });

// //   const SortButton = ({ field, children }: { field: keyof Organization; children: React.ReactNode }) => (
// //     <button
// //       onClick={() => handleSort(field)}
// //       className={`flex items-center space-x-1 text-left font-medium hover:text-gray-700 ${theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-900'
// //         }`}
// //     >
// //       <span>{children}</span>
// //       {sortField === field && (
// //         sortDirection === 'asc'
// //           ? <ChevronUp className="w-4 h-4" />
// //           : <ChevronDown className="w-4 h-4" />
// //       )}
// //     </button>
// //   );

// //   if (loading) {
// //     return (
// //          <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
// //         ? 'bg-custom-gradient border-transparent !rounded-none'
// //         : 'bg-white border-gray-200'
// //         }`}>
// //         <div className="flex items-center justify-center">
// //           <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purple-400' : 'text-blue-600'}`} />
// //           <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading organizations...</span>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //          <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
// //         ? 'bg-custom-gradient border-transparent !rounded-none'
// //         : 'bg-white border-gray-200'
// //         }`}>
// //         <div className="text-center">
// //           <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading organizations</div>
// //           <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
// //           <button
// //             onClick={fetchOrganizations}
// //             className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
// //               ? 'bg-purplebg text-white hover:bg-purple-700'
// //               : 'bg-purplebg text-white hover:purple-700'
// //               }`}
// //           >
// //             Retry
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //        <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
// //       ? 'bg-custom-gradient border-transparent !rounded-none'
// //       : 'bg-white border-gray-200'
// //       }`}>
// //       <div className="overflow-x-auto">
// //         <table className="w-full">
// //           <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-b-purplebg' : 'bg-gray-50 border-gray-200'
// //             }`}>
// //             <tr className="divide-x-[1px]">
// //               <th className="px-6 py-3 text-left">
// //                 <input
// //                   type="checkbox"
// //                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
// //                 />
// //               </th>
// //               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                 }`}>
// //                 <SortButton field="name">Organization Name</SortButton>
// //               </th>
// //               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                 }`}>
// //                 <SortButton field="website">Website</SortButton>
// //               </th>
// //               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                 }`}>
// //                 <SortButton field="industry">Industry</SortButton>
// //               </th>
// //               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                 }`}>
// //                 <SortButton field="annual_revenue">Annual Revenue</SortButton>
// //               </th>
// //               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                 }`}>
// //                 <SortButton field="no_of_employees">Employees</SortButton>
// //               </th>
// //               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                 }`}>
// //                 <SortButton field="territory">Territory</SortButton>
// //               </th>
// //               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                 }`}>
// //                 <SortButton field="lastModified">Last Modified</SortButton>
// //               </th>
// //             </tr>
// //           </thead>
// //           <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
// //             {sortedData.map((org) => (
// //               <tr
// //                 key={org.id}
// //                 className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
// //                   }`}
// //                 onClick={() => onOrganizationClick && onOrganizationClick(org)}
// //               >
// //                 <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
// //                   <input
// //                     type="checkbox"
// //                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
// //                   />
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap">
// //                   <div className="flex items-center">
// //                     <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-blue-100'
// //                       }`}>
// //                       <Building2 className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
// //                     </div>
// //                     <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{org.name}</div>
// //                   </div>
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap">
// //                   <div className={`flex items-center text-sm hover:text-blue-800 ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600'
// //                     }`}>
// //                     <Globe className="w-4 h-4 mr-2" />
// //                     <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer">
// //                       {org.website}
// //                     </a>
// //                   </div>
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap">
// //                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
// //                     }`}>
// //                     {org.industry}
// //                   </span>
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap">
// //                   <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
// //                     }`}>
// //                     <DollarSign className="w-4 h-4 mr-1" />
// //                     {org.annual_revenue}
// //                   </div>
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap">
// //                   <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
// //                     <Users className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
// //                     {org.no_of_employees}
// //                   </div>
// //                 </td>
// //                 <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
// //                   {org.territory}
// //                 </td>
// //                 <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
// //                   {org.lastModified}
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {sortedData.length === 0 && !loading && (
// //         <div className="text-center py-12">
// //           <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No results found</div>
// //           <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
// //             Try adjusting your search criteria
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }


// import React, { useState, useEffect, useRef } from 'react';
// import { ChevronDown, ChevronUp, Globe, Building2, DollarSign, Users, Loader2 } from 'lucide-react';
// import { useTheme } from './ThemeProvider';
// import { showToast } from '../utils/toast';

// import { getUserSession } from '../utils/session';

// interface Organization {
//   id: string;
//   name: string;
//   organization_name: string;
//   website: string;
//   territory: string;
//   industry: string;
//   no_of_employees?: string;
//   currency?: string;
//   annual_revenue?: string;
//   location?: string;
//   lastModified?: string;
//   // API fields
//   creation?: string;
//   modified?: string;
// }

// interface OrganizationsTableProps {
//   searchTerm: string;
//   onOrganizationClick?: (organization: Organization) => void;
// }

// export function OrganizationsTable({ searchTerm, onOrganizationClick }: OrganizationsTableProps) {
//   const { theme } = useTheme();
//   const [organizations, setOrganizations] = useState<Organization[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sortField, setSortField] = useState<keyof Organization | null>(null);
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     fetchOrganizations();
    
//     // Start the soft refresh interval (every 1 second)
//     intervalRef.current = setInterval(() => {
//       softRefreshOrganizations();
//     }, 1000);

//     // Cleanup interval on unmount
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, []);

//   const fetchOrganizations = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const session = getUserSession();

//       if (!session) {
//         setOrganizations([]);
//         setLoading(false);
//         return;
//       }

//       const apiUrl = `http://103.214.132.20:8002/api/method/crm.api.doc.get_data`;

//       const requestBody = {
//         doctype: "CRM Organization",
//         filters: {},
//         order_by: "modified desc",
//         default_filters: {},
//         column_field: "status",
//         columns: JSON.stringify([
//           { label: "Organization", type: "Data", key: "organization_name", width: "16rem" },
//           { label: "Website", type: "Data", key: "website", width: "14rem" },
//           { label: "Industry", type: "Link", key: "industry", options: "CRM Industry", width: "92px" },
//           { label: "Annual Revenue", type: "Currency", key: "annual_revenue", width: "14rem" },
//           { label: "Last Modified", type: "Datetime", key: "modified", width: "8rem" }
//         ]),
//         kanban_columns: JSON.stringify([]),
//         kanban_fields: JSON.stringify([]),
//         page_length: 20,
//         page_length_count: 20,
//         rows: JSON.stringify([
//           "name", "organization_name", "organization_logo", "website", "industry", 
//           "currency", "annual_revenue", "modified", "owner", "creation", 
//           "modified_by", "_assign", "_liked_by", "territory", "no_of_employees"
//         ]),
//         title_field: "",
//         view: {
//           custom_view_name: 8,
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
      
//       // Transform API data to match our Organization interface
//       const transformedOrganizations: Organization[] = result.message.data.map((apiOrg: any) => ({
//         id: apiOrg.name || Math.random().toString(),
//         name: apiOrg.organization_name || 'Unknown',
//         organization_name: apiOrg.organization_name || '',
//         website: apiOrg.website || 'N/A',
//         territory: apiOrg.territory || 'N/A',
//         industry: apiOrg.industry || 'N/A',
//         no_of_employees: apiOrg.no_of_employees || 'N/A',
//         currency: apiOrg.currency || 'INR',
//         annual_revenue: apiOrg.annual_revenue ? `${apiOrg.currency || 'INR'} ${apiOrg.annual_revenue}` : 'N/A',
//         location: apiOrg.territory || 'N/A',
//         lastModified: formatDate(apiOrg.modified),
//         // Keep original API fields
//         creation: apiOrg.creation,
//         modified: apiOrg.modified
//       }));

//       setOrganizations(transformedOrganizations);
//     } catch (error) {
//       console.error('Error fetching organizations:', error);
//       setError(error instanceof Error ? error.message : 'Failed to fetch organizations');
//       showToast('Failed to fetch organizations', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Soft refresh function - fetches data without showing loading state
//   const softRefreshOrganizations = async () => {
//     try {
//       const session = getUserSession();

//       if (!session) {
//         return;
//       }

//       const apiUrl = `http://103.214.132.20:8002/api/method/crm.api.doc.get_data`;

//       const requestBody = {
//         doctype: "CRM Organization",
//         filters: {},
//         order_by: "modified desc",
//         default_filters: {},
//         column_field: "status",
//         columns: JSON.stringify([
//           { label: "Organization", type: "Data", key: "organization_name", width: "16rem" },
//           { label: "Website", type: "Data", key: "website", width: "14rem" },
//           { label: "Industry", type: "Link", key: "industry", options: "CRM Industry", width: "92px" },
//           { label: "Annual Revenue", type: "Currency", key: "annual_revenue", width: "14rem" },
//           { label: "Last Modified", type: "Datetime", key: "modified", width: "8rem" }
//         ]),
//         kanban_columns: JSON.stringify([]),
//         kanban_fields: JSON.stringify([]),
//         page_length: 20,
//         page_length_count: 20,
//         rows: JSON.stringify([
//           "name", "organization_name", "organization_logo", "website", "industry", 
//           "currency", "annual_revenue", "modified", "owner", "creation", 
//           "modified_by", "_assign", "_liked_by", "territory", "no_of_employees"
//         ]),
//         title_field: "",
//         view: {
//           custom_view_name: 8,
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
//         console.error('Soft refresh failed:', response.status, response.statusText);
//         return;
//       }

//       const result = await response.json();
      
//       // Transform API data to match our Organization interface
//       const transformedOrganizations: Organization[] = result.message.data.map((apiOrg: any) => ({
//         id: apiOrg.name || Math.random().toString(),
//         name: apiOrg.organization_name || 'Unknown',
//         organization_name: apiOrg.organization_name || '',
//         website: apiOrg.website || 'N/A',
//         territory: apiOrg.territory || 'N/A',
//         industry: apiOrg.industry || 'N/A',
//         no_of_employees: apiOrg.no_of_employees || 'N/A',
//         currency: apiOrg.currency || 'INR',
//         annual_revenue: apiOrg.annual_revenue ? `${apiOrg.currency || 'INR'} ${apiOrg.annual_revenue}` : 'N/A',
//         location: apiOrg.territory || 'N/A',
//         lastModified: formatDate(apiOrg.modified),
//         // Keep original API fields
//         creation: apiOrg.creation,
//         modified: apiOrg.modified
//       }));

//       // Update organizations silently
//       setOrganizations(transformedOrganizations);
//     } catch (error) {
//       console.error('Soft refresh error:', error);
//       // Silently fail - don't show error toast for soft refresh failures
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

//   const handleSort = (field: keyof Organization) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   };

//   const filteredData = organizations.filter(item =>
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

//   const SortButton = ({ field, children }: { field: keyof Organization; children: React.ReactNode }) => (
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
//          <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
//         ? 'bg-custom-gradient border-transparent !rounded-none'
//         : 'bg-white border-gray-200'
//         }`}>
//         <div className="flex items-center justify-center">
//           <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purple-400' : 'text-blue-600'}`} />
//           <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading organizations...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//          <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
//         ? 'bg-custom-gradient border-transparent !rounded-none'
//         : 'bg-white border-gray-200'
//         }`}>
//         <div className="text-center">
//           <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading organizations</div>
//           <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
//           <button
//             onClick={fetchOrganizations}
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
//        <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
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
//                 <SortButton field="name">Organization Name</SortButton>
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="website">Website</SortButton>
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="industry">Industry</SortButton>
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="annual_revenue">Annual Revenue</SortButton>
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="no_of_employees">Employees</SortButton>
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="territory">Territory</SortButton>
//               </th>
//               <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                 }`}>
//                 <SortButton field="lastModified">Last Modified</SortButton>
//               </th>
//             </tr>
//           </thead>
//           <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
//             {sortedData.map((org) => (
//               <tr
//                 key={org.id}
//                 className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
//                   }`}
//                 onClick={() => onOrganizationClick && onOrganizationClick(org)}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
//                   <input
//                     type="checkbox"
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-blue-100'
//                       }`}>
//                       <Building2 className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
//                     </div>
//                     <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{org.name}</div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className={`flex items-center text-sm hover:text-blue-800 ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600'
//                     }`}>
//                     <Globe className="w-4 h-4 mr-2" />
//                     <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer">
//                       {org.website}
//                     </a>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
//                     }`}>
//                     {org.industry}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
//                     }`}>
//                     <DollarSign className="w-4 h-4 mr-1" />
//                     {org.annual_revenue}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                     <Users className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                     {org.no_of_employees}
//                   </div>
//                 </td>
//                 <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {org.territory}
//                 </td>
//                 <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                   {org.lastModified}
//                 </td>
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


import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Globe, Building2, IndianRupee , Users, Loader2, ChevronLeft, ChevronRight, Filter, X, Settings, RefreshCcw, Download } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { getUserSession } from '../utils/session';

interface Organization {
  id: string;
  name: string;
  organization_name: string;
  website: string;
  territory: string;
  industry: string;
  no_of_employees?: string;
  currency?: string;
  annual_revenue?: string;
  location?: string;
  lastModified?: string;
  // API fields
  creation?: string;
  modified?: string;
}

interface OrganizationsTableProps {
  searchTerm: string;
  onOrganizationClick?: (organization: Organization) => void;
}

interface FilterState {
  industry: string[];
  territory: string[];
  currency: string[];
}

interface ColumnConfig {
  key: keyof Organization;
  label: string;
  visible: boolean;
  sortable: boolean;
}

const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Organization Name', visible: true, sortable: true },
  { key: 'website', label: 'Website', visible: true, sortable: true },
  { key: 'industry', label: 'Industry', visible: true, sortable: true },
  { key: 'annual_revenue', label: 'Annual Revenue', visible: true, sortable: true },
  { key: 'no_of_employees', label: 'Employees', visible: true, sortable: true },
  { key: 'territory', label: 'Territory', visible: true, sortable: true },
  { key: 'lastModified', label: 'Last Modified', visible: true, sortable: true },
  { key: 'currency', label: 'Currency', visible: false, sortable: true },
];

export function OrganizationsTable({ searchTerm, onOrganizationClick }: OrganizationsTableProps) {
  const { theme } = useTheme();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Organization | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    industry: [],
    territory: [],
    currency: []
  });

  // Column management
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    industry: [] as string[],
    territory: [] as string[],
    currency: [] as string[]
  });

  useEffect(() => {
    fetchOrganizations();
    
    // Start the soft refresh interval (every 1 second)
    intervalRef.current = setInterval(() => {
      softRefreshOrganizations();
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Reset to first page when search term changes
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = getUserSession();

      if (!session) {
        setOrganizations([]);
        setLoading(false);
        return;
      }

      const apiUrl = `http://103.214.132.20:8002/api/method/crm.api.doc.get_data`;

      const requestBody = {
        doctype: "CRM Organization",
        filters: {},
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
      
      // Transform API data to match our Organization interface
      const transformedOrganizations: Organization[] = result.message.data.map((apiOrg: any) => ({
        id: apiOrg.name || Math.random().toString(),
        name: apiOrg.organization_name || 'Unknown',
        organization_name: apiOrg.organization_name || '',
        website: apiOrg.website || 'N/A',
        territory: apiOrg.territory || 'N/A',
        industry: apiOrg.industry || 'N/A',
        no_of_employees: apiOrg.no_of_employees || 'N/A',
        currency: apiOrg.currency || 'INR',
        annual_revenue: apiOrg.annual_revenue ? `${apiOrg.currency || 'INR'} ${apiOrg.annual_revenue}` : 'N/A',
        location: apiOrg.territory || 'N/A',
        lastModified: formatDate(apiOrg.modified),
        // Keep original API fields
        creation: apiOrg.creation,
        modified: apiOrg.modified
      }));

      setOrganizations(transformedOrganizations);

      // Extract unique values for filter options
      const industries = [...new Set(transformedOrganizations.map(org => org.industry).filter(Boolean))];
      const territories = [...new Set(transformedOrganizations.map(org => org.territory).filter(Boolean))];
      const currencies = [...new Set(transformedOrganizations.map(org => org.currency).filter(Boolean))];

      setFilterOptions({
        industry: industries.filter((i): i is string => typeof i === 'string'),
        territory: territories.filter((t): t is string => typeof t === 'string'),
        currency: currencies.filter((c): c is string => typeof c === 'string')
      });

    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch organizations');
      showToast('Failed to fetch organizations', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Soft refresh function - fetches data without showing loading state
  const softRefreshOrganizations = async () => {
    try {
      const session = getUserSession();

      if (!session) {
        return;
      }

      const apiUrl = `http://103.214.132.20:8002/api/method/crm.api.doc.get_data`;

      const requestBody = {
        doctype: "CRM Organization",
        filters: {},
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

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error('Soft refresh failed:', response.status, response.statusText);
        return;
      }

      const result = await response.json();
      
      // Transform API data to match our Organization interface
      const transformedOrganizations: Organization[] = result.message.data.map((apiOrg: any) => ({
        id: apiOrg.name || Math.random().toString(),
        name: apiOrg.organization_name || 'Unknown',
        organization_name: apiOrg.organization_name || '',
        website: apiOrg.website || 'N/A',
        territory: apiOrg.territory || 'N/A',
        industry: apiOrg.industry || 'N/A',
        no_of_employees: apiOrg.no_of_employees || 'N/A',
        currency: apiOrg.currency || 'INR',
        annual_revenue: apiOrg.annual_revenue ? `${apiOrg.currency || 'INR'} ${apiOrg.annual_revenue}` : 'N/A',
        location: apiOrg.territory || 'N/A',
        lastModified: formatDate(apiOrg.modified),
        // Keep original API fields
        creation: apiOrg.creation,
        modified: apiOrg.modified
      }));

      // Update organizations silently
      setOrganizations(transformedOrganizations);
    } catch (error) {
      console.error('Soft refresh error:', error);
      // Silently fail - don't show error toast for soft refresh failures
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

  const handleSort = (field: keyof Organization) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = () => {
    fetchOrganizations();
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      industry: [],
      territory: [],
      currency: []
    });
    setCurrentPage(1);
  };

  const toggleColumn = (columnKey: keyof Organization) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleDeleteSelected = async () => {
    // if (!window.confirm(`Delete ${selectedIds.length} selected organization(s)?`)) return;

    setLoading(true);
    setError(null);

    try {
      const session = getUserSession();
      for (const id of selectedIds) {
        const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Organization/${id}`;
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${session.api_key}:${session.api_secret}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to delete organization ${id}: ${response.statusText}`);
        }
      }
      setSelectedIds([]); // Clear selection
      fetchOrganizations(); // Refresh data
      showToast('Organizations deleted successfully', { type: 'success' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete organizations');
      showToast('Failed to delete organizations', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedData = () => {
    let filteredData = organizations.filter(item => {
      // Search filter
      const matchesSearch = searchTerm === '' || Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Industry filter
      const matchesIndustry = filters.industry.length === 0 ||
        (item.industry && filters.industry.includes(item.industry));

      // Territory filter
      const matchesTerritory = filters.territory.length === 0 ||
        (item.territory && filters.territory.includes(item.territory));

      // Currency filter
      const matchesCurrency = filters.currency.length === 0 ||
        (item.currency && filters.currency.includes(item.currency));

      return matchesSearch && matchesIndustry && matchesTerritory && matchesCurrency;
    });

    // Sort data
    if (sortField) {
      filteredData.sort((a, b) => {
        const aValue = a[sortField] ?? '';
        const bValue = b[sortField] ?? '';

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  };

  const getPaginatedData = () => {
    const filteredData = getFilteredAndSortedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filteredData = getFilteredAndSortedData();
    return Math.ceil(filteredData.length / itemsPerPage);
  };

  const getVisibleColumns = () => columns.filter(col => col.visible);

  const SortButton = ({ field, children }: { field: keyof Organization; children: React.ReactNode }) => (
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

  const FilterDropdown = ({
    title,
    options,
    selected,
    onChange
  }: {
    title: string;
    options: string[];
    selected: string[];
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
        ? 'bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-center">
          <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purple-400' : 'text-blue-600'}`} />
          <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading organizations...</span>
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
          <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading organizations</div>
          <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
          <button
            onClick={fetchOrganizations}
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

  const paginatedData = getPaginatedData();
  const totalPages = getTotalPages();
  const visibleColumns = getVisibleColumns();
  const filteredDataLength = getFilteredAndSortedData().length;

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${theme === 'dark'
              ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
              : 'border-gray-300 hover:bg-gray-50'
              }`}
          >
            <RefreshCcw className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors flex items-center space-x-1 ${Object.values(filters).some(arr => arr.length > 0)
                ? theme === 'dark'
                  ? 'border-purple-500 bg-purplebg/30 text-purple-300'
                  : 'border-blue-500 bg-blue-50 text-blue-700'
                : theme === 'dark'
                  ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                  : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {Object.values(filters).some(arr => arr.length > 0) && (
                <span className="bg-blue-600 text-white text-sm font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)}
                </span>
              )}
            </button>

            {showFilters && (
              <div className={`absolute top-full left-0 mt-2 w-80 rounded-lg shadow-lg z-10 p-4 ${theme === 'dark'
                ? 'bg-dark-accent border border-purple-500/30'
                : 'bg-white border border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={clearFilters}
                      className={`text-sm ${theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className={theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-600'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filterOptions.industry.length > 0 && (
                    <FilterDropdown
                      title="Industry"
                      options={filterOptions.industry}
                      selected={filters.industry}
                      onChange={(value) => handleFilterChange('industry', value)}
                    />
                  )}

                  {filterOptions.territory.length > 0 && (
                    <FilterDropdown
                      title="Territory"
                      options={filterOptions.territory}
                      selected={filters.territory}
                      onChange={(value) => handleFilterChange('territory', value)}
                    />
                  )}

                  {filterOptions.currency.length > 0 && (
                    <FilterDropdown
                      title="Currency"
                      options={filterOptions.currency}
                      selected={filters.currency}
                      onChange={(value) => handleFilterChange('currency', value)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors flex items-center space-x-1 ${theme === 'dark'
                ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Settings className="w-4 h-4" />
              <span>Columns</span>
            </button>

            {showColumnSettings && (
              <div className={`absolute top-full left-0 mt-2 w-64 rounded-lg shadow-lg z-10 p-4 ${theme === 'dark'
                ? 'bg-dark-accent border border-purple-500/30'
                : 'bg-white border border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manage Columns</h3>
                  <button
                    onClick={() => setShowColumnSettings(false)}
                    className={theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-600'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {columns.map(column => (
                    <label key={column.key} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => toggleColumn(column.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {/* Export Excel Button */}
            <div title="Export Excel">
              <button
                onClick={() => exportToExcel(getFilteredAndSortedData(), 'Organizations')}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${theme === 'dark'
                  ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                  : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDataLength)} of {filteredDataLength} results
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={`text-sm border rounded px-2 py-1 ${theme === 'dark'
              ? 'bg-white-31 border-white text-white'
              : 'border-gray-300'
              }`}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Delete selected organizations button - shown when items are selected */}
      {/* {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
              {selectedIds.length} Rows selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedIds([])}
              className={`text-sm px-3 py-1 rounded transition-colors ${theme === 'dark' 
                ? 'text-white hover:bg-white/10' 
                : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              Select all
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className={`p-1 rounded transition-colors ${theme === 'dark' 
                ? 'text-white hover:bg-white/10' 
                : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )} */}

      {/* Floating delete button */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center space-x-3">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
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
                    checked={paginatedData.length > 0 && paginatedData.every(org => selectedIds.includes(org.id))}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedIds([
                          ...selectedIds,
                          ...paginatedData
                            .map(org => org.id)
                            .filter(id => !selectedIds.includes(id))
                        ]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => !paginatedData.map(org => org.id).includes(id)));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {visibleColumns.map(column => (
                  <th key={column.key} className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    {column.sortable ? (
                      <SortButton field={column.key}>{column.label}</SortButton>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
              {paginatedData.map((org) => (
                <tr
                  key={org.id}
                  className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => onOrganizationClick && onOrganizationClick(org)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(org.id)}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, org.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== org.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {visibleColumns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.key === 'name' && (
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-blue-100'
                            }`}>
                            <Building2 className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
                          </div>
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{org.name}</div>
                        </div>
                      )}
                      {column.key === 'website' && (
                        <div className={`flex items-center text-sm hover:text-blue-800 ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600'
                          }`}>
                          <Globe className="w-4 h-4 mr-2" />
                          <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            {org.website}
                          </a>
                        </div>
                      )}
                      {column.key === 'industry' && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {org.industry}
                        </span>
                      )}
                      {column.key === 'annual_revenue' && (
                        <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>
                          <IndianRupee  className="w-4 h-4 mr-1" />
                          {org.annual_revenue}
                        </div>
                      )}
                      {column.key === 'no_of_employees' && (
                        <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <Users className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                          {org.no_of_employees}
                        </div>
                      )}
                      {!['name', 'website', 'industry', 'annual_revenue', 'no_of_employees'].includes(column.key) && (
                        <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {org[column.key] || 'N/A'}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No results found</div>
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Try adjusting your search criteria or filters
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${currentPage === pageNum
                      ? theme === 'dark'
                        ? 'border-purple-500 bg-purplebg/30 text-purple-300'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : theme === 'dark'
                        ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                        : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}