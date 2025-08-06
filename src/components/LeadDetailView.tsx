import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { MdOutlineCircle } from "react-icons/md";
import {
  ArrowLeft,
  Edit,
  Save,
  Plus,
  Phone,
  Mail,
  FileText,
  CheckSquare,
  MessageSquare,
  Activity,
  Loader2,
  Clock,
  User,
  Building2,
  Globe,
  MapPin,
  Trash2,
  Paperclip,
  Reply,
  CornerUpRight,
  Disc,
  ReplyAll,
  CornerUpLeft,
  File
} from 'lucide-react';
import { showToast } from '../utils/toast';
import EmailComposer from './EmailComposer';
import { InfoSidebar } from './InfoSidebar';
import CommentCreate from './CommentCreate';
import { FaCircleDot, FaRegComment } from 'react-icons/fa6';
import { Listbox } from '@headlessui/react';
import EmailComposerleads from '../components/Leads/EmailComposerleads';
import Commentemailleads from '../components/Leads/Commentemailleads'

export interface Lead {
  id: string;
  name: string;
  firstName: string;
  lastName?: string;
  organization: string;
  status: string;
  email: string;
  mobile: string;
  assignedTo: string;
  lastModified: string;
  website?: string;
  territory?: string;
  industry?: string;
  jobTitle?: string;
  source?: string;
  salutation?: string;
  leadId: string;
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  docstatus?: number;
  idx?: number;
  mobile_no?: string;
  naming_series?: string;
  lead_name?: string;
  gender?: string;
  no_of_employees?: string;
  annual_revenue?: number;
  image?: string;
  first_name?: string;
  last_name?: string;
  lead_owner?: string;
  converted?: string;
}

interface LeadDetailViewProps {
  lead: Lead;
  onBack: () => void;
  onSave: (updatedLead: Lead) => void;
  onDelete?: (leadId: string) => void;
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
  reference_docname: string;
  creation: string;
  owner: string;
}

interface Comment {
  attachments: any;
  name: string;
  content: string;
  comment_type: string;
  reference_doctype: string;
  reference_name: string;
  creation: string;
  owner: string;
  subject: string;
}

export interface Attachment {
  name: string;
  file_name: string;
  file_url: string;
  is_private: number;
}


export interface Communication {
  name: string;
  communication_type: string;
  communication_medium: string;
  comment_type: string;
  communication_date: string;
  content: string;
  sender: string;
  sender_full_name: string;
  cc: string | null;
  bcc: string | null;
  creation: string;
  subject: string;
  delivery_status: string;
  _liked_by: string | null;
  reference_doctype: string;
  reference_name: string;
  read_by_recipient: number;
  rating: number;
  recipients: string;
  attachments: string; // JSON string; you'll parse this into Attachment[]
}


interface Task {
  name: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  exp_start_date: string;
  exp_end_date: string;
  reference_type: string;
  reference_docname: string;
  creation: string;
  owner: string;
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

// interface Email {
//   name: string;
//   sender: string;
//   recipients: { recipient: string; status: string }[];
//   message: string;
//   creation: string;
// }

interface Email {
  name: string;
  sender: string;
  recipients: string;
  cc?: string;
  bcc?: string;
  subject: string;
  content: string;
  creation: string;
  // Add thread reference if available
  in_reply_to?: string;
}
interface StatusChangeLog {
  from: string;
  to: string;
  from_date: string;
  to_date: string;
  parent: string;
  log_owner: string;
}

interface EmailReplyData {
  recipient: string;
  cc: string;
  bcc: string;
  subject: string;
  message: string;
}

const API_BASE_URL = 'http://103.214.132.20:8002/api';
const AUTH_TOKEN = 'token 1b670b800ace83b:f82627cb56de7f6';

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

const callStatusOptions = [
  'Ringing',
  'In Progress',
  'Completed',
  'Failed',
  'Busy',
  'No Answer',
  'Queued',
  'Canceled'
];

const callTypeOptions = ['Outgoing', 'Incoming'];

const taskStatusOptions = [
  'Backlog',
  'Todo',
  'In Progress',
  'Done',
  'Canceled',
  'Open',
];

const taskPriorityOptions = ['Low', 'Medium', 'High'];

const salutationOptions = ['', 'Mr', 'Mrs', 'Ms', 'Mx', 'Prof'];

const statusColors: Record<Lead['status'], string> = {
  New: 'text-yellow-500',
  Contacted: 'text-blue-500',
  Qualified: 'text-green-500',
  Nurture: 'text-purple-500',
  Unqualified: 'text-gray-500',
  Junk: 'text-gray-700',
};

const statusOptions: Lead['status'][] = [
  'New',
  'Contacted',
  'Nurture',
  'Qualified',
  'Unqualified',
  'Junk',
];

const industryOptions = [
  'Securities & Commodity Exchanges',
  'Service',
  'Soap & Detergent',
  'Software',
  'Sports',
  'Technology',
  'Telecommunications',
  'Television',
  'Transportation',
  'Venture Capital'
];

const sourceOptions = [
  'Walk In',
  'Campaign',
  'Customer\'s Vendor',
  'Supplier Reference',
  'Exhibition',
  'Cold Calling',
  'Advertisement',
  'Reference',
  'Existing Customer'
];


const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

export function LeadDetailView({ lead, onBack, onSave, onDelete }: LeadDetailViewProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead>(lead);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  // Add this to your existing state declarations
  const [replyData, setReplyData] = useState<EmailReplyData | undefined>(undefined);
  // Data states
  const [notes, setNotes] = useState<Note[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAttachment, setCommentAtachment] = useState<any>([]);

  console.log("mnv", comments.attachments);

  const [commentsNew, setCommentsNew] = useState<any>([]);

  console.log("1ki", commentsNew?.docinfo?.comments.length);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);

  const [files, setFiles] = useState([]);
  const [activitiesNew, setActivitiesNew] = useState<any>(null);
  const [activitiesNewAttachment, setActivitiesNewAttachment] = useState<any>(null);

  console.log("activitiesNew.docinfo.communications", activitiesNewAttachment);
  // Loading states
  const [notesLoading, setNotesLoading] = useState(false);
  const [callsLoading, setCallsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);

