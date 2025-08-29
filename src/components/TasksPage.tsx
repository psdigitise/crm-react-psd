import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { showToast } from '../utils/toast';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';

import { getUserSession } from '../utils/session';

interface Task {
  name: string;
  title: string;
  assigned_to: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Working' | 'Pending Review' | 'Overdue' | 'Template' | 'Completed' | 'Cancelled';
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
  'Open': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Working': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Pending Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Overdue': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Template': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white'
};

const priorityColors = {
  'Low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'High': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export function TasksPage({ onCreateTask, leadName }: TasksPageProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';

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

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleUpdate = async (updatedTask: Task) => {
    try {
      const session = getUserSession();
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Task/${updatedTask.name}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          title: updatedTask.title,
          assigned_to: updatedTask.assigned_to,
          priority: updatedTask.priority,
          status: updatedTask.status,
          start_date: updatedTask.start_date,
          due_date: updatedTask.due_date,
          description: updatedTask.description
        })
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
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const session = getUserSession();
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Task/${taskName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Task deleted successfully', { type: 'success' });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task', { type: 'error' });
    }
  };

  const filteredTasks = tasks.filter(task =>
    Object.values(task).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const EditModal = () => {
    if (!editingTask || !showEditModal) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)} />

          <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
            }`}>
            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Task</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Title</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Assigned To</label>
                  <input
                    type="text"
                    value={editingTask.assigned_to}
                    onChange={(e) => setEditingTask({ ...editingTask, assigned_to: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Task['priority'] })}
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

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as Task['status'] })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  >
                    <option value="Open">Open</option>
                    <option value="Working">Working</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Template">Template</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Start Date</label>
                  <input
                    type="date"
                    value={editingTask.start_date}
                    onChange={(e) => setEditingTask({ ...editingTask, start_date: e.target.value })}
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
                    value={editingTask.due_date}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-white-31 border-white text-white'
                      : 'border-gray-300'
                      }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Description</label>
                  <textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={3}
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
                onClick={() => handleUpdate(editingTask)}
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
                  <th className={`px-6 py-3 text-left text-sm font-semibold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'
                }`}>
                {filteredTasks.map((task) => (
                  <tr key={task.name} className={`transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                    }`}>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className={`text-sm truncate max-w-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className={theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-900'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.name)}
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

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No tasks found</div>
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
              {leadName ? 'No tasks for this lead' : 'Create your first task to get started'}
            </div>
          </div>
        )}
      </div>

      <EditModal />
    </div>
  );
}