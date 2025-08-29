// // import React, { useState, useEffect } from 'react';
// // import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Edit, Trash2, Phone, Clock } from 'lucide-react';
// // import { showToast } from '../utils/toast';
// // import { Header } from './Header';
// // import { useTheme } from './ThemeProvider';


// // import { getUserSession } from '../utils/session';


// // interface CallLog {
// //   name: string;
// //   from: string;
// //   to: string;
// //   status: 'Ringing' | 'Answered' | 'Busy' | 'No Answer' | 'Failed';
// //   type: 'Incoming' | 'Outgoing' | 'Missed';
// //   duration?: string;
// //   reference_doctype?: string;
// //   id?: string;
// //   creation?: string;
// //   modified?: string;
// // }

// // interface CallLogsPageProps {
// //   onCreateCallLog: () => void;
// //   leadName?: string;
// // }

// // const statusColors = {
// //   'Ringing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
// //   'Answered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
// //   'Busy': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
// //   'No Answer': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white',
// //   'Failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
// // };

// // const typeColors = {
// //   'Incoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
// //   'Outgoing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
// //   'Missed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
// // };

// // export function CallLogsPage({ onCreateCallLog, leadName }: CallLogsPageProps) {
// //   const { theme } = useTheme();
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [callLogs, setCallLogs] = useState<CallLog[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

// //   useEffect(() => {
// //     fetchCallLogs();
// //   }, [leadName]);


// //   const fetchCallLogs = async () => {
// //     try {
// //       setLoading(true);

// //       const session = getUserSession();

// //       if (!session) {
// //         setCallLogs([]);
// //         setLoading(false);
// //         return;
// //       }

// //       const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';

// //       const requestBody = {
// //         doctype: "CRM Call Log",
// //         filters: {},
// //         order_by: "modified desc",
// //         default_filters: {},
// //         column_field: "status",
// //         columns: "[{\"label\": \"Caller\", \"type\": \"Link\", \"key\": \"caller\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Receiver\", \"type\": \"Link\", \"key\": \"receiver\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Type\", \"type\": \"Select\", \"key\": \"type\", \"width\": \"9rem\"}, {\"label\": \"Status\", \"type\": \"Select\", \"key\": \"status\", \"width\": \"9rem\"}, {\"label\": \"Duration\", \"type\": \"Duration\", \"key\": \"duration\", \"width\": \"6rem\"}, {\"label\": \"From (number)\", \"type\": \"Data\", \"key\": \"from\", \"width\": \"9rem\"}, {\"label\": \"To (number)\", \"type\": \"Data\", \"key\": \"to\", \"width\": \"9rem\"}, {\"label\": \"Created On\", \"type\": \"Datetime\", \"key\": \"creation\", \"width\": \"8rem\"}]",
// //         kanban_columns: "[]",
// //         kanban_fields: "[]",
// //         page_length: 20,
// //         page_length_count: 20,
// //         rows: "[\"name\", \"caller\", \"receiver\", \"type\", \"status\", \"duration\", \"from\", \"to\", \"note\", \"recording_url\", \"reference_doctype\", \"reference_docname\", \"creation\"]",
// //         title_field: "",
// //         view: {
// //           custom_view_name: "20",
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
// //       let callLogsData = result.message?.data || [];

// //       // Map the response data to match our CallLog interface
// //       const mappedCallLogs = callLogsData.map((item: any) => ({
// //         name: item.name,
// //         from: item.from,
// //         to: item.to,
// //         status: item.status,
// //         type: item.type,
// //         duration: item.duration,
// //         reference_doctype: item.reference_doctype,
// //         id: item.reference_docname,
// //         creation: item.creation,
// //         modified: item.modified
// //       }));

// //       // Filter by leadName if provided
// //       let filteredCallLogs = mappedCallLogs;
// //       if (leadName) {
// //         filteredCallLogs = mappedCallLogs.filter((callLog: CallLog) =>
// //           callLog.id === leadName
// //         );
// //       }

// //       setCallLogs(filteredCallLogs);
// //     } catch (error) {
// //       // console.error('Error fetching call logs:', error);
// //       // showToast('Failed to fetch call logs', { type: 'error' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleEdit = (callLog: CallLog) => {
// //     setEditingCallLog(callLog);
// //     setShowEditModal(true);
// //   };

// //   const handleUpdate = async (updatedCallLog: CallLog) => {
// //     try {
// //       const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${updatedCallLog.name}`;

// //       const response = await fetch(apiUrl, {
// //         method: 'PATCH',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
// //         },
// //         body: JSON.stringify({
// //           from: updatedCallLog.from,
// //           to: updatedCallLog.to,
// //           status: updatedCallLog.status,
// //           type: updatedCallLog.type,
// //           duration: updatedCallLog.duration
// //         })
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
// //       }

// //       showToast('Call log updated successfully', { type: 'success' });
// //       setShowEditModal(false);
// //       setEditingCallLog(null);
// //       fetchCallLogs();
// //     } catch (error) {
// //       console.error('Error updating call log:', error);
// //       showToast('Failed to update call log', { type: 'error' });
// //     }
// //   };

// //   const handleDelete = async (callLogName: string) => {
// //     if (!confirm('Are you sure you want to delete this call log?')) return;

// //     try {
// //       const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callLogName}`;

// //       const response = await fetch(apiUrl, {
// //         method: 'DELETE',
// //         headers: {
// //           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
// //         }
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
// //       }

// //       showToast('Call log deleted successfully', { type: 'success' });
// //       fetchCallLogs();
// //     } catch (error) {
// //       console.error('Error deleting call log:', error);
// //       showToast('Failed to delete call log', { type: 'error' });
// //     }
// //   };

// //   const filteredCallLogs = callLogs.filter(callLog =>
// //     Object.values(callLog).some(value =>
// //       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
// //     )
// //   );

// //   const formatDuration = (seconds?: string) => {
// //     if (!seconds) return "N/A";
// //     const total = parseInt(seconds, 10);
// //     if (isNaN(total)) return "N/A";

// //     const mins = Math.floor(total / 60);
// //     const secs = total % 60;

// //     if (mins > 0) {
// //       return `${mins}m ${secs}s`;
// //     }
// //     return `${secs}s`;
// //   };


// //   const EditModal = () => {
// //     if (!editingCallLog || !showEditModal) return null;

// //     return (
// //       <div className="fixed inset-0 z-50 overflow-y-auto">
// //         <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
// //           <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)} />

// //           <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
// //             }`}>
// //             <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
// //               <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Call Log</h3>

// //               <div className="space-y-4">
// //                 <div>
// //                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>From</label>
// //                   <input
// //                     type="text"
// //                     value={editingCallLog.from}
// //                     onChange={(e) => setEditingCallLog({ ...editingCallLog, from: e.target.value })}
// //                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
// //                       ? 'bg-white-31 border-white text-white'
// //                       : 'border-gray-300'
// //                       }`}
// //                   />
// //                 </div>

// //                 <div>
// //                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>To</label>
// //                   <input
// //                     type="text"
// //                     value={editingCallLog.to}
// //                     onChange={(e) => setEditingCallLog({ ...editingCallLog, to: e.target.value })}
// //                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
// //                       ? 'bg-white-31 border-white text-white'
// //                       : 'border-gray-300'
// //                       }`}
// //                   />
// //                 </div>

// //                 <div>
// //                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Status</label>
// //                   <select
// //                     value={editingCallLog.status}
// //                     onChange={(e) => setEditingCallLog({ ...editingCallLog, status: e.target.value as CallLog['status'] })}
// //                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
// //                       ? 'bg-white-31 border-white text-white'
// //                       : 'border-gray-300'
// //                       }`}
// //                   >
// //                     <option value="Ringing">Ringing</option>
// //                     <option value="Answered">Answered</option>
// //                     <option value="Busy">Busy</option>
// //                     <option value="No Answer">No Answer</option>
// //                     <option value="Failed">Failed</option>
// //                   </select>
// //                 </div>

// //                 <div>
// //                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Type</label>
// //                   <select
// //                     value={editingCallLog.type}
// //                     onChange={(e) => setEditingCallLog({ ...editingCallLog, type: e.target.value as CallLog['type'] })}
// //                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
// //                       ? 'bg-white-31 border-white text-white'
// //                       : 'border-gray-300'
// //                       }`}
// //                   >
// //                     <option value="Incoming">Incoming</option>
// //                     <option value="Outgoing">Outgoing</option>
// //                     <option value="Missed">Missed</option>
// //                   </select>
// //                 </div>

// //                 <div>
// //                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Duration (seconds)</label>
// //                   <input
// //                     type="text"
// //                     value={editingCallLog.duration || ''}
// //                     onChange={(e) => setEditingCallLog({ ...editingCallLog, duration: e.target.value })}
// //                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
// //                       ? 'bg-white-31 border-white text-white'
// //                       : 'border-gray-300'
// //                       }`}
// //                   />
// //                 </div>
// //               </div>
// //             </div>

// //             <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'
// //               }`}>
// //               <button
// //                 onClick={() => handleUpdate(editingCallLog)}
// //                 className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
// //               >
// //                 Update
// //               </button>
// //               <button
// //                 onClick={() => setShowEditModal(false)}
// //                 className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${theme === 'dark'
// //                   ? 'border-purple-500/30 bg-dark-accent text-white hover:bg-purple-800/50'
// //                   : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
// //                   }`}
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   };

