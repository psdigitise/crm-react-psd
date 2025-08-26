
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { showToast } from '../utils/toast';
import { Listbox } from '@headlessui/react';
import EmailComposerleads from '../components/Leads/EmailComposerleads';

// Icons
import {
  ArrowLeft,
  Save,
  Plus,
  Phone,
  Mail,
  FileText,
  Loader2,
  Building2,
  Trash2,
  Paperclip,
  Disc,
  File,
  Layers,
  UserPlus
} from 'lucide-react';
import { FaCircleDot, FaRegComment } from 'react-icons/fa6';
import { HiOutlineMailOpen, HiOutlinePlus } from 'react-icons/hi';
import { IoCloseOutline, IoDocument, IoLockClosedOutline, IoLockOpenOutline } from 'react-icons/io5';
import { LuCalendar, LuReply, LuReplyAll } from 'react-icons/lu';
import { PiDotsThreeOutlineBold } from 'react-icons/pi';
import { TiDocumentText } from 'react-icons/ti';
import { BsThreeDots } from "react-icons/bs";
import { SlCallIn, SlCallOut } from "react-icons/sl";
import { IoIosCalendar } from "react-icons/io";
import { RiShining2Line } from "react-icons/ri";
import { SiTicktick } from "react-icons/si";
import { DeleteTaskPopup } from './TaskPopups/DeleteTaskPopups';
import { CallDetailsPopup } from './CallLogPopups/CallDetailsPopup';
import LeadsFilesUploadPopup from './LeadsPopup/LeadsFilesUploadPopup';
import { DeleteAttachmentPopup } from './DealsAttachmentPopups/DeleteAttachmentPopup';
import LeadPrivatePopup from './LeadsPopup/LeadPrivatePopup';

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
  caller: any;
  receiver: string;
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
  attachments: string;
}

interface Task {
  due_date: any;
  assigned_to: string;
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
  recipients: any;
  files: boolean;
  action: string;
  data: any;
  id: string;
  type: 'note' | 'call' | 'comment' | 'task' | 'edit' | 'email' | 'file';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  icon: React.ReactNode;
  color: string;
}

interface Email {
  name: string;
  sender: string;
  recipients: string;
  cc?: string;
  bcc?: string;
  subject: string;
  content: string;
  creation: string;
  in_reply_to?: string;
}

