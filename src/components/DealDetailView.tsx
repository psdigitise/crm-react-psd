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
import { getUserSession, setUserSession, UserSession } from '../utils/session';
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
import { Building2 } from "lucide-react";
import { RefreshCw } from 'lucide-react';
import { getAuthToken } from '../api/apiUrl';

// Add these new interfaces
interface UserInfo {
  fullname: string;
  image: string | null;
  name: string;
  email: string;
  time_zone: string;
}

interface DocInfo {
  user_info: {
    [key: string]: UserInfo; // This is the index signature fix
  };
  comments: any[]; // You can use a more specific type if you have one
  shared: any[];
}
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
  closed_date?: string;
  probability?: string;
  next_step?: string;
  deal_name?: string;
  // NEW FIELDS
  expected_deal_value?: string;
  expected_closure_date?: string;
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

interface LostReason {
  value: string;
  label: string;
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

const API_BASE_URL = 'https://api.erpnext.ai/api';
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
  const [showCallModal, setShowCallModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  console.log("showTaskModal", showTaskModal)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState("reply");

  // Add to state variables
  const [companyIntelligence, setCompanyIntelligence] = useState<any>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);

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
  const [isGeneratingIntelligence, setIsGeneratingIntelligence] = useState(false);

  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [creditsLoading, setCreditsLoading] = useState(false);
  // Add to state variables
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const userSession = getUserSession();
  const sessionfullname = userSession?.full_name;
  const Username = userSession?.username || sessionfullname;
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [showCreateOrganizationModal, setShowCreateOrganizationModal] = useState(false);
  const [territorySearch, setTerritorySearch] = useState('');
  const [showCreateTerritoryModal, setShowCreateTerritoryModal] = useState(false);
  const [lostReasons, setLostReasons] = useState<LostReason[]>([]);
  const [showLostReasonModal, setShowLostReasonModal] = useState(false);
  const [lostReasonForm, setLostReasonForm] = useState({
    lost_reason: '',
    lost_notes: ''
  });

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
  const getCallerName = useCallback((call: any) => {
    // Extract the name once and cache it to prevent flickering
    const name = call._caller?.label || call.caller || call.from || "Unknown";
    return name;
  }, []);

  const getCallerInitial = useCallback((call: any) => {
    const name = getCallerName(call);
    return (name && name.length > 0) ? name.charAt(0).toUpperCase() : "U";
  }, [getCallerName]);
  const token = getAuthToken();