// //   if (loading) {
// //     return (
// //       <div className={`min-h-screen ${theme === 'dark'
// //         ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
// //         : 'bg-gray-50'
// //         }`}>
// //         <Header
// //           title="Call Logs"
// //           subtitle={leadName ? `For Lead: ${leadName}` : undefined}
// //           onRefresh={fetchCallLogs}
// //           onFilter={() => { }}
// //           onSort={() => { }}
// //           onColumns={() => { }}
// //           onCreate={onCreateCallLog}
// //           searchValue={searchTerm}
// //           onSearchChange={setSearchTerm}
// //           viewMode={viewMode}
// //           onViewModeChange={setViewMode}
// //         />
// //         <div className="p-4 sm:p-6">
// //           <div className="flex items-center justify-center">
// //             <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading call logs...</div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className={`min-h-screen ${theme === 'dark'
// //       ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
// //       : 'bg-gray-50'
// //       }`}>
// //       <Header
// //         title="Call Logs"
// //         subtitle={leadName ? `For Lead: ${leadName}` : undefined}
// //         onRefresh={fetchCallLogs}
// //         onFilter={() => { }}
// //         onSort={() => { }}
// //         onColumns={() => { }}
// //         onCreate={onCreateCallLog}
// //         searchValue={searchTerm}
// //         onSearchChange={setSearchTerm}
// //         viewMode={viewMode}
// //         onViewModeChange={setViewMode}
// //       />

// //       <div className="p-4 sm:p-6">
// //         {/* Call Logs Table */}
// //         <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
// //           ? 'bg-custom-gradient border-transparent !rounded-none'
// //           : 'bg-white border-gray-200'
// //           }`}>
// //           <div className="overflow-x-auto">
// //             <table className="w-full">
// //               <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-transparent divide-x-2' : 'bg-gray-50 border-gray-200'
// //                 }`}>
// //                 <tr className="">
// //                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                     }`}>
// //                     Type
// //                   </th>
// //                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                     }`}>
// //                     From
// //                   </th>
// //                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                     }`}>
// //                     To
// //                   </th>
// //                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                     }`}>
// //                     Status
// //                   </th>
// //                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                     }`}>
// //                     Duration
// //                   </th>
// //                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                     }`}>
// //                     Date
// //                   </th>
// //                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
// //                     }`}>
// //                     Actions
// //                   </th>
// //                 </tr>
// //               </thead>
// //               <tbody
// //                 className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}
// //               >
// //                 {filteredCallLogs.map((callLog) => (
// //                   <tr
// //                     key={callLog.name}
// //                     className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
// //                       }`}
// //                     onClick={() => handleEdit(callLog)} // open modal when row clicked
// //                   >
// //                     <td className="px-6 py-4 whitespace-nowrap">
// //                       <div className="flex items-center">
// //                         <Phone
// //                           className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}
// //                         />
// //                         <span
// //                           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColors[callLog.type]
// //                             }`}
// //                         >
// //                           {callLog.type}
// //                         </span>
// //                       </div>
// //                     </td>
// //                     <td
// //                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
// //                         }`}
// //                     >
// //                       {callLog.from || 'N/A'}
// //                     </td>
// //                     <td
// //                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
// //                         }`}
// //                     >
// //                       {callLog.to || 'N/A'}
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap">
// //                       <span
// //                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-white font-semibold ${statusColors[callLog.status]
// //                           }`}
// //                       >
// //                         {callLog.status}
// //                       </span>
// //                     </td>
// //                     <td
// //                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
// //                         }`}
// //                     >
// //                       {callLog.duration ? (
// //                         <div className="flex items-center space-x-1">
// //                           <Clock className="w-4 h-4 text-white" />
// //                           <span>{formatDuration(callLog.duration)}</span>
// //                         </div>
// //                       ) : (
// //                         "N/A"
// //                       )}
// //                     </td>
// //                     <td
// //                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
// //                         }`}
// //                     >
// //                       {callLog.creation
// //                         ? new Date(callLog.creation).toLocaleString("en-GB", {
// //                           day: "2-digit",
// //                           month: "short",
// //                           hour: "2-digit",
// //                           minute: "2-digit",
// //                           hour12: true,
// //                         })
// //                         : "N/A"}
// //                     </td>

// //                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
// //                       <div className="flex items-center space-x-2">
// //                         {/* Delete button only */}
// //                         <button
// //                           onClick={(e) => {
// //                             e.stopPropagation(); // prevent row click
// //                             handleDelete(callLog.name);
// //                           }}
// //                           className={
// //                             theme === 'dark'
// //                               ? 'text-red-400 hover:text-red-300'
// //                               : 'text-red-600 hover:text-red-900'
// //                           }
// //                         >
// //                           <Trash2 className="w-4 h-4" />
// //                         </button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>

// //             </table>
// //           </div>
// //         </div>

// //         {filteredCallLogs.length === 0 && (
// //           <div className="text-center py-12">
// //             <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No call logs found</div>
// //             <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
// //               {leadName ? 'No call logs for this lead' : 'Create your first call log to get started'}
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       <EditModal />
// //     </div>
// //   );
// // }

// import React, { useState, useEffect } from 'react';
// import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Edit, Trash2, Phone, Clock } from 'lucide-react';
// import { showToast } from '../utils/toast';
// import { Header } from './Header';
// import { useTheme } from './ThemeProvider';
// import { getUserSession } from '../utils/session';

// interface CallLog {
//   name: string;
//   from: string;
//   to: string;
//   status: 'Ringing' | 'Answered' | 'Busy' | 'No Answer' | 'Failed';
//   type: 'Incoming' | 'Outgoing' | 'Missed';
//   duration?: string;
//   reference_doctype?: string;
//   id?: string;
//   creation?: string;
//   modified?: string;
// }

// interface CallLogsPageProps {
//   onCreateCallLog: () => void;
//   leadName?: string;
// }

// interface CallForm {
//   from: string;
//   to: string;
//   status: string;
//   type: string;
//   duration: string;
//   receiver: string;
//   name: string;
// }

// const statusColors = {
//   'Ringing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//   'Answered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//   'Busy': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//   'No Answer': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white',
//   'Failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
// };

// const typeColors = {
//   'Incoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//   'Outgoing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//   'Missed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
// };

// export function CallLogsPage({ onCreateCallLog, leadName }: CallLogsPageProps) {
//   const { theme } = useTheme();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [callLogs, setCallLogs] = useState<CallLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

//   // New state for edit form functionality
//   const [callForm, setCallForm] = useState<CallForm>({
//     from: '',
//     to: '',
//     status: 'Ringing',
//     type: 'Outgoing',
//     duration: '',
//     receiver: '',
//     name: ''
//   });
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [callsLoading, setCallsLoading] = useState(false);

//   // Theme-based styling classes
//   const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textSecondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
//   const cardBgColor = theme === 'dark' ? 'bg-dark-secondary' : 'bg-white';
//   const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
//   const inputBgColor = theme === 'dark' ? 'bg-dark-tertiary text-white' : 'bg-white';

//   useEffect(() => {
//     fetchCallLogs();
//   }, [leadName]);

//   const fetchCallLogs = async () => {
//     try {
//       setLoading(true);

//       const session = getUserSession();

//       if (!session) {
//         setCallLogs([]);
//         setLoading(false);
//         return;
//       }

//       const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';

//       const requestBody = {
//         doctype: "CRM Call Log",
//         filters: {},
//         order_by: "modified desc",
//         default_filters: {},
//         column_field: "status",
//         columns: "[{\"label\": \"Caller\", \"type\": \"Link\", \"key\": \"caller\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Receiver\", \"type\": \"Link\", \"key\": \"receiver\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Type\", \"type\": \"Select\", \"key\": \"type\", \"width\": \"9rem\"}, {\"label\": \"Status\", \"type\": \"Select\", \"key\": \"status\", \"width\": \"9rem\"}, {\"label\": \"Duration\", \"type\": \"Duration\", \"key\": \"duration\", \"width\": \"6rem\"}, {\"label\": \"From (number)\", \"type\": \"Data\", \"key\": \"from\", \"width\": \"9rem\"}, {\"label\": \"To (number)\", \"type\": \"Data\", \"key\": \"to\", \"width\": \"9rem\"}, {\"label\": \"Created On\", \"type\": \"Datetime\", \"key\": \"creation\", \"width\": \"8rem\"}]",
//         kanban_columns: "[]",
//         kanban_fields: "[]",
//         page_length: 20,
//         page_length_count: 20,
//         rows: "[\"name\", \"caller\", \"receiver\", \"type\", \"status\", \"duration\", \"from\", \"to\", \"note\", \"recording_url\", \"reference_doctype\", \"reference_docname\", \"creation\"]",
//         title_field: "",
//         view: {
//           custom_view_name: "20",
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
//       let callLogsData = result.message?.data || [];

//       // Map the response data to match our CallLog interface
//       const mappedCallLogs = callLogsData.map((item: any) => ({
//         name: item.name,
//         from: item.from,
//         to: item.to,
//         status: item.status,
//         type: item.type,
//         duration: item.duration,
//         reference_doctype: item.reference_doctype,
//         id: item.reference_docname,
//         creation: item.creation,
//         modified: item.modified
//       }));

