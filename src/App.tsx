import { useState, useEffect } from 'react';
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
import { CreateUserModal } from './components/CreateUserModal'; // Add this import
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

function AppContent() {
  // Initialize login state from session storage with proper checking
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAuthErrorModal, setShowAuthErrorModal] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string>();

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
  const [createModalType, setCreateModalType] = useState<'lead' | 'deal' | 'contact' | 'organization' | 'reminder' | 'todo' | 'note' | 'task' | 'calllog' | 'email' | 'user'>('lead'); // Added 'user'
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null); // Fixed variable name
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [leads, setLeads] = useState(sampleLeads);
  const [deals, setDeals] = useState(sampleDeals);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);
  const handleTaskCreated = () => {
    setTaskRefreshTrigger(prev => prev + 1);
  };

  const [callsRefreshTrigger, setcallsRefreshTrigger] = useState(0);
  const handleCallsCreated = () => {
    setcallsRefreshTrigger(prev => prev + 1);
  };

  // Add state to track if we're in a nested view (like deal detail from contact)
  const [isInNestedView, setIsInNestedView] = useState(false);

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

  const initializeStateFromUrl = async () => {
    const path = window.location.pathname;
    const cleanPath = path.replace('/login', '');

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
          return;
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
        setActiveMenuItem('leads');
        window.history.replaceState({}, '', '/login/leads');
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
          return;
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
        setActiveMenuItem('deals');
        window.history.replaceState({}, '', '/login/deals');
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
          return;
        }
      } catch (error) {
        console.error('Error fetching contact:', error);
        setActiveMenuItem('contacts');
        window.history.replaceState({}, '', '/login/contacts');
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
          return;
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        setActiveMenuItem('organizations');
        window.history.replaceState({}, '', '/login/organizations');
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
          return;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setActiveMenuItem('users');
        window.history.replaceState({}, '', '/login/users');
        return;
      }
    }

    // Handle list views
    if (cleanPath === '/' || cleanPath === '/dashboard' || cleanPath === '') {
      setActiveMenuItem('dashboard');
    } else {
      const menuItem = cleanPath.split('/')[1];
      if (menuItem && [
        'leads', 'deals', 'contacts', 'organizations', 'users',
        'reminders', 'todos', 'notifications', 'notes',
        'tasks', 'call-logs', 'email-templates'
      ].includes(menuItem)) {
        setActiveMenuItem(menuItem);
      } else {
        setActiveMenuItem('dashboard');
        window.history.replaceState({}, '', '/login/');
      }
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    let path = '/login/';

    if (selectedLead) {
      path = `/login/leads/${selectedLead.id}`;
    } else if (selectedDeal) {
      path = `/login/deals/${selectedDeal.id}`;
    } else if (selectedContact) {
      path = `/login/contacts/${selectedContact.id}`;
    } else if (selectedOrganization) {
      path = `/login/organizations/${selectedOrganization.id}`;
    } else if (selectedUser) {
      path = `/login/users/${selectedUser.id}`;
    } else if (activeMenuItem !== 'dashboard') {
      path = `/login/${activeMenuItem}`;
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
          return;
        }
      }

      // Handle user detail view
      if (path.startsWith('/users/')) {
        const userId = path.split('/')[2];
        // You might want to fetch user data here
        setActiveMenuItem('users');
        return;
      }

      // Handle list views
      if (path === '/' || path === '/dashboard') {
        setActiveMenuItem('dashboard');
      } else {
        const menuItem = path.split('/')[1];
        if (menuItem && [
          'leads', 'deals', 'contacts', 'organizations', 'users',
          'reminders', 'todos', 'notifications', 'notes',
          'tasks', 'call-logs', 'email-templates'
        ].includes(menuItem)) {
          setActiveMenuItem(menuItem);
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
    window.history.pushState({}, '', `/leads/${lead.id}`);
  };

  const handleDealClick = (deal: any) => {
    setSelectedDeal(deal);
    setIsInNestedView(false);
    window.history.pushState({}, '', `/deals/${deal.id}`);
  };

  const handleContactClick = (contact: any) => {
    setSelectedContact(contact);
    setIsInNestedView(false);
    window.history.pushState({}, '', `/contacts/${contact.id}`);
  };

  const handleOrganizationClick = (organization: any) => {
    setSelectedOrganization(organization);
    setIsInNestedView(false);
    window.history.pushState({}, '', `/organizations/${organization.id}`);
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsInNestedView(false);
    window.history.pushState({}, '', `/users/${user.id}`);
  };

  const handleLeadBack = () => {
    setSelectedLead(null);
    setIsInNestedView(false);
    window.history.pushState({}, '', '/leads');
  };

  const handleDealBack = () => {
    setSelectedDeal(null);
    setIsInNestedView(false);
    window.history.pushState({}, '', '/deals');
  };

  const handleContactBack = () => {
    setSelectedContact(null);
    setIsInNestedView(false);
    window.history.pushState({}, '', '/contacts');
  };

  const handleOrganizationBack = () => {
    setSelectedOrganization(null);
    setIsInNestedView(false);
    window.history.pushState({}, '', '/organizations');
  };

  const handleUserBack = () => {
    setSelectedUser(null);
    setIsInNestedView(false);
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

  const handleCreateSubmit = (data: any) => {
    console.log(`${createModalType} created successfully:`, data);

    if (createModalType === 'lead' && data) {
      setShowCreateModal(false);
      setSelectedLead(data);
      setActiveMenuItem('leads');
    } else if (createModalType === 'user' && data) {
      setShowCreateModal(false);
      // You might want to refresh the users list or navigate to the new user
      console.log('User created:', data);
    }
  };

  const handleCreateLead = (data: any) => {
    console.log(`${createModalType} created successfully:`, data);

    if (createModalType === 'lead' && data) {
      setShowCreateModal(false);
      setSelectedLead(data);
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
        } else {
          throw new Error("Failed to fetch full deal data after creation.");
        }
      } catch (err) {
        console.error("Error fetching full deal details:", err);
        setActiveMenuItem("deals");
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
        setSelectedLead(null);
      } else {
        throw new Error("Could not fetch details for the new deal.");
      }
    } catch (error) {
      console.error("Failed to fetch new deal details:", error);
      setActiveMenuItem('deals');
      setSelectedLead(null);
    }
  };

  // Fixed getCreateModalType function
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
        return 'user'; // Fixed: return 'user' for users menu
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
            <ContactsTable searchTerm={searchTerm} onContactClick={handleContactClick} />
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
        return <UsersPage onMenuToggle={handleSidebarToggle} onUserClick={handleUserClick} />;
      case 'reminders':
        return <RemindersPage onCreateReminder={handleCreateReminder} />;
      case 'todos':
        return <TodosPageNew onCreateTodo={handleCreateTodo} />;
      case 'notifications':
        return <NotificationsPageNew onMenuToggle={handleSidebarToggle} />;
      case 'notes':
        return <NotesPage onCreateNote={handleCreateNote} leadName={selectedLead?.name} onMenuToggle={handleSidebarToggle} />;
      case 'tasks':
        return <TasksPage onCreateTask={handleCreateTask} leadName={selectedLead?.name} refreshTrigger={taskRefreshTrigger} onMenuToggle={handleSidebarToggle} />;
      case 'call-logs':
        return <CallLogsPage onCreateCallLog={handleCreateCallLog} leadName={selectedLead?.name} refreshTrigger={callsRefreshTrigger} onMenuToggle={handleSidebarToggle} />;
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

  // Updated header visibility logic
  const showHeader = activeMenuItem !== 'dashboard' &&
    !selectedLead &&
    !selectedDeal &&
    !selectedContact &&
    !selectedOrganization &&
    !selectedUser &&
    !isInNestedView;

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
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router basename="/login">
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/update-password" element={<AccountActivationPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route path="/ForgotPassword" element={<ForgotPasswordPage />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;