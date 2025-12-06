import React, { useState, useEffect } from 'react';
import { Menu, MoreHorizontal, Edit, Trash2, Phone, Clock, X, Timer, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, Settings, RefreshCcw, Download } from 'lucide-react';
import { SlCallIn, SlCallOut } from 'react-icons/sl';
import { BsCheckCircle, BsThreeDots } from 'react-icons/bs';
import { showToast } from '../utils/toast';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { LuSquareUserRound, LuTimer } from 'react-icons/lu';
import { FaRegClock } from 'react-icons/fa6';
import { GoArrowUpRight } from 'react-icons/go';
import { FaUserFriends } from 'react-icons/fa';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { Lead, LeadDetailView } from './LeadDetailView';
import { Deal, DealDetailView } from './DealDetailView';
import { CallDetailsPopup } from './CallLogPopups/CallDetailsPopup';
import { AUTH_TOKEN } from '../api/apiUrl';
import { api } from '../api/apiService';

interface Note {
  name: string;
  title: string;
  content: string;
  reference_doctype: string;
  reference_docname: string;
  creation: string;
  owner: string;
}

interface Task {
  due_date: any;
  assigned_to: string;
  name: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  exp_start_date: string;
  exp_end_date: string;
  reference_type: string;
  reference_docname: string;
  creation: string;
  owner: string;
}

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
  caller?: string;
  receiver?: string;
  _caller?: { label: string };
  _receiver?: { label: string };
  _notes?: Note[];
  _tasks?: Task[];
}

interface CallLogsPageProps {
  onCreateCallLog: () => void;
  leadName?: string;
  refreshTrigger?: number;
  onMenuToggle: () => void;
  searchTerm: string;
  onNavigateToDeal?: (dealName: string) => void;
  onNavigateToLead?: (leadName: string) => void;
}

interface CallForm {
  from: string;
  to: string;
  status: string;
  type: string;
  caller: string;
  duration: string;
  receiver: string;
  name: string;
}

interface User {
  value: string;
  label: string;
}

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

const statusColors = {
  'Ringing': '!text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Answered': '!text-green-500 dark:bg-green-900/30 dark:text-green-300',
  'Completed': '!text-green-500 dark:bg-green-900/30 dark:text-green-300',
  'Busy': '!text-red-500 dark:bg-red-900/30 dark:text-red-300',
  'No Answer': '!text-gray-500 dark:bg-gray-900/30 dark:text-white',
  'Failed': '!text-red-500 dark:bg-red-900/30 dark:text-red-300',
  'Queued': '!text-blue-500 dark:bg-blue-900/30 dark:text-blue-300',
  'Initiated': '!text-purple-500 dark:bg-purple-900/30 dark:text-purple-300',
  'In Progress': '!text-orange-500 dark:bg-orange-900/30 dark:text-orange-300',
  'Canceled': '!bg-white !text-black dark:bg-white dark:!text-black',
};

