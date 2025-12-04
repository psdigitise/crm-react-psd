import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2, ChevronLeft, ChevronRight, Filter, X, Settings, RefreshCcw } from 'lucide-react';
import { showToast } from '../utils/toast';
import { Menu } from 'lucide-react';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { BsThreeDots } from 'react-icons/bs';
import { AUTH_TOKEN } from '../api/apiUrl';
import { api } from '../api/apiService';

interface Task {
  name: string;
  title: string;
  assigned_to: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Done' | 'Canceled' | 'Open';
  start_date: string;
  due_date: string;
  description: string;
  reference_doctype?: string;
  reference_docname?: string;
  creation?: string;
  modified?: string;
}

interface TasksPageProps {
  onCreateTask: () => void;
  leadName?: string;
  refreshTrigger?: number;
  onMenuToggle: () => void;
  searchTerm: string;
}

interface ContactOption {
  value: string;
  description: string;
}

interface ColumnConfig {
  key: keyof Task;
  label: string;
  visible: boolean;
  sortable: boolean;
}

const statusColors = {
  'Open': '!bg-white !text-black-800 dark:bg-white dark:text-black',
  'Backlog': '!bg-gray-100 !text-gray-800 dark:bg-gray-900/30 dark:text-white',
  'Todo': '!bg-blue-100 !text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'In Progress': '!bg-yellow-100 !text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Done': '!bg-green-100 !text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Canceled': '!bg-red-100 !text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

const priorityColors = {
  'Low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'High': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

const API_BASE_URL = 'https://api.erpnext.ai';

const defaultColumns: ColumnConfig[] = [
  { key: 'title', label: 'Title', visible: true, sortable: true },
  { key: 'assigned_to', label: 'Assigned To', visible: true, sortable: true },
  { key: 'priority', label: 'Priority', visible: true, sortable: true },
  { key: 'status', label: 'Status', visible: true, sortable: true },
  { key: 'due_date', label: 'Due Date', visible: true, sortable: true },
  { key: 'description', label: 'Description', visible: false, sortable: true },
  { key: 'start_date', label: 'Start Date', visible: false, sortable: true },
];

// Utility function to parse ERPNext error messages
const parseERPNextError = (error: any): string => {
  if (typeof error === 'string') {
    try {
      const errorData = JSON.parse(error);
      return parseERPNextError(errorData);
    } catch {
      const linkedMatch = error.match(/Cannot delete or cancel because (.*?) is linked with/);
      if (linkedMatch) {
        return `Cannot delete or cancel because ${linkedMatch[1]} is linked with CRM Notification`;
      }
      return error;
    }
  }

  if (error?._server_messages) {
    try {
      const serverMessages = JSON.parse(error._server_messages);
      if (Array.isArray(serverMessages) && serverMessages.length > 0) {
        const mainMessage = JSON.parse(serverMessages[0]);
        if (mainMessage.message) {
          const message = mainMessage.message;
          const simplifiedMessage = message.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
          const linkedMatch = simplifiedMessage.match(/Cannot delete or cancel because (.*?) is linked with CRM Notification/);
          if (linkedMatch) {
            return `Cannot delete or cancel because CRM Task is linked with CRM Notification`;
          }
          return simplifiedMessage;
        }
      }
    } catch (parseError) {
      console.error('Error parsing server messages:', parseError);
    }
  }

  if (error?.exception) {
    if (error.exception.includes('linked with CRM Notification')) {
      return 'Cannot delete or cancel because CRM Task is linked with CRM Notification';
    }
  }

  if (error?.message) {
    const message = error.message;
    const simplifiedMessage = message.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
    const linkedMatch = simplifiedMessage.match(/Cannot delete or cancel because (.*?) is linked with CRM Notification/);
    if (linkedMatch) {
      return `Cannot delete or cancel because CRM Task is linked with CRM Notification`;
    }
    return simplifiedMessage;
  }

  return 'An unexpected error occurred';
};

export function TasksPage({ onCreateTask, leadName, refreshTrigger = 0, onMenuToggle, searchTerm }: TasksPageProps) {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0);
  
  // New state for responsive features
  const [sortField, setSortField] = useState<keyof Task | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Combine external and internal refresh triggers
  useEffect(() => {
    console.log('Fetching tasks...', { refreshTrigger, internalRefreshTrigger });
    fetchTasks();
  }, [leadName, refreshTrigger, internalRefreshTrigger]);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!session) {
        setTasks([]);
        setLoading(false);
        return;
      }

      let filters = {};

      if (leadName) {
        filters = {
          "reference_docname": leadName
        };
      }

      if (sessionCompany) {
        filters = {
          ...filters,
          "company": sessionCompany
        };
      }

      const requestBody = {
        doctype: "CRM Task",
        filters: filters,
        order_by: "modified desc",
        default_filters: {},
        column_field: "status",
        columns: JSON.stringify([
          { "label": "Title", "type": "Data", "key": "title", "width": "16rem" },
          { "label": "Status", "type": "Select", "key": "status", "width": "8rem" },
          { "label": "Priority", "type": "Select", "key": "priority", "width": "8rem" },
          { "label": "Due Date", "type": "Date", "key": "due_date", "width": "8rem" },
          { "label": "Assigned To", "type": "Link", "key": "assigned_to", "width": "10rem" },
          { "label": "Last Modified", "type": "Datetime", "key": "modified", "width": "8rem" }
        ]),
        kanban_columns: "[]",
        kanban_fields: "[]",
        page_length: 20,
        page_length_count: 20,
        rows: JSON.stringify([
          "name", "title", "description", "assigned_to", "due_date", "status",
          "priority", "reference_doctype", "reference_docname", "modified", "start_date"
        ]),
        title_field: "",
        view: {
          custom_view_name: 17,
          view_type: "list",
          group_by_field: "owner"
        }
      };

      const result = await api.post('/api/method/crm.api.doc.get_data', requestBody);
      const tasksData = result.message?.data || [];
      console.log('Tasks fetched:', tasksData.length);
      setTasks(tasksData);

    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('Failed to fetch tasks', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = () => {
    console.log('Manual refresh triggered');
    setInternalRefreshTrigger(prev => prev + 1);
  };

  const fetchContactOptions = async () => {
    try {
      setIsLoadingContacts(true);
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setContactOptions([]);
        setIsLoadingContacts(false);
        return;
      }

      const apiUrl = 'https://api.erpnext.ai/api/method/frappe.desk.search.search_link';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify({
          txt: "",
          doctype: "User",
          filters: {
            company: sessionCompany
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.message && Array.isArray(result.message)) {
          const userOptions = result.message.map((item: any) => ({
            value: item.value,
            description: item.description || item.value
          }));
          setContactOptions(userOptions);
        }
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setContactOptions([]);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
    fetchContactOptions();
  };

  const handleUpdate = async (updatedTask: Task) => {
    try {
      const apiUrl = `${API_BASE_URL}/api/method/frappe.client.set_value`;

      const fieldname = {
        title: updatedTask.title,
        assigned_to: updatedTask.assigned_to,
        priority: updatedTask.priority,
        status: updatedTask.status,
        start_date: updatedTask.start_date || null,
        due_date: updatedTask.due_date || null,
        description: updatedTask.description
      };

      const requestBody = {
        doctype: "CRM Task",
        name: updatedTask.name,
        fieldname: fieldname
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
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Task updated successfully', { type: 'success' });
      setShowEditModal(false);
      setEditingTask(null);
      refreshTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Failed to update task', { type: 'error' });
    }
  };

  const handleDelete = async (taskName: string) => {
    try {
      const apiUrl = `${API_BASE_URL}/api/method/frappe.desk.reportview.delete_items`;

      const requestBody = {
        items: JSON.stringify([taskName]),
        doctype: "CRM Task"
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
        const errorText = await response.text();
        let errorMessage = 'Failed to delete task';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = parseERPNextError(errorData);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }

        throw new Error(errorMessage);
      }

      showToast('Task deleted successfully', { type: 'success' });
      setShowDeleteModal(false);
      setTaskToDelete(null);
      refreshTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      let errorMessage = 'Failed to delete task';
      if (error instanceof Error) {
        errorMessage = parseERPNextError(error);
      }
      showToast(errorMessage, { type: 'error', position: 'top-right' });
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for input:', error);
      const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
      return match ? match[1] : '';
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      if (!year || !month || !day) return 'Invalid Date';
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) return 'Invalid Date';
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // New responsive functions
  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleColumn = (columnKey: keyof Task) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const getFilteredAndSortedData = () => {
    let filteredData = tasks.filter(task =>
      Object.values(task).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

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

  const toggleTaskDetails = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const isTaskExpanded = (taskId: string) => expandedTasks.has(taskId);

  const handleRowClick = (task: Task) => {
    handleEdit(task);
  };

  const handleCheckboxChange = (taskName: string) => {
    if (selectedTasks.includes(taskName)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskName));
    } else {
      setSelectedTasks([...selectedTasks, taskName]);
    }
  };

  const handleSelectAll = () => {
    const paginatedData = getPaginatedData();
    if (selectedTasks.length === paginatedData.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(paginatedData.map(task => task.name));
    }
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = getFilteredAndSortedData().map(task => task.name);
    setSelectedTasks(allFilteredIds);
  };

  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) return;
    setShowDeleteModal(true);
    setTaskToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      if (taskToDelete) {
        await handleDelete(taskToDelete);
      } else if (selectedTasks.length > 0) {
        for (const taskName of selectedTasks) {
          await handleDelete(taskName);
        }
        setSelectedTasks([]);
      }
    } catch (error) {
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  const SortButton = ({ field, children }: { field: keyof Task; children: React.ReactNode }) => (
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

  const filteredDataLength = getFilteredAndSortedData().length;
  const paginatedData = getPaginatedData();
  const totalPages = getTotalPages();
  const visibleColumns = getVisibleColumns();

  const EditModal = () => {
    const [editForm, setEditForm] = useState<Task | null>(null);

    useEffect(() => {
      if (editingTask && showEditModal) {
        setEditForm({ ...editingTask });
      }
    }, [editingTask, showEditModal]);

    if (!editForm || !showEditModal) return null;

    const handleChange = (field: keyof Task, value: any) => {
      setEditForm(prev => prev ? { ...prev, [field]: value } : prev);
    };

    const handleClose = () => {
      setShowEditModal(false);
      setEditingTask(null);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-11/12 sm:max-w-[600px] border ${theme === 'dark' ? 'border-gray-600 bg-dark-secondary' : 'border-gray-400 bg-white'}`}>
          <div className={`px-6 pt-6 pb-4 sm:p-8 sm:pb-6 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
            <div className="absolute top-0 right-0 pt-6 pr-6">
              <button
                type="button"
                className={`rounded-md ${theme === 'dark' ? 'text-white' : 'text-gray-400'} hover:text-gray-500 focus:outline-none`}
                onClick={handleClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Edit Task
            </h3>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title <span className='text-red-500'>*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  placeholder="Task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => handleChange("status", e.target.value as Task['status'])}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Canceled">Canceled</option>
                    <option value="Open">Open</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => handleChange("priority", e.target.value as Task['priority'])}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editForm.due_date ? formatDateForInput(editForm.due_date) : ''}
                    onChange={(e) => handleChange("due_date", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Assign To
                  </label>
                  <select
                    value={editForm.assigned_to || ''}
                    onChange={(e) => handleChange("assigned_to", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    <option value=""
                      style={{
                        color: theme === 'dark' ? 'white' : 'black',
                        backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                      }}>Select Assign</option>
                    {isLoadingContacts ? (
                      <option value="" disabled>Loading contacts...</option>
                    ) : (
                      contactOptions.map((contact) => (
                        <option
                          key={contact.value}
                          value={contact.value}
                          style={{
                            color: theme === 'dark' ? 'white' : 'black',
                            backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                          }}
                        >
                          {contact.description}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className={`px-6 py-4 sm:px-8 ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
            <div className="w-full">
              <button
                onClick={() => {
                  if (!editForm.title.trim()) {
                    showToast('Title is required', { type: 'error' });
                    return;
                  }
                  handleUpdate(editForm);
                }}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${theme === 'dark'
                  ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  }`}
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeleteModal = () => {
    if (!showDeleteModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(false)} />

          <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Delete
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                Are you sure you want to delete {taskToDelete ? 'this task' : `the selected ${selectedTasks.length} task(s)`}?
              </p>
            </div>

            <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
              <button
                onClick={confirmDelete}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
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
        
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purplebg' : 'text-blue-600'}`} />
            <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading tasks...</span>
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

      <div className="p-4 sm:p-6">
        {/* Action Bar */}
        <div className="flex flex-col mb-3 sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshTasks}
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

        {/* Table */}
        <div
          className={`rounded-lg max-sm:bg-none shadow-sm border overflow-hidden ${theme === 'dark'
            ? 'bg-custom-gradient border-transparent !rounded-none'
            : 'bg-white border-gray-200'
            }`}
        >
          <div className="w-full">
            {/* Desktop Table View */}
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
                          paginatedData.length > 0 &&
                          selectedTasks.length === paginatedData.length
                        }
                        onChange={handleSelectAll}
                        // ref={(el) => {
                        //   if (el) {
                        //     el.indeterminate =
                        //       selectedTasks.length > 0 &&
                        //       selectedTasks.length < paginatedData.length;
                        //   }
                        // }}
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
                  {paginatedData.map((task) => (
                    <tr
                      key={task.name}
                      className={`transition-colors cursor-pointer ${theme === 'dark'
                        ? 'hover:bg-purple-800/20'
                        : 'hover:bg-gray-50'
                        }`}
                      onClick={() => handleRowClick(task)}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.name)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(task.name);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {visibleColumns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.key === 'title' ? (
                            <div className="flex items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
                                  }`}
                              >
                                <span
                                  className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                                    }`}
                                >
                                  {task.title?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div
                                  className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}
                                >
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className={`text-sm truncate max-w-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {task.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : column.key === 'status' ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[task.status]}`}>
                              {task.status}
                            </span>
                          ) : column.key === 'priority' ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                          ) : column.key === 'due_date' ? (
                            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {task.due_date ? formatDateForDisplay(task.due_date) : 'N/A'}
                            </span>
                          ) : (
                            <span
                              className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                                }`}
                            >
                              {task[column.key] || 'N/A'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {paginatedData.map((task) => (
                <div
                  key={task.name}
                  className={`p-4 rounded-lg border ${theme === 'dark'
                    ? 'bg-purplebg border-transparent'
                    : 'bg-white border-gray-200'
                    } shadow-sm`}
                >
                  <div className="flex justify-between items-center">
                    <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.name)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCheckboxChange(task.name);
                        }}
                        className="rounded mr-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    <div
                      className="flex items-center flex-1 cursor-pointer"
                      onClick={() => handleRowClick(task)}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purple-700' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}
                        >
                          {task.title?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3
                        className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                      >
                        {task.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskDetails(task.name);
                        }}
                        className={`p-1 rounded transition-transform ${theme === 'dark' ? 'hover:bg-purple-700' : 'hover:bg-gray-100'
                          }`}
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform ${isTaskExpanded(task.name) ? 'rotate-180' : ''
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
                  {isTaskExpanded(task.name) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {visibleColumns.map((column) =>
                        column.key !== 'title' ? (
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
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[task.status]}`}>
                                  {task.status}
                                </span>
                              ) : column.key === 'priority' ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </span>
                              ) : column.key === 'due_date' ? (
                                task.due_date ? formatDateForDisplay(task.due_date) : 'N/A'
                              ) : (
                                task[column.key] || 'N/A'
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

          {paginatedData.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No tasks found</div>
              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
                {leadName ? 'No tasks for this lead' : 'Create your first task to get started'}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
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

      {/* Selection Action Bar */}
      {selectedTasks.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2
         bg-white dark:bg-gray-800 shadow-2xl rounded-lg
         border dark:border-gray-700 p-2
         flex items-center justify-between
         w-[90%] max-w-md
         z-50 transition-all duration-300 ease-out">
          <span className="text-sm ml-4 text-gray-800 dark:text-white font-medium">
            {selectedTasks.length} {selectedTasks.length === 1 ? "Row" : "Rows"} selected
          </span>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
                onClick={() => setShowMenu(prev => !prev)}
              >
                <BsThreeDots className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 bottom-10 bg-white dark:bg-gray-700 dark:text-white shadow-lg rounded-md border dark:border-gray-600 py-1 w-40 z-50">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                    onClick={() => {
                      handleBulkDelete();
                      setShowMenu(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSelectAllFiltered}
              className="text-sm font-medium text-gray-800 dark:text-white hover:underline"
            >
              Select all
            </button>

            <button
              onClick={() => setSelectedTasks([])}
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

      <EditModal />
      <DeleteModal />
    </div>
  );
}