//       // Filter by leadName if provided
//       let filteredCallLogs = mappedCallLogs;
//       if (leadName) {
//         filteredCallLogs = mappedCallLogs.filter((callLog: CallLog) =>
//           callLog.id === leadName
//         );
//       }

//       setCallLogs(filteredCallLogs);
//     } catch (error) {
//       // console.error('Error fetching call logs:', error);
//       // showToast('Failed to fetch call logs', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (callLog: CallLog) => {
//     setCallForm({
//       from: callLog.from || '',
//       to: callLog.to || '',
//       status: callLog.status || 'Ringing',
//       type: callLog.type || 'Outgoing',
//       duration: callLog.duration || '',
//       receiver: callLog.to || '',
//       name: callLog.name || '',
//     });
//     setIsEditMode(true);
//     setShowEditModal(true);
//   };

//   const editCall = async (): Promise<boolean> => {
//     try {
//       setCallsLoading(true);
//       const session = getUserSession();

//       if (!session) {
//         showToast('Session expired. Please login again.', { type: 'error' });
//         return false;
//       }

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callForm.name}`;

//       const response = await fetch(apiUrl, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `token ${session.api_key}:${session.api_secret}`
//         },
//         body: JSON.stringify({
//           from: callForm.from,
//           to: callForm.to,
//           status: callForm.status,
//           type: callForm.type,
//           duration: callForm.duration
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Call log updated successfully', { type: 'success' });
//       fetchCallLogs();
//       return true;
//     } catch (error) {
//       console.error('Error updating call log:', error);
//       showToast('Failed to update call log', { type: 'error' });
//       return false;
//     } finally {
//       setCallsLoading(false);
//     }
//   };

//   const handleDelete = async (callLogName: string) => {
//     if (!confirm('Are you sure you want to delete this call log?')) return;

//     try {
//       const session = getUserSession();

//       if (!session) {
//         showToast('Session expired. Please login again.', { type: 'error' });
//         return;
//       }

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callLogName}`;

//       const response = await fetch(apiUrl, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `token ${session.api_key}:${session.api_secret}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Call log deleted successfully', { type: 'success' });
//       fetchCallLogs();
//     } catch (error) {
//       console.error('Error deleting call log:', error);
//       showToast('Failed to delete call log', { type: 'error' });
//     }
//   };

//   const filteredCallLogs = callLogs.filter(callLog =>
//     Object.values(callLog).some(value =>
//       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const formatDuration = (seconds?: string) => {
//     if (!seconds) return "N/A";
//     const total = parseInt(seconds, 10);
//     if (isNaN(total)) return "N/A";

//     const mins = Math.floor(total / 60);
//     const secs = total % 60;

//     if (mins > 0) {
//       return `${mins}m ${secs}s`;
//     }
//     return `${secs}s`;
//   };

//   if (loading) {
//     return (
//       <div className={`min-h-screen ${theme === 'dark'
//         ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//         : 'bg-gray-50'
//         }`}>
//         <Header
//           title="Call Logs"
//           subtitle={leadName ? `For Lead: ${leadName}` : undefined}
//           onRefresh={fetchCallLogs}
//           onFilter={() => { }}
//           onSort={() => { }}
//           onColumns={() => { }}
//           onCreate={onCreateCallLog}
//           searchValue={searchTerm}
//           onSearchChange={setSearchTerm}
//           viewMode={viewMode}
//           onViewModeChange={setViewMode}
//         />
//         <div className="p-4 sm:p-6">
//           <div className="flex items-center justify-center">
//             <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading call logs...</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${theme === 'dark'
//       ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//       : 'bg-gray-50'
//       }`}>
//       <Header
//         title="Call Logs"
//         subtitle={leadName ? `For Lead: ${leadName}` : undefined}
//         onRefresh={fetchCallLogs}
//         onFilter={() => { }}
//         onSort={() => { }}
//         onColumns={() => { }}
//         onCreate={onCreateCallLog}
//         searchValue={searchTerm}
//         onSearchChange={setSearchTerm}
//         viewMode={viewMode}
//         onViewModeChange={setViewMode}
//       />

//       <div className="p-4 sm:p-6">
//         {/* Call Logs Table */}
//         <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
//           ? 'bg-custom-gradient border-transparent !rounded-none'
//           : 'bg-white border-gray-200'
//           }`}>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-transparent divide-x-2' : 'bg-gray-50 border-gray-200'
//                 }`}>
//                 <tr className="">
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Type
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     From
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     To
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Status
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Duration
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Date
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody
//                 className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}
//               >
//                 {filteredCallLogs.map((callLog) => (
//                   <tr
//                     key={callLog.name}
//                     className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
//                       }`}
//                     onClick={() => handleEdit(callLog)} // open modal when row clicked
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <Phone
//                           className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}
//                         />
//                         <span
//                           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColors[callLog.type]
//                             }`}
//                         >
//                           {callLog.type}
//                         </span>
//                       </div>
//                     </td>
//                     <td
//                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                         }`}
//                     >
//                       {callLog.from || 'N/A'}
//                     </td>
//                     <td
//                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                         }`}
//                     >
//                       {callLog.to || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-white font-semibold ${statusColors[callLog.status]
//                           }`}
//                       >
//                         {callLog.status}
//                       </span>
//                     </td>
//                     <td
//                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
//                         }`}
//                     >
//                       {callLog.duration ? (
//                         <div className="flex items-center space-x-1">
//                           <Clock className="w-4 h-4 text-white" />
//                           <span>{formatDuration(callLog.duration)}</span>
//                         </div>
//                       ) : (
//                         "N/A"
//                       )}
//                     </td>
//                     <td
//                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                         }`}
//                     >
//                       {callLog.creation
//                         ? new Date(callLog.creation).toLocaleString("en-GB", {
//                           day: "2-digit",
//                           month: "short",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                           hour12: true,
//                         })
//                         : "N/A"}
//                     </td>

//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex items-center space-x-2">
//                         {/* Delete button only */}
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation(); // prevent row click
//                             handleDelete(callLog.name);
//                           }}
//                           className={
//                             theme === 'dark'
//                               ? 'text-red-400 hover:text-red-300'
//                               : 'text-red-600 hover:text-red-900'
//                           }
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>

//             </table>
//           </div>
//         </div>

//         {filteredCallLogs.length === 0 && (
//           <div className="text-center py-12">
//             <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No call logs found</div>
//             <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
//               {leadName ? 'No call logs for this lead' : 'Create your first call log to get started'}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Edit Call Modal - Using the same style as the first document */}
//       {showEditModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className={`w-full max-w-2xl ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
//             <button
//               onClick={() => {
//                 setShowEditModal(false);
//                 setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
//                 setIsEditMode(false);
//               }}
//               className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
//             >
//               ✕
//             </button>

//             <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
//               Edit Call Log
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Type <span className='text-red-500'>*</span></label>
//                 <select
//                   value={callForm.type}
//                   onChange={(e) => setCallForm({ ...callForm, type: e.target.value })}
//                   className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
//                 >
//                   <option value="Outgoing">Outgoing</option>
//                   <option value="Incoming">Incoming</option>
//                   <option value="Missed">Missed</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>To <span className='text-red-500'>*</span></label>
//                 <input
//                   type="text"
//                   value={callForm.to}
//                   onChange={(e) => setCallForm({ ...callForm, to: e.target.value })}
//                   className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
//                   placeholder="To"
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>From <span className='text-red-500'>*</span></label>
//                 <input
//                   type="text"
//                   value={callForm.from}
//                   onChange={(e) => setCallForm({ ...callForm, from: e.target.value })}
//                   className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
//                   placeholder="From"
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Status</label>
//                 <select
//                   value={callForm.status}
//                   onChange={(e) => setCallForm({ ...callForm, status: e.target.value })}
//                   className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
//                 >
//                   {["Ringing", "Answered", "Busy", "No Answer", "Failed"].map(status => (
//                     <option key={status} value={status}>{status}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Duration (seconds)</label>
//                 <input
//                   type="number"
//                   value={callForm.duration}
//                   onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
//                   className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
//                   placeholder="Call duration"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={async () => {
//                   const success = await editCall();
//                   if (success) {
//                     setShowEditModal(false);
//                     setIsEditMode(false);
//                     setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
//                   }
//                 }}
//                 disabled={callsLoading}
//                 className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
//               >
//                 <span>Update</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Edit, Trash2, Phone, Clock, X, User, Calendar, Timer } from 'lucide-react';
// import { showToast } from '../utils/toast';
// import { Header } from './Header';
// import { useTheme } from './ThemeProvider';
// import { getUserSession } from '../utils/session';

// interface CallLog {
//   name: string;
//   from: string;
//   to: string;
//   status: 'Ringing' | 'Answered' | 'Busy' | 'No Answer' | 'Failed';
//   type: 'Incoming' | 'Outgoing' | 'Missed';
//   duration?: string;
//   reference_doctype?: string;
//   id?: string;
//   creation?: string;
//   modified?: string;
// }

// interface CallLogsPageProps {
//   onCreateCallLog: () => void;
//   leadName?: string;
// }

