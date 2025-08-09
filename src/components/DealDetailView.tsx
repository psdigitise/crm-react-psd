import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Activity, FileText, Phone, MessageSquare, CheckSquare, Send, Plus, Loader2, Mail, Trash2, Reply, Paperclip } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import EmailComposer from './EmailComposer';
import { FaCircleDot, FaRegComment } from 'react-icons/fa6';
import { Listbox } from '@headlessui/react';
import { HiOutlineMailOpen, HiOutlinePlus } from 'react-icons/hi';
import { IoCloseOutline, IoDocument, IoLockClosedOutline, IoLockOpenOutline } from 'react-icons/io5';
import { LuCalendar, LuReply, LuReplyAll, LuUpload } from 'react-icons/lu';
import { PiDotsThreeOutlineBold } from 'react-icons/pi';
import { TiDocumentText } from 'react-icons/ti';
import { apiAxios, AUTH_TOKEN } from '../api/apiUrl';
import axios from 'axios';
import Select from 'react-select';
import { darkSelectStyles } from '../components/Dropdownstyles/darkSelectStyles'
import { getUserSession } from '../utils/session';
import UploadAttachmentPopup from './DealsAttachmentPopups/AddAttachmentPopups';
import React from 'react';
import { DeleteAttachmentPopup } from './DealsAttachmentPopups/DeleteAttachmentPopup';
import { AttachmentPrivatePopup } from './DealsAttachmentPopups/AttachmnetPrivatePopup';
import { BsThreeDots } from "react-icons/bs";
import { DeleteTaskPopup } from './TaskPopups/DeleteTaskPopups';


export interface Deal {
  id: string;
  name: string;
  organization: string;
  status: 'Qualification' | 'Demo/Making' | 'Proposal/Quotation' | 'Negotiation';
  email: string;
  mobileNo: string;
  assignedTo: string;
  lastModified: string;
  annualRevenue: string;
  organization_name?: string;
  website?: string;
  no_of_employees?: string;
  territory?: string;
  annual_revenue?: string;
  industry?: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  mobile_no?: string;
  gender?: string;
  deal_owner?: string;
  close_date?: string;
  probability?: string;
  next_step?: string;

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

interface CallLog {
  name: string;
  from: string;
  to: string;
  status: string;
  type: string;
  duration: string;
  reference_doctype: string;
  reference_name: string;
  creation: string;
  owner: string;
}
interface Comment {
  name: string;
  content: string;
  comment_type: string;
  reference_doctype: string;
  reference_name: string;
  creation: string;
  owner: string;
  attachments?: {
    name: string;
    file_name: string;
    file_url: string;
    is_private: number;
    file_type?: string;
    file_size?: number;
  }[];
}
interface Task {
  name: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  assigned_to: String;
  modified: String;
  due_date: string;
  reference_doctype: string;
  reference_docname: string;
  creation: string;
  owner: string;
}
interface Email {
  name: string;
  sender: string;
  recipients: { recipient: string; status: string }[];
  message: string;
  //creation: string;
}
interface DealDetailViewProps {
  deal: Deal;
  onBack: () => void;
  onSave: (updatedDeal: Deal) => void;
}
interface ActivityItem {
  id: string;
  type: 'note' | 'call' | 'comment' | 'task' | 'edit';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  icon: React.ReactNode;
  color: string;
}

interface Email {
  id: string;
  subject: string;
  from: string;
  fromName: string;
  sender: string;
  to: string;
  cc?: string;
  bcc?: string;
  content: string;
  date: string;
  attachments: Array<{
    name: string;
    file_name: string;
    file_type: string;
    file_url: string;
    file_size: number;
    is_private: number;
  }>;
  delivery_status: string;
  creation: string;
}

interface TaskForm {
  title: string;
  description: string;
  status: string;
  priority: string;
  start_date?: string;  // Make it optional
  due_date: string;
  assigned_to: string;
}

type TabType = 'overview' | 'activity' | 'notes' | 'calls' | 'comments' | 'tasks' | 'emails' | 'attachments';

const commentTypes = [
  'Comment',
  'Like',
  'Info',
  'Label',
  'Workflow',
  'Created',
  'Submitted',
  'Cancelled',
  'Updated',
  'Deleted',
  'Assigned',
  'Assignment Completed',
  'Attachment',
  'Attachment Removed',
  'Shared',
  'Unshared',
  'Bot',
  'Relinked',
  'Edit'
];



export function DealDetailView({ deal, onBack, onSave }: DealDetailViewProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeal, setEditedDeal] = useState<Deal>(deal);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Data states
  const [notes, setNotes] = useState<Note[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);

