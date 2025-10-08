import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Activity, FileText, Phone, MessageSquare, CheckSquare, Send, Plus, Loader2, Mail, Trash2, Reply, Paperclip, ArrowRightLeft, UserPlus, Layers } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import EmailComposer from './EmailComposer';
import { FaCircleDot, FaRegComment } from 'react-icons/fa6';
import { Listbox } from '@headlessui/react';
import { HiOutlineMailOpen, HiOutlinePlus, HiOutlineUsers } from 'react-icons/hi';
import { IoCloseOutline, IoDocument, IoLockClosedOutline, IoLockOpenOutline } from 'react-icons/io5';
import { LuCalendar, LuReply, LuReplyAll, LuUpload } from 'react-icons/lu';
import { PiDotsThreeOutlineBold } from 'react-icons/pi';
import { TiDocumentText } from 'react-icons/ti';
// import { apiAxios } from '../api/apiUrl';
import { apiAxios, AUTH_TOKEN } from '../api/apiUrl';
import Select from 'react-select';
import { darkSelectStyles } from '../components/Dropdownstyles/darkSelectStyles'
import { getUserSession } from '../utils/session';
import UploadAttachmentPopup from './DealsAttachmentPopups/AddAttachmentPopups';
import React from 'react';
import { DeleteAttachmentPopup } from './DealsAttachmentPopups/DeleteAttachmentPopup';
import { AttachmentPrivatePopup } from './DealsAttachmentPopups/AttachmnetPrivatePopup';
import { BsThreeDots } from "react-icons/bs";
import { DeleteTaskPopup } from './TaskPopups/DeleteTaskPopups';
import { SlCallIn, SlCallOut } from "react-icons/sl";
import { IoIosCalendar } from "react-icons/io";
import { CallDetailsPopup } from './CallLogPopups/CallDetailsPopup';
import { RxLightningBolt } from "react-icons/rx";
import { RiShining2Line } from "react-icons/ri";
import { SiTicktick } from "react-icons/si";
import { FiChevronDown } from "react-icons/fi";
import { CreateOrganizationPopup } from './DealPopups/CreateOrganizationPopup';
import { CreateTerritoryPopup } from './DealPopups/CreateTerritoryPopup';