// interface CallForm {
//   from: string;
//   to: string;
//   status: string;
//   type: string;
//   duration: string;
//   receiver: string;
//   name: string;
// }

// const statusColors = {
//   'Ringing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//   'Answered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//   'Busy': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//   'No Answer': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white',
//   'Failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
// };

// const typeColors = {
//   'Incoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//   'Outgoing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//   'Missed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
// };

// // Call Details Popup Component
// interface CallDetailsPopupProps {
//   call: {
//     type: string;
//     caller: string;
//     receiver: string;
//     date: string;
//     duration: string;
//     status: string;
//     name: string;
//   };
//   onClose: () => void;
//   onAddTask: () => void;
//   onEdit: () => void;
//   theme: string;
// }

// const CallDetailsPopup: React.FC<CallDetailsPopupProps> = ({ call, onClose, onAddTask, onEdit, theme }) => {
//   const formatDuration = (seconds: string) => {
//     if (!seconds) return "N/A";
//     const total = parseInt(seconds, 10);
//     if (isNaN(total)) return "N/A";

//     const mins = Math.floor(total / 60);
//     const secs = total % 60;

//     if (mins > 0) {
//       return `${mins}m ${secs}s`;
//     }
//     return `${secs}s`;
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className={`w-full max-w-md mx-4 rounded-lg shadow-xl border ${
//         theme === 'dark' 
//           ? 'bg-dark-secondary border-gray-700' 
//           : 'bg-white border-gray-200'
//       }`}>
//         {/* Header */}
//         <div className={`flex items-center justify-between p-4 border-b ${
//           theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
//         }`}>
//           <h3 className={`text-lg font-semibold ${
//             theme === 'dark' ? 'text-white' : 'text-gray-900'
//           }`}>
//             Call Details
//           </h3>
//           <button
//             onClick={onClose}
//             className={`p-1 rounded-full hover:bg-gray-100 ${
//               theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
//             }`}
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-4 space-y-4">
//           {/* Call Type */}
//           <div className="flex items-center justify-between">
//             <span className={`text-sm font-medium ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//             }`}>
//               Type
//             </span>
//             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
//               call.type === 'Incoming' 
//                 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
//                 : call.type === 'Outgoing'
//                 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
//                 : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
//             }`}>
//               {call.type}
//             </span>
//           </div>

//           {/* Caller */}
//           <div className="flex items-center justify-between">
//             <span className={`text-sm font-medium ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//             }`}>
//               From
//             </span>
//             <div className="flex items-center space-x-2">
//               <User className={`w-4 h-4 ${
//                 theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//               }`} />
//               <span className={`text-sm font-medium ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-900'
//               }`}>
//                 {call.caller}
//               </span>
//             </div>
//           </div>

//           {/* Receiver */}
//           <div className="flex items-center justify-between">
//             <span className={`text-sm font-medium ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//             }`}>
//               To
//             </span>
//             <div className="flex items-center space-x-2">
//               <User className={`w-4 h-4 ${
//                 theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//               }`} />
//               <span className={`text-sm font-medium ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-900'
//               }`}>
//                 {call.receiver}
//               </span>
//             </div>
//           </div>

//           {/* Date */}
//           <div className="flex items-center justify-between">
//             <span className={`text-sm font-medium ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//             }`}>
//               Date & Time
//             </span>
//             <div className="flex items-center space-x-2">
//               <Calendar className={`w-4 h-4 ${
//                 theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//               }`} />
//               <span className={`text-sm font-medium ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-900'
//               }`}>
//                 {call.date}
//               </span>
//             </div>
//           </div>

//           {/* Duration */}
//           <div className="flex items-center justify-between">
//             <span className={`text-sm font-medium ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//             }`}>
//               Duration
//             </span>
//             <div className="flex items-center space-x-2">
//               <Timer className={`w-4 h-4 ${
//                 theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//               }`} />
//               <span className={`text-sm font-medium ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-900'
//               }`}>
//                 {formatDuration(call.duration)}
//               </span>
//             </div>
//           </div>

//           {/* Status */}
//           <div className="flex items-center justify-between">
//             <span className={`text-sm font-medium ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//             }`}>
//               Status
//             </span>
//             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
//               call.status === 'Answered' || call.status === 'Completed'
//                 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
//                 : call.status === 'Ringing'
//                 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
//                 : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
//             }`}>
//               {call.status}
//             </span>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className={`flex space-x-3 p-4 border-t ${
//           theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
//         }`}>
//           <button
//             onClick={onAddTask}
//             className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
//               theme === 'dark'
//                 ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
//                 : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//             }`}
//           >
//             Add Task
//           </button>
//           <button
//             onClick={onEdit}
//             className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
//               theme === 'dark'
//                 ? 'bg-purple-600 hover:bg-purple-700'
//                 : 'bg-blue-600 hover:bg-blue-700'
//             }`}
//           >
//             Edit Call
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export function CallLogsPage({ onCreateCallLog, leadName }: CallLogsPageProps) {
//   const { theme } = useTheme();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [callLogs, setCallLogs] = useState<CallLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

//   // New state for edit form functionality
//   const [callForm, setCallForm] = useState<CallForm>({
//     from: '',
//     to: '',
//     status: 'Ringing',
//     type: 'Outgoing',
//     duration: '',
//     receiver: '',
//     name: ''
//   });
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [callsLoading, setCallsLoading] = useState(false);

//   // New state for Call Details popup
//   const [showPopup, setShowPopup] = useState(false);
//   const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

//   // Theme-based styling classes
//   const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textSecondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
//   const cardBgColor = theme === 'dark' ? 'bg-dark-secondary' : 'bg-white';
//   const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
//   const inputBgColor = theme === 'dark' ? 'bg-dark-tertiary text-white' : 'bg-white';

//   useEffect(() => {
//     fetchCallLogs();
//   }, [leadName]);

//   const fetchCallLogs = async () => {
//     try {
//       setLoading(true);

//       const session = getUserSession();

//       if (!session) {
//         setCallLogs([]);
//         setLoading(false);
//         return;
//       }

//       const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';

//       const requestBody = {
//         doctype: "CRM Call Log",
//         filters: {},
//         order_by: "modified desc",
//         default_filters: {},
//         column_field: "status",
//         columns: "[{\"label\": \"Caller\", \"type\": \"Link\", \"key\": \"caller\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Receiver\", \"type\": \"Link\", \"key\": \"receiver\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Type\", \"type\": \"Select\", \"key\": \"type\", \"width\": \"9rem\"}, {\"label\": \"Status\", \"type\": \"Select\", \"key\": \"status\", \"width\": \"9rem\"}, {\"label\": \"Duration\", \"type\": \"Duration\", \"key\": \"duration\", \"width\": \"6rem\"}, {\"label\": \"From (number)\", \"type\": \"Data\", \"key\": \"from\", \"width\": \"9rem\"}, {\"label\": \"To (number)\", \"type\": \"Data\", \"key\": \"to\", \"width\": \"9rem\"}, {\"label\": \"Created On\", \"type\": \"Datetime\", \"key\": \"creation\", \"width\": \"8rem\"}]",
//         kanban_columns: "[]",
//         kanban_fields: "[]",
//         page_length: 20,
//         page_length_count: 20,
//         rows: "[\"name\", \"caller\", \"receiver\", \"type\", \"status\", \"duration\", \"from\", \"to\", \"note\", \"recording_url\", \"reference_doctype\", \"reference_docname\", \"creation\"]",
//         title_field: "",
//         view: {
//           custom_view_name: "20",
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
//       let callLogsData = result.message?.data || [];

//       // Map the response data to match our CallLog interface
//       const mappedCallLogs = callLogsData.map((item: any) => ({
//         name: item.name,
//         from: item.from,
//         to: item.to,
//         status: item.status,
//         type: item.type,
//         duration: item.duration,
//         reference_doctype: item.reference_doctype,
//         id: item.reference_docname,
//         creation: item.creation,
//         modified: item.modified
//       }));

//       // Filter by leadName if provided
//       let filteredCallLogs = mappedCallLogs;
//       if (leadName) {
//         filteredCallLogs = mappedCallLogs.filter((callLog: CallLog) =>
//           callLog.id === leadName
//         );
//       }

//       setCallLogs(filteredCallLogs);
//     } catch (error) {
//       // console.error('Error fetching call logs:', error);
//       // showToast('Failed to fetch call logs', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (callLog: CallLog) => {
//     setCallForm({
//       from: callLog.from || '',
//       to: callLog.to || '',
//       status: callLog.status || 'Ringing',
//       type: callLog.type || 'Outgoing',
//       duration: callLog.duration || '',
//       receiver: callLog.to || '',
//       name: callLog.name || '',
//     });
//     setIsEditMode(true);
//     setShowPopup(false); // Close popup when opening edit modal
//     setShowEditModal(true);
//   };

//   const handleRowClick = (callLog: CallLog) => {
//     setSelectedCall(callLog);
//     setShowPopup(true);
//   };

//   const formatDateRelative = (dateString: string) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const editCall = async (): Promise<boolean> => {
//     try {
//       setCallsLoading(true);
//       const session = getUserSession();

//       if (!session) {
//         showToast('Session expired. Please login again.', { type: 'error' });
//         return false;
//       }

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callForm.name}`;

//       const response = await fetch(apiUrl, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `token ${session.api_key}:${session.api_secret}`
//         },
//         body: JSON.stringify({
//           from: callForm.from,
//           to: callForm.to,
//           status: callForm.status,
//           type: callForm.type,
//           duration: callForm.duration
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Call log updated successfully', { type: 'success' });
//       fetchCallLogs();
//       return true;
//     } catch (error) {
//       console.error('Error updating call log:', error);
//       showToast('Failed to update call log', { type: 'error' });
//       return false;
//     } finally {
//       setCallsLoading(false);
//     }
//   };

//   const handleDelete = async (callLogName: string) => {
//     if (!confirm('Are you sure you want to delete this call log?')) return;

//     try {
//       const session = getUserSession();

//       if (!session) {
//         showToast('Session expired. Please login again.', { type: 'error' });
//         return;
//       }

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callLogName}`;

