import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Edit, Trash2 } from 'lucide-react';
import { showToast } from '../utils/toast';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';

interface Todo {
  name: string;
  status: 'Open' | 'Closed' | 'Cancelled';
  date: string;
  description: string;
  reference_type?: string;
  creation?: string;
  modified?: string;
}

interface TodosPageNewProps {
  onCreateTodo: () => void;
}

const statusColors = {
  'Open': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Closed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-white'
};

export function UserList({ onCreateTodo }: TodosPageNewProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetchTodos();
  }, []);

  // const fetchTodos = async () => {
  //   try {
  //     setLoading(true);
  //     const apiUrl = 'http://103.214.132.20:8002/api/v2/document/ToDo?fields=["name","status","date","description","reference_type","creation","modified"]';

  //     const response = await fetch(apiUrl, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'token 1b670b800ace83b:f32066fea74d0fe'
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //     }

  //     const result = await response.json();
  //     setTodos(result.data || []);
  //   } catch (error) {
  //     console.error('Error fetching todos:', error);
  //     showToast('Failed to fetch todos', { type: 'error' });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchTodos = async () => {
    try {
      setLoading(true);

      // Get company from session
      const sessionCompany = sessionStorage.getItem('company');
      if (!sessionCompany) {
        setTodos([]);
        setLoading(false);
        return;
      }

      // Add filter for company field (if your ToDo doctype has a 'company' field)
      const filters = encodeURIComponent(JSON.stringify([["company", "=", sessionCompany]]));
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/ToDo?fields=["name","status","date","description","reference_type","creation","modified"]&filters=${filters}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f32066fea74d0fe'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setTodos(result.data || []);
    } catch (error) {
      // console.error('Error fetching todos:', error);
      // showToast('Failed to fetch todos', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setShowEditModal(true);
  };

  const handleUpdate = async (updatedTodo: Todo) => {
    try {
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/ToDo/${updatedTodo.name}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f32066fea74d0fe'
        },
        body: JSON.stringify({
          status: updatedTodo.status,
          date: updatedTodo.date,
          description: updatedTodo.description,
          reference_type: updatedTodo.reference_type
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Todo updated successfully', { type: 'success' });
      setShowEditModal(false);
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      showToast('Failed to update todo', { type: 'error' });
    }
  };

  const handleDelete = async (todoName: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/ToDo/${todoName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f32066fea74d0fe'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Todo deleted successfully', { type: 'success' });
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      showToast('Failed to delete todo', { type: 'error' });
    }
  };

  const filteredTodos = todos.filter(todo =>
    Object.values(todo).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const EditModal = () => {
    if (!editingTodo || !showEditModal) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)} />

          <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
            }`}>
            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Todo</h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Status</label>
                  <select
                    value={editingTodo.status}
                    onChange={(e) => setEditingTodo({ ...editingTodo, status: e.target.value as Todo['status'] })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white'
                        : 'border-gray-300'
                      }`}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Date</label>
                  <input
                    type="date"
                    value={editingTodo.date}
                    onChange={(e) => setEditingTodo({ ...editingTodo, date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white'
                        : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Reference Type</label>
                  <input
                    type="text"
                    value={editingTodo.reference_type || ''}
                    onChange={(e) => setEditingTodo({ ...editingTodo, reference_type: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                        ? 'bg-white-31 border-white text-white'
                        : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Description</label>
                  <textarea
                    value={editingTodo.description}
                    onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                    rows={4}
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
                onClick={() => handleUpdate(editingTodo)}
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
          title="Todos"
          onRefresh={fetchTodos}
          onFilter={() => { }}
          onSort={() => { }}
          onColumns={() => { }}
          onCreate={onCreateTodo}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading todos...</div>
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
        title="Todos"
        onRefresh={fetchTodos}
        onFilter={() => { }}
        onSort={() => { }}
        onColumns={() => { }}
        onCreate={onCreateTodo}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="p-4 sm:p-6">
        {/* Todos Table */}
        <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
            ? 'bg-custom-gradient border-white'
            : 'bg-white border-gray-200'
          }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-transparent divide-x-2' : 'bg-gray-50 border-gray-200'
                }`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Description
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Reference Type
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'
                }`}>
                {filteredTodos.map((todo) => (
                  <tr key={todo.name} className={`transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                    }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[todo.status]}`}>
                        {todo.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {todo.date ? new Date(todo.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className="max-w-xs truncate">{todo.description}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {todo.reference_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(todo)}
                          className={theme === 'dark' ? 'bg-purplebg hover:text-purple-300' : 'text-blue-600 hover:text-blue-900'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(todo.name)}
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

        {filteredTodos.length === 0 && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No todos found</div>
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
              Create your first todo to get started
            </div>
          </div>
        )}
      </div>

      <EditModal />
    </div>
  );
}