interface TaskForm {
  name: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  start_date?: string;  // Make it optional
  due_date: string;
  assigned_to: string;
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
  const [replyData, setReplyData] = useState<EmailReplyData | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAttachment, setCommentAtachment] = useState<any>([]);
  const [, setCommentsNew] = useState<any>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [changes, setChanges] = useState([]);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [activitiesNew, setActivitiesNew] = useState<any>(null);
  const [activitiesNewAttachment, setActivitiesNewAttachment] = useState<any>(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [callsLoading, setCallsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showDeleteTaskPopup, setShowDeleteTaskPopup] = React.useState(false);
  // const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
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
  const [taskForm, setTaskForm] = useState<TaskForm>({
    name: '',
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
  const [fileForm, setFileForm] = useState({
    file: null,
    file_name: '',
    file_url: '',
  });
  const [notesPage, setNotesPage] = useState(1);
  const [callLogsPage, setCallLogsPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailPage, setEmailPage] = useState(1);
  const [orgToggle, setOrgToggle] = useState(false);
  const [contactToggle, setContactToggle] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [noteFormError, setNoteFormError] = useState(false);
  const [organizationOptions, setOrganizationOptions] = useState<string[]>([]);
  const [contactOptions, setContactOptions] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);
  const [editingCall, setEditingCall] = React.useState<any | null>(null);
  const userSession = getUserSession();
  const [files, setFiles] = useState<Array<{
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

  const composerRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLDivElement>(null)

  // UI Theme Variables
  const bgColor = theme === 'dark'
    ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
    : 'bg-gray-50';

  const cardBgColor = theme === 'dark'
    ? 'bg-white dark:bg-gray-900 border-gray-800'
    : 'bg-white';

  const borderColor = theme === 'dark'
    ? 'border-gray-600'
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

  const tabs = [
    { id: 'activity', label: 'Activity', icon: RiShining2Line },
    { id: 'emails', label: 'Emails', icon: HiOutlineMailOpen },
    { id: 'comments', label: 'Comments', icon: FaRegComment },
    { id: 'overview', label: 'Data', icon: TiDocumentText },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'tasks', label: 'Tasks', icon: SiTicktick },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Attachments', icon: Paperclip },
  ];






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

  const handleNewEmailClick = () => {
    setShowEmailModal(true);
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // const [callShowPopup,setCallShowPopup] = useState(false)

  const [callShowPopup, setCallShowPopup] = useState(false);

  const handleLabelClick = (call: any) => {
    console.log("Clicked call:", call); // ✅ debug log
    setEditingCall(call);
    setCallShowPopup(true);
  };
  function formatDateRelative(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('en-US', options);
  }

  const handleCommentNavigate = () => {
    setShowCommentModal(true);
    setTimeout(() => {
      commentRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const refreshEmails = async () => {
    await fetchActivitiesNew();
  };

  const refreshComments = async () => {
    await fetchComments();
    await fetchActivitiesNew();
  };

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

  const handleAddTaskFromCall = () => {
    console.log("Add Task button clicked!")
    setShowPopup(false);
    setShowTaskModal(true);
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
      const activities = data.message[0] || [];
      const comments = activities
        .filter((activity: any) => activity.activity_type === 'comment')
        .map((comment: any) => ({
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

      const comms = data.docinfo?.communications;
      const commentAttach = data.docinfo.attachments;

      setActivitiesNew(comms);
      setActivitiesNewAttachment(commentAttach);
    } catch (err) {
      console.log("error")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesNew();
  }, [listSuccess, lead.name]);



  const fetchActivities = useCallback(async () => {
    setActivityLoading(true);
    try {
      const response = await fetch(
        "http://103.214.132.20:8002/api/method/crm.api.activities.get_activities",
        {
          method: "POST",
          headers: {
            "Authorization": AUTH_TOKEN,
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



      const result = await response.json();
      const message = result.message || [];
      const docinfo = result.docinfo || {};

      console.log(docinfo)

      // Separate data for individual tabs
      const rawTimeline = message[0] || [];
      const rawCalls = message[1] || [];
      const rawNotes = message[2] || [];
      const rawTasks = message[3] || [];

      setCallLogs(rawCalls);
      setNotes(rawNotes);
      setTasks(rawTasks);

      const rawEmails = rawTimeline
        .filter((item: any) => item.activity_type === 'communication')
        .map((item: any) => ({
          ...item.data,
          id: item.name || `comm-${item.creation}`,
          creation: item.creation,
          // Add recipient information if available in item.data
          recipients: item.data.recipients || item.data.to || '',
        }));
      setEmails(rawEmails);

      const rawComments = rawTimeline.filter((item: any) => item.activity_type === 'comment');
      setComments(rawComments);


      const rawFiles = docinfo.files || [];
      setFiles(rawFiles);

      // Extract file activities from edit activities that have file data
      const fileActivities = rawTimeline
        .filter((item: any) => item.activity_type === "attachment_log")
        .map((item: any) => {
          const fileData = item.data || {};

          return {
            id: item.name,
            type: "file",
            title: `File ${fileData.type === "added" ? "Uploaded" : "Removed"}: ${fileData.file_name || "Unnamed file"}`,
            description: fileData.file_url || "",
            timestamp: item.creation,
            user: item.owner || "Unknown",
            icon: <IoDocument className="w-4 h-4" />,
            data: fileData, // keep full file data (name, url, privacy, type)
            action: fileData.type || "unknown", // 'added' or 'removed'
            isPrivate: fileData.is_private ?? false
          };
        });




      const callActivities = rawCalls.map((call: any) => {
        const caller = call._caller?.label || call.caller || call.from || "Unknown";
        const receiver = call._receiver?.label || call.receiver || call.to || "Unknown";

        return {
          id: call.name,
          type: "call",
          title: `${call.type || "Call"} Call`,
          description: `${caller} → ${receiver}`,
          timestamp: call.creation,
          user: caller,
          icon:
            call.type === "Incoming" || call.type === "Inbound"
              ? <SlCallIn className="w-4 h-4" />
              : <SlCallOut className="w-4 h-4" />,
          data: { ...call, caller, receiver }, // 👈 preserve normalized fields
        };
      });
      console.log(callActivities, "call activities");


      const noteActivities = rawNotes.map((note: any) => ({
        id: note.name,
        type: "note",
        title: `Note Added: ${note.title}`,
        description: note.content,
        timestamp: note.creation,
        user: note.owner,
        icon: <FileText className="w-4 h-4" />,
        data: note, // 👈 keep raw note
      }));


      const taskActivities = rawTasks.map((task: any) => ({
        id: task.name, type: 'task', title: `Task Created: ${task.title}`,
        description: task.description || '', timestamp: task.creation, user: task.assigned_to || 'Unassigned',
        icon: <SiTicktick className="w-4 h-4 text-gray-600" />,
      }));

      const emailActivities = rawEmails.map((email: any) => ({
        id: email.name || email.id, type: 'email', title: `Email: ${email.subject || 'No Subject'}`,
        description: email.content, timestamp: email.creation, user: email.sender_full_name || email.sender || 'Unknown',
        recipients: email.recipients,
        icon: <Mail className="w-4 h-4" />,
      }));

      const commentActivities = rawComments.map((comment: any) => ({
        id: comment.name, type: 'comment', title: 'New Comment', description: comment.content.replace(/<[^>]+>/g, ''), timestamp: comment.creation, user: comment.owner,
        icon: <FaRegComment className="w-4 h-4" />,
      }));

      const otherActivities = rawTimeline
        .filter((item: { activity_type: string; }) =>
          item.activity_type !== 'communication' &&
          item.activity_type !== 'comment'
        )
        .map((item: any) => {
          let type = 'edit';
          let title = `${item.owner} ${item.description || ''}`;
          let icon = <Disc className="w-4 h-4" />;

          if (item.data?.action === 'creation') {
            type = 'creation';
            title = `${item.owner} created this Lead`;
            icon = <UserPlus className="w-4 h-4 text-gray-500" />;
          } else if (item.data?.field_label) {
            type = 'grouped_change';
            title = `${item.owner} changed ${item.data.field_label}`;
            icon = <Layers className="w-4 h-4 text-white" />;
          } else if (typeof item.data === "string") {
            // handle string safely
            title = `${item.owner} ${item.data}`;
          }

          return {
            id: item.name || `other-${item.creation}`,
            type,
            title,
            description: '',
            timestamp: item.creation,
            user: item.owner,
            icon,
            data: item.data,
          };
        });

      // const fileActivities = rawFiles.map((file: any) => ({
      //   id: file.name || `file-${file.file_url}`,
      //   type: "file",
      //   title: `File Uploaded: ${file.file_name || "Unnamed file"}`,
      //   description: file.file_url || "",
      //   timestamp: file.creation,
      //   user: file.owner || "Unknown",
      //   icon: <IoDocument className="w-4 h-4" />,
      //   data: file, // keep full file object
      // }));



      const allActivities = [...callActivities, ...noteActivities, ...taskActivities, ...emailActivities, ...commentActivities, ...fileActivities, ...otherActivities];
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(allActivities);
      console.log(allActivities, "hi");

    } catch (err) {
      console.error("Error fetching activities:", err);
      showToast("Failed to fetch activities", { type: 'error' });
    } finally {
      setActivityLoading(false);
    }
  }, [lead.name]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const isImageFile = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);


  const [fileToDelete, setFileToDelete] = React.useState<{ name: string } | null>(null);

  const [fileToTogglePrivacy, setFileToTogglePrivacy] = React.useState<{
    name: string;
    is_private: number;
  } | null>(null);

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
  const handleInputChange = (field: keyof Lead, value: string) => {
    setEditedLead(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const handleFileUpload = async (input: File[] | string) => {
    try {
      if (typeof input === "string") {
        // 🚨 Here is the missing part
        const formData = new FormData();
        formData.append("file_url", input);
        formData.append("is_private", "0");
        formData.append("folder", "Home/Attachments");
        formData.append("doctype", "CRM Lead");
        formData.append("docname", lead.name);

        const response = await fetch(`${API_BASE_URL}/method/upload_file`, {
          method: "POST",
          headers: {
            Authorization: AUTH_TOKEN,
          },
          body: formData,
        });

        if (!response.ok) {
          showToast("Failed to upload link", { type: "error" });
          return;
        }

        showToast("Link uploaded successfully", { type: "success" });
        setShowFileModal(false);
        await fetchFiles();
        return;
      }

      // ✅ existing file upload logic
      for (const file of input) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("is_private", "0");
        formData.append("folder", "Home/Attachments");
        formData.append("doctype", "CRM Lead");
        formData.append("docname", lead.name);
        formData.append("type", file.type);

        const response = await fetch(`${API_BASE_URL}/method/upload_file`, {
          method: "POST",
          headers: {
            Authorization: AUTH_TOKEN,
          },
          body: formData,
        });

        if (!response.ok) {
          showToast("Failed to upload file", { type: "error" });
          return;
        }
      }

      showToast("File(s) uploaded successfully", { type: "success" });
      setShowFileModal(false);
      await fetchFiles();
    } catch (error) {
      console.error(error);
      showToast("Failed to upload", { type: "error" });
    }
  };


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
            name: lead.name // e.g. "CRM-DEAL-2025-00060"
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
  }, [lead.name]);

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
          fields: JSON.stringify(['name', 'file_name', 'file_url', 'creation', 'owner', 'file_size', 'is_private'])
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

  useEffect(() => {
    fetchLeadData();
    fetchUserOptions();
    fetchOrganizationOptions();
    fetchContactOptions();
  }, []);

  const handleConvert = async () => {
    try {
      setLoading(true);
      const session = getUserSession();
      const sessionCompany = session?.company || '';

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
        setShowNoteModal(false);
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

  // const editNote = async () => {
  //   if (!noteForm.title.trim() || !noteForm.content.trim()) {
  //     showToast('Please fill in all required fields', { type: 'warning' });
  //     return false;
  //   }

  //   setNotesLoading(true);
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': AUTH_TOKEN,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         doctype: 'FCRM Note',
  //         name: noteForm.name,
  //         fieldname: {
  //           title: noteForm.title,
  //           content: noteForm.content
  //         }
  //       })
  //     });

  //     if (response.ok) {
  //       showToast('Note updated successfully', { type: 'success' });
  //       setNoteForm({ title: '', content: '', name: '' });
  //       await fetchNotes();
  //       setShowNoteModal(false);
  //       return true;
  //     } else {
  //       showToast('Failed to update note', { type: 'error' });
  //       return false;
  //     }
  //   } catch (error) {
  //     showToast('Failed to update note', { type: 'error' });
  //     return false;
  //   } finally {
  //     setNotesLoading(false);
  //   }
  // };

  // const deleteNote = async (name: string) => {

  //   try {
  //     const response = await fetch(`${API_BASE_URL}/method/frappe.client.delete`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': AUTH_TOKEN,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         doctype: 'FCRM Note',
  //         name: name
  //       })
  //     });
  //     if (response.ok) {
  //       showToast('Note deleted', { type: 'success' });
  //       await fetchNotes();
  //     } else {
  //       showToast('Failed to delete note', { type: 'error' });
  //     }
  //   } catch (error) {
  //     showToast('Failed to delete note', { type: 'error' });
  //   } finally {
  //     setNotesLoading(false);
  //   }
  // };


  const editNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
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
        setNoteForm({ title: '', content: '', name: '' });
        await fetchNotes();
        setShowNoteModal(false);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setNotesLoading(false);
    }
  };


  const deleteNote = async (name: string) => {
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
        await fetchNotes();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };


  const addCall = async () => {
    if (!callForm.from.trim() || !callForm.to.trim()) {
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    setCallsLoading(true);
    try {
      // Generate a random ID (or you can keep your existing ID generation logic)
      const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Prepare the document data
      const docData = {
        doctype: "CRM Call Log",
        id: randomId,
        telephony_medium: "Manual",
        reference_doctype: "CRM Lead",
        reference_docname: lead.name,
        type: callForm.type === 'Outgoing' ? 'Outgoing' : 'Incoming',
        to: callForm.to,
        from: callForm.from,
        status: callForm.status,
        duration: callForm.duration || "0",
        receiver: userSession?.email || "Administrator" // Use current user's email
      };

      // Call the frappe.client.insert API
      const response = await fetch('http://103.214.132.20:8002/api/method/frappe.client.insert', {
        method: 'POST',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doc: docData
        })
      });

      if (response.ok) {
        setCallForm({
          from: '',
          to: '',
          status: 'Ringing',
          type: 'Outgoing',
          duration: ''
        });
        await fetchCallLogs();
        return true; // Return success status
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add call log');
      }
    } catch (error) {
      console.error('Error adding call log:', error);
      showToast(error.message || 'Failed to add call log', { type: 'error' });
      return false; // Return failure status
    } finally {
      setCallsLoading(false);
    }
  };

  const editCall = async () => {
    if (!callForm.from.trim() || !callForm.to.trim()) {
      showToast('Please fill in all required fields', { type: 'warning' });
      return false;
    }

    setCallsLoading(true);
    try {
      const response = await fetch('http://103.214.132.20:8002/api/method/frappe.client.set_value', {
        method: 'POST',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: "CRM Call Log",
          name: callForm.name, // Existing document name
          fieldname: {
            telephony_medium: "Manual",
            reference_doctype: "CRM Lead",
            reference_docname: lead.name,
            type: callForm.type === 'Outgoing' ? 'Outgoing' : 'Incoming',
            to: callForm.to,
            from: callForm.from,
            status: callForm.status,
            duration: callForm.duration || "0",
            receiver: userSession?.email || "Administrator"
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
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to update call log', { type: 'error' });
        return false;
      }
    } catch (error) {
      showToast('Failed to update call log', { type: 'error' });
      return false;
    } finally {
      setCallsLoading(false);
    }
  };



  const addTask = async (formData: TaskForm) => {
    if (!formData.title.trim()) {
      showToast('Please enter task title', { type: 'warning' });
      return false;
    }

    setTasksLoading(true);
    try {
      // Prepare the task data
      const taskData: any = {
        reference_doctype: 'CRM Lead',
        reference_docname: lead.name,
        assigned_to: formData.assigned_to,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        title: formData.title
      };

      // Only add due_date if it exists
      if (formData.due_date) {
        taskData.due_date = `${formData.due_date} 00:00:00`;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doc: JSON.stringify({
            doctype: 'CRM Task',
            ...taskData
          })
        })
      });

      if (response.ok) {
        showToast('Task added successfully', { type: 'success' });
        setTaskForm({
          name: '',
          title: '',
          description: '',
          status: 'Open',
          priority: 'Medium',
          due_date: '',
          assigned_to: ''
        });
        await fetchTasks();
        setShowTaskModal(false);
        return true;
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        showToast('Failed to add task', { type: 'error' });
        return false;
      }
    } catch (error) {
      console.error('Error adding task:', error);
      showToast('Failed to add task', { type: 'error' });
      return false;
    } finally {
      setTasksLoading(false);
    }
  };

  const editTask = async (taskName: string, formData: TaskForm) => {
    if (!formData.title.trim()) {
      showToast('Please enter task title', { type: 'warning' });
      return false;
    }

    setTasksLoading(true);
    try {
      // Prepare the update data
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to,
        priority: formData.priority,
        status: formData.status
      };

      // Only add due_date if it exists and format it properly
      if (formData.due_date) {
        updateData.due_date = `${formData.due_date} 00:00:00`;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Task',
          name: taskName,
          fieldname: updateData // Correct structure
        })
      });

      if (response.ok) {
        showToast('Task updated successfully', { type: 'success' });
        setTaskForm({
          name: '',
          title: '',
          description: '',
          status: 'Open',
          priority: 'Medium',
          due_date: '',
          assigned_to: ''
        });
        await fetchTasks();
        setShowTaskModal(false);
        return true;
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        showToast('Failed to update task', { type: 'error' });
        return false;
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Failed to update task', { type: 'error' });
      return false;
    } finally {
      setTasksLoading(false);
    }
  };




  const handleSave = async (e: { status?: string; id?: string; name?: string; firstName?: string; lastName?: string | undefined; organization?: string; email?: string; mobile?: string; assignedTo?: string; lastModified?: string; website?: string | undefined; territory?: string | undefined; industry?: string | undefined; jobTitle?: string | undefined; source?: string | undefined; salutation?: string | undefined; leadId?: string; owner?: string | undefined; creation?: string | undefined; modified?: string | undefined; modified_by?: string | undefined; docstatus?: number | undefined; idx?: number | undefined; mobile_no?: string | undefined; naming_series?: string | undefined; lead_name?: string | undefined; gender?: string | undefined; no_of_employees?: string | undefined; annual_revenue?: number | undefined; image?: string | undefined; first_name?: string | undefined; last_name?: string | undefined; lead_owner?: string | undefined; converted?: string | undefined; preventDefault?: any; }) => {
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

  const handleReply = (email: any, replyAll: boolean) => {
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    let recipient = email.sender;
    let cc = '';
    let bcc = '';

    if (replyAll) {
      const session = getUserSession();
      const currentUserEmail = session?.email;

      const originalRecipients = email.recipients.split(',').map((r: string) => r.trim());
      const filteredRecipients = originalRecipients.filter((r: string) => r !== currentUserEmail);

      if (email.cc) {
        const originalCCs = email.cc.split(',').map((c: string) => c.trim());
        const filteredCCs = originalCCs.filter((c: string) => c !== currentUserEmail);
        cc = filteredCCs.join(', ');
      }

      if (email.bcc) {
        const originalBCCs = email.bcc.split(',').map((b: string) => b.trim());
        const filteredBCCs = originalBCCs.filter((b: string) => b !== currentUserEmail);
        bcc = filteredBCCs.join(', ');
      }

      const otherRecipients = filteredRecipients.filter((r: string) => r !== email.sender);
      if (otherRecipients.length > 0) {
        cc = [cc, ...otherRecipients].filter(Boolean).join(', ');
      }
    }

    let subject = email.subject || '';
    if (!subject.startsWith('Re:')) {
      subject = `Re: ${subject}`;
    }

    setReplyData({
      recipient,
      cc,
      bcc,
      subject,
      message: `\n\n-------- Original Message --------\nFrom: ${email.sender}\nDate: ${formatDate(email.creation)}\nTo: ${email.recipients}\nSubject: ${email.subject}\n\n${email.content}`
    });

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

    return date.toLocaleString();
  }

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
                {lead.firstName} {lead.lastName || ''} - {lead.organization || 'No Organization'}
              </h1>
              <p className={`text-sm ${textSecondaryColor}`}>{lead.leadId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div>
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

              {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl font-bold"
                    >
                      &times;
                    </button>

                    <h2 className="text-lg font-semibold mb-4">Convert to Deal</h2>

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
                  handleSave(updated);
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
      <div className={`border-b ${borderColor}`}>
        <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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


                {/* Organization Details Section */}
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
                  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-4`}>Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Organization</label>
                      <input
                        type="text"
                        value={editedLead.organization || ''}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Website</label>
                      <input
                        type="text"
                        value={editedLead.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    {/* <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Territory</label>
                      <input
                        type="text"
                        value={editedLead.territory || ''}
                        onChange={(e) => handleInputChange('territory', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div> */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Territory</label>
                      <select
                        value={editedLead.territory || ''}
                        onChange={(e) => handleInputChange('territory', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      >
                        <option value="">Select Territory</option>
                        <option value="US">US</option>
                        <option value="India">India</option>

                      </select>
                    </div>


                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Industry</label>
                      <input
                        type="text"
                        value={editedLead.industry || ''}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Job Title</label>
                      <input
                        type="text"
                        value={editedLead.jobTitle || ''}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Source
                      </label>
                      <select
                        value={editedLead.source || ""}
                        onChange={(e) => handleInputChange("source", e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      >
                        <option value="">Select Source</option>
                        <option value="Advertisement">Advertisement</option>
                        <option value="Campaign">Campaign</option>
                        <option value="Cold Calling">Cold Calling</option>
                        <option value="Customer's Vendor">Customer's Vendor</option>
                        <option value="Exhibition">Exhibition</option>
                        <option value="Existing Customer">Existing Customer</option>
                        <option value="From Fenila">From Fenila</option>
                        <option value="Reference">Reference</option>
                        <option value="Supplier Reference">Supplier Reference</option>
                        <option value="Walk In">Walk In</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Lead Owner
                      </label>
                      <select
                        value={editedLead.lead_owner || ""}
                        onChange={(e) => handleInputChange("lead_owner", e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="arun@psd.com">arun</option>
                        <option value="demo@psdigitise.com">DEMO</option>
                        <option value="fen87joshi@yahoo.com">feni</option>
                        <option value="fenila@psd.com">fenila</option>
                        <option value="hariprasad@psd.com">hari</option>
                      </select>
                    </div>


                  </div>
                </div>
                {/* Person Information Section */}
                <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>

                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white`}>Person</h3>
                    {isEditing && (
                      <button
                        onClick={handleSave}
                        className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50`}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Salutation</label>
                      <input
                        type="text"
                        value={editedLead.salutation || ''}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>First Name</label>
                      <input
                        type="text"
                        value={editedLead.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Last Name</label>
                      <input
                        type="text"
                        value={editedLead.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Email</label>
                      <input
                        type="email"
                        value={editedLead.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Mobile</label>
                      <input
                        type="tel"
                        value={editedLead.mobile || ''}
                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className={`relative rounded-lg shadow-sm border p-6 pb-24 ${theme === 'dark' ? `bg-gray-900 border-gray-700` : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Activity</h3>

            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <RiShining2Line className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>No activities yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {activities.map((activity) => {
                  switch (activity.type) {
                    case 'call': {
                      const callData = activity.data; // 👈 directly use mapped data
                      if (!callData) return null;

                      return (
                        <div key={`${activity.id}-${activity.timestamp}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div
                                className={`p-2 rounded-full mr-3 flex items-center justify-center
              ${callData.type === 'Incoming' || callData.type === 'Inbound'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-green-100 text-green-600'}`}
                                style={{ width: '32px', height: '32px' }}
                              >
                                {callData.type === 'Incoming' || callData.type === 'Inbound'
                                  ? <SlCallIn className="w-4 h-4" />
                                  : <SlCallOut className="w-4 h-4" />}
                              </div>
                              <span className={`ml-2 text-sm ${textColor}`}>
                                {(callData.caller || callData.from || 'Unknown')} has reached out
                              </span>
                            </div>
                            <p className={`text-xs ${textSecondaryColor}`}>
                              {getRelativeTime(activity.timestamp)}
                            </p>
                          </div>

                          <div
                            onClick={() => handleLabelClick(callData)}
                            className={`relative border ${borderColor} rounded-lg ml-12 p-4 flex flex-col cursor-pointer`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className={`text-lg font-medium ${textColor}`}>
                                {callData.type || 'Call'} Call
                              </p>
                            </div>
                            <div className="flex items-start justify-start mt-2 gap-4">
                              <p className={`text-sm ${textSecondaryColor} flex items-center`}>
                                <IoIosCalendar className="mr-1" />
                                {formatDateRelative(callData.creation)}
                              </p>
                              <p className={`text-sm ${textSecondaryColor}`}>
                                {callData.duration || '0'} seconds
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded ${getStatusColor(callData.status)}`}
                              >
                                {callData.status || 'Unknown'}
                              </span>
                            </div>

                            {/* Caller + Receiver Avatars */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex -space-x-4">
                              <div
                                className={`p-2 rounded-full flex items-center justify-center cursor-pointer 
              ${theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-400 text-gray-800'} font-medium`}
                                style={{ width: '32px', height: '32px' }}
                                title={callData.caller}
                              >
                                {callData.caller?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div
                                className={`p-2 rounded-full flex items-center justify-center cursor-pointer 
              ${theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-400 text-gray-800'} font-medium`}
                                style={{ width: '32px', height: '32px' }}
                                title={callData.receiver}
                              >
                                {callData.receiver?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    case 'note': {
                      const noteData = notes.find(n => n.name === activity.id);
                      if (!noteData) return null;
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>{activity.icon}</div>
                          <div className={`flex-1 border ${borderColor} rounded-lg p-4 relative`}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`text-lg font-semibold ${textColor}`}>{noteData.title || 'Untitled Note'}</h4>
                              <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === noteData.name ? null : noteData.name); }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><BsThreeDots className="w-4 h-4" /></button>
                                {openMenuId === noteData.name && (<div className={`absolute right-0 mt-2 w-28 rounded-lg shadow-lg z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border'}`}>
                                  <button onClick={(e) => { e.stopPropagation(); deleteNote(noteData.name); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-red-500"><Trash2 className="w-4 h-4" /><span>Delete</span></button>
                                </div>)}
                              </div>
                            </div>
                            <p className={`text-base font-semibold ${textSecondaryColor} whitespace-pre-wrap`}>{noteData.content || 'No content'}</p>
                            <div className="flex justify-between items-center mt-4 pt-2 border-t dark:border-gray-700 text-sm gap-2">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white font-bold text-xs">{noteData.owner?.charAt(0).toUpperCase() || "-"}</span>
                                <span className={textSecondaryColor}>{noteData.owner || 'Unknown'}</span>
                              </div>
                              <span className={`${textSecondaryColor} font-medium`}>{getRelativeTime(noteData.creation)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    case 'comment': {
                      const commentData = comments.find(c => c.name === activity.id);
                      if (!commentData) return null;
                      return (
                        <div key={activity.id} className="relative">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-4">
                              <div className="mt-1 text-gray-400"><FaRegComment size={18} /></div>
                              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-200'} text-sm font-semibold`}>{commentData.owner?.charAt(0).toUpperCase() || "?"}</div>
                              <p className={`text-sm font-medium ${textSecondaryColor}`}>{commentData.owner || 'Someone'} added a comment</p>
                            </div>
                            <p className={`text-xs ${textSecondaryColor}`}>{getRelativeTime(commentData.creation)}</p>
                          </div>
                          <div className={`border ${borderColor} rounded-lg p-4 ml-9 mt-2`}>
                            <div className={`${textColor} mb-2 whitespace-pre-wrap`}>{stripHtml(commentData.content)}</div>
                            {commentData.attachments && commentData.attachments.length > 0 && (<div className="mt-4">
                              <div className="flex flex-wrap gap-3">
                                {commentData.attachments.map((attachment: any, index: number) => {
                                  const baseURL = "http://103.214.132.20:8002";
                                  const fullURL = attachment.file_url && attachment.file_url.startsWith("http") ? attachment.file_url : `${baseURL}${attachment.file_url || ''}`;
                                  return (
                                    <a key={index} href={fullURL} target="_blank" rel="noopener noreferrer" className={`flex items-center border ${borderColor} px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                                      <span className="mr-2 flex items-center gap-1 truncate max-w-[200px] text-sm"><IoDocument className="w-3 h-3 mr-1" />{attachment.file_name || 'Unnamed file'}</span>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>)}
                          </div>
                        </div>
                      );
                    }
                    case 'task': {
                      const taskData = tasks.find(t => t.name === activity.id);
                      if (!taskData) return null;
                      return (
                        <div key={taskData.name} className="flex items-start w-full space-x-3">
                          <div className={`p-2 rounded-full mt-1 ${theme === 'dark' ? 'bg-orange-900' : 'bg-orange-100'}`}><SiTicktick className="w-4 h-4 text-white" /></div>
                          <div onClick={() => {
                            let formattedDate = taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : '';
                            setTaskForm({ ...taskData, due_date: formattedDate });
                            setIsEditMode(true);
                            setCurrentTaskId(taskData.name);
                            setShowTaskModal(true);
                          }} className={`flex-1 border ${borderColor} rounded-lg p-4 cursor-pointer hover:shadow-md`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className={`font-medium ${textColor}`}>{taskData.title || 'Untitled Task'}</h4>
                            </div>
                            <div className="mt-1 text-sm flex justify-between items-center flex-wrap gap-2">
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-200'} text-sm font-semibold`}>{taskData.assigned_to?.charAt(0).toUpperCase() || "U"}</div>
                                  <span className={textSecondaryColor}>{taskData.assigned_to || 'Unassigned'}</span>
                                </div>
                                {taskData.due_date && (<span className={`flex items-center gap-1 ${textSecondaryColor}`}><LuCalendar className="w-3.5 h-3.5" />{new Date(taskData.due_date).toLocaleDateString()}</span>)}
                                <span className="flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-full ${taskData.priority === 'High' ? 'bg-red-500' : taskData.priority === 'Medium' ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
                                  <span className={`text-xs font-medium ${textSecondaryColor}`}>{taskData.priority || 'Medium'}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${taskData.status === 'Done' ? (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : (theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')}`}>{taskData.status || 'Open'}</span>
                                <div className="relative">
                                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === taskData.name ? null : taskData.name); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><BsThreeDots className={`w-4 h-4 ${textColor}`} /></button>
                                  {openMenuId === taskData.name && (<div className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                    <button onClick={(e) => { e.stopPropagation(); setTaskToDelete(taskData); setShowDeleteTaskPopup(true); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg w-full text-left"><Trash2 className="w-4 h-4 text-red-500" /><span className='text-white'>Delete</span></button>
                                  </div>)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    case 'email': {
                      const emailData = activity; // The email data is already in the activity object
                      if (!emailData) return null;

                      return (
                        <div key={emailData.id} className="flex items-start w-full">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100'} text-sm font-semibold text-white`}>
                            {emailData.user?.charAt(0).toUpperCase() || "E"}
                          </div>
                          <div className={`flex-1 border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow ml-3`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className={`font-medium ${textColor}`}>{emailData.user || 'Unknown'}</h4>
                              <div className="flex items-center gap-3 ml-auto">
                                <span className={`text-xs ${textSecondaryColor}`}>
                                  {emailData.timestamp ? getRelativeTime(emailData.timestamp) : 'Unknown time'}
                                </span>
                                <button
                                  onClick={() => handleReply(emailData, false)}
                                  className="p-1 rounded dark:text-white text-balck hover:bg-gray-100 dark:hover:bg-gray-700"
                                  title="Reply"
                                >
                                  <LuReply className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReply(emailData, true)}
                                  className="p-1 rounded dark:text-white text-balck hover:bg-gray-100 dark:hover:bg-gray-700"
                                  title="Reply All"
                                >
                                  <LuReplyAll className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <h4 className={`font-medium ${textColor} mb-2`}>{emailData.title?.replace('Email: ', '') || 'No Subject'}</h4>
                            {emailData.recipients && (
                              <div className="mb-2">
                                <span className={`text-sm ${textColor}`}>
                                  <strong>To:</strong> {emailData.recipients || 'No recipients'}
                                </span>
                              </div>
                            )}
                            <div className={`mt-4 pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col items-start`}>
                              <div className={`${textColor} mb-2 whitespace-pre-wrap mt-4 w-full`}>
                                {emailData.description || 'No content'}
                              </div>
                              {/* ADD THIS SECTION TO SHOW RECIPIENTS */}


                              {/* If you have attachments in your email data */}
                              {emailData.files && emailData.files.length > 0 && (
                                <div className="mt-3">
                                  <p className={`text-sm font-semibold mb-2 ${textSecondaryColor}`}>Attachments:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {emailData.files.map((attachment: any, index: number) => (
                                      <a
                                        key={index}
                                        href={`http://103.214.132.20:8002${attachment.file_url}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                                      >
                                        <File className="w-4 h-4" />
                                        <span className="text-sm">{attachment.file_name || attachment.file_url?.split('/').pop() || 'Unnamed file'}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    case 'file': {
                      // The file data is already in activity.data from your mapping
                      const fileData = activity.data;
                      if (!fileData) return null;
                      const baseURL = "http://103.214.132.20:8002";
                      const fullURL = fileData.file_url?.startsWith("http")
                        ? fileData.file_url
                        : fileData.file_url?.startsWith("/")
                          ? `${baseURL}${fileData.file_url}`
                          : fileData.file_url;

                      return (
                        <div key={`${activity.id}-${activity.timestamp}`}
                          className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full mt-1 ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100'}`}>
                            <IoDocument className="w-4 h-4 text-white" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className={`text-sm font-medium ${textColor}`}>
                                  {activity.user} {activity.action === 'added' ? 'uploaded' : 'removed'} a file
                                </p>
                                <p
                                  onClick={() => activity.action === 'added' && fullURL && window.open(fullURL, "_blank")}
                                  className={`font-medium text-xs ${textColor} truncate text-wrap`}>{fileData.file_name || "Unnamed file"}</p>
                              </div>
                              <p className={`text-xs ${textSecondaryColor}`}>{getRelativeTime(activity.timestamp)}</p>
                            </div>


                          </div>
                        </div>
                      );
                    }
                    default:
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full text-white ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                            {React.isValidElement(activity.icon)
                              ? React.cloneElement(activity.icon, { style: { color: 'white' } })
                              : activity.icon}
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm ${textColor}`}>
                                <span className="font-medium">{activity.user || 'Unknown'}</span> {activity.description || activity.title}
                              </p>
                              <p className={`text-xs ${textSecondaryColor}`}>{getRelativeTime(activity.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      );
                  }
                })}
              </div>
            )}
            <div
              ref={composerRef}
              className={`absolute bottom-0 left-0 right-0 p-4 border-t ${theme === 'dark' ? `bg-gray-900 border-gray-700` : `bg-gray-50 border-gray-200`} rounded-b-lg`}
            >
              {!showEmailModal ? (
                <div className="flex gap-4">
                  <button onClick={() => { setShowEmailModal(true); setReplyData(undefined); }} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-200"}`}><Mail size={16} /> Reply</button>
                  <button onClick={handleCommentNavigate} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-400 hover:bg-gray-200"}`}><FaRegComment size={14} /> Comment</button>
                </div>
              ) : (
                <EmailComposerleads onClose={() => { setShowEmailModal(false); setReplyData(undefined); }} lead={lead} deal={undefined} setListSuccess={() => { }} refreshEmails={refreshEmails} replyData={replyData} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className='flex justify-between items-center gap-5 mb-6'>
                <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Notes</h3>
                <button
                  onClick={() => {
                    setShowNoteModal(true);
                    setIsEditMode(false);
                    setNoteForm({
                      title: '',
                      content: '',
                      name: ''
                    });
                  }}
                  className={`px-4 py-2 ${buttonBgColor} text-white rounded-lg transition-colors flex items-center space-x-2`}
                >
                  <HiOutlinePlus className="w-4 h-4" />
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
                      setIsEditMode(false);
                      setNoteForm({
                        title: '',
                        content: '',
                        name: ''
                      });
                    }}
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                  >Create Note</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {notes.map((note) => (
                    <div
                      key={note.name}
                      className={`border ${borderColor} rounded-lg p-4 relative hover:shadow-md transition-shadow cursor-pointer`}
                      onDoubleClick={() => {
                        setNoteForm({
                          title: note.title || '',
                          content: note.content || '',
                          name: note.name || '',
                        });
                        setIsEditMode(true); // This line was missing
                        setShowNoteModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-lg font-semibold ${textColor}`}>{note.title}</h4>
                        <div className="relative">
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

                      <p className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-600'} whitespace-pre-wrap`}>
                        {note.content}
                      </p>

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
                          setIsEditMode(false);
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
                          rows={8}
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
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className='flex justify-between items-center gap-5 mb-6'>
                <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Calls</h3>
                <button
                  onClick={() => {
                    setCallForm({
                      from: '',
                      to: '',
                      status: 'Ringing',
                      type: 'Outgoing',
                      duration: '',
                      receiver: '',
                      name: ''
                    });
                    setIsEditMode(false);
                    setShowCallModal(true);
                  }}
                  className={`text-white px-4 py-2 rounded-lg flex items-center space-x-2 ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}
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
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2 mt-2"
                  >Create Call Log</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {callLogs.map((call) => (
                    <div key={call.name} >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {/* Icon container */}
                          <div
                            className={`p-2 rounded-full mr-3 flex items-center justify-center
                      ${call.type === 'Incoming' || call.type === 'Inbound'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-green-100 text-green-600'
                              }`}
                            style={{ width: '32px', height: '32px' }}
                          >
                            {call.type === 'Incoming' || call.type === 'Inbound' ? (
                              <SlCallIn className="w-4 h-4" />
                            ) : (
                              <SlCallOut className="w-4 h-4" />
                            )}
                          </div>

                          {/* Text avatar */}
                          <div
                            className="p-2 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 font-medium"
                            style={{ width: '32px', height: '32px' }}
                          >
                            {(call._caller?.label?.charAt(0) || call.from?.charAt(0) || "U").toUpperCase()}
                          </div>

                          {/* Text */}
                          <span className="ml-2 text-sm text-white">
                            {(call._caller?.label || call.from || "Unknown")} has reached out
                          </span>
                        </div>

                        {/* Moved the time here to the right side */}
                        <p className={`text-xs ${textSecondaryColor}`}>
                          {getRelativeTime(call.creation)}
                        </p>
                      </div>

                      <div
                        onClick={() => handleLabelClick(call)}
                        key={call.name}
                        className={`relative border ${borderColor} rounded-lg ml-12 p-4 flex flex-col cursor-pointer`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-lg font-medium ${textColor}`}>
                            {call.type}
                          </p>
                        </div>

                        {/* All three in one line */}
                        <div className="flex items-start justify-start mt-2 gap-4">
                          <p className={`text-sm ${textSecondaryColor} flex items-center`}>
                            <IoIosCalendar className="mr-1" />
                            {formatDateRelative(call.creation)}
                          </p>

                          <p className={`text-sm ${textSecondaryColor}`}>
                            {call.duration} seconds
                          </p>

                          <span
                            className={`text-xs px-2 py-1 rounded ${call.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : call.status === 'Ringing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {call.status}
                          </span>
                        </div>

                        {/* Circle floated to the right, vertically centered */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex -space-x-4">
                          {/* Caller */}
                          <div
                            className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium"
                            style={{ width: '32px', height: '32px' }}
                          >
                            {(call._caller?.label?.charAt(0) || call.from?.charAt(0) || "").toUpperCase()}
                          </div>

                          {/* Receiver */}
                          <div
                            className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium"
                            style={{ width: '32px', height: '32px' }}
                          >
                            {(call._receiver?.label?.charAt(0) || call.to?.charAt(0) || "").toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Call Details Popup */}
                  {showPopup && editingCall && (
                    <CallDetailsPopup
                      call={{
                        type: editingCall.type,
                        caller: editingCall.from || editingCall._caller?.label || "Unknown",
                        receiver: editingCall.to || editingCall._receiver?.label || "Unknown",
                        date: formatDateRelative(editingCall.creation),
                        duration: editingCall.duration,
                        status: editingCall.status,
                        name: editingCall.name
                      }}
                      onClose={() => setShowPopup(false)}
                      onTaskCreated={fetchTasks}
                      onAddTask={handleAddTaskFromCall}
                      onEdit={() => {
                        setCallForm({
                          from: editingCall.from || editingCall._caller?.label || '',
                          to: editingCall.to || editingCall._receiver?.label || '',
                          status: editingCall.status || 'Ringing',
                          type: editingCall.type || 'Outgoing',
                          duration: editingCall.duration || '',
                          receiver: editingCall.to || editingCall._receiver?.label || '',
                          name: editingCall.name || '',
                        });
                        setIsEditMode(true);
                        setShowPopup(false);
                        setShowCallModal(true);
                      }}
                      theme={theme}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Edit/Create Call Modal */}
            {showCallModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className={`w-full max-w-2xl ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
                  <button
                    onClick={() => {
                      setShowCallModal(false);
                      setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
                    }}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                  >
                    ✕
                  </button>

                  <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
                    {isEditMode ? 'Edit Call Log' : 'New Call Log'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Type <span className='text-red-500'>*</span></label>
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
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>To <span className='text-red-500'>*</span></label>
                      <input
                        type="text"
                        value={callForm.to}
                        onChange={(e) => setCallForm({ ...callForm, to: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                        placeholder="To"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>From <span className='text-red-500'>*</span></label>
                      <input
                        type="text"
                        value={callForm.from}
                        onChange={(e) => setCallForm({ ...callForm, from: e.target.value })}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                        placeholder="From"
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
                      <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Duration</label>
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
                          setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
                        }
                      }}
                      disabled={callsLoading}
                      className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                    >
                      <span>{isEditMode ? 'Update' : 'Create'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="">
            <div className={`${cardBgColor} p-6 border ${borderColor}`}>
              <div className="flex justify-between items-center gap-4">
                <h3 className={`text-2xl font-semibold mb-0 ${textColor} mb-4`}>Comments</h3>
                <button
                  onClick={handleCommentNavigate}
                  className={`px-4 py-2 ${buttonBgColor} text-white rounded-lg transition-colors flex items-center space-x-2`}
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>New Comment</span>
                </button>
              </div>
            </div>
            <div className={`${cardBgColor} rounded-lg max-h-[400px] overflow-y-auto pr-2 shadow-sm border ${borderColor} p-6`}>
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <FaRegComment className={`w-12 h-12 ${textSecondaryColor} mx-auto mb-4`} />
                  <p className={textSecondaryColor}>No comments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.name} className='flex gap-2'>
                      <div className='flex flex-col items-center'>
                        <div className="w-7 h-10 flex items-center justify-center bg-gray-500 rounded-full">
                          <FaRegComment className="w-4 h-4 text-purple-300" />
                        </div>
                        <div className='w-px h-full bg-gray-300 my-2'></div>
                      </div>

                      <div className={`border w-full rounded-lg p-4 ${theme === 'dark' ? 'border-purple-500/30 hover:bg-purple-800/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className={`font-medium px-2 py-1 rounded-full bg-slate-500 ${textColor}`}>
                                  {comment.owner.charAt(0).toUpperCase()}
                                </span>
                                <span className={`font-medium ml-2 ${textColor}`}>
                                  <span className="text-gray-300">{comment.owner}</span>
                                </span>
                                <span className={`font-medium ml-2 ${textColor}`}>
                                  added a <span className="text-gray-300">comment</span>
                                </span>
                              </div>
                              <span className={`text-sm ${textSecondaryColor}`}>
                                {getRelativeTime(comment.creation)}
                              </span>
                            </div>

                            <p className={`bg-gray-800 p-3 rounded ${textColor} mt-2`}>
                              {stripHtml(comment.content)}
                            </p>

                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className="mt-3">
                                <p className={`text-sm font-semibold mb-2 ${textSecondaryColor}`}>
                                  Attachments:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {comment.attachments.map((attachment: { file_url: string; file_name: any; }, index: React.Key | null | undefined) => (
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
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div ref={commentRef}>
              {showCommentModal && (
                <EmailComposerleads
                  onClose={() => {
                    setShowCommentModal(false);
                    setReplyData(undefined);
                  }}
                  lead={lead}
                  deal={undefined}
                  setListSuccess={setListSuccess}
                  refreshEmails={refreshComments}
                  replyData={replyData}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Tasks Section */}
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className='flex justify-between items-center gap-5 mb-6'>
                <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Tasks</h3>
                <button
                  onClick={() => {
                    setTaskForm({
                      name: '',
                      title: '',
                      description: '',
                      status: 'Open',
                      priority: 'Medium',
                      due_date: '',
                      assigned_to: ''
                    });
                    setIsEditMode(false);
                    setShowTaskModal(true);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <SiTicktick className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
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
                      onClick={() => {
                        // Format the date correctly for the date input
                        let formattedDate = '';
                        if (task.due_date) {
                          // Parse the date string to a Date object
                          const dateObj = new Date(task.due_date);
                          if (!isNaN(dateObj.getTime())) {
                            // Format to YYYY-MM-DD for the date input
                            formattedDate = dateObj.toISOString().split('T')[0];
                          }
                        }

                        setTaskForm({
                          name: task.name,
                          title: task.title || '',
                          description: task.description || '',
                          status: task.status || 'Open',
                          priority: task.priority || 'Medium',
                          due_date: formattedDate,
                          assigned_to: task.assigned_to || '',
                        });
                        setIsEditMode(true);
                        setCurrentTaskId(task.name);
                        setShowTaskModal(true);
                      }}
                      className={`border ${borderColor} rounded-lg p-4 cursor-pointer hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${textColor}`}>{task.title}</h4>
                      </div>

                      <div className="mt-1 text-sm flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="relative z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white text-xs font-semibold">
                            {task.assigned_to?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className={textSecondaryColor}>
                            {task.assigned_to || 'Unassigned'}
                          </span>

                          {task.due_date && (
                            <span className={`flex items-center gap-0.5 ${textSecondaryColor}`}>
                              <LuCalendar className="w-3.5 h-3.5" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <span
                              className={`w-2.5 h-2.5 rounded-full inline-block ${task.priority === 'High'
                                ? 'bg-red-500'
                                : task.priority === 'Medium'
                                  ? 'bg-yellow-500'
                                  : task.priority === 'Low'
                                    ? 'bg-gray-300'
                                    : 'bg-gray-400'
                                }`}
                            ></span>
                            <span className="text-xs text-white font-medium">{task.priority}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${task.status === 'Done'
                              ? theme === 'dark'
                                ? 'bg-green-900 text-green-200'
                                : 'bg-green-100 text-green-800'
                              : task.status === 'Open'
                                ? theme === 'dark'
                                  ? 'bg-blue-900 text-blue-200'
                                  : 'bg-blue-100 text-blue-800'
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                          >
                            {task.status}
                          </span>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === task.name ? null : task.name);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                            >
                              <BsThreeDots className="w-4 h-4 text-white" />
                            </button>

                            {openMenuId === task.name && (
                              <div
                                className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTaskToDelete(task);
                                    setShowDeleteTaskPopup(true);
                                    setOpenMenuId(null);
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
                </div>
              )}
            </div>

            {/* Task Modal */}
            {showTaskModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                  onClick={() => {
                    setShowTaskModal(false);
                    setIsEditMode(false);
                  }}
                />

                <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-11/12 sm:max-w-[600px] border ${theme === 'dark' ? 'border-gray-600 bg-dark-secondary' : 'border-gray-400 bg-white'}`}>
                  <div className={`px-6 pt-6 pb-4 sm:p-8 sm:pb-6 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
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

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Status
                          </label>
                          <select
                            value={taskForm.status}
                            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          >
                            <option className='text-white' value="Backlog">Backlog</option>
                            <option className='text-white' value="Todo">Todo</option>
                            <option className='text-white' value="In Progress">In Progress</option>
                            <option className='text-white' value="Done">Done</option>
                            <option className='text-white' value="Canceled">Canceled</option>
                            <option className='text-white' value="Open">Open</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Priority
                          </label>
                          <select
                            value={taskForm.priority}
                            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          >
                            <option className='text-white' value="Low">Low</option>
                            <option className='text-white' value="Medium">Medium</option>
                            <option className='text-white' value="High">High</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Due Date
                          </label>
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

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Assign To
                          </label>
                          <select
                            value={taskForm.assigned_to}
                            onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-white'
                              }`}
                          >
                            <option className='text-white' value="">Select Assign</option>
                            <option className='text-white' value="hari@psd123.com">Hari</option>
                            <option className='text-white' value="arun@psd.com">Arun</option>
                            <option className='text-white' value="demo@psdigitise.com">DEMO</option>
                            <option className='text-white' value="fen87joshi@yahoo.com">Feni</option>
                            <option className='text-white' value="fenila@psd.com">Fenila</option>
                            <option className='text-white' value="mx.techies@gmail.com">mx techies</option>
                            <option className='text-white' value="prasad@psd.com">prasad</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`px-6 py-4 sm:px-8 ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
                    <div className="w-full">
                      <button
                        onClick={async () => {
                          if (!taskForm.title.trim()) {
                            showToast('Title is required', { type: 'error' });
                            return;
                          }

                          let success = false;
                          try {
                            if (isEditMode) {
                              success = await editTask(currentTaskId, taskForm);
                            } else {
                              success = await addTask(taskForm);
                            }

                            if (success) {
                              setTaskForm({
                                name: '',
                                title: '',
                                description: '',
                                status: 'Open',
                                priority: 'Medium',
                                due_date: '',
                                assigned_to: ''
                              });
                              setShowTaskModal(false);
                              setIsEditMode(false);
                              fetchTasks();
                            }
                          } catch (error) {
                            console.error('Error saving task:', error);
                            showToast('Error saving task', { type: 'error' });
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

        {activeTab === 'files' && (
          <div className="">
            <div className={`${cardBgColor} p-6 border ${borderColor}`}>
              <div className='flex justify-between items-center gap-5 mb-6'>
                <h3 className={`text-lg font-semibold mb-0 ${textColor}`}>Attachments </h3>
                <button
                  // onClick={() => setShowFileModal(true)}
                  onClick={() => setShowFileModal(true)}
                  className={`px-4 py-2 ${buttonBgColor} text-white rounded-lg transition-colors flex items-center space-x-2`}
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>Upload Attachment</span>
                </button>
              </div>
              <div className="space-y-4">
                {/* <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Files ({files.length})</h3> */}
                {filesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className={`w-12 h-12 ${textSecondaryColor} mx-auto mb-4`} />
                    <p className={textSecondaryColor}>No files yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {files.map(file => (
                      <div key={file.name} className={`flex items-center justify-between p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer`}
                        onClick={() => window.open(`http://103.214.132.20:8002${file.file_url}`, '_blank')}

                      >
                        <div className="flex items-center w-full">
                          {isImageFile(file.file_name) ? (
                            <img
                              src={
                                Number(file.is_private) === 1
                                  ? 'https://www.shutterstock.com/shutterstock/photos/2495883211/display_1500/stock-vector-no-photo-image-viewer-thumbnail-picture-placeholder-graphic-element-flat-picture-landscape-symbol-2495883211.jpg' // show default thumbnail for private
                                  :
                                  `http://103.214.132.20:8002${file.file_url}` // actual file for public
                              }
                              alt={file.file_name}
                              className="w-12 h-12 mr-3 object-cover rounded border border-gray-400 hover:opacity-80"
                            />
                          ) : (
                            <div className="w-12 h-12 mr-3 flex items-center justify-center border border-gray-400 rounded">
                              <IoDocument className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                          )}
                          <div>
                            <p className={`font-medium ${textColor}`}>{file.file_name}</p>


                            <p className={`text-sm ${textSecondaryColor}`}>
                              {file.file_size && Number(file.file_size) > 0
                                ? formatFileSize(file.file_size)
                                : '—'}
                            </p>

                            {/* <p className={`text-sm ${textSecondaryColor}`}>By: {file.owner}</p> */}
                            {/* <p className={`text-xs ${textSecondaryColor}`}>{formatDate(file.creation)}</p> */}
                          </div>

                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <p className={`text-sm ${textSecondaryColor}`}> {getRelativeTime(file.creation ?? '')}</p>
                          <div className="flex flex-row items-end gap-2">

                            <div
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering parent click
                                setFileToTogglePrivacy({
                                  name: file.name,
                                  is_private: Number(file.is_private), // Ensure numeric 0 or 1
                                });
                              }}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              {Number(file.is_private) === 1 ? (
                                <div className="p-2 bg-gray-700 rounded-full flex items-center justify-center">
                                  <IoLockClosedOutline
                                    className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-100'}`}
                                    title="Private"
                                  />
                                </div>
                              ) : (
                                <div className="p-2 bg-gray-700 rounded-full flex items-center justify-center">
                                  <IoLockOpenOutline
                                    className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-100'}`}
                                    title="Public"
                                  />
                                </div>
                              )}
                            </div>


                            <button
                              className={`p-1.5 bg-gray-700 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent div's click
                                setFileToDelete({
                                  name: file.name
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
            </div>
            {fileToDelete && (
              <DeleteAttachmentPopup
                closePopup={() => setFileToDelete(null)}
                attachment={fileToDelete}
                fetchAttachments={fetchFiles}
              />
            )}
            {fileToTogglePrivacy && (
              <LeadPrivatePopup
                closePopup={() => setFileToTogglePrivacy(null)}
                attachment={fileToTogglePrivacy}
                fetchAttachments={fetchFiles}
              />
            )}

            <LeadsFilesUploadPopup
              show={showFileModal}
              onClose={() => setShowFileModal(false)}
              theme="dark"
              onUpload={handleFileUpload}
            />


          </div>
        )}

        {activeTab === 'emails' && (
          <div className="">
            <div className={`${cardBgColor} p-6 border ${borderColor}`}>
              <div className='flex justify-between items-center gap-5'>
                <h3 className={`text-2xl font-semibold mb-0 ${textColor}`}>Emails</h3>
                <button
                  onClick={handleNewEmailClick}
                  className={`px-4 py-2 ${buttonBgColor} text-white rounded-lg transition-colors flex items-center space-x-2`}
                >
                  <HiOutlinePlus className="w-5 h-5 text-gray-600 dark:text-white" />
                  <span>New Email</span>
                </button>
              </div>
            </div>

            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6 max-h-[400px] overflow-y-auto pr-10`}>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : !activitiesNew || activitiesNew.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className={`w-12 h-12 ${textSecondaryColor} mx-auto mb-4`} />
                  <p className={textSecondaryColor}>No emails yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activitiesNew.map((comm: any) => {
                    let attachments = [];
                    try {
                      attachments = comm.attachments ? JSON.parse(comm.attachments) : [];
                    } catch (e) {
                      console.error('Error parsing attachments:', e);
                      attachments = [];
                    }
                    return (
                      <div key={comm.name} className='flex gap-2'>
                        <div className='flex flex-col items-center '>
                          <div className="w-7 h-10 flex items-center justify-center bg-gray-500 rounded-full">
                            <h1 className="text-white text-sm">{comm.sender?.charAt(0).toUpperCase()}</h1>
                          </div>
                          <div className='w-px h-full bg-gray-300 my-2'></div>
                        </div>

                        <div
                          key={comm.name}
                          className={`border ${borderColor} rounded-lg p-4 w-full ${theme === 'dark' ? 'hover:bg-purple-800/30' : 'hover:bg-gray-50'} transition-colors`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-medium ${textColor}`}>
                                  {comm.subject || "No Subject"}
                                </h4>
                                <div className='flex gap-2'>
                                  <span className={`text-sm ${textSecondaryColor}`}>
                                    {getRelativeTime(comm.creation)}
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleReply(comm, false)}
                                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                      title="Reply"
                                    >
                                      <LuReply className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                      onClick={() => handleReply(comm, true)}
                                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                      title="Reply All"
                                    >
                                      <LuReplyAll className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 space-y-1">
                                <p className={`text-sm ${textSecondaryColor}`}>
                                  <span className="font-semibold">From:</span> {comm.sender}
                                </p>
                                <p className={`text-sm ${textSecondaryColor}`}>
                                  <span className="font-semibold">To:</span> {comm.recipients}
                                </p>
                                {comm.cc && (
                                  <p className={`text-sm ${textSecondaryColor}`}>
                                    <span className="font-semibold">CC:</span> {comm.cc}
                                  </p>
                                )}
                                {comm.bcc && (
                                  <p className={`text-sm ${textSecondaryColor}`}>
                                    <span className="font-semibold">BCC:</span> {comm.bcc}
                                  </p>
                                )}
                              </div>

                              {comm.content && (
                                <div className={`mt-3 p-3 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                  <p className={`text-sm ${textColor}`}>
                                    {comm.content}
                                  </p>
                                </div>
                              )}

                              {attachments.length > 0 && (
                                <div className="mt-3">
                                  <p className={`text-sm font-semibold mb-2 ${textSecondaryColor}`}>
                                    Attachments:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {attachments.map((attachment: any, index: number) => (
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
                    )
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
                    setReplyData(undefined);
                  }}
                  lead={lead}
                  deal={undefined}
                  setListSuccess={setListSuccess}
                  refreshEmails={refreshEmails}
                  replyData={replyData}
                />
              )}
            </div>
          </div>
        )}
        {/* Delete Task Popup */}
        {showDeleteTaskPopup && taskToDelete && (
          <DeleteTaskPopup
            closePopup={() => setShowDeleteTaskPopup(false)}
            task={taskToDelete}
            theme={theme}
            onDeleteSuccess={() => {
              setShowDeleteTaskPopup(false);
              fetchTasks(); // Refresh the task list after deletion
            }}
          />
        )}
        {callShowPopup && editingCall && (
          <CallDetailsPopup
            call={{
              type: editingCall.type,
              caller: editingCall.from || editingCall._caller?.label || "Unknown",
              receiver: editingCall.to || editingCall._receiver?.label || "Unknown",
              date: formatDateRelative(editingCall.creation),
              duration: editingCall.duration,
              status: editingCall.status,
              name: editingCall.name
            }}
            onClose={() => setCallShowPopup(false)}
            onAddTask={handleAddTaskFromCall}
            onEdit={() => {
              setCallForm({
                from: editingCall.from || editingCall._caller?.label || '',
                to: editingCall.to || editingCall._receiver?.label || '',
                status: editingCall.status || 'Ringing',
                type: editingCall.type || 'Outgoing',
                duration: editingCall.duration || '',
                receiver: editingCall.to || editingCall._receiver?.label || '',
                name: editingCall.name || '',
              });
              setIsEditMode(true);
              setCallShowPopup(false);
              setShowCallModal(true);
            }}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}