//       const response = await fetch(apiUrl, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `token ${session.api_key}:${session.api_secret}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Call log deleted successfully', { type: 'success' });
//       fetchCallLogs();
//     } catch (error) {
//       console.error('Error deleting call log:', error);
//       showToast('Failed to delete call log', { type: 'error' });
//     }
//   };

//   const filteredCallLogs = callLogs.filter(callLog =>
//     Object.values(callLog).some(value =>
//       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const formatDuration = (seconds?: string) => {
//     if (!seconds) return "N/A";
//     const total = parseInt(seconds, 10);
//     if (isNaN(total)) return "N/A";

//     const mins = Math.floor(total / 60);
//     const secs = total % 60;

//     if (mins > 0) {
//       return `${mins}m ${secs}s`;
//     }
//     return `${secs}s`;
//   };

//   if (loading) {
//     return (
//       <div className={`min-h-screen ${theme === 'dark'
//         ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//         : 'bg-gray-50'
//         }`}>
//         <Header
//           title="Call Logs"
//           subtitle={leadName ? `For Lead: ${leadName}` : undefined}
//           onRefresh={fetchCallLogs}
//           onFilter={() => { }}
//           onSort={() => { }}
//           onColumns={() => { }}
//           onCreate={onCreateCallLog}
//           searchValue={searchTerm}
//           onSearchChange={setSearchTerm}
//           viewMode={viewMode}
//           onViewModeChange={setViewMode}
//         />
//         <div className="p-4 sm:p-6">
//           <div className="flex items-center justify-center">
//             <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading call logs...</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${theme === 'dark'
//       ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//       : 'bg-gray-50'
//       }`}>
//       <Header
//         title="Call Logs"
//         subtitle={leadName ? `For Lead: ${leadName}` : undefined}
//         onRefresh={fetchCallLogs}
//         onFilter={() => { }}
//         onSort={() => { }}
//         onColumns={() => { }}
//         onCreate={onCreateCallLog}
//         searchValue={searchTerm}
//         onSearchChange={setSearchTerm}
//         viewMode={viewMode}
//         onViewModeChange={setViewMode}
//       />

//       <div className="p-4 sm:p-6">
//         {/* Call Logs Table */}
//         <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
//           ? 'bg-custom-gradient border-transparent !rounded-none'
//           : 'bg-white border-gray-200'
//           }`}>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-transparent divide-x-2' : 'bg-gray-50 border-gray-200'
//                 }`}>
//                 <tr className="">
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Type
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     From
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     To
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Status
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Duration
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Date
//                   </th>
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody
//                 className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}
//               >
//                 {filteredCallLogs.map((callLog) => (
//                   <tr
//                     key={callLog.name}
//                     className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
//                       }`}
//                     onClick={() => handleRowClick(callLog)} // open popup when row clicked
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <Phone
//                           className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}
//                         />
//                         <span
//                           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColors[callLog.type]
//                             }`}
//                         >
//                           {callLog.type}
//                         </span>
//                       </div>
//                     </td>
//                     <td
//                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                         }`}
//                     >
//                       {callLog.from || 'N/A'}
//                     </td>
//                     <td
//                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                         }`}
//                     >
//                       {callLog.to || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-white font-semibold ${statusColors[callLog.status]
//                           }`}
//                       >
//                         {callLog.status}
//                       </span>
//                     </td>
//                     <td
//                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
//                         }`}
//                     >
//                       {callLog.duration ? (
//                         <div className="flex items-center space-x-1">
//                           <Clock className="w-4 h-4 text-white" />
//                           <span>{formatDuration(callLog.duration)}</span>
//                         </div>
//                       ) : (
//                         "N/A"
//                       )}
//                     </td>
//                     <td
//                       className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                         }`}
//                     >
//                       {callLog.creation
//                         ? new Date(callLog.creation).toLocaleString("en-GB", {
//                           day: "2-digit",
//                           month: "short",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                           hour12: true,
//                         })
//                         : "N/A"}
//                     </td>

//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex items-center space-x-2">
//                         {/* Delete button only */}
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation(); // prevent row click
//                             handleDelete(callLog.name);
//                           }}
//                           className={
//                             theme === 'dark'
//                               ? 'text-red-400 hover:text-red-300'
//                               : 'text-red-600 hover:text-red-900'
//                           }
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>

//             </table>
//           </div>
//         </div>

//         {filteredCallLogs.length === 0 && (
//           <div className="text-center py-12">
//             <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No call logs found</div>
//             <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
//               {leadName ? 'No call logs for this lead' : 'Create your first call log to get started'}
//             </div>
//           </div>
//         )}
//   //       </div>

//   import React, { useState, useEffect } from 'react';
// import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Edit, Trash2, Phone, Clock, X, User, Calendar, Timer } from 'lucide-react';
// import { SlCallIn, SlCallOut } from 'react-icons/sl';
// import { IoIosCalendar } from 'react-icons/io';
// import { showToast } from '../utils/toast';
// import { Header } from './Header';
// import { useTheme } from './ThemeProvider';
// import { getUserSession } from '../utils/session';

// interface CallLog {
//   name: string;
//   from: string;
//   to: string;
//   status: 'Ringing' | 'Answered' | 'Busy' | 'No Answer' | 'Failed';
//   type: 'Incoming' | 'Outgoing' | 'Missed';
//   duration?: string;
//   reference_doctype?: string;
//   id?: string;
//   creation?: string;
//   modified?: string;
//   _caller?: { label: string };
//   _receiver?: { label: string };
// }

// interface CallLogsPageProps {
//   onCreateCallLog: () => void;
//   leadName?: string;
// }

// interface CallForm {
//   from: string;
//   to: string;
//   status: string;
//   type: string;
//   duration: string;
//   receiver: string;
//   name: string;
// }

// const statusColors = {
//   'Ringing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//   'Answered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//   'Busy': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//   'No Answer': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white',
//   'Failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
// };

// const typeColors = {
//   'Incoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//   'Outgoing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//   'Missed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
// };

// // Call Details Popup Component with consistent design
// interface CallDetailsPopupProps {
//   call: {
//     type: string;
//     caller: string;
//     receiver: string;
//     date: string;
//     duration: string;
//     status: string;
//     name: string;
//   };
//   onClose: () => void;
//   onAddTask: () => void;
//   onEdit: () => void;
//   theme: string;
// }

// const CallDetailsPopup: React.FC<CallDetailsPopupProps> = ({ call, onClose, onAddTask, onEdit, theme }) => {
//   const formatDuration = (seconds: string) => {
//     if (!seconds) return "N/A";
//     const total = parseInt(seconds, 10);
//     if (isNaN(total)) return "N/A";

//     const mins = Math.floor(total / 60);
//     const secs = total % 60;

//     if (mins > 0) {
//       return `${mins}m ${secs}s`;
//     }
//     return `${secs}s`;
//   };

//   // Theme-based styling classes (matching the calls tab design)
//   const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textSecondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
//   const cardBgColor = theme === 'dark' ? 'bg-dark-secondary' : 'bg-white';
//   const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

//   const getRelativeTime = (dateString: string) => {
//     if (!dateString) return "N/A";
//     const now = new Date();
//     const date = new Date(dateString);
//     const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

//     if (diffInMinutes < 1) return "Just now";
//     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//     if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
//     return `${Math.floor(diffInMinutes / 1440)}d ago`;
//   };

//   const formatDateRelative = (dateString: string) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className={`w-full max-w-md mx-4 rounded-lg shadow-xl border ${cardBgColor} ${borderColor}`}>
//         {/* Header - matching the calls tab header style */}
//         <div className={`flex justify-between items-center gap-5 mb-6 p-6 border-b ${borderColor}`}>
//           <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Call Details</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Call log display - matching the calls tab list item style */}
//         <div className="px-6">
//           <div className="mb-3">
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center">
//                 {/* Icon container - matching the calls tab icon style */}
//                 <div
//                   className={`p-2 rounded-full mr-3 flex items-center justify-center
//                     ${call.type === 'Incoming' || call.type === 'Inbound'
//                       ? 'bg-blue-100 text-blue-600'
//                       : 'bg-green-100 text-green-600'
//                     }`}
//                   style={{ width: '32px', height: '32px' }}
//                 >
//                   {call.type === 'Incoming' || call.type === 'Inbound' ? (
//                     <SlCallIn className="w-4 h-4" />
//                   ) : (
//                     <SlCallOut className="w-4 h-4" />
//                   )}
//                 </div>