  const tabs = [
    { id: 'activity', label: 'Activity', icon: RiShining2Line },
    { id: 'emails', label: 'Emails', icon: HiOutlineMailOpen },
    { id: 'comments', label: 'Comments', icon: FaRegComment },
    { id: 'overview', label: 'Data', icon: TiDocumentText },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'tasks', label: 'Tasks', icon: SiTicktick },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'attachments', label: 'Attachments', icon: Paperclip },
    { id: 'intelligence', label: 'Company Intelligence', icon: Building2 }
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
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: deal.name
          })
        }
      );

      if (response.ok) {
        const result = await response.json();

        // Update docinfo if available
        if (result.docinfo && result.docinfo.user_info) {
          setDocinfo(prev => ({
            ...prev,
            user_info: {
              ...prev.user_info,
              ...result.docinfo.user_info
            }
          }));
        }

        const notesData = result.message[2] || [];

        const formattedNotes = notesData.map((note: any) => ({
          name: note.name,
          title: note.title,
          content: note.content,
          reference_doctype: 'CRM Deal',
          reference_docname: deal.name,
          creation: note.creation || note.modified || new Date().toISOString(),
          modified: note.modified || note.creation || new Date().toISOString(),
          owner: note.owner
        }));

        setNotes(formattedNotes);
      } else {
        throw new Error('Failed to fetch notes');
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setNotesLoading(false);
    }
  }, [deal.name]);






  const generateAndFetchCompanyIntelligence = async () => {
    if (!editedDeal.organization_name) {
      showToast('Organization name is required to generate company intelligence', { type: 'error' });
      return;
    }

    setIsGeneratingIntelligence(true);
    setIntelligenceError(null);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';


      const creditsResponse = await apiAxios.post(
        '/api/method/customcrm.api.check_credits_available',
        {
          type: 'report',
          company: sessionCompany
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      const creditsData = creditsResponse.data.message;


      if (!creditsData.status) {
        const credits = creditsData.available_credits || 0;
        showToast(`Insufficient credits. You have only ${credits} credits available. Please add more to proceed.`, { type: 'error' });
        setIsGeneratingIntelligence(false);
        return;
      }


      const generateResponse = await apiAxios.post(
        '/api/method/customcrm.email.generate_companyinfo.generate_company_report',
        {
          company_name: editedDeal.organization_name
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!generateResponse.data || !generateResponse.data.message) {
        throw new Error('Failed to generate company intelligence report');
      }

      const companyIntelligenceData = generateResponse.data.message;


      const inputToken = companyIntelligenceData.cost?.input_tokens || 0;
      const outputToken = companyIntelligenceData.cost?.output_tokens || 0;
      const usdCost = companyIntelligenceData.cost?.usd || 0;
      const inrCost = companyIntelligenceData.cost?.inr || 0;


      const saveResponse = await apiAxios.post(
        '/api/method/frappe.client.set_value',
        {
          doctype: "CRM Deal",
          name: deal.name,
          fieldname: {
            company_info: JSON.stringify(companyIntelligenceData)
          }
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (saveResponse.data && saveResponse.data.message) {
        setCompanyIntelligence(companyIntelligenceData);
        showToast('Company intelligence generated and saved successfully!', { type: 'success' });


        try {
          await apiAxios.post(
            '/api/method/customcrm.api.add_action_log',
            {
              doc: "CRM Deal",
              parent: deal.name,
              type: "report",
              data_ctrx: inputToken,
              output_token: outputToken,
              usd: usdCost,
              inr: inrCost

            },
            {
              headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('Action log added successfully');
        } catch (logError) {
          console.error('Failed to add action log:', logError);
          // Don't show error to user as this is just logging
        }

      } else {
        throw new Error('Failed to save company intelligence data');
      }

    } catch (error: any) {
      console.error('Error generating company intelligence:', error);

      // Try to fetch existing data if generation fails
      await fetchExistingCompanyIntelligence();

      // Show appropriate error message
      if (error.response?.data?.message) {
        setIntelligenceError(`Generation failed: ${error.response.data.message}`);
      } else {
        setIntelligenceError('Failed to generate company intelligence. Please try again.');
      }
    } finally {
      setIsGeneratingIntelligence(false);
    }
  };




  const fetchExistingCompanyIntelligence = async () => {
    try {
      const response = await apiAxios.post(
        '/api/method/frappe.client.get',
        {
          doctype: "CRM Deal",
          name: deal.name
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      const dealData = response.data.message;

      if (dealData && dealData.company_info) {
        try {
          const companyInfo = typeof dealData.company_info === 'string'
            ? JSON.parse(dealData.company_info)
            : dealData.company_info;
          setCompanyIntelligence(companyInfo);
        } catch (parseError) {
          console.error('Error parsing company info:', parseError);
          setIntelligenceError('Failed to parse company intelligence data');
        }
      } else {
        setCompanyIntelligence(null);
        setIntelligenceError('No company intelligence data available. Click "Generate Report" to create one.');
      }
    } catch (error) {
      console.error('Error fetching company intelligence:', error);
      setIntelligenceError('Failed to fetch company intelligence');
    }
  };

  const checkAvailableCredits = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      const response = await apiAxios.post(
        '/api/method/customcrm.api.check_credits_available',
        {
          type: 'report',
          company: sessionCompany
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      const creditsData = response.data.message;
      if (creditsData.status) {
        setAvailableCredits(creditsData.available_credits || 0);
        return creditsData.available_credits || 0;
      } else {
        // If status is false, show the "Insufficient credits" toast
        const credits = creditsData.available_credits || 0;
        showToast(`Insufficient credits. You have only ${credits} credits available. Please add more to proceed.`, { type: 'error' });
        return 0;
      }
    } catch (error) {
      console.error('Error checking credits:', error);
      showToast('Failed to check credits availability', { type: 'error' });
      return 0;
    }
  };


  useEffect(() => {
    if (activeTab === 'intelligence') {
      // Only fetch existing data when tab is opened
      fetchExistingCompanyIntelligence();


    }
  }, [activeTab]);

  // Update the refresh button in the UI
  const handleIntelligenceButtonClick = async () => {
    if (!companyIntelligence) {
      // If no data exists, generate new report
      await generateAndFetchCompanyIntelligence();
    } else {
      // If data exists, allow refresh (generate new report)
      await generateAndFetchCompanyIntelligence();
    }
  };


  const fetchCallLogs = useCallback(async () => {
    setCallsLoading(true);
    try {
      // First API call: Get activities
      const activitiesResponse = await fetch(
        `${API_BASE_URL}/method/crm.api.activities.get_activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
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
              'https://api.erpnext.ai/api/method/crm.fcrm.doctype.crm_call_log.crm_call_log.get_call_log',
              {
                method: 'POST',
                headers: {
                  'Authorization': token,
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
                type: detailedCall.type,
                duration: detailedCall.duration || call._duration || '0s',
                reference_doctype: 'CRM Deal',
                reference_name: deal.name,
                creation: detailedCall.creation || call.creation,
                owner: detailedCall.owner || call.caller || call.receiver || 'Unknown',
                caller: detailedCall.caller || call._caller.label,
                receiver: detailedCall.receiver || call._receiver.label,
                _caller: call._caller || { label: null, image: null },
                _receiver: call._receiver || { label: null, image: null },
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
                type: call.type,
                duration: call._duration || '0s',
                reference_doctype: 'CRM Deal',
                reference_name: deal.name,
                creation: call.creation,
                owner: call.caller || call.receiver || 'Unknown',
                caller: call.caller,
                receiver: call.receiver,
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
              type: call.type,
              duration: call._duration || '0s',
              reference_doctype: 'CRM Deal',
              reference_name: deal.name,
              creation: call.creation,
              owner: call.caller || call.receiver || 'Unknown',
              caller: call.caller,
              receiver: call.receiver,
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
          'Authorization': token,
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
            'Authorization': token,
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
            'Authorization': token,
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

  const fetchCompanyIntelligence = useCallback(async () => {
    setIntelligenceLoading(true);
    setIntelligenceError(null);

    try {
      const response = await apiAxios.post(
        '/api/method/frappe.client.get',
        {
          doctype: "CRM Deal",
          name: deal.name
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      const dealData = response.data.message;

      if (dealData && dealData.company_info) {
        try {
          // Parse the JSON string if it's stored as a string
          const companyInfo = typeof dealData.company_info === 'string'
            ? JSON.parse(dealData.company_info)
            : dealData.company_info;

          setCompanyIntelligence(companyInfo);
        } catch (parseError) {
          console.error('Error parsing company info:', parseError);
          setIntelligenceError('Failed to parse company intelligence data');
        }
      } else {
        setIntelligenceError('No company intelligence data available for this deal');
      }
    } catch (error) {
      console.error('Error fetching company intelligence:', error);
      setIntelligenceError('Failed to fetch company intelligence');
    } finally {
      setIntelligenceLoading(false);
    }
  }, [deal.name]);

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
            reference_docname: deal.name,
            creation: new Date().toISOString() // Explicitly set creation time
          }
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Instead of just fetching notes, update the state immediately
        const newNote = {
          name: response.data.message.name,
          title: noteForm.title,
          content: noteForm.content,
          reference_doctype: "CRM Deal",
          reference_docname: deal.name,
          creation: new Date().toISOString(), // Use current timestamp
          owner: session?.username || session?.full_name || 'Unknown',
          modified: new Date().toISOString()
        };

        // Update notes state immediately
        setNotes(prev => [newNote, ...prev]);

        setNoteForm({ title: '', content: '' });
        setShowNoteModal(false);

        // Also trigger a background refresh
        fetchNotes();
      } else {
        throw new Error(response.data.message || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      showToast('Failed to add note', { type: 'error' });
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
            'Authorization': token,
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
            'Authorization': token,
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
      const docData: { [key: string]: any } = {
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
        //receiver: userSession?.email || "Administrator" // Use current user's email
      };

      if (callForm.type === 'Outgoing') {
        docData.caller = callForm.caller; // Only add caller for outgoing
      } else if (callForm.type === 'Incoming') {
        docData.receiver = callForm.receiver; // Only add receiver for incoming
      }
      // Call the frappe.client.insert API
      const response = await fetch(`${API_BASE_URL}/method/frappe.client.insert`, {
        method: 'POST',
        headers: {
          'Authorization': token,
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
          duration: '',
          name: '',
          caller: '',
          receiver: '',
        });
        await fetchCallLogs();
        return true; // Return success status
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add call log');
      }
    } catch (error: any) {
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
    // Validation
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
    try {
      const session = getUserSession();
      const sessionCompany = session?.company || '';

      // Parse duration to remove any 's' suffix and non-numeric characters
      let durationValue = "0";
      if (callForm.duration !== undefined && callForm.duration !== null) {
        // Remove any 's' suffix and non-numeric characters, keep decimal point if needed
        durationValue = String(callForm.duration).replace(/[^0-9.]/g, '');
        // If after cleaning it's empty, set to "0"
        if (!durationValue) durationValue = "0";
      }

      const fieldname: { [key: string]: any } = {
        telephony_medium: "Manual",
        reference_doctype: "CRM Deal",
        reference_docname: deal.name,
        type: callForm.type,
        to: callForm.to,
        company: sessionCompany,
        from: callForm.from,
        status: callForm.status,
        duration: durationValue, // Send cleaned numeric value
      };

      // Conditionally add 'caller' or 'receiver' based on the type
      if (callForm.type === 'Outgoing') {
        fieldname.caller = callForm.caller;
        fieldname.receiver = null; // Clear receiver for outgoing calls
      } else if (callForm.type === 'Incoming') {
        fieldname.receiver = callForm.receiver;
        fieldname.caller = null; // Clear caller for incoming calls
      }

      const response = await fetch(`${API_BASE_URL}/method/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: "CRM Call Log",
          name: callForm.name, // Existing document name
          fieldname: fieldname
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
          caller: '',
          receiver: '',
          name: ''
        });
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
      console.error('Error updating call log:', error);
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
          'Authorization': token,
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
            'Authorization': token,
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

  const editTask = async (taskName: string | null) => {
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
            'Authorization': token,
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
            'Authorization': token,
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

      if (newStatus === 'Lost') {
        // Fetch lost reasons first
        await fetchLostReasons();
        setShowLostReasonModal(true);
        return; // Don't update status yet, wait for popup confirmation
      }

      const updatedDeal = { ...editedDeal, status: newStatus };

      const response = await fetch(
        `${API_BASE_URL}/method/frappe.client.set_value`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
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
        showToast('Status updated successfully!', { type: 'success' });

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

  const fetchLostReasons = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/method/frappe.desk.search.search_link`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            txt: "",
            doctype: "CRM Lost Reason"
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        const reasons = result.message.map((item: any) => ({
          value: item.value,
          label: item.value
        }));
        setLostReasons(reasons);
      } else {
        throw new Error('Failed to fetch lost reasons');
      }
    } catch (error) {
      console.error('Error fetching lost reasons:', error);
      showToast('Failed to fetch lost reasons', { type: 'error' });
    }
  };

  const saveLostDeal = async () => {
    if (!lostReasonForm.lost_reason.trim()) {
      showToast('Lost reason is required', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const session = getUserSession();
      const response = await fetch(
        `${API_BASE_URL}/method/frappe.client.set_value`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doctype: 'CRM Deal',
            name: deal.name,
            fieldname: {
              status: 'Lost',
              lost_reason: lostReasonForm.lost_reason,
              lost_notes: lostReasonForm.lost_notes || '',
              probability: 0 // Set probability to 0 for lost deals
            }
          })
        }
      );

      if (response.ok) {
        const updatedDeal = { ...editedDeal, status: 'Lost' };
        setEditedDeal(updatedDeal);
        onSave(updatedDeal);

        setShowLostReasonModal(false);
        setLostReasonForm({ lost_reason: '', lost_notes: '' });

        showToast('Deal marked as lost successfully!', { type: 'success' });

        if (activeTab === 'activity') {
          await fetchAllActivities();
        }
      } else {
        throw new Error('Failed to mark deal as lost');
      }
    } catch (error) {
      console.error('Error marking deal as lost:', error);
      showToast('Failed to mark deal as lost', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Add to your state variables
  const [docinfo, setDocinfo] = useState<DocInfo>({
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

    // First check the docinfo from the latest activity fetch
    if (docinfo.user_info && docinfo.user_info[username]) {
      return docinfo.user_info[username].fullname || username.split('@')[0] || username;
    }

    // Fallback to session data if available
    const session = getUserSession();
    if (session && session.username === username) {
      return session.full_name || username;
    }

    // Ultimate fallback
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

      console.log("Detailed call logs fetched:", detailedCallLogs);
      return detailedCallLogs;
    } catch (error) {
      console.error('Error fetching detailed call logs for activity:', error);
      return [];
    }
  };

  const fetchAllActivities = useCallback(async () => {
    setActivityLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/method/crm.api.activities.get_activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: deal.name
          })
        }
      );

      if (!response.ok) throw new Error('Failed to fetch activities');

      const result = await response.json();
      const userInfoMap = result.docinfo?.user_info || {};

      if (result.docinfo) {
        setDocinfo(result.docinfo);
      }

      const getFreshFullname = (username: string): string => {
        if (!username) return 'Unknown';
        const user = userInfoMap[username];
        return user?.fullname || username.split('@')[0] || username;
      };

      const message = result.message;
      const timelineItems = message[0] || [];
      const rawCallLogs = message[1] || [];
      const rawNotes = message[2] || [];
      const rawTasks = message[3] || [];

      const callNames = rawCallLogs.map(call => call.name).filter(Boolean);
      const detailedCallLogs = await fetchDetailedCallLogsForActivity(callNames);

      const detailedCallMap = new Map();
      detailedCallLogs.forEach(detailedCall => {
        if (detailedCall.name) {
          detailedCallMap.set(detailedCall.name, detailedCall);
        }
      });

      const enhancedCallLogs = rawCallLogs.map(call => {
        const detailedCall = detailedCallMap.get(call.name);
        return {
          ...call,
          ...(detailedCall || {}),
          _notes: detailedCall?._notes || call._notes || [],
          _tasks: detailedCall?._tasks || call._tasks || []
        };
      });

      setCallLogs(enhancedCallLogs);
      setNotes(rawNotes);
      setTasks(rawTasks);

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

      const callActivities = enhancedCallLogs.map((call: any) => ({
        id: call.name,
        type: 'call',
        title: `${call.type} Call`,
        description: ``,
        timestamp: call.creation,
        user: getFreshFullname(call.caller || call.receiver || 'Unknown'),
        icon: <Phone className="w-4 h-4 text-green-500" />,
        callData: { ...call, _notes: call._notes || [], _tasks: call._tasks || [] }
      }));

      const taskActivities = rawTasks.map((task: any) => ({
        id: task.name,
        type: 'task',
        title: `Task Created: ${task.title}`,
        description: ``,
        timestamp: task.modified,
        user: getFreshFullname(task.assigned_to || 'Unassigned'),
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
        user: getFreshFullname(attachment.owner),
        icon: <Paperclip className="w-4 h-4 text-gray-500" />,
        attachmentData: attachment
      }));

      // --- UPDATED TIMELINE FILTERING LOGIC ---
      const timelineActivities = timelineItems.map((item: any) => {
        // Logic to identify intelligence/summary fields
        const isSystemIntelligence = (data: any) => {
          const label = (data?.field_label || '').toLowerCase();
          const fname = (data?.fieldname || '').toLowerCase();
          return (
            label.includes('lead summary') ||
            label.includes('company intelligence') ||
            fname === 'lead_summary' ||
            fname === 'lead_score' ||
            fname === 'company_info'
          );
        };

        switch (item.activity_type) {
          case 'creation':
            return {
              id: `creation-${item.creation}`,
              type: 'edit',
              title: `${getFreshFullname(item.owner)} ${item.data}`,
              description: '',
              timestamp: item.creation,
              user: getFreshFullname(item.owner),
              icon: <UserPlus className="w-4 h-4 text-gray-500" />
            };

          case 'comment':
            // Hide comments that contain intelligence reports
            if (item.content?.toLowerCase().includes('lead summary') ||
              item.content?.toLowerCase().includes('company intelligence')) {
              return null;
            }
            return {
              id: item.name,
              type: 'comment',
              title: 'New Comment',
              description: item.content.replace(/<[^>]+>/g, ''),
              timestamp: item.creation,
              user: getFreshFullname(item.owner),
              icon: <MessageSquare className="w-4 h-4 text-purple-500" />
            };

          case 'communication':
            return {
              id: item.name || `comm-${item.creation}`,
              type: 'email',
              title: `Email: ${item.data.subject}`,
              description: ``,
              timestamp: item.creation,
              user: getFreshFullname(item.data.sender_full_name || item.data.sender),
              icon: <Mail className="w-4 h-4 text-red-500" />
            };

          case 'added':
          case 'changed':
            // Filter out individual intelligence changes
            if (isSystemIntelligence(item.data)) return null;

            // Filter out intelligence changes inside grouped versions
            if (item.other_versions?.length > 0) {
              const filteredVersions = item.other_versions.filter((v: any) => !isSystemIntelligence(v.data));

              // If the group only contained intelligence, hide the whole group
              if (filteredVersions.length === 0 && isSystemIntelligence(item.data)) return null;

              return {
                id: `group-${item.creation}`,
                type: 'grouped_change',
                timestamp: item.creation,
                user: getFreshFullname(item.owner),
                icon: <Layers className="w-4 h-4 text-white" />,
                changes: [item, ...filteredVersions]
              };
            }

            const actionText = item.activity_type === 'added'
              ? `added value for ${item.data.field_label}: '${item.data.value}'`
              : `changed ${item.data.field_label} from '${item.data.old_value || "nothing"}' to '${item.data.value}'`;
            return {
              id: `change-${item.creation}`,
              type: 'edit',
              title: `${getFreshFullname(item.owner)} ${actionText}`,
              description: '',
              timestamp: item.creation,
              user: getFreshFullname(item.owner),
              icon: <RxLightningBolt className="w-4 h-4 text-yellow-500" />
            };
          default:
            return null;
        }
      }).filter(Boolean);

      const allActivities = [...callActivities, ...taskActivities, ...timelineActivities, ...attachmentActivities];
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(allActivities);

    } catch (error) {
      console.error("Error fetching activities:", error);
      showToast("Failed to load activity timeline", { type: 'error' });
    } finally {
      setActivityLoading(false);
    }
  }, [deal.name, token]);


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
            'Authorization': token
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
    const activityTabs: TabType[] = ['activity', 'notes', 'calls', 'comments', 'tasks', 'emails'];

    if (activityTabs.includes(activeTab)) {
      fetchAllActivities();
    }
    if (activeTab === 'overview') {
      fetchOrganizations();
    }
    if (activeTab === 'intelligence') {
      fetchCompanyIntelligence();
    }
  }, [activeTab, fetchAllActivities, fetchCompanyIntelligence]);
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

    let date;

    try {
      // Handle different date formats
      // API returns: "2025-12-01 15:53:54.001203"
      // Replace space with 'T' to make it ISO-like
      const isoDateString = dateString.includes(' ')
        ? dateString.replace(' ', 'T')
        : dateString;

      date = new Date(isoDateString);
    } catch {
      return "Unknown date";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Unknown date";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

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
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      const dealData = response.data.message;
      // const DealFullName = dealData.first_name || ''; // Extract the first_name
      // Extract the contact's full name from the deal
      const fetchedContactFullName = dealData.contacts?.[0]?.full_name || '';

      // --- NEW VARIABLE ASSIGNMENT START ---

      // 1. Assign the extracted value to a distinct, local variable (already done above)
      // This is the "new variable" that holds the deal's contact name.
      const newDealContactName = fetchedContactFullName;

      // 2. Get the current session
      const currentSession = getUserSession();

      // 3. Check if the session exists and if the new contact name is different
      //    from the currently stored deal contact name (assuming a new field 'dealContactFullName').
      if (currentSession && currentSession.dealFullName !== newDealContactName) {

        // 4. Update the session object using the new variable
        const newSession: UserSession = {
          ...currentSession,
          // Assign the new variable to the new session field
          dealFullName: newDealContactName
        };

        setUserSession(newSession); // Save the updated session to storage
      }
      // Update the editedDeal state with the fetched data
      setEditedDeal(prev => ({
        ...prev,
        organization: dealData.organization || dealData.organization_name || '',
        organization_name: dealData.organization_name || dealData.organization || '',
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
        closed_date: dealData.closed_date || '',
        // NEW FIELDS
        expected_deal_value: dealData.expected_deal_value?.toString() || '',
        expected_closure_date: dealData.expected_closure_date || '',
      }));

    } catch (error) {
      console.error('Error fetching deal details:', error);
    } finally {
      setLoading(false);
    }
  }, [deal.name]);

  const getOrganizationName = () => {
    return editedDeal.organization_name || editedDeal.organization || 'No Organization';
  };


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

    // NEW: Validate mandatory fields
    if (!editedDeal.expected_deal_value?.trim()) {
      newErrors.expected_deal_value = 'Expected Deal Value is required';
    }

    if (!editedDeal.expected_closure_date?.trim()) {
      newErrors.expected_closure_date = 'Expected Closure Date is required';
    }

    if (!editedDeal.organization?.trim() && !editedDeal.organization_name?.trim()) {
      newErrors.organization = 'Organization is required';
    }

    // Website validation
    if (editedDeal.website && !isValidUrl(editedDeal.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., example.com or https://example.com)';
    }

    // If validation errors found, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        doctype: "CRM Deal",
        name: editedDeal.name,
        fieldname: {
          organization: editedDeal.organization,
          organization_name: editedDeal.organization_name,
          website: editedDeal.website,
          territory: editedDeal.territory,
          annual_revenue: editedDeal.annual_revenue,
          closed_date: editedDeal.closed_date,
          probability: editedDeal.probability,
          next_step: editedDeal.next_step,
          deal_owner: editedDeal.deal_owner,
          status: editedDeal.status,
          first_name: editedDeal.first_name,
          last_name: editedDeal.last_name,
          email: editedDeal.email,
          mobile_no: editedDeal.mobile_no,
          // NEW FIELDS
          expected_deal_value: editedDeal.expected_deal_value,
          expected_closure_date: editedDeal.expected_closure_date,
        },
      };

      const response = await apiAxios.post(
        "/api/method/frappe.client.set_value",
        payload,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
        }
      );

      showToast('Deal updated successfully!', { type: 'success' });
      console.log("Save successful:", response.data.message);
    } catch (error) {
      console.error("Save failed:", error);
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
              'Authorization': token
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
              'Authorization': token
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
            'Authorization': token,
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
    console.log("10._caller", call._caller);
    console.log("11._receiver", call._receiver);

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
                {getOrganizationName()} - {deal.name}
              </h1>
              <p className={`text-sm ${textSecondaryColor}`}>{deal.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Listbox
              value={editedDeal.status}
              onChange={handleStatusChange}
              disabled={loading}
            >
              <div className="relative inline-block w-48">
                <Listbox.Button
                  className={`pl-8 pr-4 py-2 rounded-lg transition-colors appearance-none text-white w-full text-left  ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
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
        <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
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

            <div className="grid grid-cols-1 mb-5 gap-6">
              <div className="space-y-6">
                <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${textColor}`}>Person Details</h3>
                    <button
                      onClick={handleSave}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white  ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span>Saving...</span>
                        </>
                      ) : 'Save'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* First Name */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        First Name
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={editedDeal.first_name || ''}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'}`}
                        placeholder=""
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={editedDeal.last_name || ''}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'}`}
                        placeholder=""
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        readOnly
                        value={editedDeal.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'}`}
                        placeholder=""
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        readOnly
                        value={editedDeal.mobile_no || ''}
                        // onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleInputChange('mobile_no', onlyDigits);
                        }}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'}`}

                      />
                    </div>

                  </div>
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 mb-5 gap-6">
              <div className="space-y-6">
                <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${textColor}`}>Forecasted Sales</h3>

                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Expected Deal Value (€) */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Expected Deal Value (€) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={editedDeal.expected_deal_value || ''}
                        onChange={(e) => {
                          handleInputChange('expected_deal_value', e.target.value);
                          if (errors.expected_deal_value) {
                            setErrors(prev => ({ ...prev, expected_deal_value: '' }));
                          }
                        }}
                        className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } ${errors.expected_deal_value ? 'border-red-500' : ''}`}
                        placeholder="2000"
                      />
                      {errors.expected_deal_value && (
                        <p className="text-sm text-red-500 mt-1">{errors.expected_deal_value}</p>
                      )}
                    </div>

                    {/* Expected Closure Date */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Expected Closure Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={editedDeal.expected_closure_date?.split(' ')[0] || ''}
                        onChange={(e) => {
                          handleInputChange('expected_closure_date', e.target.value);
                          if (errors.expected_closure_date) {
                            setErrors(prev => ({ ...prev, expected_closure_date: '' }));
                          }
                        }}
                        className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white [color-scheme:dark]'
                          : 'bg-white border-gray-300 text-gray-900'
                          }`}
                      />
                      {errors.expected_closure_date && (
                        <p className="text-sm text-red-500 mt-1">{errors.expected_closure_date}</p>
                      )}
                    </div>

                    {/* Probability Field - Takes full width below the two inputs */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Probability
                      </label>


                      <div className="mt-2">
                        {/* Static Probability Display - No interactive slider */}
                        <div className="relative">
                          {/* Static Slider Track (read-only) */}
                          <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            {/* Static Progress Fill */}
                            <div
                              className={`h-2 rounded-full transition-all cursor-not-allowed duration-300 ${parseInt(editedDeal.probability || '0') >= 80 ? 'bg-green-500' :
                                parseInt(editedDeal.probability || '0') >= 60 ? 'bg-blue-500' :
                                  parseInt(editedDeal.probability || '0') >= 40 ? 'bg-yellow-500' :
                                    parseInt(editedDeal.probability || '0') >= 20 ? 'bg-orange-500' :
                                      'bg-red-500'
                                }`}
                              style={{ width: `${parseInt(editedDeal.probability || '0')}%` }}
                            />
                          </div>

                          {/* Static Percentage Indicators */}
                          <div className="flex justify-between mt-1">
                            {/* 0% at left */}
                            <div className="flex flex-col items-center">
                              <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'}`} />
                              <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                0%
                              </span>
                            </div>

                            {/* Static Current value indicator */}
                            <div
                              className={`absolute flex flex-col items-center -translate-x-1/2 transition-all duration-300`}
                              style={{ left: `${parseInt(editedDeal.probability || '0')}%` }}
                            >
                              {/* Static Current value marker */}
                              <div className={`w-4 h-4 rounded-full -mt-1.5 z-10 ${parseInt(editedDeal.probability || '0') >= 80 ? 'bg-green-500' :
                                parseInt(editedDeal.probability || '0') >= 60 ? 'bg-blue-500' :
                                  parseInt(editedDeal.probability || '0') >= 40 ? 'bg-yellow-500' :
                                    parseInt(editedDeal.probability || '0') >= 20 ? 'bg-orange-500' :
                                      'bg-red-500'
                                }`} />

                              {/* Static Current value label */}
                              <div className={`mt-2 px-2 py-1 rounded-md text-xs font-semibold ${theme === 'dark'
                                ? 'bg-gray-800 text-white border border-gray-700'
                                : 'bg-white text-gray-900 border border-gray-300'
                                } shadow-sm`}>
                                {editedDeal.probability || '0'}%
                              </div>
                            </div>

                            {/* 100% at right */}
                            <div className="flex flex-col items-center">
                              <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'}`} />
                              <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                100%
                              </span>
                            </div>
                          </div>
                        </div>


                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1  gap-6">
              <div className="space-y-6">
                <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${textColor}`}>Data</h3>

                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Organization Field */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Organization <span className="text-red-500">*</span>
                      </label>
                      <Listbox
                        value={editedDeal.organization_name || ""}
                        onChange={(value) => {
                          handleInputChange("organization_name", value);
                          handleInputChange("organization", value);
                          if (errors.organization) {
                            setErrors(prev => {
                              const updatedErrors = { ...prev };
                              delete updatedErrors.organization; // Remove the error message
                              return updatedErrors;
                            });
                          }
                        }}
                      >
                        {({ open, close }) => (
                          <div className="relative mt-1">
                            <Listbox.Button
                              className={`relative w-full cursor-default rounded-md border ${borderColor} py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
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

                            <Listbox.Options className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                              {/* Search Input */}
                              <div className={`sticky top-0 z-10 p-2 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search organizations..."
                                    className={`w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
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
                                      `relative cursor-default select-none border-b py-2 pl-3 pr-9 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${active ? (theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-blue-100 text-blue-900') : ''}`
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
                              <div className={`sticky top-[44px] z-10 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                                <button
                                  type="button"
                                  className={`flex items-center w-full px-3 py-2 text-sm hover:rounded ${theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}
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
                              <div className={`sticky top-[88px] z-10 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                                <button
                                  type="button"
                                  className={`flex items-center w-full px-3 py-2 text-sm hover:rounded ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                                  onClick={() => {
                                    handleInputChange("organization_name", "");
                                    handleInputChange("organization", "");
                                    setOrganizationSearch("");
                                    setErrors(prev => ({ ...prev, organization: 'Organization is required' }));
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
                      {errors.organization && (
                        <p className="text-sm text-red-500 mt-1 font-medium">
                          {errors.organization}
                        </p>
                      )}
                      <CreateOrganizationPopup
                        isOpen={showCreateOrganizationModal}
                        onClose={() => setShowCreateOrganizationModal(false)}
                        theme="dark"
                        dealName={deal.name}
                        currentDealData={editedDeal}
                        onOrganizationCreated={(newOrganizationName, organizationData) => {
                          handleInputChange("organization", newOrganizationName);
                          handleInputChange("organization_name", newOrganizationName);
                          fetchOrganizations();
                          setShowCreateOrganizationModal(false);
                          showToast('Organization created and deal updated successfully!', {
                            type: 'success'
                          });
                        }}
                      />
                    </div>


                    {/* Close Date */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                        Close Date
                      </label>
                      <input
                        type="date"
                        value={editedDeal.closed_date?.split(' ')[0] || ''}
                        onChange={(e) => handleInputChange('closed_date', e.target.value)}
                        className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white [color-scheme:dark]' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Date when the deal was closed</p>
                    </div>



                    {/* Website */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Website</label>
                      <input
                        type="text"
                        value={editedDeal.website || ''}
                        onChange={(e) => {
                          handleInputChange('website', e.target.value);
                          if (errors.website) {
                            setErrors(prev => ({ ...prev, website: '' }));
                          }
                        }}
                        className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="example.com"
                      />
                      {errors.website && (
                        <p className="text-sm text-red-500 mt-1">{errors.website}</p>
                      )}
                    </div>

                    {/* Territory */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Territory</label>
                      <Listbox
                        value={editedDeal.territory || ""}
                        onChange={(value) => handleInputChange("territory", value)}
                      >
                        {({ open, close }) => (
                          <div className="relative mt-1">
                            <Listbox.Button
                              className={`relative w-full cursor-default rounded-md border ${borderColor} py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
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

                            <Listbox.Options className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                              {/* Search Input */}
                              <div className={`sticky top-0 z-10 p-2 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search territory..."
                                    className={`w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
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
                                      `relative cursor-default select-none border-b py-2 pl-3 pr-9 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${active ? (theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-blue-100 text-blue-900') : ''}`
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

                              {/* Clear Button */}
                              <div className={`sticky top-[88px] z-10 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                                <button
                                  type="button"
                                  className={`flex items-center w-full px-3 py-2 text-sm hover:rounded ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
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

                    {/* Annual Revenue */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Annual Revenue</label>
                      <input
                        type="text"
                        value={editedDeal.annual_revenue || ''}
                        maxLength={10}
                        onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                        className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="Enter annual revenue"
                      />
                    </div>

                    {/* Deal Owner */}
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
                        placeholder="Search or select Deal Owner..."
                        className="mt-1 w-full"
                        classNamePrefix="owner-select"
                        styles={theme === 'dark' ? darkSelectStyles : undefined}

                        formatOptionLabel={({ label, }) => (
                          <div className="flex flex-col">
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {label || value.split('@')[0]}
                            </span>

                          </div>
                        )}
                      />
                    </div>

                    {/* Next Step */}
                    <div>
                      <label className={`block text-sm font-medium ${textSecondaryColor}`}>Next Step</label>
                      <input
                        type="text"
                        value={editedDeal.next_step || ''}
                        onChange={(e) => handleInputChange('next_step', e.target.value)}
                        className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="Enter next step"
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

            <div>
              <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
                <div className='flex justify-between items-center gap-5 mb-6'>
                  <h3 className={`text-lg font-semibold ${textColor}`}>Notes</h3>
                  <button
                    onClick={() => {
                      setShowNoteModal(true);
                      setIsEditMode(false);
                      setNoteForm({ title: '', content: '' });
                    }}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white  ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    <Plus className="w-4 h-4" />
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
                        setNoteForm({ title: '', content: '' });
                      }}
                      className={`mt-4 px-6 py-2 rounded-md cursor-pointer transition-colors ${theme === 'dark'
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
                        className={`border h-[200px] flex flex-col justify-between ${borderColor} rounded-lg p-4 relative transition-colors ${theme === 'dark'
                          ? 'bg-gray-800 hover:bg-gray-750'
                          : 'bg-white hover:bg-gray-50'
                          }`}
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
                          <h4 className={`text-lg font-semibold ${textColor} truncate`}>{note.title}</h4>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === note.name ? null : note.name);
                              }}
                              className={`p-1 rounded transition-colors ${theme === 'dark'
                                ? 'hover:bg-gray-700'
                                : 'hover:bg-gray-200'
                                }`}
                              style={{ lineHeight: 0 }}
                            >
                              <BsThreeDots className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                            </button>

                            {/* Dropdown */}
                            {openMenuId === note.name && (
                              <div className={`absolute right-0 mt-2 w-28 rounded-lg shadow-lg z-10 border ${theme === 'dark'
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'
                                }`}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.name);
                                    setOpenMenuId(null);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 w-full text-left transition-colors ${theme === 'dark'
                                    ? 'text-red-400 hover:bg-gray-700 hover:rounded-lg'
                                    : 'text-red-600 hover:bg-gray-100 hover:rounded-lg'
                                    }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="">
                          <p className={`text-base font-normal ${textSecondaryColor} whitespace-pre-wrap line-clamp-3`}>
                            {note.content}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center pt-4   border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} text-sm gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} font-bold text-xs`}>
                              {note.owner?.charAt(0).toUpperCase() || "-"}
                            </div>
                            <span className={textSecondaryColor}>{getFullname(note.owner)}</span>
                          </div>
                          <span className={`${textSecondaryColor} font-medium`}>
                            {(() => {
                              // Use a more robust timestamp display
                              const timestamp = note.creation || note.modified;
                              if (!timestamp) return "Unknown Time";

                              try {
                                // Try to parse the timestamp
                                const date = new Date(timestamp);
                                if (!isNaN(date.getTime())) {
                                  // Use your existing getRelativeTime function
                                  return getRelativeTime(timestamp);
                                }
                              } catch (e) {
                                console.error("Error parsing date:", e);
                              }

                              // Fallback: show raw timestamp or formatted string
                              return typeof timestamp === 'string'
                                ? timestamp.split(' ')[0] || "Unknown Time"
                                : "Unknown Time";
                            })()}
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
                  className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${theme === 'dark'
                    ? 'bg-gray-900 border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}
                >
                  <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                    }`}>
                    {/* Close */}
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                      <button
                        type="button"
                        className={`rounded-md ${theme === 'dark'
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-400 hover:text-gray-500'
                          } focus:outline-none`}
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
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={noteForm.title}
                          onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white !placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                            } ${noteForm.title === '' && noteFormError
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                              : ''
                            }`}
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
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white !placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                            }`}
                          placeholder="Took a call with John Doe and discussed the new project"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`px-4 py-3 sm:px-6 ${theme === 'dark'
                    ? 'bg-gray-800 border-t border-gray-700'
                    : 'bg-gray-50 border-t border-gray-200'
                    }`}>
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
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors ${theme === 'dark'
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
                          isEditMode ? 'Update Note' : 'Create Note'
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
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
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
                    className={`mt-4 px-6 py-2 rounded-md cursor-pointer transition-colors ${theme === 'dark'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >Create Call Log</button>
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
                             ${call.type === 'Incoming'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-green-100 text-green-600'
                              }`}
                            style={{ width: '32px', height: '32px' }}
                          >
                            {call.type === 'Incoming' ? (
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
                            {getCallerInitial(call)}
                          </div>

                          {/* Text */}
                          <span className={`ml-2 text-sm ${textColor}`}>
                            {getFullname(getCallerName(call))} has reached out
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
                        className={`relative border ${borderColor} rounded-lg max-sm:ml-0 ml-12 p-4 flex flex-col`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-lg font-medium ${textColor}`}>
                            {call.type}
                          </p>
                        </div>

                        {/* All three in one line */}
                        <div className="flex  flex-wrap items-start justify-start mt-2 gap-4">
                          <p className={`text-sm ${textSecondaryColor} flex items-center`}>
                            <IoIosCalendar className="mr-1" />
                            {formatDateRelative(call.creation)}
                          </p>

                          {/* <p className={`text-sm ${textSecondaryColor}`}>
                            {call.duration}
                          </p> */}

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
                            onClick={() => handleLabelClick(call)}
                            className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium w-6 h-6 text-xs sm:w-8 sm:h-8"
                          >
                            {call._caller?.label?.charAt(0).toUpperCase() || ""}
                          </div>

                          {/* Receiver */}
                          <div
                            onClick={() => handleLabelClick(call)}
                            className="p-2 rounded-full flex items-center justify-center bg-gray-400 text-gray-700 font-medium w-6 h-6 text-xs sm:w-8 sm:h-8">
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
                  <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Type </label>
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
                      // Clear from error when user starts typing
                      if (errors.from) {
                        setErrors(prev => ({ ...prev, from: '' }));
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
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white !placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                      }`}
                    placeholder="Call duration in seconds"
                  />
                </div>

                {/* Caller Field (Conditionally rendered for 'Outgoing' calls) */}
                {callForm.type === 'Outgoing' && (
                  <div>
                    <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Caller</label>
                    <select
                      value={callForm.caller}
                      onChange={(e) => setCallForm({ ...callForm, caller: e.target.value })}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    >
                      <option value="">Select Caller</option>
                      {userOptions.map((user) => (
                        <option key={user.value} value={user.value}>
                          {user.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Receiver Field (Conditionally rendered for 'Incoming' calls) */}
                {callForm.type === 'Incoming' && (
                  <div>
                    <label className={`block text-sm font-medium ${textSecondaryColor} mb-2`}>Call Received By</label>
                    <select
                      value={callForm.receiver}
                      onChange={(e) => setCallForm({ ...callForm, receiver: e.target.value })}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}`}
                    >
                      <option value="">Select Receiver</option>
                      {/* This also maps over the same user list */}
                      {userOptions.map((user) => (
                        <option key={user.value} value={user.value}>
                          {user.label}
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
                      setCallForm({ from: '', to: '', status: 'Ringing', type: 'Outgoing', duration: '', caller: '', receiver: '', name: '' });
                    }
                  }}
                  disabled={callsLoading}
                  className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'bg-purplebg hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
                >
                  <span>{isEditMode ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
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
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white  ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Comment</span>
                </button>
              </div>

              {commentsLoading ? (
                <div className="text-center py-8">
                  <span className={`${textSecondaryColor}`}>Loading comments...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <FaRegComment className={`w-12 h-12 mx-auto mb-4 ${textSecondaryColor}`} />
                  <p className={textSecondaryColor}>No comments</p>
                  <button
                    onClick={() => {
                      setSelectedEmailComments(null);
                      setEmailModalModeComments("comment");
                      setShowEmailModalComments(true);
                      setTimeout(() => {
                        composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className={`mt-4 px-6 py-2 rounded-md cursor-pointer transition-colors ${theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    New Comment
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {comments.slice().reverse().map((comment) => (
                    <div key={comment.name} className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                          <div className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            <FaRegComment size={18} />
                          </div>
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark'
                            ? 'bg-gray-700 text-gray-200'
                            : 'bg-gray-200 text-gray-700'} text-sm font-semibold`}>
                            {comment.owner?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <p className={`text-sm font-medium ${textSecondaryColor}`}>
                            {getFullname(comment.owner)} added a {comment.comment_type}
                          </p>
                        </div>
                        <p className={`text-sm ${textSecondaryColor}`}>
                          {getRelativeTime(comment.creation)}
                        </p>
                      </div>

                      <div className={`border ${borderColor} rounded-lg p-4 mb-8 ml-9 mt-2 ${theme === 'dark'
                        ? 'bg-gray-800/50'
                        : 'bg-gray-50'}`}>
                        <div className={`${textColor} mb-2 whitespace-pre-wrap`}>
                          {comment.content.replace(/<[^>]+>/g, '')}
                        </div>

                        {/* Attachments section */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-3">
                              {comment.attachments.map((attachment, index) => {
                                const baseURL = "https://api.erpnext.ai";
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
                                      className={`flex items-center border ${borderColor} px-3 py-1 rounded transition-colors ${theme === 'dark'
                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                                    >
                                      <span className="mr-2 flex items-center gap-1 truncate max-w-[200px]">
                                        <IoDocument className={`w-3 h-3 mr-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
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
            <div
              ref={composerRef}
              className={`
        ${cardBgColor} border-t ${borderColor} overflow-hidden z-50
        fixed bottom-0 left-0 w-full px-4 py-3
        sm:absolute sm:w-[-webkit-fill-available] sm:pt-4 
      `}
            >
              {!showEmailModalComments ? (
                <div className="flex gap-4">
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                    onClick={() => {
                      setEmailModalModeComments("new");
                      setShowEmailModalComments(true);
                      setSelectedEmailComments(null);
                    }}
                  >
                    <Mail size={16} className={`mr-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                    Reply
                  </button>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                    onClick={() => {
                      setEmailModalModeComments("comment");
                      setShowEmailModalComments(true);
                    }}
                  >
                    <FaRegComment size={14} className={`mr-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                    Comment
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
                <div className={`p-4 rounded-lg max-w-3xl w-full relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <button
                    className={`absolute top-5 right-8 ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'}`}
                    onClick={() => setShowAttachmentModal(false)}
                  >
                    ✕
                  </button>
                  <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>
                    {selectedAttachment.name}
                  </h3>
                  <div className={`border-b mb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>
                  {selectedAttachment.isImage ? (
                    <img src={selectedAttachment.url} alt={selectedAttachment.name} className="max-h-[70vh] mx-auto rounded" />
                  ) : (
                    <div className={`text-center ${textColor}`}>
                      <IoDocument className={`mx-auto mb-2 w-8 h-8 ${textSecondaryColor}`} />
                      <p>{selectedAttachment.name}</p>
                      <a
                        href={selectedAttachment.url}
                        download
                        className={`mt-3 inline-block px-4 py-2 rounded transition-colors ${theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
              <div className='flex justify-between items-center gap-5 mb-6'>
                <h3 className={`text-lg font-semibold ${textColor}`}>Tasks</h3>
                <button
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
                    className={`mt-4 px-6 py-2 rounded-md cursor-pointer transition-colors ${theme === 'dark'
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
                        setTaskForm({
                          title: task.title,
                          description: task.description,
                          status: task.status,
                          priority: task.priority,
                          due_date: task.due_date ? task.due_date.split(' ')[0] : '',
                          assigned_to: task.assigned_to,
                        });
                        setIsEditMode(true);
                        setCurrentTaskId(task.name);
                        setShowTaskModal(true);
                      }}
                      className={`border ${borderColor} rounded-lg p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${textColor}`}>{task.title}</h4>
                      </div>

                      <div className="mt-1 text-sm flex justify-between items-center flex-wrap gap-2">
                        {/* Left side */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Assigned to */}
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'} text-xs font-semibold`}>
                            {task.assigned_to?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className={textSecondaryColor}>
                            {getFullname(task.assigned_to) || 'Unassigned'}
                          </span>

                          {/* Due date */}
                          {task.due_date && (
                            <span className={`flex items-center gap-0.5 ${textSecondaryColor}`}>
                              <LuCalendar className="w-3.5 h-3.5" />
                              {task.due_date}
                            </span>
                          )}

                          {/* Priority */}
                          <span className="flex items-center gap-1">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${task.priority === 'High'
                                ? 'bg-red-500'
                                : task.priority === 'Medium'
                                  ? 'bg-yellow-500'
                                  : task.priority === 'Low'
                                    ? 'bg-gray-300'
                                    : 'bg-gray-400'
                                }`}
                            ></span>
                            <span className={`text-xs font-medium ${textSecondaryColor}`}>
                              {task.priority}
                            </span>
                          </span>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                          {/* Status */}
                          <span
                            className={`px-1 text-xs font-semibold rounded ${task.status === 'Done'
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

                          {/* Three dots menu */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === task.name ? null : task.name);
                              }}
                              className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            >
                              <BsThreeDots className={`w-4 h-4 ${textColor}`} />
                            </button>

                            {openMenuId === task.name && (
                              <div
                                className={`absolute right-0 mt-2 w-28 border ${borderColor} rounded-lg shadow-lg z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTaskToDelete(task.name);
                                    setShowDeleteTaskPopup(true);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg w-full text-left"
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

                  {showDeleteTaskPopup && taskToDelete && (
                    <DeleteTaskPopup
                      closePopup={() => setShowDeleteTaskPopup(false)}
                      task={{ name: taskToDelete }}
                      theme={theme}
                      onDeleteSuccess={fetchTasks}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Task Modal with improved theme styling */}
            {showTaskModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                  onClick={() => setShowTaskModal(false)}
                />

                {/* Modal */}
                <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-11/12 sm:max-w-[600px] border ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                  <div className="px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                    {/* Close button */}
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                      <button
                        type="button"
                        className={`rounded-md ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
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
                      {/* Title Field */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={taskForm.title}
                          onChange={(e) => {
                            setTaskForm({ ...taskForm, title: e.target.value });
                            if (errors.title) {
                              setErrors(prev => ({ ...prev, title: '' }));
                            }
                          }}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white !placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                            } ${errors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                          placeholder="Enter task title"
                        />
                        {errors.title && (
                          <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                        )}
                      </div>

                      {/* Description Field */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Description
                        </label>
                        <textarea
                          value={taskForm.description}
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          rows={6}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white !placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500'
                            }`}
                          placeholder="Enter task description"
                        />
                      </div>

                      {/* Row with all fields */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Status */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Status
                          </label>
                          <select
                            value={taskForm.status}
                            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all  ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          >
                            <option value="Backlog">Backlog</option>
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                            <option value="Canceled">Canceled</option>
                            <option value="Open">Open</option>
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
                            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all  ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>

                        {/* Due Date - Fixed with proper dark mode support */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={taskForm.due_date}
                            onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 text-white [color-scheme:dark]'
                              : 'bg-white border-gray-300 text-gray-900 [color-scheme:light]'
                              }`}
                          />
                        </div>

                        {/* Assigned To */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${textSecondaryColor}`}>
                            Assigned To
                          </label>
                          <select
                            value={taskForm.assigned_to}
                            onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          >
                            <option value="" className={theme === 'dark' ? 'bg-gray-800 text-white' : ''} >Select Assignee</option>
                            {userOptions.map((user) => (
                              <option
                                key={user.value}
                                value={user.value}
                                className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
                              >
                                {user.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`px-6 py-4 sm:px-8 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                    <button
                      onClick={async () => {
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
                      className={`w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-all ${theme === 'dark'
                        ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                        } ${tasksLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {tasksLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditMode ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        isEditMode ? 'Update Task' : 'Create Task'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
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
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white  ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
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
                  <button
                    onClick={() => {
                      setSelectedEmailEmails(null);                // Use Emails suffix
                      setEmailModalModeEmails("new");             // Use Emails suffix
                      setShowEmailModalEmails(true);              // Use Emails suffix
                      setTimeout(() => {
                        composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className={`mt-4 px-6 py-2 rounded-md cursor-pointer transition-colors ${theme === 'dark'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    New Email
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {emails.map((email) => (
                    <div key={email.id} className="flex items-start w-full">

                      <div className=" mt-2 relative flex-shrink-0 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-500 text-white text-sm font-semibold mr-4">
                        {email.fromName?.charAt(0).toUpperCase() || "?"}
                      </div>


                      <div className={`flex-1 border border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium ${textColor}`}>
                            {email.from}
                          </h4>


                          <div className="flex items-center gap-3 ml-auto">
                            <span className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                              {getRelativeTime(email.creation)}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedEmailEmails(email);
                                setEmailModalModeEmails("reply");
                                setShowEmailModalEmails(true);
                              }}
                              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}
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
                              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}
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
                            const baseURL = "https://api.erpnext.ai";
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
              // className={`${cardBgColor} border-t ${borderColor} w-[-webkit-fill-available] pt-4 pb-4 absolute bottom-0 overflow-hidden`}
              className={`
                ${cardBgColor} border-t ${borderColor} overflow-hidden z-50
                fixed bottom-0 left-0 w-full px-4 py-3
                sm:absolute sm:w-[-webkit-fill-available] sm:pt-4
              `}
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
                    <Mail size={16} /> Reply
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
          <div className="h-full">
            <div className={`relative h-full rounded-lg shadow-sm border p-4 max-sm:p-3 pb-5 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Activity</h3>

              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className={`w-6 h-6 animate-spin ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <RiShining2Line className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'} mx-auto mb-4`} />
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>No activities yet</p>
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
                                  className={`p-2 rounded-full mr-3 flex items-center justify-center ${callData.type === 'Incoming' || callData.type === 'Incoming'
                                    ? theme === 'dark'
                                      ? 'bg-blue-900/30 text-blue-300 border border-blue-700/30'
                                      : 'bg-blue-100 text-blue-600 border border-blue-200'
                                    : theme === 'dark'
                                      ? 'bg-green-900/30 text-green-300 border border-green-700/30'
                                      : 'bg-green-100 text-green-600 border border-green-200'
                                    }`}
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  {callData.type === 'Incoming' || callData.type === 'Incoming' ? (
                                    <SlCallIn className="w-4 h-4" />
                                  ) : (
                                    <SlCallOut className="w-4 h-4" />
                                  )}
                                </div>
                                <div
                                  className={`p-2 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 border border-gray-600' : 'bg-gray-200 text-gray-700 border border-gray-300'} font-medium`}
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  {(callData._caller?.label || callData.from)?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                  {callData._caller?.label || callData.from} has reached out
                                </span>
                              </div>
                              <p className={`text-xs w-max d-flex flex-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {getRelativeTime(activity.timestamp)}
                              </p>
                            </div>

                            {/* Card body with call details */}
                            <div
                              onClick={() => handleLabelClick(callData, true)}
                              className={`relative w-auto border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg ml-12 p-4 flex flex-col cursor-pointer hover:${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} transition-colors`}>
                              <div className="flex items-center justify-between mb-2">
                                <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {callData.type} Call
                                </p>
                              </div>
                              <div className="flex items-start justify-start mt-2 gap-4 flex-wrap">
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                                  <IoIosCalendar className="mr-1" />
                                  {formatDateRelative(callData.creation)}
                                </p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {callData.duration}
                                </p>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${callData.status === 'Completed'
                                    ? theme === 'dark'
                                      ? 'bg-green-900/30 text-green-300 border border-green-700/30'
                                      : 'bg-green-100 text-green-800 border border-green-200'
                                    : callData.status === 'Ringing'
                                      ? theme === 'dark'
                                        ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700/30'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                      : theme === 'dark'
                                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                                    }`}
                                >
                                  {callData.status}
                                </span>
                              </div>
                              {/* Overlapping avatars for caller/receiver */}
                              <div className="absolute right-4 top-1/2 max-sm:top-[25%] -translate-y-1/2 flex -space-x-4">
                                <div
                                  onClick={() => handleLabelClick(callData)}
                                  className={`p-2 rounded-full flex items-center justify-center cursor-pointer ${theme === 'dark' ? 'bg-gray-600 text-gray-100 border border-gray-500' : 'bg-gray-400 text-gray-800 border border-gray-300'} font-medium`}
                                  style={{ width: '32px', height: '32px' }}
                                  title={callData._caller?.label || callData.from}
                                >
                                  {(callData._caller?.label || callData.from)?.charAt(0).toUpperCase()}
                                </div>
                                <div
                                  onClick={() => handleLabelClick(callData)}
                                  className={`p-2 rounded-full flex items-center justify-center cursor-pointer ${theme === 'dark' ? 'bg-gray-600 text-gray-100 border border-gray-500' : 'bg-gray-400 text-gray-800 border border-gray-300'} font-medium`}
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
                      else if (activity.type === 'comment') {
                        const commentData = comments.find(c => c.name === activity.id);
                        if (!commentData) return null;

                        return (
                          <div key={activity.id} className="relative">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                  <FaRegComment size={14} />
                                </div>
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-600 text-gray-200 border border-gray-500' : 'bg-gray-200 text-gray-700 border border-gray-300'} text-sm font-semibold`}>
                                  {commentData.owner?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {getFullname(commentData.owner)} added a comment
                                </p>
                              </div>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {getRelativeTime(commentData.creation)}
                              </p>
                            </div>
                            <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4 ml-9 mt-2 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                              <div className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-2 whitespace-pre-wrap`}>
                                {commentData.content.replace(/<[^>]+>/g, '')}
                              </div>
                              {/* Attachments Section */}
                              {commentData.attachments && commentData.attachments.length > 0 && (
                                <div className="mt-4">
                                  <div className="flex flex-wrap gap-3">
                                    {commentData.attachments.map((attachment, index) => {
                                      const baseURL = "https://api.erpnext.ai";
                                      const fullURL = attachment.file_url.startsWith("http")
                                        ? attachment.file_url
                                        : `${baseURL}${attachment.file_url}`;
                                      return (
                                        <a
                                          key={index}
                                          href={fullURL}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'} transition-colors`}
                                        >
                                          <span className="mr-2 flex items-center gap-1 truncate max-w-[200px] text-sm">
                                            <IoDocument className={`w-3 h-3 mr-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
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
                        const attachmentData = activity.attachmentData;
                        if (!attachmentData) return null;

                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                  <span className="font-medium">{activity.user}</span> added an attachment
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {getRelativeTime(activity.timestamp)}
                                </p>
                              </div>

                              {/* Attachment preview */}
                              <div className={`mt-2 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-3 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex max-sm:w-min items-center">
                                    {isImageFile(attachmentData.file_name) ? (
                                      <div className="relative">
                                        <img
                                          src={`https://api.erpnext.ai${attachmentData.file_url}`}
                                          alt={attachmentData.file_name}
                                          className="w-12 h-12 mr-3 object-cover rounded border border-gray-400"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            const fallback = e.target.nextSibling;
                                            if (fallback) fallback.style.display = 'flex';
                                          }}
                                        />
                                        {/* Fallback for private images */}
                                        <div
                                          className={`w-12 h-12 mr-3 flex items-center justify-center border border-gray-400 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                                          style={{ display: 'none' }}
                                        >
                                          <IoDocument className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className={`w-12 h-12 mr-3 flex items-center justify-center border border-gray-400 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <IoDocument className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                      </div>
                                    )}
                                    <div>
                                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{attachmentData.file_name}</p>
                                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {attachmentData.file_size ? formatFileSize(attachmentData.file_size) : 'Unknown size'}
                                        {attachmentData.is_private === 1 && ' • Private'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    {/* {attachmentData.is_private === 1 ? (
                                      <IoLockClosedOutline className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} title="Private" />
                                    ) : (
                                      <IoLockOpenOutline className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} title="Public" />
                                    )} */}

                                    <a
                                      href={`https://api.erpnext.ai${attachmentData.file_url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`p-1.5 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <LuUpload className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      else if (activity.type === 'email') {
                        const emailData = emails.find(e => e.id === activity.id);
                        if (!emailData) return null;

                        return (
                          <div key={emailData.id} className="flex items-start w-full">
                            {/* Avatar Circle */}
                            <div className={`w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-600 text-gray-200 border border-gray-500' : 'bg-gray-200 text-gray-700 border border-gray-300'} text-sm font-semibold`}>
                              {emailData.fromName?.charAt(0).toUpperCase() || "?"}
                            </div>

                            {/* Email Card */}
                            <div className={`flex-1 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-shadow ml-3 ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}`}>
                              <div className="flex flex-col justify-between items-start mb-2">
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {emailData.fromName} &lt;{emailData.from}&gt;
                                </h4>

                                {/* Right-side controls */}
                                <div className="flex items-center gap-3 ml-auto">
                                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {getRelativeTime(emailData.creation)}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedEmailActivity(emailData);
                                      setEmailModalModeActivity("reply");
                                      setShowEmailModalActivity(true);
                                    }}
                                    className={`p-1 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
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
                                    className={`p-1 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                                    title="Reply All"
                                  >
                                    <LuReplyAll className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{emailData.subject}</h4>

                              <div className="mb-2">
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <strong>To:</strong> {emailData.to}
                                </span>
                              </div>

                              <div className={`mt-4 pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col items-start`}>
                                <div
                                  className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-2 whitespace-pre-wrap mt-4 w-full`}
                                  dangerouslySetInnerHTML={{
                                    __html: emailData.content.includes('\n\n---\n\n')
                                      ? emailData.content.split('\n\n---\n\n')[1]
                                      : emailData.content
                                  }}
                                />

                                {/* Attachments */}
                                {emailData.attachments.map((attachment, index) => {
                                  const baseURL = "https://api.erpnext.ai";
                                  const fullURL = attachment.file_url.startsWith("http") ? attachment.file_url : `${baseURL}${attachment.file_url}`;
                                  return (
                                    <a
                                      key={index}
                                      href={fullURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`px-3 py-1 border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-md text-sm flex items-center mt-2 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                                    >
                                      <IoDocument className={`w-3 h-3 mr-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                                      {attachment.file_name}
                                    </a>
                                  );
                                })}

                                {/* Expand original message button */}
                                {emailData.content.includes('\n\n---\n\n') && (
                                  <div className="mt-2">
                                    <button
                                      className={`text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} inline-flex items-center justify-center w-10 h-6 rounded-full ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                                      onClick={() => setExpandedEmailId(prev => (prev === emailData.id ? null : emailData.id))}
                                      title="Show original message"
                                    >
                                      <PiDotsThreeOutlineBold />
                                    </button>

                                    {/* Conditionally show original content */}
                                    {expandedEmailId === emailData.id && (
                                      <div
                                        className={`mt-4 border-l-4 pl-4 italic font-semibold text-sm ${theme === "dark" ? "border-gray-500 text-gray-300" : "border-gray-300 text-gray-600"}`}
                                        dangerouslySetInnerHTML={{ __html: emailData.content.split('\n\n---\n\n')[0] }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      else if (activity.type === 'grouped_change') {
                        const isExpanded = expandedGroup === activity.id;
                        const changeCount = activity.changes.length;
                        const userFullname = docinfo.user_info[activity.user]?.fullname || activity.user;

                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            {/* Icon - Fixed with better contrast */}
                            <div className={`p-2 rounded-full flex items-center justify-center ${theme === 'light'
                              ? 'bg-gray-800 !text-gray-300 border '
                              : 'bg-gray-800 !text-gray-300  border '}`}>
                              {/* Use a fallback icon if activity.icon is not provided */}
                              {activity.icon || (
                                <svg
                                  className={`w-4 h-4 ${theme === 'dark' ? '!text-gray-300' : '!text-gray-700'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => setExpandedGroup(isExpanded ? null : activity.id)}
                                  className={`text-sm text-left flex items-center gap-2 ${theme === 'dark'
                                    ? '!text-gray-200 hover:text-white'
                                    : '!text-gray-700 hover:text-gray-900'}`}
                                >
                                  {isExpanded ? 'Hide' : 'Show'} +{changeCount} changes from <span className="font-medium">{getFullname(userFullname)}</span>
                                  <FiChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''} ${theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'}`} />
                                </button>
                                <p className={`text-xs ${theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'}`}>
                                  {getRelativeTime(activity.timestamp)}
                                </p>
                              </div>

                              {/* Expanded List of Changes */}
                              {isExpanded && (
                                <div className={`mt-2 pl-4 border-l-2 ${theme === 'dark'
                                  ? 'border-gray-600'
                                  : 'border-gray-300'} space-y-1`}>
                                  {activity.changes.map((change: any) => (
                                    <p key={change.creation} className={`text-sm ${theme === 'dark'
                                      ? 'text-gray-400'
                                      : 'text-gray-500'}`}>
                                      <span className={`font-semibold ${theme === 'dark'
                                        ? 'text-gray-300'
                                        : 'text-gray-700'}`}>
                                        {change.data.field_label}:
                                      </span>
                                      {change.data.old_value != null
                                        ? <> Changed from '{change.data.old_value}' to <span className={`font-semibold ${theme === 'dark'
                                          ? 'text-gray-300'
                                          : 'text-gray-700'}`}>'{change.data.value}'</span></>
                                        : <> Added <span className={`font-semibold ${theme === 'dark'
                                          ? 'text-gray-300'
                                          : 'text-gray-700'}`}>'{change.data.value}'</span></>
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
                        // Default style for all other activities (including "Task Created: vvv")
                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full flex items-center justify-center ${theme === 'dark'
                              ? 'bg-gray-800 text-gray-300 border border-gray-700'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                              {React.isValidElement(activity.icon) ? (
                                React.cloneElement(activity.icon, {
                                  className: `w-4 h-4 ${theme === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-700'}`
                                })
                              ) : activity.icon ? (
                                <div className={`w-4 h-4 flex items-center justify-center ${theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'}`}>
                                  {activity.icon}
                                </div>
                              ) : (
                                // Fallback icon for activities without an icon
                                <svg className={`w-4 h-4 ${theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm ${theme === 'dark'
                                  ? 'text-gray-200'
                                  : 'text-gray-700'}`}>
                                  {activity.description || activity.title}
                                </p>
                                <p className={`text-xs ${theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'}`}>
                                  {getRelativeTime(activity.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </>
              )}
            </div>
            {/* Sticky Action Footer */}
            <div
              ref={composerRef}
              className={`
        ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t overflow-hidden z-50
        fixed bottom-0 left-0 w-full px-4 py-3
        sm:absolute sm:w-[-webkit-fill-available] sm:pt-4 
      `}
            >
              {!showEmailModalActivity ? (
                <div className="flex gap-4">
                  <button
                    className={`flex items-center gap-1 ${theme === "dark"
                      ? "text-gray-300   "
                      : "text-gray-600    "}`}
                    onClick={() => {
                      setEmailModalModeActivity("reply");
                      setShowEmailModalActivity(true);
                      setSelectedEmailActivity(null);
                    }}
                  >
                    <Mail size={16} className={`mr-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} /> Reply
                  </button>
                  <button
                    className={`flex items-center gap-1 ${theme === "dark"
                      ? "text-gray-300   "
                      : "text-gray-600    "}`}
                    onClick={() => {
                      setEmailModalModeActivity("comment");
                      setShowEmailModalActivity(true);
                    }}
                  >
                    <FaRegComment size={14} className={`mr-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} /> Comment
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
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-6`}>
              <div className='flex items-center justify-between gap-5 mb-6'>
                <h3 className={`text-lg font-semibold ${textColor} mb-0`}>Attachments</h3>
                <button
                  onClick={() => setIsUploadPopupOpen(true)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white  ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
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
                      // onClick={() => window.open(`https://api.erpnext.ai${attachment.file_url}`, '_blank')}
                      onClick={() => window.open(getFullFileUrl(attachment.file_url), '_blank')}
                    >
                      <div className="flex items-center">
                        {isImageFile(attachment.file_name) ? (
                          // Show original image for both private and public files
                          <img
                            src={`https://api.erpnext.ai${attachment.file_url}`}
                            alt={attachment.file_name}
                            className="w-12 h-12 mr-3 object-cover rounded border border-gray-400 hover:opacity-80"
                            onError={(e) => {
                              // Fallback to document icon if image fails to load
                              e.target.style.display = 'none';
                              const fallback = e.target.parentNode.querySelector('.image-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 mr-3 flex items-center justify-center border border-gray-400 rounded">
                            <IoDocument className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                        )}

                        {/* Fallback container for images that fail to load */}
                        {isImageFile(attachment.file_name) && (
                          <div
                            className="w-12 h-12 mr-3 flex items-center justify-center border border-gray-400 rounded image-fallback"
                            style={{ display: 'none' }}
                          >
                            <img src='https://www.shutterstock.com/shutterstock/photos/2495883211/display_1500/stock-vector-no-photo-image-viewer-thumbnail-picture-placeholder-graphic-element-flat-picture-landscape-symbol-2495883211.jpg'></img>
                          </div>
                        )}

                        <div>
                          <p className={`font-medium ${textColor}`}>{attachment.file_name}</p>
                          <p className={`text-sm ${textSecondaryColor}`}>
                            {attachment.file_size ? formatFileSize(attachment.file_size) : 'Unknown size'}
                            {attachment.is_private === 1 && ' • Private'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <p className={`text-sm w-max ${textSecondaryColor}`}> {getRelativeTime(attachment.creation ?? '')}</p>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachmentToTogglePrivacy({
                              name: attachment.name,
                              is_private: attachment.is_private
                            });
                          }}
                          className="flex items-center space-x-2">
                          {/* {attachment.is_private === 1 ? (
                            <div className="p-2 bg-gray-700 rounded-full flex items-center justify-center">
                              <IoLockClosedOutline className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-100'}`} title="Private" />
                            </div>
                          ) : (
                            <div className="p-2 bg-gray-700 rounded-full flex items-center justify-center">
                              <IoLockOpenOutline className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-100'}`} title="Public" />
                            </div>
                          )} */}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachmentToDelete({
                                name: attachment.name
                              });
                            }}
                            className={`p-2 rounded-full flex items-center justify-center ${theme === 'dark'
                              ? 'bg-red-900/30 hover:bg-red-800/40 text-red-400'
                              : 'bg-red-100 hover:bg-red-200 text-red-600'}`}
                            title="Delete attachment"
                          >
                            <Trash2 className="w-4 h-4" />
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
              theme={theme}
              onClose={() => setIsUploadPopupOpen(false)}
            />
            {attachmentToDelete && (
              <DeleteAttachmentPopup
                closePopup={() => setAttachmentToDelete(null)}
                attachment={attachmentToDelete}
                theme={theme}
                fetchAttachments={fetchAttachments}
              />
            )}
            {attachmentToTogglePrivacy && (
              <AttachmentPrivatePopup
                closePopup={() => setAttachmentToTogglePrivacy(null)}
                attachment={attachmentToTogglePrivacy}
                theme={theme}
                fetchAttachments={fetchAttachments}
              />
            )}
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`${cardBgColor} rounded-lg shadow-sm border ${borderColor} max-sm:p-3 p-4 sm:p-6`}>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className={`text-lg sm:text-xl font-semibold ${textColor}`}>Company Intelligence</h3>

                <div className="flex items-center gap-2">
                  {!companyIntelligence && !isGeneratingIntelligence && (
                    <button
                      onClick={generateAndFetchCompanyIntelligence}
                      disabled={!editedDeal.organization_name}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white ${theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                        } disabled:opacity-50`}
                      title={!editedDeal.organization_name
                        ? "Organization name is required"
                        : "Click to generate company intelligence report (requires 1 credit)"
                      }
                    >
                      <RxLightningBolt className="w-4 h-4" />
                      <span>Generate Report</span>
                    </button>
                  )}
                  {isGeneratingIntelligence && (
                    <button
                      disabled
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${theme === 'dark'
                        ? 'bg-purple-600 text-white'
                        : 'bg-blue-600 text-white'
                        } opacity-50`}
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Warning if organization name is not set */}
              {!editedDeal.organization_name && (
                <div className={`p-3 mb-4 rounded-lg ${theme === 'dark'
                  ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  }`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Please set an organization name in the Data tab to generate company intelligence.</span>
                  </div>
                </div>
              )}

              {isGeneratingIntelligence ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-16">
                  <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-blue-600 mb-3 sm:mb-4" />
                  <p className={`text-base sm:text-lg font-medium ${textColor} mb-2 text-center`}>
                    Generating Company Intelligence Report
                  </p>
                  <p className={`text-xs sm:text-sm ${textSecondaryColor} text-center max-w-md px-4`}>
                    Analyzing company data and generating comprehensive intelligence report...
                    This may take a few moments.
                  </p>
                </div>
              ) : !companyIntelligence ? (
                <div className="text-center py-8 sm:py-12">
                  <Building2 className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${textSecondaryColor}`} />
                  <h4 className={`text-base sm:text-lg font-semibold mb-2 ${textColor}`}>
                    No Company Intelligence Report Generated
                  </h4>
                  <p className={`text-sm ${textSecondaryColor} px-4 mb-6 max-w-md mx-auto`}>
                    Generate a comprehensive company intelligence report to get insights about the organization's business, technology, leadership, and market position.
                  </p>
                  {!editedDeal.organization_name && (
                    <p className={`text-xs ${textSecondaryColor} mt-3`}>
                      Set organization name in Data tab first
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Overall Scorecard */}
                  {companyIntelligence.json?.scorecard && (
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
                  {companyIntelligence.json?.scorecard && (
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
                  {companyIntelligence.json?.identity_and_overview && (
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
                          <p className={`text-sm overflow-hidden sm:text-base font-semibold ${textColor} mt-1`}>
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
                  {companyIntelligence.json?.Company_Snapshot && (
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
                  {companyIntelligence.json?.business_and_strategy && (
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
                  {companyIntelligence.json?.markets_and_geographic_footprint && (
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
                  {companyIntelligence.json?.key_leadership && (
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
                  {companyIntelligence.json?.technology_landscape && (
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
                  {companyIntelligence.json?.digital_transformation_readiness && (
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
                  {companyIntelligence.json?.ai_capabilities_adoption && (
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
                  {companyIntelligence.json?.integration_and_enterprise_systems && (
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
                  {companyIntelligence.json?.financial_health && (
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
                  {companyIntelligence.json?.social_event_signals && (
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
                  {companyIntelligence.json?.Competitor_and_peer_comparison && (
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
                  {companyIntelligence.json?.opportunities_for_improvement && (
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
                  {companyIntelligence.json?.strengths && (
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
                  {companyIntelligence.json?.risks && (
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
                  {companyIntelligence.json?.recommendations && (
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
      </div>
      {showCallDetailsPopup && (editingCall || editingCallFromActivity) && (
        <CallDetailsPopup
          call={{
            type: (editingCall || editingCallFromActivity)?.type,
            // caller: (editingCall || editingCallFromActivity)?._caller?.label || "Unknown",
            // receiver: (editingCall || editingCallFromActivity)?._receiver?.label || "Unknown",
            caller: (editingCall || editingCallFromActivity)?._caller?.label || (editingCall || editingCallFromActivity)?.caller || "Unknown",
            receiver: (editingCall || editingCallFromActivity)?._receiver?.label || (editingCall || editingCallFromActivity)?.receiver || "Unknown",
            date: formatDateRelative((editingCall || editingCallFromActivity)?.creation),
            duration: (editingCall || editingCallFromActivity)?.duration,
            status: (editingCall || editingCallFromActivity)?.status,
            name: (editingCall || editingCallFromActivity)?.name, // ADDED: Passes the unique call name/ID
            _notes: (editingCall || editingCallFromActivity)?._notes || [], // ADDED: Passes the notes for this call
            _tasks: (editingCall || editingCallFromActivity)?._tasks || [],// ADDED: Passes the notes for this call
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
              caller: editingCall.caller || '',
              receiver: editingCall.receiver || '',
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

      {showLostReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-md rounded-lg shadow-lg p-6 relative ${theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'}`}>

            {/* Close button */}
            <button
              onClick={() => {
                setShowLostReasonModal(false);
                setLostReasonForm({ lost_reason: '', lost_notes: '' });
              }}
              className={`absolute top-4 right-4 p-1 rounded-full ${theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                Lost reason
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Please provide a reason for marking this deal as lost
              </p>
            </div>

            <div className="space-y-4">
              {/* Lost Reason Dropdown */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Lost reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={lostReasonForm.lost_reason}
                  onChange={(e) => setLostReasonForm({ ...lostReasonForm, lost_reason: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'}`}
                >
                  <option value="" className={theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>
                    Select lost reason
                  </option>
                  {lostReasons.map((reason) => (
                    <option
                      key={reason.value}
                      value={reason.value}
                      className={theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                    >
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lost Notes */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Lost notes
                </label>
                <textarea
                  value={lostReasonForm.lost_notes}
                  onChange={(e) => setLostReasonForm({ ...lostReasonForm, lost_notes: e.target.value })}
                  rows={4}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white !placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 !placeholder-gray-500 focus:border-blue-500'}`}
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-600">
              <button
                onClick={() => {
                  setShowLostReasonModal(false);
                  setLostReasonForm({ lost_reason: '', lost_notes: '' });
                }}
                className={`px-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-400'}`}
              >
                Cancel
              </button>
              <button
                onClick={saveLostDeal}
                disabled={loading}
                className={`px-4 py-2.5 rounded-lg text-white transition-colors ${theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white'} 
            disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
