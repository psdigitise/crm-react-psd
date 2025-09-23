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

interface CallDetailsPopupProps {
    onClose: () => void;
    theme?: 'light' | 'dark';
    call: {
        type: string;
        activity_type: string;
        caller: string;
        receiver: string;
        reference_doctype: string;
        date: string;
        duration: string;
        status: string;
        id?: string;
    };
    onEdit?: () => void;
    onTaskCreated?: () => void;
}

interface Note {
    name: string;
    title: string;
    content: string;
    creation: string;
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

const AUTH_TOKEN = "token 1b670b800ace83b:f32066fea74d0fe";

export const CallDetailsPopup = ({ onClose, theme = 'light', call, onEdit, onTaskCreated }: CallDetailsPopupProps) => {
    const [openMenu, setOpenMenu] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [note, setNote] = useState<Note | null>(null);
    const [task, setTask] = useState<Task | null>(null);
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

    // Fetch existing notes and tasks when the component mounts
    useEffect(() => {
        fetchNotes();
        fetchTasks();
    }, [call.id]);

    const fetchNotes = async () => {
        if (!call.id) return;

        try {
            const response = await fetch(`http://103.214.132.20:8002/api/resource/FCRM Note?filters=[["reference_docname","=","${call.id}"]]`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN,
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    const noteData = data.data[0];
                    setNote({
                        name: noteData.name,
                        title: noteData.title || "Untitled Note",
                        content: noteData.content || "",
                        creation: noteData.creation || new Date().toISOString()
                    });
                } else {
                    setNote(null);
                }
            } else {
                console.error("Failed to fetch notes:", response.status);
                setNote(null);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
            setNote(null);
        }
    };

    const fetchTasks = async () => {
        if (!call.id) return;

        try {
            const response = await fetch(`http://103.214.132.20:8002/api/resource/CRM Task?filters=[["reference_docname","=","${call.id}"]]`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN,
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    const taskData = data.data[0];
                    setTask({
                        name: taskData.name,
                        title: taskData.title || "Untitled Task",
                        description: taskData.description || "",
                        status: taskData.status || "Open",
                        priority: taskData.priority || "Medium",
                        due_date: taskData.due_date || "",
                        assigned_to: taskData.assigned_to || "",
                        creation: taskData.creation || new Date().toISOString()
                    });
                } else {
                    setTask(null);
                }
            } else {
                console.error("Failed to fetch tasks:", response.status);
                setTask(null);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setTask(null);
        }
    };

    const handleAddNote = async () => {
        if (!noteForm.title) return;

        setIsLoading(true);
        try {
            const payload = {
                call_sid: call.id || "",
                note: {
                    doctype: "FCRM Note",
                    title: noteForm.title,
                    content: noteForm.content,
                    reference_doctype: call.reference_doctype || "CRM Lead",
                    reference_docname: call.id || ""
                }
            };

            const response = await fetch('http://103.214.132.20:8002/api/method/crm.integrations.api.add_note_to_call_log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.message || 'Failed to create note');
            }

            const data = await response.json();
            const newNote: Note = {
                name: data.message.name,
                title: data.message.title || noteForm.title,
                content: data.message.content || noteForm.content,
                creation: data.message.creation || new Date().toISOString()
            };

            setNote(newNote);
            setNoteForm({ name: '', title: '', content: '' });
            setIsAddingNote(false);

        } catch (error) {
            console.error("Error creating note:", error);
            const mockNote = {
                name: `NOTE-${Math.floor(Math.random() * 1000)}`,
                title: noteForm.title,
                content: noteForm.content,
                creation: new Date().toISOString()
            };
            setNote(mockNote);
            setNoteForm({ name: '', title: '', content: '' });
            setIsAddingNote(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditNote = async () => {
        if (!noteForm.title || !note) return;

        setIsLoading(true);
        try {
            const payload = {
                doctype: "FCRM Note",
                name: note.name,
                fieldname: {
                    title: noteForm.title,
                    content: noteForm.content
                }
            };

            const response = await fetch('http://103.214.132.20:8002/api/method/frappe.client.set_value', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to update note');
            }

            const updatedNote: Note = {
                name: note.name,
                title: noteForm.title,
                content: noteForm.content,
                creation: note.creation
            };

            setNote(updatedNote);
            setNoteForm({ name: '', title: '', content: '' });
            setIsEditingNote(false);

        } catch (error) {
            console.error("Error updating note:", error);
            const updatedNote = {
                name: note.name,
                title: noteForm.title,
                content: noteForm.content,
                creation: note.creation
            };
            setNote(updatedNote);
            setNoteForm({ name: '', title: '', content: '' });
            setIsEditingNote(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditTask = async () => {
        if (!taskForm.title || !task) return;

        setIsLoading(true);
        try {
            const payload = {
                doctype: "CRM Task",
                name: task.name,
                fieldname: {
                    title: taskForm.title,
                    description: taskForm.description,
                    status: taskForm.status,
                    priority: taskForm.priority,
                    due_date: taskForm.due_date,
                    assigned_to: taskForm.assigned_to
                }
            };

            const response = await fetch('http://103.214.132.20:8002/api/method/frappe.client.set_value', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTask: Task = {
                name: task.name,
                title: taskForm.title,
                description: taskForm.description,
                status: taskForm.status,
                priority: taskForm.priority,
                due_date: taskForm.due_date,
                assigned_to: taskForm.assigned_to,
                creation: task.creation
            };

            setTask(updatedTask);
            setTaskForm({
                title: '',
                description: '',
                status: 'Open',
                priority: 'Medium',
                due_date: '',
                assigned_to: ''
            });
            setIsEditingTask(false);

        } catch (error) {
            console.error("Error updating task:", error);
            const updatedTask = {
                name: task.name,
                title: taskForm.title,
                description: taskForm.description,
                status: taskForm.status,
                priority: taskForm.priority,
                due_date: taskForm.due_date,
                assigned_to: taskForm.assigned_to,
                creation: task.creation
            };
            setTask(updatedTask);
            setTaskForm({
                title: '',
                description: '',
                status: 'Open',
                priority: 'Medium',
                due_date: '',
                assigned_to: ''
            });
            setIsEditingTask(false);
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

        if (task) {
            setTaskForm({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                due_date: task.due_date,
                assigned_to: task.assigned_to
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
        setNoteForm({
            name: note?.name || '',
            title: note?.title || '',
            content: note?.content || ''
        });
        setIsEditingNote(true);
        setIsAddingNote(false);
        setShowAddTask(false);
        setIsEditingTask(false);
    };

    const handleTaskSubmit = async () => {
        if (!taskForm.title?.trim()) {
            return;
        }

        setIsLoading(true);

        try {
            if (isEditingTask && task) {
                await handleEditTask();
                return;
            }

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

            const response = await fetch('http://103.214.132.20:8002/api/method/frappe.client.insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.message || 'Failed to create task');
            }

            const data = await response.json();
            console.log("Task created successfully:", data.message);

            // Update local state with the Create Task
            const newTask: Task = {
                name: data.message.name,
                title: data.message.title || taskForm.title,
                description: data.message.description || taskForm.description,
                status: data.message.status || taskForm.status,
                priority: data.message.priority || taskForm.priority,
                due_date: data.message.due_date || taskForm.due_date,
                assigned_to: data.message.assigned_to || taskForm.assigned_to,
                creation: data.message.creation || new Date().toISOString()
            };

            setTask(newTask);
            setTaskForm({
                title: '',
                description: '',
                status: 'Open',
                priority: 'Medium',
                due_date: '',
                assigned_to: ''
            });
            setShowAddTask(false);

            if (onTaskCreated) {
                onTaskCreated();
            }

        } catch (error) {
            console.error("Error in task submission:", error);
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-800';
            case 'Todo': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-purple-100 text-purple-800';
            case 'Done': return 'bg-green-100 text-green-800';
            case 'Canceled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>

                {/* Top right controls */}
                <div className="absolute top-0 right-0 flex items-center gap-2 p-4">
                    <button
                        type="button"
                        className={`${theme === "dark" ? "text-white" : "text-gray-500"} hover:text-gray-700`}
                        onClick={toggleMenu}
                    >
                        <PiDotsThreeOutlineFill size={24} />
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        title="Edit"
                        className={`${theme === "dark" ? "text-white" : "text-gray-500"} hover:text-gray-700`}
                    >
                        <SquarePen className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className={`${theme === "dark" ? "text-white" : "text-gray-500"} hover:text-gray-700`}
                        onClick={onClose}
                    >
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                {/* Dropdown menu */}
                {openMenu && (
                    <div
                        className="absolute top-12 right-4 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {task ? (
                            <button
                                onClick={handleEditTaskClick}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                                <FaRegCheckCircle className="w-4 h-4 text-gray-600 dark:text-white" />
                                <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Edit Task</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleAddTaskClick}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                                <FaRegCheckCircle className="w-4 h-4 text-gray-600 dark:text-white" />
                                <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Add Task</span>
                            </button>
                        )}

                        <div className="flex justify-between items-center">
                            {note ? (
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

                {/* Modal Content */}
                <div className="p-6 pt-12">
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {showAddTask ? (isEditingTask ? 'Edit Task' : 'Create Task') :
                            isAddingNote || isEditingNote ? (isEditingNote ? 'Edit Note' : 'Create Note') : 'Call Details'}
                    </h3>

                    {showAddTask ? (
                        <>
                            {/* Task Form */}
                            {/* Title */}
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
                                        ? 'bg-gray-800 border border-gray-600 text-white'
                                        : 'bg-gray-100 border border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>

                            {/* Description */}
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
                                        ? 'bg-gray-800 border border-gray-600 text-white'
                                        : 'bg-gray-100 border border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>

                            {/* Fields Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                {/* Status */}
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
                                        <option value="Open">Open</option>
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                        <option value="Canceled">Canceled</option>
                                    </select>
                                </div>

                                {/* Priority */}
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
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                {/* Due Date */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={taskForm.due_date}
                                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                        className={`w-full px-2 py-2 rounded-lg ${theme === 'dark'
                                            ? 'bg-gray-800 border border-gray-600 text-white'
                                            : 'bg-gray-100 border border-gray-300 text-gray-900'
                                            }`}
                                    />
                                </div>

                                {/* Assigned To */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Assigned To
                                    </label>
                                    <select
                                        value={taskForm.assigned_to}
                                        onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                                        className={`w-full px-2 py-2 rounded-lg ${theme === 'dark'
                                            ? 'bg-gray-800 border border-gray-600 text-white'
                                            : 'bg-gray-100 border border-gray-300 text-gray-900'
                                            }`}
                                    >
                                        <option value="">Select Assignee</option>
                                        <option value="hari@psd123.com">Hari</option>
                                        <option value="arun@psd.com">Arun</option>
                                        <option value="demo@psdigitise.com">Demo</option>
                                        <option value="fen87joshi@yahoo.com">Feni</option>
                                        <option value="fenila@psd.com">Fenila</option>
                                        <option value="mx.techies@gmail.com">MX Techies</option>
                                        <option value="prasad@psd.com">Prasad</option>
                                    </select>
                                </div>
                            </div>

                            {/* Create Button */}
                            <div className="mt-4">
                                <button
                                    onClick={handleTaskSubmit}
                                    disabled={!taskForm.title || isLoading}
                                    className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Processing...' : (isEditingTask ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </>
                    ) : isAddingNote || isEditingNote ? (
                        <>
                            {/* Note Form */}
                            {/* Title */}
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={noteForm.title}
                                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                    placeholder="Call with John Doe"
                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${theme === 'dark'
                                        ? 'bg-gray-800 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Content
                                </label>
                                <textarea
                                    value={noteForm.content}
                                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                    placeholder="Took a call with John Doe and discussed the new project"
                                    rows={6}
                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${theme === 'dark'
                                        ? 'bg-gray-800 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>

                            {/* Create Button */}
                            <div className="mt-4">
                                <button
                                    onClick={handleNoteSubmit}
                                    disabled={!noteForm.title || isLoading}
                                    className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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

                                <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <FaUserFriends className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                                    {call.reference_doctype || "No reference type"}
                                    <GoArrowUpRight />
                                </div>

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


                            {/* Notes Section */}
                            {note && (
                                <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
                                    <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Notes
                                    </h4>
                                    <div className="space-y-3">
                                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {note.title}
                                                </h5>
                                            </div>
                                            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {note.content}
                                            </p>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatDate(note.creation)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tasks Section */}

                            {task && (
                                <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
                                    <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Tasks
                                    </h4>
                                    <div className="space-y-3">
                                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {task.title}
                                                </h5>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {task.description}
                                            </p>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                                    {task.priority} Priority
                                                </span>
                                                {task.due_date && (
                                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            {task.assigned_to && (
                                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Assigned to: {task.assigned_to}
                                                </p>
                                            )}
                                            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Created: {formatDate(task.creation)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};