//                 {/* Caller avatar - matching the calls tab avatar style */}
//                 <div
//                   className="p-2 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 font-medium"
//                   style={{ width: '32px', height: '32px' }}
//                 >
//                   {call.caller?.charAt(0).toUpperCase() || "U"}
//                 </div>

//                 {/* Text - matching the calls tab text style */}
//                 <span className={`ml-2 text-sm ${textColor}`}>
//                   {call.caller || "Unknown"} has reached out
//                 </span>
//               </div>

//               {/* Time - matching the calls tab time position */}
//               <p className={`text-xs ${textSecondaryColor}`}>
//                 {getRelativeTime(call.date)}
//               </p>
//             </div>

//             {/* Call details card - matching the calls tab card style */}
//             <div
//               className={`relative border ${borderColor} rounded-lg ml-12 p-4 flex flex-col`}
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <p className={`text-lg font-medium ${textColor}`}>
//                   {call.type}
//                 </p>
//               </div>

//               {/* All details in one line - matching the calls tab layout */}
//               <div className="flex items-start justify-start mt-2 gap-4">
//                 <p className={`text-sm ${textSecondaryColor} flex items-center`}>
//                   <IoIosCalendar className="mr-1" />
//                   {formatDateRelative(call.date)}
//                 </p>

//                 <p className={`text-sm ${textSecondaryColor}`}>
//                   {formatDuration(call.duration)}
//                 </p>

//                 <span
//                   className={`text-xs px-2 py-1 rounded ${
//                     call.status === 'Completed' || call.status === 'Answered'
//                       ? 'bg-green-100 text-green-800'
//                       : call.status === 'Ringing'
//                         ? 'bg-yellow-100 text-yellow-800'
//                         : 'bg-gray-100 text-gray-800'
//                   }`}
//                 >
//                   {call.status}
//                 </span>
//               </div>

//               {/* Avatars floated to the right - matching the calls tab avatar positioning */}
//               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex -space-x-4">
//                 {/* Caller */}
//                 <div
//                   className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium"
//                   style={{ width: '32px', height: '32px' }}
//                 >
//                   {call.caller?.charAt(0).toUpperCase() || ""}
//                 </div>

//                 {/* Receiver */}
//                 <div
//                   className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium"
//                   style={{ width: '32px', height: '32px' }}
//                 >
//                   {call.receiver?.charAt(0).toUpperCase() || ""}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Actions - matching the calls tab button styles */}
//         <div className={`flex space-x-3 p-6 border-t ${borderColor} mt-6`}>
//           <button
//             onClick={onAddTask}
//             className="text-white cursor-pointer bg-gray-400 rounded-md text-center px-6 py-2"
//           >
//             Add Task
//           </button>
//           <button
//             onClick={onEdit}
//             className={`text-white px-4 py-2 rounded-lg flex items-center space-x-2 ${
//               theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'
//             }`}
//           >
//             <Edit className="w-4 h-4" />
//             <span>Edit Call</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export function CallLogsPage({ onCreateCallLog, leadName }: CallLogsPageProps) {
//   const { theme } = useTheme();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [callLogs, setCallLogs] = useState<CallLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

//   // New state for edit form functionality
//   const [callForm, setCallForm] = useState<CallForm>({
//     from: '',
//     to: '',
//     status: 'Ringing',
//     type: 'Outgoing',
//     duration: '',
//     receiver: '',
//     name: ''
//   });
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [callsLoading, setCallsLoading] = useState(false);

//   // New state for Call Details popup
//   const [showPopup, setShowPopup] = useState(false);
//   const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

//   // Theme-based styling classes
//   const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textSecondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
//   const cardBgColor = theme === 'dark' ? 'bg-dark-secondary' : 'bg-white';
//   const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
//   const inputBgColor = theme === 'dark' ? 'bg-dark-tertiary text-white' : 'bg-white';

//   useEffect(() => {
//     fetchCallLogs();
//   }, [leadName]);

//   const fetchCallLogs = async () => {
//     try {
//       setLoading(true);

//       const session = getUserSession();

//       if (!session) {
//         setCallLogs([]);
//         setLoading(false);
//         return;
//       }

//       const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';

//       const requestBody = {
//         doctype: "CRM Call Log",
//         filters: {},
//         order_by: "modified desc",
//         default_filters: {},
//         column_field: "status",
//         columns: "[{\"label\": \"Caller\", \"type\": \"Link\", \"key\": \"caller\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Receiver\", \"type\": \"Link\", \"key\": \"receiver\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Type\", \"type\": \"Select\", \"key\": \"type\", \"width\": \"9rem\"}, {\"label\": \"Status\", \"type\": \"Select\", \"key\": \"status\", \"width\": \"9rem\"}, {\"label\": \"Duration\", \"type\": \"Duration\", \"key\": \"duration\", \"width\": \"6rem\"}, {\"label\": \"From (number)\", \"type\": \"Data\", \"key\": \"from\", \"width\": \"9rem\"}, {\"label\": \"To (number)\", \"type\": \"Data\", \"key\": \"to\", \"width\": \"9rem\"}, {\"label\": \"Created On\", \"type\": \"Datetime\", \"key\": \"creation\", \"width\": \"8rem\"}]",
//         kanban_columns: "[]",
//         kanban_fields: "[]",
//         page_length: 20,
//         page_length_count: 20,
//         rows: "[\"name\", \"caller\", \"receiver\", \"type\", \"status\", \"duration\", \"from\", \"to\", \"note\", \"recording_url\", \"reference_doctype\", \"reference_docname\", \"creation\"]",
//         title_field: "",
//         view: {
//           custom_view_name: "20",
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
//       let callLogsData = result.message?.data || [];

//       // Map the response data to match our CallLog interface
//       const mappedCallLogs = callLogsData.map((item: any) => ({
//         name: item.name,
//         from: item.from,
//         to: item.to,
//         status: item.status,
//         type: item.type,
//         duration: item.duration,
//         reference_doctype: item.reference_doctype,
//         id: item.reference_docname,
//         creation: item.creation,
//         modified: item.modified,
//         _caller: { label: item.caller || item.from || 'Unknown' },
//         _receiver: { label: item.receiver || item.to || 'Unknown' }
//       }));

//       // Filter by leadName if provided
//       let filteredCallLogs = mappedCallLogs;
//       if (leadName) {
//         filteredCallLogs = mappedCallLogs.filter((callLog: CallLog) =>
//           callLog.id === leadName
//         );
//       }

//       setCallLogs(filteredCallLogs);
//     } catch (error) {
//       // console.error('Error fetching call logs:', error);
//       // showToast('Failed to fetch call logs', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (callLog: CallLog) => {
//     setCallForm({
//       from: callLog.from || '',
//       to: callLog.to || '',
//       status: callLog.status || 'Ringing',
//       type: callLog.type || 'Outgoing',
//       duration: callLog.duration || '',
//       receiver: callLog.to || '',
//       name: callLog.name || '',
//     });
//     setIsEditMode(true);
//     setShowPopup(false); // Close popup when opening edit modal
//     setShowEditModal(true);
//   };

//   const handleRowClick = (callLog: CallLog) => {
//     setSelectedCall(callLog);
//     setShowPopup(true);
//   };

//   const formatDateRelative = (dateString: string) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const editCall = async (): Promise<boolean> => {
//     try {
//       setCallsLoading(true);
//       const session = getUserSession();

//       if (!session) {
//         showToast('Session expired. Please login again.', { type: 'error' });
//         return false;
//       }

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callForm.name}`;

//       const response = await fetch(apiUrl, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `token ${session.api_key}:${session.api_secret}`
//         },
//         body: JSON.stringify({
//           from: callForm.from,
//           to: callForm.to,
//           status: callForm.status,
//           type: callForm.type,
//           duration: callForm.duration
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Call log updated successfully', { type: 'success' });
//       fetchCallLogs();
//       return true;
//     } catch (error) {
//       console.error('Error updating call log:', error);
//       showToast('Failed to update call log', { type: 'error' });
//       return false;
//     } finally {
//       setCallsLoading(false);
//     }
//   };

//   const handleDelete = async (callLogName: string) => {
//     if (!confirm('Are you sure you want to delete this call log?')) return;

//     try {
//       const session = getUserSession();

//       if (!session) {
//         showToast('Session expired. Please login again.', { type: 'error' });
//         return;
//       }

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callLogName}`;

//       const response = await fetch(apiUrl, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `token ${session.api_key}:${session.api_secret}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Call log deleted successfully', { type: 'success' });
//       fetchCallLogs();
//     } catch (error) {
//       console.error('Error deleting call log:', error);
//       showToast('Failed to delete call log', { type: 'error' });
//     }
//   };

//   const filteredCallLogs = callLogs.filter(callLog =>
//     Object.values(callLog).some(value =>
//       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const formatDuration = (seconds?: string) => {
//     if (!seconds) return "N/A";
//     const total = parseInt(seconds, 10);
//     if (isNaN(total)) return "N/A";

//     const mins = Math.floor(total / 60);
//     const secs = total % 60;

//     if (mins > 0) {
//       return `${mins}m ${secs}s`;
//     }
//     return `${secs}s`;
//   };