export interface Deal {
  id: string;
  name: string;
  organization: string;
  status: 'Qualification' | 'Demo/Making' | 'Proposal/Quotation' | 'Negotiation' | 'Ready to Close' | 'Won' | 'Lost';
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
  deal_name?: string;
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
  _caller?: {
    label: string | null;
    image: string | null;
  };
  _receiver?: {
    label: string | null;
    image: string | null;
  };
  _notes?: Note[];
  _tasks?: Task[];
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
  type: 'note' | 'call' | 'comment' | 'task' | 'edit' | 'email' | 'attachments';
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

const API_BASE_URL = 'http://103.214.132.20:8002/api';
// const AUTH_TOKEN = 'AUTH_TOKEN';


export function DealDetailView({ deal, onBack, onSave }: DealDetailViewProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeal, setEditedDeal] = useState<Deal>(deal);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('activity');

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
  const [generatedEmailContent, setGeneratedEmailContent] = useState<string>('');
  const [generatingContent, setGeneratingContent] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [CommentModalMode, setCommentModalMode] = useState("comment"); // "reply" or "comment"
  const [showTaskModal, setShowTaskModal] = useState(false);
  console.log("showTaskModal", showTaskModal)
  const [showEmailModal, setShowEmailModal] = useState(false);
  // const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState("reply"); // "reply" or "comment"
  // Replace your existing email state with these tab-specific states
  const [showEmailModalActivity, setShowEmailModalActivity] = useState(false);
  const [showEmailModalEmails, setShowEmailModalEmails] = useState(false);
  const [showEmailModalComments, setShowEmailModalComments] = useState(false);
  const [emailModalModeActivity, setEmailModalModeActivity] = useState("reply");
  const [emailModalModeEmails, setEmailModalModeEmails] = useState("new");
  const [emailModalModeComments, setEmailModalModeComments] = useState("comment");
  const [selectedEmailActivity, setSelectedEmailActivity] = useState<Email | null>(null);
  const [selectedEmailEmails, setSelectedEmailEmails] = useState<Email | null>(null);
  const [selectedEmailComments, setSelectedEmailComments] = useState<Email | null>(null);
  // Add to state variables
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const userSession = getUserSession();
  const Username = userSession?.username || "Administrator";
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [showCreateOrganizationModal, setShowCreateOrganizationModal] = useState(false);
  const [emailModalTab, setEmailModalTab] = useState<TabType | null>(null);
  const [territorySearch, setTerritorySearch] = useState('');
  const [showCreateTerritoryModal, setShowCreateTerritoryModal] = useState(false);
  // const [OwnersOptions, setOwnersOptions] = useState([]); // Before
  const [userOptions, setUserOptions] = useState<{ value: string; label: string; }[]>([]); // After
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
    duration: '',
    name: '',
    caller: '',
    receiver: ''
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
    { id: 'activity', label: 'Activity', icon: RiShining2Line },
    { id: 'emails', label: 'Emails', icon: HiOutlineMailOpen },
    { id: 'comments', label: 'Comments', icon: FaRegComment },
    { id: 'overview', label: 'Data', icon: TiDocumentText },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'tasks', label: 'Tasks', icon: SiTicktick },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'attachments', label: 'Attachments', icon: Paperclip },

    // { id: 'attachments', label: 'Attachments', icon: <Paperclip className="w-4 h-4" /> },
  ];

  // Updated color scheme variables
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
        `${API_BASE_URL}/method/crm.api.activities.get_activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
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
      // First API call: Get activities
      const activitiesResponse = await fetch(
        `${API_BASE_URL}/method/crm.api.activities.get_activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: deal.name
          })
        }
      );

      if (!activitiesResponse.ok) {
        throw new Error('Failed to fetch activities');
      }

      const activitiesResult = await activitiesResponse.json();
      const callLogsData = activitiesResult.message[1] || [];
      const allFormattedCallLogs = [];

      // Process each call log to get detailed information
      for (const call of callLogsData) {
        if (call.name) {
          try {
            // Second API call: Get detailed call log information
            const callDetailResponse = await fetch(
              'http://103.214.132.20:8002/api/method/crm.fcrm.doctype.crm_call_log.crm_call_log.get_call_log',
              {
                method: 'POST',
                headers: {
                  'Authorization': AUTH_TOKEN,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  name: call.name // Use the name from activities response
                })
              }
            );

            if (callDetailResponse.ok) {
              const callDetailResult = await callDetailResponse.json();
              const detailedCall = callDetailResult.message || {};

              const formattedCallLog = {
                name: call.name,
                from: detailedCall.from || call.from || '',
                to: detailedCall.to || call.to || '',
                status: detailedCall.status || call.status || 'Unknown',
                type: detailedCall.type === 'Incoming' ? 'Inbound' : 'Outbound',
                duration: detailedCall.duration || call._duration || '0s',
                reference_doctype: 'CRM Deal',
                reference_name: deal.name,
                creation: detailedCall.creation || call.creation,
                owner: detailedCall.owner || call.caller || call.receiver || 'Unknown',
                _caller: detailedCall._caller || call._caller,
                _receiver: detailedCall._receiver || call._receiver,
                start_time: detailedCall.start_time,
                end_time: detailedCall.end_time,
                recording_url: detailedCall.recording_url,
                // THE FIX IS HERE:
                // _notes: detailedCall.note || [], // Renamed 'note' to '_notes' to match the popup's prop
                _notes: detailedCall._notes || [],
                _tasks: detailedCall._tasks || [],
                show_recording: detailedCall.show_recording || false
              };
              allFormattedCallLogs.push(formattedCallLog);
            } else {
              console.warn(`Failed to fetch details for call ${call.name}, using basic info`);
              // Fallback to basic call info if detailed API fails
              const formattedCallLog = {
                name: call.name,
                from: call.from || '',
                to: call.to || '',
                status: call.status || 'Unknown',
                type: call.type === 'Incoming' ? 'Inbound' : 'Outbound',
                duration: call._duration || '0s',
                reference_doctype: 'CRM Deal',
                reference_name: deal.name,
                creation: call.creation,
                owner: call.caller || call.receiver || 'Unknown',
                _caller: call._caller,
                _receiver: call._receiver,
                _notes: call._notes || [] // Added fallback here too
              };
              allFormattedCallLogs.push(formattedCallLog);
            }
          } catch (error) {
            console.warn(`Error fetching details for call ${call.name}:`, error);
            // Fallback to basic call info if API call fails
            const formattedCallLog = {
              name: call.name,
              from: call.from || '',
              to: call.to || '',
              status: call.status || 'Unknown',
              type: call.type === 'Incoming' ? 'Inbound' : 'Outbound',
              duration: call._duration || '0s',
              reference_doctype: 'CRM Deal',
              reference_name: deal.name,
              creation: call.creation,
              owner: call.caller || call.receiver || 'Unknown',
              _caller: call._caller,
              _receiver: call._receiver,
              _notes: call._notes || [] // And here
            };
            allFormattedCallLogs.push(formattedCallLog);
          }
        }
      }
      setCallLogs(allFormattedCallLogs);
    } catch (error) {
      console.error("Error fetching call logs:", error);
      showToast("Failed to fetch call logs", { type: 'error' });
    } finally {
      setCallsLoading(false);
    }
  }, [deal.name]);



  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const url = `${API_BASE_URL}/method/crm.api.activities.get_activities`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
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

  const fetchTasks = useCallback(async () => {
    setNotesLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/method/crm.api.activities.get_activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
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
        `${API_BASE_URL}/method/crm.api.activities.get_activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
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

  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{
    url: string;
    name: string;
    isImage: boolean;
  } | null>(null);


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
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const response = await apiAxios.post(
        '/api/method/frappe.client.insert',
        {
          doc: {
            doctype: "FCRM Note",
            title: noteForm.title,
            content: noteForm.content,
            company: sessionCompany,
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
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const response = await apiAxios.post(
        '/api/method/frappe.client.set_value',
        {
          doctype: "FCRM Note",
          name: noteForm.name, // The document ID to update
          company: sessionCompany,
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
    const newErrors: { [key: string]: string } = {};

    if (!callForm.from.trim()) {
      newErrors.from = 'From is required';
    }

    if (!callForm.to.trim()) {
      newErrors.to = 'To is required';
    }
    if (!callForm.type.trim()) {
      newErrors.type = 'Type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    // Clear any previous errors
    setErrors({});

    setCallsLoading(true);
    setCallsLoading(true);
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      // Generate a random ID (or you can keep your existing ID generation logic)
      const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Prepare the document data
      const docData = {
        doctype: "CRM Call Log",
        id: randomId,
        telephony_medium: "Manual",
        reference_doctype: "CRM Deal",
        reference_docname: deal.name,
        type: callForm.type === 'Outgoing' ? 'Outgoing' : 'Incoming',
        to: callForm.to,
        company: sessionCompany,
        from: callForm.from,
        status: callForm.status,
        duration: callForm.duration || "0",
        receiver: userSession?.email || "Administrator" // Use current user's email
      };

      // Call the frappe.client.insert API
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
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

  const refreshAllActivities = useCallback(async () => {
    await Promise.all([
      fetchAllActivities(),      // Refresh the main activity timeline
      fetchCallLogs(),       // Refresh calls
      fetchComments(),       // Refresh comments
      fetchEmails(),        // Refresh emails
      fetchNotes(),         // Refresh notes
      fetchTasks(),         // Refresh tasks
      fetchAttachments(),         // Refresh files
    ]);
  }, [fetchCallLogs, fetchComments, fetchEmails,
    fetchNotes, fetchTasks]);


  const editCall = async () => {
    // if (!callForm.from.trim() || !callForm.to.trim()) {
    //   showToast('All required fields must be filled before proceeding.', { type: 'warning' });
    //   return false;
    // }

    const newErrors: { [key: string]: string } = {};

    if (!callForm.from.trim()) {
      newErrors.from = 'From is required';
    }

    if (!callForm.to.trim()) {
      newErrors.to = 'To is required';
    }
    if (!callForm.type.trim()) {
      newErrors.type = 'Type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    // Clear any previous errors
    setErrors({});

    setCallsLoading(true);

    setCallsLoading(true);
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: "CRM Call Log",
          name: callForm.name, // Existing document name
          fieldname: {
            telephony_medium: "Manual",
            reference_doctype: "CRM Deal",
            reference_docname: deal.name,
            type: callForm.type === 'Outgoing' ? 'Outgoing' : 'Incoming',
            to: callForm.to,
            company: sessionCompany,
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
        await refreshAllActivities();
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

  const deleteCall = async (name) => {
    if (!window.confirm('Are you sure you want to delete this call log?')) return;
    setCallsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v2/document/CRM Call Log/${name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': AUTH_TOKEN,
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
    // if (!taskForm.title.trim() || !taskForm.description.trim()) {
    //   showToast('All required fields must be filled before proceeding.', { type: 'error' });
    //   return;
    // }

    const newErrors: { [key: string]: string } = {};

    if (!taskForm.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Add other validations if needed
    // if (!taskForm.assigned_to) newErrors.assigned_to = 'Assign To is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    // Clear errors before API call
    setErrors({});


    setTasksLoading(true);
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const response = await apiAxios.post(
        '/api/method/frappe.client.insert',
        {
          doc: {
            doctype: "CRM Task",
            reference_doctype: "CRM Deal",
            reference_docname: deal.name,
            title: taskForm.title,
            company: sessionCompany,
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
    } catch (error: any) {
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

  const editTask = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!taskForm.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Add other validations if needed
    // if (!taskForm.assigned_to) newErrors.assigned_to = 'Assign To is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }

    // Clear errors before API call
    setErrors({});


    setTasksLoading(true);
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const response = await fetch(
        `${API_BASE_URL}/method/frappe.client.set_value`,
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doctype: "CRM Task",
            name: taskName,
            fieldname: {
              name: taskName,
              title: taskForm.title,
              description: taskForm.description,
              company: sessionCompany,
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
        `${API_BASE_URL}/v2/document/CRM Task/${name}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': AUTH_TOKEN,
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
    'Ready to Close': 'text-orange-500',
    Won: 'text-emerald-500',
    Lost: 'text-red-500',
  };


  const dealStatusOptions: Deal['status'][] = [
    'Qualification',
    'Demo/Making',
    'Proposal/Quotation',
    'Negotiation',
    'Ready to Close',
    'Won',
    'Lost',
  ];

  const handleStatusChange = async (newStatus: Deal['status']) => {
    try {
      setLoading(true);
      const updatedDeal = { ...editedDeal, status: newStatus };

      const response = await fetch(
        `${API_BASE_URL}/method/frappe.client.set_value`,
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doctype: 'CRM Deal',
            name: deal.name,
            fieldname: {
              status: newStatus
            }
          })
        }
      );

      if (response.ok) {
        setEditedDeal(updatedDeal);
        onSave(updatedDeal);

        // Show success toast message
        showToast('Status updated successfully!', { type: 'success' });

        // Refresh the activity tab
        if (activeTab === 'activity') {
          await fetchAllActivities();
        }
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', { type: 'error' });
      setEditedDeal({ ...editedDeal });
    } finally {
      setLoading(false);
    }
  };

  // Add to your state variables
  const [docinfo, setDocinfo] = useState({
    user_info: {
      "santhaashwingsdigitise@gmail.com": {
        fullname: "john-2",
        image: null,
        name: "santhaashwingsdigitise@gmail.com",
        email: "santhaashwingsdigitise@gmail.com",
        time_zone: "Asia/Kolkata"
      },
      "Administrator": {
        fullname: "Administrator",
        image: null,
        name: "Administrator",
        email: "hariprasad@psdigitise.com",
        time_zone: "Asia/Kolkata"
      }
    },
    comments: [],
    shared: []
  });



  // Or if you need to fetch this data, add a useEffect to fetch it
  useEffect(() => {
    // Fetch docinfo if needed
  }, []);

  // Helper function to get fullname from username
  const getFullname = (username: string): string => {
    if (!username) return 'Unknown';

    // Check if we have user info in docinfo
    const userInfo = docinfo.user_info[username];
    if (userInfo && userInfo.fullname) {
      return userInfo.fullname;
    }

    // Fallback: return the username or a formatted version
    return username.split('@')[0] || username;
  };

  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Replace your entire fetchAllActivities function with this one
  // Add this new function to fetch detailed call logs for activity tab
  const fetchDetailedCallLogsForActivity = async (callNames: string[]) => {
    if (!callNames.length) return [];

    try {
      console.log("Fetching detailed call logs for:", callNames);

      // Create an array of promises for each call log detail fetch
      const detailPromises = callNames.map(name =>
        fetch(`http://103.214.132.20:8002/api/method/crm.fcrm.doctype.crm_call_log.crm_call_log.get_call_log`, {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name })
        }).then(res => res.json())
      );

      // Wait for all detail-fetching API calls to complete
      const detailResponses = await Promise.all(detailPromises);

      // Extract and combine all call logs with their notes and tasks
      const detailedCallLogs = detailResponses.flatMap(response => response.message || []);

      console.log("Detailed call logs fetched:", detailedCallLogs);
      return detailedCallLogs;
    } catch (error) {
      console.error('Error fetching detailed call logs for activity:', error);
      return [];
    }
  };

  // Enhanced fetchAllActivities function
  const fetchAllActivities = useCallback(async () => {
    setActivityLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/method/crm.api.activities.get_activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: deal.name
          })
        }
      );

      if (!response.ok) throw new Error('Failed to fetch activities');

      const result = await response.json();
      const message = result.message;

      // 1. Populate states for individual tabs and detailed views
      const timelineItems = message[0] || [];
      const rawCallLogs = message[1] || [];
      const rawNotes = message[2] || [];
      const rawTasks = message[3] || [];

      // ✨ NEW: Fetch detailed call logs with notes and tasks
      const callNames = rawCallLogs.map(call => call.name).filter(Boolean);
      const detailedCallLogs = await fetchDetailedCallLogsForActivity(callNames);

      // Create a map for easy lookup of detailed call data
      const detailedCallMap = new Map();
      detailedCallLogs.forEach(detailedCall => {
        if (detailedCall.name) {
          detailedCallMap.set(detailedCall.name, detailedCall);
        }
      });

      // Update call logs with detailed data for both activity and calls tab
      const enhancedCallLogs = rawCallLogs.map(call => {
        const detailedCall = detailedCallMap.get(call.name);
        return {
          ...call,
          ...(detailedCall || {}), // Merge detailed data if available
          _notes: detailedCall?._notes || call._notes || [],
          _tasks: detailedCall?._tasks || call._tasks || []
        };
      });

      setCallLogs(enhancedCallLogs); // Set enhanced call logs
      setNotes(rawNotes);
      setTasks(rawTasks);

      // Extract detailed data from timeline items
      const rawEmails = timelineItems
        .filter((item: any) => item.activity_type === 'communication')
        .map((item: any) => ({
          id: item.name || `comm-${item.creation}`,
          fromName: item.data.sender_full_name || item.data.sender,
          from: item.data.sender,
          to: item.data.recipients,
          creation: item.creation,
          subject: item.data.subject,
          content: item.data.content || '',
          attachments: item.data.attachments || [],
        }));
      setEmails(rawEmails);

      const rawComments = timelineItems.filter((item: any) => item.activity_type === 'comment');
      setComments(rawComments);

      // 2. ✨ ENHANCED: Map call activities with detailed data including notes and tasks
      const callActivities = enhancedCallLogs.map((call: any) => {
        console.log("Creating call activity with enhanced data:", call);

        return {
          id: call.name,
          type: 'call',
          title: `${call.type} Call`,
          description: ``,
          timestamp: call.creation,
          user: getFullname(call.caller || call.receiver || 'Unknown'),
          icon: <Phone className="w-4 h-4 text-green-500" />,
          // ✨ Include detailed call data with notes and tasks
          callData: {
            ...call,
            _notes: call._notes || [],
            _tasks: call._tasks || []
          }
        };
      });

      console.log("Enhanced call activities:", callActivities);

      const taskActivities = rawTasks.map((task: any) => ({
        id: task.name,
        type: 'task',
        title: `Task Created: ${task.title}`,
        description: ``,
        timestamp: task.modified,
        user: getFullname(task.assigned_to || 'Unassigned'),
        icon: <SiTicktick className="w-4 h-4 text-gray-600" />,
      }));

      const rawAttachments = message[message.length - 1] || [];
      setAttachments(rawAttachments);

      const attachmentActivities = rawAttachments.map((attachment: any) => ({
        id: attachment.name,
        type: 'attachments',
        title: 'Attachment Added',
        description: attachment.file_name,
        timestamp: attachment.creation,
        user: getFullname(attachment.owner),
        icon: <Paperclip className="w-4 h-4 text-gray-500" />,
        attachmentData: attachment
      }));

      const timelineActivities = timelineItems.map((item: any) => {
        // Your existing timeline mapping logic here
        switch (item.activity_type) {
          case 'creation':
            return {
              id: `creation-${item.creation}`,
              type: 'edit',
              title: `${getFullname(item.owner)} ${item.data}`,
              description: '',
              timestamp: item.creation,
              user: getFullname(item.owner),
              icon: <UserPlus className="w-4 h-4 text-gray-500" />
            };
          case 'comment':
            if (item.content?.toLowerCase().includes('converted')) {
              return {
                id: item.name,
                type: 'edit',
                title: `${getFullname(item.owner)} converted the lead to this deal.`,
                description: '',
                timestamp: item.creation,
                user: getFullname(item.owner),
                icon: <RxLightningBolt className="w-4 h-4 text-blue-500" />
              };
            }
            return {
              id: item.name,
              type: 'comment',
              title: 'New Comment',
              description: item.content.replace(/<[^>]+>/g, ''),
              timestamp: item.creation,
              user: getFullname(item.owner),
              icon: <MessageSquare className="w-4 h-4 text-purple-500" />
            };
          case 'communication':
            return {
              id: item.name || `comm-${item.creation}`,
              type: 'email',
              title: `Email: ${item.data.subject}`,
              description: ``,
              timestamp: item.creation,
              user: getFullname(item.data.sender_full_name || item.data.sender),
              icon: <Mail className="w-4 h-4 text-red-500" />
            };
          case 'added':
          case 'changed':
            if (item.other_versions?.length > 0) {
              const allChanges = [item, ...item.other_versions];
              return {
                id: `group-${item.creation}`,
                type: 'grouped_change',
                timestamp: item.creation,
                user: getFullname(item.owner),
                icon: <Layers className="w-4 h-4 text-white" />,
                changes: allChanges
              };
            }
            const actionText = item.activity_type === 'added'
              ? `added value for ${item.data.field_label}: '${item.data.value}'`
              : `changed ${item.data.field_label} from '${item.data.old_value || "nothing"}' to '${item.data.value}'`;
            return {
              id: `change-${item.creation}`,
              type: 'edit',
              title: `${getFullname(item.owner)} ${actionText}`,
              description: '',
              timestamp: item.creation,
              user: getFullname(item.owner),
              icon: <RxLightningBolt className="w-4 h-4 text-yellow-500" />
            };
          default:
            return null;
        }
      }).filter(Boolean);

      // 3. Combine, sort, and set the final activities list
      const allActivities = [...callActivities, ...taskActivities, ...timelineActivities, ...attachmentActivities];
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(allActivities);

    } catch (error) {
      console.error("Error fetching activities:", error);
      showToast("Failed to load activity timeline", { type: 'error' });
    } finally {
      setActivityLoading(false);
    }
  }, [deal.name, docinfo.user_info]);


  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [OwnersOptions, setOwnersOptions] = useState([]);
  const [TerritoryOptions, setTerritoryOptions] = useState([]);


  const fetchOrganizations = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;
      const response = await apiAxios.post(
        '/api/method/frappe.desk.search.search_link',
        {
          txt: "",
          doctype: "CRM Organization",
          filters: sessionCompany ? { company: sessionCompany } : null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH_TOKEN
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
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Add to useEffect
  // Replace your existing useEffect with this one
  useEffect(() => {
    // Define which tabs should trigger the all-in-one fetch
    const activityTabs: TabType[] = ['activity', 'notes', 'calls', 'comments', 'tasks', 'emails'];

    if (activityTabs.includes(activeTab)) {
      fetchAllActivities();
    }
    if (activeTab === 'overview') {
      fetchOrganizations();
    }

    // You can keep separate fetches for things not in the main activity feed, like attachments

  }, [activeTab, fetchAllActivities]); // Add fetchAttachments to dependency array

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

  function formatDateRelative(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('en-US', options);
  }

  // Example usage:
  // formatCallLogDate("2025-07-05T07:51:57.695425") returns "Jul 5, Saturday"

  const fetchDealDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiAxios.post(
        '/api/method/frappe.client.get',
        {
          doctype: "CRM Deal",
          name: deal?.name
        },
        {
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      const dealData = response.data.message;

      // Update the editedDeal state with the fetched data
      setEditedDeal(prev => ({
        ...prev,
        organization: dealData.organization_name || '',
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
  }, [fetchDealDetails]);

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is allowed

    try {
      // Test basic URL pattern
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(url)) {
        return false;
      }

      // Additional check for valid TLD
      const tldPattern = /\.[a-z]{2,}$/i;
      if (!tldPattern.test(url)) {
        return false;
      }

      // Test if URL can be properly constructed
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };
  //Edit Deals
  const handleSave = async () => {
    // Clear previous errors
    setErrors({});

    const newErrors: { [key: string]: string } = {};

    // Website validation
    if (editedDeal.website && !isValidUrl(editedDeal.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., example.com or https://example.com)';
    }

    // Add other validations here if needed
    // if (!editedDeal.organization_name) {
    //   newErrors.organization_name = 'Organization name is required';
    // }

    // If validation errors found, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      showToast('Deal updated successfully!', { type: 'success' });
      console.log("Save successful:", response.data.message);
      // Optionally show success message or reload
    } catch (error) {
      console.error("Save failed:", error);
      // Optionally show error message
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const fetchOwners = async () => {
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
              'Content-Type': 'application/json',
              'Authorization': AUTH_TOKEN
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
        // const session = getUserSession();
        // const sessionCompany = session?.company;
        const response = await apiAxios.post(
          '/api/method/frappe.desk.search.search_link',
          {
            txt: "",
            doctype: "CRM Territory",
            // filters: sessionCompany ? { company: sessionCompany } : null
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': AUTH_TOKEN
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
            'Authorization': AUTH_TOKEN,
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
  console.log("taskToDelete", taskToDelete);
  // Inside your component
  const [editingCall, setEditingCall] = React.useState<any | null>(null);
  const [showPopup, setShowPopup] = React.useState(false);
  const [showCallDetailsPopup, setShowCallDetailsPopup] = React.useState(false);
  const [editingCallFromActivity, setEditingCallFromActivity] = React.useState<any | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // const handleLabelClick = (call: any, fromActivityTab: boolean = false) => {
  //   if (fromActivityTab) {
  //     setEditingCallFromActivity(call);
  //   } else {
  //     setEditingCall(call);
  //   }
  //   setShowCallDetailsPopup(true);
  // };


  const handleLabelClick = (call: any) => {
    console.log("=== DEBUGGING CALL DATA ===");
    console.log("1. Clicked call:", call);
    console.log("2. Call._notes:", call._notes);
    console.log("3. All callLogs:", callLogs);

    // Find the original call from callLogs array
    const originalCall = callLogs.find(callLog => callLog.name === call.name);
    console.log("4. Original call from callLogs:", originalCall);
    console.log("5. Original call._notes:", originalCall?._notes);

    // Check if notes exist in the call object at any level
    console.log("6. Call object keys:", Object.keys(call));
    console.log("7. Call data structure:", JSON.stringify(call, null, 2));

    const callWithNotes = originalCall || call;
    console.log("8. Final call data being passed:", callWithNotes);
    console.log("9. Final call._notes:", callWithNotes._notes);

    setEditingCall(callWithNotes);
    setShowCallDetailsPopup(true);
  };


  const handleAddTaskFromCall = () => {
    console.log("Add Task button clicked!")
    setShowPopup(false);
    setShowTaskModal(true);
  };

  // Rename fetchOwners to fetchUsers for clarity
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
            //company: sessionCompany
          },
          {
            headers: {
              'Authorization': AUTH_TOKEN,
              'Content-Type': 'application/json'
            }
          }
          // ... headers
        );

        const data = response.data;

        // Map the response to the correct { value, label } format
        const options = data.message.map((item: { value: string; description: string; }) => ({
          value: item.value,       // The email to send to the backend
          label: item.description  // The full name to show in the dropdown
        }));

        setUserOptions(options); // Set the new state

      } catch (err) {
        console.error('Error fetching users:', err);
        showToast('Failed to load user list', { type: 'error' });
      }
    };

    fetchUsers();
  }, []);

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
                  <span className="block truncate">{editedDeal.status}</span>
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FiChevronDown className="w-4 h-4" />
                  </span>
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
                {/* {tab.count !== null && (
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
                )} */}
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
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Organization
                      </label>
                      <Listbox
                        value={editedDeal.organization_name || ""}
                        onChange={(value) => {
                          handleInputChange("organization_name", value);
                          handleInputChange("organization", value); // Set both fields
                        }}
                      >
                        {({ open, close }) => (
                          <div className="relative mt-1">
                            <Listbox.Button
                              className={`relative w-full cursor-default rounded-md border ${borderColor} py-0.5 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                            >
                              <span className="block truncate">
                                {editedDeal.organization_name || "Select Organization"}
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg
                                  className="h-5 w-5 text-gray-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            </Listbox.Button>

                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {/* Search Input */}
                              <div className="sticky top-0 z-10 bg-white p-2 border-b">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search organizations..."
                                    className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => setOrganizationSearch(e.target.value)}
                                    value={organizationSearch}
                                  />
                                  <svg
                                    className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                  </svg>
                                  <button
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setOrganizationSearch("")}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              {/* Organization Options */}
                              {organizationOptions
                                .filter((org) =>
                                  org.label.toLowerCase().includes(organizationSearch.toLowerCase())
                                )
                                .map((org) => (
                                  <Listbox.Option
                                    key={org.value}
                                    value={org.value}
                                    className={({ active }) =>
                                      `relative cursor-default select-none border-b py-2 pl-3 pr-9 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                                      }`
                                    }
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span
                                          className={`block truncate ${selected ? "font-medium" : "font-normal"
                                            }`}
                                        >
                                          {org.label}
                                        </span>
                                        {selected && (
                                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                            <svg
                                              className="h-5 w-5"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}

                              {/* Create New Button */}
                              <div className="sticky top-[44px] z-10 bg-white border-b">
                                <button
                                  type="button"
                                  className="flex items-center w-full px-3 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                  onClick={() => {
                                    setShowCreateOrganizationModal(true);
                                    close();
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create New
                                </button>
                              </div>

                              {/* Clear Button */}
                              <div className="sticky top-[88px] z-10 bg-white border-b">
                                <button
                                  type="button"
                                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  onClick={() => {
                                    handleInputChange("organization_name", "");
                                    handleInputChange("organization", ""); // Clear both fields
                                    setOrganizationSearch("");
                                    close();
                                  }}
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Clear
                                </button>
                              </div>
                            </Listbox.Options>
                          </div>
                        )}
                      </Listbox>

                      <CreateOrganizationPopup
                        isOpen={showCreateOrganizationModal}
                        onClose={() => setShowCreateOrganizationModal(false)}
                        theme="dark"
                        dealName={deal.name}
                        currentDealData={editedDeal}
                        onOrganizationCreated={(newOrganizationName, organizationData) => {
                          // Set both organization fields
                          handleInputChange("organization", newOrganizationName);
                          handleInputChange("organization_name", newOrganizationName);

                          // Refresh the organization list and close modal
                          fetchOrganizations();
                          setShowCreateOrganizationModal(false);

                          // Show success message - use the correct showToast
                          showToast('Organization created and deal updated successfully!', {
                            type: 'success'
                          });
                        }}
                      />
                    </div>


                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Website</label>
                      <input
                        type="text"
                        value={editedDeal.website || ''}
                        onChange={(e) => {
                          handleInputChange('website', e.target.value);
                          // Clear website error when user starts typing
                          if (errors.website) {
                            setErrors(prev => ({ ...prev, website: '' }));
                          }
                        }}
                        className={`p-[2px] pl-2  placeholder-gray-200 mt-1 border block w-full rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                      {errors.website && (
                        <p className="text-sm text-red-500 mt-1">{errors.website}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Territory</label>
                      {/* <Select
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
                      /> */}
                      <Listbox
                        value={editedDeal.territory || ""}
                        onChange={(value) => handleInputChange("territory", value)}
                      >
                        {({ open, close }) => (
                          <div className="relative mt-1">
                            <Listbox.Button
                              className={`relative w-full cursor-default rounded-md border ${borderColor} py-0.5 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                            >
                              <span className="block truncate">
                                {editedDeal.territory || "Select Territory"}
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg
                                  className="h-5 w-5 text-gray-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 3a1 1 0 01.707.293l3 3a1 1 
                                       0 01-1.414 1.414L10 5.414 7.707 
                                       7.707a1 1 0 01-1.414-1.414l3-3A1 
                                       1 0 0110 3zm-3.707 9.293a1 1 
                                       0 011.414 0L10 14.586l2.293-2.293a1 
                                       1 0 011.414 1.414l-3 3a1 1 
                                       0 01-1.414 0l-3-3a1 1 
                                      0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            </Listbox.Button>

                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {/* Search Input */}
                              <div className="sticky top-0 z-10 bg-white p-2 border-b">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search territory..."
                                    className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => setTerritorySearch(e.target.value)}
                                    value={territorySearch}
                                  />
                                  <svg
                                    className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M21 21l-6-6m2-5a7 7 
                                    0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                  </svg>
                                  <button
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setTerritorySearch("")}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              {/* Territory Options */}
                              {TerritoryOptions
                                .filter((t) =>
                                  t.label.toLowerCase().includes(territorySearch.toLowerCase())
                                )
                                .map((t) => (
                                  <Listbox.Option
                                    key={t.value}
                                    value={t.value}
                                    className={({ active }) =>
                                      `relative cursor-default select-none border-b py-2 pl-3 pr-9 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                                      }`
                                    }
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span
                                          className={`block truncate ${selected ? "font-medium" : "font-normal"
                                            }`}
                                        >
                                          {t.label}
                                        </span>
                                        {selected && (
                                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                            ✓
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}

                              {/* Create New */}
                              {/* <div className="sticky top-[44px] z-10 bg-white border-b">
                                <button
                                  type="button"
                                  className="flex items-center w-full px-3 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                  onClick={() => {
                                    setShowCreateTerritoryModal(true);
                                    //close();
                                  }}
                                >
                                  + Create New
                                </button>
                              </div> */}

                              {/* Clear */}
                              <div className="sticky top-[88px] z-10 bg-white border-b">
                                <button
                                  type="button"
                                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  onClick={() => {
                                    handleInputChange("territory", "");
                                    setTerritorySearch("");
                                    close();
                                  }}
                                >
                                  ✕ Clear
                                </button>
                              </div>
                            </Listbox.Options>
                          </div>
                        )}
                      </Listbox>
                      <CreateTerritoryPopup
                        isOpen={showCreateTerritoryModal}
                        onClose={() => setShowCreateTerritoryModal(false)}
                        theme="dark"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Annual Revenue</label>
                      <input
                        type="text"
                        value={editedDeal.annual_revenue || ''}
                        onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Close Date</label>
                      <input
                        type="date"
                        value={editedDeal.close_date?.split(' ')[0] || ''}
                        onChange={(e) => handleInputChange('close_date', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Probability</label>
                      <input
                        type="number"
                        value={editedDeal.probability || ''}
                        onChange={(e) => handleInputChange('probability', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Next Step</label>
                      <input
                        type="text"
                        value={editedDeal.next_step || ''}
                        onChange={(e) => handleInputChange('next_step', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
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
                        onClick={() => {
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
                            <span className={textSecondaryColor}>{getFullname(note.owner)}</span>
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
                          isEditMode ? 'Update' : 'Update'
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
                  // onClick={() => setShowCallModal(true)}
                  onClick={() => {
                    setIsEditMode(false); // <-- ADD THIS LINE
                    setCallForm({
                      from: '',
                      to: '',
                      status: 'Ringing',
                      receiver: '',
                      caller: '',
                      type: 'Outgoing',
                      duration: '',
                      name: ''
                    });
                    setShowCallModal(true);
                  }}
                  className={`text-white px-4 py-2 rounded-lg flex items-center space-x-2 ${theme === 'dark' ? 'bg-purplebg hover:bg-purple-800' : 'bg-green-600 hover:bg-green-700'}`
                  }
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Call Log</span>
                </button>
              </div>
              {/* call log list */}
              {callLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No call logs</p>
                  <span
                    onClick={() => {
                      setIsEditMode(false); // <-- ADD THIS LINE
                      setCallForm({
                        from: '',
                        to: '',
                        status: 'Ringing',
                        type: 'Outgoing',
                        duration: '',
                        caller: '',
                        receiver: '',
                        name: ''
                      });
                      setShowCallModal(true);
                    }}
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                  >Create Call Log</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {callLogs.map((call) => (
                    <div key={call.name} >
                      <div className="flex items-center justify-between mb-3"> {/* Changed to justify-between */}
                        <div className="flex items-center">
                          {/* Icon container */}
                          <div
                            className={`p-2 rounded-full mr-3 flex items-center justify-center
                             ${call.type === 'Inbound'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-green-100 text-green-600'
                              }`}
                            style={{ width: '32px', height: '32px' }}
                          >
                            {call.type === 'Inbound' ? (
                              <SlCallIn className="w-4 h-4" />
                            ) : (
                              <SlCallOut className="w-4 h-4" />
                            )}
                          </div>

                          {/* Text on the right */}
                          <div
                            className="p-2 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 font-medium"
                            style={{ width: '32px', height: '32px' }}
                          >
                            {call._caller?.label?.charAt(0).toUpperCase() || "U"}
                          </div>

                          {/* Text */}
                          <span className="ml-2 text-sm text-white">
                            {getFullname(call._caller?.label || "Unknown")} has reached out
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
                        className={`relative border ${borderColor} rounded-lg ml-12 p-4 flex flex-col`}
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
                            {call.duration}
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
                        <div
                          className="absolute right-4 top-1/2 -translate-y-1/2 flex -space-x-4"
                        >
                          {/* Caller */}
                          <div
                            onClick={() => handleLabelClick(call)}
                            className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium"
                            style={{ width: '32px', height: '32px' }}
                          >
                            {call._caller?.label?.charAt(0).toUpperCase() || ""}
                          </div>

                          {/* Receiver */}
                          <div
                            onClick={() => handleLabelClick(call)}
                            className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium"
                            style={{ width: '32px', height: '32px' }}
                          >
                            {call._receiver?.label?.charAt(0).toUpperCase() || ""}
                          </div>
                        </div>

                      </div>

                    </div>

                  ))}
                  {showPopup && editingCall && (
                    <CallDetailsPopup
                      call={{
                        type: editingCall.type,
                        caller: editingCall._caller?.label || "Unknown",
                        receiver: editingCall._receiver?.label || "Unknown",
                        date: formatDateRelative(editingCall.creation),
                        duration: editingCall.duration,
                        status: editingCall.status,
                        _notes: editingCall._notes || [],
                        _tasks: editingCall._tasks || []
                      }}
                      onClose={() => setShowPopup(false)}
                      onAddTask={handleAddTaskFromCall}
                      onEdit={() => {
                        setCallForm({
                          from: editingCall.from || editingCall._caller?.label || '',
                          to: editingCall.to || editingCall._receiver?.label || '',
                          status: editingCall.status || 'Ringing',
                          type: editingCall.type || 'Outgoing',
                          duration: editingCall.duration || '',
                          name: editingCall.name || '',
                          caller: editingCall.caller || '',
                          receiver: editingCall.receiver || '',
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
          </div>
        )}
        {showCallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`w-full max-w-2xl ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
              <button
                onClick={() => {
                  setShowCallModal(false);
                  setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', receiver: '', name: '' });
                  setErrors({});
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
                    onChange={(e) => {
                      const newType = e.target.value;
                      setCallForm({
                        ...callForm,
                        type: newType,
                        // Reset caller/receiver when type changes
                        caller: newType === 'Incoming' ? '' : callForm.caller,
                        receiver: newType === 'Outgoing' ? '' : callForm.receiver
                      });
                      if (errors.type) {
                        setErrors(prev => ({ ...prev, type: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                  >
                    <option value="Outgoing">Outgoing</option>
                    <option value="Incoming">Incoming</option>
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-500 mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>To <span className='text-red-500'>*</span></label>
                  <input
                    type="text"
                    value={callForm.to}
                    onChange={(e) => {
                      setCallForm({ ...callForm, to: e.target.value });
                      // Clear to error when user starts typing
                      if (errors.to) {
                        setErrors(prev => ({ ...prev, to: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    placeholder="To"
                  />
                  {errors.to && (
                    <p className="text-sm text-red-500 mt-1">{errors.to}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>From <span className='text-red-500'>*</span></label>
                  <input
                    type="text"
                    value={callForm.from}
                    onChange={(e) => {
                      setCallForm({ ...callForm, from: e.target.value });
                      // Clear from error when user starts typing
                      if (errors.from) {
                        setErrors(prev => ({ ...prev, from: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    placeholder="From"
                  />
                  {errors.from && (
                    <p className="text-sm text-red-500 mt-1">{errors.from}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Status</label>
                  <select
                    value={callForm.status}
                    onChange={(e) => {
                      setCallForm({ ...callForm, from: e.target.value });
                      // Clear from error when user starts typing
                      if (errors.from) {
                        setErrors(prev => ({ ...prev, from: '' }));
                      }
                    }}
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
                    placeholder="Call duration in seconds"
                  />
                </div>

                {callForm.type === 'Outgoing' && (
                  <div>
                    <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Caller</label>
                    <select
                      value={callForm.caller}
                      onChange={(e) => setCallForm({ ...callForm, caller: e.target.value })}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    >
                      <option value="">Select Caller</option>
                      {OwnersOptions.map((user: any) => (
                        <option key={user.value} value={user.value}>
                          {user.description || user.label}  {/* Show description instead of label */}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {callForm.type === 'Incoming' && (
                  <div>
                    <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Call Received By</label>
                    <select
                      value={callForm.receiver}
                      onChange={(e) => setCallForm({ ...callForm, receiver: e.target.value })}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    >
                      <option value="">Select Receiver</option>
                      {OwnersOptions.map((user: any) => (
                        <option key={user.value} value={user.value}>
                          {user.description || user.label}  {/* Show description instead of label */}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
                  className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purplebg hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                >
                  <span>{isEditMode ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className="flex justify-between items-center gap-5 mb-6">
                <h3 className={`text-lg font-semibold ${textColor} mb-2`}>Comments</h3>
                <button
                  onClick={() => {
                    setSelectedEmailComments(null);
                    setEmailModalModeComments("comment");
                    setShowEmailModalComments(true);
                    setTimeout(() => {
                      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark'
                    ? 'bg-purplebg hover:bg-purple-700'
                    : 'bg-blue-600 hover:bg-blue-700'}`}
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
                    onClick={() => {
                      setSelectedEmailComments(null);
                      setEmailModalModeComments("comment");
                      setShowEmailModalComments(true);
                      setTimeout(() => {
                        composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                  >
                    New Comment
                  </span>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {comments.slice().reverse().map((comment) => (
                    <div key={comment.name} className="relative ">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                          <div className="mt-1 text-white text-lg">
                            <FaRegComment size={18} />
                          </div>
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-500 text-white text-sm font-semibold">
                            {comment.owner?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <p className={`text-sm font-medium ${textSecondaryColor}`}>
                            {getFullname(comment.owner)} added a {comment.comment_type}
                          </p>
                        </div>
                        <p className="text-sm text-white">
                          {getRelativeTime(comment.creation)}
                        </p>
                      </div>

                      <div className={`border border-gray-600 rounded-lg p-4 mb-8 ml-9 mt-2`}>
                        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} mb-2 whitespace-pre-wrap`}>
                          {comment.content.replace(/<[^>]+>/g, '')}
                        </div>

                        {/* Attachments section */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-3">
                              {comment.attachments.map((attachment, index) => {
                                const baseURL = "http://103.214.132.20:8002";
                                const fullURL = attachment.file_url.startsWith("http")
                                  ? attachment.file_url
                                  : `${baseURL}${attachment.file_url}`;

                                const isImage = /\.(png|jpe?g|gif|webp)$/i.test(attachment.file_name);

                                return (
                                  <div key={index} className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedAttachment({ url: fullURL, name: attachment.file_name, isImage });
                                        setShowAttachmentModal(true);
                                      }}
                                      className="flex items-center border border-gray-600 text-black dark:text-white px-3 py-1 rounded bg-white-31 hover:bg-gray-600 hover:text-white transition-colors"
                                    >
                                      <span className="mr-2 flex items-center gap-1 truncate max-w-[200px]">
                                        <IoDocument className="w-3 h-3 mr-1" />
                                        {attachment.file_name}
                                      </span>
                                    </button>
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

            {/* Composer */}
            <div ref={composerRef} className={`${cardBgColor} border-t ${borderColor} w-[-webkit-fill-available] pt-4 pb-4 absolute bottom-0 overflow-hidden`}>
              {!showEmailModalComments ? (
                <div className="flex gap-4 mt-4">
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-600"}`}
                    onClick={() => {
                      setEmailModalModeComments("new");
                      setShowEmailModalComments(true);
                      setSelectedEmailComments(null);
                    }}
                  >
                    <Mail size={14} /> Reply
                  </button>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-400"}`}
                    onClick={() => {
                      setEmailModalModeComments("comment");
                      setShowEmailModalComments(true);
                    }}
                  >
                    <FaRegComment size={14} /> Comment
                  </button>
                </div>
              ) : (
                <EmailComposer
                  mode={emailModalModeComments}
                  dealName={deal.name}
                  fetchEmails={fetchEmails}
                  fetchComments={fetchComments}
                  selectedEmail={selectedEmailComments}
                  clearSelectedEmail={() => setSelectedEmailComments(null)}
                  onClose={() => {
                    setShowEmailModalComments(false);
                  }}
                />
              )}
            </div>

            {/* Attachment Preview Modal */}
            {showAttachmentModal && selectedAttachment && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                <div className="bg-gray-800 p-4 rounded-lg max-w-3xl w-full relative">
                  <button
                    className="absolute top-5 right-8 text-white"
                    onClick={() => setShowAttachmentModal(false)}
                  >
                    ✕
                  </button>
                  <h3 className="text-lg font-semibold text-white mb-4"> {selectedAttachment.name}</h3>
                  <div className='border-b mb-4'></div>
                  {selectedAttachment.isImage ? (
                    <img src={selectedAttachment.url} alt={selectedAttachment.name} className="max-h-[70vh] mx-auto rounded" />
                  ) : (
                    <div className="text-center text-white">
                      <IoDocument className="mx-auto mb-2 w-8 h-8" />
                      <p>{selectedAttachment.name}</p>
                      <a
                        href={selectedAttachment.url}
                        download
                        className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  onClick={() => {
                    setTaskForm({
                      title: '',
                      description: '',
                      status: 'Open',
                      priority: 'Medium',
                      due_date: '',
                      assigned_to: ''
                    }); // reset form
                    setIsEditMode(false); // reset to create mode
                    setCurrentTaskId(null); // clear task id
                    setShowTaskModal(true);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purplebg hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <SiTicktick className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No tasks </p>
                  <span
                    onClick={() => {
                      setTaskForm({
                        title: '',
                        description: '',
                        status: 'Open',
                        priority: 'Medium',
                        due_date: '',
                        assigned_to: ''
                      });
                      setIsEditMode(false);
                      setCurrentTaskId(null);
                      setShowTaskModal(true);
                    }}
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                  >Create Task</span>
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
                            {getFullname(note.assigned_to) || 'Unassigned'}
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
                          // onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          onChange={(e) => {
                            setTaskForm({ ...taskForm, title: e.target.value });
                            // Clear from error when user starts typing
                            if (errors.title) {
                              setErrors(prev => ({ ...prev, title: '' }));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          placeholder="Task title"
                        />
                        {errors.title && (
                          <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                        )}
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
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Date
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

                        {/* Assigned To */}
                        {/* Inside the 'showTaskModal' JSX block */}

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                            <option value="">Select Assignee</option>

                            {/* Dynamically create options from the userOptions state */}
                            {userOptions.map((user) => (
                              <option key={user.value} value={user.value}>
                                {user.label} {/* This will show the user's full name */}
                              </option>
                            ))}

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
                          // if (!taskForm.title.trim()) {
                          //   showToast('Title is required', { type: 'error' });
                          //   return;
                          // }

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
          <div className="">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} p-6`}>
              <div className='flex items-center justify-between gap-5 mb-6'>
                <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Emails</h3>
                <button
                  onClick={() => {
                    setSelectedEmailEmails(null);                // Use Emails suffix
                    setEmailModalModeEmails("new");             // Use Emails suffix
                    setShowEmailModalEmails(true);              // Use Emails suffix
                    setTimeout(() => {
                      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ml-auto ${theme === 'dark' ? 'bg-purplebg text-white hover:bg-purple-700' : 'bg-purplebg text-white hover:bg-purple-700'}`}
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>New Email</span>
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
                  <p className={textSecondaryColor}>No emails Communications</p>
                  <span
                    onClick={() => {
                      setSelectedEmailEmails(null);                // Use Emails suffix
                      setEmailModalModeEmails("new");             // Use Emails suffix
                      setShowEmailModalEmails(true);              // Use Emails suffix
                      setTimeout(() => {
                        composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className="text-white cursor-pointer bg-gray-400 rounded-md inline-block text-center px-6 py-2"
                  >
                    New Email
                  </span>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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
                                setSelectedEmailEmails(email);
                                setEmailModalModeEmails("reply");
                                setShowEmailModalEmails(true);
                              }}
                              className="text-white"
                              title="Reply"
                            >
                              <LuReply className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEmailEmails(email);
                                setEmailModalModeEmails("reply-all");
                                setShowEmailModalEmails(true);
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
              className={`${cardBgColor} border-t ${borderColor} w-[-webkit-fill-available] pt-4 pb-4 absolute bottom-0 overflow-hidden`}
            >
              {!showEmailModalEmails ? (
                <div className="flex gap-4">
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-600"}`}
                    onClick={() => {
                      setEmailModalModeEmails("new");
                      setShowEmailModalEmails(true);
                      setSelectedEmailEmails(null);
                    }}
                  >
                    <Mail size={14} /> Reply
                  </button>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-400"}`}
                    onClick={() => {
                      setEmailModalModeEmails("comment");
                      setShowEmailModalEmails(true);
                    }}
                  >
                    <FaRegComment size={14} /> Comment
                  </button>
                </div>
              ) : (
                <EmailComposer
                  mode={emailModalModeEmails}
                  dealName={deal.name}
                  fetchEmails={fetchEmails}
                  fetchComments={fetchComments}
                  selectedEmail={selectedEmailEmails}
                  clearSelectedEmail={() => setSelectedEmailEmails(null)}
                  deal={deal}
                  onClose={() => {
                    setShowEmailModalEmails(false);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="">
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
                <>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {activities.slice().reverse().map((activity) => {

                      if (activity.type === 'call') {
                        const callData = callLogs.find(c => c.name === activity.id);
                        if (!callData) return null;
                        return (
                          <div key={activity.id}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div
                                  className={`p-2 rounded-full mr-3 flex items-center justify-center
                                  ${callData.type === 'Inbound' || callData.type === 'Incoming'
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-green-100 text-green-600'
                                    }`}
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  {callData.type === 'Inbound' || callData.type === 'Incoming' ? (
                                    <SlCallIn className="w-4 h-4" />
                                  ) : (
                                    <SlCallOut className="w-4 h-4" />
                                  )}
                                </div>
                                <div
                                  className={`p-2 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'} font-medium`}
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  {(callData._caller?.label || callData.from)?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <span className={`ml-2 text-sm ${textColor}`}>
                                  {callData._caller?.label || callData.from} has reached out
                                </span>
                              </div>
                              <p className={`text-xs ${textSecondaryColor}`}>
                                {getRelativeTime(activity.timestamp)}
                              </p>
                            </div>

                            {/* Card body with call details */}
                            <div
                              onClick={() => handleLabelClick(callData, true)}
                              className={`relative border ${borderColor} rounded-lg ml-12 p-4 flex flex-col`}>
                              <div className="flex items-center justify-between mb-2">
                                <p className={`text-lg font-medium ${textColor}`}>
                                  {callData.type} Call
                                </p>
                              </div>
                              <div className="flex items-start justify-start mt-2 gap-4">
                                <p className={`text-sm ${textSecondaryColor} flex items-center`}>
                                  <IoIosCalendar className="mr-1" />
                                  {formatDateRelative(callData.creation)}
                                </p>
                                <p className={`text-sm ${textSecondaryColor}`}>
                                  {callData.duration}
                                </p>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${callData.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : callData.status === 'Ringing'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                  {callData.status}
                                </span>
                              </div>
                              {/* Overlapping avatars for caller/receiver */}
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex -space-x-4">
                                <div
                                  onClick={() => handleLabelClick(callData)}
                                  className={`p-2 rounded-full flex items-center justify-center cursor-pointer ${theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-400 text-gray-800'} font-medium`}
                                  style={{ width: '32px', height: '32px' }}
                                  title={callData._caller?.label || callData.from}
                                >
                                  {(callData._caller?.label || callData.from)?.charAt(0).toUpperCase()}
                                </div>
                                <div
                                  onClick={() => handleLabelClick(callData)}
                                  className={`p-2 rounded-full flex items-center justify-center cursor-pointer ${theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-400 text-gray-800'} font-medium`}
                                  style={{ width: '32px', height: '32px' }}
                                  title={callData._receiver?.label || callData.to}
                                >
                                  {(callData._receiver?.label || callData.to)?.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      // else if (activity.type === 'note') {
                      //   const noteData = notes.find(n => n.name === activity.id);
                      //   if (!noteData) return null;

                      //   return (
                      //     <div key={activity.id} className="flex items-start space-x-3">
                      //       {/* Icon */}
                      //       <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      //         {activity.icon}
                      //       </div>
                      //       {/* Note Card */}
                      //       <div className={`flex-1 border ${borderColor} rounded-lg p-4 relative`}>
                      //         <div className="flex items-center justify-between mb-2">
                      //           <h4 className={`text-lg font-semibold ${textColor}`}>{noteData.title}</h4>
                      //           <div className="relative">
                      //             <button
                      //               onClick={(e) => {
                      //                 e.stopPropagation();
                      //                 setOpenMenuId(openMenuId === noteData.name ? null : noteData.name);
                      //               }}
                      //               className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      //             >
                      //               <BsThreeDots className="w-4 h-4" />
                      //             </button>
                      //             {/* Dropdown Menu for the note */}
                      //             {openMenuId === noteData.name && (
                      //               <div className={`absolute right-0 mt-2 w-28 rounded-lg shadow-lg z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border'}`}>
                      //                 <button
                      //                   onClick={(e) => {
                      //                     e.stopPropagation();
                      //                     // deleteNote(noteData.name); // Ensure you have this function
                      //                     setOpenMenuId(null);
                      //                   }}
                      //                   className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-red-500"
                      //                 >
                      //                   <Trash2 className="w-4 h-4" />
                      //                   <span>Delete</span>
                      //                 </button>
                      //               </div>
                      //             )}
                      //           </div>
                      //         </div>
                      //         <p className={`text-base font-semibold ${textSecondaryColor} whitespace-pre-wrap`}>
                      //           {noteData.content}
                      //         </p>
                      //         <div className="flex justify-between items-center mt-4 pt-2 border-t dark:border-gray-700 text-sm gap-2">
                      //           <div className="flex items-center gap-2">
                      //             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white font-bold text-xs">
                      //               {noteData.owner?.charAt(0).toUpperCase() || "-"}
                      //             </span>
                      //             <span className={textSecondaryColor}>{noteData.owner}</span>
                      //           </div>
                      //           <span className={`${textSecondaryColor} font-medium`}>
                      //             {getRelativeTime(noteData.creation)}
                      //           </span>
                      //         </div>
                      //       </div>
                      //     </div>
                      //   );
                      // }
                      else if (activity.type === 'comment') {
                        const commentData = comments.find(c => c.name === activity.id);
                        if (!commentData) return null;

                        return (
                          <div key={activity.id} className="relative">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-4">
                                <div className="mt-1 text-gray-400">
                                  <FaRegComment size={18} />
                                </div>
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-200'} text-sm font-semibold`}>
                                  {commentData.owner?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <p className={`text-sm font-medium ${textSecondaryColor}`}>
                                  {commentData.owner} added a comment
                                </p>
                              </div>
                              <p className={`text-xs ${textSecondaryColor}`}>
                                {getRelativeTime(commentData.creation)}
                              </p>
                            </div>
                            <div className={`border ${borderColor} rounded-lg p-4 ml-9 mt-2`}>
                              <div className={`${textColor} mb-2 whitespace-pre-wrap`}>
                                {commentData.content.replace(/<[^>]+>/g, '')}
                              </div>
                              {/* Attachments Section */}
                              {commentData.attachments && commentData.attachments.length > 0 && (
                                <div className="mt-4">
                                  <div className="flex flex-wrap gap-3">
                                    {commentData.attachments.map((attachment, index) => {
                                      const baseURL = "http://103.214.132.20:8002";
                                      const fullURL = attachment.file_url.startsWith("http")
                                        ? attachment.file_url
                                        : `${baseURL}${attachment.file_url}`;
                                      return (
                                        <a
                                          key={index}
                                          href={fullURL}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center border ${borderColor} px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                                        >
                                          <span className="mr-2 flex items-center gap-1 truncate max-w-[200px] text-sm">
                                            <IoDocument className="w-3 h-3 mr-1" />
                                            {attachment.file_name}
                                          </span>
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      else if (activity.type === 'attachments') {
                        // Find the corresponding attachment data
                        const attachmentData = activity.attachmentData;
                        if (!attachmentData) return null;

                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full text-white ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm ${textColor}`}>
                                  <span className="font-medium">{activity.user}</span> added an attachment
                                </p>
                                <p className={`text-xs ${textSecondaryColor}`}>
                                  {getRelativeTime(activity.timestamp)}
                                </p>
                              </div>

                              {/* Attachment preview */}
                              <div className={`mt-2 border ${borderColor} rounded-lg p-3`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {isImageFile(attachmentData.file_name) ? (
                                      <img
                                        src={`http://103.214.132.20:8002${attachmentData.file_url}`}
                                        alt={attachmentData.file_name}
                                        className="w-12 h-12 mr-3 object-cover rounded border border-gray-400"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 mr-3 flex items-center justify-center border border-gray-400 rounded">
                                        <IoDocument className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                      </div>
                                    )}
                                    <div>
                                      <p className={`font-medium ${textColor}`}>{attachmentData.file_name}</p>
                                      <p className={`text-sm ${textSecondaryColor}`}>
                                        {attachmentData.file_size ? formatFileSize(attachmentData.file_size) : 'Unknown size'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    {attachmentData.is_private === 1 ? (
                                      <IoLockClosedOutline className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} title="Private" />
                                    ) : (
                                      <IoLockOpenOutline className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} title="Public" />
                                    )}

                                    <a
                                      href={`http://103.214.132.20:8002${attachmentData.file_url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`p-1.5 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <LuUpload className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      else if (activity.type === 'email') {
                        // Find the corresponding detailed email data
                        const emailData = emails.find(e => e.id === activity.id);
                        if (!emailData) return null; // Fallback if data not found

                        return (
                          <div key={emailData.id} className="flex items-start w-full">
                            {/* Avatar Circle */}
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-200'} text-sm font-semibold`}>
                              {emailData.fromName?.charAt(0).toUpperCase() || "?"}
                            </div>

                            {/* Email Card */}
                            <div className={`flex-1 border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-medium ${textColor}`}>
                                  {emailData.fromName} &lt;{emailData.from}&gt;
                                </h4>

                                {/* Right-side controls */}
                                <div className="flex items-center gap-3 ml-auto">
                                  <span className={`text-xs ${textSecondaryColor}`}>
                                    {getRelativeTime(emailData.creation)} {/* Use your existing formatDate function */}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedEmailActivity(emailData);
                                      setEmailModalModeActivity("reply");
                                      setShowEmailModalActivity(true);
                                    }}
                                    className={`${textColor}`}
                                    title="Reply"
                                  >
                                    <LuReply className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedEmailActivity(emailData);
                                      setEmailModalModeActivity("reply-all");
                                      setShowEmailModalActivity(true);
                                    }}
                                    className={`${textColor}`}
                                    title="Reply All"
                                  >
                                    <LuReplyAll className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <h4 className={`font-medium ${textColor}`}>{emailData.subject}</h4>

                              <div className="mb-2">
                                <span className={`text-sm ${textColor}`}>
                                  <strong>To:</strong> {emailData.to}
                                </span>
                              </div>

                              <div className={`mt-4 pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col items-start`}>
                                <div
                                  className={`${textColor} mb-2 whitespace-pre-wrap mt-4 w-full`}
                                  dangerouslySetInnerHTML={{
                                    __html: emailData.content.includes('\n\n---\n\n')
                                      ? emailData.content.split('\n\n---\n\n')[1]
                                      : emailData.content
                                  }}
                                />

                                {/* Attachments */}
                                {emailData.attachments.map((attachment, index) => {
                                  const baseURL = "http://103.214.132.20:8002";
                                  const fullURL = attachment.file_url.startsWith("http") ? attachment.file_url : `${baseURL}${attachment.file_url}`;
                                  return (
                                    <a key={index} href={fullURL} target="_blank" rel="noopener noreferrer" className={`px-3 py-1 border ${borderColor} rounded-md text-sm flex items-center ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"}`}>
                                      <IoDocument className="w-3 h-3 mr-1" />
                                      {attachment.file_name}
                                    </a>
                                  );
                                })}

                                {/* Expand original message button */}
                                {emailData.content.includes('\n\n---\n\n') && (
                                  <div className="mt-2">
                                    <button
                                      className={`text-sm ${textColor} inline-flex items-center justify-center w-10 h-6 rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                                      onClick={() => setExpandedEmailId(prev => (prev === emailData.id ? null : emailData.id))}
                                      title="Show original message"
                                    >
                                      <PiDotsThreeOutlineBold />
                                    </button>

                                    {/* Conditionally show original content */}
                                    {expandedEmailId === emailData.id && (
                                      <div
                                        className={`mt-4 border-l-4 pl-4 italic font-semibold text-sm ${theme === "dark" ? "border-gray-500 text-gray-300" : "border-gray-600 text-gray-700"}`}
                                        dangerouslySetInnerHTML={{ __html: emailData.content.split('\n\n---\n\n')[0] }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } else if (activity.type === 'task') {
                        // Find the corresponding detailed task data from the `tasks` state
                        const taskData = tasks.find(t => t.name === activity.id);
                        if (!taskData) return null; // Fallback if data not found

                        return (
                          <div key={taskData.name} className="flex items-start w-full space-x-3">
                            {/* Icon on the left */}
                            <div className={`p-2 rounded-full mt-1 ${theme === 'dark' ? 'bg-orange-900' : 'bg-orange-100'}`}>
                              <SiTicktick className="w-4 h-4 text-white" />
                            </div>

                            {/* Detailed Task Card */}
                            <div
                              onClick={() => {
                                // Your existing logic to open the edit modal
                                setTaskForm({
                                  title: taskData.title,
                                  description: taskData.description,
                                  status: taskData.status,
                                  priority: taskData.priority,
                                  due_date: taskData.due_date ? taskData.due_date.split(' ')[0] : '',
                                  assigned_to: taskData.assigned_to,
                                });
                                setIsEditMode(true);
                                setCurrentTaskId(taskData.name);
                                setShowTaskModal(true);
                              }}
                              className={`flex-1 border ${borderColor} rounded-lg p-4 cursor-pointer hover:shadow-md`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-medium ${textColor}`}>{taskData.title}</h4>
                              </div>

                              <div className="mt-1 text-sm flex justify-between items-center flex-wrap gap-2">
                                {/* Left side: Assignee, Date, Priority */}
                                <div className="flex items-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-200'} text-sm font-semibold`}>
                                      {taskData.assigned_to?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <span className={textSecondaryColor}>{taskData.assigned_to || 'Unassigned'}</span>
                                  </div>

                                  {taskData.due_date && (
                                    <span className={`flex items-center gap-1 ${textSecondaryColor}`}>
                                      <LuCalendar className="w-3.5 h-3.5" />
                                      {formatDate(taskData.due_date)}
                                    </span>
                                  )}

                                  <span className="flex items-center gap-1.5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${taskData.priority === 'High' ? 'bg-red-500'
                                      : taskData.priority === 'Medium' ? 'bg-yellow-500'
                                        : 'bg-gray-400'
                                      }`}></span>
                                    <span className={`text-xs font-medium ${textSecondaryColor}`}>{taskData.priority}</span>
                                  </span>
                                </div>

                                {/* Right side: Status and Menu */}
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${taskData.status === 'Done'
                                    ? (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                    : (theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                                    }`}>
                                    {taskData.status}
                                  </span>
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(openMenuId === taskData.name ? null : taskData.name);
                                      }}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                                    >
                                      <BsThreeDots className={`w-4 h-4 ${textColor}`} />
                                    </button>
                                    {openMenuId === taskData.name && (
                                      <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                        {/* Your delete button logic here */}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      else if (activity.type === 'grouped_change') {
                        const isExpanded = expandedGroup === activity.id;
                        const changeCount = activity.changes.length;

                        // Map username to fullname using your docinfo structure
                        const userFullname = docinfo.user_info[activity.user]?.fullname || activity.user;

                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            {/* Icon */}
                            <div className={`p-2 rounded-full text-white ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              {activity.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <button onClick={() => setExpandedGroup(isExpanded ? null : activity.id)} className={`text-sm text-left ${textColor} flex items-center gap-2`}>
                                  {isExpanded ? 'Hide' : 'Show'} +{changeCount} changes from <span className="font-medium">{getFullname(userFullname)}</span>
                                  <FiChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                <p className={`text-xs ${textSecondaryColor}`}>{getRelativeTime(activity.timestamp)}</p>
                              </div>

                              {/* Expanded List of Changes */}
                              {isExpanded && (
                                <div className="mt-2 pl-4 border-l-2 border-gray-300 dark:border-gray-700 space-y-1">
                                  {activity.changes.map((change: any) => (
                                    <p key={change.creation} className={`text-sm ${textSecondaryColor}`}>
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">{change.data.field_label}:</span>
                                      {change.data.old_value != null
                                        ? <> Changed from '{change.data.old_value}' to <span className="font-semibold text-gray-700 dark:text-gray-300">'{change.data.value}'</span></>
                                        : <> Added <span className="font-semibold text-gray-700 dark:text-gray-300">'{change.data.value}'</span></>
                                      }
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      else {
                        // Default style for all other activities (Notes, Tasks, Comments, etc.)
                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full text-white  ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              {React.isValidElement(activity.icon)
                                ? React.cloneElement(activity.icon, { style: { color: 'white' } })
                                : activity.icon}
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm ${textColor}`}>
                                  {activity.description || activity.title}
                                </p>
                                <p className={`text-xs ${textSecondaryColor}`}>
                                  {getRelativeTime(activity.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>

                  {/* <div className="flex justify-between items-center">
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
                  </div> */}
                </>
              )}


            </div>
            {/* Sticky Action Footer */}
            <div
              ref={composerRef}
              className={`${cardBgColor} border-t ${borderColor} w-[-webkit-fill-available] pt-4 pb-4 absolute bottom-0 overflow-hidden`}
            >
              {!showEmailModalActivity ? (
                <div className="flex gap-4">
                  <button
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-200"}`}
                    onClick={() => {
                      setEmailModalModeActivity("reply");
                      setShowEmailModalActivity(true);
                      setSelectedEmailActivity(null);
                    }}
                  >
                    <Mail size={16} /> Reply
                  </button>
                  <button
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-400 hover:bg-gray-200"}`}
                    onClick={() => {
                      setEmailModalModeActivity("comment");
                      setShowEmailModalActivity(true);
                    }}
                  >
                    <FaRegComment size={14} /> Comment
                  </button>
                </div>
              ) : (
                <EmailComposer
                  mode={emailModalModeActivity}
                  dealName={deal.name}
                  fetchEmails={fetchAllActivities}
                  fetchComments={fetchAllActivities}
                  selectedEmail={selectedEmailActivity}
                  clearSelectedEmail={() => setSelectedEmailActivity(null)}
                  deal={deal}
                  onClose={() => {
                    setShowEmailModalActivity(false);
                  }}
                />
              )}
            </div>

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
      {showCallDetailsPopup && (editingCall || editingCallFromActivity) && (
        <CallDetailsPopup
          call={{
            type: (editingCall || editingCallFromActivity)?.type,
            caller: (editingCall || editingCallFromActivity)?._caller?.label || "Unknown",
            receiver: (editingCall || editingCallFromActivity)?._receiver?.label || "Unknown",
            date: formatDateRelative((editingCall || editingCallFromActivity)?.creation),
            duration: (editingCall || editingCallFromActivity)?.duration,
            status: (editingCall || editingCallFromActivity)?.status,
            name: (editingCall || editingCallFromActivity)?.name, // ADDED: Passes the unique call name/ID
            _notes: (editingCall || editingCallFromActivity)?._notes || [], // ADDED: Passes the notes for this call
            _tasks: (editingCall || editingCallFromActivity)?._tasks || [] // ADDED: Passes the notes for this call
          }}
          onClose={() => {
            setShowCallDetailsPopup(false);
            setEditingCall(null);
            setEditingCallFromActivity(null);
          }}
          onAddTask={handleAddTaskFromCall}
          onEdit={() => {
            const callToEdit = editingCall || editingCallFromActivity;
            setCallForm({
              from: callToEdit.from || callToEdit._caller?.label || '',
              to: callToEdit.to || callToEdit._receiver?.label || '',
              status: callToEdit.status || 'Ringing',
              type: callToEdit.type || 'Outgoing',
              duration: callToEdit.duration || '',
              receiver: callToEdit.to || callToEdit._receiver?.label || '',
              name: callToEdit.name || '',
            });
            setIsEditMode(true);
            setShowCallDetailsPopup(false);
            setShowCallModal(true);
            setEditingCall(null);
            setEditingCallFromActivity(null);
          }}
          theme={theme}
          fetchCallLogs={fetchCallLogs} // ADDED: Passes the function to refresh call logs
        />
      )}
    </div>

  );
}


