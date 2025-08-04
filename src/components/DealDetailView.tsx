import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, User, Activity, FileText, Phone, MessageSquare, CheckSquare, Send, Plus, Loader2, Mail, Trash2, Reply, Paperclip } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import EmailComposer from './EmailComposer';
import CommentCreate from './CommentCreate';
import { FaCircleDot, FaRegComment, FaRegComments } from 'react-icons/fa6';
import { Listbox } from '@headlessui/react';
import { HiOutlinePlus } from 'react-icons/hi';
import { IoDocument } from 'react-icons/io5';
import { LuReply, LuReplyAll } from 'react-icons/lu';
import { PiDotsThreeOutlineBold } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners';


interface Deal {
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

// interface Comment {
//   name: string;
//   content: string;
//   comment_type: string;
//   reference_doctype: string;
//   reference_name: string;
//   creation: string;
//   owner: string;
// }


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
  creation:string;
}

type TabType = 'overview' | 'activity' | 'notes' | 'calls' | 'comments' | 'tasks' | 'emails';

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

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    start_date: '',
    due_date: ''
  });

  const [emailForm, setEmailForm] = useState({
    recipient: '',
    message: ''
  });

  const tabs = [
    { id: 'activity', label: 'Activity', icon: Activity, count: activities.length },
    { id: 'emails', label: 'Emails', icon: Send, count: emails.length },
    { id: 'comments', label: 'Comments', icon: FaRegComment, count: comments.length },
    { id: 'overview', label: 'Data', icon: User, count: null },
    { id: 'calls', label: 'Calls', icon: Phone, count: callLogs.length },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
    { id: 'notes', label: 'Notes', icon: FileText, count: notes.length },
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/CRM Deal/${deal.name}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editedDeal)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      onSave(result);
      setIsEditing(false);
      showToast.success('Deal updated successfully!');
    } catch (error) {
      console.error('Error updating deal:', error);
      showToast.error('Failed to update deal');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      if (!deal?.name) {
        showToast.error("Invalid deal name");
        return;
      }

      const filters = JSON.stringify([
        ["reference_doctype", "=", "CRM Deal"],
        ["reference_docname", "=", deal.name]
      ]);

      const fields = JSON.stringify([
        "title", "content", "reference_doctype", "reference_docname", "creation", "owner"
      ]);

      const url = `http://103.214.132.20:8002/api/v2/document/FCRM Note?fields=${encodeURIComponent(fields)}&filters=${encodeURIComponent(filters)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      setNotes(result.data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      showToast.error("Failed to fetch notes");
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
          .filter(activity => activity.activity_type === 'comment')
          .map(comment => ({
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

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/CRM Task?fields=["name","title","description","status","priority","start_date","due_date","creation","owner"]&filters=[["reference_doctype","=","CRM Deal"],["reference_docname","=","${deal.name}"]]`,
        {
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTasks(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('Failed to fetch tasks', { type: 'error' });
    } finally {
      setTasksLoading(false);
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
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    setNotesLoading(true);
    try {
      const response = await fetch(
        'http://103.214.132.20:8002/api/v2/document/FCRM Note',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: noteForm.title,
            content: noteForm.content,
            reference_doctype: 'CRM Deal',
            reference_docname: deal.name
          })
        }
      );

      if (response.ok) {
        showToast('Note added successfully', { type: 'success' });
        setNoteForm({ title: '', content: '' });
        await fetchNotes();
      } else {
        throw new Error('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      showToast('Failed to add note', { type: 'error' });
    } finally {
      setNotesLoading(false);
    }
  };

  const editNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return false;
    }

    setNotesLoading(true);
    try {
      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/FCRM Note/${noteForm.name}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: noteForm.title,
            content: noteForm.content,
          })
        }
      );

      if (response.ok) {
        showToast('Note updated successfully', { type: 'success' });
        setNoteForm({ title: '', content: '', name: '' });
        await fetchNotes();
        return true;
      } else {
        showToast('Failed to update note', { type: 'error' });
        return false;
      }
    } catch (error) {
      showToast('Failed to update note', { type: 'error' });
      return false;
    } finally {
      setNotesLoading(false);
    }
  };

  const deleteNote = async (name) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    setNotesLoading(true);
    try {
      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/FCRM Note/${name}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        showToast('Note deleted', { type: 'success' });
        await fetchNotes();
      } else {
        showToast('Failed to delete note', { type: 'error' });
      }
    } catch (error) {
      showToast('Failed to delete note', { type: 'error' });
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


  const addComment = async () => {
    if (!commentForm.content.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    setCommentsLoading(true);
    try {
      const response = await fetch(
        'http://103.214.132.20:8002/api/v2/document/Comment',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: commentForm.content,
            comment_type: commentForm.comment_type,
            reference_doctype: 'CRM Deal',
            reference_name: deal.name
          })
        }
      );

      if (response.ok) {
        showToast('Comment added successfully', { type: 'success' });
        setCommentForm({ content: '', comment_type: 'Comment' });
        await fetchComments();
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Failed to add comment', { type: 'error' });
    } finally {
      setCommentsLoading(false);
    }
  };

  const addTask = async () => {
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    setTasksLoading(true);
    try {
      const response = await fetch(
        'http://103.214.132.20:8002/api/v2/document/CRM Task',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: taskForm.title,
            description: taskForm.description,
            status: taskForm.status,
            priority: taskForm.priority,
            start_date: taskForm.start_date,
            due_date: taskForm.due_date,
            reference_doctype: 'CRM Deal',
            reference_docname: deal.name
          })
        }
      );

      if (response.ok) {
        showToast('Task added successfully', { type: 'success' });
        setTaskForm({
          title: '',
          description: '',
          status: 'Open',
          priority: 'Medium',
          start_date: '',
          due_date: ''
        });
        await fetchTasks();
      } else {
        throw new Error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      showToast('Failed to add task', { type: 'error' });
    } finally {
      setTasksLoading(false);
    }
  };

  const editTask = async () => {
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return false;
    }

    setTasksLoading(true);
    try {
      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/CRM Task/${taskForm.name}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: taskForm.title,
            description: taskForm.description,
            status: taskForm.status,
            priority: taskForm.priority,
            start_date: taskForm.start_date,
            due_date: taskForm.due_date,
          })
        }
      );

      if (response.ok) {
        showToast('Task updated successfully', { type: 'success' });
        setTaskForm({
          title: '',
          description: '',
          status: 'Open',
          priority: 'Medium',
          start_date: '',
          due_date: '',
          name: ''
        });
        await fetchTasks();
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

  const sendEmail = async () => {
    if (!emailForm.recipient.trim() || !emailForm.message.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }


    setEmailsLoading(true);
    try {
      const response = await fetch(
        'http://103.214.132.20:8002/api/v2/document/Email Queue',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sender: 'hariprasad@psdigitise.com', // Fixed sender
            recipients: [{ recipient: emailForm.recipient, status: 'Not Sent' }],
            message: emailForm.message,
            reference_doctype: 'CRM Deal',
            reference_name: deal.name
          })
        }
      );

      if (response.ok) {
        showToast('Email queued successfully', { type: 'success' });
        setEmailForm({ recipient: '', message: '' });
        await fetchEmails();
      } else {
        throw new Error('Failed to queue email');
      }
    } catch (error) {
      console.error('Error queueing email:', error);
      showToast('Failed to queue email', { type: 'error' });
    } finally {
      setEmailsLoading(false);
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
            <div>
              <div className="flex items-center space-x-2 mb-6">
                {isEditing ? (
                  <div className="flex justify-between w-full space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`px-4 py-2 ${textColor} ${secondaryButtonBgColor} rounded-lg transition-colors`}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className={`px-4 py-2 ${buttonBgColor} text-white rounded-lg transition-colors flex items-center space-x-2`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : 'Save'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`px-4 py-2 ${theme === 'dark'
                      ? 'bg-purplebg hover:bg-purple-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                      } text-white rounded-lg transition-colors`}
                  >
                    Edit Deal
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
                  <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Deal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Organization</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedDeal.organization}
                          onChange={(e) => handleInputChange('organization', e.target.value)}
                          className={`mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                        />
                      ) : (
                        <p className={`mt-1 text-sm ${textColor}`}>{deal.organization}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Status</label>
                      {isEditing ? (
                        <select
                          value={editedDeal.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className={`mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                        >
                          <option value="Qualification">Qualification</option>
                          <option value="Demo/Making">Demo/Making</option>
                          <option value="Proposal/Quotation">Proposal/Quotation</option>
                          <option value="Negotiation">Negotiation</option>
                        </select>
                      ) : (
                        <p className={`mt-1 text-sm ${textColor}`}>{deal.status}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Annual Revenue</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedDeal.annualRevenue}
                          onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                          className={`mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                        />
                      ) : (
                        <p className={`mt-1 text-sm ${textColor}`}>{deal.annualRevenue}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Assigned To</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedDeal.assignedTo}
                          onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                          className={`mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                        />
                      ) : (
                        <p className={`mt-1 text-sm ${textColor}`}>{deal.assignedTo}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Info */}
              <div className="space-y-6">
                <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
                  <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedDeal.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                        />
                      ) : (
                        <p className={`mt-1 text-sm ${textColor}`}>{deal.email}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Mobile Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedDeal.mobileNo}
                          onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                          className={`mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                        />
                      ) : (
                        <p className={`mt-1 text-sm ${textColor}`}>{deal.mobileNo}</p>
                      )}
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

                  <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Add Note</h3>
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className={`${buttonBgColor} text-white px-4 py-2 rounded-lg flex items-center space-x-2`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                </div>
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                    <p className={textSecondaryColor}>No notes yet</p>
                    <span
                      onClick={() => setShowNoteModal(true)}
                      className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                    >Add Note </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-5">
                    {/* Notes list */}
                    {notes.map((note) => (
                      <div
                        key={note.name}
                        className={`border ${borderColor} rounded-lg p-4`}
                        onDoubleClick={() => {
                          setNoteForm({
                            title: note.title || '',
                            content: note.content || '',
                            name: note.name || '',
                          });
                          setIsEditMode(true);
                          setShowNoteModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Double click to edit"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`text-lg font-semibold ${textColor}`}>{note.title}</h4>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteNote(note.name);
                            }}
                            title="Delete"
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                            style={{ lineHeight: 0 }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-600'} whitespace-pre-wrap`}>{note.content}</p>
                        <p className={`text-bse font-semibold ${textSecondaryColor} mt-2`}>by {note.owner}</p>
                        <p className={`text-sm mt-2 ${textSecondaryColor}`}>{formatDate(note.creation)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showNoteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className={`w-full max-w-lg ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
                  <button
                    onClick={() => setShowNoteModal(false)}
                    className={`absolute top-2 right-3  hover:text-gray-700 dark:hover:text-white ${theme === "dark" ? "text-white" : "text-black"} `}
                  >
                    ✕
                  </button>

                  <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Add Note</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Title *</label>
                      <input
                        type="text"
                        value={noteForm.title}
                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                        placeholder="Enter note title"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Content *</label>
                      <textarea
                        value={noteForm.content}
                        onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                        rows={4}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                        placeholder="Enter note content"
                      />
                    </div>
                    <div className="flex justify-end">

                      <button
                        onClick={async () => {
                          let success = false;
                          if (isEditMode) {
                            success = await editNote();
                          } else {
                            success = await addNote();
                          }
                          if (success) {
                            setShowNoteModal(false);
                            setIsEditMode(false);
                          }
                        }}
                        disabled={notesLoading}
                        className={`${buttonBgColor} text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50`}
                      >
                        {notesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>{isEditMode ? 'Update' : 'Add Note'}</span>
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
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={textSecondaryColor}>Status: {call.status}</span>
                        <span className={textSecondaryColor}>Type: {call.type}</span>
                        <span className={textSecondaryColor}>Duration: {call.duration} min</span>
                      </div>
                      <p className={`text-sm ${textSecondaryColor} mt-2`}>by {call.owner}</p>
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
                  <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No comments yet</p>
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
                            {comment.owner} added a {comment.comment_type}
                          </p>
                        </div>

                        {/* Right aligned time */}
                        <p className="text-sm text-white">
                          {/* last week */}
                            {getRelativeTime(comment.creation)}
                        </p>
                      </div>

                      <div className={`border ${borderColor} rounded-lg p-4 mb-8 ml-9 mt-2`}>
                        {/* <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm ${textSecondaryColor}`}>
                            {formatDate(comment.creation)}
                          </span>
                        </div> */}
                        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} whitespace-pre-wrap`}>
                          {comment.content.replace(/<[^>]+>/g, '')}
                        </div>
                        {/* Attachments section */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-0">
                            <div className="text-sm font-medium mb-2">Attachments:</div>
                            <div className="flex flex-wrap gap-3">
                              {comment.attachments.map((attachment) => (
                                <a
                                  key={attachment.name}
                                  href={attachment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center border text-white px-3 py-1 rounded bg-white-31 hover:bg-gray-600 transition-colors"
                                >
                                  <span className="mr-2 flex items-center gap-1 truncate max-w-[200px]">
                                     <IoDocument className="w-3 h-3 mr-1" />
                                    {attachment.file_name}
                                  </span>
                                  {/* <span className="text-xs opacity-75">
                  ({formatFileSize(attachment.file_size)})
                </span> */}
                                </a>
                              ))}
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
                <h3 className={`text-lg font-semibold ${textColor} mb-0`}>New Task</h3>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purplebg hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
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
                  {tasks.map((task) => (
                    <div
                      key={task.name}
                      className={`border ${borderColor} rounded-lg p-4`}
                      onDoubleClick={() => {
                        setTaskForm({
                          title: task.title || '',
                          description: task.description || '',
                          status: task.status || 'Open',
                          priority: task.priority || 'Medium',
                          start_date: task.start_date || '',
                          due_date: task.due_date || '',
                          name: task.name || '',
                        });
                        setIsEditMode(true);
                        setShowTaskModal(true);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="Double click to edit"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${textColor}`}>{task.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-sm font-semibold rounded-full ${task.status === 'Completed' ?
                            theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' :
                            task.status === 'Working' ?
                              theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800' :
                              task.status === 'Pending Review' ?
                                theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800' :
                                task.status === 'Cancelled' ?
                                  theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800' :
                                  theme === 'dark' ? 'bg-purplebg/30 text-white' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 text-sm font-semibold rounded-full ${task.priority === 'High' ?
                            theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800' :
                            task.priority === 'Medium' ?
                              theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800' :
                              task.priority === 'Low' ?
                                theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' :
                                theme === 'dark' ? 'bg-purplebg/30 text-white' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteTask(task.name);
                            }}
                            title="Delete"
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                            style={{ lineHeight: 0 }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} whitespace-pre-wrap`}>{task.description}</p>
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <div className="flex items-center space-x-4">
                          <span className={textSecondaryColor}>Start: {task.start_date}</span>
                          <span className={textSecondaryColor}>End: {task.due_date}</span>
                        </div>
                        <span className={textSecondaryColor}>by {task.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* 
              
            </div> */}
            {showTaskModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className={`w-full max-w-3xl ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className={`absolute top-2 right-3  hover:text-gray-700 dark:hover:text-white ${theme === "dark" ? "text-white" : "text-black"} `}>
                    ✕
                  </button>

                  <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Add Task</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Title *</label>
                      <input
                        type="text"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                        placeholder="Task title"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Description *</label>
                      <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        rows={4}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                        placeholder="Task description"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Status</label>
                      <select
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                      >
                        <option value="Open">Open</option>
                        <option value="Working">Working</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Priority</label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Start Date</label>
                      <input
                        type="date"
                        value={taskForm.start_date}
                        onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>End Date</label>
                      <input
                        type="date"
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={async () => {
                        let success = false;
                        if (isEditMode) {
                          success = await editTask();
                        } else {
                          success = await addTask();
                        }
                        if (success) {
                          setShowTaskModal(false);
                          setIsEditMode(false);
                        }
                      }}
                      disabled={tasksLoading}
                      className={`${buttonBgColor} text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2`}
                    >
                      {tasksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>{isEditMode ? 'Update' : 'Add Task'}</span>
                    </button>
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
                  >New Mail</span>
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
                      <div className={`flex-1 border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium ${textColor}`}>
                            {email.fromName} &lt;{email.from}&gt;
                          </h4>

                          {/* Right-side controls */}
                          <div className="flex items-center gap-3 ml-auto">
                            {/* <span
                              className={`text-xs px-3 py-1 font-semibold rounded-full bg-green-200 ${email.delivery_status === "Sent" ? "text-green-700" : "text-yellow-700 bg-yellow-200"
                                }`}
                            >
                              {email.delivery_status}
                            </span> */}
                            <span className="text-xs text-white"> 
                              {/* {email.creation ? getRelativeTime(email.creation) : "Unknown date"} */}
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

                        <div className="mt-4 pt-2 border-t border-gray-200 flex flex-col items-start">
                          <div
                            className={`${textColor} whitespace-pre-wrap mt-4 w-full`}
                            dangerouslySetInnerHTML={{
                              __html: email.content.includes('\n\n---\n\n')
                                ? email.content.split('\n\n---\n\n')[1]
                                : email.content
                            }}
                          />

                          {email.attachments?.length > 0 && (
                            <div className="mt-4 w-full">
                              <div className="flex flex-wrap gap-2">
                                {email.attachments.map((attachment, index) => (
                                  <a
                                    key={index}
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-3 py-1 rounded-md text-sm flex items-center ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
                                      }`}
                                  >
                                    <IoDocument className="w-3 h-3 mr-1" />
                                    {attachment.file_name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

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
      </div>
    </div>
  );
}


