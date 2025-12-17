import { useState, useEffect } from 'react';
import { IoCloseOutline, IoDocumentTextOutline } from 'react-icons/io5';
import { SlCallIn, SlCallOut } from 'react-icons/sl';
import { FaRegCheckCircle, FaRegClock, FaUserFriends } from 'react-icons/fa';
import { LuSquareUserRound, LuTimer } from 'react-icons/lu';
import { BsCheckCircle } from 'react-icons/bs';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { GoArrowUpRight } from 'react-icons/go';
import { PiDotsThreeOutlineFill } from 'react-icons/pi';
import { SquarePen } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { SiTicktick } from 'react-icons/si';
import { apiAxios, getAuthToken } from '../../api/apiUrl';
import { getUserSession } from '../../utils/session';

interface CallDetailsPopupProps {
    onClose: () => void;
    theme?: 'light' | 'dark';
    call: {
        type: string;
        activity_type: string;
        caller: string;
        receiver: string;
        date: string;
        reference_doctype?: string;
        duration: string;
        status: string;
        id?: string;
        name: string;
        _notes?: Note[];
        _tasks?: Task[];
    };
    onEdit?: () => void;
    onTaskCreated?: () => void;
    fetchCallLogs: () => Promise<void>;
    callLog?: any;
    onAddTask?: () => void;
    onOpenReference?: (callLog: any) => void;
}

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
    name: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
    assigned_to: string;
    creation: string;
}

const AUTH_TOKEN = getAuthToken();

