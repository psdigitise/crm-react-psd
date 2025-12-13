import React, { useState, useEffect } from 'react';
import {
  Bell,
  Users,
  Handshake,
  User,
  Building2,
  FileText,
  CheckSquare,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  UserCheck,
  Settings
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getUserSession, clearUserSession } from '../utils/session';
import { AUTH_TOKEN } from '../api/apiUrl';
import { SettingsModal } from './SettingsModal';
import { getAuthToken } from '../api/apiUrl';
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeItem: string;
  onItemClick: (item: string) => void;
}

interface Notification {
  name: string;
  creation: string;
  modified: string;
  message: string;
  is_read?: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'notifications', label: 'Notifications', icon: Bell, hasNotifications: true },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'deals', label: 'Deals', icon: Handshake },
  { id: 'contacts', label: 'Contacts', icon: User },
  { id: 'organizations', label: 'Organizations', icon: Building2 },
  { id: 'users', label: 'Users', icon: UserCheck },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'call-logs', label: 'Call Logs', icon: Phone },
];

export function Sidebar({ isCollapsed, onToggle, activeItem, onItemClick }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [companyInfo, setCompanyInfo] = useState<{ start_date?: string, end_date?: string } | null>(null);
  const [expiryStatus, setExpiryStatus] = useState<{ expired: boolean, daysLeft: number } | null>(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const userSession = getUserSession();
  const CompanyName = userSession?.company;
  const sessionfullname = userSession?.full_name;
  const Username = userSession?.username || sessionfullname;
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'profile' | 'aiUsage' | 'websiteIntegration' | 'upgradePlan'>('profile');
  const token = getAuthToken();

  const handleUpgradeNowClick = () => {
    setModalInitialTab('upgradePlan'); // Set the desired tab
    setShowSettingsModal(true);        // Open the modal
  };

  useEffect(() => {
    const session = getUserSession();
    const companyName = session?.company;
    if (!companyName) return;

    fetch(`https://api.erpnext.ai/api/v2/document/Company/${encodeURIComponent(companyName)}`, {
      headers: {
        'Authorization': token,
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

        // Calculate expiry
        if (data.end_date) {
          const today = new Date();
          const endDate = new Date(data.end_date);
          const diffTime = endDate.getTime() - today.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setExpiryStatus({
            expired: daysLeft < 0,
            daysLeft
          });
        }
      })
      .catch(err => {
        setCompanyInfo(null);
        setExpiryStatus(null);
      });
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      let apiUrl =
        'https://api.erpnext.ai/api/v2/document/CRM Notification?' +
        'fields=["name","creation","modified","message","read"]';

      // Build filters: unread + company filter
      const filters = [];

      if (sessionCompany) {
        filters.push(["company", "=", sessionCompany]);
      }

      // Only unread notifications
      filters.push(["read", "=", 0]);

      apiUrl += `&filters=${JSON.stringify(filters)}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      if (response.ok) {
        const result = await response.json();
        const unreadNotifications = result.data || [];

        setNotifications(unreadNotifications);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = () => {
    onItemClick('notifications');
    // Mark all notifications as read by resetting count to 0
    setUnreadCount(0);

    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleLogout = () => {
    clearUserSession();
    window.location.reload();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          ${theme === 'dark'
            ? 'bg-gradient-to-b from-dark-primary via-dark-secondary to-dark-tertiary border-purple-500/30'
            : 'bg-white border-gray-200'
          } border-r transition-all duration-300 ease-in-out flex flex-col
          ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-100'}`}>
          <div className="flex w-full items-center justify-between">
            {!isCollapsed ? (
              <div className="w-full">
                {/* Logo Area with Hover Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsLogoHovered(true)}
                  onMouseLeave={() => setIsLogoHovered(false)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {/* Logo */}
                    <img
                      src="/app/assets/images/Erpnextlogo.png"
                      alt="ERPNext Logo"
                      className={`w-[250px] h-auto transition duration-300 ${theme === "dark"
                        ? "filter invert brightness-0 saturate-100 sepia hue-rotate-[90deg] contrast-125"
                        : ""
                        }`}
                    />
                  </div>

                  {/* Company Name and Username */}
                  <div className="mb-4">
                    <h2
                      className={`text-sm font-semibold truncate ${theme === "dark"
                        ? "text-white"
                        : "text-gray-800"
                        }`}
                      title="Companyname"
                    >
                      {CompanyName || "CRM"}
                    </h2>
                    <div className="flex items-center space-x-1">
                      <p
                        className={`text-xs truncate ${theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-500"
                          }`}
                        title="full_name"
                      >
                        {sessionfullname || "Administrator"}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Menu (shown on hover) */}
                  {isLogoHovered && (
                    <div className={`absolute top-12 left-0 right-0 mt-2 rounded-lg shadow-lg z-50 ${theme === 'dark'
                      ? 'bg-gray-800 border border-purple-500/30'
                      : 'bg-white border border-gray-200'
                      }`}>
                      <div className="p-2">
                        <div className="space-y-1">
                          {/* Toggle Theme */}
                          <button
                            onClick={() => {
                              toggleTheme();
                              setIsLogoHovered(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${theme === 'dark'
                              ? 'hover:bg-purple-800/50 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                              }`}
                          >
                            {theme === 'dark' ? (
                              <Sun className="w-4 h-4" />
                            ) : (
                              <Moon className='w-4 h-4' />
                            )}
                            <span className="text-sm">Toggle theme</span>
                          </button>

                          {/* Settings */}
                          <button
                            onClick={() => {
                              setShowSettingsModal(true);
                              setIsLogoHovered(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${theme === 'dark'
                              ? 'hover:bg-purple-800/50 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                              }`}
                          >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm">Settings</span>
                          </button>

                          {/* Log out */}
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsLogoHovered(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${theme === 'dark'
                              ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300'
                              : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                              }`}
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Log out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Collapsed Logo/Company Icon
              <div className="flex items-center justify-center w-full">
                <img
                  src="/app/assets/images/Erpnextlogo.png"
                  alt="ERPNext Logo"
                  className={`w-8 h-8 transition duration-300 ${theme === "dark"
                    ? "filter invert brightness-0 saturate-100 sepia hue-rotate-[90deg] contrast-125"
                    : ""
                    }`}
                />
              </div>
            )}

            <div className="flex items-center">
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                  }`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className='w-4 h-4 text-gray-600' />
                )}
              </button>

              {/* Collapse Toggle */}
              <button
                onClick={onToggle}
                className={`p-1.5 rounded-lg transition-colors lg:block ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                  }`}
              >
                {isCollapsed ? (
                  <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                ) : (
                  <ChevronLeft className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-600'} lg:block hidden`} />
                )}
                <X className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-600'} lg:hidden block`} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              const showNotificationBadge = item.hasNotifications && unreadCount > 0;

              return (
                <li key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      if (item.id === 'notifications') {
                        handleNotificationClick();
                      } else {
                        onItemClick(item.id);
                        // Close sidebar on mobile after selection
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }
                    }}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-start space-x-3 px-3'} py-2.5 my-2 rounded-lg transition-all duration-200 relative ${isActive
                      ? theme === 'dark'
                        ? 'bg-[#ffffff7a] text-purple-300 border border-0'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                      : theme === 'dark'
                        ? 'text-white hover:bg-white-31 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${isActive
                        ? theme === 'dark' ? 'text-white' : 'text-blue-600'
                        : theme === 'dark'
                          ? 'text-white group-hover:text-white'
                          : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                    />
                    {!isCollapsed && (
                      <span className={`text-sm font-medium truncate ${theme === "dark" ? "text-white" : ""}`}>
                        {item.label}
                      </span>
                    )}

                    {/* Notification Badge - Shows actual count from data */}
                    {showNotificationBadge && !isCollapsed && (
                      <span className="absolute top-2.5 right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}

                    {/* Notification Badge for collapsed state */}
                    {showNotificationBadge && isCollapsed && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm font-semibold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap pointer-events-none">
                      {item.label}
                      {showNotificationBadge && (
                        <span className="ml-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1 min-w-[20px] inline-block text-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>


        {!isCollapsed && companyInfo && (
          <div style={{ fontFamily: 'Inter, sans-serif' }}>
            {expiryStatus && (
              <div className={`p-3 mx-2 mb-2 rounded-lg border ${theme === 'dark'
                ? expiryStatus.expired
                  ? 'bg-red-900/20 border-red-700/50'
                  : expiryStatus.daysLeft === 0
                    ? 'bg-yellow-900/20 border-yellow-700/50'
                    : expiryStatus.daysLeft <= 7
                      ? 'bg-yellow-900/20 border-yellow-700/50'
                      : 'bg-green-900/20 border-green-700/50'
                : expiryStatus.expired
                  ? 'bg-red-50 border-red-200'
                  : expiryStatus.daysLeft === 0
                    ? 'bg-yellow-50 border-yellow-200'
                    : expiryStatus.daysLeft <= 7
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                }`}>
                <div className="flex items-start gap-2">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${expiryStatus.expired
                    ? 'bg-red-500'
                    : expiryStatus.daysLeft === 0
                      ? 'bg-yellow-500'
                      : expiryStatus.daysLeft <= 7
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}>
                    {expiryStatus.expired ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : expiryStatus.daysLeft === 0 || expiryStatus.daysLeft <= 7 ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold mb-1 ${theme === 'dark'
                      ? expiryStatus.expired
                        ? 'text-red-400'
                        : expiryStatus.daysLeft === 0
                          ? 'text-yellow-400'
                          : expiryStatus.daysLeft <= 7
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      : expiryStatus.expired
                        ? 'text-red-600'
                        : expiryStatus.daysLeft === 0
                          ? 'text-yellow-600'
                          : expiryStatus.daysLeft <= 7
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}>
                      {expiryStatus.expired ? (
                        'PACK EXPIRED'
                      ) : expiryStatus.daysLeft === 0 ? (
                        'EXPIRING TODAY'
                      ) : expiryStatus.daysLeft <= 7 ? (
                        `EXPIRING IN ${expiryStatus.daysLeft} DAY${expiryStatus.daysLeft === 1 ? '' : 'S'}`
                      ) : (
                        `EXPIRES IN ${expiryStatus.daysLeft} DAY${expiryStatus.daysLeft === 1 ? '' : 'S'}`
                      )}
                    </div>

                    {expiryStatus.expired ? (
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Please renew your subscription
                      </div>
                    ) : expiryStatus.daysLeft === 0 ? (
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Your subscription ends today
                      </div>
                    ) : expiryStatus.daysLeft <= 7 ? (
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Your subscription is ending soon
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Subscription is active
                      </div>
                    )}

                    <button
                      onClick={handleUpgradeNowClick}
                      className={`
      w-full inline-flex items-center justify-center
      px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 mt-4
      ${theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        }
    `}
                    >
                      Upgrade Now
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Simplified Company Expiry Status for collapsed sidebar */}
        {isCollapsed && companyInfo && expiryStatus && (
          <div className="relative group mb-2">
            <div className="flex items-center justify-center p-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${expiryStatus.expired
                ? 'bg-red-500'
                : expiryStatus.daysLeft <= 7
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
                }`}>
                {expiryStatus.expired ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : expiryStatus.daysLeft <= 7 ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Tooltip for collapsed state */}
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-semibold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap pointer-events-none min-w-[180px]">
              <div className={`text-xs font-semibold mb-1 ${expiryStatus.expired
                ? 'text-red-300'
                : expiryStatus.daysLeft <= 7
                  ? 'text-yellow-300'
                  : 'text-green-300'
                }`}>
                {expiryStatus.expired ? (
                  'PACK EXPIRED'
                ) : expiryStatus.daysLeft <= 7 ? (
                  `EXPIRING IN ${expiryStatus.daysLeft} DAY${expiryStatus.daysLeft === 1 ? '' : 'S'}`
                ) : (
                  `EXPIRES IN ${expiryStatus.daysLeft} DAY${expiryStatus.daysLeft === 1 ? '' : 'S'}`
                )}
              </div>

              <div className="text-xs text-gray-300">
                {expiryStatus.expired ? (
                  'Please renew your subscription'
                ) : expiryStatus.daysLeft <= 7 ? (
                  'Your subscription is ending soon'
                ) : (
                  'Subscription is active'
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Info & Logout */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-100'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex ${isCollapsed ? 'justify-center' : 'justify-start space-x-3'} px-3 py-2.5 rounded-lg transition-all duration-200 ${theme === 'dark'
              ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
              }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTab={modalInitialTab} // Pass the state variable here
      />
    </>
  );
}