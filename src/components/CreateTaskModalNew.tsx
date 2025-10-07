import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { getUserSession } from '../utils/session';
import { AUTH_TOKEN } from '../api/apiUrl';

interface CreateTaskModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  leadName?: string;
  isEditMode?: boolean;
  currentTaskId?: string;
  tasksLoading?: boolean;
  onSuccess?: () => void;
}

interface UserOption {
  value: string;
  description: string;
}

interface TaskForm {
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to: string;
  reference_doctype: string;
  reference_docname: string;
}

interface ValidationErrors {
  title?: string;
  due_date?: string;
}

export function CreateTaskModalNew({ 
  isOpen, 
  onClose, 
  onSubmit, 
  leadName, 
  isEditMode = false, 
  currentTaskId = '',
  tasksLoading = false,
  onSuccess
}: CreateTaskModalNewProps) {
  const { theme } = useTheme();
  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    due_date: '',
    assigned_to: '',
    reference_doctype: 'CRM Lead',
    reference_docname: leadName || ''
  });
  
  const [users, setUsers] = useState<UserOption[]>([
    { description: "admin", value: "admin@psd.com" }
  ]);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const userSession = getUserSession();
  const Company = userSession?.company;

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Reset form and validation when modal opens
      setTaskForm({
        title: '',
        description: '',
        status: 'Open',
        priority: 'Medium',
        due_date: '',
        assigned_to: '',
        reference_doctype: 'CRM Lead',
        reference_docname: leadName || ''
      });
      setValidationErrors({});
      setIsFormValid(false);
    }
  }, [isOpen, leadName]);

  // Validate form on every change
  useEffect(() => {
    validateForm();
  }, [taskForm]);

  const validateForm = () => {
    const errors: ValidationErrors = {};

    // Title validation
    if (!taskForm.title.trim()) {
      errors.title = 'Title is required';
    } else if (taskForm.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters long';
    } else if (taskForm.title.trim().length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    // Due date validation (if provided)
    if (taskForm.due_date) {
      const selectedDate = new Date(taskForm.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only

      if (selectedDate < today) {
        errors.due_date = 'Due date cannot be in the past';
      }
    }

    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  const handleInputChange = (field: keyof TaskForm, value: string) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const fetchUsers = async () => {
    try {
      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

      const requestBody = {
        txt: "",
        doctype: "User",
        filters: {
          company: Company
        },
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
      setUsers(result.message || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', { type: 'error' });
    }
  };

  const handleSubmit = async () => {
    // Final validation before submission
    validateForm();
    
    if (!isFormValid) {
      showToast('Please fix the validation errors before submitting', { type: 'error' });
      return false;
    }

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      const docData = {
        doctype: "CRM Task",
        reference_doctype: taskForm.reference_doctype,
        reference_docname: taskForm.reference_docname,
        title: taskForm.title,
        description: taskForm.description ? `${taskForm.description}` : '',
        priority: taskForm.priority,
        status: taskForm.status,
        assigned_to: taskForm.assigned_to,
        due_date: taskForm.due_date || undefined,
        company: sessionCompany
      };

      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.client.insert';

      const requestBody = {
        doc: docData
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
      showToast(`Task ${isEditMode ? 'updated' : 'created'} successfully`, { type: 'success' });
      
      // Call the parent component's onSubmit with the result
      onSubmit(result);
      
      // Call onSuccess to trigger refresh in parent component
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form and close modal
      setTaskForm({
        title: '',
        description: '',
        status: 'Open',
        priority: 'Medium',
        due_date: '',
        assigned_to: '',
        reference_doctype: 'CRM Lead',
        reference_docname: leadName || ''
      });
      
      setValidationErrors({});
      onClose();
      return true;
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} task:`, error);
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} task`, { type: 'error' });
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-11/12 sm:max-w-[600px] border ${theme === 'dark' ? 'border-gray-600 bg-dark-secondary' : 'border-gray-400 bg-white'}`}>
        <div className={`px-6 pt-6 pb-4 sm:p-8 sm:pb-6 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
          <div className="absolute top-0 right-0 pt-6 pr-6">
            <button
              type="button"
              className={`rounded-md ${theme === 'dark' ? 'text-white' : 'text-gray-400'} hover:text-gray-500 focus:outline-none`}
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {isEditMode ? 'Edit Task' : 'Create Task'}
          </h3>

          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Title <span className='text-red-500'>*</span>
              </label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } ${
                  validationErrors.title ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Task title"
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={taskForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
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
                  value={taskForm.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="Backlog">Backlog</option>
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="Todo">Todo</option>
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="In Progress">In Progress</option>
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="Done">Done</option>
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="Canceled">Canceled</option>
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="Open">Open</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priority
                </label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="Low">Low</option>
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="Medium">Medium</option>
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="High">High</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${
                    validationErrors.due_date ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {validationErrors.due_date && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.due_date}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Assigned To
                </label>
                <select
                  value={taskForm.assigned_to}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} value="">Select Assign</option>
                  {users.map((user) => (
                    <option 
                      key={user.value} 
                      value={user.value}
                      className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                    >
                      {user.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input
              type="hidden"
              name="reference_doctype"
              value={taskForm.reference_doctype}
            />
            <input
              type="hidden"
              name="reference_docname"
              value={taskForm.reference_docname}
            />
          </div>
        </div>

        <div className={`px-6 py-4 sm:px-8 ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
          <div className="w-full">
            <button
              onClick={handleSubmit}
              disabled={tasksLoading || !isFormValid}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                theme === 'dark'
                  ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              } ${
                tasksLoading || !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {tasksLoading ? (
                <span className="flex items-center justify-center">
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEditMode ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}