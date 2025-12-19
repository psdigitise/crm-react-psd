import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from './ThemeProvider';
import { getUserSession, setUserSession, UserSession } from '../utils/session';
import { showToast } from '../utils/toast';
import { Listbox } from '@headlessui/react';
import EmailComposerleads from '../components/Leads/EmailComposerleads';
import { getAuthToken } from '../api/apiUrl';
import { Flame, Sun, Snowflake } from "lucide-react";


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
import { FiChevronDown } from 'react-icons/fi';
import { RxLightningBolt } from 'react-icons/rx';
import { apiAxios, AUTH_TOKEN } from '../api/apiUrl';

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
  // Change from organization_info to company_details
  company_details?: {
    company_name?: string;
    industry?: string;
    description?: string;
    website?: string;
    address?: string;
    employees?: string;
    revenue?: string;
    [key: string]: any;
  };
  lead_score?: number;
  lead_summary?: string;
  company_info?: string | any;
}

interface LeadDetailViewProps {
  lead: Lead;
  onBack: () => void;
  onSave: (updatedLead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onConversionSuccess: (dealId: string) => void;
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
  _caller: string;
  type: string;
  duration: string;
  reference_doctype: string;
  reference_docname: string;
  creation: string;
  owner: string;
  _notes?: Note[];
}



// Add these interfaces at the top with other interfaces
interface UserInfo {
  [email: string]: {
    fullname: string;
    image: string | null;
    name: string;
    email: string;
    time_zone: string;
  };
}

interface Comment {
  name: string;
  content: string;
  comment_type: string;
  reference_doctype: string;
  reference_name: string;
  creation: string;
  owner: string;
  subject: string;
  comment_by?: string;
  attachments: Array<{
    name: string;
    file_name: string;
    file_url: string;
    is_private: number;
    file_type?: string;
    file_size?: number;
  }>;
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
  type: 'note' | 'call' | 'comment' | 'task' | 'edit' | 'email' | 'file' | 'grouped_change';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  icon: React.ReactNode;
  color: string;
  _notes?: Note[];
  _tasks?: Task[];
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

interface SalutationOption {
  value: string;
  label: string;
}

const API_BASE_URL = 'https://api.erpnext.ai/api';
//const AUTH_TOKEN = AUTH_TOKEN;


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



export function LeadDetailView({ lead, onBack, onSave, onDelete, onConversionSuccess }: LeadDetailViewProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead>(lead);
  const [activeTab, setActiveTab] = useState('activity');
  const [loading, setLoading] = useState(false);
  const [replyData, setReplyData] = useState<EmailReplyData | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  console.log("notes leads", notes)
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [, setCommentsNew] = useState<any>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [changes, setChanges] = useState([]);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [territoryOptions, setTerritoryOptions] = useState<string[]>([]);
  const [options, setOptions] = useState<SalutationOption[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [composerMode, setComposerMode] = useState<'reply' | 'comment'>('reply');
  const [companyIntelligence, setCompanyIntelligence] = useState<any>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);
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
  const [territorySearch, setTerritorySearch] = useState('');
  const [showCreateTerritoryModal, setShowCreateTerritoryModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [newIndustryName, setNewIndustryName] = useState('');
  const [industryLoading, setIndustryLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCreateIndustryModal, setShowCreateIndustryModal] = useState(false);
  const [industrySearch, setIndustrySearch] = useState('');
  const [expectedDealValue, setExpectedDealValue] = useState('');
  const [expectedClosureDate, setExpectedClosureDate] = useState('');
  const [organizationInfo, setOrganizationInfo] = useState<any>(null);
  const [generatingInfo, setGeneratingInfo] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState<"reply" | "reply-all" | "comment">("reply");
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
    caller: '',
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
  const [leadOwners, setLeadOwners] = useState<string[]>([]);
  const [emailPage, setEmailPage] = useState(1);
  const [orgToggle, setOrgToggle] = useState(false);
  const [contactToggle, setContactToggle] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  // const [userOptions, setUserOptions] = useState<string[]>([]);
  const [callerOptions, setCallerOptions] = useState<{ value: string; description: string; }[]>([]);
  const [noteFormError, setNoteFormError] = useState(false);
  const [organizationOptions, setOrganizationOptions] = useState<string[]>([]);
  const [contactOptions, setContactOptions] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);
  const [editingCall, setEditingCall] = React.useState<any | null>(null);
  const showUniversalComposer = ['activity'].includes(activeTab);
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const userSession = getUserSession();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
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

  const [sourceSearch, setSourceSearch] = useState('');
  const [showCreateSourceModal, setShowCreateSourceModal] = useState(false);
  const [newSource, setNewSource] = useState({
    source_name: '',
    details: ''
  });
  const [sourceLoading, setSourceLoading] = useState(false);
  const [userOptions, setUserOptions] = useState<{ value: string; label: string; }[]>([]);
  const composerRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLDivElement>(null);
  const token = getAuthToken();

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
    ? 'text-gray-300'
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
    { id: 'intelligence', label: 'Company Intelligence', icon: Building2 }, // New tab
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

  const handleNewCommentClick = () => {
    // 1. Switch to the 'comments' tab first
    setActiveTab('comments');

    // 2. Set the composer to 'comment' mode and clear any old data
    setReplyData(undefined);
    setEmailModalMode("comment");
    setShowEmailModal(true);

    // 3. Scroll the composer into view after a brief delay to allow the tab to switch
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

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
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Lead',
          name: lead.name
        })
      });

      if (response.ok) {
        const result = await response.json();
        const apiData = result.message;

        // Parse company_details if it exists
        let companyDetails = null;
        if (apiData.company_details) {
          try {
            companyDetails = typeof apiData.company_details === 'string'
              ? JSON.parse(apiData.company_details)
              : apiData.company_details;
          } catch (e) {
            console.error('Error parsing company_details:', e);
          }
        }

        // Parse company_info if it exists
        let companyInfo = null;
        if (apiData.company_info) {
          try {
            companyInfo = typeof apiData.company_info === 'string'
              ? JSON.parse(apiData.company_info)
              : apiData.company_info;
          } catch (e) {
            console.error('Error parsing company_info:', e);
          }
        }

        const normalizedLead = {
          ...apiData,
          firstName: apiData.first_name || '',
          lastName: apiData.last_name || '',
          mobile: apiData.mobile_no || '',
          jobTitle: apiData.job_title || '',
          company_details: companyDetails,
          company_info: companyInfo, // Add this line
          lead_score: apiData.lead_score,
          lead_summary: apiData.lead_summary,
        };

        setEditedLead(normalizedLead);
        setOrganizationInfo(companyDetails);

        const currentSession = getUserSession() || {};

        const updatedSession: UserSession = {
          ...currentSession,
          leadfullName: apiData.lead_name || currentSession.leadfullName || "",
        };

        setUserSession(updatedSession);

        // If we have cached company info, set it in state
        if (companyInfo) {
          setCompanyIntelligence(companyInfo);
        }
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

  const activityContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'activity' && activityContainerRef.current && activities.length > 0) {
      // Scroll to bottom with smooth animation
      setTimeout(() => {
        activityContainerRef.current?.scrollTo({
          top: activityContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [activities, activeTab]);

  const fetchActivitiesNew = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.erpnext.ai/api/method/crm.api.activities.get_activities",
        {
          method: "POST",
          headers: {
            "Authorization": token,
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

      // Filter out activities related to company_info and lead_summary updates
      const filteredComments = activities
        .filter((activity: any) =>
          activity.activity_type === 'comment' &&
          !activity.content?.toLowerCase().includes('company_info') &&
          !activity.content?.toLowerCase().includes('company intelligence') &&
          !activity.content?.toLowerCase().includes('lead_summary')
        )
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

      setComments(filteredComments);

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

  // Automatic company intelligence generation
  // useEffect(() => {
  //   const generateIntelligenceReport = async () => {
  //     if (activeTab === 'intelligence' && editedLead.organization && !companyIntelligence && !intelligenceLoading) {
  //       await fetchCompanyIntelligence(editedLead.organization);
  //     }
  //   };

  //   generateIntelligenceReport();
  // }, [activeTab, editedLead.organization, companyIntelligence, intelligenceLoading]);

  const handleRefreshIntelligence = async () => {
    if (!editedLead.organization) {
      showToast('Organization name is required to generate company intelligence', { type: 'error' });
      return;
    }

    // Show confirmation dialog for refresh
    const confirmRefresh = window.confirm(
      'Generating a new company intelligence report will use 1 credit. Do you want to continue?'
    );

    if (!confirmRefresh) {
      return;
    }

    await fetchCompanyIntelligence(editedLead.organization);
  };

  // const [showCreateTerritoryModal, setShowCreateTerritoryModal] = useState(false);
  const [newTerritory, setNewTerritory] = useState({
    territory_name: '',
    territory_manager: '',
    parent_crm_territory: '',
    is_group: false,
    old_parent: ''
  });
  const [territoryLoading, setTerritoryLoading] = useState(false);


  // Add this new function to fetch detailed call logs for activity tab
  const fetchDetailedCallLogsForActivity = async (callNames: string[]) => {
    if (!callNames.length) return [];

    try {
      // Create an array of promises for each call log detail fetch
      const detailPromises = callNames.map(name =>
        fetch(`https://api.erpnext.ai/api/method/crm.fcrm.doctype.crm_call_log.crm_call_log.get_call_log`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name })
        }).then(res => res.json())
      );

      // Wait for all detail-fetching API calls to complete
      const detailResponses = await Promise.all(detailPromises);

      // Extract and combine all call logs with their notes and tasks
      const detailedCallLogs = detailResponses.flatMap(response => response.message || []);

      return detailedCallLogs;
    } catch (error) {
      console.error('Error fetching detailed call logs for activity:', error);
      return [];
    }
  };

  const fetchActivities = useCallback(async () => {
    setActivityLoading(true);
    setActivities([]);
    try {
      const response = await fetch(
        "https://api.erpnext.ai/api/method/crm.api.activities.get_activities",
        {
          method: "POST",
          headers: {
            "Authorization": token,
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
      const user_info = docinfo.user_info || {};
      console.log("leads userInfo,", user_info)

      if (!Array.isArray(message) || message.length === 0) {
        setActivities([]);
        setActivityLoading(false);
        return;
      }

      const rawTimeline = Array.isArray(message[0]) ? message[0] : [];
      const rawCalls = Array.isArray(message[1]) ? message[1] : [];
      const rawNotes = Array.isArray(message[2]) ? message[2] : [];
      const rawTasks = Array.isArray(message[3]) ? message[3] : [];

      // Detailed call logs logic (preserved)
      const callNames = rawCalls.map(call => call.name).filter(Boolean);
      const detailedCallLogs = await fetchDetailedCallLogsForActivity(callNames);
      const detailedCallMap = new Map();
      detailedCallLogs.forEach(detailedCall => {
        if (detailedCall.name) {
          detailedCallMap.set(detailedCall.name, detailedCall);
        }
      });

      setCallLogs(detailedCallLogs);
      setNotes(rawNotes);
      setTasks(rawTasks);

      const rawEmails = rawTimeline
        .filter((item: any) => item.activity_type === 'communication')
        .map((item: any) => ({
          ...item.data,
          id: item.name || `comm-${item.creation}`,
          creation: item.creation,
          recipients: item.data.recipients || item.data.to || '',
        }));
      setEmails(rawEmails);

      const rawComments = rawTimeline.filter((item: any) =>
        item.activity_type === 'comment' &&
        !item.content?.toLowerCase().includes('company_info') &&
        !item.content?.toLowerCase().includes('company intelligence') &&
        !item.content?.toLowerCase().includes('lead_summary') &&
        !item.content?.toLowerCase().includes('lead summary') &&
        !item.content?.toLowerCase().includes('lead score')
      );
      setComments(rawComments);

      const rawFiles = docinfo.files || [];
      setFiles(rawFiles);

      const fileActivities = rawTimeline
        .filter((item: any) => item.activity_type === "attachment_log")
        .map((item: any) => {
          const fileData = item.data || {};
          const creatorName = user_info[item.owner]?.fullname || item.owner;
          return {
            id: item.name || `file-${Date.now()}`,
            type: "file",
            title: `File ${fileData.type === "added" ? "Uploaded" : "Removed"}: ${fileData.file_name || "Unnamed file"}`,
            description: fileData.file_url || "",
            timestamp: item.creation || new Date().toISOString(),
            user: creatorName || "Unknown",
            icon: <IoDocument className="w-4 h-4" />,
            data: fileData,
            action: fileData.type || "unknown",
            files: false
          };
        });

      const callActivities = rawCalls.map((call: any) => {
        const caller = call._caller?.label || call.caller || call.from || "Unknown";
        const receiver = call._receiver?.label || call.receiver || call.to || "Unknown";
        const detailedCall = detailedCallMap.get(call.name) || call;
        return {
          id: call.name,
          type: "call",
          title: `${call.type || "Call"} Call`,
          description: `${caller} → ${receiver}`,
          timestamp: call.creation,
          user: caller,
          icon: call.type === "Incoming" || call.type === "Inbound" ? <SlCallIn className="w-4 h-4" /> : <SlCallOut className="w-4 h-4" />,
          data: {
            ...call,
            ...detailedCall,
            caller,
            receiver,
            _notes: detailedCall._notes || [],
            _tasks: detailedCall._tasks || []
          },
        };
      });

      const noteActivities = rawNotes.map((note: any) => ({
        id: note.name,
        type: "note",
        title: `Note Added: ${note.title}`,
        description: note.content,
        timestamp: note.creation,
        user: note.owner,
        icon: <FileText className="w-4 h-4" />,
        data: note,
      }));

      const taskActivities = rawTasks.map((task: any) => ({
        id: task.name,
        type: 'task',
        title: `Task Created: ${task.title}`,
        description: task.description || '',
        timestamp: task.creation,
        user: task.assigned_to || 'Unassigned',
        icon: <SiTicktick className="w-4 h-4 text-gray-600" />,
      }));

      const emailActivities = rawEmails.map((email: any) => ({
        id: email.name || email.id,
        type: 'email',
        title: `Email: ${email.subject || 'No Subject'}`,
        description: email.content,
        timestamp: email.creation,
        user: email.sender_full_name || email.sender || 'Unknown',
        recipients: email.recipients,
        icon: <Mail className="w-4 h-4" />,
      }));

      const commentActivities = rawComments.map((comment: any) => {
        const creatorName = user_info[comment.owner]?.fullname || comment.owner;
        return {
          id: comment.name,
          type: 'comment',
          title: 'New Comment',
          description: comment.content,
          timestamp: comment.creation,
          user: creatorName,
          attachments: comment.attachments || [],
          icon: <FaRegComment className="w-4 h-4" />,
        };
      });

      // Timeline activities - ENHANCED FILTERING FOR GROUPED DATA
      const timelineActivities = rawTimeline
        .filter((item: any) => {
          if (item.activity_type === 'changed' || item.activity_type === 'added') {
            const fieldLabel = item.data?.field_label?.toLowerCase() || '';
            const value = String(item.data?.value || '').toLowerCase();
            const oldValue = String(item.data?.old_value || '').toLowerCase();
            const fieldName = item.data?.fieldname || '';

            // Block individual Lead Summary/Score/Company Info updates
            const isBlocked =
              fieldLabel.includes('lead_summary') || fieldLabel.includes('lead summary') ||
              fieldName === 'lead_summary' || fieldName === 'lead_score' ||
              fieldLabel.includes('company_info') || fieldLabel.includes('company intelligence') ||
              value.includes('company_info') || oldValue.includes('company_info');

            return !isBlocked;
          }
          return item.activity_type === 'creation' || item.activity_type === 'added' || item.activity_type === 'changed';
        })
        .map((item: any) => {
          const creatorName = user_info[item.owner]?.fullname || item.owner;
          switch (item.activity_type) {
            case 'creation':
              return {
                id: `creation-${item.creation}`,
                type: 'edit',
                title: ` created this Lead`,
                description: '',
                timestamp: item.creation,
                user: creatorName,
                icon: <UserPlus className="w-4 h-4 text-gray-500" />
              };

            case 'added':
            case 'changed':
              // ✨ CORRECTION: Filter nested versions inside grouped changes
              if (item.other_versions?.length > 0) {
                const filteredVersions = item.other_versions.filter((v: any) => {
                  const vLabel = v.data?.field_label?.toLowerCase() || '';
                  const vName = v.data?.fieldname || '';
                  return !(vLabel.includes('lead summary') || vName === 'lead_summary' || vName === 'lead_score');
                });

                // If filtering nested versions leaves nothing, and the main item was also summary, skip
                if (filteredVersions.length === 0) {
                  const mainLabel = item.data?.field_label?.toLowerCase() || '';
                  if (mainLabel.includes('lead summary')) return null;
                }

                return {
                  id: `group-${item.creation}`,
                  type: 'grouped_change',
                  timestamp: item.creation,
                  user: creatorName,
                  icon: <Layers className="w-4 h-4 text-white" />,
                  data: {
                    changes: [item, ...filteredVersions],
                    field_label: item.data?.field_label,
                    value: item.data?.value,
                    old_value: item.data?.old_value,
                    other_versions: filteredVersions // Use the cleaned list
                  }
                };
              }

              const actionText = item.activity_type === 'added'
                ? `added value for ${item.data?.field_label}: '${item.data?.value}'`
                : `changed ${item.data?.field_label} from '${item.data?.old_value || "nothing"}' to '${item.data?.value}'`;

              return {
                id: `change-${item.creation}`,
                type: 'edit',
                title: ` ${actionText}`,
                description: '',
                timestamp: item.creation,
                user: creatorName,
                icon: <RxLightningBolt className="w-4 h-4 text-yellow-500" />
              };

            default:
              return null;
          }
        })
        .filter(Boolean);

      const allActivities = [
        ...callActivities,
        ...emailActivities,
        ...commentActivities,
        ...timelineActivities,
        ...fileActivities,
        ...noteActivities,
        ...taskActivities,
      ];

      allActivities.sort((a, b) => {
        const getValidDate = (activity: any) => {
          if (activity.timestamp) return new Date(activity.timestamp);
          if (activity.creation) return new Date(activity.creation);
          if (activity.data?.creation) return new Date(activity.data.creation);
          return new Date(0);
        };
        return getValidDate(a).getTime() - getValidDate(b).getTime();
      });

      setActivities(allActivities);

    } catch (err) {
      console.error("Error fetching activities:", err);
      showToast("Failed to fetch activities", { type: 'error' });
    } finally {
      setActivityLoading(false);
    }
  }, [lead.name, token]);


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const isImageFile = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  const getFullFileUrl = (fileUrl: string | undefined): string => {
    if (!fileUrl) return '';

    const BASE_URL = 'https://api.erpnext.ai';

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    if (fileUrl.startsWith('/')) {
      return `${BASE_URL}${fileUrl}`;
    }
    return `${BASE_URL}/${fileUrl}`;
  };

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
          'Authorization': token,
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
      // 1. First, fetch the initial list of all call logs to get their names.
      const listResponse = await fetch(`${API_BASE_URL}/method/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Call Log',
          filters: JSON.stringify([
            ['reference_doctype', '=', 'CRM Lead'],
            ['reference_docname', '=', lead.name]
          ]),
          fields: JSON.stringify(['name']) // We only need the 'name' for the next step
        })
      });

      if (!listResponse.ok) {
        throw new Error(`Failed to fetch initial call list: ${listResponse.statusText}`);
      }

      const listData = await listResponse.json();
      const callSummaries = listData.message || [];

      if (callSummaries.length === 0) {
        setCallLogs([]); // If there are no calls, set state to empty and exit.
        return;
      }

      // 2. Create an array of promises. Each promise is an API call to get the details for one call log.
      const detailPromises = callSummaries.map((summary: { name: any; }) =>
        fetch(`${API_BASE_URL}/method/crm.fcrm.doctype.crm_call_log.crm_call_log.get_call_log`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: summary.name }) // Pass the unique name for each call
        }).then(res => res.json()) // Parse the JSON response for each call
      );

      // 3. Use Promise.all to wait for ALL the detail-fetching API calls to complete.
      const detailResponses = await Promise.all(detailPromises);

      // 4. The result is an array of responses. We need to combine their 'message' properties.
      // .flatMap() is a clean way to merge the arrays from each response.
      const allCallLogs = detailResponses.flatMap(response => response.message || []);

      // 5. Finally, update the state a single time with the complete, combined list of call logs.
      setCallLogs(allCallLogs);

    } catch (error) {
      console.error('Error fetching call logs:', error);
      showToast('Failed to fetch call logs', { type: 'error' });
    } finally {
      setCallsLoading(false);
    }
  };

  useEffect(() => {
    if (showEmailModal && composerRef.current) {
      setTimeout(() => {
        composerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    }
  }, [showEmailModal, emailModalMode]);

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
            Authorization: token,
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
            Authorization: token,
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
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: lead.name
        })
      });

      if (response.ok) {
        const result = await response.json();

        // Extract user_info from the response
        if (result.docinfo?.user_info) {
          setUserInfo(result.docinfo.user_info);
        }

        // Get comments from activities
        let commentsData: Comment[] = [];
        const activities = result.message[0] || [];

        // Filter for comment activities and extract attachments
        commentsData = activities
          .filter((activity: any) =>
            activity.activity_type === 'comment' &&
            !activity.content?.toLowerCase().includes('company_info') &&
            !activity.content?.toLowerCase().includes('company intelligence') &&
            !activity.content?.toLowerCase().includes('lead_summary') &&
            !activity.content?.toLowerCase().includes('lead score')
          )
          .map((comment: any) => {
            let attachments = [];

            try {
              // Try to parse attachments if they exist
              if (comment.attachments) {
                attachments = typeof comment.attachments === 'string'
                  ? JSON.parse(comment.attachments)
                  : comment.attachments;
              }
            } catch (e) {
              console.error('Error parsing comment attachments:', e);
              attachments = [];
            }

            return {
              name: comment.name,
              content: comment.content,
              comment_type: 'Comment',
              creation: comment.creation,
              comment_by: comment.comment_by,
              owner: comment.owner,
              subject: comment.subject || '',
              attachments: attachments
            };
          });

        setComments(commentsData);
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showToast('Failed to fetch comments', { type: 'error' });
    } finally {
      setCommentsLoading(false);
    }
  };

  const getUserDisplayName = (email: string): string => {
    if (userInfo[email]?.fullname) {
      return userInfo[email].fullname;
    }
    // Fallback to email if no fullname found
    return email;
  };

  // Helper function to get user initial
  const getUserInitial = (email: string): string => {
    const displayName = getUserDisplayName(email);
    return displayName.charAt(0).toUpperCase();
  };

  useEffect(() => {
    fetchComments()
  }, [listSuccess])


  const fetchTasks = useCallback(async () => {
    setNotesLoading(true);
    try {
      const response = await fetch(
        'https://api.erpnext.ai/api/method/crm.api.activities.get_activities',
        {
          method: 'POST',
          headers: {
            'Authorization': token,
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
          'Authorization': token,
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
          'Authorization': token,
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

  const fetchCallerOptions = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;
      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: "User", // Assuming you are searching for users
          txt: "",
          filters: sessionCompany ? { company: sessionCompany } : null
        })
      });

      if (response.ok) {
        const result = await response.json();
        // The API response is an array of {value, description}, so we can set it directly
        setCallerOptions(result.message || []);
      }
    } catch (error) {
      console.error('Error fetching caller options:', error);
    }
  };

  const fetchTerritoryOptions = async () => {
    try {
      // const session = getUserSession();
      // const sessionCompany = session?.company;
      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Territory",
          // filters: sessionCompany ? { company: sessionCompany } : null

        })
      });

      if (response.ok) {
        const result = await response.json();
        // Extract territory names from the response
        const territories = result.message.map((territory: any) => territory.value);
        setTerritoryOptions(territories);
      }
    } catch (error) {
      console.error('Error fetching territories:', error);
      // Fallback to static options if API fails
      setTerritoryOptions(["US", "India"]);
    }
  };

  // Call this function in useEffect
  useEffect(() => {
    fetchTerritoryOptions();
  }, []);

  const fetchOrganizationOptions = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setOrganizationOptions([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Organization",
          filters: JSON.stringify({
            company: sessionCompany
          })
        })
      });

      if (response.ok) {
        const result = await response.json();
        setOrganizationOptions(result.message?.map((org: any) => org.value) || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchCompanyIntelligence = async (companyName: string) => {
    if (!companyName.trim()) {
      showToast('Please enter an organization name in the Data tab', { type: 'warning' });
      return;
    }

    // Check if we already have cached intelligence data in the lead
    if (editedLead.company_info) {
      try {
        // Parse the cached data
        const cachedData = typeof editedLead.company_info === 'string'
          ? JSON.parse(editedLead.company_info)
          : editedLead.company_info;

        // Validate that cached data has the expected structure
        if (cachedData && (cachedData.json || cachedData.scorecard || cachedData.identity_and_overview)) {
          setCompanyIntelligence(cachedData);
          showToast('Loaded cached company intelligence report', { type: 'info' });
          return;
        }
      } catch (error) {
        console.error('Error parsing cached company info:', error);
        // If parsing fails, continue to fetch new data
      }
    }

    setIntelligenceLoading(true);
    setIntelligenceError(null);

    try {
      // 1. First, check available credits
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      const creditsResponse = await fetch(
        'https://api.erpnext.ai/api/method/customcrm.api.check_credits_available',
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'report',
            company: sessionCompany
          })
        }
      );

      if (!creditsResponse.ok) {
        throw new Error('Failed to check credits availability');
      }

      const creditsData = await creditsResponse.json();
      const creditsInfo = creditsData.message;

      // Check if credits are available
      if (!creditsInfo.status) {
        const credits = creditsInfo.available_credits || 0;
        showToast(`Insufficient credits. You have only ${credits} credits available. Please add more to proceed.`, { type: 'error' });
        setIntelligenceLoading(false);
        return;
      }

      // 2. Generate company intelligence report
      const generateResponse = await fetch(
        'https://api.erpnext.ai/api/method/customcrm.email.generate_companyinfo.generate_company_report',
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            company_name: companyName
          })
        }
      );

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        throw new Error(`API returned ${generateResponse.status}: ${errorText}`);
      }

      const generateResult = await generateResponse.json();

      // Handle different possible response structures
      let intelligenceData = null;

      if (generateResult.message) {
        // Try to parse if message is a string
        if (typeof generateResult.message === 'string') {
          try {
            intelligenceData = JSON.parse(generateResult.message);
          } catch (e) {
            // If it's not JSON, check if it's already an object
            intelligenceData = generateResult.message;
          }
        } else {
          intelligenceData = generateResult.message;
        }
      } else if (generateResult.json) {
        intelligenceData = generateResult;
      } else {
        intelligenceData = generateResult;
      }

      // Validate the data structure
      if (!intelligenceData || (typeof intelligenceData === 'object' && Object.keys(intelligenceData).length === 0)) {
        throw new Error('Received empty or invalid company intelligence data');
      }

      // 3. Save the intelligence data to the lead
      await saveCompanyIntelligenceToLead(lead.name, intelligenceData);

      // 4. Add action log for credit usage
      try {
        const inputToken = intelligenceData.cost?.input_tokens || 0;
        const outputToken = intelligenceData.cost?.output_tokens || 0;
        const usdCost = intelligenceData.cost?.usd || 0;
        const inrCost = intelligenceData.cost?.inr || 0;

        await fetch('https://api.erpnext.ai/api/method/customcrm.api.add_action_log', {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doc: "CRM Lead",
            parent: lead.name,
            type: "report",
            data_ctrx: inputToken,
            output_token: outputToken,
            usd: usdCost,
            inr: inrCost
          })
        });
        console.log('Action log added successfully');
      } catch (logError) {
        console.error('Failed to add action log:', logError);
        // Don't show error to user as this is just logging
      }

      // 5. Update state with the new intelligence data
      setCompanyIntelligence(intelligenceData);


    } catch (error) {
      console.error('Error fetching company intelligence:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate company intelligence report';
      setIntelligenceError(errorMessage);
      showToast(errorMessage, { type: 'error' });
    } finally {
      setIntelligenceLoading(false);
    }
  };



  const saveCompanyIntelligenceToLead = async (leadName: string, intelligenceData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Lead',
          name: leadName,
          fieldname: {
            company_info: JSON.stringify(intelligenceData)
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save company intelligence');
      }

      // Update the local state to include the company_info
      setEditedLead(prev => ({
        ...prev,
        company_info: JSON.stringify(intelligenceData)
      }));

      // Note: We're NOT creating an activity log here
      showToast('Company intelligence report Generated and  saved successfully', { type: 'success' });

    } catch (error) {
      console.error('Error saving company intelligence:', error);
      showToast('Failed to save company intelligence to lead', { type: 'error' });
    }
  };

  // Update the useEffect that triggers intelligence generation
  // useEffect(() => {
  //   const generateIntelligenceReport = async () => {
  //     if (activeTab === 'intelligence' &&
  //       editedLead.organization &&
  //       !companyIntelligence &&
  //       !intelligenceLoading) {
  //       await fetchCompanyIntelligence(editedLead.organization);
  //     }
  //   };

  //   generateIntelligenceReport();
  // }, [activeTab, editedLead.organization, companyIntelligence, intelligenceLoading, editedLead.company_info]);

  const fetchContactOptions = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setContactOptions([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "", // Search text (empty to get all)
          doctype: "Contact",
          filters: JSON.stringify({
            company: sessionCompany
          })
        })
      });

      if (response.ok) {
        const result = await response.json();

        // The new API returns results in a different format
        const contacts = result.message || [];
        const names = contacts
          .map((contact: any) => contact.value) // Extract the contact name from value field
          .filter((name: string | undefined) => !!name && name.trim() !== "");

        setContactOptions(Array.from(new Set(names)));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchOrganizationInfo = async (companyName: string) => {
    if (!companyName.trim()) {
      showToast('Please enter an organization name', { type: 'warning' });
      return;
    }

    setGeneratingInfo(true);
    try {
      const response = await fetch('https://api.erpnext.ai/api/method/customcrm.email.get_company_info.get_company_info', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_name: companyName
        })
      });

      if (response.ok) {
        const result = await response.json();
        const companyInfo = result.message;

        // Update the lead with company details
        const updatedLead = {
          ...editedLead,
          company_details: companyInfo
        };

        setEditedLead(updatedLead);
        setOrganizationInfo(companyInfo);

        // Save to the server using company_details field
        await saveCompanyDetailsToLead(companyInfo);

        showToast('Company information generated and saved successfully', { type: 'success' });
      } else {
        throw new Error('Failed to fetch company info');
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
      showToast('Failed to generate company information', { type: 'error' });
    } finally {
      setGeneratingInfo(false);
    }
  };

  // Function to save company details to the lead
  const saveCompanyDetailsToLead = async (companyInfo: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Lead',
          name: lead.name,
          fieldname: {
            company_details: JSON.stringify(companyInfo)
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save company details');
      }
    } catch (error) {
      console.error('Error saving company details:', error);
      throw error;
    }
  };

  // Add this useEffect to automatically close modals on successful submission
  useEffect(() => {
    if (listSuccess && (showEmailModal || showCommentModal)) {
      // Small delay to allow the user to see the success message
      const timer = setTimeout(() => {
        if (showEmailModal) {
          setShowEmailModal(false);
          setReplyData(undefined);
          setEmailModalMode("reply");
        }
        if (showCommentModal) {
          setShowCommentModal(false);
          setReplyData(undefined);
        }

        // Reset the success message
        setListSuccess('');
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [listSuccess, showEmailModal, showCommentModal]);

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
    fetchCallerOptions();
    fetchOrganizationOptions();
    fetchContactOptions();
  }, []);

  const handleConvert = async (params: {
    lead: string;
    deal?: any;
    existing_contact?: string;
    existing_organization?: string;
    company_info?: string;
  }) => {
    try {
      setLoading(true);
      const session = getUserSession();
      const sessionCompany = session?.company || 'PSD-branch2';
      const {
        lead: leadName,
        deal: dealData = {},
        existing_contact,
        existing_organization,
        company_info
      } = params;

      const companyInfoData = company_info || (editedLead.company_info
        ? JSON.stringify(editedLead.company_info)
        : undefined);

      // Include the expected_deal_value and expected_closure_date in the deal data
      const dealWithValues = {
        ...dealData,
        expected_deal_value: dealData.expected_deal_value,
        expected_closure_date: dealData.expected_closure_date,
        ...(companyInfoData && { company_info: companyInfoData })
      };

      // --- 1. First API Call: Convert the Lead to a Deal ---
      const leadResponse = await fetch(`${API_BASE_URL}/method/crm.fcrm.doctype.crm_lead.crm_lead.convert_to_deal`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lead: leadName,
          deal: dealWithValues, // Use the updated deal data with the new fields
          company: sessionCompany,
          existing_contact,
          existing_organization,
          company_info: company_info
        })
      });

      // if (!leadResponse.ok) {
      //   throw new Error('Failed to fetch lead details');
      // }


      if (!leadResponse.ok) {
        const errorData = await leadResponse.json();

        // Check for _server_messages in the response data
        if (errorData._server_messages) {
          try {
            // Parse the outer JSON string (stringified array)
            const serverMessagesArray = JSON.parse(errorData._server_messages);

            // The first element is the actual message object (still a stringified JSON object)
            if (serverMessagesArray && serverMessagesArray.length > 0) {
              const messageObject = JSON.parse(serverMessagesArray[0]);

              // Use showToast with the extracted information
              const message = messageObject.message.replace(/<\/?strong>/g, ''); // Strip HTML tags
              showToast(message, { type: messageObject.indicator === 'red' ? 'error' : 'warning' });

              // Skip the rest of the conversion logic on failure
              return;
            }
          } catch (parseError) {
            // Fallback if parsing fails
            console.error('Failed to parse _server_messages:', parseError);
          }
        }

        // Fallback to generic error message if no specific server message was handled
        throw new Error(errorData.exception || 'Failed to convert lead (Unknown API Error).');
      }
      showToast('Deal converted successfully!', { type: 'success' });

      // --- 2. Second API Call: Fetch Organization Details ---

      const organizationToFetch = existing_organization || editedLead.organization;

      // Now, we check if we have an organization name from either source.
      if (organizationToFetch) {
        console.log(`Fetching details for organization: ${organizationToFetch}`);
        const orgDetailsResponse = await fetch(`${API_BASE_URL}/method/frappe.client.get`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doctype: "CRM Organization",
            name: organizationToFetch, // ✅ Use the determined organization name here
            company: sessionCompany,
            // filters: {
            //   company: sessionCompany   // ✅ Add filters here
            // },
          })
        });

        if (!orgDetailsResponse.ok) {
          throw new Error('Failed to fetch organization details after conversion');
        }

        const orgData = await orgDetailsResponse.json();
        console.log('Successfully fetched organization details:', orgData.message);
      }
      // ✅ MODIFICATION END

      // --- 3. Final Step: Update the Lead's 'converted' status ---
      // This part also remains the same.
      const updateLeadResponse = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Lead',
          name: leadName,
          fieldname: 'converted',
          value: "1"
        })
      });

      if (!updateLeadResponse.ok) {
        throw new Error('Deal created, but failed to update lead');
      }

      showToast('Deal converted successfully!', { type: 'success' });
      setShowPopup(false);
      const leadResponseData = await leadResponse.json();
      const newDealId = leadResponseData.message;
      //onBack();
      onConversionSuccess(newDealId);
    } catch (error) {
      console.error('Conversion failed:', error);
      showToast('Failed to convert deal.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };




  // Usage example:
  // handleConvert({
  //   lead: "CRM-LEAD-2025-00001", 
  //   deal: {}, 
  //   existing_contact: "hari", 
  //   existing_organization: "g"
  // });

  // Usage example:
  // handleConvert({
  //   lead: "CRM-LEAD-2025-00001", 
  //   deal: {
  //     deal_name: "New Deal",
  //     expected_close: "2025-12-31",
  //     deal_value: 50000
  //   }, 
  //   existing_contact: "hari", 
  //   existing_organization: "g"
  // });

  const addNote = async () => {
    if (!noteForm.title.trim()) {
      showToast('All required fields must be filled before proceeding.', { type: 'warning' });
      return;
    }

    setNotesLoading(true);
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doc: JSON.stringify({
            doctype: 'FCRM Note',
            title: noteForm.title,
            company: sessionCompany,
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

  const fetchIndustryOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Industry"
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Extract industry names from the response
        const industries = result.message.map((industry: any) => industry.value);
        setIndustryOptions(industries);
      } else {
        // Fallback to static options if API fails
        setIndustryOptions([
          "Manufacturing", "Retail", "Healthcare", "Education",
          "Technology", "Finance", "Real Estate", "Hospitality",
          "Transportation", "Construction"
        ]);
      }
    } catch (error) {
      console.error('Error fetching industry options:', error);
      // Fallback to static options if API fails
      setIndustryOptions([
        "Manufacturing", "Retail", "Healthcare", "Education",
        "Technology", "Finance", "Real Estate", "Hospitality",
        "Transportation", "Construction"
      ]);
    }
  };

  // Call this function in useEffect
  useEffect(() => {
    fetchIndustryOptions();
  }, []);



  const editNote = async () => {
    // if (!noteForm.title.trim()) {
    //   return false;
    // }
    if (!noteForm.title.trim()) {
      showToast('All required fields must be filled before proceeding.', { type: 'warning' });
      return;
    }

    setNotesLoading(true);
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'FCRM Note',
          name: noteForm.name,
          company: sessionCompany,
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
          'Authorization': token,
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

  const refreshAllActivities = useCallback(async () => {
    await Promise.all([
      fetchActivities(),      // Refresh the main activity timeline
      fetchCallLogs(),       // Refresh calls
      fetchComments(),       // Refresh comments
      fetchEmails(),        // Refresh emails
      fetchNotes(),         // Refresh notes
      fetchTasks(),         // Refresh tasks
      fetchFiles(),         // Refresh files
    ]);
  }, [fetchActivities, fetchCallLogs, fetchComments, fetchEmails,
    fetchNotes, fetchTasks, fetchFiles]);


  // const addCall = async () => {

  //   // if (!callForm.from.trim() || !callForm.to.trim()) {
  //   //   showToast('All required fields must be filled before proceeding.', { type: 'error' });
  //   //   return;
  //   // }
  //   const newErrors: { [key: string]: string } = {};

  //   if (!callForm.from.trim()) {
  //     newErrors.from = 'From is required';
  //   }

  //   if (!callForm.to.trim()) {
  //     newErrors.to = 'To is required';
  //   }
  //   if (!callForm.type.trim()) {
  //     newErrors.type = 'Type is required';
  //   }

  //   if (Object.keys(newErrors).length > 0) {
  //     setErrors(newErrors);
  //     showToast('Please fill all required fields', { type: 'error' });
  //     return;
  //   }

  //   // Clear any previous errors
  //   setErrors({});

  //   setCallsLoading(true);
  //   try {
  //     const session = getUserSession();
  //     const sessionCompany = session?.company || '';
  //     // Generate a random ID (or you can keep your existing ID generation logic)
  //     const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();

  //     // Prepare the document data
  //     const docData = {
  //       doctype: "CRM Call Log",
  //       id: randomId,
  //       telephony_medium: "Manual",
  //       reference_doctype: "CRM Lead",
  //       company: sessionCompany,
  //       reference_docname: lead.name,
  //       type: callForm.type === 'Outgoing' ? 'Outgoing' : 'Incoming',
  //       to: callForm.to,
  //       from: callForm.from,
  //       status: callForm.status,
  //       duration: callForm.duration || "0",
  //       // receiver: userSession?.email || "Administrator" // Use current user's email
  //     };

  //     if (callForm.type === 'Outgoing') {
  //       docData.caller = callForm.caller; // Only add caller for outgoing
  //     } else if (callForm.type === 'Incoming') {
  //       docData.receiver = callForm.receiver; // Only add receiver for incoming
  //     }

  //     // Call the frappe.client.insert API
  //     const response = await fetch('https://api.erpnext.ai/api/method/frappe.client.insert', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': AUTH_TOKEN,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         doc: docData
  //       })
  //     });

  //     if (response.ok) {
  //       setCallForm({
  //         from: '',
  //         to: '',
  //         status: 'Ringing',
  //         type: 'Outgoing',
  //         duration: '',
  //         caller: '',
  //         receiver: '',
  //         name: ''
  //       });
  //       await fetchCallLogs();
  //       return true; // Return success status
  //     } else {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to add call log');
  //     }
  //   } catch (error: any) {
  //     console.error('Error adding call log:', error);
  //     showToast(error.message || 'Failed to add call log', { type: 'error' });
  //     return false; // Return failure status
  //   } finally {
  //     setCallsLoading(false);
  //   }
  // };
  const addCall = async () => {
    // --- Validation remains the same ---
    const newErrors: { [key: string]: string } = {};
    if (!callForm.from.trim()) newErrors.from = 'From is required';
    if (!callForm.to.trim()) newErrors.to = 'To is required';
    if (!callForm.type.trim()) newErrors.type = 'Type is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }
    setErrors({});
    setCallsLoading(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      // --- MODIFICATION START ---
      // 1. Create a base data object with common fields
      const docData: any = {
        doctype: "CRM Call Log",
        id: randomId,
        telephony_medium: "Manual",
        reference_doctype: "CRM Lead",
        company: sessionCompany,
        reference_docname: lead.name,
        type: callForm.type,
        to: callForm.to,
        from: callForm.from,
        status: callForm.status,
        duration: callForm.duration || "0",
      };

      // 2. Conditionally add 'caller' or 'receiver' based on the type
      if (callForm.type === 'Outgoing') {
        docData.caller = callForm.caller; // Only add caller for outgoing
      } else if (callForm.type === 'Incoming') {
        docData.receiver = callForm.receiver; // Only add receiver for incoming
      }
      // --- MODIFICATION END ---

      const response = await fetch('https://api.erpnext.ai/api/method/frappe.client.insert', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doc: docData // Use the dynamically created docData object
        })
      });

      if (response.ok) {
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
        await fetchCallLogs();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add call log');
      }
    } catch (error: any) {
      console.error('Error adding call log:', error);
      showToast(error.message || 'Failed to add call log', { type: 'error' });
      return false;
    } finally {
      setCallsLoading(false);
    }
  };

  const editCall = async () => {
    // --- Validation remains the same ---
    const newErrors: { [key: string]: string } = {};
    if (!callForm.from.trim()) newErrors.from = 'From is required';
    if (!callForm.to.trim()) newErrors.to = 'To is required';
    if (!callForm.type.trim()) newErrors.type = 'Type is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fill all required fields', { type: 'error' });
      return;
    }
    setErrors({});
    setCallsLoading(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      // --- MODIFICATION START ---
      // 1. Create a base fieldname object with common fields
      const fieldname: any = {
        telephony_medium: "Manual",
        reference_doctype: "CRM Lead",
        reference_docname: lead.name,
        company: sessionCompany,
        type: callForm.type,
        to: callForm.to,
        from: callForm.from,
        status: callForm.status,
        duration: callForm.duration || "0",
      };

      // 2. Conditionally set 'caller' or 'receiver' and nullify the other
      if (callForm.type === 'Outgoing') {
        fieldname.caller = callForm.caller;
        fieldname.receiver = null; // Clear receiver when it's an outgoing call
      } else if (callForm.type === 'Incoming') {
        fieldname.receiver = callForm.receiver;
        fieldname.caller = null; // Clear caller when it's an incoming call
      }
      // --- MODIFICATION END ---

      const response = await fetch('https://api.erpnext.ai/api/method/frappe.client.set_value', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: "CRM Call Log",
          name: callForm.name,
          fieldname: fieldname // Use the dynamically created fieldname object
        })
      });

      if (response.ok) {
        showToast('Call log updated successfully', { type: 'success' });
        setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', caller: '', receiver: '', name: '' });
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


  const addTask = async (formData: TaskForm) => {
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
      // Prepare the task data
      const taskData: any = {
        reference_doctype: 'CRM Lead',
        reference_docname: lead.name,
        assigned_to: formData.assigned_to,
        company: sessionCompany,
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
          'Authorization': token,
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
      // Prepare the update data
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to,
        company: sessionCompany,
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
          'Authorization': token,
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

  const filteredTerritoryOptions = territoryOptions.filter(territory =>
    territory.toLowerCase().includes(territorySearch.toLowerCase())
  );

  useEffect(() => {
    const fetchSalutations = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://api.erpnext.ai/api/method/frappe.desk.search.search_link", {
          method: "POST",
          headers: {
            'Authorization': token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            txt: "",
            filters: null,
            doctype: "Salutation",
          }),
        });

        const data = await response.json();

        // Check if data.message exists and is an array
        if (data && data.message && Array.isArray(data.message)) {
          setOptions(
            data.message.map((item: any) => ({
              value: item.value,
              label: item.value,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching salutations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalutations();
  }, []);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is allowed

    // Regular expression for URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    // Test basic pattern
    if (!urlPattern.test(url)) {
      return false;
    }

    // Additional check for valid TLD (optional but recommended)
    const tldPattern = /\.[a-z]{2,}$/i;
    if (!tldPattern.test(url)) {
      return false;
    }

    return true;
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: { [key: string]: string } = {};

    // ✅ Validation
    if (!editedLead.firstName || editedLead.firstName.trim() === "") {
      newErrors.firstName = "First Name is required";
    }

    if (editedLead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedLead.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (editedLead.mobile) {
      if (!/^\d+$/.test(editedLead.mobile)) {
        newErrors.mobile = 'Invalid mobile number (digits only allowed)';
      } else if (editedLead.mobile.length < 10) {
        newErrors.mobile = 'Please enter at least 10 digits';
      }
    }

    if (editedLead.website && !isValidUrl(editedLead.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., example.com or https://example.com)';
    }
    // If there are errors, stop and show them
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // clear errors
    setLoading(true);

    try {
      // First API Call: Update the lead data on the server (this part is correct)
      const setValueResponse = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': token,
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
            salutation: editedLead.salutation,
            lead_owner: editedLead.lead_owner,

          }
        })
      });

      if (!setValueResponse.ok) {
        throw new Error('Failed to update lead');
      }

      // Second API Call: Fetch the updated lead data
      const getResponse = await fetch(`${API_BASE_URL}/method/frappe.client.get`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: 'CRM Lead',
          name: lead.name
        })
      });

      if (!getResponse.ok) {
        throw new Error('Failed to fetch updated lead data after saving.');
      }

      const result = await getResponse.json();
      const updatedLeadFromServer = result.message;

      // --- ✨ NEW MAPPING LOGIC ADDED HERE ---
      // Map the API response (snake_case) to your component's state structure (camelCase).
      const mappedLead: Lead = {
        ...updatedLeadFromServer, // Copy all matching properties
        firstName: updatedLeadFromServer.first_name,  // Map first_name -> firstName
        lastName: updatedLeadFromServer.last_name,    // Map last_name -> lastName
        mobile: updatedLeadFromServer.mobile_no,      // Map mobile_no -> mobile
        jobTitle: updatedLeadFromServer.job_title,    // Map job_title -> jobTitle
        // Ensure other properties from the Lead interface are present if they don't exist on the server response
        id: updatedLeadFromServer.name, // Assuming 'name' is the ID
        leadId: updatedLeadFromServer.name,
        assignedTo: updatedLeadFromServer.lead_owner,
        lastModified: updatedLeadFromServer.modified,
        lead_score: updatedLeadFromServer.lead_score,
        lead_summary: updatedLeadFromServer.lead_summary,
      };

      // Update the local state with the correctly mapped data
      setEditedLead(mappedLead);

      // Propagate changes and update UI
      onSave(mappedLead);
      setIsEditing(false);
      showToast('Lead updated successfully', { type: 'success' });

    } catch (error) {
      console.error('Error in save process:', error);
      showToast('An error occurred while saving the lead', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerHTML || "";
  }

  useEffect(() => {
    fetchLeadOwners();
  }, []);

  // Add function to fetch lead owners
  const fetchLeadOwners = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setLeadOwners([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "User",
          filters: JSON.stringify({
            company: sessionCompany
          })
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Extract email values from the response
        const owners = result.message.map((user: any) => user.value);
        setLeadOwners(owners);
      }
    } catch (error) {
      console.error('Error fetching lead owners:', error);
      // Fallback to static options if API fails
      setLeadOwners([
        "Administrator",
        "arun@psd.com",
        "demo@psdigitise.com",
        "fen87joshi@yahoo.com",
        "fenila@psd.com",
        "hariprasad@psd.com"
      ]);
    }
  };

  const fetchSourceOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/method/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Lead Source",
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Extract source names from the response
        const sources = result.message.map((source: any) => source.value);
        setSourceOptions(sources);
      } else {
        // Fallback to static options if API fails
        setSourceOptions([
          "Advertisement", "Campaign", "Cold Calling", "Customer's Vendor",
          "Exhibition", "Existing Customer", "From Fenila", "Reference",
          "Supplier Reference", "Walk In"
        ]);
      }
    } catch (error) {
      console.error('Error fetching source options:', error);
      // Fallback to static options if API fails
      setSourceOptions([
        "Advertisement", "Campaign", "Cold Calling", "Customer's Vendor",
        "Exhibition", "Existing Customer", "From Fenila", "Reference",
        "Supplier Reference", "Walk In"
      ]);
    }
  };

  // Call this function in useEffect
  useEffect(() => {
    fetchSourceOptions();
  }, []);

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

    setEmailModalMode("reply");
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
          'Authorization': token,
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
      case 'Unqualified':
        return theme === 'dark' ? 'bg-gray-800 text-green-300' : 'bg-gray-800 text-green-800';
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

  // Define an array of tabs where the modal should NOT close automatically.
  const modalSafeTabs = ['comments', 'emails', 'activity'];

  useEffect(() => {
    // Check if the modal is open and if the active tab is NOT in our safe list.
    if (showEmailModal && modalSafeTabs.includes(activeTab)) {
      // If both are true, close the modal and reset its state.
      setShowEmailModal(false);
      setReplyData(undefined);
      setEmailModalMode("reply");
    }
  }, [activeTab]); // This effect runs only when `activeTab` changes.

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
              'Authorization': token,
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


  // lead score circle 
  const getScoreStatus = (score) => {
    if (score >= 75) return "hot";
    if (score >= 40) return "warm";
    return "cold";
  };

  const score = editedLead.lead_score ?? 0;
  const status = getScoreStatus(score);

  const colors = {
    hot: {
      border: "border-red-600",
      bg: "bg-[#dc26269e]",
      icon: <Flame size={20} className="text-red-400" />
    },
    warm: {
      border: "border-yellow-500",
      bg: "bg-[#facc1590]",
      icon: <Sun size={20} className="text-yellow-300" />
    },
    cold: {
      border: "border-green-600",
      bg: "bg-[#16a34a85]",
      icon: <Snowflake size={20} className="text-green-300" />
    }
  };



  return (
    <div className={`min-h-screen relative ${bgColor}`}>
      {/* Header */}
      <div className={`border-b px-4 sm:px-6 py-4 ${theme === 'dark'
        ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
        : 'bg-white border-gray-200'
        }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                {lead.first_name} {lead.last_name || ''} - {lead.organization || 'No Organization'}
              </h1>
              <p className={`text-sm ${textSecondaryColor}`}>{lead.name || lead.leadId}</p>
              {/* <p className={`text-sm ${textSecondaryColor}`}>{lead.leadId}</p> */}
            </div>

          </div>
          <div
            className={`flex flex-col items-center gap-2 px-4 py-2 rounded-full  w-fit relative group mx-auto ${theme === 'dark'
              ? 'bg-transparent text-white'
              : 'bg-transparent text-gray-800'
              }`}
          >
            {/* Score Circle */}
            <span
              className={`w-16 h-16 p-2 flex flex-col items-center justify-center rounded-full border-4 ${theme === 'dark'
                ? colors[status].border
                : colors[status].border.replace('border-', 'border-').replace('-600', '-400')
                } ${theme === 'dark'
                  ? colors[status].bg
                  : colors[status].bg.replace('bg-[', 'bg-').replace(']', '/30')
                }`}
            >
              <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                {React.cloneElement(colors[status].icon, {
                  className: `w-4 h-4 ${theme === 'dark' ? colors[status].icon.props.className : colors[status].icon.props.className.replace('text-', 'text-').replace('-300', '-500').replace('-400', '-600')}`
                })}
              </div>
              <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {score}
              </p>
            </span>

            {/* Label + Score */}
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
              AI Lead Score
            </span>

            {/* Summary Tooltip */}
            {editedLead.lead_summary && editedLead.lead_summary.trim() !== "" && (
              <div className={`fixed w-[400px] max-lg:w-[280px] border text-sm left-0 top-[11%] right-0 mx-auto px-4 py-3 rounded hidden group-hover:flex flex-col items-center z-10 ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
                }`}>
                <p className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                  Summary
                </p>
                {editedLead.lead_summary}
              </div>
            )}
          </div>

          <div className="flex flex-nowrap items-center gap-2 self-start sm:self-center">
            <div>
              <button
                onClick={() => setShowPopup(true)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <Building2 className="w-4 h-4" />
                <span>Convert To Deal</span>
              </button>

              {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className={`rounded-lg p-6 w-full max-w-md shadow-lg relative ${theme === 'dark'
                    ? 'bg-dark-secondary border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}>
                    <button
                      onClick={() => setShowPopup(false)}
                      className={`absolute top-2 right-3 text-xl font-bold ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
                        }`}
                    >
                      &times;
                    </button>

                    <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      Convert to Deal
                    </h2>

                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Organization
                        </span>
                        <ToggleSwitch
                          enabled={orgToggle}
                          onToggle={() => setOrgToggle(!orgToggle)}
                        />
                      </div>
                      {orgToggle ? (
                        <select
                          value={selectedOrganization}
                          onChange={(e) => setSelectedOrganization(e.target.value)}
                          className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } border`}
                        >
                          <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } border`} value="">Choose Existing Organization</option>
                          {organizationOptions.map(org => (
                            <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              } border`} key={org} value={org}>{org}</option>
                          ))}
                        </select>
                      ) : (
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          New organization will be created based on the data in details section
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Contact
                        </span>
                        <ToggleSwitch
                          enabled={contactToggle}
                          onToggle={() => setContactToggle(!contactToggle)}
                        />
                      </div>

                      {contactToggle ? (
                        <select
                          className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } border`}
                          value={selectedContact}
                          onChange={e => setSelectedContact(e.target.value)}
                        >
                          <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } border`} value="">Choose Existing Contact</option>
                          {contactOptions.map(name => (
                            <option className={`mt-2 w-full rounded px-3 py-2 ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              } border`} key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          New contact will be created based on the person's details
                        </p>
                      )}
                    </div>

                    {/* New Deal Value Field */}
                    {/* <div className="mb-4">
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Expected Deal Value <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={expectedDealValue}
                        onChange={(e) => setExpectedDealValue(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white !placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                          }`}
                        placeholder="Enter expected deal value"
                        required
                      />
                    </div> */}

                    <div className="mb-4">
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                      >
                        Expected Deal Value <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="number"
                        inputMode="numeric"
                        value={expectedDealValue}
                        placeholder="Enter expected deal value"
                        required
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // digits only
                          if (value.length <= 8) {
                            setExpectedDealValue(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          // block non-numeric number-input chars
                          if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white !placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                          }`}
                      />
                    </div>


                    <div className="mb-6">
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Expected Closure Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={expectedClosureDate}
                          onChange={(e) => setExpectedClosureDate(e.target.value)}
                          className={`
        w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
        appearance-none
        ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                            }
      `}
                          required
                        />
                        {/* Custom calendar icon */}
                        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-transparent'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleConvert({
                        lead: lead.name,
                        deal: {
                          expected_deal_value: expectedDealValue,
                          expected_closure_date: expectedClosureDate
                        },
                        existing_contact: selectedContact,
                        existing_organization: orgToggle ? selectedOrganization : undefined,
                        company_info: companyIntelligence ? JSON.stringify(companyIntelligence) : undefined
                      })}
                      className={`mt-4 w-full py-2 rounded transition-colors ${theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } disabled:opacity-50`}
                      disabled={loading || !expectedDealValue || !expectedClosureDate}
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
              onChange={async (newStatus: Lead['status']) => {
                const updated = { ...editedLead, status: newStatus };

                try {
                  setLoading(true);
                  const response = await fetch('https://api.erpnext.ai/api/method/frappe.client.set_value', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': token,
                    },
                    body: JSON.stringify({
                      doctype: 'CRM Lead',
                      name: updated.name,
                      fieldname: 'status',
                      value: newStatus,
                    }),
                  });

                  if (response.ok) {
                    // Update local state only if API call is successful
                    setEditedLead(updated);
                    onSave(updated);

                    // Show success toast
                    showToast('Status updated successfully', { type: 'success' });
                    await fetchActivities();
                  } else {
                    throw new Error('Failed to update status');
                  }
                } catch (error) {
                  console.error('Failed to update lead status:', error);
                  // Show error toast
                  showToast('Failed to update status', { type: 'error' });
                } finally {
                  setLoading(false);
                }
              }}
            >

              <div className="relative inline-block w-48">
                <Listbox.Button
                  className={`pl-8 pr-4 py-2 rounded-lg transition-colors appearance-none w-full text-left ${theme === 'dark' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaCircleDot className={statusColors[editedLead.status]} />
                  </span>
                  {/* {editedLead.status} */}
                  <span className="block truncate">{editedLead.status}</span>
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FiChevronDown className="w-4 h-4" />
                  </span>
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
        <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm whitespace-nowrap
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
            <div className="grid grid-cols-1  gap-6">
              <div className="space-y-6">


                {/* Organization Details Section */}
                <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor}  max-sm:p-3 p-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${textColor}`}>Data</h3>
                    <button
                      onClick={handleSave}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span>Saving...</span>
                        </>
                      ) : 'Save'}
                    </button>
                  </div>

                  {editedLead.company_details && (
                    <div className={`mb-6 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
                      <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-600">
                        <h4 className={`text-md font-semibold ${textColor}`}>
                          Company Overview
                        </h4>

                        <button
                          onClick={async () => {
                            const updatedLead = {
                              ...editedLead,
                              company_details: null
                            };
                            setEditedLead(updatedLead);
                            setOrganizationInfo(null);

                            try {
                              await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
                                method: 'POST',
                                headers: {
                                  'Authorization': token,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  doctype: 'CRM Lead',
                                  name: lead.name,
                                  fieldname: {
                                    company_details: null
                                  }
                                })
                              });
                              showToast('Company overview removed', { type: 'success' });
                            } catch (error) {
                              console.error('Error removing company details:', error);
                              showToast('Failed to remove company overview', { type: 'error' });
                            }
                          }}
                          className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-blue-100 text-gray-500'}`}
                          title="Remove company overview"
                        >
                          <IoCloseOutline className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4">
                        {/* Simple display of company info - matching old design */}
                        <div className={`text-sm ${textSecondaryColor} space-y-2`}>
                          {editedLead.company_details.company_name && (
                            <p><strong>Company Name:</strong> {editedLead.company_details.company_name}</p>
                          )}

                          {editedLead.company_details.industry && (
                            <p><strong>Industry:</strong> {editedLead.company_details.industry}</p>
                          )}
                          {editedLead.company_details.description && (
                            <p><strong>Description:</strong> {editedLead.company_details.description}</p>
                          )}
                          {editedLead.company_details.website && (
                            <p><strong>Website:</strong> {editedLead.company_details.website}</p>
                          )}
                          {editedLead.company_details.address && (
                            <p><strong>Address:</strong> {editedLead.company_details.address}</p>
                          )}
                          {editedLead.company_details.employees && (
                            <p><strong>Employees:</strong> {editedLead.company_details.employees}</p>
                          )}
                          {editedLead.company_details.revenue && (
                            <p><strong>Revenue:</strong> {editedLead.company_details.revenue}</p>
                          )}

                          {/* Display any additional fields that might exist */}
                          {/* {Object.entries(editedLead.company_details)
                            .filter(([key, value]) => {
                              const mainFields = ['company_name', 'industry', 'description', 'website', 'address', 'employees', 'revenue'];
                              return !mainFields.includes(key) && value && value !== '';
                            })
                            .map(([key, value]) => (
                              <p key={key}>
                                <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                              </p>
                            ))} */}

                          {/* Fallback for any other data structure */}
                          {typeof editedLead.company_details === 'string' && (
                            <p>{editedLead.company_details}</p>
                          )}

                          {editedLead.company_details && Object.keys(editedLead.company_details).length === 0 && (
                            <p>No information available for this organization.</p>
                          )}

                        </div>
                      </div>

                      <div className="p-4 border-t border-gray-300 dark:border-gray-600">
                        {/* <button
                          onClick={() => fetchOrganizationInfo(editedLead.organization || '')}
                          disabled={generatingInfo}
                          className={`px-3 py-1 text-xs rounded transition-colors flex items-center space-x-1 ${generatingInfo
                            ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                            : theme === 'dark'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                          {generatingInfo ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Regenerating...</span>
                            </>
                          ) : (
                            <span>Regenerate</span>
                          )}
                        </button> */}
                      </div>
                    </div>
                  )}

                  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-4`}>Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Organization</label>

                      <div className="relative mt-1">
                        <input
                          type="text"
                          value={editedLead.organization || ''}
                          readOnly
                          className={`p-[2px] pl-2 pr-20 block border w-full rounded-md ${borderColor} shadow-sm sm:text-sm ${theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs text-gray-500">Read-only</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Website</label>
                      <input
                        type="text"
                        value={editedLead.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                      {errors.website && (
                        <p className="text-sm text-red-500 mt-1">{errors.website}</p>
                      )}
                    </div>
                    <div >
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Territory</label>
                      <Listbox value={editedLead.territory || ''} onChange={(value) => handleInputChange('territory', value)}>
                        {({ open, close }) => (
                          <div className="relative mt-1">
                            <Listbox.Button className={`relative w-full cursor-default rounded-md border ${borderColor} py-0.5 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}>
                              <span className="block truncate">{editedLead.territory || 'Select Territory'}</span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </Listbox.Button>

                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {/* Search Input */}
                              <div className="sticky top-0 z-10 bg-white p-2 border-b">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search"
                                    className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => setTerritorySearch(e.target.value)}
                                    value={territorySearch}
                                  />
                                  <svg className="absolute left-2 top-2.5 rounded-xl h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                  </svg>
                                  <button
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setTerritorySearch('')}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              {/* Territory Options */}
                              {filteredTerritoryOptions.map((territory) => (
                                <Listbox.Option
                                  key={territory}
                                  value={territory}
                                  className={({ active }) =>
                                    `relative cursor-default select-none border-b py-2 pl-3 pr-9 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {territory}
                                      </span>
                                      {selected && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}

                              {/* Create New Button */}
                              {/* <div className="sticky top-[44px] z-10 bg-white border-b">
                                <button
                                  type="button"
                                  className="flex items-center w-full px-3 py-2 text-sm text-black-600 hover:bg-gray-100"
                                  onClick={() => {
                                    setShowCreateTerritoryModal(true);
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create New
                                </button>
                              </div> */}

                              {/* Clear Button */}
                              <div className="sticky top-[88px] z-10 bg-white border-b">
                                <button
                                  type="button"
                                  className="flex items-center w-full px-3 py-2 text-sm text-black-600 hover:bg-gray-100"
                                  onClick={() => {
                                    handleInputChange('territory', '');
                                    setTerritorySearch('');
                                    close(); // Close the dropdown
                                  }}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                  Clear
                                </button>
                              </div>
                            </Listbox.Options>
                          </div>
                        )}
                      </Listbox>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Industry</label>
                      <Listbox
                        value={editedLead.industry || ''}
                        onChange={(value) => handleInputChange('industry', value)}
                      >
                        {({ open, close }) => (
                          <div className="relative mt-1">
                            <Listbox.Button className={`relative w-full cursor-default rounded-md border ${borderColor} py-0.5 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}>
                              <span className="block truncate">{editedLead.industry || 'Select Industry'}</span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </Listbox.Button>

                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {/* Search Input */}
                              <div className="sticky top-0 z-10 bg-white p-2 border-b">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search industries..."
                                    className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => setIndustrySearch(e.target.value)}
                                    value={industrySearch}
                                  />
                                  <svg className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                  </svg>
                                  <button
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setIndustrySearch('')}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              {/* Industry Options */}
                              {industryOptions
                                .filter(industry =>
                                  industry.toLowerCase().includes(industrySearch.toLowerCase())
                                )
                                .map((industry) => (
                                  <Listbox.Option
                                    key={industry}
                                    value={industry}
                                    className={({ active }) =>
                                      `relative cursor-default select-none border-b py-2 pl-3 pr-9 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                      }`
                                    }
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                          {industry}
                                        </span>
                                        {selected && (
                                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                                    setShowCreateIndustryModal(true);
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
                                    handleInputChange('industry', '');
                                    setIndustrySearch('');
                                    close();
                                  }}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                  Clear
                                </button>
                              </div>
                            </Listbox.Options>
                          </div>
                        )}
                      </Listbox>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Job Title</label>
                      <input
                        type="text"
                        value={editedLead.jobTitle || ''}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Source
                      </label>
                      <Listbox
                        value={editedLead.source || ''}
                        onChange={(value) => handleInputChange('source', value)}
                      >
                        {({ open, close }) => (
                          <div className="relative mt-1">
                            <Listbox.Button className={`relative w-full cursor-default rounded-md border ${borderColor} py-0.5 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}>
                              <span className="block truncate">{editedLead.source || 'Select Source'}</span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </Listbox.Button>

                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {/* Search Input */}
                              <div className="sticky top-0 z-10 bg-white p-2 border-b">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search sources..."
                                    className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => setSourceSearch(e.target.value)}
                                    value={sourceSearch}
                                  />
                                  <svg className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                  </svg>
                                  <button
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setSourceSearch('')}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              {/* Source Options */}
                              {sourceOptions
                                .filter(source =>
                                  source.toLowerCase().includes(sourceSearch.toLowerCase())
                                )
                                .map((source) => (
                                  <Listbox.Option
                                    key={source}
                                    value={source}
                                    className={({ active }) =>
                                      `relative cursor-default select-none border-b py-2 pl-3 pr-9 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                      }`
                                    }
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                          {source}
                                        </span>
                                        {selected && (
                                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                                    setShowCreateSourceModal(true);
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
                                    handleInputChange('source', '');
                                    setSourceSearch('');
                                    close();
                                  }}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                  Clear
                                </button>
                              </div>
                            </Listbox.Options>
                          </div>
                        )}
                      </Listbox>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Lead Owner
                      </label>
                      <select
                        value={editedLead.lead_owner || ""}
                        onChange={(e) => handleInputChange("lead_owner", e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      >
                        <option value="">Select Lead Owner</option>
                        {leadOwners.map((owner) => (
                          <option key={owner} value={owner}>
                            {owner}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="score-box">
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Lead Score
                      </label>
                      <input
                        type="text"
                        value={editedLead.lead_score ?? "N/A"}
                        readOnly
                        className={`mt-1 block w-full border rounded-md ${borderColor} shadow-sm px-2 ${inputBgColor} text-gray-700 cursor-not-allowed`}
                        disabled
                      />

                    </div>
                    <div className="score-box">
                      <label className={`block text-sm font-medium  ${textSecondaryColor}`}>
                        Lead Summary
                      </label>
                      <textarea
                        value={editedLead.lead_summary || "Not available"}
                        readOnly
                        rows={1}
                        className={` block w-full border rounded-md ${borderColor} shadow-sm  px-2 ${inputBgColor} text-gray-700 cursor-not-allowed`}
                        disabled
                      />
                    </div>

                    {/* Score Boxes */}




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
                      <select
                        value={editedLead.salutation || ""}
                        onChange={(e) => handleInputChange("salutation", e.target.value)}
                        className={`p-[6px] mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      >
                        <option value="">{loading ? "Loading..." : "Select Salutation"}</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>First Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={editedLead.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Last Name</label>
                      <input
                        type="text"
                        value={editedLead.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Email</label>
                      <input
                        type="email"
                        value={editedLead.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`p-[2px] pl-2 mt-1 block w-full border rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Mobile</label>
                      <input
                        type="tel"
                        value={editedLead.mobile || ''}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleInputChange('mobile', onlyDigits);
                        }}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        className={`p-[2px] pl-2 mt-1 block w-full border  rounded-md ${borderColor} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                      />
                      {errors.mobile && (
                        <p className="text-sm text-red-500 mt-1">{errors.mobile}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="h-full">
            <div className={`relative h-full rounded-lg shadow-sm border p-4 max-sm:p-3 pb-5  ${theme === 'dark' ? `bg-gray-900 border-gray-700` : 'bg-white border-gray-200'}`}>
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
                <div ref={activityContainerRef} className="space-y-4 h-[50vh] max-2xl:h-[40vh] overflow-y-auto pr-2">
                  {activities.map((activity) => {
                    switch (activity.type) {
                      case 'call': {
                        const callData = activity.data;
                        if (!callData) return null;

                        return (
                          <div key={`${activity.id}-${activity.timestamp}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div
                                  className={`p-2 rounded-full mr-3 flex items-center justify-center
                            ${callData.type === 'Incoming' || callData.type === 'Inbound'
                                      ? theme === 'dark'
                                        ? 'bg-blue-900 text-blue-300'
                                        : 'bg-blue-100 text-blue-600'
                                      : theme === 'dark'
                                        ? 'bg-green-900 text-green-300'
                                        : 'bg-green-100 text-green-600'
                                    }`}
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
                              <div className="absolute max-sm:top-[30%] right-4 top-1/2 -translate-y-1/2 flex -space-x-4">
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
                            <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              {activity.icon}
                            </div>
                            <div className={`flex-1 border ${borderColor} rounded-lg p-4 relative`}>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className={`text-lg font-semibold ${textColor}`}>{noteData.title || 'Untitled Note'}</h4>
                                <div className="relative">
                                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === noteData.name ? null : noteData.name); }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                    <BsThreeDots className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                                  </button>
                                  {openMenuId === noteData.name && (
                                    <div className={`absolute right-0 mt-2 w-28 rounded-lg shadow-lg z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border'}`}>
                                      <button onClick={(e) => { e.stopPropagation(); deleteNote(noteData.name); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className={`text-base font-semibold ${textSecondaryColor} whitespace-pre-wrap`}>{noteData.content || 'No content'}</p>
                              <div className="flex justify-between items-center mt-4 pt-2 border-t dark:border-gray-700 text-sm gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white font-bold text-xs">
                                    {noteData.owner?.charAt(0).toUpperCase() || "-"}
                                  </span>
                                  <span className={textSecondaryColor}>{noteData.owner || 'Unknown'}</span>
                                </div>
                                <span className={`${textSecondaryColor} font-medium`}>{getRelativeTime(noteData.creation)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      case 'comment': {
                        return (
                          <div key={activity.id} className="relative">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-4">
                                <div className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <FaRegComment size={18} />
                                </div>
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'} text-sm font-semibold`}>
                                  {activity.comment_by?.charAt(0).toUpperCase() || activity.user?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <p className={`text-sm font-medium ${textSecondaryColor}`}>
                                  {activity.comment_by || activity.user || 'Someone'} added a comment
                                </p>
                              </div>
                              <p className={`text-xs ${textSecondaryColor}`}>{getRelativeTime(activity.timestamp)}</p>
                            </div>
                            <div className={`border ${borderColor} rounded-lg p-4 ml-9 mt-2`}>
                              <div className={`${textColor} mb-2 whitespace-pre-wrap`}>{stripHtml(activity.description)}</div>

                              {activity.attachments && activity.attachments.length > 0 && (
                                <div className="mt-4">
                                  <div className="flex flex-wrap gap-3">
                                    {activity.attachments.map((attachment: any, index: number) => {
                                      const baseURL = "https://api.erpnext.ai";
                                      const fullURL = attachment.file_url && attachment.file_url.startsWith("http")
                                        ? attachment.file_url
                                        : `${baseURL}${attachment.file_url || ''}`;
                                      return (
                                        <a key={index} href={fullURL} target="_blank" rel="noopener noreferrer" className={`flex items-center border ${borderColor} px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'} transition-colors`}>
                                          <span className="mr-2 flex items-center gap-1 truncate max-w-[200px] text-sm">
                                            <IoDocument className={`w-3 h-3 mr-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                                            {attachment.file_name || 'Unnamed file'}
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
                      case 'task': {
                        const taskData = tasks.find(t => t.name === activity.id);
                        if (!taskData) return null;
                        return (
                          <div key={taskData.name} className="flex items-start w-full space-x-3">
                            <div className={`p-2 rounded-full mt-1 ${theme === 'dark' ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-600'}`}>
                              <SiTicktick className="w-4 h-4" />
                            </div>
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
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'} text-sm font-semibold`}>
                                      {taskData.assigned_to?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <span className={textSecondaryColor}>{taskData.assigned_to || 'Unassigned'}</span>
                                  </div>
                                  {taskData.due_date && (
                                    <span className={`flex items-center gap-1 ${textSecondaryColor}`}>
                                      <LuCalendar className="w-3.5 h-3.5" />
                                      {new Date(taskData.due_date).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1.5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${taskData.priority === 'High' ? 'bg-red-500' : taskData.priority === 'Medium' ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
                                    <span className={`text-xs font-medium ${textSecondaryColor}`}>{taskData.priority || 'Medium'}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${taskData.status === 'Done' ? (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : (theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')}`}>
                                    {taskData.status || 'Open'}
                                  </span>
                                  <div className="relative">
                                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === taskData.name ? null : taskData.name); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                      <BsThreeDots className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                                    </button>
                                    {openMenuId === taskData.name && (
                                      <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                        <button onClick={(e) => { e.stopPropagation(); setTaskToDelete(taskData); setShowDeleteTaskPopup(true); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg w-full text-left">
                                          <Trash2 className="w-4 h-4 text-red-500" />
                                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Delete</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      case 'email': {
                        const emailData = activity;
                        if (!emailData) return null;

                        return (
                          <div key={emailData.id} className="flex items-start w-full">
                            <div className={`w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-full ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'} text-sm font-semibold`}>
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
                                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}
                                    title="Reply"
                                  >
                                    <LuReply className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReply(emailData, true)}
                                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}
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
                                <div
                                  className={`${textColor} mb-2 whitespace-pre-wrap mt-4 w-full`}
                                  dangerouslySetInnerHTML={{ __html: emailData.description || 'No content' }}
                                />

                                {emailData.files && emailData.files.length > 0 && (
                                  <div className="mt-3">
                                    <p className={`text-sm font-semibold mb-2 ${textSecondaryColor}`}>Attachments:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {emailData.files.map((attachment: any, index: number) => (
                                        <a
                                          key={index}
                                          href={`https://api.erpnext.ai${attachment.file_url}`}
                                          download
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2 px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} transition-colors`}
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
                        const fileData = activity.data;
                        if (!fileData) return null;
                        const baseURL = "https://api.erpnext.ai";
                        const fullURL = fileData.file_url?.startsWith("http")
                          ? fileData.file_url
                          : fileData.file_url?.startsWith("/")
                            ? `${baseURL}${fileData.file_url}`
                            : fileData.file_url;

                        return (
                          <div key={`${activity.id}-${activity.timestamp}`} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full mt-1 ${theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-600'}`}>
                              <IoDocument className="w-4 h-4" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className={`text-sm font-medium ${textColor}`}>
                                    {activity.user} {activity.action === 'added' ? 'uploaded' : 'removed'} a file
                                  </p>
                                  <p
                                    onClick={() => activity.action === 'added' && fullURL && window.open(fullURL, "_blank")}
                                    className={`font-medium text-xs ${textColor} truncate text-wrap ${activity.action === 'added' ? 'cursor-pointer hover:underline' : ''}`}
                                  >
                                    {fileData.file_name || "Unnamed file"}
                                  </p>
                                </div>
                                <p className={`text-xs ${textSecondaryColor}`}>{getRelativeTime(activity.timestamp)}</p>
                              </div>

                              {fileData.file_type && (
                                <p className={`text-xs ${textSecondaryColor}`}>
                                  {fileData.file_type} • {fileData.file_size ? formatFileSize(fileData.file_size) : 'Unknown size'}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      case 'grouped_change': {
                        const isExpanded = expandedGroup === activity.id;
                        const changeCount = activity.data?.changes?.length || 1;
                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Layers className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => setExpandedGroup(isExpanded ? null : activity.id)}
                                  className={`text-sm text-left ${textColor} flex items-center gap-2`}
                                >
                                  {isExpanded ? 'Hide' : 'Show'} +{changeCount} changes from <span className="font-medium">{activity.user}</span>
                                  <FiChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                                </button>
                                <p className={`text-xs ${textSecondaryColor}`}>{getRelativeTime(activity.timestamp)}</p>
                              </div>

                              {isExpanded && (
                                <div className="mt-2 pl-4 border-l-2 border-gray-300 dark:border-gray-700 space-y-1">
                                  {activity.data?.field_label && (
                                    <p key={activity.timestamp} className={`text-sm ${textSecondaryColor}`}>
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {activity.data.field_label}:
                                      </span>
                                      {activity.data.old_value != null && activity.data.old_value !== ''
                                        ? <> Changed from '{activity.data.old_value}' to <span className="font-semibold text-gray-700 dark:text-gray-300">'{activity.data.value}'</span></>
                                        : <> Added <span className="font-semibold text-gray-700 dark:text-gray-300">'{activity.data.value}'</span></>
                                      }
                                    </p>
                                  )}

                                  {activity.data?.other_versions?.map((change: any, index: number) => (
                                    <p key={`${change.creation}-${index}`} className={`text-sm ${textSecondaryColor}`}>
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {change.data.field_label}:
                                      </span>
                                      {change.data.old_value != null && change.data.old_value !== ''
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
                      default:
                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              {React.isValidElement(activity.icon)
                                ? React.cloneElement(activity.icon, {
                                  className: `${activity.icon.props.className || ''} ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`
                                })
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
            </div>
            {/* Sticky Composer */}
            <div
              ref={composerRef}
              // className={`${cardBgColor} border-t ${borderColor} w-[-webkit-fill-available] pt-4 absolute bottom-0  overflow-hidden`}
              className={`
                ${cardBgColor} border-t ${borderColor} overflow-hidden 
                fixed bottom-0 left-0 w-full
                sm:absolute sm:w-[-webkit-fill-available] 
              `}
            >
              {!showEmailModal && (
                <div className={` border-t flex gap-4 ${borderColor} ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'} p-4 z-50 left-0 shadow-lg`}>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-600"}`}
                    onClick={() => {
                      setReplyData(undefined);
                      setEmailModalMode("reply");
                      setShowEmailModal(true);
                    }}
                  >
                    <Mail size={14} /> Reply
                  </button>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-400"}`}
                    onClick={() => {
                      setReplyData(undefined);
                      setEmailModalMode("comment");
                      setShowEmailModal(true);
                    }}
                  >
                    <FaRegComment size={14} /> Comment
                  </button>
                </div>
              )}

              {showEmailModal && activeTab === 'activity' && (
                <EmailComposerleads
                  mode={emailModalMode}
                  onClose={() => {
                    setShowEmailModal(false);
                    setReplyData(undefined);
                    setEmailModalMode("reply");
                  }}
                  lead={lead}
                  deal={undefined}
                  setListSuccess={setListSuccess}
                  refreshEmails={async () => {
                    // Refresh activity data specifically
                    await fetchActivities();
                    await fetchActivitiesNew(); // If you need this too
                  }}

                  replyData={replyData}
                  recipientEmail={editedLead.email}

                />
              )}

            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
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
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>New Note</span>
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No Notes</p>
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
                    className={`mt-4 px-6 py-2 self-center rounded-md cursor-pointer transition-colors ${theme === 'dark'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Create Note
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-5">
                  {notes.map((note) => (
                    <div
                      key={note.name}
                      className={`border ${borderColor} flex flex-col justify-between h-[200px] rounded-lg p-4 relative hover:shadow-md transition-shadow cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setNoteForm({
                          title: note.title || '',
                          content: note.content || '',
                          name: note.name || '',
                        });
                        setIsEditMode(true);
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
                            className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            style={{ lineHeight: 0 }}
                          >
                            <BsThreeDots className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                          </button>

                          {openMenuId === note.name && (
                            <div className={`absolute right-0 mt-2 w-28 border rounded-lg shadow-lg z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(note.name);
                                  setOpenMenuId(null);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 w-full text-left transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className={`text-base overflow-hidden font-semibold ${textSecondaryColor} whitespace-pre-wrap`}>
                        {note.content}
                      </p>

                      <div className="flex justify-between items-center text-sm gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'} font-bold text-xs`}>
                            {/* Use the first character of the display name */}
                            {getUserDisplayName(note.owner)?.charAt(0).toUpperCase() || "-"}
                          </span>
                          {/* Changed from note.owner to getUserDisplayName(note.owner) */}
                          <span className={textSecondaryColor}>{getUserDisplayName(note.owner) || 'Unknown'}</span>
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
                  className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border ${theme === 'dark' ? 'border-gray-600 bg-dark-secondary' : 'border-gray-300 bg-white'}`}
                >
                  <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
                    {/* Close */}
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                      <button
                        type="button"
                        className={`rounded-md ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-500'} focus:outline-none`}
                        onClick={() => {
                          setShowNoteModal(false);
                          setIsEditMode(false);
                        }}
                      >
                        <IoCloseOutline size={24} />
                      </button>
                    </div>

                    {/* Header */}
                    <h3 className={`text-xl font-bold mb-4 ${textColor}`}>
                      {isEditMode ? 'Edit Note' : 'Create Note'}
                    </h3>

                    {/* Form */}
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
                          Title <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type="text"
                          value={noteForm.title}
                          onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                            } ${noteForm.title === '' && noteFormError ? 'border-red-500' : ''}`}
                          placeholder="Call with John Doe"
                        />
                        {noteForm.title === '' && noteFormError && (
                          <p className="mt-1 text-sm text-red-500">Title is required</p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
                          Content
                        </label>
                        <textarea
                          value={noteForm.content}
                          onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                          rows={8}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
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
                          ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 focus:ring-offset-gray-800'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-white'
                          } ${notesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
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
                      caller: '',
                      receiver: '',
                      name: ''
                    });
                    setIsEditMode(false);
                    setShowCallModal(true);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
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
                  <button
                    onClick={() => setShowCallModal(true)}
                    className={`mt-4 px-6 py-2 self-center rounded-md cursor-pointer transition-colors ${theme === 'dark'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >Create Call Log</button>
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
                        className={`relative border ${borderColor} rounded-lg max-sm:ml-0 ml-12 p-4 flex flex-col cursor-pointer`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-lg font-medium ${textColor}`}>
                            {call.type}
                          </p>
                        </div>

                        {/* All three in one line */}
                        <div className="flex flex-wrap items-start justify-start mt-2 gap-4">
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
                        <div className="absolute right-4 top-4 flex -space-x-3 sm:top-1/2 sm:-translate-y-1/2 sm:-space-x-4">
                          {/* Caller */}
                          <div
                            className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium w-6 h-6 text-xs sm:w-8 sm:h-8"
                          >
                            {(call._caller?.label?.charAt(0) || call.from?.charAt(0) || "").toUpperCase()}
                          </div>

                          {/* Receiver */}
                          <div
                            className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium w-6 h-6 text-xs sm:w-8 sm:h-8"
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
                        name: editingCall.name,
                        _notes: editingCall._notes || [],
                        _tasks: editingCall._tasks || []
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
                          caller: editingCall.caller || editingCall._caller?.value || '', // Use the actual caller field from API
                          receiver: editingCall.receiver || editingCall._receiver?.value || '', // Use the actual receiver field from API
                          name: editingCall.name || '',
                        });
                        setIsEditMode(true);
                        setShowPopup(false);
                        setShowCallModal(true);
                      }}
                      fetchCallLogs={fetchCallLogs}
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
                  setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', caller: '', receiver: '', name: '' });
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
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Type </label>
                  <select
                    value={callForm.type}
                    onChange={(e) => {
                      setCallForm({ ...callForm, type: e.target.value });
                      if (errors.type) {
                        setErrors((prev) => ({ ...prev, type: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    <option value="Outgoing" className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>Outgoing</option>
                    <option value="Incoming" className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>Incoming</option>
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
                      if (errors.to) {
                        setErrors((prev) => ({ ...prev, to: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                      }`}
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
                      if (errors.from) {
                        setErrors((prev) => ({ ...prev, from: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                      }`}
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
                    onChange={(e) => setCallForm({ ...callForm, status: e.target.value })}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    {["Initiated", "Ringing", "In Progress", "Completed", "Failed", "Busy", "No Answer", "Queued", "Canceled"].map(status => (
                      <option
                        key={status}
                        value={status}
                        className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Duration</label>
                  <input
                    type="number"
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                      }`}
                    placeholder="Call duration"
                  />
                </div>

                {/* Caller Field (Only show for Outgoing calls) */}
                {callForm.type === 'Outgoing' && (
                  <div>
                    <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Caller</label>
                    <select
                      value={callForm.caller}
                      onChange={(e) => setCallForm({ ...callForm, caller: e.target.value })}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="" className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>
                        Select Caller
                      </option>
                      {callerOptions.map((user) => (
                        <option
                          key={user.value}
                          value={user.value}
                          className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                        >
                          {user.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Receiver Field (Only show for Incoming calls) */}
                {callForm.type === 'Incoming' && (
                  <div>
                    <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Call Received By</label>
                    <select
                      value={callForm.receiver}
                      onChange={(e) => setCallForm({ ...callForm, receiver: e.target.value })}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="" className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>
                        Select Receiver
                      </option>
                      {callerOptions.map((user) => (
                        <option
                          key={user.value}
                          value={user.value}
                          className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                        >
                          {user.description}
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
                  className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50`}
                >
                  <span>{isEditMode ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="">
            {/* Header Section */}
            <div className={`${cardBgColor} max-sm:p-3 p-6 border ${borderColor}`}>
              <div className="flex justify-between items-center gap-4">
                <h3 className={`text-2xl font-semibold mb-0 ${textColor}`}>Comments</h3>
                <button
                  onClick={handleNewCommentClick}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>New Comment</span>
                </button>
              </div>
            </div>

            {/* Comments List Section */}
            <div className={`${cardBgColor} rounded-lg max-h-[400px] overflow-y-auto pr-2 shadow-sm border ${borderColor} p-6`}>
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <FaRegComment className={`w-12 h-12 ${textSecondaryColor} mx-auto mb-4`} />
                  <p className={textSecondaryColor}>No comments yet</p>

                  <button
                    onClick={handleNewCommentClick}
                    className={`mt-4 px-6 py-2 self-center rounded-md cursor-pointer transition-colors ${theme === 'dark'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >

                    New Comment
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.slice().reverse().map((comment) => {
                    const userEmail = comment.comment_by || comment.owner;
                    const displayName = getUserDisplayName(userEmail);
                    const userInitial = getUserInitial(userEmail);

                    return (
                      <div key={comment.name} className='flex gap-3'>
                        {/* Timeline and Avatar */}
                        <div className='flex flex-col items-center'>
                          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-purple-600 rounded-full">
                            <span className="text-white text-sm font-semibold">
                              {userInitial}
                            </span>
                          </div>
                          <div className='w-px h-full bg-gray-300 dark:bg-gray-600 my-2'></div>
                        </div>

                        {/* Comment Content */}
                        <div className={`border w-full rounded-lg p-4 ${theme === 'dark' ? 'border-purple-500/30 hover:bg-purple-800/20' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                          <div className="flex items-start space-x-3">
                            <div className="flex-1">
                              {/* Comment Header */}
                              <div className="flex items-center max-sm:flex-wrap justify-between mb-3">
                                <div className="flex items-center">
                                  <span className={`font-semibold ${textColor}`}>
                                    {displayName}
                                  </span>
                                  <span className={`text-sm ml-2 ${textSecondaryColor}`}>
                                    added a comment
                                  </span>
                                </div>
                                <span className={`text-sm ${textSecondaryColor}`}>
                                  {getRelativeTime(comment.creation)}
                                </span>
                              </div>

                              {/* Comment Text */}
                              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} mt-2`}>
                                <p className={`${textColor} whitespace-pre-wrap leading-relaxed`}>
                                  {stripHtml(comment.content)}
                                </p>
                              </div>

                              {/* Attachments */}
                              {comment.attachments && comment.attachments.length > 0 && (
                                <div className="mt-4">
                                  <p className={`text-sm font-semibold mb-2 ${textSecondaryColor}`}>
                                    Attachments ({comment.attachments.length})
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {comment.attachments.map((attachment, index) => {
                                      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(attachment.file_name || '');
                                      const fileUrl = attachment.file_url?.startsWith('http')
                                        ? attachment.file_url
                                        : `https://api.erpnext.ai${attachment.file_url || ''}`;

                                      return (
                                        <div key={index} className="flex items-center">
                                          {isImage ? (
                                            <button
                                              onClick={() => setSelectedImage(fileUrl)}
                                              className={`flex items-center gap-2 px-3 py-2 rounded-md border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-100'} transition-colors`}
                                            >
                                              <File className="w-4 h-4" />
                                              <span className="text-sm max-w-[150px] truncate">
                                                {attachment.file_name || 'Unnamed file'}
                                              </span>
                                            </button>
                                          ) : (
                                            <a
                                              href={fileUrl}
                                              download
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`flex items-center gap-2 px-3 py-2 rounded-md border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-100'} transition-colors`}
                                            >
                                              <File className="w-4 h-4" />
                                              <span className="text-sm max-w-[150px] truncate">
                                                {attachment.file_name || 'Unnamed file'}
                                              </span>
                                            </a>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Image Preview</h3>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <IoCloseOutline size={24} />
                    </button>
                  </div>
                  <div className="p-4 overflow-auto max-h-[calc(90vh-100px)] flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Composer Section */}
            <div
              ref={composerRef}
              className={`
        ${cardBgColor} border-t ${borderColor} overflow-hidden 
        fixed bottom-0 left-0 w-full
        sm:absolute sm:w-[-webkit-fill-available]  
      `}
            >
              {!showEmailModal && (
                <div className={`border-t flex gap-4 ${borderColor} ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}  p-4 left-0 z-50 shadow-lg`}>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-600"}`}
                    onClick={() => {
                      setReplyData(undefined);
                      setEmailModalMode("reply");
                      setShowEmailModal(true);
                    }}
                  >
                    <Mail size={14} /> Reply
                  </button>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-400"}`}
                    onClick={() => {
                      setReplyData(undefined);
                      setEmailModalMode("comment");
                      setShowEmailModal(true);
                    }}
                  >
                    <FaRegComment size={14} /> Comment
                  </button>
                </div>
              )}

              {showEmailModal && activeTab === 'comments' && (
                <EmailComposerleads
                  mode={emailModalMode}
                  onClose={() => {
                    setShowEmailModal(false);
                    setReplyData(undefined);
                    setEmailModalMode("reply");
                  }}
                  lead={lead}
                  deal={undefined}
                  setListSuccess={setListSuccess}
                  refreshEmails={refreshComments}
                  replyData={replyData}
                  recipientEmail={editedLead.email}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Tasks Section */}
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
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
                  <span>Create Task</span>
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <SiTicktick className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No tasks</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className={`mt-4 px-6 py-2 self-center rounded-md cursor-pointer transition-colors ${theme === 'dark'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Create Task
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.name}
                      onClick={() => {
                        const dueDate = task.due_date ? task.due_date.split(' ')[0] : '';
                        setTaskForm({
                          name: task.name,
                          title: task.title || '',
                          // description: task.description || '',
                          description: stripHtml(task.description || '') || '',
                          status: task.status || 'Open',
                          priority: task.priority || 'Medium',
                          due_date: dueDate,
                          assigned_to: task.assigned_to || '',
                        });
                        setIsEditMode(true);
                        setCurrentTaskId(task.name);
                        setShowTaskModal(true);
                      }}
                      className={`border ${borderColor} rounded-lg p-4 cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${textColor}`}>{task.title}</h4>
                      </div>

                      <div className="mt-1 text-sm flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
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
                                    ? 'bg-gray-400'
                                    : 'bg-gray-400'
                                }`}
                            ></span>
                            <span className={`text-xs font-medium ${textColor}`}>{task.priority}</span>
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
                              className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            >
                              <BsThreeDots className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                            </button>

                            {openMenuId === task.name && (
                              <div
                                className={`absolute right-0 mt-2 w-28 border rounded-lg shadow-lg z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTaskToDelete(task);
                                    setShowDeleteTaskPopup(true);
                                    setOpenMenuId(null);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 w-full text-left transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                  <span className={textColor}>Delete</span>
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

                <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-11/12 sm:max-w-[600px] border ${theme === 'dark' ? 'border-gray-600 bg-dark-secondary' : 'border-gray-300 bg-white'}`}>
                  <div className={`px-6 pt-6 pb-4 sm:p-8 sm:pb-6 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                      <button
                        type="button"
                        className={`rounded-md ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-500'} focus:outline-none`}
                        onClick={() => {
                          setShowTaskModal(false);
                          setIsEditMode(false);
                        }}
                      >
                        <IoCloseOutline size={24} />
                      </button>
                    </div>

                    <h3 className={`text-xl font-bold mb-6 ${textColor}`}>
                      {isEditMode ? 'Edit Task' : 'Create Task'}
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={taskForm.title}
                          onChange={(e) => {
                            setTaskForm({ ...taskForm, title: e.target.value });
                            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                            }`}
                          placeholder="Task title"
                        />
                        {errors.title && (
                          <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
                          Description
                        </label>
                        <textarea
                          value={taskForm.description}
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          rows={6}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                            }`}
                          placeholder="Task description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
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
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="Backlog">Backlog</option>
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="Todo">Todo</option>
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="In Progress">In Progress</option>
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="Done">Done</option>
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="Canceled">Canceled</option>
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="Open">Open</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
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
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="Low">Low</option>
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="Medium">Medium</option>
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="High">High</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
                            Date
                          </label>
                          <input
                            type="date"
                            value={taskForm.due_date}
                            onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white [color-scheme:dark]'
                              : 'bg-white border-gray-300 text-gray-900 [color-scheme:light]'
                              }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
                            Assign To
                          </label>
                          <select
                            value={taskForm.assigned_to}
                            onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          >
                            <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`} value="">Select Assignee</option>
                            {userOptions.map((user) => (
                              <option className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                                ? 'bg-gray-800 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`} key={user.value} value={user.value}>
                                {user.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`px-6 py-4 sm:px-8 ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
                    <div className="w-full">
                      <button
                        onClick={async () => {
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
                          ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 focus:ring-offset-gray-800'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-white'
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
            <div className={`${cardBgColor} max-sm:p-3 p-6 border ${borderColor} rounded-lg shadow-sm`}>
              <div className='flex justify-between items-center gap-5 mb-6'>
                <h3 className={`text-xl font-semibold mb-0 ${textColor}`}>Attachments</h3>
                <button
                  onClick={() => setShowFileModal(true)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>Upload Attachment</span>
                </button>
              </div>

              <div className="space-y-4">
                {filesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className={`ml-3 ${textSecondaryColor} font-medium`}>Loading files...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-12">
                    <Paperclip className={`w-16 h-16 mx-auto mb-4 ${textSecondaryColor}`} />
                    <p className={`text-lg font-medium ${textColor} mb-2`}>No attachments yet</p>
                    <button
                      onClick={() => setShowFileModal(true)}
                      className={`mt-4 px-6 py-2 self-center rounded-md cursor-pointer transition-colors ${theme === 'dark'
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Upload Your First File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map(file => (
                      <div
                        key={file.name}
                        className={`flex items-center justify-between p-4 rounded-lg border ${borderColor} transition-colors cursor-pointer ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} shadow-sm`}

                        // onClick={() => window.open(`https://api.erpnext.ai${file.file_url}`, '_blank')}
                        onClick={() => window.open(getFullFileUrl(file.file_url), '_blank')}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          {isImageFile(file.file_name) ? (
                            <img
                              src={
                                Number(file.is_private) === 1
                                  ? 'https://www.shutterstock.com/shutterstock/photos/2495883211/display_1500/stock-vector-no-photo-image-viewer-thumbnail-picture-placeholder-graphic-element-flat-picture-landscape-symbol-2495883211.jpg'
                                  : `https://api.erpnext.ai${file.file_url}`
                              }
                              alt={file.file_name}
                              className="w-12 h-12 mr-4 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <div className={`w-12 h-12 mr-4 flex items-center justify-center rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                              <File className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${textColor} mb-1`}>
                              {file.file_name}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={textSecondaryColor}>
                                {file.file_size && Number(file.file_size) > 0
                                  ? formatFileSize(file.file_size)
                                  : 'Unknown size'
                                }
                              </span>
                              <span className={textSecondaryColor}>
                                {getRelativeTime(file.creation ?? '')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {/* Privacy Toggle */}
                          {/* <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFileToTogglePrivacy({
                                name: file.name,
                                is_private: Number(file.is_private),
                              });
                            }}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            title={Number(file.is_private) === 1 ? 'Private - Click to make public' : 'Public - Click to make private'}
                          >
                            {Number(file.is_private) === 1 ? (
                              <IoLockClosedOutline className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                            ) : (
                              <IoLockOpenOutline className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                            )}
                          </button> */}

                          {/* Delete Button */}
                          <button
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' : 'hover:bg-red-50 text-red-500 hover:text-red-600'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFileToDelete({ name: file.name });
                            }}
                            title="Delete file"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Popup Components */}
            {fileToDelete && (
              <DeleteAttachmentPopup
                closePopup={() => setFileToDelete(null)}
                attachment={fileToDelete}
                theme={theme}
                fetchAttachments={fetchFiles}
              />
            )}

            {fileToTogglePrivacy && (
              <LeadPrivatePopup
                closePopup={() => setFileToTogglePrivacy(null)}
                attachment={fileToTogglePrivacy}
                theme={theme}
                fetchAttachments={fetchFiles}
              />
            )}

            <LeadsFilesUploadPopup
              show={showFileModal}
              onClose={() => setShowFileModal(false)}
              theme={theme}
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
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <HiOutlinePlus className="w-5 h-5 " />
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
                <div className="text-center align-items-center flex flex-col py-8">
                  <Mail className={`w-12 h-12 ${textSecondaryColor} mx-auto mb-4`} />
                  <p className={textSecondaryColor}>No emails Communications</p>
                  <button
                    onClick={handleNewEmailClick}
                    className={`mt-4 px-6 py-2 self-center rounded-md cursor-pointer transition-colors ${theme === 'dark'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    New Email
                  </button>
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

                    // Check if this is a reply email
                    const isReply = comm.content && (
                      comm.content.includes('') ||
                      comm.content.includes('') ||
                      comm.content.includes('From:') && comm.content.includes('Date:') && comm.content.includes('Subject:')
                    );

                    let originalContent = comm.content;
                    let replyContent = '';
                    let originalHeaders = {};

                    if (isReply) {
                      // Extract the reply content and original message
                      const replyDivider = comm.content.includes('--- Original Message ---') ?
                        '--- Original Message ---' : '-------- Original Message --------';

                      const parts = comm.content.split(replyDivider);
                      replyContent = parts[0].trim();

                      if (parts[1]) {
                        const headerLines = parts[1].trim().split('\n');
                        headerLines.forEach(line => {
                          if (line.includes('From:')) originalHeaders.from = line.replace('From:', '').trim();
                          if (line.includes('Date:')) originalHeaders.date = line.replace('Date:', '').trim();
                          if (line.includes('To:')) originalHeaders.to = line.replace('To:', '').trim();
                          if (line.includes('Subject:')) originalHeaders.subject = line.replace('Subject:', '').trim();
                        });

                        // The actual original message content would be after headers
                        const contentIndex = headerLines.findIndex(line =>
                          line.trim() && !line.includes('From:') && !line.includes('Date:') &&
                          !line.includes('To:') && !line.includes('Subject:')
                        );

                        if (contentIndex !== -1) {
                          originalHeaders.content = headerLines.slice(contentIndex).join('\n').trim();
                        }
                      }
                    }

                    return (
                      <div key={comm.name} className='flex gap-2'>
                        <div className='flex flex-col items-center '>
                          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-purple-600 rounded-full">
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
                                      className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}
                                      title="Reply"
                                    >
                                      <LuReply className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleReply(comm, true)}
                                      className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}
                                      title="Reply All"
                                    >
                                      <LuReplyAll className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 space-y-1">
                                {/* <p className={`text-sm ${textSecondaryColor}`}>
                                  <span className="font-semibold">From:</span>{" "}
                                  {(() => {
                                    const sender = comm.sender || "";
                                    const match = sender.match(/(.*)<(.*)>/);
                                    if (match) {
                                      const name = match[1].trim();
                                      const email = match[2].trim();
                                      // Convert name to lowercase as per your requirement
                                      return `${name.toLowerCase()} ( ${email} )`;
                                    }
                                    // If not in that format, just return the sender as is
                                    return sender;
                                  })()}
                                </p> */}
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

                              {/* {comm.content && (
                                <div className={`mt-3 p-3 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                  <p className={`text-sm ${textColor} whitespace-pre-wrap`}>
                                    {comm.content}
                                  </p>
                                </div>
                              )} */}
                              {comm.content && (
                                <div
                                  className={`htmlmessage mt-3 p-3 rounded ${textColor} ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
                                  dangerouslySetInnerHTML={{ __html: comm.content }}
                                />
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
                                        href={`https://api.erpnext.ai${attachment.file_url}`}
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
            {/* Sticky Composer */}
            <div
              ref={composerRef}
              //className={`${cardBgColor} border-t ${borderColor} w-[-webkit-fill-available] pt-4 absolute bottom-0  overflow-hidden`}
              className={`
                ${cardBgColor} border-t ${borderColor} overflow-hidden 
                fixed bottom-0 left-0 w-full
                sm:absolute sm:w-[-webkit-fill-available] 
              `}
            >
              {!showEmailModal && (
                <div className={` border-t flex gap-4 ${borderColor} ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'} p-4 left-0 z-50 shadow-lg`}>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-600"}`}
                    onClick={() => {
                      setReplyData(undefined);
                      setEmailModalMode("reply");
                      setShowEmailModal(true);
                    }}
                  >
                    <Mail size={14} /> Reply
                  </button>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-white" : "text-gray-400"}`}
                    onClick={() => {
                      setReplyData(undefined);
                      setEmailModalMode("comment");
                      setShowEmailModal(true);
                    }}
                  >
                    <FaRegComment size={14} /> Comment
                  </button>
                </div>
              )}

              {showEmailModal && activeTab === 'emails' && (
                <EmailComposerleads
                  mode={emailModalMode}
                  onClose={() => {
                    setShowEmailModal(false);
                    setReplyData(undefined);
                    setEmailModalMode("reply");
                  }}
                  lead={lead}
                  deal={undefined}
                  setListSuccess={setListSuccess}
                  refreshEmails={refreshEmails}
                  replyData={replyData}
                  recipientEmail={editedLead.email}
                />
              )}

            </div>
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-4 sm:p-6`}>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Company Intelligence</h3>

                {!companyIntelligence && !editedLead.company_info && (
                  <button
                    onClick={() => fetchCompanyIntelligence(editedLead.organization || '')}
                    disabled={intelligenceLoading || !editedLead.organization}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                      } disabled:opacity-50 transition-colors`}
                    title={!editedLead.organization
                      ? "Organization name is required"
                      : "Click to generate company intelligence report"
                    }
                  >
                    <RxLightningBolt className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                )}
              </div>

              {intelligenceError && (
                <div className={`p-3 sm:p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-red-100 text-red-800'}`}>
                  {intelligenceError}
                </div>
              )}

              {intelligenceLoading ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-16">
                  <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-blue-600 mb-3 sm:mb-4" />
                  <p className={`text-base sm:text-lg font-medium ${textColor} mb-2 text-center`}>
                    Generating Company Intelligence Report
                  </p>
                  <p className={`text-xs sm:text-sm ${textSecondaryColor} text-center max-w-md px-4`}>
                    Please wait while we analyze and generate a comprehensive company intelligence report...
                  </p>
                </div>
              ) : !companyIntelligence && !editedLead.company_info ? (
                <div className="text-center py-8 sm:py-12">
                  <Building2 className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${textSecondaryColor}`} />
                  <h4 className={`text-base sm:text-lg font-semibold mb-2 ${textColor}`}>
                    No Company Intelligence Report
                  </h4>
                  <p className={`text-sm ${textSecondaryColor} px-4 mb-6`}>
                    {!editedLead.organization
                      ? 'Please set an organization name in the Data tab to generate company intelligence.'
                      : 'Click "Generate Report" to create a comprehensive company intelligence report.'
                    }
                  </p>
                  {/* {editedLead.organization && (
            <button
              onClick={() => fetchCompanyIntelligence(editedLead.organization || '')}
              disabled={intelligenceLoading}
              className={`px-6 py-3 rounded-lg text-white flex items-center space-x-2 mx-auto ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 transition-colors`}
            >
              
              Generate Intelligence Report
            </button>
          )} */}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Overall Scorecard */}
                  {companyIntelligence?.json?.scorecard && (
                    <div className={`rounded-lg border p-4 sm:p-6 ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                      }`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-3">
                        <div className="flex-1">
                          <h4 className={`text-lg sm:text-xl font-bold ${textColor} mb-2`}>
                            Overall Scorecard
                          </h4>
                          <p className={`text-xs sm:text-sm ${textSecondaryColor}`}>
                            AI-powered assessment of the company's potential and compatibility
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl sm:text-3xl font-bold mb-1 ${companyIntelligence.json.scorecard.final_percentage >= 80
                            ? 'text-green-500' :
                            companyIntelligence.json.scorecard.final_percentage >= 60
                              ? 'text-yellow-500' :
                              'text-red-500'
                            }`}>
                            {companyIntelligence.json.scorecard.final_percentage || 0}%
                          </div>
                          <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full font-medium ${companyIntelligence.json.scorecard.final_percentage >= 80
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                            companyIntelligence.json.scorecard.final_percentage >= 60
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                            {companyIntelligence.json.scorecard.final_percentage >= 80 ? 'Very High' :
                              companyIntelligence.json.scorecard.final_percentage >= 60 ? 'High' :
                                companyIntelligence.json.scorecard.final_percentage >= 40 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                        <div className="flex flex-col items-center">
                          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <span className={`text-2xl sm:text-4xl font-bold block ${companyIntelligence.json.scorecard.final_percentage >= 80 ? 'text-green-500' :
                                  companyIntelligence.json.scorecard.final_percentage >= 60 ? 'text-yellow-500' :
                                    'text-red-500'
                                  }`}>
                                  {companyIntelligence.json.scorecard.final_percentage || 0}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">SCORE</span>
                              </div>
                            </div>
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                                strokeWidth="8"
                                fill="none"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke={
                                  companyIntelligence.json.scorecard.final_percentage >= 80 ? '#10b981' :
                                    companyIntelligence.json.scorecard.final_percentage >= 60 ? '#f59e0b' :
                                      '#ef4444'
                                }
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={283}
                                strokeDashoffset={283 * (1 - (companyIntelligence.json.scorecard.final_percentage || 0) / 100)}
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4">
                          <div className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                            }`}>
                            <span className={`text-xs sm:text-sm font-medium ${textSecondaryColor}`}>Tier</span>
                            <p className={`text-sm sm:text-lg font-semibold ${textColor} mt-1`}>
                              {companyIntelligence.json.scorecard.tier || 'Not Available'}
                            </p>
                          </div>
                          <div className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                            }`}>
                            <span className={`text-xs sm:text-sm font-medium ${textSecondaryColor}`}>Overall Score</span>
                            <p className={`text-sm sm:text-lg font-semibold ${textColor} mt-1`}>
                              {companyIntelligence.json.scorecard.final_weighted_score || 0}/10
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Score Details Breakdown */}
                  {companyIntelligence?.json?.scorecard && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { key: 'identity_overview', label: 'Firmographics', desc: 'Company Profile' },
                        { key: 'key_people_visibility', label: 'Key Personnel', desc: 'Leadership Team' },
                        { key: 'business_strategy', label: 'Buying Intent', desc: 'Business Strategy' },
                        { key: 'technology_landscape', label: 'Tech Stack', desc: 'Technology' }
                      ].map((item, index) => {
                        const score = companyIntelligence.json.scorecard[item.key] || 0;
                        return (
                          <div key={index} className={`p-3 sm:p-4 rounded-lg border ${theme === 'dark'
                            ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                            : 'bg-white border-gray-200'
                            } transition-colors`}>
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                              <span className={`text-xs sm:text-sm font-medium ${textColor}`}>{item.label}</span>
                              <div className={`w-2 h-2 rounded-full ${score >= 8 ? 'bg-green-500' :
                                score >= 6 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`} />
                            </div>
                            <p className={`text-xl sm:text-2xl font-bold ${score >= 8 ? 'text-green-500' :
                              score >= 6 ? 'text-yellow-500' :
                                'text-red-500'
                              }`}>
                              {score}
                            </p>
                            <p className={`text-xs ${textSecondaryColor} mt-1`}>{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Identity & Overview */}
                  {companyIntelligence?.json?.identity_and_overview && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>
                          Identity & Overview
                        </h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.identity_overview || 0}/10
                        </span>
                      </div>
                      <p className={`${textSecondaryColor} leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base`}>
                        {companyIntelligence.json.identity_and_overview}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                        <div className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}>
                          <span className={`text-xs sm:text-sm font-medium ${textSecondaryColor}`}>Industry</span>
                          <p className={`text-sm sm:text-base font-semibold ${textColor} mt-1`}>
                            {companyIntelligence.json.Industry || 'Not Available'}
                          </p>
                        </div>
                        <div className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}>
                          <span className={`text-xs sm:text-sm font-medium ${textSecondaryColor}`}>Company Size</span>
                          <p className={`text-sm sm:text-base font-semibold ${textColor} mt-1`}>
                            {companyIntelligence.json.company_size || 'Not Available'}
                          </p>
                        </div>
                        <div className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}>
                          <span className={`text-xs sm:text-sm font-medium ${textSecondaryColor}`}>Headquarters</span>
                          <p className={`text-sm sm:text-base font-semibold ${textColor} mt-1`}>
                            {companyIntelligence.json.Presence || 'Not Available'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h5 className={`text-sm sm:text-md font-semibold mb-2 sm:mb-3 ${textColor}`}>Key Highlights</h5>
                        <ul className={`space-y-1 sm:space-y-2 ${textSecondaryColor} text-sm sm:text-base`}>
                          {[
                            companyIntelligence.json.key_highlights1,
                            companyIntelligence.json.key_highlights2,
                            companyIntelligence.json.key_highlights3
                          ].filter(Boolean).map((highlight, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2 mt-1">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Company Snapshot */}
                  {companyIntelligence?.json?.Company_Snapshot && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Company SnapShot</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.Company_Snapshot || 0}/10
                        </span>
                      </div>
                      <div className={`${textSecondaryColor} leading-relaxed text-sm sm:text-base`}>
                        {companyIntelligence.json.Company_Snapshot}
                      </div>
                    </div>
                  )}

                  {/* Business & Strategy */}
                  {companyIntelligence?.json?.business_and_strategy && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Business Overview & Segments</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.business_strategy || 0}/10
                        </span>
                      </div>
                      <ul className={`space-y-2 sm:space-y-3 ${textSecondaryColor} text-sm sm:text-base`}>
                        {companyIntelligence.json.business_and_strategy.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Markets & Geographic Footprint */}
                  {companyIntelligence?.json?.markets_and_geographic_footprint && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Markets & Geographic Footprint</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.markets_and_geographic_footprint || 0}/10
                        </span>
                      </div>
                      <div className={`${textSecondaryColor} leading-relaxed text-sm sm:text-base`}>
                        {companyIntelligence.json.markets_and_geographic_footprint}
                      </div>
                    </div>
                  )}

                  {/* Key Leadership */}
                  {companyIntelligence?.json?.key_leadership && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Key Leadership & Decision-Makers</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.key_people_visibility || 0}/10
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {companyIntelligence.json.key_leadership.slice(0, 10).map((leader: any, index: number) => (
                          <div key={index} className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-50 hover:bg-gray-100'
                            } transition-colors`}>
                            <p className={`text-sm sm:text-base font-semibold ${textColor} mb-1`}>{leader.name}</p>
                            <p className={`text-xs sm:text-sm ${textSecondaryColor} mb-2`}>{leader.designation}</p>
                            {leader.linkedin && leader.linkedin !== "Not Available" && (
                              <a
                                href={leader.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 text-xs hover:underline"
                              >
                                LinkedIn Profile
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technology Landscape */}
                  {companyIntelligence?.json?.technology_landscape && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Technology Landscape</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.technology_landscape || 0}/10
                        </span>
                      </div>
                      <ul className={`space-y-2 sm:space-y-3 ${textSecondaryColor} text-sm sm:text-base`}>
                        {companyIntelligence.json.technology_landscape.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-500 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Digital Transformation Readiness */}
                  {companyIntelligence?.json?.digital_transformation_readiness && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Digital Transformation Readiness</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.digital_transformation_readiness || 0}/10
                        </span>
                      </div>
                      <div className={`${textSecondaryColor} leading-relaxed text-sm sm:text-base`}>
                        {companyIntelligence.json.digital_transformation_readiness}
                      </div>
                    </div>
                  )}

                  {/* AI Capabilities & Adoption */}
                  {companyIntelligence?.json?.ai_capabilities_adoption && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>AI Capabilities & AI Adoption Maturity</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.ai_capabilities || 0}/10
                        </span>
                      </div>
                      <div className={`${textSecondaryColor} leading-relaxed text-sm sm:text-base`}>
                        {companyIntelligence.json.ai_capabilities_adoption}
                      </div>
                    </div>
                  )}

                  {/* Integration & Enterprise Systems */}
                  {companyIntelligence?.json?.integration_and_enterprise_systems && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Integration & Enterprise Systems</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.integration_and_enterprise_systems || 0}/10
                        </span>
                      </div>
                      <div className={`${textSecondaryColor} leading-relaxed text-sm sm:text-base`}>
                        {companyIntelligence.json.integration_and_enterprise_systems}
                      </div>
                    </div>
                  )}

                  {/* Financial Health */}
                  {companyIntelligence?.json?.financial_health && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Financial Health</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.financial_health || 0}/10
                        </span>
                      </div>
                      <ul className={`space-y-2 sm:space-y-3 ${textSecondaryColor} text-sm sm:text-base`}>
                        {companyIntelligence.json.financial_health.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-500 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Social, News & Events Signals */}
                  {companyIntelligence?.json?.social_event_signals && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Social, News & Events Signals</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.social_event_signals || 0}/10
                        </span>
                      </div>
                      <div className={`${textSecondaryColor} leading-relaxed text-sm sm:text-base`}>
                        {companyIntelligence.json.social_event_signals}
                      </div>
                    </div>
                  )}

                  {/* Competitor & Peer Comparison */}
                  {companyIntelligence?.json?.Competitor_and_peer_comparison && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Competitor & Peer Comparison</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.Competitor_and_peer_comparison || 0}/10
                        </span>
                      </div>
                      <div className={`${textSecondaryColor} leading-relaxed text-sm sm:text-base`}>
                        {companyIntelligence.json.Competitor_and_peer_comparison}
                      </div>
                    </div>
                  )}

                  {/* Opportunities for Improvement */}
                  {companyIntelligence?.json?.opportunities_for_improvement && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Opportunities for Improvement</h4>
                        <span className={`text-base sm:text-xl px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold ${theme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                          {companyIntelligence.json.scorecard?.opportunities_for_improvement || 0}/10
                        </span>
                      </div>
                      <div className={`${textSecondaryColor} leading-relaxed text-sm sm:text-base`}>
                        {companyIntelligence.json.opportunities_for_improvement}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {companyIntelligence?.json?.strengths && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Strengths</h4>
                      </div>
                      <ul className={`space-y-2 sm:space-y-3 ${textSecondaryColor} text-sm sm:text-base`}>
                        {companyIntelligence.json.strengths.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risks */}
                  {companyIntelligence?.json?.risks && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Risks</h4>
                      </div>
                      <ul className={`space-y-2 sm:space-y-3 ${textSecondaryColor} text-sm sm:text-base`}>
                        {companyIntelligence.json.risks.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {companyIntelligence?.json?.recommendations && (
                    <div className={`rounded-lg border ${theme === 'dark'
                      ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                      : 'bg-white border-gray-200'
                      } p-4 sm:p-6`}>
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h4 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Recommendations</h4>
                      </div>
                      <ul className={`space-y-2 sm:space-y-3 ${textSecondaryColor} text-sm sm:text-base`}>
                        {companyIntelligence.json.recommendations.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}


        {showDeleteTaskPopup && taskToDelete && (
          <DeleteTaskPopup
            closePopup={() => setShowDeleteTaskPopup(false)}
            task={taskToDelete}
            theme={theme}
            onDeleteSuccess={() => {
              setShowDeleteTaskPopup(false);
              fetchTasks();
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
              name: editingCall.name,
              _notes: editingCall._notes || [],
              _tasks: editingCall._tasks || []
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
                caller: editingCall.caller || '',      // Use the 'caller' field for the user ID
                receiver: editingCall.receiver || '',
                name: editingCall.name || '',
              });
              setIsEditMode(true);
              setCallShowPopup(false);
              setShowCallModal(true);
            }}
            theme={theme}
            fetchCallLogs={fetchCallLogs}
          />
        )}
        {showCreateTerritoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={` w-[600px] ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
              <button
                onClick={() => setShowCreateTerritoryModal(false)}
                className="absolute top-5 right-8 text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                ✕
              </button>

              <h3 className={`text-lg font-semibold ${textColor} mb-4`}>New Territory</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                    Territory Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTerritory.territory_name}
                    onChange={(e) => setNewTerritory({ ...newTerritory, territory_name: e.target.value })}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    placeholder="Enter territory name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                    Territory Manager
                  </label>
                  <input
                    type="text"
                    value={newTerritory.territory_manager}
                    onChange={(e) => setNewTerritory({ ...newTerritory, territory_manager: e.target.value })}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    placeholder="Enter territory manager"
                  />
                </div>
              </div>
              <div className='border-b mb-4'></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-4">

                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                    Old Parent
                  </label>
                  <input
                    type="text"
                    value={newTerritory.old_parent}
                    onChange={(e) => setNewTerritory({ ...newTerritory, old_parent: e.target.value })}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    placeholder="Enter old parent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTerritory.is_group}
                    onChange={(e) => setNewTerritory({ ...newTerritory, is_group: e.target.checked })}
                    className="mr-2"
                    id="is_group"
                  />
                  <label htmlFor="is_group" className={`text-sm ${textSecondaryColor}`}>
                    Is Group
                  </label>
                </div>


                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                    Parent CRM Territory
                  </label>
                  <input
                    type="text"
                    value={newTerritory.parent_crm_territory}
                    onChange={(e) => setNewTerritory({ ...newTerritory, parent_crm_territory: e.target.value })}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    placeholder="Enter parent territory"
                  />
                </div>


              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={async () => {
                    if (!newTerritory.territory_name.trim()) {
                      showToast('Territory name is required', { type: 'error' });
                      return;
                    }

                    setTerritoryLoading(true);
                    try {
                      const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
                        method: 'POST',
                        headers: {
                          'Authorization': token,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          doc: JSON.stringify({
                            doctype: "CRM Territory",
                            territory_name: newTerritory.territory_name,
                            territory_manager: newTerritory.territory_manager,
                            parent_crm_territory: newTerritory.parent_crm_territory,
                            is_group: newTerritory.is_group ? 1 : 0,
                            old_parent: newTerritory.old_parent
                          })
                        })
                      });

                      if (response.ok) {
                        showToast('Territory created successfully', { type: 'success' });
                        setShowCreateTerritoryModal(false);
                        setNewTerritory({
                          territory_name: '',
                          territory_manager: '',
                          parent_crm_territory: '',
                          is_group: false,
                          old_parent: ''
                        });

                        // Refresh territory options
                        await fetchTerritoryOptions();

                        // Set the newly created territory as selected
                        handleInputChange('territory', newTerritory.territory_name);
                      } else {
                        throw new Error('Failed to create territory');
                      }
                    } catch (error) {
                      console.error('Error creating territory:', error);
                      showToast('Failed to create territory', { type: 'error' });
                    } finally {
                      setTerritoryLoading(false);
                    }
                  }}
                  disabled={territoryLoading}
                  className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
                >
                  {territoryLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  <span>Create</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {showCreateIndustryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={` w-[600px] ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
              <button
                onClick={() => {
                  setShowCreateIndustryModal(false);
                  setNewIndustryName('');
                }}
                className="absolute top-5 right-8 text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                ✕
              </button>

              <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Create New Industry</h3>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
                  Industry <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newIndustryName}
                  onChange={(e) => setNewIndustryName(e.target.value)}
                  placeholder="industry"
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${inputBgColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <button
                onClick={async () => {
                  if (!newIndustryName.trim()) {
                    showToast('Industry name is required', { type: 'error' });
                    return;
                  }

                  setIndustryLoading(true);
                  try {
                    const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
                      method: 'POST',
                      headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        doc: {
                          doctype: "CRM Industry",
                          industry: newIndustryName.trim()
                        }
                      })
                    });

                    if (response.ok) {
                      showToast('Industry created successfully', { type: 'success' });
                      setShowCreateIndustryModal(false);
                      setNewIndustryName('');

                      // Refresh industry options
                      await fetchIndustryOptions();

                      // Set the newly created industry as selected
                      handleInputChange('industry', newIndustryName.trim());
                    } else {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Failed to create industry');
                    }
                  } catch (error) {
                    console.error('Error creating industry:', error);
                    showToast(error.message || 'Failed to create industry', { type: 'error' });
                  } finally {
                    setIndustryLoading(false);
                  }
                }}
                disabled={industryLoading}
                className={`w-full px-4 py-2 rounded-lg text-white flex items-center justify-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
              >
                {industryLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{industryLoading ? 'Creating...' : 'Create'}</span>
              </button>
            </div>
          </div>
        )}
        {showCreateSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`w-full max-w-md ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}>
              <button
                onClick={() => {
                  setShowCreateSourceModal(false);
                  setNewSource({ source_name: '', details: '' });
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                ✕
              </button>

              <h3 className={`text-lg font-semibold ${textColor} mb-4`}>New Lead Source</h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                    Source Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSource.source_name}
                    onChange={(e) => setNewSource({ ...newSource, source_name: e.target.value })}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    placeholder="Enter source name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>
                    Details
                  </label>
                  <input
                    type="text"
                    value={newSource.details}
                    onChange={(e) => setNewSource({ ...newSource, details: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    placeholder="Enter source details"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={async () => {
                    if (!newSource.source_name.trim()) {
                      showToast('Source name is required', { type: 'error' });
                      return;
                    }

                    setSourceLoading(true);
                    try {
                      const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
                        method: 'POST',
                        headers: {
                          'Authorization': token,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          doc: {
                            doctype: "CRM Lead Source",
                            source_name: newSource.source_name.trim(),
                            details: newSource.details.trim()
                          }
                        })
                      });

                      if (response.ok) {
                        showToast('Source created successfully', { type: 'success' });
                        setShowCreateSourceModal(false);
                        setNewSource({ source_name: '', details: '' });

                        // Refresh source options
                        await fetchSourceOptions();

                        // Set the newly created source as selected
                        handleInputChange('source', newSource.source_name.trim());
                      } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to create source');
                      }
                    } catch (error) {
                      console.error('Error creating source:', error);
                      showToast(error.message || 'Failed to create source', { type: 'error' });
                    } finally {
                      setSourceLoading(false);
                    }
                  }}
                  disabled={sourceLoading}
                  className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
                >
                  {sourceLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{sourceLoading ? 'Creating...' : 'Create'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}