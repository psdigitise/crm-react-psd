import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { NotificationsPanel } from './components/NotificationsPanel';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DataTable } from './components/DataTable';
import { DealsTable } from './components/DealsTable';
import { ContactsTable } from './components/ContactsTable';
import { ContactDetailView } from './components/ContactDetailView';
import { DealDetailView } from './components/DealDetailView';
import { OrganizationsTable } from './components/OrganizationsTable';
import { OrganizationDetailView } from './components/OrganizationDetailView';
import { UsersPage } from './components/UsersPage';
import { RemindersPage } from './components/RemindersPage';
import { TodosPageNew } from './components/TodosPageNew';
import { NotificationsPageNew } from './components/NotificationsPageNew';
import { NotesPage } from './components/NotesPage';
import { TasksPage } from './components/TasksPage';
import { CallLogsPage } from './components/CallLogsPage';
import { EmailPage } from './components/EmailPage';
import { LeadDetailView } from './components/LeadDetailView';
import { CreateLeadModal } from './components/CreateLeadModal';
import { CreateDealModal } from './components/CreateDealModal';
import { CreateContactModal } from './components/CreateContactModal';
import { CreateOrganizationModal } from './components/CreateOrganizationModal';
import { CreateReminderModal } from './components/CreateReminderModal';
import { CreateTodoModalNew } from './components/CreateTodoModalNew';
import { CreateNoteModalNew } from './components/CreateNoteModalNew';
import { CreateTaskModalNew } from './components/CreateTaskModalNew';
import { CreateCallLogModal } from './components/CreateCallLogModal';
import { CreateEmailModal } from './components/CreateEmailModal';
import { CreateUserModal } from './components/CreateUserModal';
import { ThemeProvider } from './components/ThemeProvider';
import { sampleLeads, sampleDeals, sampleContacts, sampleOrganizations } from './data/sampleData';
import { isUserLoggedIn, getUserSession, clearUserSession } from './utils/session';
import { apiAxios, AUTH_TOKEN } from './api/apiUrl';
import { AuthErrorModal } from './components/SessionLogout/AuthErrorModal';
import { registerAuthModalCallback, registerLogoutCallback } from './utils/apiErrorHandler';
import PasswordResetPage from './components/ResetPassword';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import AccountActivationPage from './components/AccountActivationPage';
import { UserDetailView } from './components/UserDetailView';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Target } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';