  // Loading states
  const [notesLoading, setNotesLoading] = useState(false);
  const [callsLoading, setCallsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  //popup for all add
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [CommentModalMode, setCommentModalMode] = useState("comment"); // "reply" or "comment"
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  // const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState("reply"); // "reply" or "comment"
  // Add to state variables
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const userSession = getUserSession();
  const Username = userSession?.username || "Administrator";
  // Form states
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: ''
  });

  const [callForm, setCallForm] = useState({
    from: '',
    to: '',
    status: 'Ringing',
    type: 'Outgoing',
    duration: ''
  });

  const [commentForm, setCommentForm] = useState({
    content: '',
    comment_type: 'Comment'
  });

  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    start_date: '',  // Include here if keeping it
    due_date: '',
    assigned_to: ''
  });
  const [emailForm, setEmailForm] = useState({
    recipient: '',
    message: ''
  });

  const tabs = [
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'emails', label: 'Emails', icon: HiOutlineMailOpen },
    { id: 'comments', label: 'Comments', icon: FaRegComment },
    { id: 'overview', label: 'Data', icon: TiDocumentText },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'attachments', label: 'Attachments', icon: Paperclip },

    // { id: 'attachments', label: 'Attachments', icon: <Paperclip className="w-4 h-4" /> },
  ];

  // Updated color scheme variables
  const bgColor = theme === 'dark'
    ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
    : 'bg-gray-50';

  const cardBgColor = theme === 'dark'
    ? 'bg-white dark:bg-gray-900 border-white'
    : 'bg-white';

  const borderColor = theme === 'dark'
    ? 'border-white'
    : 'border-gray-200';

  const textColor = theme === 'dark'
    ? 'text-white'
    : 'text-gray-900';

  const textSecondaryColor = theme === 'dark'
    ? 'text-white'
    : 'text-gray-500';

  const inputBgColor = theme === 'dark'
    ? 'bg-white-31 text-white'
    : 'bg-white';

  const buttonBgColor = theme === 'dark'
    ? 'bg-purplebg hover:bg-purple-700'
    : 'bg-blue-600 hover:bg-blue-700';

  const secondaryButtonBgColor = theme === 'dark'
    ? 'border border-purple-500/30 hover:bg-purple-800/50'
    : 'border border-gray-300 hover:bg-gray-50';

  const handleInputChange = (field: keyof Deal, value: string) => {
    setEditedDeal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    try {


      const response = await fetch(
        'http://103.214.132.20:8002/api/method/crm.api.activities.get_activities',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: deal.name
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Notes are in the third array of the message array
        const notesData = result.message[2] || [];

        // Transform the notes data to match your Note interface
        const formattedNotes = notesData.map((note: any) => ({
          name: note.name,
          title: note.title,
          content: note.content,
          reference_doctype: 'CRM Deal',
          reference_docname: deal.name,
          creation: note.modified, // Using modified since creation isn't in the response
          owner: note.owner
        }));

        setNotes(formattedNotes);
      } else {
        throw new Error('Failed to fetch notes');
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      // showToast.error("Failed to fetch notes");
    } finally {
      setNotesLoading(false);
    }
  }, [deal.name]);

  const fetchCallLogs = useCallback(async () => {
    setCallsLoading(true);
    try {
      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/CRM Call Log?fields=["name","from","to","status","type","duration","creation","owner"]&filters=[["reference_doctype","=","CRM Deal"],["reference_docname","=","${deal.name}"]]`,
        {
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCallLogs(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
      showToast('Failed to fetch call logs', { type: 'error' });
    } finally {
      setCallsLoading(false);
    }
  }, [deal.name]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const url = 'http://103.214.132.20:8002/api/method/crm.api.activities.get_activities';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: deal.name
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Extract the comments from the response
        const activities = result.message[0] || [];
        const comments = activities
          .filter((activity: { activity_type: string; }) => activity.activity_type === 'comment')
          .map((comment: { name: any; content: any; creation: any; owner: any; attachments: any[]; }) => ({
            name: comment.name,
            content: comment.content,
            comment_type: 'Comment',
            creation: comment.creation,
            owner: comment.owner,
            attachments: comment.attachments?.map((att: any) => ({
              name: att.name,
              file_name: att.file_name,
              file_url: att.file_url,
              is_private: att.is_private,
              file_type: att.file_type,
              file_size: att.file_size
            }))
          }));
        setComments(comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showToast('Failed to fetch comments', { type: 'error' });
    } finally {
      setCommentsLoading(false);
    }
  }, [deal.name]);

  // const fetchTasks = useCallback(async () => {
  //   setTasksLoading(true);
  //   try {
  //     const response = await fetch(
  //       `http://103.214.132.20:8002/api/v2/document/CRM Task?fields=["name","title","description","status","priority","start_date","due_date","creation","owner"]&filters=[["reference_doctype","=","CRM Deal"],["reference_docname","=","${deal.name}"]]`,
  //       {
  //         headers: {
  //           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );

  //     if (response.ok) {
  //       const result = await response.json();
  //       setTasks(result.data || []);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching tasks:', error);
  //     showToast('Failed to fetch tasks', { type: 'error' });
  //   } finally {
  //     setTasksLoading(false);
  //   }
  // }, [deal.name]);

  const fetchTasks = useCallback(async () => {
    setNotesLoading(true);
    try {
      const response = await fetch(
        'http://103.214.132.20:8002/api/method/crm.api.activities.get_activities',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: deal.name // e.g. "CRM-DEAL-2025-00060"
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        // The tasks seem to be in result.message[3] based on the sample response
        setTasks(result.message[3] || []);
      }
    } catch (error) {
      console.error('Error fetching task notes:', error);
      showToast('Failed to fetch task notes', { type: 'error' });
    } finally {
      setNotesLoading(false);
    }
  }, [deal.name]);

  const fetchEmails = useCallback(async () => {
    setEmailsLoading(true);
    try {
      const response = await fetch(
        `http://103.214.132.20:8002/api/method/crm.api.activities.get_activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: deal.name
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Filter only email communications from the first array in message
        const emailCommunications = result.message[0]
          .filter(item => item.activity_type === 'communication' &&
            item.communication_type === 'Communication' &&
            (item.communication_medium === 'Email' || item.data?.delivery_status))
          .map(email => ({
            id: email.name || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            subject: email.data?.subject || 'No Subject',
            from: email.data?.sender || 'Unknown Sender',
            fromName: email.data?.sender_full_name || 'Unknown',
            to: email.data?.recipients || '',
            cc: email.data?.cc || '',
            bcc: email.data?.bcc || '',
            content: email.data?.content || '',
            creation: email.creation,
            date: email.creation,
            attachments: email.data?.attachments || [],
            delivery_status: email.data?.delivery_status || 'Unknown'
          }));

        setEmails(emailCommunications);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      showToast('Failed to fetch emails', { type: 'error' });
    } finally {
      setEmailsLoading(false);
    }
  }, [deal.name]);


  useEffect(() => {
    if (activeTab === 'notes') fetchNotes();
    if (activeTab === 'calls') fetchCallLogs();
    if (activeTab === 'comments') fetchComments();
    if (activeTab === 'tasks') fetchTasks();
    if (activeTab === 'emails') fetchEmails();
  }, [activeTab, fetchNotes, fetchCallLogs, fetchComments, fetchTasks, fetchEmails]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const addNote = async () => {

    setNotesLoading(true);
    try {
      const response = await apiAxios.post(
        '/api/method/frappe.client.insert',
        {
          doc: {
            doctype: "FCRM Note",
            title: noteForm.title,
            content: noteForm.content,
            reference_doctype: "CRM Deal",
            reference_docname: deal.name
          }
        },
        {
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setNoteForm({ title: '', content: '' });
        setShowNoteModal(false);
        await fetchNotes();  // Refresh the notes list
      } else {
        throw new Error(response.data.message || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const editNote = async () => {
    if (!noteForm.title.trim()) {
      showToast('Title is required', { type: 'error' });
      return false;
    }

    setNotesLoading(true);
    try {
      const response = await apiAxios.post(
        '/api/method/frappe.client.set_value',
        {
          doctype: "FCRM Note",
          name: noteForm.name, // The document ID to update
          fieldname: {
            title: noteForm.title,
            content: noteForm.content,
            //   modified: "2025-08-09 13:05:15.210597"
            //   name: "08unvfprli"
            //  owner: "mx.techies@gmail.com"
          }
        },
        {
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.message) {
        setNoteForm({ title: '', content: '', name: '' });
        await fetchNotes();
        return true;
      } else {
        showToast('Failed to update note', { type: 'error' });
        return false;
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Failed to update note',
        { type: 'error' }
      );
      return false;
    } finally {
      setNotesLoading(false);
    }
  };

  const deleteNote = async (name: string) => {
    setNotesLoading(true);
    try {
      const response = await apiAxios.post(
        '/api/method/frappe.client.delete',
        {
          doctype: "FCRM Note",
          name: name
        },
        {
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        await fetchNotes(); // Refresh the notes list
      } else {
        throw new Error(response.data?.message || 'Failed to delete note');
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  const addCall = async () => {
    if (!callForm.from.trim() || !callForm.to.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    setCallsLoading(true);
    try {
      // Step 1: Fetch the latest ID
      const latest = await fetch('http://103.214.132.20:8002/api/resource/CRM Call Log?fields=["id"]&order_by=id desc&limit=1', {
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
          'Content-Type': 'application/json'
        }
      });

      const latestData = await latest.json();
      const nextId = (latestData.data?.[0]?.id || 0) + 1;

      // Step 2: Create new Call Log
      const response = await fetch('http://103.214.132.20:8002/api/v2/document/CRM Call Log', {
        method: 'POST',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: nextId,
          from: callForm.from,
          to: callForm.to,
          status: callForm.status,
          type: callForm.type,
          duration: callForm.duration,
          reference_doctype: 'CRM Deal',
          reference_docname: deal.name
        })
      });

      if (response.ok) {
        showToast('Call log added successfully', { type: 'success' });
        setCallForm({
          from: '',
          to: '',
          status: 'Ringing',
          type: 'Outgoing',
          duration: ''
        });
        await fetchCallLogs();
      } else {
        throw new Error('Failed to add call log');
      }
    } catch (error) {
      console.error('Error adding call log:', error);
      showToast('Failed to add call log', { type: 'error' });
    } finally {
      setCallsLoading(false);
    }
  };


  const editCall = async () => {
    if (!callForm.from.trim() || !callForm.to.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return false;
    }

    setCallsLoading(true);
    try {
      const response = await fetch(`http://103.214.132.20:8002/api/v2/document/CRM Call Log/${callForm.name}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: callForm.from,
          to: callForm.to,
          status: callForm.status,
          type: callForm.type,
          duration: callForm.duration,
        })
      });

      if (response.ok) {
        showToast('Call log updated successfully', { type: 'success' });
        setCallForm({
          from: '',
          to: '',
          status: 'Ringing',
          type: 'Outgoing',
          duration: '',
          name: ''
        });
        await fetchCallLogs();
        return true;
      } else {
        showToast('Failed to update call log', { type: 'error' });
        return false;
      }
    } catch (error) {
      showToast('Failed to update call log', { type: 'error' });
      return false;
    } finally {
      setCallsLoading(false);
    }
  };

  const deleteCall = async (name) => {
    if (!window.confirm('Are you sure you want to delete this call log?')) return;
    setCallsLoading(true);
    try {
      const response = await fetch(`http://103.214.132.20:8002/api/v2/document/CRM Call Log/${name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        showToast('Call log deleted', { type: 'success' });
        await fetchCallLogs();
      } else {
        showToast('Failed to delete call log', { type: 'error' });
      }
    } catch (error) {
      showToast('Failed to delete call log', { type: 'error' });
    } finally {
      setCallsLoading(false);
    }
  };

  const addTask = async () => {
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    setTasksLoading(true);
    try {
      const response = await apiAxios.post(
        '/api/method/frappe.client.insert',
        {
          doc: {
            doctype: "CRM Task",
            reference_doctype: "CRM Deal",
            reference_docname: deal.name,
            title: taskForm.title,
            description: taskForm.description,
            assigned_to: taskForm.assigned_to,
            due_date: taskForm.due_date ? `${taskForm.due_date} 23:59:59` : null,
            priority: taskForm.priority,
            status: taskForm.status
          }
        },
        {
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setShowTaskModal(false);
        setTaskForm({
          title: '',
          description: '',
          status: 'Open',
          priority: 'Medium',
          start_date: '',
          due_date: '',
          assigned_to: ''
        });
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
      showToast(
        error.response?.data?.message ||
        error.message ||
        'Failed to add task',
        { type: 'error' }
      );
    } finally {
      setTasksLoading(false);
    }
  };

  const editTask = async (taskName) => {
    if (!taskForm.title.trim()) {
      showToast('Title is required', { type: 'error' });
      return false;
    }

    setTasksLoading(true);
    try {
      const response = await fetch(
        'http://103.214.132.20:8002/api/method/frappe.client.set_value',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doctype: "CRM Task",
            name: taskName,
            fieldname: {
              name: taskName,
              title: taskForm.title,
              description: taskForm.description,
              assigned_to: taskForm.assigned_to,
              due_date: taskForm.due_date ? `${taskForm.due_date} 00:00:00` : null,
              priority: taskForm.priority,
              status: taskForm.status
            }
          })
        }
      );

      if (response.ok) {
        await fetchTasks(); // Refresh the task list
        return true;
      } else {
        showToast('Failed to update task', { type: 'error' });
        return false;
      }
    } catch (error) {
      showToast('Failed to update task', { type: 'error' });
      return false;
    } finally {
      setTasksLoading(false);
    }
  };


  const deleteTask = async (name) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setTasksLoading(true);
    try {
      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/CRM Task/${name}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        showToast('Task deleted', { type: 'success' });
        await fetchTasks();
      } else {
        showToast('Failed to delete task', { type: 'error' });
      }
    } catch (error) {
      showToast('Failed to delete task', { type: 'error' });
    } finally {
      setTasksLoading(false);
    }
  };


  const statusColors: Record<Deal['status'], string> = {
    Qualification: 'text-yellow-500',
    'Demo/Making': 'text-blue-500',
    'Proposal/Quotation': 'text-green-500',
    Negotiation: 'text-purple-500',
  };


  const dealStatusOptions: Deal['status'][] = [
    'Qualification',
    'Demo/Making',
    'Proposal/Quotation',
    'Negotiation'
  ];

  const handleStatusChange = async (newStatus: Deal['status']) => {
    try {
      setLoading(true);
      const updatedDeal = { ...editedDeal, status: newStatus };

      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/CRM Deal/${deal.name}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        setEditedDeal(updatedDeal);
        onSave(updatedDeal);
        showToast('Status updated successfully', { type: 'success' });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', { type: 'error' });
      // Revert to previous status in UI
      setEditedDeal({ ...editedDeal });
    } finally {
      setLoading(false);
    }
  };

  // Add this fetch function
  const fetchAllActivities = async () => {
    setActivityLoading(true);
    try {
      await Promise.all([fetchNotes(), fetchCallLogs(), fetchComments(), fetchTasks()]);

      const allActivities: ActivityItem[] = [
        ...notes.map(note => ({
          id: note.name,
          type: 'note',
          title: `Note: ${note.title}`,
          description: note.content,
          timestamp: note.creation,
          user: note.owner,
          icon: <FileText className="w-4 h-4" />,
          color: 'bg-blue-500'
        })),
        ...callLogs.map(call => ({
          id: call.name,
          type: 'call',
          title: `${call.type} Call`,
          description: `${call.from} → ${call.to} (${call.status})`,
          timestamp: call.creation,
          user: call.owner,
          icon: <Phone className="w-4 h-4" />,
          color: 'bg-green-500'
        })),
        ...comments.map(comment => ({
          id: comment.name,
          type: 'comment',
          title: `Comment (${comment.comment_type})`,
          description: comment.content,
          timestamp: comment.creation,
          user: comment.owner,
          icon: <MessageSquare className="w-4 h-4" />,
          color: 'bg-purple-500'
        })),
        ...tasks.map(task => ({
          id: task.name,
          type: 'task',
          title: `Task: ${task.title}`,
          description: task.description,
          timestamp: task.creation,
          user: task.owner,
          icon: <CheckSquare className="w-4 h-4" />,
          color: 'bg-orange-500'
        }))
      ];

      allActivities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      showToast('Failed to fetch activities', { type: 'error' });
    } finally {
      setActivityLoading(false);
    }
  };

  // Add to useEffect
  useEffect(() => {
    if (activeTab === 'activity') {
      fetchAllActivities();
    }
  }, [activeTab]);

  // Add to state variables
  const [currentPage, setCurrentPage] = useState(1);
  const activityPerPage = 5;

  // Calculations
  const totalPages = Math.ceil(activities.length / activityPerPage);
  const activityStartIndex = (currentPage - 1) * activityPerPage;
  const activityEndIndex = activityStartIndex + activityPerPage;

  // Handlers
  const handlePrevious = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  // Inside your component:
  const composerRef = useRef<HTMLDivElement | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  useEffect(() => {
    if (
      (emailModalMode === "reply" || emailModalMode === "reply-all") &&
      showEmailModal &&
      composerRef.current
    ) {
      composerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [emailModalMode, showEmailModal]);

  function getRelativeTime(dateString: string) {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30); // approximate
    const diffYear = Math.floor(diffDay / 365); // approximate

    if (diffSec < 60) return `${diffSec} sec ago`;
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
    if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? "s" : ""} ago`;
    if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;

    return `${diffYear} year${diffYear !== 1 ? "s" : ""} ago`;
  }

  const fetchDealDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiAxios.post(
        '/api/method/frappe.client.get',
        {
          doctype: "CRM Deal",
          name: deal.name
        },
        {
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          }
        }
      );

      const dealData = response.data.message;

      // Update the editedDeal state with the fetched data
      setEditedDeal(prev => ({
        ...prev,
        organization: dealData.organization || '',
        organization_name: dealData.organization_name || '',
        website: dealData.website || '',
        no_of_employees: dealData.no_of_employees || '',
        territory: dealData.territory || '',
        annual_revenue: dealData.annual_revenue?.toString() || '0',
        industry: dealData.industry || '',
        salutation: dealData.salutation || '',
        first_name: dealData.first_name || '',
        last_name: dealData.last_name || '',
        email: dealData.email || '',
        mobile_no: dealData.mobile_no || '',
        gender: dealData.gender || '',
        deal_owner: dealData.deal_owner || '',
        next_step: dealData.next_step || '',
        probability: dealData.probability?.toString() || '0',
        status: dealData.status || 'Qualification',
        close_date: dealData.close_date || ''
      }));

    } catch (error) {
      console.error('Error fetching deal details:', error);
    } finally {
      setLoading(false);
    }
  }, [deal.name]);


  // Call this effect when the component mounts or when the deal changes
  useEffect(() => {
    if (deal.name) {
      fetchDealDetails();
    }
  }, [deal.name, fetchDealDetails]);

  //Edit Deals
  const handleSave = async () => {
    setLoading(true);

    try {
      const payload = {
        doctype: "CRM Deal",
        name: editedDeal.name, // ensure this is available
        fieldname: {
          organization: editedDeal.organization,
          organization_name: editedDeal.organization_name,
          website: editedDeal.website,
          territory: editedDeal.territory,
          annual_revenue: editedDeal.annual_revenue,
          close_date: editedDeal.close_date,
          probability: editedDeal.probability,
          next_step: editedDeal.next_step,
          deal_owner: editedDeal.deal_owner,
          status: editedDeal.status, // include if needed
        },
      };

      const response = await apiAxios.post(
        "/api/method/frappe.client.set_value",
        payload,
        {
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Save successful:", response.data.message);
      // Optionally show success message or reload
    } catch (error) {
      console.error("Save failed:", error);
      // Optionally show error message
    } finally {
      setLoading(false);
    }
  };

  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [OwnersOptions, setOwnersOptions] = useState([]);
  const [TerritoryOptions, setTerritoryOptions] = useState([]);
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await apiAxios.post(
          '/api/method/frappe.desk.search.search_link',
          {
            txt: "",
            doctype: "CRM Organization",
            filters: null
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Token 1b670b800ace83b:f82627cb56de7f6'
            }
          }
        );

        // Axios automatically parses the JSON response, so we can access it directly
        const data = response.data;

        // Transform the API response to match the format expected by Select
        const options = data.message.map((item: { value: any; description: any; }) => ({
          value: item.value,
          label: item.value,
          description: item.description
        }));
        setOrganizationOptions(options);
      } catch (err) {
        // You might want to handle the error here, e.g., show a toast notification
        console.error('Error fetching organizations:', err);
      }
    };
    fetchOrganizations();
  }, []);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await apiAxios.post(
          '/api/method/frappe.desk.search.search_link',
          {
            txt: "",
            doctype: "User",
            filters: null
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Token 1b670b800ace83b:f82627cb56de7f6'
            }
          }
        );

        // Axios automatically parses the JSON response, so we can access it directly
        const data = response.data;

        // Transform the API response to match the format expected by Select
        const options = data.message.map((item: { value: any; description: any; }) => ({
          value: item.value,
          label: item.value,
          description: item.description
        }));
        setOwnersOptions(options);
      } catch (err) {
        // You might want to handle the error here, e.g., show a toast notification
        console.error('Error fetching Deal owners:', err);
      }
    };
    fetchOwners();
  }, []);

  useEffect(() => {
    const fetchTerritory = async () => {
      try {
        const response = await apiAxios.post(
          '/api/method/frappe.desk.search.search_link',
          {
            txt: "",
            doctype: "CRM Territory",
            filters: null
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Token 1b670b800ace83b:f82627cb56de7f6'
            }
          }
        );

        // Axios automatically parses the JSON response, so we can access it directly
        const data = response.data;

        // Transform the API response to match the format expected by Select
        const options = data.message.map((item: { value: any; description: any; }) => ({
          value: item.value,
          label: item.value,
          description: item.description
        }));
        setTerritoryOptions(options);
      } catch (err) {
        // You might want to handle the error here, e.g., show a toast notification
        console.error('Error fetching Deal owners:', err);
      }
    };
    fetchTerritory();
  }, []);

  const [attachments, setAttachments] = useState<Array<{
    name: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    is_private: number;
    modified?: string;
    creation?: string;
    owner?: string;
  }>>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const fetchAttachments = useCallback(async () => {
    setAttachmentsLoading(true);
    try {
      const response = await apiAxios.post(
        '/api/method/crm.api.activities.get_activities',
        {
          name: deal.name
        },
        {
          headers: {
            Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;

      // The attachments are in the last array of the message array
      const attachments = result.message[result.message.length - 1] || [];
      setAttachments(attachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      showToast('Failed to fetch attachments', { type: 'error' });
    } finally {
      setAttachmentsLoading(false);
    }
  }, [deal.name]);

  useEffect(() => {
    if (activeTab === 'attachments') {
      fetchAttachments();
    }
  }, [activeTab, fetchAttachments]);

  const isImageFile = (fileName: string | undefined): boolean => {
    if (!fileName) return false;
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  };
  const [attachmentToDelete, setAttachmentToDelete] = React.useState<{ name: string } | null>(null);
  const [attachmentToTogglePrivacy, setAttachmentToTogglePrivacy] = React.useState<{
    name: string;
    is_private: number;
  } | null>(null);
  const [noteFormError, setNoteFormError] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [showDeleteTaskPopup, setShowDeleteTaskPopup] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);

  console.log("taskToDelete", taskToDelete)

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`border-b px-4 sm:px-6 py-4 ${theme === 'dark'
        ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
        : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                }`}
            >
              <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
            </button>
            <div>
              <h1 className={`text-xl font-semibold ${textColor}`}>
                {deal.organization} - {deal.name}
              </h1>
              <p className={`text-sm ${textSecondaryColor}`}>{deal.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Listbox
              value={editedDeal.status}
              onChange={handleStatusChange}
              disabled={loading}
            >
              <div className="relative inline-block w-48">
                <Listbox.Button
                  className={`pl-8 pr-4 py-2 rounded-lg transition-colors appearance-none w-full text-left ${theme === 'dark' ? 'bg-purplebg text-white' : 'bg-black text-white'
                    }`}
                >
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaCircleDot className={statusColors[editedDeal.status]} />
                  </span>
                  {editedDeal.status}
                </Listbox.Button>
                <Listbox.Options className={`absolute mt-1 w-full rounded-md shadow-lg z-[9999] bg-white`}>
                  {dealStatusOptions.map((option) => (
                    <Listbox.Option
                      key={option}
                      value={option}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active
                          ? theme === 'dark'
                            ? 'bg-purplebg text-white'
                            : 'bg-blue-100 text-blue-900'
                          : ''
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`absolute left-3 top-1/2 transform -translate-y-1/2`}>
                            <FaCircleDot className={statusColors[option]} />
                          </span>
                          <span className={`${selected ? 'font-semibold' : 'font-normal'}`}>
                            {option}
                          </span>
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b ${borderColor}`}>
        <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? theme === 'dark'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-blue-500 text-blue-600'
                    : theme === 'dark'
                      ? 'border-transparent text-white hover:text-white hover:border-gray-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
                {tab.count !== null && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.id
                    ? theme === 'dark'
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-6">
                <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${textColor}`}>Data</h3>
                    <button
                      onClick={handleSave}
                      className={`px-4 py-2 ${buttonBgColor} text-white rounded-lg transition-colors flex items-center space-x-2`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span>Saving...</span>
                        </>
                      ) : 'Save'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Organization</label>
                      <Select
                        value={organizationOptions.find(
                          (option) => option.value === editedDeal.organization_name
                        )}
                        onChange={(selectedOption) =>
                          handleInputChange('organization_name', selectedOption ? selectedOption.value : '')
                        }
                        options={organizationOptions}
                        isClearable
                        isSearchable
                        placeholder="Search or select organization..."
                        className="mt-1 w-full"
                        classNamePrefix="org-select"
                        styles={darkSelectStyles}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Website</label>
                      <input
                        type="text"
                        value={editedDeal.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className={`p-[2px] pl-2  placeholder-gray-200 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Territory</label>
                      <Select
                        value={TerritoryOptions.find(
                          (option) => option.value === editedDeal.territory
                        )}
                        onChange={(selectedOption) =>
                          handleInputChange('territory', selectedOption ? selectedOption.value : '')
                        }
                        options={TerritoryOptions}
                        isClearable
                        isSearchable
                        placeholder="Search or select Territory..."
                        className="mt-1 w-full"
                        classNamePrefix="org-select"
                        styles={darkSelectStyles}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Annual Revenue</label>
                      <input
                        type="text"
                        value={editedDeal.annual_revenue || ''}
                        onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Close Date</label>
                      <input
                        type="date"
                        value={editedDeal.close_date?.split(' ')[0] || ''}
                        onChange={(e) => handleInputChange('close_date', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Probability</label>
                      <input
                        type="number"
                        value={editedDeal.probability || ''}
                        onChange={(e) => handleInputChange('probability', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Next Step</label>
                      <input
                        type="text"
                        value={editedDeal.next_step || ''}
                        onChange={(e) => handleInputChange('next_step', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Deal Owner</label>
                      <Select
                        value={OwnersOptions.find(
                          (option) => option.value === editedDeal.deal_owner
                        )}
                        onChange={(selectedOption) =>
                          handleInputChange('deal_owner', selectedOption ? selectedOption.value : '')
                        }
                        options={OwnersOptions}
                        isClearable
                        isSearchable
                        placeholder="Search or select Deal Owners..."
                        className="mt-1 w-full"
                        classNamePrefix="org-select"
                        styles={darkSelectStyles}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Add Note Form */}
            <div>
              {/* <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Add Note</h3> */}
              <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
                <div className='flex justify-between items-center gap-5 mb-6'>

                  <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Notes</h3>
                  <button
                    onClick={() => {
                      setShowNoteModal(true);
                      setIsEditMode(false); // Add this line
                      setNoteForm({ title: '', content: '' }); // Also reset form if needed
                    }}
                    className={`${buttonBgColor} text-white px-4 py-2 rounded-lg flex items-center space-x-2`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Note</span>
                  </button>
                </div>
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                    <p className={textSecondaryColor}>No Notes</p>
                    <span
                      onClick={() => {
                        setShowNoteModal(true);
                        setIsEditMode(false); // Add this line
                        setNoteForm({ title: '', content: '' }); // Also reset form if needed
                      }}
                      className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                    >Create Note </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-5">
                    {/* Notes list */}
                    {notes.map((note) => (
                      <div
                        key={note.name}
                        className={`border ${borderColor} rounded-lg p-4 relative`} // ✅ relative here
                        onDoubleClick={() => {
                          setNoteForm({
                            name: note.name || '',
                            title: note.title || '',
                            content: note.content || ''
                          });
                          setIsEditMode(true);
                          setShowNoteModal(true);
                        }}
                        style={{ cursor: 'pointer' }}

                      >
                        {/* Title & Menu Button */}
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`text-lg font-semibold ${textColor}`}>{note.title}</h4>
                          <div className="relative"> {/* ✅ relative so dropdown anchors here */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === note.name ? null : note.name);
                              }}
                              className="p-1 rounded transition-colors"
                              style={{ lineHeight: 0 }}
                            >
                              <BsThreeDots className="w-4 h-4 text-white" />
                            </button>

                            {/* Dropdown */}
                            {openMenuId === note.name && (
                              <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.name);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-300 hover:rounded-lg w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <p
                          className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-600'
                            } whitespace-pre-wrap`}
                        >
                          {note.content}
                        </p>

                        {/* Footer */}
                        <div className="flex justify-between items-center mt-20 text-sm gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-gray-300 font-bold text-xs">
                              {note.owner?.charAt(0).toUpperCase() || "-"}
                            </span>
                            <span className={textSecondaryColor}>{note.owner}</span>
                          </div>
                          <span className={`${textSecondaryColor} font-medium`}>
                            {getRelativeTime(note.creation)}
                          </span>
                        </div>
                      </div>
                    ))}

                  </div>
                )}
              </div>
            </div>

            {showNoteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                  onClick={() => setShowNoteModal(false)}
                />

                {/* Modal */}
                <div
                  className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-400 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}
                >
                  <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
                    {/* Close */}
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                      <button
                        type="button"
                        className={`rounded-md ${theme === 'dark' ? 'text-white' : 'text-gray-400'} hover:text-gray-500 focus:outline-none`}
                        onClick={() => {
                          setShowNoteModal(false);
                          setIsEditMode(false); // Add this line
                        }}
                      >
                        <IoCloseOutline size={24} />
                      </button>
                    </div>

                    {/* Header */}
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {isEditMode ? 'Edit Note' : 'Create Note'}
                    </h3>

                    {/* Form */}
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Title <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type="text"
                          value={noteForm.title}
                          onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            } ${noteForm.title === '' && noteFormError ? 'border-red-500' : ''
                            }`}
                          placeholder="Call with John Doe"
                        />
                        {noteForm.title === '' && noteFormError && (
                          <p className="mt-1 text-sm text-red-500">Title is required</p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Content
                        </label>
                        <textarea
                          value={noteForm.content}
                          onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                          rows={8}  // Increased from 4 to 8
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          placeholder="Took a call with John Doe and discussed the new project"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`px-4 py-3 sm:px-6 ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
                    <div className="w-full">
                      <button
                        onClick={async () => {
                          if (noteForm.title === '') {
                            setNoteFormError(true);
                            return;
                          }

                          let success = false;
                          if (isEditMode) {
                            success = await editNote();
                          } else {
                            success = await addNote();
                          }
                          if (success) {
                            setShowNoteModal(false);
                            setIsEditMode(false);
                            setNoteFormError(false);
                          }
                        }}
                        disabled={notesLoading}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${theme === 'dark'
                          ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                          } ${notesLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {notesLoading ? (
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
            )}
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="space-y-6">
            {/* Add Call Form */}
            {/* <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Add Call Log</h3> */}
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className='flex justify-between items-center gap-5 mb-6'>

                <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Calls</h3>
                <button
                  onClick={() => setShowCallModal(true)}
                  className={`text-white px-4 py-2 rounded-lg flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg hover:bg-purple-800' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Call Log</span>
                </button>
              </div>
              {/* call log list */}
              {callLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No call logs yet</p>
                  <span
                    onClick={() => setShowCallModal(true)}
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                  >Create Call Log</span>
                </div>
              ) : (
                <div className="space-y-4">

                  {callLogs.map((call) => (
                    <div
                      key={call.name}
                      className={`border ${borderColor} rounded-lg p-4`}
                      onDoubleClick={() => {
                        setCallForm({
                          from: call.from || '',
                          to: call.to || '',
                          status: call.status || 'Ringing',
                          type: call.type || 'Outgoing',
                          duration: call.duration || '',
                          name: call.name || '',
                        });
                        setIsEditMode(true);
                        setShowCallModal(true);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="Double click to edit"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className={`font-medium ${textColor}`}>{call.from}</span>
                          <span className={`mx-2 ${textSecondaryColor}`}>→</span>
                          <span className={`font-medium ${textColor}`}>{call.to}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${textSecondaryColor}`}>{formatDate(call.creation)}</span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteCall(call.name);
                            }}
                            title="Delete"
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                            style={{ lineHeight: 0 }}
                          >
                            <BsThreeDots className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={textSecondaryColor}>Status: {call.status}</span>
                        <span className={textSecondaryColor}>Type: {call.type}</span>
                        <span className={textSecondaryColor}>Duration: {call.duration} min</span>
                      </div>
                      <p className={`text-sm ${textSecondaryColor} mt-2`}> {call.owner}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showCallModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className={`w-full max-w-2xl ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
                  <button
                    onClick={() => setShowCallModal(false)}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                  >
                    ✕
                  </button>

                  <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Add Call Log</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>From *</label>
                      <input
                        type="text"
                        value={callForm.from}
                        onChange={(e) => setCallForm({ ...callForm, from: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                        placeholder="Caller number"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>To *</label>
                      <input
                        type="text"
                        value={callForm.to}
                        onChange={(e) => setCallForm({ ...callForm, to: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                        placeholder="Recipient number"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Status</label>
                      <select
                        value={callForm.status}
                        onChange={(e) => setCallForm({ ...callForm, status: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                      >
                        {["Initiated", "Ringing", "In Progress", "Completed", "Failed", "Busy", "No Answer", "Queued", "Canceled"].map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Type</label>
                      <select
                        value={callForm.type}
                        onChange={(e) => setCallForm({ ...callForm, type: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                      >
                        <option value="Outgoing">Outgoing</option>
                        <option value="Incoming">Incoming</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Duration (minutes)</label>
                      <input
                        type="number"
                        value={callForm.duration}
                        onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                        placeholder="Call duration"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={async () => {
                        let success = false;
                        if (isEditMode) {
                          success = await editCall();
                        } else {
                          success = await addCall();
                        }
                        if (success) {
                          setShowCallModal(false);
                          setIsEditMode(false);
                        }
                      }}
                      disabled={callsLoading}
                      className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purplebg hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                    >
                      {callsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>{isEditMode ? 'Update' : 'Add Call Log'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className="flex justify-between items-center gap-5 mb-6">
                <h3 className={`text-lg font-semibold ${textColor} mb-2`}>Comments</h3>
                <button
                  // onClick={() => setShowCommentModal(true)}
                  onClick={() => {
                    setSelectedEmail(null);                // Clear selected email
                    setEmailModalMode("new");
                    setEmailModalMode("comment");             // Set mode to 'new'
                    setShowEmailModal(true);              // Open composer
                    setTimeout(() => {
                      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);                              // Wait for modal to render
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purplebg hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Comment</span>
                </button>
              </div>

              {commentsLoading ? (
                <div className="text-center py-8">
                  <span>loading comments</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <FaRegComment className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No comments</p>
                  <span
                    // onClick={() => setShowCommentModal(true)}
                    onClick={() => {
                      setSelectedEmail(null);                // Clear selected email
                      setEmailModalMode("new");             // Set mode to 'new'
                      setShowEmailModal(true);              // Open composer
                      setTimeout(() => {
                        composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);                              // Wait for modal to render
                    }}
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                  >New Comment</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.name} className="relative ">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                          {/* Comment icon */}
                          <div className="mt-1 text-white text-lg">
                            <FaRegComment size={18} />
                          </div>
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-500 text-white text-sm font-semibold">
                            {comment.owner?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <p className={`text-sm font-medium ${textSecondaryColor}`}>
                            {Username} added a {comment.comment_type}
                          </p>
                        </div>

                        {/* Right aligned time */}
                        <p className="text-sm text-white">
                          {/* last week */}
                          {getRelativeTime(comment.creation)}
                        </p>
                      </div>

                      <div className={`border border-gray-600  rounded-lg p-4 mb-8 ml-9 mt-2`}>
                        {/* <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm ${textSecondaryColor}`}>
                            {formatDate(comment.creation)}
                          </span>
                        </div> */}
                        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} mb-2 whitespace-pre-wrap`}>
                          {comment.content.replace(/<[^>]+>/g, '')}
                        </div>
                        {/* Attachments section */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-0">

                            <div className="flex flex-wrap gap-3">
                              {comment.attachments.map((attachment, index) => {
                                const baseURL = "http://103.214.132.20:8002";
                                const fullURL = attachment.file_url.startsWith("http")
                                  ? attachment.file_url
                                  : `${baseURL}${attachment.file_url}`;

                                return (
                                  <div key={index} className="flex items-center gap-2">
                                    <a
                                      href={fullURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center border border-gray-600 text-white px-3 py-1 rounded bg-white-31 hover:bg-gray-600 transition-colors"
                                    >
                                      <span className="mr-2 flex items-center gap-1 truncate max-w-[200px]">
                                        <IoDocument className="w-3 h-3 mr-1" />
                                        {attachment.file_name}
                                      </span>
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              ref={composerRef}
              className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              {/* Show Reply/Comment buttons when modal is closed */}
              {!showEmailModal && (
                <div className="flex gap-4 mt-4">
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-600"}`}
                    onClick={() => {
                      setEmailModalMode("reply");
                      setShowEmailModal(true);
                    }}
                  >
                    <Mail size={14} /> Reply
                  </button>

                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-400"}`}
                    onClick={() => {
                      setEmailModalMode("comment");
                      setShowEmailModal(true);
                    }}
                  >
                    <FaRegComment size={14} /> Comment
                  </button>
                </div>
              )}
              {showEmailModal && (
                <EmailComposer
                  mode={emailModalMode}
                  dealName={deal.name}
                  fetchEmails={fetchEmails}
                  fetchComments={fetchComments}
                  selectedEmail={selectedEmail}
                  clearSelectedEmail={() => setSelectedEmail(null)} // Add this line
                  onClose={() => setShowEmailModal(false)} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Add Task Form */}
            {/* <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}> */}
            {/* <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Add Task</h3> */}
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className='flex justify-between items-center gap-5 mb-6'>
                <h3 className={`text-lg font-semibold ${textColor} mb-0`}> Tasks</h3>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purplebg hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No tasks yet</p>
                  <span
                    onClick={() => setShowTaskModal(true)}
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                  >New Task</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((note) => (
                    <div
                      key={note.name}
                      onClick={() => {
                        setTaskForm({
                          title: note.title,
                          description: note.description,
                          status: note.status,
                          priority: note.priority,
                          due_date: note.due_date ? note.due_date.split(' ')[0] : '', // Extract just the date part
                          assigned_to: note.assigned_to,
                        });
                        setIsEditMode(true);
                        setCurrentTaskId(note.name); // Store the task name for editing
                        setShowTaskModal(true);
                      }}
                      className={`border ${borderColor} rounded-lg p-4`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${textColor}`}>{note.title}</h4>
                      </div>

                      {/* Row: Left (assigned, date, priority) | Right (status, menu) */}
                      <div className="mt-1 text-sm flex justify-between items-center flex-wrap gap-2">
                        {/* Left side */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Assigned to */}
                          <div className="relative z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white text-xs font-semibold">
                            {note.assigned_to?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className={textSecondaryColor}>
                            {note.assigned_to || 'Unassigned'}
                          </span>

                          {/* Due date */}
                          {note.due_date && (
                            <span className={`flex items-center gap-0.5 ${textSecondaryColor}`}>
                              <LuCalendar className="w-3.5 h-3.5" />
                              {note.due_date}
                            </span>
                          )}

                          {/* Priority */}
                          <span className="flex items-center gap-1">
                            <span
                              className={`w-2.5 h-2.5 rounded-full inline-block ${note.priority === 'High'
                                ? 'bg-red-500'
                                : note.priority === 'Medium'
                                  ? 'bg-yellow-500'
                                  : note.priority === 'Low'
                                    ? 'bg-gray-300'
                                    : 'bg-gray-400'
                                }`}
                            ></span>
                            <span className="text-xs text-white font-medium">{note.priority}</span>
                          </span>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                          {/* Status */}
                          <span
                            className={`px-1 text-xs font-semibold rounded ${note.status === 'Done'
                              ? theme === 'dark'
                                ? 'bg-green-900 text-green-200'
                                : 'bg-green-100 text-green-800'
                              : note.status === 'Open'
                                ? theme === 'dark'
                                  ? 'bg-blue-900 text-blue-200'
                                  : 'bg-blue-100 text-blue-800'
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                          >
                            {note.status}
                          </span>

                          {/* Three dots menu */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === note.name ? null : note.name);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                            >
                              <BsThreeDots className="w-4 h-4 text-white" />
                            </button>

                            {/* Dropdown menu */}
                            {openMenuId === note.name && (
                              <div
                                className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTaskToDelete(note.name); // Store the task to be deleted
                                    setShowDeleteTaskPopup(true); // Show the popup
                                    setOpenMenuId(null); // Close the dropdown
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                  <span className='text-white'>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  ))}
                  {showDeleteTaskPopup && taskToDelete && (
                    <DeleteTaskPopup
                      closePopup={() => setShowDeleteTaskPopup(false)}
                      task={{ name: taskToDelete }} // Pass as object with name property
                      theme={theme}
                      onDeleteSuccess={fetchTasks}
                    />
                  )}
                </div>
              )}
            </div>
            {/* 
              
            </div> */}
            {showTaskModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                  onClick={() => setShowTaskModal(false)}
                />

                {/* Modal - Increased width to max-w-4xl */}
                <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-11/12 sm:max-w-[600px] border ${theme === 'dark' ? 'border-gray-600 bg-dark-secondary' : 'border-gray-400 bg-white'}`}>
                  <div className={`px-6 pt-6 pb-4 sm:p-8 sm:pb-6 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
                    {/* Close */}
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                      <button
                        type="button"
                        className={`rounded-md ${theme === 'dark' ? 'text-white' : 'text-gray-400'} hover:text-gray-500 focus:outline-none`}
                        onClick={() => {
                          setShowTaskModal(false);
                          setIsEditMode(false);
                        }}
                      >
                        <IoCloseOutline size={24} />
                      </button>
                    </div>

                    {/* Header */}
                    <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {isEditMode ? 'Edit Task' : 'Create Task'}
                    </h3>

                    {/* Form */}
                    <div className="space-y-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Title <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type="text"
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
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
                          value={taskForm.description}
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          rows={6}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          placeholder="Task description"
                        />
                      </div>

                      {/* All fields in one row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Status */}
                        <div>
                          <select
                            value={taskForm.status}
                            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          >
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="Backlog">Backlog</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="Todo">Todo</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="In Progress">In Progress</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="Done">Done</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="Canceled">Canceled</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="Open">Open</option>
                          </select>
                        </div>

                        {/* Priority */}
                        <div>
                          <select
                            value={taskForm.priority}
                            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          >
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="Low">Low</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="Medium">Medium</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="High">High</option>
                          </select>
                        </div>

                        {/* Due Date */}
                        <div>

                          <input
                            type="date"
                            value={taskForm.due_date}
                            onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          />
                        </div>

                        {/* Assigned To */}
                        <div>
                          <select
                            value={taskForm.assigned_to}
                            onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          >
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="">Select Assign</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="hari@psd123.com">Hari</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="arun@psd.com">Arun</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="demo@psdigitise.com">DEMO</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="demo@psdigitise.com">DEMO</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="fen87joshi@yahoo.com">Feni</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="fenila@psd.com">Fenila</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="mx.techies@gmail.com">mx techies</option>
                            <option
                              className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              value="prasad@psd.com">prasad</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`px-6 py-4 sm:px-8 ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
                    <div className="w-full">
                      <button
                        onClick={async () => {
                          if (!taskForm.title.trim()) {
                            showToast('Title is required', { type: 'error' });
                            return;
                          }

                          let success = false;
                          if (isEditMode) {
                            success = await editTask(currentTaskId);
                          } else {
                            success = await addTask();
                          }
                          if (success) {
                            setTaskForm({
                              title: '',
                              description: '',
                              status: 'Open',
                              priority: 'Medium',
                              due_date: '',
                              assigned_to: ''
                            });
                            setShowTaskModal(false);
                            setIsEditMode(false);
                          }
                        }}
                        disabled={tasksLoading}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${theme === 'dark'
                          ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                          } ${tasksLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="space-y-6">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className='flex items-center justify-between gap-5 mb-6'>
                <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Emails</h3>
                <button
                  onClick={() => {
                    setSelectedEmail(null);                // Clear selected email
                    setEmailModalMode("new");             // Set mode to 'new'
                    setShowEmailModal(true);              // Open composer
                    setTimeout(() => {
                      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);                              // Wait for modal to render
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ml-auto ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span >
                    New Email</span>
                </button>
              </div>

              {emailsLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purplebg' : 'text-blue-600'}`} />
                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading emails...</span>
                </div>
              ) : emails.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No emails yet</p>
                  <span
                    onClick={() => {
                      setSelectedEmail(null);                // Clear selected email
                      setEmailModalMode("new");             // Set mode to 'new'
                      setShowEmailModal(true);              // Open composer
                      setTimeout(() => {
                        composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);                              // Wait for modal to render
                    }}
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                  >New Email</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {emails.map((email) => (
                    <div key={email.id} className="flex items-start w-full">
                      {/* Avatar Circle */}
                      <div className=" mt-2 relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-500 text-white text-sm font-semibold mr-4">
                        {email.fromName?.charAt(0).toUpperCase() || "?"}
                      </div>

                      {/* Email Card */}
                      <div className={`flex-1 border border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium ${textColor}`}>
                            {email.fromName} &lt;{email.from}&gt;
                          </h4>

                          {/* Right-side controls */}
                          <div className="flex items-center gap-3 ml-auto">
                            <span className="text-xs text-white">
                              {getRelativeTime(email.creation)}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedEmail(email);
                                setEmailModalMode("reply");
                                setShowEmailModal(true);
                              }}
                              className="text-white"
                              title="Reply"
                            >
                              <LuReply className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEmail(email);
                                setEmailModalMode("reply-all");
                                setShowEmailModal(true);
                              }}
                              className="text-white"
                              title="Reply All"
                            >
                              <LuReplyAll className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h4 className={`font-medium ${textColor}`}>{email.subject}</h4>

                        <div className="mb-2">
                          <span className={`text-sm ${textColor}`}>
                            <strong>To:</strong> {email.to}
                          </span>
                        </div>

                        <div className="mt-4  pt-2 border-t border-gray-600  flex flex-col items-start">
                          <div
                            className={`${textColor} mb-2 whitespace-pre-wrap mt-4 w-full`}
                            dangerouslySetInnerHTML={{
                              __html: email.content.includes('\n\n---\n\n')
                                ? email.content.split('\n\n---\n\n')[1]
                                : email.content
                            }}
                          />

                          {email.attachments.map((attachment, index) => {
                            const baseURL = "http://103.214.132.20:8002";
                            const fullURL = `${baseURL}${attachment.file_url}`;
                            //const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(attachment.file_name);

                            return (
                              <div key={index} className="mb-2 flex items-center gap-2">
                                <a
                                  href={fullURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`px-3 py-1 border border-gray-600 rounded-md text-sm flex items-center ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"}`}
                                >
                                  <IoDocument className="w-3 h-3 mr-1" />
                                  {attachment.file_name}
                                </a>

                                {/* {isImage && (
                                  <a
                                    href={fullURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                  >
                                    <img
                                      src={fullURL}
                                      alt={attachment.file_name}
                                      className="w-10 h-10 object-cover rounded border border-gray-400 hover:opacity-80"
                                    />
                                  </a>
                                )} */}
                              </div>
                            );
                          })}


                          {email.content.includes('\n\n---\n\n') && (
                            <div className="mt-2">
                              <button
                                className={`text-sm ${textColor} inline-flex items-center justify-center w-10 h-6 rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                                onClick={() =>
                                  setExpandedEmailId(prev => (prev === email.id ? null : email.id))
                                }
                                title="Show original message"
                              >
                                <PiDotsThreeOutlineBold />
                              </button>

                              {/* Conditionally show original content when expanded */}
                              {expandedEmailId === email.id && (
                                <div
                                  className={`mt-4 border-l-4 pl-4 italic font-semibold text-sm ${theme === "dark" ? "border-gray-500 text-gray-300" : "border-gray-600 text-gray-700"}`}
                                  dangerouslySetInnerHTML={{
                                    __html: email.content.split('\n\n---\n\n')[0],
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  ))}
                </div>
              )}
            </div>

            <div
              ref={composerRef}
              className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              {/* Show Reply/Comment buttons when modal is closed */}
              {!showEmailModal && (
                <div className="flex gap-4 mt-4">
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-600"}`}
                    onClick={() => {
                      setEmailModalMode("reply");
                      setShowEmailModal(true);
                    }}
                  >
                    <Mail size={14} /> Reply
                  </button>

                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-400"}`}
                    onClick={() => {
                      setEmailModalMode("comment");
                      setShowEmailModal(true);
                    }}
                  >
                    <FaRegComment size={14} /> Comment
                  </button>
                </div>
              )}
              {showEmailModal && (
                <EmailComposer
                  mode={emailModalMode}
                  dealName={deal.name}
                  fetchEmails={fetchEmails}
                  selectedEmail={selectedEmail}
                  clearSelectedEmail={() => setSelectedEmail(null)} // Add this line
                  deal={deal} // Add this line
                  onClose={() => setShowEmailModal(false)} />
              )}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Activity Timeline</h3>

            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No activities yet</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {activities.slice(activityStartIndex, activityEndIndex).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'}`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {activity.title}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-1`}>
                          {activity.description}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'} mt-1`}>
                          by {activity.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`text-sm px-3 py-1 border rounded-md ${theme === 'dark'
                      ? 'text-white bg-dark-accent hover:bg-purple-800/50 border-purple-500/30'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300'
                      } disabled:opacity-50`}
                  >
                    Previous
                  </button>

                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                    Page {currentPage} of {totalPages}
                  </p>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`text-sm px-3 py-1 border rounded-md ${theme === 'dark'
                      ? 'text-white bg-dark-accent hover:bg-purple-800/50 border-purple-500/30'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300'
                      } disabled:opacity-50`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}


        {activeTab === 'attachments' && (
          <div className="space-y-6">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className='flex items-center justify-between gap-5 mb-6'>
                <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Attachments</h3>
                <button
                  onClick={() => setIsUploadPopupOpen(true)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ml-auto ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>Upload Attachment</span>
                </button>
              </div>

              {attachmentsLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purplebg' : 'text-blue-600'}`} />
                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading attachments...</span>
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-8">
                  <Paperclip className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No attachments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.name}
                      className={`flex items-center justify-between p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer`}
                      onClick={() => window.open(`http://103.214.132.20:8002${attachment.file_url}`, '_blank')}
                    >
                      <div className="flex items-center">
                        {isImageFile(attachment.file_name) ? (
                          <img
                            src={`http://103.214.132.20:8002${attachment.file_url}`}
                            alt={attachment.file_name}
                            className="w-12 h-12 mr-3 object-cover rounded border border-gray-400 hover:opacity-80"
                          />
                        ) : (
                          <div className="w-12 h-12 mr-3 flex items-center justify-center border border-gray-400 rounded">
                            <IoDocument className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>

                        )}
                        <div>
                          <p className={`font-medium ${textColor}`}>{attachment.file_name}</p>
                          <p className={`text-sm ${textSecondaryColor}`}>
                            {attachment.file_size ? formatFileSize(attachment.file_size) : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <p className={`text-sm ${textSecondaryColor}`}> {getRelativeTime(attachment.creation ?? '')}</p>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachmentToTogglePrivacy({
                              name: attachment.name,
                              is_private: attachment.is_private
                            });
                          }}
                          className="flex items-center space-x-2">
                          {attachment.is_private === 1 ? (
                            <div className="p-2 bg-gray-700 rounded-full flex items-center justify-center">
                              <IoLockClosedOutline className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-100'}`} title="Private" />
                            </div>
                          ) : (
                            <div className="p-2 bg-gray-700 rounded-full flex items-center justify-center">
                              <IoLockOpenOutline className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-100'}`} title="Public" />
                            </div>
                          )}

                          <button
                            className={`p-1.5 bg-gray-700 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent div's click
                              setAttachmentToDelete({
                                name: attachment.name
                              });
                            }}
                          >
                            <Trash2 className={`w-5 h-5 text-white ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <UploadAttachmentPopup
              isOpen={isUploadPopupOpen}
              dealName={deal.name}
              fetchAttachments={fetchAttachments}
              onClose={() => setIsUploadPopupOpen(false)}
            />
            {attachmentToDelete && (
              <DeleteAttachmentPopup
                closePopup={() => setAttachmentToDelete(null)}
                attachment={attachmentToDelete}
                fetchAttachments={fetchAttachments}
              />
            )}
            {attachmentToTogglePrivacy && (
              <AttachmentPrivatePopup
                closePopup={() => setAttachmentToTogglePrivacy(null)}
                attachment={attachmentToTogglePrivacy}
                fetchAttachments={fetchAttachments}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}


