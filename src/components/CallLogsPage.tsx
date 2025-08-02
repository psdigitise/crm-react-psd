import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Edit, Trash2, Phone } from 'lucide-react';
import { showToast } from '../utils/toast';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';


import { getUserSession } from '../utils/session';


interface CallLog {
  name: string;
  from: string;
  to: string;
  status: 'Ringing' | 'Answered' | 'Busy' | 'No Answer' | 'Failed';
  type: 'Incoming' | 'Outgoing' | 'Missed';
  duration?: string;
  reference_doctype?: string;
  id?: string;
  creation?: string;
  modified?: string;
}

interface CallLogsPageProps {
  onCreateCallLog: () => void;
  leadName?: string;
}

const statusColors = {
  'Ringing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Answered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Busy': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'No Answer': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white',
  'Failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

const typeColors = {
  'Incoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Outgoing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Missed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export function CallLogsPage({ onCreateCallLog, leadName }: CallLogsPageProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetchCallLogs();
  }, [leadName]);

  // const fetchCallLogs = async () => {
  //   try {
  //     setLoading(true);

  //     // Get company from session
  //     const sessionCompany = sessionStorage.getItem('company');
  //     if (!sessionCompany) {
  //       setCallLogs([]);
  //       setLoading(false);
  //       return;
  //     }

  //     // Add filter for company field (change "company" to the correct field if needed)
  //     const filters = encodeURIComponent(JSON.stringify([["company", "=", sessionCompany]]));
  //     const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log?fields=["name","from","to","status","type","duration","reference_doctype","id","creation","modified"]&filters=${filters}`;

  //     const response = await fetch(apiUrl, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
  //       }
  //     });

  const fetchCallLogs = async () => {
    try {
      setLoading(true);

      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setCallLogs([]);
        setLoading(false);
        return;
      }

      const filters = encodeURIComponent(
        JSON.stringify([["company", "=", sessionCompany]])
      );

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log?fields=["name","from","to","status","type","duration","reference_doctype","id","creation","modified"]&filters=${filters}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        }
      });


      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      let filteredCallLogs = result.data || [];

      // Filter by leadName if provided
      if (leadName) {
        filteredCallLogs = filteredCallLogs.filter((callLog: CallLog) =>
          callLog.id === leadName
        );
      }

      setCallLogs(filteredCallLogs);
    } catch (error) {
      // console.error('Error fetching call logs:', error);
      // showToast('Failed to fetch call logs', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (callLog: CallLog) => {
    setEditingCallLog(callLog);
    setShowEditModal(true);
  };

  const handleUpdate = async (updatedCallLog: CallLog) => {
    try {
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${updatedCallLog.name}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        },
        body: JSON.stringify({
          from: updatedCallLog.from,
          to: updatedCallLog.to,
          status: updatedCallLog.status,
          type: updatedCallLog.type,
          duration: updatedCallLog.duration
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Call log updated successfully', { type: 'success' });
      setShowEditModal(false);
      setEditingCallLog(null);
      fetchCallLogs();
    } catch (error) {
      console.error('Error updating call log:', error);
      showToast('Failed to update call log', { type: 'error' });
    }
  };

  const handleDelete = async (callLogName: string) => {
    if (!confirm('Are you sure you want to delete this call log?')) return;

    try {
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callLogName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
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

  const filteredCallLogs = callLogs.filter(callLog =>
    Object.values(callLog).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const EditModal = () => {
    if (!editingCallLog || !showEditModal) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)} />

          <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
            }`}>
            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Call Log</h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>From</label>
                  <input
                    type="text"
                    value={editingCallLog.from}
                    onChange={(e) => setEditingCallLog({ ...editingCallLog, from: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>To</label>
                  <input
                    type="text"
                    value={editingCallLog.to}
                    onChange={(e) => setEditingCallLog({ ...editingCallLog, to: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Status</label>
                  <select
                    value={editingCallLog.status}
                    onChange={(e) => setEditingCallLog({ ...editingCallLog, status: e.target.value as CallLog['status'] })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  >
                    <option value="Ringing">Ringing</option>
                    <option value="Answered">Answered</option>
                    <option value="Busy">Busy</option>
                    <option value="No Answer">No Answer</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Type</label>
                  <select
                    value={editingCallLog.type}
                    onChange={(e) => setEditingCallLog({ ...editingCallLog, type: e.target.value as CallLog['type'] })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  >
                    <option value="Incoming">Incoming</option>
                    <option value="Outgoing">Outgoing</option>
                    <option value="Missed">Missed</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Duration (seconds)</label>
                  <input
                    type="text"
                    value={editingCallLog.duration || ''}
                    onChange={(e) => setEditingCallLog({ ...editingCallLog, duration: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>
              </div>
            </div>

            <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'
              }`}>
              <button
                onClick={() => handleUpdate(editingCallLog)}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Update
              </button>
              <button
                onClick={() => setShowEditModal(false)}
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
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'
                }`}>
                {filteredCallLogs.map((callLog) => (
                  <tr key={callLog.name} className={`transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                    }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-white'}`} />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColors[callLog.type]}`}>
                          {callLog.type}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {callLog.from || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {callLog.to || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[callLog.status]}`}>
                        {callLog.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {callLog.duration ? `${callLog.duration}s` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {callLog.creation ? new Date(callLog.creation).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(callLog)}
                          className={theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-900'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(callLog.name)}
                          className={theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}
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

      <EditModal />
    </div>
  );
}