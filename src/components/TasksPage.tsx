import { useState, useEffect } from 'react';
import { showToast } from '../utils/toast';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { BsThreeDots } from 'react-icons/bs';

interface Task {
  name: string;
  title: string;
  assigned_to: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Done' | 'Canceled';
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
}

const statusColors = {
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

const API_BASE_URL = 'http://103.214.132.20:8002';
const AUTH_TOKEN = 'token 1b670b800ace83b:f32066fea74d0fe';

export function TasksPage({ onCreateTask, leadName }: TasksPageProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [contactOptions, setContactOptions] = useState<string[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [leadName]);

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

      // Prepare filters
      let filters = {};

      // Add leadName filter if provided
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

      const apiUrl = `${API_BASE_URL}/api/method/crm.api.doc.get_data`;

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

      // Extract tasks from the new API response structure
      const tasksData = result.message?.data || [];
      setTasks(tasksData);

    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('Failed to fetch tasks', { type: 'error' });
    } finally {
      setLoading(false);
    }
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

      // Build the URL with query parameters
      const params = new URLSearchParams({
        fields: JSON.stringify(["name", "email"]),
        filters: JSON.stringify([["company", "=", sessionCompany]])
      });

      const response = await fetch(`${API_BASE_URL}/api/v2/document/User?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const users = result.data || [];

        // Extract user names from the response
        const names = users
          .map((user: any) => user.name)
          .filter((name: string | undefined) => !!name && name.trim() !== "");

        setContactOptions(Array.from(new Set(names)));
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
    fetchContactOptions(); // Fetch contacts when modal opens
  };

  const handleUpdate = async (updatedTask: Task) => {
    try {
      const apiUrl = `${API_BASE_URL}/api/method/frappe.client.set_value`;

      // Prepare the fieldname object with all the updated fields
      const fieldname = {
        title: updatedTask.title,
        assigned_to: updatedTask.assigned_to,
        priority: updatedTask.priority,
        status: updatedTask.status,
        start_date: updatedTask.start_date,
        due_date: updatedTask.due_date,
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Task updated successfully', { type: 'success' });
      setShowEditModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Failed to update task', { type: 'error' });
    }
  };

  const handleDelete = async (taskName: string) => {
    try {
      const apiUrl = `${API_BASE_URL}/api/v2/document/CRM Task/${taskName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': AUTH_TOKEN
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Task deleted successfully', { type: 'success' });
      setShowDeleteModal(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task', { type: 'error' });
    }
  };

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
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.name));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) return;

    // For bulk delete, we'll show the delete modal
    setShowDeleteModal(true);
    // We'll use taskToDelete as null to indicate bulk delete
    setTaskToDelete(null);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      // Single task deletion
      handleDelete(taskToDelete);
    } else if (selectedTasks.length > 0) {
      // Bulk deletion
      selectedTasks.forEach(taskName => {
        handleDelete(taskName);
      });
      setSelectedTasks([]);
    }
  };

  const filteredTasks = tasks.filter(task =>
    Object.values(task).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const EditModal = () => {
    const [editForm, setEditForm] = useState<Task | null>(null);

    // Load editingTask into local form state when modal opens
    useEffect(() => {
      if (editingTask && showEditModal) {
        setEditForm({ ...editingTask });
      }
    }, [editingTask, showEditModal]);

    if (!editForm || !showEditModal) return null;

    const handleChange = (field: keyof Task, value: any) => {
      setEditForm(prev => prev ? { ...prev, [field]: value } : prev);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)} />

          <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Task</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>

                {/* Assigned To */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Assigned To</label>
                  <select
                    value={editForm.assigned_to}
                    onChange={(e) => handleChange("assigned_to", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  >
                    {/* <option value="">Select a Contact</option> */}
                    {isLoadingContacts ? (
                      <option value="" disabled>Loading contacts...</option>
                    ) : (
                      contactOptions.map((contact) => (
                        <option key={contact} value={contact}>
                          {contact}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => handleChange("priority", e.target.value as Task['priority'])}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => handleChange("status", e.target.value as Task['status'])}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white'
                        : 'border-gray-300'
                      }`}
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>

                {/* Dates */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Start Date</label>
                  <input
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Due Date</label>
                  <input
                    type="date"
                    value={editForm.due_date}
                    onChange={(e) => handleChange("due_date", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>
              </div>
            </div>

            <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
              <button
                onClick={() => handleUpdate(editForm)}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Update
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${theme === 'dark'
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


  const DeleteModal = () => {
    if (!showDeleteModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex items-center justify-center  min-h-screen px-4 pt-4 pb-20 text-center  sm:p-0">
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
        <Header
          title="Tasks"
          subtitle={leadName ? `For Lead: ${leadName}` : undefined}
          onRefresh={fetchTasks}
          onFilter={() => { }}
          onSort={() => { }}
          onColumns={() => { }}
          onCreate={onCreateTask}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading tasks...</div>
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
        title="Tasks"
        subtitle={leadName ? `For Lead: ${leadName}` : undefined}
        onRefresh={fetchTasks}
        onFilter={() => { }}
        onSort={() => { }}
        onColumns={() => { }}
        onCreate={onCreateTask}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="p-4 sm:p-6">
        {/* Tasks Table */}
        <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
          ? 'bg-custom-gradient border-transparent !rounded-none'
          : 'bg-white border-gray-200'
          }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-transparent divide-x-2' : 'bg-gray-50 border-gray-200'
                }`}>
                <tr className="divide-x-[1px]">
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={handleSelectAll}
                      className={`rounded ${theme === 'dark' ? 'text-purple-500' : 'text-blue-600'}`}
                    />
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Title
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Assigned To
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Priority
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'
                }`}>
                {filteredTasks.map((task) => (
                  <tr
                    key={task.name}
                    className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                      }`}
                    onClick={() => handleRowClick(task)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.name)}
                        onChange={() => handleCheckboxChange(task.name)}
                        className={`rounded ${theme === 'dark' ? 'text-purple-500' : 'text-blue-600'}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className={`text-sm truncate max-w-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {task.assigned_to}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No tasks found</div>
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
              {leadName ? 'No tasks for this lead' : 'Create your first task to get started'}
            </div>
          </div>
        )}
      </div>

      {/* Selection Popup - Appears at bottom when tasks are selected */}
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
                  {/* <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                    onClick={() => {
                      // Add your edit functionality here
                      setShowMenu(false);
                    }}
                  >
                    Edit
                  </button> */}
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

            {/* Select all */}
            <button
              onClick={handleSelectAll}
              className="text-sm font-medium text-gray-800 dark:text-white hover:underline"
            >
              Select all
            </button>

            {/* Close */}
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