//   if (loading) {
//     return (
//       <div className={`min-h-screen ${theme === 'dark'
//         ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//         : 'bg-gray-50'
//         }`}>
//         <Header
//           title="Call Logs"
//           subtitle={leadName ? `For Lead: ${leadName}` : undefined}
//           onRefresh={fetchCallLogs}
//           onFilter={() => { }}
//           onSort={() => { }}
//           onColumns={() => { }}
//           onCreate={onCreateCallLog}
//           searchValue={searchTerm}
//           onSearchChange={setSearchTerm}
//           viewMode={viewMode}
//           onViewModeChange={setViewMode}
//         />
//         <div className="p-4 sm:p-6">
//           <div className="flex items-center justify-center">
//             <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading call logs...</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${theme === 'dark'
//       ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//       : 'bg-gray-50'
//       }`}>
//       <Header
//         title="Call Logs"
//         subtitle={leadName ? `For Lead: ${leadName}` : undefined}
//         onRefresh={fetchCallLogs}
//         onFilter={() => { }}
//         onSort={() => { }}
//         onColumns={() => { }}
//         onCreate={onCreateCallLog}
//         searchValue={searchTerm}
//         onSearchChange={setSearchTerm}
//         viewMode={viewMode}
//         onViewModeChange={setViewMode}
//       />

//       <div className="p-4 sm:p-6">
//         {/* Call Logs Table */}
//         <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
//           ? 'bg-custom-gradient border-transparent !rounded-none'
//           : 'bg-white border-gray-200'
//           }`}>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-transparent divide-x-2' : 'bg-gray-50 border-gray-200'
//                 }`}>
//                 <tr className="">
//                   <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                     }`}>
//                     Type


import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Edit, Trash2, Phone, Clock, X, User, Calendar, Timer } from 'lucide-react';
import { SlCallIn, SlCallOut } from 'react-icons/sl';
import { IoIosCalendar } from 'react-icons/io';
import { showToast } from '../utils/toast';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';

interface CallLog {
  name: string;
  from: string;
  to: string;
  status: 'Ringing' | 'Answered' | 'Busy' | 'No Answer' | 'Failed' | 'Queued' | 'Completed' | 'Initiated' | 'In Progress' | 'Canceled';
  type: 'Incoming' | 'Outgoing' | 'Missed' | 'Inbound';
  duration?: string;
  reference_doctype?: string;
  id?: string;
  creation?: string;
  modified?: string;
  _caller?: { label: string };
  _receiver?: { label: string };
  note?: string;
}

interface CallLogsPageProps {
  onCreateCallLog: () => void;
  leadName?: string;
}

interface CallForm {
  from: string;
  to: string;
  status: string;
  type: string;
  duration: string;
  receiver: string;
  name: string;
}

const statusColors = {
  'Ringing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Answered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Busy': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'No Answer': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white',
  'Failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Queued': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Initiated': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'In Progress': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Canceled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white'
};