const typeColors = {
  'Incoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Inbound': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Outgoing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Missed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

const defaultColumns: ColumnConfig[] = [
  { key: 'type', label: 'Type', visible: true, sortable: true },
  { key: 'from', label: 'From', visible: true, sortable: true },
  { key: 'to', label: 'To', visible: true, sortable: true },
  { key: 'status', label: 'Status', visible: true, sortable: true },
  { key: 'duration', label: 'Duration', visible: true, sortable: true },
  { key: 'date', label: 'Date', visible: true, sortable: true },
];

// Edit Call Modal Component
interface EditCallModalProps {
  isOpen: boolean;
  callForm: CallForm;
  setCallForm: (form: CallForm) => void;
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
  theme: string;
  users: User[];
  loadingUsers: boolean;
}

const EditCallModal: React.FC<EditCallModalProps> = ({
  isOpen,
  callForm,
  setCallForm,
  onClose,
  onSave,
  isLoading,
  theme,
  users,
  loadingUsers
}) => {
  if (!isOpen) return null;

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const inputBgColor = theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';

  const handleTypeChange = (type: string) => {
    setCallForm({
      ...callForm,
      type,
      // Reset the fields when type changes
      caller: type === 'Incoming' ? '' : callForm.caller,
      receiver: type === 'Outgoing' ? '' : callForm.receiver
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-[600px] mx-4 rounded-lg shadow-xl ${cardBgColor}`}>
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
        <div className="px-6 pb-6  grid grid-cols-2 gap-4 ">
          {/* Type */}
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={callForm.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBgColor}`}
            >
              <option value="Incoming">Incoming</option>
              <option value="Outgoing">Outgoing</option>
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
               className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                      }`}
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
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                      }`}
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
               className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                      }`}
              placeholder="Call duration"
            />
          </div>

          {/* Caller (Only show for Outgoing) */}
          {callForm.type === 'Outgoing' && (
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>Caller</label>
              <select
                value={callForm.caller}
                onChange={(e) => setCallForm({ ...callForm, caller: e.target.value })}
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBgColor}`}
                disabled={loadingUsers}
              >
                <option value="">Select Caller</option>
                {users.map((user) => (
                  <option key={user.value} value={user.value}>
                    {user.label}
                  </option>
                ))}
              </select>
              {loadingUsers && (
                <div className={`text-xs mt-1 ${textSecondaryColor}`}>Loading users...</div>
              )}
            </div>
          )}

          {/* Receiver (Only show for Incoming) */}
          {callForm.type === 'Incoming' && (
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>Call Received By</label>
              <select
                value={callForm.receiver}
                onChange={(e) => setCallForm({ ...callForm, receiver: e.target.value })}
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBgColor}`}
                disabled={loadingUsers}
              >
                <option value="">Select Receiver</option>
                {users.map((user) => (
                  <option key={user.value} value={user.value}>
                    {user.label}
                  </option>
                ))}
              </select>
              {loadingUsers && (
                <div className={`text-xs mt-1 ${textSecondaryColor}`}>Loading users...</div>
              )}
            </div>
          )}
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

// Delete Modal Component
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  theme: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, count, theme }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
          <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
            <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Delete
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
              Are you sure you want to delete {count > 1 ? `the selected ${count} call logs` : 'this call log'}?
            </p>
          </div>

          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
            <button
              onClick={onConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${theme === 'dark'
                ? 'border-purple-500/30 bg-dark-accent text-white hover:bg-purple-800/50'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Function to fetch users from API
const fetchUsers = async (): Promise<User[]> => {
  try {
    const session = getUserSession();
    const sessionCompany = session?.company;

    if (!session) {
      showToast('Session expired. Please login again.', { type: 'error' });
      return [];
    }

    const apiUrl = 'https://api.erpnext.ai/api/method/frappe.desk.search.search_link';

    const requestBody = {
      txt: "",
      doctype: "User",
      filters: sessionCompany ? { company: sessionCompany } : null
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_TOKEN
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Transform the API response to match the expected format
    const users = result.message?.map((user: any) => ({
      value: user.value,
      label: user.description || user.value
    })) || [];

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    showToast('Failed to fetch users', { type: 'error' });
    return [];
  }
};

export function CallLogsPage({ 
  onCreateCallLog, 
  leadName, 
  refreshTrigger = 0, 
  onMenuToggle, 
  searchTerm,
  onNavigateToDeal,
  onNavigateToLead 
}: CallLogsPageProps) {
  const { theme } = useTheme();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Selection state
  const [selectedCallLogs, setSelectedCallLogs] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form state
  const [callForm, setCallForm] = useState<CallForm>({
    from: '',
    to: '',
    status: 'Ringing',
    type: 'Outgoing',
    duration: '',
    receiver: '',
    name: '',
    caller: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [callsLoading, setCallsLoading] = useState(false);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Column management
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Mobile dropdown state
  const [expandedCallLogs, setExpandedCallLogs] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Navigation loading state
  const [navigationLoading, setNavigationLoading] = useState(false);

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
    loadUsers();
  }, [leadName, refreshTrigger]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const userList = await fetchUsers();
    setUsers(userList);
    setLoadingUsers(false);
  };

  const fetchCallLogs = async () => {
    try {
      setLoading(true);

      const session = getUserSession();

      if (!session) {
        setCallLogs([]);
        setLoading(false);
        return;
      }

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

      const result = await api.post('/api/method/crm.api.doc.get_data', requestBody);
      let callLogsData = result.message?.data || [];

      // If no call logs found, set empty array and return
      if (callLogsData.length === 0) {
        setCallLogs([]);
        return;
      }

      // Step 2: Fetch detailed information for each call log using the second API
      const detailedCallLogsPromises = callLogsData.map(async (item: any) => {
        try {
          const detailApiUrl = 'https://api.erpnext.ai/api/method/crm.fcrm.doctype.crm_call_log.crm_call_log.get_call_log';

          const detailResponse = await fetch(detailApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify({
              name: item.name // Use the name from the first API call
            })
          });

          if (!detailResponse.ok) {
            console.warn(`Failed to fetch details for call log ${item.name}`);
            return null;
          }

          const detailResult = await detailResponse.json();
          const detailedCallLog = detailResult.message;

          // Return the detailed call log data, fallback to original data if detailed fetch fails
          return detailedCallLog || item;
        } catch (error) {
          console.error(`Error fetching details for call log ${item.name}:`, error);
          return item; // Return original data as fallback
        }
      });

      // Wait for all detailed API calls to complete
      const detailedCallLogsResults = await Promise.all(detailedCallLogsPromises);

      // Filter out any null results and transform the data
      const mappedCallLogs = detailedCallLogsResults
        .filter(result => result !== null)
        .map((detailedItem: any) => {
          // Use detailed data if available, otherwise use original data
          const item = detailedItem || {};

          return {
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
            caller: item.caller, // Add caller field
            receiver: item.receiver, // Add receiver field
            _caller: item._caller || { label: item.caller || item.from || 'Unknown' },
            _receiver: item._receiver || { label: item.receiver || item.to || 'Unknown' },
            // Include additional fields from detailed API if needed
            recording_url: item.recording_url,
            activity_type: item.activity_type,
            owner: item.owner,
            show_recording: item.show_recording,
            _duration: item._duration,
            _notes: item._notes || [],
            _tasks: item._tasks || [],
          };
        });

      let filteredCallLogs = mappedCallLogs;
      if (leadName) {
        filteredCallLogs = mappedCallLogs.filter((callLog: CallLog) =>
          callLog.id === leadName
        );
      }

      setCallLogs(filteredCallLogs);
    } catch (error) {
      console.error('Error fetching call logs:', error);
      showToast('Failed to fetch call logs', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (callLog: CallLog) => {
    console.log('Editing call log:', callLog);
    console.log('Caller value:', callLog.caller);
    console.log('Receiver value:', callLog.receiver);
    console.log('_caller:', callLog._caller);
    console.log('_receiver:', callLog._receiver);

    setCallForm({
      from: callLog.from || '',
      to: callLog.to || '',
      status: callLog.status || 'Ringing',
      type: callLog.type || 'Outgoing',
      duration: callLog.duration || '',
      caller: callLog.caller || callLog._caller?.label || '', // Use caller or _caller.label
      receiver: callLog.receiver || callLog._receiver?.label || '', // Use receiver or _receiver.label
      name: callLog.name || '',
    });
    setIsEditMode(true);
    setShowPopup(false);
    setShowEditModal(true);
  };

  const handleRowClick = (callLog: CallLog) => {
    console.log("Row clicked with call log:", callLog);
    console.log("Call log reference_doctype:", callLog.reference_doctype);
    console.log("Call log _notes:", callLog._notes);
    console.log("Call log _tasks:", callLog._tasks);
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

      const apiUrl = `https://api.erpnext.ai/api/method/frappe.client.set_value`;

      // Prepare the payload based on call type
      const payload: any = {
        doctype: "CRM Call Log",
        name: callForm.name,
        fieldname: {
          from: callForm.from,
          to: callForm.to,
          status: callForm.status,
          type: callForm.type,
        }
      };

      if (callForm.duration) {
        payload.fieldname.duration = callForm.duration;
      }

      // Add caller/receiver based on call type
      if (callForm.type === 'Outgoing') {
        payload.fieldname.caller = callForm.caller;
      } else if (callForm.type === 'Incoming') {
        payload.fieldname.receiver = callForm.receiver;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(payload)
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
    try {
      const session = getUserSession();

      if (!session) {
        showToast('Session expired. Please login again.', { type: 'error' });
        return;
      }

      const apiUrl = `https://api.erpnext.ai/api/v2/document/CRM Call Log/${callLogName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': AUTH_TOKEN
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

  const handleBulkDelete = async () => {
    try {
      setShowDeleteModal(false);
      setShowMenu(false);

      for (const callLogName of selectedCallLogs) {
        await handleDelete(callLogName);
      }

      setSelectedCallLogs([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
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
      name: '',
      caller: ''
    });
    setIsEditMode(false);
  };

  const toggleCallLogSelection = (callLogName: string) => {
    setSelectedCallLogs(prev =>
      prev.includes(callLogName)
        ? prev.filter(id => id !== callLogName)
        : [...prev, callLogName]
    );
  };

  const handleSelectAll = () => {
    if (selectedCallLogs.length === filteredCallLogs.length) {
      setSelectedCallLogs([]);
    } else {
      setSelectedCallLogs(filteredCallLogs.map(callLog => callLog.name));
    }
  };

  // Filter call logs based on search term
  const filteredCallLogs = callLogs.filter(callLog =>
    Object.values(callLog).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination calculations
  const filteredDataLength = filteredCallLogs.length;
  const totalPages = Math.ceil(filteredDataLength / itemsPerPage);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCallLogs.slice(indexOfFirstItem, indexOfLastItem);

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

  // Function to handle opening reference records
  const handleOpenReference = async (callLog: CallLog) => {
    if (!callLog.reference_doctype || !callLog.id) {
      showToast('This call log is not linked to any record', { type: 'error' });
      return;
    }

    console.log('Opening reference:', callLog.reference_doctype, callLog.id);
    
    // Show loading state
    setNavigationLoading(true);
    setShowPopup(false); // Close the popup

    try {
      if (callLog.reference_doctype === 'CRM Deal' && onNavigateToDeal) {
        onNavigateToDeal(callLog.id);
      } else if (callLog.reference_doctype === 'CRM Lead' && onNavigateToLead) {
        onNavigateToLead(callLog.id);
      } else {
        showToast(`Unsupported record type: ${callLog.reference_doctype}`, { type: 'error' });
      }
    } catch (error) {
      console.error('Error navigating to reference:', error);
      showToast('Failed to navigate to record', { type: 'error' });
    } finally {
      setNavigationLoading(false);
    }
  };

  // Sorting function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Toggle column visibility
  const toggleColumn = (columnKey: string) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  // Mobile dropdown functions
  const toggleCallLogDetails = (callLogName: string) => {
    setExpandedCallLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(callLogName)) {
        newSet.delete(callLogName);
      } else {
        newSet.add(callLogName);
      }
      return newSet;
    });
  };

  const isCallLogExpanded = (callLogName: string) => {
    return expandedCallLogs.has(callLogName);
  };

  const getVisibleColumns = () => columns.filter(col => col.visible);

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
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
      <div className={`min-h-screen ${theme === 'dark'
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
        : 'bg-gray-50'
        }`}>
        
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading call logs...</div>
          </div>
        </div>
      </div>
    );
  }

  const visibleColumns = getVisibleColumns();

  return (
    <div className={`min-h-screen ${theme === 'dark'
      ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
      : 'bg-gray-50'
      }`}>
      <div className="p-4 sm:p-6">
        {/* Action Bar */}
        <div className="flex flex-col mb-3 sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchCallLogs}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${theme === 'dark'
                ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <RefreshCcw className="w-4 h-4" />
            </button>

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
                      className={`p-1 rounded ${theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
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

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Page Info and Per Page Selector */}
            <div className="flex items-center space-x-2">
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
        </div>

        {/* Call Logs Table */}
        <div
          className={`rounded-lg max-sm:bg-none shadow-sm border overflow-hidden ${theme === 'dark'
            ? 'bg-custom-gradient border-transparent !rounded-none'
            : 'bg-white border-gray-200'
            }`}
        >
          <div className="w-full">
            {/* ================= Desktop Table View ================= */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`border-b ${theme === 'dark'
                    ? 'bg-purplebg border-transparent'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <tr className="divide-x-[1px]">
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          currentItems.length > 0 &&
                          currentItems.every(item => selectedCallLogs.includes(item.name))
                        }
                        onChange={() => {
                          const allCurrentPageSelected = currentItems.every(item => 
                            selectedCallLogs.includes(item.name)
                          );
                          
                          if (allCurrentPageSelected) {
                            // Deselect all on current page
                            setSelectedCallLogs(prev => 
                              prev.filter(id => !currentItems.some(item => item.name === id))
                            );
                          } else {
                            // Select all on current page
                            const newSelected = [...selectedCallLogs];
                            currentItems.forEach(item => {
                              if (!newSelected.includes(item.name)) {
                                newSelected.push(item.name);
                              }
                            });
                            setSelectedCallLogs(newSelected);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    {visibleColumns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                          }`}
                      >
                        {column.sortable ? (
                          <SortButton field={column.key}>{column.label}</SortButton>
                        ) : (
                          column.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody
                  className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'
                    }`}
                >
                  {currentItems.map((callLog) => (
                    <tr
                      key={callLog.name}
                      className={`transition-colors cursor-pointer ${theme === 'dark'
                        ? 'hover:bg-purple-800/20'
                        : 'hover:bg-gray-50'
                        }`}
                      onClick={() => handleRowClick(callLog)}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCallLogs.includes(callLog.name)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCallLogSelection(callLog.name);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* === Render all columns === */}
                      {visibleColumns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.key === 'type' ? (
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
                          ) : column.key === 'from' ? (
                            <span
                              className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}
                            >
                              {callLog.from || 'N/A'}
                            </span>
                          ) : column.key === 'to' ? (
                            <span
                              className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}
                            >
                              {callLog.to || 'N/A'}
                            </span>
                          ) : column.key === 'status' ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-white font-semibold ${statusColors[callLog.status]
                                }`}
                            >
                              {callLog.status}
                            </span>
                          ) : column.key === 'duration' ? (
                            callLog.duration ? (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-black dark:text-white" />
                                <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                  {formatDuration(callLog.duration)}
                                </span>
                              </div>
                            ) : (
                              <div className="w-4 h-4 text-black dark:text-white" >
                                N/A
                              </div>
                            )
                          ) : column.key === 'date' ? (
                            <span
                              className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
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
                            </span>
                          ) : (
                            <span
                              className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                                }`}
                            >
                              {callLog[column.key as keyof CallLog] || 'N/A'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ================= Mobile Card View ================= */}
            <div className="block md:hidden space-y-4">
              {currentItems.map((callLog) => (
                <div
                  key={callLog.name}
                  className={`p-4 rounded-lg border ${theme === 'dark'
                    ? 'bg-purplebg border-transparent'
                    : 'bg-white border-gray-200'
                    } shadow-sm`}
                >
                  <div className="flex justify-between items-center">
                    <input
                        type="checkbox"
                        checked={selectedCallLogs.includes(callLog.name)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleCallLogSelection(callLog.name);
                        }}
                        className="rounded mr-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                    <div
                      className="flex items-center flex-1 cursor-pointer"
                      onClick={() => handleRowClick(callLog)}
                    >
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
                    </div>

                    <div className="flex items-center gap-2">
                      

                      {/* Dropdown arrow */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCallLogDetails(callLog.name);
                        }}
                        className={`p-1 rounded transition-transform ${theme === 'dark' ? 'hover:bg-purple-700' : 'hover:bg-gray-100'
                          }`}
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform ${isCallLogExpanded(callLog.name) ? 'rotate-180' : ''
                            } ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Collapsible details section */}
                  {isCallLogExpanded(callLog.name) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {/* Render all other columns as label:value */}
                      {visibleColumns.map((column) =>
                        column.key !== 'type' ? (
                          <div
                            key={column.key}
                            className="flex justify-between text-sm py-1"
                          >
                            <span
                              className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                                }`}
                            >
                              {column.label}:
                            </span>
                            <span
                              className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}
                            >
                              {column.key === 'status' ? (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-white font-semibold ${statusColors[callLog.status]
                                    }`}
                                >
                                  {callLog.status}
                                </span>
                              ) : column.key === 'duration' ? (
                                callLog.duration ? (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3 text-black dark:text-white" />
                                    <span>{formatDuration(callLog.duration)}</span>
                                  </div>
                                ) : (
                                  'N/A'
                                )
                              ) : column.key === 'date' ? (
                                callLog.creation
                                  ? new Date(callLog.creation).toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                  : "N/A"
                              ) : (
                                callLog[column.key as keyof CallLog] || 'N/A'
                              )}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ================= No Results ================= */}
          {currentItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>
                No call logs found
              </div>
              <div
                className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}
              >
                {leadName ? 'No call logs for this lead' : 'Create your first call log to get started'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Popup - Appears at bottom when call logs are selected */}
      {selectedCallLogs.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2
         bg-white dark:bg-gray-800 shadow-2xl rounded-lg
         border dark:border-gray-700 p-2
         flex items-center justify-between
         w-[90%] max-w-md
         z-50 transition-all duration-300 ease-out">
          <span className="text-sm ml-4 text-gray-800 dark:text-white font-medium">
            {selectedCallLogs.length} {selectedCallLogs.length === 1 ? "Row" : "Rows"} selected
          </span>

          <div className="flex items-center space-x-4">
            {/* More actions */}
            <div className="relative">
              <button
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
                onClick={() => setShowMenu(prev => !prev)}
              >
                <BsThreeDots className="w-5 h-5" />
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 bottom-10 bg-white dark:bg-gray-700 dark:text-white shadow-lg rounded-md border dark:border-gray-600 py-1 w-40 z-50">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowMenu(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Select all */}
            <button
              onClick={() => {
                // Select all filtered items, not just current page
                if (selectedCallLogs.length === filteredCallLogs.length) {
                  setSelectedCallLogs([]);
                } else {
                  setSelectedCallLogs(filteredCallLogs.map(callLog => callLog.name));
                }
              }}
              className="text-sm font-medium text-gray-800 dark:text-white hover:underline"
            >
              {selectedCallLogs.length === filteredCallLogs.length ? 'Deselect all' : 'Select all'}
            </button>

            {/* Close */}
            <button
              onClick={() => setSelectedCallLogs([])}
              className="text-gray-400 hover:text-gray-800 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

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
            name: selectedCall.name,
            _notes: selectedCall._notes || [],
            _tasks: selectedCall._tasks || [],
            reference_doctype: selectedCall.reference_doctype,
            id: selectedCall.id
          }}
          onClose={() => setShowPopup(false)}
          onAddTask={() => {
            console.log('Add task from call:', selectedCall);
            setShowPopup(false);
          }}
          onEdit={() => handleEdit(selectedCall)}
          theme={theme}
          callLog={selectedCall}
          onOpenReference={() => handleOpenReference(selectedCall)}
          fetchCallLogs={fetchCallLogs}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleBulkDelete}
        count={selectedCallLogs.length}
        theme={theme}
      />

      {/* Edit Call Modal */}
      <EditCallModal
        isOpen={showEditModal}
        callForm={callForm}
        setCallForm={setCallForm}
        onClose={() => {
          setShowEditModal(false);
          setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '', caller: '' });
          setIsEditMode(false);
        }}
        onSave={async () => {
          const success = await editCall();
          if (success) {
            setShowEditModal(false);
            setIsEditMode(false);
            setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '', caller: '' });
          }
        }}
        isLoading={callsLoading}
        theme={theme}
        users={users}
        loadingUsers={loadingUsers}
      />

      {/* Navigation loading overlay */}
      {navigationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-dark-secondary text-white' : 'bg-white text-gray-800'}`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span>Loading record details...</span>
          </div>
        </div>
      )}
    </div>
  );
}