  // Modal states
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);

  // Form states
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    name: ''
  });

  const [callForm, setCallForm] = useState({
    from: '',
    to: '',
    status: 'Ringing',
    type: 'Outgoing',
    duration: '',
    receiver: '',
    name: ''
  });

  const [commentForm, setCommentForm] = useState({
    content: '',
    comment_type: 'Comment'
  });

  const [listSuccess, setListSuccess] = useState<string>('')

  const tabs = [
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'emails', label: 'Emails', icon: <Mail className="w-4 h-4" /> },
    { id: 'comments', label: 'Comments', icon: <FaRegComment className="w-4 h-4" /> },
    { id: 'overview', label: 'Data', icon: <User className="w-4 h-4" /> },
    { id: 'calls', label: 'Calls', icon: <Phone className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'files', label: 'Attachments', icon: <Paperclip className="w-4 h-4" /> },
  ];

  useEffect(() => {
    tabs;
  }, [listSuccess])
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    exp_start_date: '',
    exp_end_date: '',
    assigned_to: '',
    name: ''
  });

  const [emailForm, setEmailForm] = useState({
    recipient: '',
    message: ''
  });

  const [fileForm, setFileForm] = useState({
    file: null,
    file_name: '',
    file_url: '',
  });

  // Pagination states
  const [notesPage, setNotesPage] = useState(1);
  const [callLogsPage, setCallLogsPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailPage, setEmailPage] = useState(1);

  // Constants for pagination
  const notesPerPage = 3;
  const callsPerPage = 3;
  const activityPerPage = 5;
  const emailsPerPage = 3;

  // Pagination calculations
  const totalNotesPages = Math.ceil(notes.length / notesPerPage);
  const notesStartIndex = (notesPage - 1) * notesPerPage;
  const notesEndIndex = notesStartIndex + notesPerPage;

  const totalCallLogsPages = Math.ceil(callLogs.length / callsPerPage);
  const startCallIndex = (callLogsPage - 1) * callsPerPage;
  const endCallIndex = startCallIndex + callsPerPage;

  const totalPages = Math.ceil(activities.length / activityPerPage);
  const activityStartIndex = (currentPage - 1) * activityPerPage;
  const activityEndIndex = activityStartIndex + activityPerPage;

  const totalEmailPages = Math.ceil(emails.length / emailsPerPage);
  const startEmailIndex = (emailPage - 1) * emailsPerPage;
  const endEmailIndex = startEmailIndex + emailsPerPage;

  const refreshEmails = async () => {
    await fetchActivitiesNew(); // This will update activitiesNew state
  };

  const refreshComments = async () => {
    await fetchComments(); // This will update activitiesNew state
  };
  // Toggle switch component
  const ToggleSwitch = ({ enabled, onToggle }) => (
    <div
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-300'}`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}
      ></div>
    </div>
  );

  // State for organization and contact toggles
  const [showPopup, setShowPopup] = useState(false);
  const [orgToggle, setOrgToggle] = useState(false);
  const [contactToggle, setContactToggle] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [organizationOptions, setOrganizationOptions] = useState<string[]>([]);
  const [contactOptions, setContactOptions] = useState<string[]>([]);

  const composerRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLDivElement>(null)
  //  const handleNewEmailClick = () => {
  //   composerRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  const handleNewEmailClick = () => {
    setShowEmailModal(true); // Show the composer first
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100); // Small delay to allow the component to render
  };

  const handleCommentNavigate = () => {
    setShowCommentModal(true);
    setTimeout(() => {
      commentRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Fetch lead data
  const fetchLeadData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.get`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Lead',
          name: lead.name
        })
      });

      if (response.ok) {
        const result = await response.json();
        setEditedLead(result.message);
      }
    } catch (error) {
      console.error('Error fetching lead data:', error);
      showToast('Failed to fetch lead data', { type: 'error' });
    }
  };

  const fetchActivitiesNew = async () => {
    try {
      setLoading(true);


      const response = await fetch(
        "http://103.214.132.20:8002/api/method/crm.api.activities.get_activities",
        {
          method: "POST",
          headers: {
            "Authorization": "token 1b670b800ace83b:f82627cb56de7f6",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: lead.name
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const comms = data.docinfo.communications;
       const commentAttach = data.docinfo.attachments;
console.log("llo",data.message);
setActivitiesNewAttachment(commentAttach);
      setActivitiesNew(comms);
      
    } catch (err) {
      console.log("error")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesNew();
  }, [listSuccess]); // Empty dependency array means this runs once on mount


  // Fetch activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/method/crm.api.activities.get_activities/`, {
        method: 'POST',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'CRM-LEAD-2025-00113'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("j12222", result)

      // Add error handling for the API response
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch activities');
      }

      const formattedActivities = (result.message || []).map((activity: { name: any; doctype: string; title: any; subject: any; content: any; description: any; creation: any; modified: any; owner: any; }) => ({
        id: activity.name,
        type: activity.doctype?.toLowerCase()?.includes('note') ? 'note' :
          activity.doctype?.toLowerCase()?.includes('call') ? 'call' :
            activity.doctype?.toLowerCase()?.includes('comment') ? 'comment' :
              activity.doctype?.toLowerCase()?.includes('task') ? 'task' : 'edit',
        title: activity.title || activity.subject || activity.doctype || 'Activity',
        description: activity.content || activity.description || '',
        timestamp: activity.creation || activity.modified || new Date().toISOString(),
        user: activity.owner || 'Unknown',
        icon: activity.doctype?.toLowerCase()?.includes('note') ? <FileText className="w-4 h-4" /> :
          activity.doctype?.toLowerCase()?.includes('call') ? <Phone className="w-4 h-4" /> :
            activity.doctype?.toLowerCase()?.includes('comment') ? <MessageSquare className="w-4 h-4" /> :
              activity.doctype?.toLowerCase()?.includes('task') ? <CheckSquare className="w-4 h-4" /> : <Disc className="w-4 h-4" />,
        color: activity.doctype?.toLowerCase()?.includes('note') ? 'bg-blue-500' :
          activity.doctype?.toLowerCase()?.includes('call') ? 'bg-green-500' :
            activity.doctype?.toLowerCase()?.includes('comment') ? 'bg-purple-500' :
              activity.doctype?.toLowerCase()?.includes('task') ? 'bg-orange-500' : 'bg-yellow-500'
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // showToast(`Failed to fetch activities: ${error.message}`,{type:'error'});
      showToast(`Failed to fetch activities: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
      setActivities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes
  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'FCRM Note',
          filters: JSON.stringify([
            ['reference_doctype', '=', 'CRM Lead'],
            ['reference_docname', '=', lead.name]
          ]),
          fields: JSON.stringify(['name', 'title', 'content', 'creation', 'owner'])
        })
      });

      if (response.ok) {
        const result = await response.json();
        setNotes(result.message || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      showToast('Failed to fetch notes', { type: 'error' });
    } finally {
      setNotesLoading(false);
    }
  };

  // Fetch call logs
  const fetchCallLogs = async () => {
    setCallsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Call Log',
          filters: JSON.stringify([
            ['reference_doctype', '=', 'CRM Lead'],
            ['reference_docname', '=', lead.name]
          ]),
          fields: JSON.stringify(['name', 'from', 'to', 'status', 'type', 'duration', 'creation', 'owner'])
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCallLogs(result.message || []);
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
      showToast('Failed to fetch call logs', { type: 'error' });
    } finally {
      setCallsLoading(false);
    }
  };

  // // Fetch comments
  // const fetchComments = async () => {
  //   setCommentsLoading(true);
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/method/crm.api.activities.get_activities`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': AUTH_TOKEN,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //       //   doctype: 'Comment',
  //       //   filters: JSON.stringify([
  //       //     ['reference_doctype', '=', 'CRM Lead'],
  //       //     ['reference_name', '=', lead.name]
  //       //   ]),
  //       //   fields: JSON.stringify(['name', 'content', 'subject', 'comment_type', 'creation', 'owner'])
  //       // })
  //       name: "CRM-LEAD-2025-00106"
  //     });

  //     if (response.ok) {
  //       const result = await response.json();
  //       setComments(result.message || []);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching comments:', error);
  //     showToast('Failed to fetch comments', { type: 'error' });
  //   } finally {
  //     setCommentsLoading(false);
  //   }
  // };


  // const fetchComments = async () => {
  //   setCommentsLoading(true);
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/method/crm.api.activities.get_activities`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': AUTH_TOKEN,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         name: lead.name // ✅ dynamically use the lead name
  //       })
  //     });

  //     if (response.ok) {
  //       const result = await response.json();
  //       setCommentsNew(result)
  //       console.log('ll', result.docinfo.communications)
  //       setCommentAtachment(result.docinfo.communication)
  //       setComments(result.docinfo.comments || []);
  //     } else {
  //       const errorData = await response.json();
  //       console.error("Failed to fetch:", errorData);
  //       showToast(`Failed to fetch comments: ${errorData?.message || response.statusText}`, { type: "error" });
  //     }
  //   } catch (error) {
  //     console.error('Error fetching comments:', error);
  //     showToast('Failed to fetch comments', { type: 'error' });
  //   } finally {
  //     setCommentsLoading(false);
  //   }
  // };
// When fetching comments, ensure attachments are properly parsed
const fetchComments = async () => {
  setCommentsLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/method/crm.api.activities.get_activities`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: lead.name
      })
    });

    if (response.ok) {
      const result = await response.json();
      setCommentsNew(result);
      
      // Process comments with their attachments
      const commentsWithAttachments = result.docinfo.comments.map((comment: { attachments: string; }) => {
        try {
          return {
            ...comment,
            attachments: comment.attachments ? JSON.parse(comment.attachments) : []
          };
        } catch (e) {
          console.error('Error parsing attachments:', e);
          return {
            ...comment,
            attachments: []
          };
        }
      });
      console.log('activitiesNew.docinfo.communicationsactivitiesNew.docinfo.communications',commentsWithAttachments);
      
      setComments(commentsWithAttachments);
    } else {
      const errorData = await response.json();
      console.error("Failed to fetch:", errorData);
      showToast(`Failed to fetch comments: ${errorData?.message || response.statusText}`, { type: "error" });
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    showToast('Failed to fetch comments', { type: 'error' });
  } finally {
    setCommentsLoading(false);
  }
};

  useEffect(() => {
    fetchComments()
  }, [listSuccess])


  // Fetch tasks
  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Task',
          filters: JSON.stringify([
            ['reference_doctype', '=', 'CRM Lead'],
            ['reference_docname', '=', lead.name]
          ]),
          fields: JSON.stringify(['name', 'title', 'description', 'status', 'priority', 'creation', 'owner'])
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(result.message || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('Failed to fetch tasks', { type: 'error' });
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch emails
  const fetchEmails = async () => {
    setEmailsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'Communication',
          filters: JSON.stringify([
            ['reference_doctype', '=', 'CRM Lead'],
            ['reference_name', '=', lead.name],
            ['communication_type', '=', 'Communication']
          ]),
          fields: JSON.stringify(['name', 'sender', 'recipients', 'content', 'creation'])
        })
      });

      if (response.ok) {
        const result = await response.json();
        setEmails(result.message || []);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      showToast('Failed to fetch emails', { type: 'error' });
    } finally {
      setEmailsLoading(false);
    }
  };

  // Fetch files
  const fetchFiles = async () => {
    setFilesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'File',
          filters: JSON.stringify([
            ['attached_to_doctype', '=', 'CRM Lead'],
            ['attached_to_name', '=', lead.name]
          ]),
          fields: JSON.stringify(['name', 'file_name', 'file_url', 'creation', 'owner'])
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFiles(result.message || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      showToast('Failed to fetch files', { type: 'error' });
    } finally {
      setFilesLoading(false);
    }
  };

  // Fetch user options
  const fetchUserOptions = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setUserOptions([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'User',
          filters: JSON.stringify([['company', '=', sessionCompany]]),
          fields: JSON.stringify(['email'])
        })
      });

      if (response.ok) {
        const result = await response.json();
        setUserOptions(result.message?.map((u: any) => u.email) || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch organization options
  const fetchOrganizationOptions = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setOrganizationOptions([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Organization',
          filters: JSON.stringify([['company', '=', sessionCompany]]),
          fields: JSON.stringify(['organization_name'])
        })
      });

      if (response.ok) {
        const result = await response.json();
        setOrganizationOptions(result.message?.map((org: any) => org.organization_name) || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  // Fetch contact options
  const fetchContactOptions = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setContactOptions([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'Contact',
          filters: JSON.stringify([['company', '=', sessionCompany]]),
          fields: JSON.stringify(['first_name'])
        })
      });

      if (response.ok) {
        const result = await response.json();
        const names = (result.message || [])
          .map((c: any) => c.first_name)
          .filter((name: string | undefined) => !!name && name.trim() !== "");
        setContactOptions(Array.from(new Set(names)));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      switch (activeTab) {
        case 'activity':
          await fetchActivities();
          break;
        case 'notes':
          await fetchNotes();
          break;
        case 'calls':
          await fetchCallLogs();
          break;
        case 'comments':
          await fetchComments();
          break;
        case 'tasks':
          await fetchTasks();
          break;
        case 'emails':
          await fetchEmails();
          break;
        case 'files':
          await fetchFiles();
          break;
        default:
          break;
      }
    };

    fetchData();
  }, [activeTab, lead.name]);

  // Fetch initial data
  useEffect(() => {
    fetchLeadData();
    fetchUserOptions();
    fetchOrganizationOptions();
    fetchContactOptions();
  }, []);

  // Handle convert to deal
  const handleConvert = async () => {
    try {
      setLoading(true);
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      // 1. Create Deal
      const dealResponse = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doc: JSON.stringify({
            doctype: 'CRM Deal',
            organization: lead.organization,
            website: lead.website,
            industry: lead.industry,
            territory: lead.territory,
            annual_revenue: lead.annual_revenue,
            salutation: lead.salutation,
            first_name: lead.firstName,
            company: sessionCompany
          })
        })
      });

      if (!dealResponse.ok) {
        throw new Error('Failed to create deal');
      }

      // 2. Mark lead as converted
      const leadResponse = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Lead',
          name: lead.name,
          fieldname: 'converted',
          value: "1"
        })
      });

      if (!leadResponse.ok) {
        throw new Error('Deal created, but failed to update lead');
      }

      showToast('Deal converted successfully!', { type: 'success' });
      setShowPopup(false);
    } catch (error) {
      console.error('Conversion failed:', error);
      showToast('Failed to convert deal.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Add note
  const addNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      showToast('Please fill in all required fields', { type: 'warning' });
      return;
    }

    setNotesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doc: JSON.stringify({
            doctype: 'FCRM Note',
            title: noteForm.title,
            content: noteForm.content,
            reference_doctype: 'CRM Lead',
            reference_docname: lead.name
          })
        })
      });

      if (response.ok) {
        showToast('Note added successfully', { type: 'success' });
        setNoteForm({ title: '', content: '', name: '' });
        await fetchNotes();
        setShowAddNoteModal(false);
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

  // Edit note
  const editNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      showToast('Please fill in all required fields', { type: 'warning' });
      return false;
    }

    setNotesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'FCRM Note',
          name: noteForm.name,
          fieldname: {
            title: noteForm.title,
            content: noteForm.content
          }
        })
      });

      if (response.ok) {
        showToast('Note updated successfully', { type: 'success' });
        setNoteForm({ title: '', content: '', name: '' });
        await fetchNotes();
        setShowAddNoteModal(false);
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

  // Delete note
  const deleteNote = async (name: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    setNotesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.delete`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'FCRM Note',
          name: name
        })
      });
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

  // Add call log
  const addCall = async () => {
    if (callForm.type === 'Outgoing') {
      if (!callForm.from.trim() || !callForm.to.trim()) {
        showToast('Please fill in all required fields', { type: 'warning' });
        return;
      }
    } else if (callForm.type === 'Incoming') {
      if (!callForm.receiver.trim() || !callForm.to.trim()) {
        showToast('Please fill in all required fields', { type: 'warning' });
        return;
      }
    }

    setCallsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doc: JSON.stringify({
            doctype: 'CRM Call Log',
            telephony_medium: 'Manual',
            reference_doctype: 'CRM Lead',
            reference_docname: lead.name,
            type: callForm.type,
            to: callForm.to,
            from: callForm.from,
            status: callForm.status,
            duration: callForm.duration,
            receiver: callForm.receiver,
            id: `call_${Date.now()}`
          })
        })
      });

      if (response.ok) {
        showToast('Call log added successfully', { type: 'success' });
        setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
        await fetchCallLogs();
        setShowCallModal(false);
      } else {
        throw new Error('Failed to add call log');
      }
    } catch (error) {
      console.error('Error adding call:', error);
      showToast('Failed to add call log', { type: 'error' });
    } finally {
      setCallsLoading(false);
    }
  };

  // Edit call log
  const editCall = async () => {
    if (!callForm.from.trim() || !callForm.to.trim()) {
      showToast('Please fill in all required fields', { type: 'warning' });
      return false;
    }

    setCallsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Call Log',
          name: callForm.name,
          fieldname: {
            from: callForm.from,
            to: callForm.to,
            status: callForm.status,
            type: callForm.type,
            duration: callForm.duration
          }
        })
      });

      if (response.ok) {
        showToast('Call log updated successfully', { type: 'success' });
        setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
        await fetchCallLogs();
        setShowCallModal(false);
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

  // Delete call log
  const deleteCall = async (name) => {
    if (!window.confirm('Are you sure you want to delete this call log?')) return;
    setCallsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.delete`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Call Log',
          name: name
        })
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

  // Add task
  const addTask = async () => {
    if (!taskForm.title.trim()) {
      showToast('Please enter task title', { type: 'warning' });
      return;
    }

    setTasksLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doc: JSON.stringify({
            doctype: 'CRM Task',
            reference_doctype: 'CRM Lead',
            reference_docname: lead.name,
            assigned_to: taskForm.assigned_to,
            description: taskForm.description,
            due_date: taskForm.exp_end_date,
            priority: taskForm.priority,
            status: taskForm.status,
            title: taskForm.title
          })
        })
      });

      if (response.ok) {
        showToast('Task added successfully', { type: 'success' });
        setTaskForm({
          title: '',
          description: '',
          status: 'Open',
          priority: 'Medium',
          exp_start_date: '',
          exp_end_date: '',
          assigned_to: '',
          name: ''
        });
        await fetchTasks();
        setShowTaskModal(false);
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

  // Edit task
  const editTask = async () => {
    if (!taskForm.title.trim()) {
      showToast('Please enter task title', { type: 'warning' });
      return false;
    }

    setTasksLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Task',
          name: taskForm.name,
          fieldname: {
            title: taskForm.title,
            description: taskForm.description,
            status: taskForm.status,
            priority: taskForm.priority,
            due_date: taskForm.exp_end_date,
            assigned_to: taskForm.assigned_to
          }
        })
      });

      if (response.ok) {
        showToast('Task updated successfully', { type: 'success' });
        setTaskForm({
          title: '',
          description: '',
          status: 'Open',
          priority: 'Medium',
          exp_start_date: '',
          exp_end_date: '',
          assigned_to: '',
          name: ''
        });
        await fetchTasks();
        setShowTaskModal(false);
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

  // Delete task
  const deleteTask = async (name: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setTasksLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.delete`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Task',
          name: name
        })
      });
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

  // Upload file
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!fileForm.file) {
      showToast('Please select a file', { type: 'warning' });
      return;
    }

    setFilesLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileForm.file);
      formData.append('is_private', '0');
      formData.append('folder', 'Home/Attachments');
      formData.append('doctype', 'CRM Lead');
      formData.append('docname', lead.name);
      formData.append('type', fileForm.file.type);

      const response = await fetch(`${API_BASE_URL}/method/upload_file`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN
        },
        body: formData
      });

      if (response.ok) {
        //showToast('File uploaded successfully', { type: 'success' });
        setShowFileModal(false);
        setFileForm({ file: null, file_name: '', file_url: '' });
        await fetchFiles();
      } else {
        showToast('Failed to upload file', { type: 'error' });
      }
    } catch (error) {
      showToast('Failed to upload file', { type: 'error' });
    } finally {
      setFilesLoading(false);
    }
  };

  // Handle save lead
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Lead',
          name: lead.name,
          fieldname: {
            first_name: editedLead.firstName,
            last_name: editedLead.lastName,
            email: editedLead.email,
            mobile_no: editedLead.mobile,
            organization: editedLead.organization,
            status: editedLead.status,
            website: editedLead.website,
            territory: editedLead.territory,
            industry: editedLead.industry,
            job_title: editedLead.jobTitle,
            source: editedLead.source,
            salutation: editedLead.salutation
          }
        })
      });

      if (response.ok) {
        onSave(editedLead);
        setIsEditing(false);
        showToast('Lead updated successfully', { type: 'success' });
      } else {
        throw new Error('Failed to update lead');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      showToast('Failed to update lead', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };


  const stripHtml = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerHTML || "";
  }

  // const handleReply = (email: any, replyAll: boolean) => {
  //   // Set the recipient (original sender)
  //   let recipient = email.sender;

  //   // For reply all, include original recipients and CCs
  //   let cc = '';
  //   let bcc = '';

  //   if (replyAll) {
  //     // Exclude current user from recipients if they were included
  //     const session = getUserSession();
  //     const currentUserEmail = session?.email;

  //     // Process recipients
  //     const originalRecipients = email.recipients.split(',').map((r: string) => r.trim());
  //     const filteredRecipients = originalRecipients.filter((r: string) => r !== currentUserEmail);

  //     // Process CCs
  //     if (email.cc) {
  //       const originalCCs = email.cc.split(',').map((c: string) => c.trim());
  //       const filteredCCs = originalCCs.filter((c: string) => c !== currentUserEmail);
  //       cc = filteredCCs.join(', ');
  //     }

  //     // Add original recipients to CC (excluding current user and original sender)
  //     const otherRecipients = filteredRecipients.filter((r: string) => r !== email.sender);
  //     if (otherRecipients.length > 0) {
  //       cc = [cc, ...otherRecipients].filter(Boolean).join(', ');
  //     }
  //   }

  //   // Set subject with Re: prefix if not already present
  //   let subject = email.subject || '';
  //   if (!subject.startsWith('Re:')) {
  //     subject = `Re: ${subject}`;
  //   }

  //   // Set the reply data
  //   setReplyData({
  //     recipient,
  //     cc,
  //     bcc,
  //     subject,
  //     message: `\n\n-------- Original Message --------\nFrom: ${email.sender}\nDate: ${formatDate(email.creation)}\nTo: ${email.recipients}\nSubject: ${email.subject}\n\n${email.content}`
  //     //message: ""

  //   });

  //   // Open the email composer
  //   setShowEmailModal(true);
  // };


  const handleReply = (email: any, replyAll: boolean) => {
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    // Set the recipient (original sender)
    let recipient = email.sender;

    // For reply all, include original recipients and CCs
    let cc = '';
    let bcc = '';

    if (replyAll) {
      // Exclude current user from recipients if they were included
      const session = getUserSession();
      const currentUserEmail = session?.email;

      // Process recipients
      const originalRecipients = email.recipients.split(',').map((r: string) => r.trim());
      const filteredRecipients = originalRecipients.filter((r: string) => r !== currentUserEmail);

      // Process CCs
      if (email.cc) {
        const originalCCs = email.cc.split(',').map((c: string) => c.trim());
        const filteredCCs = originalCCs.filter((c: string) => c !== currentUserEmail);
        cc = filteredCCs.join(', ');
      }

      // Process BCCs
      if (email.bcc) {
        const originalBCCs = email.bcc.split(',').map((b: string) => b.trim());
        const filteredBCCs = originalBCCs.filter((b: string) => b !== currentUserEmail);
        bcc = filteredBCCs.join(', ');
      }

      // Add original recipients to CC (excluding current user and original sender)
      const otherRecipients = filteredRecipients.filter((r: string) => r !== email.sender);
      if (otherRecipients.length > 0) {
        cc = [cc, ...otherRecipients].filter(Boolean).join(', ');
      }
    }

    // Set subject with Re: prefix if not already present
    let subject = email.subject || '';
    if (!subject.startsWith('Re:')) {
      subject = `Re: ${subject}`;
    }

    // Set the reply data
    setReplyData({
      recipient,
      cc,
      bcc,  // Make sure to include BCC here
      subject,
      message: `\n\n-------- Original Message --------\nFrom: ${email.sender}\nDate: ${formatDate(email.creation)}\nTo: ${email.recipients}\nSubject: ${email.subject}\n\n${email.content}`
    });

    // Open the email composer
    setShowEmailModal(true);
  };

  function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return `${diffSec} sec ago`;
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

    // fallback to full date if older than a week
    return date.toLocaleString(); // or customize with Intl.DateTimeFormat
  }

  // Handle delete lead
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.delete`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Lead',
          name: lead.name
        })
      });

      if (response.ok) {
        showToast('Lead deleted successfully', { type: 'success' });
        if (onDelete) onDelete(lead.name);
        onBack();
      } else {
        throw new Error('Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast('Failed to delete lead', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Send email
  const sendEmail = async () => {
    if (!emailForm.recipient.trim() || !emailForm.message.trim()) {
      showToast('Please fill all fields', { type: 'warning' });
      return;
    }

    // const handleReply = (email: any, replyAll: boolean) => {
    //   // Set the recipient (original sender)
    //   let recipient = email.sender;

    //   // For reply all, include original recipients and CCs
    //   let cc = '';
    //   let bcc = '';

    //   if (replyAll) {
    //     // Exclude current user from recipients if they were included
    //     const session = getUserSession();
    //     const currentUserEmail = session?.email;

    //     // Process recipients
    //     const originalRecipients = email.recipients.split(',').map((r: string) => r.trim());
    //     const filteredRecipients = originalRecipients.filter((r: string) => r !== currentUserEmail);

    //     // Process CCs
    //     if (email.cc) {
    //       const originalCCs = email.cc.split(',').map((c: string) => c.trim());
    //       const filteredCCs = originalCCs.filter((c: string) => c !== currentUserEmail);
    //       cc = filteredCCs.join(', ');
    //     }

    //     // Add original recipients to CC (excluding current user and original sender)
    //     const otherRecipients = filteredRecipients.filter((r: string) => r !== email.sender);
    //     if (otherRecipients.length > 0) {
    //       cc = [cc, ...otherRecipients].filter(Boolean).join(', ');
    //     }
    //   }

    //   // Set subject with Re: prefix if not already present
    //   let subject = email.subject || '';
    //   if (!subject.startsWith('Re:')) {
    //     subject = `Re: ${subject}`;
    //   }

    //   // Set the email form with reply data
    //   setEmailForm({
    //     recipient,
    //     cc,
    //     bcc,
    //     subject,
    //     message: `\n\n-------- Original Message --------\nFrom: ${email.sender}\nDate: ${formatDate(email.creation)}\nTo: ${email.recipients}\nSubject: ${email.subject}\n\n${email.content}`
    //   });

    //   // Open the email composer
    //   setShowEmailModal(true);
    // };


    setEmailsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.core.doctype.communication.email.make`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: emailForm.recipient,
          subject: `Regarding ${lead.firstName} ${lead.lastName || ''}`,
          content: emailForm.message,
          send_email: 1,
          now: 0,
          reference_doctype: 'CRM Lead',
          reference_name: lead.name
        })
      });

      if (response.ok) {
        showToast('Email sent successfully', { type: 'success' });
        setEmailForm({ recipient: '', message: '' });
        await fetchEmails();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      showToast('Failed to send email', { type: 'error' });
    } finally {
      setEmailsLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Qualified':
        return theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
      case 'Working':
      case 'Contacted':
        return theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'Overdue':
      case 'Lost':
        return theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
      case 'New':
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      default:
        return theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
      case 'High':
        return theme === 'dark' ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800';
      case 'Medium':
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      default:
        return theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800';
    }
  };

  // Render field
  const renderField = (label: string, value: string | undefined, isEditing: boolean, onChange?: (value: string) => void, options?: string[]) => {
    return (
      <div className={`p-3 border rounded-md ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'}`}>
        <label className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{label}</label>
        {isEditing ? (
          options ? (
            <select
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
              className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'
                }`}
            >
              {options.map(option => (
                <option key={option} value={option}>{option || 'Select'}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
              className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'
                }`}
            />
          )
        ) : (
          <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value || ''}</p>
        )}
      </div>
    );
  };

  // Render icon field
  const renderIconField = (label: string, value: string | undefined, icon: React.ReactNode, isEditing: boolean, onChange?: (value: string) => void) => {
    return (
      <div className={`p-3 border rounded-md ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'}`}>
        <label className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{label}</label>
        {isEditing ? (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'
              }`}
          />
        ) : (
          <div className="flex items-center space-x-2">
            {icon}
            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value || ''}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b px-4 sm:px-6 py-4 ${theme === 'dark' ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
            </button>
            <div>
              <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {lead.firstName} {lead.lastName || ''} - {lead.organization || 'No Organization'}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{lead.leadId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div>
              {/* Convert Button */}
              <button
                onClick={() => setShowPopup(true)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark'
                  ? 'bg-purplebg text-white hover:bg-purple-700'
                  : 'bg-purplebg text-white hover:bg-purple-700'
                  }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Convert To Deal</span>
              </button>

              {/* Modal */}
              {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                    {/* Close Button */}
                    <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl font-bold"
                    >
                      &times;
                    </button>

                    <h2 className="text-lg font-semibold mb-4">Convert to Deal</h2>

                    {/* Organization Toggle */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Organization</span>
                        <ToggleSwitch
                          enabled={orgToggle}
                          onToggle={() => setOrgToggle(!orgToggle)}
                        />
                      </div>
                      {orgToggle ? (
                        <select className="mt-2 w-full border rounded px-3 py-2">
                          <option value="">Choose Existing Organization</option>
                          {organizationOptions.map(org => (
                            <option key={org} value={org}>{org}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">
                          New organization will be created based on the data in details section
                        </p>
                      )}
                    </div>

                    {/* Contact Toggle */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Contact</span>
                        <ToggleSwitch
                          enabled={contactToggle}
                          onToggle={() => setContactToggle(!contactToggle)}
                        />
                      </div>

                      {contactToggle ? (
                        <select
                          className="mt-2 w-full border rounded px-3 py-2"
                          value={selectedContact}
                          onChange={e => setSelectedContact(e.target.value)}
                        >
                          <option value="">Choose Existing Contact</option>
                          {contactOptions.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">
                          New contact will be created based on the person's details
                        </p>
                      )}
                    </div>

                    {/* Convert Button */}
                    <button
                      onClick={handleConvert}
                      className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Convert'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
            <Listbox
              value={editedLead.status}
              onChange={(newStatus: Lead['status']) => {
                setEditedLead(prev => {
                  const updated = { ...prev, status: newStatus };
                  handleSave(updated); // ensure we use correct state immediately
                  return updated;
                });
              }}
            >
              <div className="relative inline-block w-48">
                <Listbox.Button
                  className={`pl-8 pr-4 py-2 rounded-lg transition-colors appearance-none w-full text-left ${theme === 'dark' ? 'bg-purplebg text-white' : 'bg-black text-white'}`}
                >
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaCircleDot className={statusColors[editedLead.status]} />
                  </span>
                  {editedLead.status}
                </Listbox.Button>
                <Listbox.Options className={`absolute mt-1 w-full rounded-md shadow-lg z-[9999] bg-white`}>
                  {statusOptions.map((option) => (
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
                          <span className={`${selected ? 'font-semibold' : 'font-normal'}`}>{option}</span>
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
      <div className={`border-b ${theme === 'dark' ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30' : 'bg-white border-gray-200'}`}>
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                  ? `${theme === 'dark' ? 'border-purple-500 text-purple-400' : 'border-blue-500 text-blue-600'}`
                  : `${theme === 'dark' ? 'border-transparent text-white hover:text-white hover:border-purple-500/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {/* {tab.id === 'activity' && (
                  <span className={`${theme === 'dark' ? 'bg-purple-900/30 text-gray-200' : 'bg-gray-100 text-gray-600'
                    } text-sm font-semibold rounded-full px-2 py-1`}>
                    {activities.length}
                  </span>
                )} */}
                {/* {tab.id === 'notes' && (
                  <span className={`${theme === 'dark' ? 'bg-purple-900/30 text-gray-200' : 'bg-gray-100 text-gray-600'
                    } text-sm font-semibold rounded-full px-2 py-1`}>
                    {notes.length}
                  </span>
                )} */}
                {/* {tab.id === 'calls' && (
                  <span className={`${theme === 'dark' ? 'bg-purple-900/30 text-gray-200' : 'bg-gray-100 text-gray-600'
                    } text-sm font-semibold rounded-full px-2 py-1`}>
                    {callLogs.length}
                  </span>
                )} */}
                {/* {tab.id === 'comments' && (
                  <span className={`${theme === 'dark' ? 'bg-purple-900/30 text-gray-200' : 'bg-gray-100 text-gray-600'
                    } text-sm font-semibold rounded-full px-2 py-1`}>
                    {comments?.length}
                  </span>
                )} */}
                {/* {tab.id === 'tasks' && (
                  <span
                    className={`${theme === 'dark' ? 'bg-purple-900/30 text-gray-200' : 'bg-gray-100 text-gray-600'
                    } text-sm font-semibold rounded-full px-2 py-1`}
                    >
                 {tasks.length} 
                  </span>
                )} */}
                {/* {tab.id === 'emails' && (
                  <span className={`${theme === 'dark' ? 'bg-purple-900/30 text-gray-200' : 'bg-gray-100 text-gray-600'
                    } text-sm font-semibold rounded-full px-2 py-1`}>
                     {activitiesNew?.docinfo?.communications?.length || 0} 
                  </span>
                )} */}
                {/* {tab.id === 'files' && (
                  <span
                   className={`${theme === 'dark' ? 'bg-purple-900/30 text-gray-200' : 'bg-gray-100 text-gray-600'}
          text-sm font-semibold rounded-full px-2 py-1`}
          >
                    {files.length}
                  </span>
                )} */}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div >
          {activeTab === 'overview' && (
            isEditing ? (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                    ? 'text-white border border-purple-500/30 hover:bg-purple-800/50'
                    : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark'
                    ? 'bg-purplebg text-white hover:bg-purple-700'
                    : 'bg-purplebg text-white hover:purple-700'
                    } disabled:opacity-50`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark'
                  ? 'bg-purplebg text-white hover:bg-purple-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )
          )}
        </div>
        <div >
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Basic Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {renderField('First Name', editedLead.firstName, isEditing, (value) => setEditedLead({ ...editedLead, firstName: value }))}
                  {renderField('Last Name', editedLead.lastName, isEditing, (value) => setEditedLead({ ...editedLead, lastName: value }))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {renderField('Salutation', editedLead.salutation, isEditing, (value) => setEditedLead({ ...editedLead, salutation: value }), salutationOptions)}
                  {renderIconField('Email', editedLead.email, <Mail className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`} />, isEditing, (value) => setEditedLead({ ...editedLead, email: value }))}
                </div>

                {renderIconField('Mobile', editedLead.mobile, <Phone className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`} />, isEditing, (value) => setEditedLead({ ...editedLead, mobile: value }))}
                {renderField(
                  'Organization',
                  editedLead.organization,
                  isEditing,
                  (value) => setEditedLead({ ...editedLead, organization: value }),
                  organizationOptions
                )}

                {renderField('Status', editedLead.status, isEditing, (value) => setEditedLead({ ...editedLead, status: value as Lead['status'] }), statusOptions)}
              </div>
            </div>

            {/* Additional Information */}
            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Additional Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {renderIconField('Website', editedLead.website, <Globe className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`} />, isEditing, (value) => setEditedLead({ ...editedLead, website: value }))}
                  {renderField('Job Title', editedLead.jobTitle, isEditing, (value) => setEditedLead({ ...editedLead, jobTitle: value }))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {renderIconField('Territory', editedLead.territory, <MapPin className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`} />, isEditing, (value) => setEditedLead({ ...editedLead, territory: value }))}
                  {renderField('Source', editedLead.source, isEditing, (value) => setEditedLead({ ...editedLead, source: value }), sourceOptions)}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {renderField('Lead Owner', editedLead.lead_owner, isEditing, (value) => setEditedLead({ ...editedLead, lead_owner: value }))}
                  {renderField('Industry', editedLead.industry, isEditing, (value) => setEditedLead({ ...editedLead, industry: value }), industryOptions)}
                </div>

                {renderIconField('Assigned To', lead.assignedTo, <User className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`} />, false)}
                {renderIconField('Last Modified', lead.lastModified, <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`} />, false)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>List of Activities</h3>

            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-white'} mx-auto mb-4`} />
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No activities yet</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {activities.slice(activityStartIndex, activityEndIndex).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${activity.color}`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activity.title}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{formatDate(activity.timestamp)}</p>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-1`}>{activity.description}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'} mt-1`}>by {activity.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`text-sm px-3 py-1 border rounded-md ${theme === 'dark' ? 'text-white bg-dark-accent hover:bg-purple-800/50 border-purple-500/30' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300'
                      } disabled:opacity-50`}
                  >
                    Previous
                  </button>

                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                    Page {currentPage} of {totalPages}
                  </p>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`text-sm px-3 py-1 border rounded-md ${theme === 'dark' ? 'text-white bg-dark-accent hover:bg-purple-800/50 border-purple-500/30' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300'
                      } disabled:opacity-50`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              <div className='flex justify-between items-center gap-5'>
                <h3 className={`text-lg font-semibold mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create Note</h3>
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Note</span>
                </button>
              </div>
            </div>

            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Notes ({notes.length})
              </h3>

              {notesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-white'} mx-auto mb-4`} />
                  <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No notes yet</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 grid grid-cols-3 gap-4">
                    {notes.slice(notesStartIndex, notesEndIndex).map((note) => (
                      <div
                        key={note.name}
                        className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-white hover:bg-purple-800/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                        onDoubleClick={() => {
                          setNoteForm({
                            title: note.title || '',
                            content: note.content || '',
                            name: note.name || '',
                          });
                          setShowAddNoteModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Double click to edit"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{note.title}</h4>
                            <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-2`}>{note.content}</p>
                            <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-2`}>By: {note.owner}</p>
                            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-2`}>{formatDate(note.creation)}</p>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteNote(note.name);
                            }}
                            title="Delete"
                            className="ml-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                            style={{ lineHeight: 0, height: 32 }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setNotesPage(prev => Math.max(prev - 1, 1))}
                      disabled={notesPage === 1}
                      className={`text-sm px-3 py-1 border rounded-md ${theme === 'dark' ? 'text-white bg-dark-accent hover:bg-purple-800/50 border-purple-500/30' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300'
                        } disabled:opacity-50`}
                    >
                      Previous
                    </button>

                    <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                      Page {notesPage} of {totalNotesPages}
                    </p>

                    <button
                      onClick={() => setNotesPage(prev => Math.min(prev + 1, totalNotesPages))}
                      disabled={notesPage === totalNotesPages}
                      className={`text-sm px-3 py-1 border rounded-md ${theme === 'dark' ? 'text-white bg-dark-accent hover:bg-purple-800/50 border-purple-500/30' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300'
                        } disabled:opacity-50`}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>

            {showAddNoteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className={`w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 relative`}>
                  <button
                    onClick={() => {
                      setShowAddNoteModal(false);
                      setNoteForm({ title: '', content: '', name: '' });
                    }}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                  >
                    ✕
                  </button>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {noteForm.name ? 'Edit Note' : 'Create Note'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Title *</label>
                      <input
                        type="text"
                        value={noteForm.title}
                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                        placeholder="Enter note title"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Content *</label>
                      <textarea
                        value={noteForm.content}
                        onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                        placeholder="Enter note content"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={noteForm.name ? editNote : addNote}
                        disabled={notesLoading}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'} disabled:opacity-50`}
                      >
                        {notesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{noteForm.name ? 'Update' : 'Submit'}</span>
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
            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              <div className='flex justify-between items-center gap-5'>
                <h3 className={`text-lg font-semibold mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add Call Log</h3>
                <button
                  onClick={() => setShowCallModal(true)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Call Log</span>
                </button>
              </div>
            </div>

            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Call Logs ({callLogs.length})
              </h3>

              {callsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : callLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-white'} mx-auto mb-4`} />
                  <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No call logs yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {callLogs.slice(startCallIndex, endCallIndex).map((call) => (
                      <div
                        key={call.name}
                        className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-purple-500/30 hover:bg-purple-800/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                        onDoubleClick={() => {
                          setCallForm({
                            from: call.from || '',
                            to: call.to || '',
                            status: call.status || 'Ringing',
                            type: call.type || 'Outgoing',
                            duration: call.duration || '',
                            receiver: call.receiver || '',
                            name: call.name || '',
                          });
                          setShowCallModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Double click to edit"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-full ${call.type === 'Outgoing'
                                ? theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                                : theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
                                }`}
                            >
                              <Phone
                                className={`w-4 h-4 ${call.type === 'Outgoing'
                                  ? theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                                  : theme === 'dark' ? 'text-green-300' : 'text-green-600'
                                  }`}
                              />
                            </div>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{call.type} Call</p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                                {call.from} → {call.to}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(call.status)}`}
                            >
                              {call.status}
                            </span>
                            {call.duration && (
                              <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'} mt-1`}>
                                {call.duration} min
                              </p>
                            )}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteCall(call.name);
                              }}
                              title="Delete"
                              className="mt-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                              style={{ lineHeight: 0 }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        <div className={`flex items-center space-x-4 mt-3 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                          <span>By: {call.owner}</span>
                          <span>{formatDate(call.creation)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCallLogsPage(prev => Math.max(prev - 1, 1))}
                      disabled={callLogsPage === 1}
                      className={`text-sm px-3 py-1 border rounded-md ${theme === 'dark' ? 'text-white bg-dark-accent hover:bg-purple-800/50 border-purple-500/30' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300'
                        } disabled:opacity-50`}
                    >
                      Previous
                    </button>

                    <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                      Page {callLogsPage} of {totalCallLogsPages}
                    </p>

                    <button
                      onClick={() => setCallLogsPage(prev => Math.min(prev + 1, totalCallLogsPages))}
                      disabled={callLogsPage === totalCallLogsPages}
                      className={`text-sm px-3 py-1 border rounded-md ${theme === 'dark' ? 'text-white bg-dark-accent hover:bg-purple-800/50 border-purple-500/30' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300'
                        } disabled:opacity-50`}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>

            {showCallModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className={`w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 relative`}>
                  <button
                    onClick={() => {
                      setShowCallModal(false);
                      setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
                    }}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                  >
                    ✕
                  </button>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {callForm.name ? 'Edit Call Log' : 'Add Call Log'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Type</label>
                      <select
                        value={callForm.type}
                        onChange={e => setCallForm({ ...callForm, type: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                      >
                        <option value="Outgoing">Outgoing</option>
                        <option value="Incoming">Incoming</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>To *</label>
                      <input
                        type="text"
                        value={callForm.to}
                        onChange={(e) => setCallForm({ ...callForm, to: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                        placeholder="Recipient number"
                      />
                    </div>
                    {callForm.type === 'Outgoing' ? (
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>From *</label>
                        <input
                          type="text"
                          value={callForm.from}
                          onChange={(e) => setCallForm({ ...callForm, from: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                          placeholder="Caller number"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Received By *</label>
                        <select
                          value={callForm.receiver}
                          onChange={e => setCallForm({ ...callForm, receiver: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                        >
                          <option value="">Select User</option>
                          {userOptions.map(email => (
                            <option key={email} value={email}>{email}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Status</label>
                      <select
                        value={callForm.status}
                        onChange={(e) => setCallForm({ ...callForm, status: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                      >
                        {callStatusOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Duration (minutes)</label>
                      <input
                        type="number"
                        value={callForm.duration}
                        onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                        placeholder="Call duration"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={callForm.name ? editCall : addCall}
                      disabled={callsLoading}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark'
                        ? 'bg-purplebg text-white hover:bg-purple-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      {callsLoading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Save className="w-4 h-4" />
                      }
                      <span>{callForm.name ? 'Update' : 'Submit'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="">
            <div className={` p-6 ${theme === 'dark' ? ' border-white' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center gap-4">
                <h3 className={`text-2xl font-semibold mb-0 ${theme === 'dark' ? "text-white" : "text-black"} mb-4`}>Comments</h3>
                <button
                  // onClick={() => setShowCommentModal(prev => !prev)}
                  onClick={handleCommentNavigate}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Comment</span>
                </button>
              </div>
              {/* {showCommentModal && (
                <CommentCreate
                  reference_doctype="CRM Lead"
                  reference_name={lead.name}
                  onSuccess={fetchComments}
                  onClose={() => setShowCommentModal(false)}
                />
              )} */}

            </div>
            <div className={`rounded-lg max-h-[400px] overflow-y-auto pr-2  shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              {/* <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Comments ({comments.length})</h3> */}
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">

                  <MessageSquare className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-white'} mx-auto mb-4`} />
                  <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No comments yet</p>
                </div>
              ) : (
                <div className="space-y-4 ">
                  {comments.map((comment) => {


                    // let attachments = [];
                    // try {
                    //   attachments = commentAttachment?.docinfo?.attachments? JSON.parse(commentAttachment?.docinfo?.attachments) : [];
                    // } catch (e) {
                    //   console.error('Error parsing attachments:', e);
                    //   attachments = [];
                    // }

        //                let attachments = [];
        // try {
        //   attachments = comment.attachments ? JSON.parse(comment.attachments) : [];
        //   console.log('1lpp',attachments);
        // } catch (e) {
        //   console.error('Error parsing attachments:', e);
        //   attachments = [];
        // }

        //  const attachments = activitiesNewAttachment || [];
        //             console.log('1lp',attachments);
                    
                     let attachments = [];
                    try {
                      attachments = activitiesNewAttachment ? (activitiesNewAttachment) : [];
                    } catch (e) {
                      console.error('Error parsing attachments:', e);
                      attachments = [];
                    }
                    return (<>
                      <div className='flex gap-2'>
                        <div className='flex flex-col items-center '>
                          <div className="w-7 h-10 flex items-center justify-center bg-gray-500 rounded-full">
                            <FaRegComment className="w-4 h-4 text-purple-300" />
                          </div>
                          <div className='w-px h-full bg-gray-300 my-2'></div>
                        </div>

                        <div
                          key={comment.name}
                          className={`border w-full rounded-lg p-4 ${theme === 'dark' ? 'border-purple-500/30 hover:bg-purple-800/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                        >
                          <div className="flex items-start space-x-3">

                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className={`font-medium px-2 py-1 rounded-full bg-slate-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comment.owner.charAt(0).toUpperCase()}</span>
                                  <span className={`font-medium ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}> <span className="text-gray-300">{comment.owner}</span></span>
                                  {/* <span className={`font-medium ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>added a <span classname=>comment</span></span> */}
                                  <span className={`font-medium ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    added a <span className="text-gray-300">comment</span>
                                  </span>

                                </div>
                                <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{getRelativeTime(comment.creation)}</span>
                              </div>
                              <p className={` bg-gray-800 p-3 rounded ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-2`}>{stripHtml(comment.content)}</p>

                              {/* {attachments.length > 0 && (
                                <div className="mt-3">
                                  <p className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                                    Attachments:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {attachments.map((attachment: any, index: number) => (
                                      <a
                                        key={index}
                                        // href={attachment.file_url}
                                        href={`http://103.214.132.20:8002${attachment.file_url}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-white hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                                      >
                                        <File className="w-4 h-4" />
                                        <span className="text-sm">
                                          {attachment.file_name}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )} */}

                                      {attachments.length > 0 && (
          <div className="mt-3">
            <p className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
              Attachments:
            </p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment: { file_url: string; file_name: any; }, index: React.Key | null | undefined) => (
                <a
                  key={index}
                  href={`http://103.214.132.20:8002${attachment.file_url}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-white hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  <File className="w-4 h-4" />
                  <span className="text-sm">
                    {attachment.file_name || attachment.file_url.split('/').pop()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

                              {comment.subject && (
                                <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mt-1`}>Subject: {comment.subject}</p>
                              )}
                              <div className={`flex items-center space-x-4 mt-3 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                {/* <span>By: {comment.owner}</span> */}
                                {/* <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this comment?')) {
                                  fetch(`${API_BASE_URL}/method/frappe.client.delete`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': AUTH_TOKEN,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                      doctype: 'Comment',
                                      name: comment.name
                                    })
                                  })
                                  .then(() => fetchComments())
                                  .catch(error => {
                                    console.error('Error deleting comment:', error);
                                    showToast('Failed to delete comment', { type: 'error' });
                                  });
                                }
                              }}
                              title="Delete"
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                              style={{ lineHeight: 0 }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button> */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                    )
                  })}
                </div>
              )}
            </div>
            <div ref={commentRef}>
              {showCommentModal && (
                <EmailComposerleads
                  onClose={() => {
                    setShowCommentModal(false);
                    setReplyData(undefined); // Clear reply data when closing
                  }}
                  lead={lead}
                  deal={undefined}
                  setListSuccess={setListSuccess}
                  refreshEmails={refreshComments}
                  replyData={replyData} // Pass the reply data
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              <div className='flex justify-between items-center gap-5'>
                <h3 className={`text-lg font-semibold mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add Task</h3>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tasks ({tasks.length})</h3>
              {tasksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-white'} mx-auto mb-4`} />
                  <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.name}
                      className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-purple-500/30 hover:bg-purple-800/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                      onDoubleClick={() => {
                        setTaskForm({
                          title: task.title || '',
                          description: task.description || '',
                          status: task.status || 'Open',
                          priority: task.priority || 'Medium',
                          exp_start_date: task.exp_start_date || '',
                          exp_end_date: task.exp_end_date || '',
                          assigned_to: task.assigned_to || '',
                          name: task.name || '',
                        });
                        setShowTaskModal(true);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="Double click to edit"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                            <CheckSquare className={`w-4 h-4 ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{task.title}</h4>
                            {task.description && (
                              <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-1 whitespace-pre-line`}>
                                {task.description}
                              </p>
                            )}
                            <div className={`flex items-center space-x-4 mt-3 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                              <span>By: {task.owner}</span>
                              <span>{formatDate(task.creation)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2 flex flex-col items-end">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.exp_end_date && (
                            <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>Due: {new Date(task.exp_end_date).toLocaleDateString()}</p>
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteTask(task.name);
                            }}
                            title="Delete"
                            className="mt-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                            style={{ lineHeight: 0 }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showTaskModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className={`w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 relative`}>
                  <button
                    onClick={() => {
                      setShowTaskModal(false);
                      setTaskForm({
                        title: '',
                        description: '',
                        status: 'Open',
                        priority: 'Medium',
                        exp_start_date: '',
                        exp_end_date: '',
                        assigned_to: '',
                        name: ''
                      });
                    }}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                  >
                    ✕
                  </button>

                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {taskForm.name ? 'Edit Task' : 'Add Task'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Title *</label>
                      <input
                        type="text"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                        placeholder="Task title"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Status</label>
                      <select
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                      >
                        {taskStatusOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Priority</label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                      >
                        {taskPriorityOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Due Date</label>
                      <input
                        type="date"
                        value={taskForm.exp_end_date}
                        onChange={(e) => setTaskForm({ ...taskForm, exp_end_date: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Assigned To</label>
                      <select
                        value={taskForm.assigned_to}
                        onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                      >
                        <option value="">Select User</option>
                        {userOptions.map(email => (
                          <option key={email} value={email}>{email}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Description</label>
                      <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-white-31 border-white text-white' : 'border-gray-300'}`}
                        placeholder="Task description"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={taskForm.name ? editTask : addTask}
                      disabled={tasksLoading}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                    >
                      {tasksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{taskForm.name ? 'Update' : 'Submit'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'files' && (
          <div className="">
            <div className={`rounded-lg  p-6 ${theme === 'dark' ? ' border-white' : 'bg-white border-gray-200'}`}>
              <div className='flex justify-between items-center gap-5'>
                <h3 className={`text-lg font-semibold mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Attachments</h3>
                <button
                  onClick={() => setShowFileModal(true)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Attachment</span>
                </button>
              </div>
            </div>
            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Files ({files.length})</h3>
              {filesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-white'} mx-auto mb-4`} />
                  <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No files yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {files.map(file => (
                    <div key={file.name} className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-white hover:bg-purple-800/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                            {file.file_name}
                          </a>
                          <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>By: {file.owner}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{formatDate(file.creation)}</p>
                        </div>
                        {/* Optionally add a delete button here */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showFileModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className={`w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 relative`}>
                  <button
                    onClick={() => setShowFileModal(false)}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                  >
                    ✕
                  </button>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upload File</h3>
                  <form onSubmit={handleFileUpload}>
                    <input
                      type="file"
                      onChange={e => setFileForm({ ...fileForm, file: e.target.files[0] })}
                      className="mb-4"
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                      disabled={filesLoading}
                    >
                      {filesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>Upload</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* {activeTab === 'emails' && (
  <div className=" space-y-6 ">
    <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
      <div className='flex justify-between items-center gap-5'>
        <h3 className={`text-lg font-semibold mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Send Email</h3>
        <button
         // onClick={() => setShowEmailModal(true)}
         onClick={() => setShowEmailModal(prev => !prev)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
        >
          <Mail className="w-4 h-4" />
          <span>Send Email</span>
        </button>
      </div>
    </div>

    <div className={`rounded-lg shadow-sm border p-6 max-h-[600px] overflow-y-auto pr-10 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Email Communications ({activitiesNew?.docinfo?.communications?.length || 0})
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : !activitiesNew?.docinfo?.communications || activitiesNew.docinfo.communications.length === 0 ? (
        <div className="text-center py-8">
          <Mail className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-white'} mx-auto mb-4`} />
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No emails yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activitiesNew.docinfo.communications.map((comm: any) => (
            <div
              key={comm.name}
              className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-purple-500/30 hover:bg-purple-800/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <Mail className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {comm.subject || "No Subject"}
                    </h4>
                   <div className='flex gap-2'>
                      <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${comm.delivery_status === 'Sent' ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-500'}`}>
                      {comm.delivery_status || "N/A"}
                    </span>
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                      {formatDate(comm.creation)}
                    </span>
                     <Reply className="w-4 h-4" />
                      
                   </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                      <span className="font-semibold">From:</span> {comm.sender}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                      <span className="font-semibold">To:</span> {comm.recipients}
                    </p>
                    {comm.cc && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                        <span className="font-semibold">CC:</span> {comm.cc}
                      </p>
                    )}
                    {comm.bcc && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                        <span className="font-semibold">BCC:</span> {comm.bcc}
                      </p>
                    )}
                   
                  </div>

                  {comm.content && (
                    <div className={`mt-3 p-3 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {comm.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)} */}


        {activeTab === 'emails' && (
          <div className="">
            <div className={`rounded-lg   p-6 ${theme === 'dark' ? ' border-white' : 'bg-white border-gray-200'}`}>
              <div className='flex justify-between items-center gap-5'>
                <h3 className={`text-2xl font-semibold mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Emails</h3>
                <button
                  // onClick={() => setShowEmailModal(prev => !prev)}
                  onClick={handleNewEmailClick}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                >
                  {/* <Mail className="w-4 h-4" /> */}
                  <Plus className="w-5 h-5 text-gray-600 dark:text-white" />
                  <span  >New Email</span>
                </button>
              </div>
            </div>

            <div className={`rounded-lg shadow-sm border p-6 max-h-[400px] overflow-y-auto pr-10 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-200'}`}>
              {/* <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Email Communications ({activitiesNew?.docinfo?.communications?.length || 0})
              </h3> */}

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : !activitiesNew?.docinfo?.communications || activitiesNew.docinfo.communications.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-white'} mx-auto mb-4`} />
                  <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No emails yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activitiesNew.docinfo.communications.map((comm: any) => {

                    // const attachments = comm.attachments ? JSON.parse(comm.attachments) : [];
                    //         let attachments = [];
                    // try {
                    //   attachments = comm.attachments ? JSON.parse(comm.attachments) : [];
                    // } catch (e) {
                    //   console.error('Error parsing attachments:', e);
                    //   attachments = [];
                    // }


                    let attachments = [];
                    try {
                      attachments = comm.attachments ? JSON.parse(comm.attachments) : [];
                    } catch (e) {
                      console.error('Error parsing attachments:', e);
                      attachments = [];
                    }
                    return (<>
                      <div className='flex gap-2'>
                        {/* <div >
                    <h1 className='text-white px-2 py-1 bg-black rounded'>h</h1>
                    </div> */}
                        <div className='flex flex-col items-center '>
                          <div className="w-7 h-10 flex items-center justify-center bg-gray-500 rounded-full">
                            <h1 className="text-white text-sm">{comm.sender?.charAt(0).toUpperCase()}</h1>
                          </div>
                          <div className='w-px h-full bg-gray-300 my-2'></div>
                        </div>

                        <div
                          key={comm.name}
                          className={`border rounded-lg p-4 w-full ${theme === 'dark' ? 'border-purple-500/30 hover:bg-purple-800/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                        >
                          <div className="flex items-start space-x-3">
                            {/* <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                          <Mail className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />
                        </div> */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {comm.subject || "No Subject"}
                                </h4>
                                <div className='flex gap-2'>
                                  {/* <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${comm.delivery_status === 'Sent' ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-500'}`}>
                                {comm.delivery_status || "N/A"}
                              </span> */}
                                  <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                    {getRelativeTime(comm.creation)}
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleReply(comm, false)}
                                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                      title="Reply"
                                    >
                                      <Reply className="w-4 h-4 text-white" />

                                    </button>
                                    <button
                                      onClick={() => handleReply(comm, true)}
                                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                      title="Reply All"
                                    >
                                      {/* <CornerUpRight className="w-4 h-4" /> */}
                                      <ReplyAll className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 space-y-1">
                                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                                  <span className="font-semibold">From:</span> {comm.sender}
                                </p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                                  <span className="font-semibold">To:</span> {comm.recipients}
                                </p>
                                {comm.cc && (
                                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                                    <span className="font-semibold">CC:</span> {comm.cc}
                                  </p>
                                )}
                                {comm.bcc && (
                                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                                    <span className="font-semibold">BCC:</span> {comm.bcc}
                                  </p>
                                )}
                              </div>

                              {comm.content && (
                                <div className={`mt-3 p-3 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                    {comm.content}
                                  </p>
                                </div>
                              )}

                              {attachments.length > 0 && (
                                <div className="mt-3">
                                  <p className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                                    Attachments:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {attachments.map((attachment: any, index: number) => (
                                      <a
                                        key={index}
                                        // href={attachment.file_url}
                                        href={`http://103.214.132.20:8002${attachment.file_url}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-white hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                                      >
                                        <File className="w-4 h-4" />
                                        <span className="text-sm">
                                          {attachment.file_url.split('/').pop()}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>)
                  }
                  )}
                </div>
              )}
            </div>
            <div ref={composerRef}>
              {showEmailModal && (
                <EmailComposerleads
                  onClose={() => {
                    setShowEmailModal(false);
                    setReplyData(undefined); // Clear reply data when closing
                  }}

                  lead={lead}
                  deal={undefined}
                  setListSuccess={setListSuccess}
                  refreshEmails={refreshEmails}
                  replyData={replyData} // Pass the reply data
                />
              )}
            </div>
          </div>
        )}

        {/* {showEmailModal && (
                <EmailComposer onClose={() => setShowEmailModal(false)} />
              )} */}
      </div>

      {/* {showEmailModal && (
  <EmailComposer 
          onClose={() => setShowEmailModal(false)}
          lead={lead} deal={undefined} 
          setListSuccess={setListSuccess}
          refreshEmails={refreshEmails}
           replyData={replyData}
          />
)} */}

      {/* {showEmailModal && (
  <EmailComposer 
    onClose={() => setShowEmailModal(false)}
    lead={lead} 
    deal={undefined} 
    setListSuccess={setListSuccess}
    refreshEmails={refreshEmails}
    replyData={replyData} // Add this if you want to pass specific reply data
  />
)} */}



    </div>
  );
}