function AppContent() {
  // Initialize login state from session storage with proper checking
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAuthErrorModal, setShowAuthErrorModal] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string>();


  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [expiryStatus, setExpiryStatus] = useState<{ expired: boolean; daysLeft: number } | null>(null);
  const [showExpiryPopup, setShowExpiryPopup] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState<'profile' | 'aiUsage' | 'websiteIntegration' | 'upgradePlan'>('profile');


  const handleOpenSettingsModal = (tab: 'profile' | 'aiUsage' | 'websiteIntegration' | 'upgradePlan' = 'profile') => {
    setInitialSettingsTab(tab);
    setShowSettingsModal(true);
  };

  // A new function to handle the "Upgrade Now" button click in the expiry popup
  const handleUpgradeNowClick = () => {
    handleOpenSettingsModal('upgradePlan');
    setShowExpiryPopup(false); // Close the expiry popup
  };
  // Initialize states based on current URL
  const [activeMenuItem, setActiveMenuItem] = useState(() => {
    const path = window.location.pathname;

    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path.startsWith('/leads')) return 'leads';
    if (path.startsWith('/deals')) return 'deals';
    if (path.startsWith('/contacts')) return 'contacts';
    if (path.startsWith('/organizations')) return 'organizations';
    if (path === '/users') return 'users';
    if (path === '/reminders') return 'reminders';
    if (path === '/todos') return 'todos';
    if (path === '/notifications') return 'notifications';
    if (path === '/notes') return 'notes';
    if (path === '/tasks') return 'tasks';
    if (path === '/call-logs') return 'call-logs';
    if (path === '/email-templates') return 'email-templates';
    return 'dashboard';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState<'lead' | 'deal' | 'contact' | 'organization' | 'reminder' | 'todo' | 'note' | 'task' | 'calllog' | 'email' | 'user'>('lead');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [leads, setLeads] = useState(sampleLeads);
  const [deals, setDeals] = useState(sampleDeals);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);
  const [userRefreshTrigger, setUserRefreshTrigger] = useState(0);
  const [noteRefreshTrigger, setNoteRefreshTrigger] = useState(0);

  // New state to track if we're in a detail view (from notes or other pages)
  const [isInDetailView, setIsInDetailView] = useState(false);
  const [isInNestedView, setIsInNestedView] = useState(false);

  const handleTaskCreated = () => {
    setTaskRefreshTrigger(prev => prev + 1);
  };

  const [callsRefreshTrigger, setcallsRefreshTrigger] = useState(0);
  const handleCallsCreated = () => {
    setcallsRefreshTrigger(prev => prev + 1);
  };

  const handleNoteCreated = () => {
    setNoteRefreshTrigger(prev => prev + 1);
    setShowCreateModal(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const loggedIn = isUserLoggedIn();
        const session = getUserSession();

        console.log('Session check:', { loggedIn, session });

        if (loggedIn && session) {
          setIsLoggedIn(true);
          await initializeStateFromUrl();
        } else {
          clearUserSession();
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        clearUserSession();
        setIsLoggedIn(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const session = getUserSession();
    const companyName = session?.company;

    if (!companyName) return;

    fetch(`https://api.erpnext.ai/api/v2/document/Company/${encodeURIComponent(companyName)}`, {
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(res => {
        const data = res.data;

        setCompanyInfo({
          start_date: data.start_date,
          end_date: data.end_date
        });

        if (data.end_date) {
          const today = new Date();
          const endDate = new Date(data.end_date);
          const diff = endDate.getTime() - today.getTime();
          const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

          const expired = daysLeft < 0;

          setExpiryStatus({ expired, daysLeft });

          if (expired) {
            setShowExpiryPopup(true);
          }
        }
      })
      .catch(err => {
        console.error("Package check failed:", err);
        setCompanyInfo(null);
        setExpiryStatus(null);
      });
  }, []);


  // Helper function to fetch deal
  const fetchAndSetDeal = async (dealId: string) => {
    try {
      const response = await apiAxios.post("/api/method/frappe.client.get", {
        doctype: "CRM Deal",
        name: dealId,
      });

      if (response.data.message) {
        const deal = {
          ...response.data.message,
          id: response.data.message.name,
          organization: response.data.message.organization_name || response.data.message.organization
        };
        setSelectedDeal(deal);
        return deal;
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
      return null;
    }
  };

  // Helper function to fetch lead
  const fetchAndSetLead = async (leadId: string) => {
    try {
      const response = await apiAxios.post("/api/method/frappe.client.get", {
        doctype: "CRM Lead",
        name: leadId,
      });

      if (response.data.message) {
        const lead = { ...response.data.message, id: response.data.message.name };
        setSelectedLead(lead);
        return lead;
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      return null;
    }
  };

  // Function to handle opening records from notes page
  const handleOpenRecordFromNotes = (doctype: string, docname: string) => {
    console.log(`Opening ${doctype}: ${docname} from notes`);

    // Clear all selections first
    setSelectedLead(null);
    setSelectedDeal(null);
    setSelectedContact(null);
    setSelectedOrganization(null);
    setSelectedUser(null);
    setIsInNestedView(true);
    setIsInDetailView(true);

    if (doctype === 'CRM Deal') {
      // Fetch and set the deal
      fetchAndSetDeal(docname);
      setActiveMenuItem('deals');
    } else if (doctype === 'CRM Lead') {
      // Fetch and set the lead
      fetchAndSetLead(docname);
      setActiveMenuItem('leads');
    }
  };

  const initializeStateFromUrl = async () => {
    const path = window.location.pathname;
    const cleanPath = path.replace('/app', '');

    // Handle detail views with API fetching
    if (cleanPath.startsWith('/leads/')) {
      const leadId = cleanPath.split('/')[2];
      try {
        const response = await apiAxios.post("/api/method/frappe.client.get", {
          doctype: "CRM Lead",
          name: leadId,
        });

        if (response.data.message) {
          const lead = { ...response.data.message, id: response.data.message.name };
          setSelectedLead(lead);
          setActiveMenuItem('leads');
          setIsInDetailView(true);
          return;
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
        setActiveMenuItem('leads');
        window.history.replaceState({}, '', '/app/leads');
        return;
      }
    }

    if (cleanPath.startsWith('/deals/')) {
      const dealId = cleanPath.split('/')[2];
      try {
        const response = await apiAxios.post("/api/method/frappe.client.get", {
          doctype: "CRM Deal",
          name: dealId,
        });

        if (response.data.message) {
          const deal = {
            ...response.data.message,
            id: response.data.message.name,
            organization: response.data.message.organization_name || response.data.message.organization
          };
          setSelectedDeal(deal);
          setActiveMenuItem('deals');
          setIsInDetailView(true);
          return;
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
        setActiveMenuItem('deals');
        window.history.replaceState({}, '', '/app/deals');
        return;
      }
    }

    if (cleanPath.startsWith('/contacts/')) {
      const contactId = cleanPath.split('/')[2];
      try {
        const response = await apiAxios.post("/api/method/frappe.client.get", {
          doctype: "CRM Contact",
          name: contactId,
        });

        if (response.data.message) {
          const contact = { ...response.data.message, id: response.data.message.name };
          setSelectedContact(contact);
          setActiveMenuItem('contacts');
          setIsInDetailView(true);
          return;
        }
      } catch (error) {
        console.error('Error fetching contact:', error);
        setActiveMenuItem('contacts');
        window.history.replaceState({}, '', '/app/contacts');
        return;
      }
    }

    if (cleanPath.startsWith('/organizations/')) {
      const orgId = cleanPath.split('/')[2];
      try {
        const response = await apiAxios.post("/api/method/frappe.client.get", {
          doctype: "CRM Organization",
          name: orgId,
        });

        if (response.data.message) {
          const org = { ...response.data.message, id: response.data.message.name };
          setSelectedOrganization(org);
          setActiveMenuItem('organizations');
          setIsInDetailView(true);
          return;
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        setActiveMenuItem('organizations');
        window.history.replaceState({}, '', '/app/organizations');
        return;
      }
    }

    if (cleanPath.startsWith('/users/')) {
      const userId = cleanPath.split('/')[2];
      try {
        const response = await apiAxios.post("/api/method/frappe.client.get", {
          doctype: "User",
          name: userId,
        });

        if (response.data.message) {
          const user = { ...response.data.message, id: response.data.message.name };
          setSelectedUser(user);
          setActiveMenuItem('users');
          setIsInDetailView(true);
          return;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setActiveMenuItem('users');
        window.history.replaceState({}, '', '/app/users');
        return;
      }
    }

    // Handle list views
    if (cleanPath === '/' || cleanPath === '/dashboard' || cleanPath === '') {
      setActiveMenuItem('dashboard');
      setIsInDetailView(false);
    } else {
      const menuItem = cleanPath.split('/')[1];
      if (menuItem && [
        'leads', 'deals', 'contacts', 'organizations', 'users',
        'reminders', 'todos', 'notifications', 'notes',
        'tasks', 'call-logs', 'email-templates'
      ].includes(menuItem)) {
        setActiveMenuItem(menuItem);
        setIsInDetailView(false);
      } else {
        setActiveMenuItem('dashboard');
        setIsInDetailView(false);
        window.history.replaceState({}, '', '/app/');
      }
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    let path = '/app/';

    if (selectedLead) {
      path = `/app/leads/${selectedLead.id}`;
    } else if (selectedDeal) {
      path = `/app/deals/${selectedDeal.id}`;
    } else if (selectedContact) {
      path = `/app/contacts/${selectedContact.id}`;
    } else if (selectedOrganization) {
      path = `/app/organizations/${selectedOrganization.id}`;
    } else if (selectedUser) {
      path = `/app/users/${selectedUser.id}`;
    } else if (activeMenuItem !== 'dashboard') {
      path = `/app/${activeMenuItem}`;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, [activeMenuItem, selectedLead, selectedDeal, selectedContact, selectedOrganization, selectedUser, isLoggedIn]);

  // Handle browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      if (!isLoggedIn) return;

      const path = window.location.pathname;

      // Handle lead detail view
      if (path.startsWith('/leads/')) {
        const leadId = path.split('/')[2];
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
          setSelectedLead(lead);
          setActiveMenuItem('leads');
          setIsInDetailView(true);
          return;
        }
      }

      // Handle deal detail view
      if (path.startsWith('/deals/')) {
        const dealId = path.split('/')[2];
        const deal = sampleDeals.find(d => d.id === dealId);
        if (deal) {
          setSelectedDeal(deal);
          setActiveMenuItem('deals');
          setIsInDetailView(true);
          return;
        }
      }

      // Handle contact detail view
      if (path.startsWith('/contacts/')) {
        const contactId = path.split('/')[2];
        const contact = sampleContacts.find(c => c.id === contactId);
        if (contact) {
          setSelectedContact(contact);
          setActiveMenuItem('contacts');
          setIsInDetailView(true);
          return;
        }
      }

      // Handle organization detail view
      if (path.startsWith('/organizations/')) {
        const orgId = path.split('/')[2];
        const org = sampleOrganizations.find(o => o.id === orgId);
        if (org) {
          setSelectedOrganization(org);
          setActiveMenuItem('organizations');
          setIsInDetailView(true);
          return;
        }
      }

      // Handle user detail view
      if (path.startsWith('/users/')) {
        const userId = path.split('/')[2];
        // You might want to fetch user data here
        setActiveMenuItem('users');
        setIsInDetailView(true);
        return;
      }

      // Handle list views
      if (path === '/' || path === '/dashboard') {
        setActiveMenuItem('dashboard');
        setIsInDetailView(false);
      } else {
        const menuItem = path.split('/')[1];
        if (menuItem && [
          'leads', 'deals', 'contacts', 'organizations', 'users',
          'reminders', 'todos', 'notifications', 'notes',
          'tasks', 'call-logs', 'email-templates'
        ].includes(menuItem)) {
          setActiveMenuItem(menuItem);
          setIsInDetailView(false);
        }
      }

      // Clear any detail views
      setSelectedLead(null);
      setSelectedDeal(null);
      setSelectedContact(null);
      setSelectedOrganization(null);
      setSelectedUser(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [leads, isLoggedIn]);

  const handleLogin = () => {
    initializeStateFromUrl();
    setIsLoggedIn(true);
  };

  useEffect(() => {
    registerLogoutCallback(handleLogout);
    registerAuthModalCallback((show, message) => {
      console.log(`[Debug] Callback received. Setting showAuthErrorModal to: ${show}`);
      setShowAuthErrorModal(show);
      if (message) setAuthErrorMessage(message);
    });
  }, []);

  const handleLogout = () => {
    clearUserSession();
    setIsLoggedIn(false);
    setActiveMenuItem('dashboard');
    setSelectedLead(null);
    setSelectedDeal(null);
    setSelectedContact(null);
    setSelectedOrganization(null);
    setSelectedUser(null);
    setIsInNestedView(false);
    setIsInDetailView(false);
    setShowAuthErrorModal(false);
    window.history.pushState({}, '', '/');
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item);
    setSearchTerm('');
    setSelectedLead(null);
    setSelectedDeal(null);
    setSelectedContact(null);
    setSelectedOrganization(null);
    setSelectedUser(null);
    setIsInNestedView(false);
    setIsInDetailView(false);

    // Update URL
    const path = item === 'dashboard' ? '/' : `/${item}`;
    window.history.pushState({}, '', path);

    if (item === 'notifications') {
      setShowNotifications(true);
    }
  };

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
    setIsInNestedView(false);
    setIsInDetailView(true);
    window.history.pushState({}, '', `/leads/${lead.id}`);
  };

  const handleDealClick = (deal: any) => {
    setSelectedDeal(deal);
    setIsInNestedView(false);
    setIsInDetailView(true);
    window.history.pushState({}, '', `/deals/${deal.id}`);
  };

  const handleContactClick = (contact: any) => {
    setSelectedContact(contact);
    setIsInNestedView(false);
    setIsInDetailView(true);
    window.history.pushState({}, '', `/contacts/${contact.id}`);
  };

  const handleOrganizationClick = (organization: any) => {
    setSelectedOrganization(organization);
    setIsInNestedView(false);
    setIsInDetailView(true);
    window.history.pushState({}, '', `/organizations/${organization.id}`);
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsInNestedView(false);
    setIsInDetailView(true);
    window.history.pushState({}, '', `/users/${user.id}`);
  };

  const handleLeadBack = () => {
    setSelectedLead(null);
    setIsInNestedView(false);
    setIsInDetailView(false);
    window.history.pushState({}, '', '/leads');
  };

  const handleDealBack = () => {
    setSelectedDeal(null);
    setIsInNestedView(false);
    setIsInDetailView(false);
    window.history.pushState({}, '', '/deals');
  };

  const handleContactBack = () => {
    setSelectedContact(null);
    setIsInNestedView(false);
    setIsInDetailView(false);
    window.history.pushState({}, '', '/contacts');
  };

  const handleOrganizationBack = () => {
    setSelectedOrganization(null);
    setIsInNestedView(false);
    setIsInDetailView(false);
    window.history.pushState({}, '', '/organizations');
  };

  const handleUserBack = () => {
    setSelectedUser(null);
    setIsInNestedView(false);
    setIsInDetailView(false);
    window.history.pushState({}, '', '/users');
  };

  const handleDealClickFromContact = async (dealName: string) => {
    try {
      const response = await apiAxios.post("/api/method/frappe.client.get", {
        doctype: "CRM Deal",
        name: dealName,
      });

      const dealData = response.data.message;

      if (dealData) {
        const deal = {
          ...dealData,
          id: dealData.name,
          organization: dealData.organization_name || dealData.organization
        };

        setSelectedContact(null);
        setSelectedDeal(deal);
        setActiveMenuItem('deals');
        setIsInNestedView(true);
        setIsInDetailView(true);
        window.history.pushState({}, '', `/deals/${dealName}`);
      }
    } catch (error) {
      console.error("Error fetching deal details:", error);
    }
  };

  const handleLeadSave = (updatedLead: any) => {
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === updatedLead.id ? updatedLead : lead
      )
    );
    setSelectedLead(updatedLead);
  };

  const handleContactSave = (updatedContact: any) => {
    setSelectedContact(updatedContact);
  };

  const handleDealSave = (updatedDeal: any) => {
    setDeals(prevdeals =>
      prevdeals.map(deals =>
        deals.id === updatedDeal.id ? updatedDeal : deals
      )
    );
    setSelectedDeal(updatedDeal);
  };

  const handleOrganizationSave = (updatedOrganization: any) => {
    setSelectedOrganization(updatedOrganization);
  };

  const handleUserSave = (updatedUser: any) => {
    setSelectedUser(updatedUser);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleFilter = () => {
    console.log('Opening filter...');
  };

  const handleSort = () => {
    console.log('Opening sort...');
  };

  const handleColumns = () => {
    console.log('Opening column settings...');
  };

  const handleCreate = () => {
    setCreateModalType(getCreateModalType());
    setShowCreateModal(true);
  };

  const handleQuickCreate = (type: 'lead' | 'deal' | 'todo' | 'note' | 'task' | 'calllog' | 'email' | 'user') => {
    setCreateModalType(type);
    setShowCreateModal(true);
  };

  const handleCreateReminder = () => {
    setCreateModalType('reminder');
    setShowCreateModal(true);
  };

  const handleCreateTodo = () => {
    setCreateModalType('todo');
    setShowCreateModal(true);
  };

  const handleCreateNote = () => {
    setCreateModalType('note');
    setShowCreateModal(true);
  };

  const handleCreateTask = () => {
    setCreateModalType('task');
    setShowCreateModal(true);
  };

  const handleCreateCallLog = () => {
    setCreateModalType('calllog');
    setShowCreateModal(true);
  };

  const handleCreateEmail = () => {
    setCreateModalType('email');
    setShowCreateModal(true);
  };

  const handleCreateUser = () => {
    setCreateModalType('user');
    setShowCreateModal(true);
  };

  const [contactRefreshKey, setContactRefreshKey] = useState(0);
  const handleContactCreationSuccess = useCallback(() => {
    setContactRefreshKey(prevKey => prevKey + 1);
    setShowCreateModal(false); // Close the modal
  }, []);

  const handleCreateSubmit = (data: any) => {
    console.log(`${createModalType} created successfully:`, data);

    if (createModalType === 'lead' && data) {
      setShowCreateModal(false);
      setSelectedLead(data);
      setActiveMenuItem('leads');
      setIsInDetailView(true);
    } else if (createModalType === 'user' && data) {
      setShowCreateModal(false);
      console.log('User created:', data);
      setUserRefreshTrigger(prev => prev + 1);
    }
  };

  const handleCreateLead = (data: any) => {
    console.log(`${createModalType} created successfully:`, data);

    if (createModalType === 'lead' && data) {
      setShowCreateModal(false);
      setSelectedLead(data);
      setActiveMenuItem('leads');
      setIsInDetailView(true);
    }
  };

  const handleOpenRecordFromCallLogs = (doctype: string, docname: string) => {
    console.log(`Opening ${doctype}: ${docname} from call logs`);

    // Clear all selections first
    setSelectedLead(null);
    setSelectedDeal(null);
    setSelectedContact(null);
    setSelectedOrganization(null);
    setSelectedUser(null);
    setIsInNestedView(true);
    setIsInDetailView(true);

    if (doctype === 'CRM Deal') {
      // Fetch and set the deal
      fetchAndSetDeal(docname);
      setActiveMenuItem('deals');
    } else if (doctype === 'CRM Lead') {
      // Fetch and set the lead
      fetchAndSetLead(docname);
      setActiveMenuItem('leads');
    }
  };

  const handleCreateDeal = async (data: any) => {
    console.log("Deal creation response:", data);

    if (data && data.message) {
      setShowCreateModal(false);
      const newDealId = data.message;

      if (!newDealId) {
        console.error("Deal name/ID was not found in the creation response.");
        return;
      }

      try {
        const response = await apiAxios.post("/api/method/frappe.client.get", {
          doctype: "CRM Deal",
          name: newDealId,
        });

        const fullDealData = response.data.message;

        if (fullDealData) {
          const dealForState = {
            ...fullDealData,
            id: fullDealData.name,
            organization: fullDealData.organization_name || fullDealData.organization
          };

          setSelectedDeal(dealForState);
          setActiveMenuItem("deals");
          setIsInDetailView(true);
        } else {
          throw new Error("Failed to fetch full deal data after creation.");
        }
      } catch (err) {
        console.error("Error fetching full deal details:", err);
        setActiveMenuItem("deals");
        setIsInDetailView(true);
      }
    }
  };

  const handleConversionSuccess = async (dealId: string) => {
    try {
      const response = await apiAxios.post("/api/method/frappe.client.get", {
        doctype: "CRM Deal",
        name: dealId,
      });

      const fullDealData = response.data.message;

      if (fullDealData) {
        setSelectedDeal({ ...fullDealData, id: fullDealData.name });
        setActiveMenuItem('deals');
        setIsInDetailView(true);
        setSelectedLead(null);
      } else {
        throw new Error("Could not fetch details for the new deal.");
      }
    } catch (error) {
      console.error("Failed to fetch new deal details:", error);
      setActiveMenuItem('deals');
      setIsInDetailView(true);
      setSelectedLead(null);
    }
  };

  const getCreateModalType = (): 'lead' | 'deal' | 'contact' | 'organization' | 'reminder' | 'todo' | 'note' | 'task' | 'calllog' | 'email' | 'user' => {
    switch (activeMenuItem) {
      case 'leads':
        return 'lead';
      case 'deals':
        return 'deal';
      case 'contacts':
        return 'contact';
      case 'organizations':
        return 'organization';
      case 'users':
        return 'user';
      case 'reminders':
        return 'reminder';
      case 'todos':
        return 'todo';
      case 'notes':
        return 'note';
      case 'tasks':
        return 'task';
      case 'call-logs':
        return 'calllog';
      case 'email-templates':
        return 'email';
      default:
        return 'lead';
    }
  };

  const getPageTitle = () => {
    switch (activeMenuItem) {
      case 'dashboard':
        return 'Dashboard';
      case 'leads':
        return 'Leads';
      case 'deals':
        return 'Deals';
      case 'contacts':
        return 'Contacts';
      case 'organizations':
        return 'Organizations';
      case 'users':
        return 'Users';
      case 'reminders':
        return 'Reminders';
      case 'todos':
        return 'TODOs';
      case 'notifications':
        return 'Notifications';
      case 'notes':
        return 'Notes';
      case 'tasks':
        return 'Tasks';
      case 'call-logs':
        return 'Call Logs';
      case 'email-templates':
        return 'Email Templates';
      default:
        return 'Dashboard';
    }
  };

  const getSubtitle = () => {
    if (['leads', 'deals', 'contacts', 'organizations', 'users', 'reminders'].includes(activeMenuItem)) {
      return 'List';
    }
    return undefined;
  };

  // Updated header visibility logic
  const showHeader = !isInDetailView &&
    activeMenuItem !== 'dashboard' &&
    !selectedLead &&
    !selectedDeal &&
    !selectedContact &&
    !selectedOrganization &&
    !selectedUser &&
    !isInNestedView;

  const renderContent = () => {
    if (selectedLead && activeMenuItem === 'leads') {
      return (
        <LeadDetailView
          lead={selectedLead}
          onBack={handleLeadBack}
          onSave={handleLeadSave}
          onConversionSuccess={handleConversionSuccess}
        />
      );
    }

    if (selectedDeal && activeMenuItem === 'deals') {
      return (
        <DealDetailView
          deal={selectedDeal}
          onBack={handleDealBack}
          onSave={handleDealSave}
        />
      );
    }

    if (selectedUser && activeMenuItem === 'users') {
      return (
        <UserDetailView
          user={selectedUser}
          onBack={handleUserBack}
          onSave={handleUserSave}
        />
      );
    }

    if (selectedContact && activeMenuItem === 'contacts') {
      return (
        <ContactDetailView
          contact={selectedContact}
          onBack={handleContactBack}
          onSave={handleContactSave}
          onDealClick={handleDealClickFromContact}
        />
      );
    }

    if (selectedOrganization && activeMenuItem === 'organizations') {
      return (
        <OrganizationDetailView
          organization={selectedOrganization}
          onBack={handleOrganizationBack}
          onSave={handleOrganizationSave}
        />
      );
    }

    switch (activeMenuItem) {
      case 'dashboard':
        return <Dashboard onMenuToggle={handleSidebarToggle} />;
      case 'leads':
        return (
          <div className="p-4 sm:p-6">
            <DataTable
              searchTerm={searchTerm}
              onLeadClick={handleLeadClick}
            />
          </div>
        );
      case 'deals':
        return (
          <div className="p-4 sm:p-6">
            <DealsTable
              searchTerm={searchTerm}
              onDealClick={handleDealClick}
            />
          </div>
        );
      case 'contacts':
        return (
          <div className="p-4 sm:p-6">
            <ContactsTable searchTerm={searchTerm} onContactClick={handleContactClick} key={contactRefreshKey} />
          </div>
        );
      case 'organizations':
        return (
          <div className="p-4 sm:p-6">
            <OrganizationsTable
              searchTerm={searchTerm}
              onOrganizationClick={handleOrganizationClick}
            />
          </div>
        );
      case 'users':
        return <UsersPage onMenuToggle={handleSidebarToggle} onUserClick={handleUserClick} refreshTrigger={userRefreshTrigger} searchTerm={searchTerm} />;
      case 'reminders':
        return <RemindersPage onCreateReminder={handleCreateReminder} />;
      case 'todos':
        return <TodosPageNew onCreateTodo={handleCreateTodo} />;
      case 'notifications':
        return <NotificationsPageNew onMenuToggle={handleSidebarToggle} />;
      case 'notes':
        return (
          <NotesPage
            onCreateNote={handleCreateNote}
            leadName={selectedLead?.name}
            onMenuToggle={handleSidebarToggle}
            refreshTrigger={noteRefreshTrigger}
            searchTerm={searchTerm}
            onNavigateToDeal={(dealName) => handleOpenRecordFromNotes('CRM Deal', dealName)}
            onNavigateToLead={(leadName) => handleOpenRecordFromNotes('CRM Lead', leadName)}
          />
        );
      case 'tasks':
        return <TasksPage onCreateTask={handleCreateTask} leadName={selectedLead?.name} refreshTrigger={taskRefreshTrigger} onMenuToggle={handleSidebarToggle} searchTerm={searchTerm} />;
      case 'call-logs':
        return (
          <CallLogsPage
            onCreateCallLog={handleCreateCallLog}
            leadName={selectedLead?.name}
            refreshTrigger={callsRefreshTrigger}
            onMenuToggle={handleSidebarToggle}
            searchTerm={searchTerm}
            onNavigateToDeal={(dealName) => handleOpenRecordFromCallLogs('CRM Deal', dealName)}
            onNavigateToLead={(leadName) => handleOpenRecordFromCallLogs('CRM Lead', leadName)}
          />
        );
      case 'email-templates':
        return <EmailPage onCreateEmail={handleCreateEmail} />;
      default:
        return (
          <div className="p-4 sm:p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {getPageTitle()}
              </h2>
              <p className="text-gray-500">
                This section is under development. Content will be added soon.
              </p>
            </div>
          </div>
        );
    }
  };

  const renderCreateModal = () => {
    switch (createModalType) {
      case 'lead':
        return (
          <CreateLeadModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateLead}
          />
        );
      case 'deal':
        return (
          <CreateDealModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateDeal}
          />
        );
      case 'contact':
        return (
          <CreateContactModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
            onSuccess={handleContactCreationSuccess}
          />
        );
      case 'organization':
        return (
          <CreateOrganizationModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
          />
        );
      case 'user':
        return (
          <CreateUserModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
          />
        );
      case 'reminder':
        return (
          <CreateReminderModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
          />
        );
      case 'todo':
        return (
          <CreateTodoModalNew
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
          />
        );
      case 'note':
        return (
          <CreateNoteModalNew
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
            leadName={selectedLead?.name}
            onNoteCreated={handleNoteCreated}
          />
        );
      case 'task':
        return (
          <CreateTaskModalNew
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
            leadName={selectedLead?.name}
            onSuccess={handleTaskCreated}
          />
        );
      case 'calllog':
        return (
          <CreateCallLogModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
            leadName={selectedLead?.name}
            onSuccess={handleCallsCreated}
          />
        );
      case 'email':
        return (
          <CreateEmailModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
          />
        );
      default:
        return null;
    }
  };

  // Show loading screen while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-[100vh] flex bg-gray-50 dark:bg-gradient-to-br dark:from-[#0F0F23] dark:via-[#1A1A2E] dark:to-[#16213E]">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {showHeader && ['leads', 'deals', 'contacts', 'notes', 'users', 'tasks', 'call-logs', 'organizations'].includes(activeMenuItem) && (
          <Header
            title={getPageTitle()}
            subtitle={getSubtitle()}
            onRefresh={handleRefresh}
            onFilter={handleFilter}
            onSort={handleSort}
            onColumns={handleColumns}
            onCreate={handleCreate}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onMenuToggle={handleSidebarToggle}
          />
        )}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      {renderCreateModal()}

      <AuthErrorModal
        isOpen={showAuthErrorModal}
        onClose={() => setShowAuthErrorModal(false)}
        onLogout={handleLogout}
        message={authErrorMessage}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTab={initialSettingsTab} // <-- Pass the initial tab
      />

      {showExpiryPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-[#1E1E2F] p-10 rounded-xl shadow-2xl max-w-md w-full text-center border border-gray-300 dark:border-gray-600">

            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Your Subscription Has Expired
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Your package ended on <strong>{companyInfo?.end_date}</strong>.<br />
              Please upgrade to continue using CRM.
            </p>

            <button
              onClick={handleUpgradeNowClick}
              // onClick={() =>window.location.href = "https://crm.erpnext.ai/#our-pricing"}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* /> */}
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId='340526796460-ejl46ghv0ret26cfdltc82l9hf0ag62b.apps.googleusercontent.com'>
      <ThemeProvider>
        <Router basename="/app">
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/update-password" element={<AccountActivationPage />} />
            <Route path="/reset-password" element={<PasswordResetPage />} />
            <Route path="/ForgotPassword" element={<ForgotPasswordPage />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;