export const CallDetailsPopup = ({ onClose, theme = 'light', call, onEdit, onTaskCreated, fetchCallLogs, onOpenReference }: CallDetailsPopupProps) => {
    const [openMenu, setOpenMenu] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [note, setNote] = useState(call._notes || []);
    const [tasks, setTasks] = useState<Task[]>(call._tasks || []);
    const [isLoading, setIsLoading] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        status: 'Open',
        priority: 'Medium',
        due_date: '',
        assigned_to: ''
    });
    const [noteForm, setNoteForm] = useState({
        name: '',
        title: '',
        content: ''
    });
    const [userOptions, setUserOptions] = useState<{ value: string; label: string; }[]>([]);
    const token = getAuthToken();

    useEffect(() => {
        console.log("=== CallDetailsPopup Mount ===");
        console.log("Call prop:", call);
        console.log("Call._notes:", call._notes);
        console.log("Call._tasks:", call._tasks);

        setNote(call._notes || []);
        setTasks(call._tasks || []);
    }, [call._notes, call._tasks]);

    const handleAddNote = async () => {
        if (!noteForm.title) return;

        setIsLoading(true);
        try {
            const insertPayload = {
                doc: {
                    doctype: "FCRM Note",
                    title: noteForm.title,
                    content: noteForm.content,
                    reference_doctype: call.reference_doctype || "CRM Lead",
                    reference_docname: call.id || ""
                }
            };

            const insertResponse = await fetch('https://api.erpnext.ai/api/method/frappe.client.insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify(insertPayload)
            });

            if (!insertResponse.ok) {
                const errorData = await insertResponse.json();
                console.error("API Error (insert note):", errorData);
                throw new Error(errorData.message || 'Failed to create note');
            }

            const insertData = await insertResponse.json();
            const createdNote = insertData.message;

            const addToCallLogPayload = {
                call_sid: call.name || "",
                note: createdNote
            };

            const addToCallLogResponse = await fetch('https://api.erpnext.ai/api/method/crm.integrations.api.add_note_to_call_log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify(addToCallLogPayload)
            });

            if (!addToCallLogResponse.ok) {
                const errorData = await addToCallLogResponse.json();
                console.error("API Error (add note to call log):", errorData);
                throw new Error(errorData.message || 'Failed to link note to call log');
            }

            console.log("Successfully linked note to call log.");
            showToast('Note created successfully', { type: 'success' });
            setNoteForm({ name: '', title: '', content: '' });
            setIsAddingNote(false);
            onClose();
            if (fetchCallLogs && typeof fetchCallLogs === 'function') {
                try {
                    await fetchCallLogs();
                } catch (error) {
                    console.error('Error refreshing call logs:', error);
                }
            }

        } catch (error: any) {
            console.error("An error occurred during the note creation process:", error);
            showToast(error.message || 'Failed to create note', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditNote = async () => {
        if (!noteForm.title || !note || note.length === 0) return;

        setIsLoading(true);

        try {
            const noteToUpdate = note[0];
            const payload = {
                doctype: "FCRM Note",
                name: noteToUpdate.name,
                fieldname: {
                    title: noteForm.title,
                    content: noteForm.content,
                },
            };

            const response = await fetch('https://api.erpnext.ai/api/method/frappe.client.set_value', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                showToast('Note updated successfully', { type: 'success' }); // Add this line
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error (edit note):", errorData);
                throw new Error(errorData.message || 'Failed to update note');
            }

            const data = await response.json();
            console.log("Note updated successfully:", data.message);

            const updatedNotes = note.map((n) =>
                n.name === noteToUpdate.name ? { ...n, title: noteForm.title, content: noteForm.content } : n
            );
            setNote(updatedNotes);

            setNoteForm({ name: '', title: '', content: '' });
            onClose();
            setIsEditingNote(false);
            if (fetchCallLogs && typeof fetchCallLogs === 'function') {
                await fetchCallLogs();
            }

        } catch (error: any) {
            console.error("Error updating note:", error);
            showToast(error.message || 'Failed to update note', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditTask = async () => {
        if (!taskForm.title || !tasks || tasks.length === 0) return;

        const taskToEdit = tasks[0];
        setIsLoading(true);

        try {
            const payload = {
                doctype: "CRM Task",
                name: taskToEdit.name,
                fieldname: {
                    title: taskForm.title,
                    description: taskForm.description,
                    status: taskForm.status,
                    priority: taskForm.priority,
                    due_date: taskForm.due_date,
                    assigned_to: taskForm.assigned_to
                }
            };

            const response = await fetch('https://api.erpnext.ai/api/method/frappe.client.set_value', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token, },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Task updated successfully', { type: 'success' }); // Add this line
            }

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTask: Task = {
                ...taskToEdit,
                ...taskForm
            };

            setTasks(prevTasks => prevTasks.map(t => t.name === updatedTask.name ? updatedTask : t));
            setTaskForm({ title: '', description: '', status: 'Open', priority: 'Medium', due_date: '', assigned_to: '' });
            setIsEditingTask(false);
            setShowAddTask(false);
            onClose();
            if (fetchCallLogs) {
                await fetchCallLogs();
            }

        } catch (error) {
            console.error("Error updating task:", error);
            showToast('Failed to update task', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMenu = () => setOpenMenu((prev) => !prev);

    const handleAddTaskClick = () => {
        setOpenMenu(false);
        setShowAddTask(true);
        setIsAddingNote(false);
        setIsEditingNote(false);
        setIsEditingTask(false);
        setTaskForm({
            title: '',
            description: '',
            status: 'Open',
            priority: 'Medium',
            due_date: '',
            assigned_to: ''
        });
    };

    const handleEditTaskClick = () => {
        setOpenMenu(false);
        setShowAddTask(true);
        setIsEditingTask(true);
        setIsAddingNote(false);
        setIsEditingNote(false);

        if (tasks.length > 0) {
            const firstTask = tasks[0];
            const dueDate = firstTask.due_date ? firstTask.due_date.split(' ')[0] : '';
            setTaskForm({
                title: firstTask.title,
                description: firstTask.description,
                status: firstTask.status,
                priority: firstTask.priority,
                due_date: dueDate,
                assigned_to: firstTask.assigned_to
            });
        }
    };

    const handleAddNoteClick = () => {
        setOpenMenu(false);
        setIsAddingNote(true);
        setShowAddTask(false);
        setIsEditingNote(false);
        setIsEditingTask(false);
        setNoteForm({ name: '', title: '', content: '' });
    };

    const handleEditNoteClick = () => {
        setOpenMenu(false);

        const firstNote = note && note.length > 0 ? note[0] : null;

        setNoteForm({
            name: firstNote?.name || '',
            title: firstNote?.title || '',
            content: firstNote?.content || ''
        });
        setIsEditingNote(true);
        setIsAddingNote(false);
        setShowAddTask(false);
        setIsEditingTask(false);
    };

    // NEW: Handle clicking on existing note to edit
    const handleNoteClick = (noteItem: Note) => {
        setNoteForm({
            name: noteItem.name,
            title: noteItem.title,
            content: noteItem.content
        });
        setIsEditingNote(true);
        setIsAddingNote(false);
        setShowAddTask(false);
        setIsEditingTask(false);
    };

    // NEW: Handle clicking on existing task to edit
    const handleTaskClick = (taskItem: Task) => {
        const dueDate = taskItem.due_date ? taskItem.due_date.split(' ')[0] : '';
        setTaskForm({
            title: taskItem.title,
            description: taskItem.description,
            status: taskItem.status,
            priority: taskItem.priority,
            due_date: dueDate,
            assigned_to: taskItem.assigned_to
        });
        setShowAddTask(true);
        setIsEditingTask(true);
        setIsAddingNote(false);
        setIsEditingNote(false);
    };

    const handleTaskSubmit = async () => {
        if (!taskForm.title?.trim()) {
            return;
        }
        if (isEditingTask) {
            await handleEditTask();
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                doc: {
                    doctype: "CRM Task",
                    title: taskForm.title.trim(),
                    description: taskForm.description?.trim() || "",
                    status: taskForm.status || "Open",
                    priority: taskForm.priority || "Medium",
                    due_date: taskForm.due_date ? `${taskForm.due_date} 00:00:00` : null,
                    assigned_to: taskForm.assigned_to || null,
                    reference_doctype: call?.reference_doctype || "CRM Lead",
                    reference_docname: call?.id || null
                }
            };

            const response = await fetch('https://api.erpnext.ai/api/method/frappe.client.insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                showToast('Task created successfully', { type: 'success' }); // Add this line
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.message || 'Failed to create task');
            }

            const data = await response.json();
            console.log("Task created successfully:", data.message);

            try {
                const addToCallLogPayload = {
                    call_sid: call.name || "",
                    task: data.message
                };

                const addToCallLogResponse = await fetch('https://api.erpnext.ai/api/method/crm.integrations.api.add_task_to_call_log', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token,
                    },
                    body: JSON.stringify(addToCallLogPayload)
                });

                if (!addToCallLogResponse.ok) {
                    const errorData = await addToCallLogResponse.json();
                    console.error("API Error (add task to call log):", errorData);
                    throw new Error(errorData.message || 'Failed to link task to call log');
                }

                const newTask: Task = data.message;
                setTasks(prevTasks => [...prevTasks, newTask]);
                setTaskForm({ title: '', description: '', status: 'Open', priority: 'Medium', due_date: '', assigned_to: '' });
                setShowAddTask(false);
                onClose();
                if (onTaskCreated) onTaskCreated();
                if (fetchCallLogs) await fetchCallLogs();

                console.log("Successfully linked task to call log.");
            } catch (linkError: any) {
                console.warn("Warning: Task created but failed to link to call log:", linkError);
                showToast(linkError.message || 'Failed to create task', { type: 'error' });
            }

        } catch (error: any) {
            console.error("Error in task submission:", error);
            showToast(error.message || 'Failed to create task', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNoteSubmit = () => {
        if (isEditingNote) {
            handleEditNote();
        } else {
            handleAddNote();
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const session = getUserSession();
                const sessionCompany = session?.company;
                const response = await apiAxios.post(
                    '/api/method/frappe.desk.search.search_link',
                    {
                        txt: "",
                        doctype: "User",
                        filters: sessionCompany ? { company: sessionCompany } : null
                    },
                    {
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const data = response.data;
                const options = data.message.map((item: { value: string; description: string; }) => ({
                    value: item.value,
                    label: item.description
                }));

                setUserOptions(options);
            } catch (err) {
                console.error('Error fetching users:', err);
                showToast('Failed to load user list', { type: 'error' });
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            <div className={`relative rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>

                <div className="absolute top-0 right-0 flex items-center gap-2 p-4">
                    <button
                        type="button"
                        className={`${theme === "dark" ? "text-white" : "text-gray-500"} hover:text-gray-700 dark:hover:text-white`}
                        onClick={toggleMenu}
                    >
                        <PiDotsThreeOutlineFill size={24} />
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        title="Edit"
                        className={`${theme === "dark" ? "text-white" : "text-gray-500"} hover:text-gray-700 dark:hover:text-white`}
                    >
                        <SquarePen className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className={`${theme === "dark" ? "text-white" : "text-gray-500"} hover:text-gray-700 dark:hover:text-white`}
                        onClick={onClose}
                    >
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                {openMenu && (
                    <div
                        className="absolute top-12 right-4 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Tasks Section */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            {tasks && tasks.length > 0 ? (
                                <button
                                    onClick={handleEditTaskClick}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                    <FaRegCheckCircle className="w-4 h-4 text-gray-600 dark:text-white" />
                                    <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Edit Task</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddTaskClick}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                    <FaRegCheckCircle className="w-4 h-4 text-gray-600 dark:text-white" />
                                    <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Add Task</span>
                                </button>
                            )}
                        </div>

                        {/* Notes Section */}
                        <div>
                            {note && note.length > 0 ? (
                                <button
                                    onClick={handleEditNoteClick}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                    <IoDocumentTextOutline className="w-4 h-4 text-gray-600 dark:text-white" />
                                    <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Edit Note</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddNoteClick}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                    <IoDocumentTextOutline className="w-4 h-4 text-gray-600 dark:text-white" />
                                    <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Add Note</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-6 pt-12">
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {showAddTask ? (isEditingTask ? 'Edit Task' : 'Create Task') :
                            isAddingNote || isEditingNote ? (isEditingNote ? 'Edit Note' : 'Create Note') : 'Call Details'}
                    </h3>

                    {showAddTask ? (
                        <>
                            {/* Task Form */}
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    placeholder="Task title"
                                    className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${theme === 'dark'
                                        ? 'bg-gray-800 border  border-gray-600 text-white'
                                        : 'bg-gray-100 border border-gray-300 placeholder:!text-gray-600 !text-black'
                                        }`}
                                />
                            </div>

                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Description
                                </label>
                                <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    placeholder="Task description"
                                    rows={4}
                                    className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${theme === 'dark'
                                        ? 'bg-gray-800 border  border-gray-600 text-white'
                                        : 'bg-gray-100 border border-gray-300 placeholder:!text-gray-600 !text-black'
                                        }`}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Status
                                    </label>
                                    <select
                                        value={taskForm.status}
                                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                                        className={`w-full px-2 py-2 rounded-lg ${theme === 'dark'
                                            ? 'bg-gray-800 border border-gray-600 text-white'
                                            : 'bg-gray-100 border border-gray-300 text-gray-900'
                                            }`}
                                    >
                                        <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } border`} value="Open">Open</option>
                                        <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } border`} value="Todo">Todo</option>
                                        <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } border`} value="In Progress">In Progress</option>
                                        <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } border`} value="Done">Done</option>
                                        <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } border`} value="Canceled">Canceled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Priority
                                    </label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                        className={`w-full px-2 py-2 rounded-lg ${theme === 'dark'
                                            ? 'bg-gray-800 border border-gray-600 text-white'
                                            : 'bg-gray-100 border border-gray-300 text-gray-900'
                                            }`}
                                    >
                                        <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } border`} value="Low">Low</option>
                                        <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } border`} value="Medium">Medium</option>
                                        <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } border`} value="High">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={taskForm.due_date}
                                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white [color-scheme:dark]'
                                            : 'bg-white border-gray-300 text-gray-900 [color-scheme:light]'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Assigned To
                                    </label>
                                    <select
                                        value={taskForm.assigned_to}
                                        onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                                            ? 'bg-gray-800 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                    >
                                        <option value="" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                                            Select Assignee
                                        </option>
                                        {userOptions.map((user) => (
                                            <option key={user.value} value={user.value} style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                                                {user.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={handleTaskSubmit}
                                    disabled={!taskForm.title || isLoading}
                                    className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${theme === 'dark'
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white '
                                        : 'bg-blue-600 hover:bg-blue-700 text-white '
                                        } disabled:cursor-not-allowed`}
                                >
                                    {isLoading ? 'Processing...' : (isEditingTask ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </>
                    ) : isAddingNote || isEditingNote ? (
                        <>
                            {/* Note Form */}
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={noteForm.title}
                                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                    placeholder="Call with John Doe"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                                        ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                                        }`}
                                />
                            </div>

                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Content
                                </label>
                                <textarea
                                    value={noteForm.content}
                                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                    placeholder="Took a call with John Doe and discussed the new project"
                                    rows={6}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                                        ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                                        }`}
                                />
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={handleNoteSubmit}
                                    disabled={!noteForm.title || isLoading}
                                    className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${theme === 'dark'
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white '
                                        : 'bg-blue-600 hover:bg-blue-700 text-white '
                                        } disabled:cursor-not-allowed`}
                                >
                                    {isLoading ? 'Processing...' : (isEditingNote ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </>
                    ) : (
                        // Call Details View with Notes and Tasks
                        <div className="space-y-6">
                            <div className="space-y-4">
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

                                {call.reference_doctype && (
                                    <div
                                        onClick={() => onOpenReference && onOpenReference(call)}
                                        className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        <FaUserFriends className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                                        {call.reference_doctype}
                                        <GoArrowUpRight />
                                    </div>)}

                                <div className="flex items-center gap-2">
                                    <FaRegClock className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{call.date}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <LuTimer className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{call.duration}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <BsCheckCircle className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{call.status}</span>
                                </div>
                            </div>

                            {note.length > 0 && (
                                <div className="border-t pt-4 border-gray-200 dark:border-gray-700 space-y-3">
                                    <h3 className={`text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        Notes
                                    </h3>
                                    {note.map((noteItem) => (
                                        <div
                                            key={noteItem.name}
                                            className={`flex items-start gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} cursor-pointer hover:opacity-80 transition-opacity`}
                                            onClick={() => handleNoteClick(noteItem)}
                                        >
                                            <IoDocumentTextOutline className={`w-5 h-5 mt-1 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                            <div className="flex-1">
                                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                    {noteItem.title}
                                                </h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {noteItem.content.replace(/<p>|<\/p>/g, '')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {tasks.length > 0 && (
                                <div className="border-t pt-4 border-gray-200 dark:border-gray-700 space-y-3">
                                    <h3 className={`text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        Tasks
                                    </h3>
                                    {tasks.map((taskItem) => (
                                        <div
                                            key={taskItem.name}
                                            className={`flex items-start gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} cursor-pointer hover:opacity-80 transition-opacity`}
                                            onClick={() => handleTaskClick(taskItem)}
                                        >
                                            <SiTicktick className={`w-5 h-5 mt-1 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                            <div className="flex-1">
                                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                    {taskItem.title}
                                                </h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {taskItem.description.replace(/<p>|<\/p>/g, '')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};