const typeColors = {
  'Incoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Inbound': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Outgoing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Missed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

// Call Details Popup Component - Enhanced to match your design
interface CallDetailsPopupProps {
  call: {
    type: string;
    caller: string;
    receiver: string;
    date: string;
    duration: string;
    status: string;
    name: string;
    note?: string;
  };
  onClose: () => void;
  onAddTask: () => void;
  onEdit: () => void;
  theme: string;
}

const CallDetailsPopup: React.FC<CallDetailsPopupProps> = ({ call, onClose, onAddTask, onEdit, theme }) => {
  const formatDuration = (seconds: string) => {
    if (!seconds) return "100";
    const total = parseInt(seconds, 10);
    if (isNaN(total)) return "100";
    return total.toString();
  };

  // Theme-based styling classes
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  const formatDateRelative = (dateString: string) => {
    if (!dateString) return "Monday, Aug 25";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return "Just now";
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-md mx-4 rounded-lg shadow-xl ${cardBgColor}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h3 className={`text-xl font-semibold ${textColor}`}>Call Details</h3>
          <div className="flex items-center space-x-2">
            <button className={`p-1 ${textSecondaryColor} hover:${textColor}`}>
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={onEdit}
              className={`p-1 ${textSecondaryColor} hover:${textColor}`}
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`p-1 ${textSecondaryColor} hover:${textColor}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Call Type with Icon */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-green-500 rounded-full">
              <SlCallOut className="w-4 h-4 text-white" />
            </div>
            <span className={`text-lg font-medium ${textColor}`}>{call.type} Call</span>
          </div>
        </div>

        {/* Participants */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-3">
            {/* From */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {call.caller?.charAt(0)?.toUpperCase() || 'T'}
              </div>
              <span className={`ml-2 text-sm ${textColor}`}>{call.caller}</span>
            </div>

            {/* Arrow */}
            <div className={`text-${textSecondaryColor}`}>→</div>

            {/* To */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {call.receiver?.charAt(0)?.toUpperCase() || 'H'}
              </div>
              <span className={`ml-2 text-sm ${textColor}`}>{call.receiver}</span>
            </div>
          </div>
        </div>

        {/* Lead Info */}
        <div className="px-6 pb-4">
          <div className={`text-sm ${textSecondaryColor} flex items-center`}>
            <span>Lead ↗</span>
          </div>
        </div>

        <hr className={`mx-6 ${borderColor}`} />

        {/* Call Details */}
        <div className="p-6 space-y-4">
          {/* Date */}
          <div className="flex items-center space-x-3">
            <Clock className={`w-5 h-5 ${textSecondaryColor}`} />
            <span className={`${textColor}`}>{formatDateRelative(call.date)}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-3">
            <Timer className={`w-5 h-5 ${textSecondaryColor}`} />
            <span className={`${textColor}`}>{formatDuration(call.duration)}</span>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center`}>
              <div className={`w-3 h-3 rounded-full ${call.status === 'Completed' || call.status === 'Answered' ? 'bg-green-500' :
                  call.status === 'Queued' || call.status === 'Ringing' ? 'bg-yellow-500' :
                    'bg-gray-500'
                }`}></div>
            </div>
            <span className={`${textColor}`}>{call.status}</span>
          </div>
        </div>

        <hr className={`mx-6 ${borderColor}`} />

        {/* Notes Section */}
        <div className="p-6">
          <h4 className={`text-sm font-medium ${textColor} mb-3`}>Notes</h4>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium ${textColor} mb-1`}>Call with John Doe</div>
            <div className={`text-sm ${textSecondaryColor} mb-2`}>
              Took a call with John Doe and discussed the new project
            </div>
            <div className={`text-xs ${textSecondaryColor}`}>
              8/25/2025 11:30 AM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Call Modal Component - Complete implementation
interface EditCallModalProps {
  isOpen: boolean;
  callForm: CallForm;
  setCallForm: (form: CallForm) => void;
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
  theme: string;
}

const EditCallModal: React.FC<EditCallModalProps> = ({
  isOpen,
  callForm,
  setCallForm,
  onClose,
  onSave,
  isLoading,
  theme
}) => {
  if (!isOpen) return null;

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const inputBgColor = theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-md mx-4 rounded-lg shadow-xl ${cardBgColor}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h3 className={`text-xl font-semibold ${textColor}`}>Edit Call Log</h3>
          <button
            onClick={onClose}
            className={`p-1 ${textSecondaryColor} hover:${textColor}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          {/* Type */}
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={callForm.type}
              onChange={(e) => setCallForm({ ...callForm, type: e.target.value })}
              className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBgColor}`}
            >
              <option value="Outgoing">Outgoing</option>
              <option value="Incoming">Incoming</option>
              <option value="Missed">Missed</option>
            </select>
          </div>

          {/* To */}
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>
              To <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={callForm.to}
              onChange={(e) => setCallForm({ ...callForm, to: e.target.value })}
              className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBgColor}`}
              placeholder="To"
            />
          </div>

          {/* From */}
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>
              From <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={callForm.from}
              onChange={(e) => setCallForm({ ...callForm, from: e.target.value })}
              className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBgColor}`}
              placeholder="From"
            />
          </div>

          {/* Status */}
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>Status</label>
            <select
              value={callForm.status}
              onChange={(e) => setCallForm({ ...callForm, status: e.target.value })}
              className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBgColor}`}
            >
              {["Initiated", "Ringing", "In Progress", "Completed", "Failed", "Busy", "No Answer", "Queued", "Canceled"].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>Duration</label>
            <input
              type="number"
              value={callForm.duration}
              onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
              className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBgColor}`}
              placeholder="Call duration"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end p-6 pt-0">
          <button
            onClick={onSave}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export function CallLogsPage({ onCreateCallLog, leadName }: CallLogsPageProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Form state
  const [callForm, setCallForm] = useState<CallForm>({
    from: '',
    to: '',
    status: 'Ringing',
    type: 'Outgoing',
    duration: '',
    receiver: '',
    name: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [callsLoading, setCallsLoading] = useState(false);
  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  // Theme-based styling classes
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = theme === 'dark' ? 'bg-dark-secondary' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const inputBgColor = theme === 'dark' ? 'bg-dark-tertiary text-white' : 'bg-white';
  const userSession = getUserSession();
  const Company = userSession?.company;

  useEffect(() => {
    fetchCallLogs();
  }, [leadName]);

  const fetchCallLogs = async () => {
    try {
      setLoading(true);

      const session = getUserSession();

      if (!session) {
        setCallLogs([]);
        setLoading(false);
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';

      const requestBody = {
        doctype: "CRM Call Log",
        filters: {
          company: Company
        },
        order_by: "modified desc",
        default_filters: {},
        column_field: "status",
        columns: "[{\"label\": \"Caller\", \"type\": \"Link\", \"key\": \"caller\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Receiver\", \"type\": \"Link\", \"key\": \"receiver\", \"options\": \"User\", \"width\": \"9rem\"}, {\"label\": \"Type\", \"type\": \"Select\", \"key\": \"type\", \"width\": \"9rem\"}, {\"label\": \"Status\", \"type\": \"Select\", \"key\": \"status\", \"width\": \"9rem\"}, {\"label\": \"Duration\", \"type\": \"Duration\", \"key\": \"duration\", \"width\": \"6rem\"}, {\"label\": \"From (number)\", \"type\": \"Data\", \"key\": \"from\", \"width\": \"9rem\"}, {\"label\": \"To (number)\", \"type\": \"Data\", \"key\": \"to\", \"width\": \"9rem\"}, {\"label\": \"Created On\", \"type\": \"Datetime\", \"key\": \"creation\", \"width\": \"8rem\"}]",
        kanban_columns: "[]",
        kanban_fields: "[]",
        page_length: 20,
        page_length_count: 20,
        rows: "[\"name\", \"caller\", \"receiver\", \"type\", \"status\", \"duration\", \"from\", \"to\", \"note\", \"recording_url\", \"reference_doctype\", \"reference_docname\", \"creation\"]",
        title_field: "",
        view: {
          custom_view_name: "20",
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
      let callLogsData = result.message?.data || [];

      const mappedCallLogs = callLogsData.map((item: any) => ({
        name: item.name,
        from: item.from,
        to: item.to,
        status: item.status,
        type: item.type,
        duration: item.duration,
        reference_doctype: item.reference_doctype,
        id: item.reference_docname,
        creation: item.creation,
        modified: item.modified,
        note: item.note,
        _caller: { label: item.caller || item.from || 'Unknown' },
        _receiver: { label: item.receiver || item.to || 'Unknown' }
      }));

      let filteredCallLogs = mappedCallLogs;
      if (leadName) {
        filteredCallLogs = mappedCallLogs.filter((callLog: CallLog) =>
          callLog.id === leadName
        );
      }

      setCallLogs(filteredCallLogs);
    } catch (error) {
      console.error('Error fetching call logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (callLog: CallLog) => {
    setCallForm({
      from: callLog.from || '',
      to: callLog.to || '',
      status: callLog.status || 'Ringing',
      type: callLog.type || 'Outgoing',
      duration: callLog.duration || '',
      receiver: callLog.to || '',
      name: callLog.name || '',
    });
    setIsEditMode(true);
    setShowPopup(false);
    setShowEditModal(true);
  };

  const handleRowClick = (callLog: CallLog) => {
    setSelectedCall(callLog);
    setShowPopup(true);
  };

  const formatDateRelative = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const editCall = async (): Promise<boolean> => {
    try {
      setCallsLoading(true);
      const session = getUserSession();

      if (!session) {
        showToast('Session expired. Please login again.', { type: 'error' });
        return false;
      }

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callForm.name}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          from: callForm.from,
          to: callForm.to,
          status: callForm.status,
          type: callForm.type,
          duration: callForm.duration
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Call log updated successfully', { type: 'success' });
      fetchCallLogs();
      return true;
    } catch (error) {
      console.error('Error updating call log:', error);
      showToast('Failed to update call log', { type: 'error' });
      return false;
    } finally {
      setCallsLoading(false);
    }
  };

  const handleDelete = async (callLogName: string) => {
    if (!confirm('Are you sure you want to delete this call log?')) return;

    try {
      const session = getUserSession();

      if (!session) {
        showToast('Session expired. Please login again.', { type: 'error' });
        return;
      }

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callLogName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Call log deleted successfully', { type: 'success' });
      fetchCallLogs();
    } catch (error) {
      console.error('Error deleting call log:', error);
      showToast('Failed to delete call log', { type: 'error' });
    }
  };

  const handleAddTaskFromCall = () => {
    console.log('Add task from call:', selectedCall);
    setShowPopup(false);
  };

  const resetCallForm = () => {
    setCallForm({
      from: '',
      to: '',
      status: 'Ringing',
      type: 'Outgoing',
      duration: '',
      receiver: '',
      name: ''
    });
    setIsEditMode(false);
  };

  const filteredCallLogs = callLogs.filter(callLog =>
    Object.values(callLog).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDuration = (seconds?: string) => {
    if (!seconds) return "N/A";
    const total = parseInt(seconds, 10);
    if (isNaN(total)) return "N/A";

    const mins = Math.floor(total / 60);
    const secs = total % 60;

    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark'
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
        : 'bg-gray-50'
        }`}>
        <Header
          title="Call Logs"
          subtitle={leadName ? `For Lead: ${leadName}` : undefined}
          onRefresh={fetchCallLogs}
          onFilter={() => { }}
          onSort={() => { }}
          onColumns={() => { }}
          onCreate={onCreateCallLog}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading call logs...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark'
      ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
      : 'bg-gray-50'
      }`}>
      <Header
        title="Call Logs"
        subtitle={leadName ? `For Lead: ${leadName}` : undefined}
        onRefresh={fetchCallLogs}
        onFilter={() => { }}
        onSort={() => { }}
        onColumns={() => { }}
        onCreate={onCreateCallLog}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="p-4 sm:p-6">
        {/* Call Logs Table */}
        <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
          ? 'bg-custom-gradient border-transparent !rounded-none'
          : 'bg-white border-gray-200'
          }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-transparent divide-x-2' : 'bg-gray-50 border-gray-200'
                }`}>
                <tr className="">
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Type
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    From
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    To
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Duration
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}
              >
                {filteredCallLogs.map((callLog) => (
                  <tr
                    key={callLog.name}
                    className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                      }`}
                    onClick={() => handleRowClick(callLog)} // open popup when row clicked
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone
                          className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}
                        />
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColors[callLog.type]
                            }`}
                        >
                          {callLog.type}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                      {callLog.from || 'N/A'}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                      {callLog.to || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-white font-semibold ${statusColors[callLog.status]
                          }`}
                      >
                        {callLog.status}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                    >
                      {callLog.duration ? (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-white" />
                          <span>{formatDuration(callLog.duration)}</span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                      {callLog.creation
                        ? new Date(callLog.creation).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Delete button only */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent row click
                            handleDelete(callLog.name);
                          }}
                          className={
                            theme === 'dark'
                              ? 'text-red-400 hover:text-red-300'
                              : 'text-red-600 hover:text-red-900'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

        {filteredCallLogs.length === 0 && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No call logs found</div>
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
              {leadName ? 'No call logs for this lead' : 'Create your first call log to get started'}
            </div>
          </div>
        )}
      </div>

      {/* Call Details Popup */}
      {showPopup && selectedCall && (
        <CallDetailsPopup
          call={{
            type: selectedCall.type,
            caller: selectedCall.from || "Unknown",
            receiver: selectedCall.to || "Unknown",
            date: formatDateRelative(selectedCall.creation || ''),
            duration: selectedCall.duration || '0',
            status: selectedCall.status,
            name: selectedCall.name
          }}
          onClose={() => setShowPopup(false)}
          onAddTask={() => {
            // Handle add task functionality if needed
            console.log('Add task from call:', selectedCall);
            setShowPopup(false);
          }}
          onEdit={() => handleEdit(selectedCall)}
          theme={theme}
        />
      )}

      {/* Edit Call Modal - Using the same style as the first document */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-2xl ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
            <button
              onClick={() => {
                setShowEditModal(false);
                setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
                setIsEditMode(false);
              }}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
            >
              ✕
            </button>

            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
              Edit Call Log
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Type <span className='text-red-500'>*</span></label>
                <select
                  value={callForm.type}
                  onChange={(e) => setCallForm({ ...callForm, type: e.target.value })}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                >
                  <option value="Outgoing">Outgoing</option>
                  <option value="Incoming">Incoming</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>To <span className='text-red-500'>*</span></label>
                <input
                  type="text"
                  value={callForm.to}
                  onChange={(e) => setCallForm({ ...callForm, to: e.target.value })}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                  placeholder="To"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>From <span className='text-red-500'>*</span></label>
                <input
                  type="text"
                  value={callForm.from}
                  onChange={(e) => setCallForm({ ...callForm, from: e.target.value })}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                  placeholder="From"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Status</label>
                <select
                  value={callForm.status}
                  onChange={(e) => setCallForm({ ...callForm, status: e.target.value })}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                >
                  {["Ringing", "Answered", "Busy", "No Answer", "Failed"].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Duration (seconds)</label>
                <input
                  type="number"
                  value={callForm.duration}
                  onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                  placeholder="Call duration"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={async () => {
                  const success = await editCall();
                  if (success) {
                    setShowEditModal(false);
                    setIsEditMode(false);
                    setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
                  }
                }}
                disabled={callsLoading}
                className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
              >
                <span>Update</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}