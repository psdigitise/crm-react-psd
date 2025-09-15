import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Edit, Trash2, Phone, Clock, X, Timer } from 'lucide-react';
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
  caller: string;
  duration: string;
  receiver: string;
  name: string;
}

interface User {
  value: string;
  label: string;
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

// Call Details Popup Component
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
    reference_doctype?: string;
  };
  onClose: () => void;
  onAddTask: () => void;
  onEdit: () => void;
  theme: string;
  callLog: CallLog; // Add this line
  onOpenReference: (callLog: CallLog) => void; // Add this too
}

const CallDetailsPopup: React.FC<CallDetailsPopupProps> = ({ call, onClose, onAddTask, onEdit, theme, callLog, onOpenReference }) => {


  const formatDuration = (seconds: string) => {
    if (!seconds) return "N/A";
    const total = parseInt(seconds, 10);
    if (isNaN(total)) return "N/A";
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDateRelative = (dateString: string) => {
    if (!dateString) return "Monday, Aug 25";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-md mx-4 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Call Details</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className={`p-1 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`p-1 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Call Type */}
            <div className="flex items-center gap-2">
              {call.type === 'Incoming' ? (
                <SlCallIn className="text-blue-500" />
              ) : (
                <SlCallOut className="text-green-500" />
              )}
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {call.type === 'Incoming' ? 'Incoming Call' : 'Outgoing Call'}
              </span>
            </div>

            {/* Participants */}
            <div className="flex items-center gap-2">
              <LuSquareUserRound className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'} text-sm`}>
                {call.caller?.charAt(0).toUpperCase() || "?"}
              </div>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{call.caller || "Unknown"}</span>
              <HiOutlineArrowRight className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'} text-sm`}>
                {call.receiver?.charAt(0).toUpperCase() || "?"}
              </div>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{call.receiver || "Unknown"}</span>
            </div>

            {/* Lead Info */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenReference(callLog);
              }}
              className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <FaUserFriends className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
              {call.reference_doctype || "Lead"}
              <GoArrowUpRight />
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <FaRegClock className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDateRelative(call.date)}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
              <LuTimer className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDuration(call.duration)}</span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <BsCheckCircle className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{call.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


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
              // onChange={(e) => setCallForm({ ...callForm, type: e.target.value })}
              onChange={(e) => handleTypeChange(e.target.value)}
              className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBgColor}`}
            >
              <option className="text-white" value="Incoming">Incoming</option>
              <option className="text-white" value="Outgoing">Outgoing</option>
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
                <option value="">Caller</option>
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
                <option value="">Call Received By</option>
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
    if (!session) {
      showToast('Session expired. Please login again.', { type: 'error' });
      return [];
    }

    const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

    const requestBody = {
      txt: "",
      doctype: "User",
      filters: {
        name: ["in", ["admin@psd.com", "Administrator", "haripanchanthan2892005@gmail.com"]]
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
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

export function CallLogsPage({ onCreateCallLog, leadName }: CallLogsPageProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Selection state
  const [selectedCallLogs, setSelectedCallLogs] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Add state for deal and lead navigation
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dealLoading, setDealLoading] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

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
  }, [leadName]);

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
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
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
      caller: callLog.caller || '',
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

  // const editCall = async (): Promise<boolean> => {
  //   try {
  //     setCallsLoading(true);
  //     const session = getUserSession();

  //     if (!session) {
  //       showToast('Session expired. Please login again.', { type: 'error' });
  //       return false;
  //     }

  //     const apiUrl = `http://103.214.132.20:8002/api/method/frappe.client.set_value`;

  //     // Create the payload in the required format
  //     const payload = {
  //       doctype: "CRM Call Log",
  //       name: callForm.name, // Make sure you have the document ID in your form
  //       fieldname: {
  //         from: callForm.from,
  //         to: callForm.to,
  //         status: callForm.status,
  //         type: callForm.type,
  //         duration: callForm.duration
  //         // caller: callForm.caller
  //       }
  //     };


  //     // Add caller/receiver based on call type
  //     if (callForm.type === 'Outgoing') {
  //       payload.fieldname.caller = callForm.caller;
  //     } else if (callForm.type === 'Incoming') {
  //       payload.fieldname.receiver = callForm.receiver;
  //     }

  //     const response = await fetch(apiUrl, {
  //       method: 'POST', // Frappe APIs typically use POST
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
  //       },
  //       body: JSON.stringify(payload)
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //     }

  //     showToast('Call log updated successfully', { type: 'success' });
  //     fetchCallLogs();
  //     return true;
  //   } catch (error) {
  //     console.error('Error updating call log:', error);
  //     showToast('Failed to update call log', { type: 'error' });
  //     return false;
  //   } finally {
  //     setCallsLoading(false);
  //   }
  // };


  const editCall = async (): Promise<boolean> => {
    try {
      setCallsLoading(true);
      const session = getUserSession();

      if (!session) {
        showToast('Session expired. Please login again.', { type: 'error' });
        return false;
      }

      const apiUrl = `http://103.214.132.20:8002/api/method/frappe.client.set_value`;

      // Prepare the payload based on call type
      const payload: any = {
        doctype: "CRM Call Log",
        name: callForm.name,
        fieldname: {
          from: callForm.from,
          to: callForm.to,
          status: callForm.status,
          type: callForm.type,
          duration: callForm.duration
        }
      };

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
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
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

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callLogName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
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


  // Function to fetch deal details
  const fetchDealDetails = async (dealName: string): Promise<Deal | null> => {
    try {
      setDealLoading(true);
      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return null;
      }

      const response = await fetch(`http://103.214.132.20:8002/api/method/frappe.client.get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
        },
        body: JSON.stringify({
          doctype: "CRM Deal",
          name: dealName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const dealData = data.message;

      if (!dealData) {
        throw new Error('Deal data not found');
      }

      const transformedDeal: Deal = {
        name: dealData.name,
        id: dealData.name,
        organization: dealData.organization || '',
        currency: dealData.currency || '',
        annual_revenue: dealData.annual_revenue || 0,
        status: dealData.status || '',
        email: dealData.email || '',
        mobile_no: dealData.mobile_no || '',
        mobileNo: dealData.mobile_no || '',
        deal_owner: dealData.deal_owner || '',
        assignedTo: dealData.deal_owner || '',
        modified: dealData.modified || '',
        lastModified: dealData.modified || '',
        annualRevenue: dealData.annual_revenue?.toString() || '0',
        organization_name: dealData.organization_name,
        website: dealData.website,
        no_of_employees: dealData.no_of_employees,
        territory: dealData.territory,
        industry: dealData.industry,
        salutation: dealData.salutation,
        first_name: dealData.first_name,
        last_name: dealData.last_name,
        gender: dealData.gender,
        close_date: dealData.close_date,
        probability: dealData.probability,
        next_step: dealData.next_step
      };

      return transformedDeal;
    } catch (error) {
      console.error('Error fetching deal details:', error);
      showToast('Failed to fetch deal details', { type: 'error' });
      return null;
    } finally {
      setDealLoading(false);
    }
  };

  // Function to fetch lead details
  const fetchLeadDetails = async (leadName: string): Promise<Lead | null> => {
    try {
      setLeadLoading(true);
      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return null;
      }

      const response = await fetch(`http://103.214.132.20:8002/api/method/frappe.client.get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
        },
        body: JSON.stringify({
          doctype: "CRM Lead",
          name: leadName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const leadData = data.message;

      if (!leadData) {
        throw new Error('Lead data not found');
      }

      const transformedLead: Lead = {
        id: leadData.name || '',
        name: leadData.name || '',
        leadId: leadData.name || '',
        firstName: leadData.first_name || '',
        lastName: leadData.last_name || '',
        organization: leadData.organization || '',
        status: leadData.status || '',
        email: leadData.email || '',
        mobile: leadData.mobile_no || '',
        mobile_no: leadData.mobile_no || '',
        assignedTo: leadData.lead_owner || '',
        lead_owner: leadData.lead_owner || '',
        lastModified: leadData.modified || '',
        modified: leadData.modified || '',
        creation: leadData.creation || '',
        website: leadData.website || '',
        territory: leadData.territory || '',
        industry: leadData.industry || '',
        jobTitle: leadData.job_title || '',
        source: leadData.source || '',
        salutation: leadData.salutation || '',
        owner: leadData.owner || '',
        modified_by: leadData.modified_by || '',
        docstatus: leadData.docstatus || 0,
        idx: leadData.idx || 0,
        naming_series: leadData.naming_series || '',
        lead_name: leadData.lead_name || `${leadData.first_name || ''} ${leadData.last_name || ''}`.trim(),
        gender: leadData.gender || '',
        no_of_employees: leadData.no_of_employees || '',
        annual_revenue: leadData.annual_revenue || 0,
        image: leadData.image || '',
        first_name: leadData.first_name || '',
        last_name: leadData.last_name || '',
        converted: leadData.converted || ''
      };

      return transformedLead;
    } catch (error) {
      console.error('Error fetching lead details:', error);
      showToast('Failed to fetch lead details', { type: 'error' });
      return null;
    } finally {
      setLeadLoading(false);
    }
  };

  const handleOpenReference = async (callLog: CallLog) => {
    if (!callLog.reference_doctype || !callLog.id) {
      showToast('This call log is not linked to any record', { type: 'error' });
      return;
    }

    if (callLog.reference_doctype === 'CRM Deal') {
      const dealDetails = await fetchDealDetails(callLog.id);
      if (dealDetails) {
        setSelectedDeal(dealDetails);
      }
    } else if (callLog.reference_doctype === 'CRM Lead') {
      const leadDetails = await fetchLeadDetails(callLog.id);
      if (leadDetails) {
        setSelectedLead(leadDetails);
      }
    } else {
      showToast(`Unsupported record type: ${callLog.reference_doctype}`, { type: 'error' });
    }
  };
  // If a deal is selected, show DealDetailView
  if (selectedDeal) {
    return (
      <DealDetailView
        deal={selectedDeal}
        onBack={() => setSelectedDeal(null)}
        onSave={(updatedDeal) => {
          setSelectedDeal(updatedDeal);
          showToast('Deal updated successfully', { type: 'success' });
          fetchCallLogs(); // Refresh call logs after save
        }}
      />
    );
  }

  // If a lead is selected, show LeadDetailView
  if (selectedLead) {
    return (
      <LeadDetailView
        lead={selectedLead}
        onBack={() => setSelectedLead(null)}
        onSave={(updatedLead) => {
          setSelectedLead(updatedLead);
          showToast('Lead updated successfully', { type: 'success' });
          fetchCallLogs(); // Refresh call logs after save
        }}
      />
    );
  }

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
                    <input
                      type="checkbox"
                      checked={selectedCallLogs.length === filteredCallLogs.length && filteredCallLogs.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
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
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCallLogs.includes(callLog.name)}
                        onChange={() => toggleCallLogSelection(callLog.name)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
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
                <div className="absolute bottom-8 right-0 bg-gray-800 text-white rounded-md shadow-lg w-40">
                  {/* <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                    onClick={() => {
                      // Add your edit functionality here
                      setShowMenu(false);
                    }}
                  >
                    Edit
                  </button> */}
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
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
              onClick={handleSelectAll}
              className="text-sm font-medium text-gray-800 dark:text-white hover:underline"
            >
              Select all
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
            reference_doctype: selectedCall.reference_doctype
          }}
          onClose={() => setShowPopup(false)}
          onAddTask={() => {
            // Handle add task functionality if needed
            console.log('Add task from call:', selectedCall);
            setShowPopup(false);
          }}
          onEdit={() => handleEdit(selectedCall)}
          theme={theme}
          callLog={selectedCall} // Add this
          onOpenReference={handleOpenReference} // Add this
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
    </div>
  );
}