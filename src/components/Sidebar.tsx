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
  Clock,
  ListTodo,
  Moon,
  Sun,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getUserSession, clearUserSession } from '../utils/session';
import { AUTH_TOKEN } from '../api/apiUrl';

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
  const userSession = getUserSession();
  const CompanyName = userSession?.company || "Administrator";
  const Username = userSession?.username || "Administrator";

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

      let apiUrl = 'https://api.erpnext.ai/api/v2/document/CRM Notification?fields=["name","creation","modified","message"]';

      // Add company filter if company exists in session
      if (sessionCompany) {
        apiUrl += `&filters=[["company","=","${sessionCompany}"]]`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        }
      });

      if (response.ok) {
        const result = await response.json();
        const newNotifications = result.data || [];

        // Set the unread count to the actual number of notifications
        const totalNotifications = newNotifications.length;
        setNotifications(newNotifications);
        setUnreadCount(totalNotifications);
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
            {!isCollapsed && (
              <div className="w-full items-center space-x-3">
                <img
                  src="../../public/assets/images/Erpnextlogo.png"
                  alt="ERPNext Logo"
                  className={`w-[250px] h-auto transition duration-300 ${theme === "dark"
                    ? "filter invert brightness-0 saturate-100 sepia hue-rotate-[90deg] contrast-125"
                    : ""
                    }`}
                />

                <div className="mt-2">
                  <h2
                    className={`text-sm font-semibold truncate max-w-[180px] ${theme === "dark"
                      ? "text-white"
                      : "text-gray-800"
                      }`}
                    title="Companyname"
                  >
                    {CompanyName}
                  </h2>
                  <p
                    className={`text-xs truncate max-w-[180px] ${theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-500"
                      }`}
                    title="username"
                  >
                    {Username}
                  </p>
                </div>
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
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 my-2 rounded-lg transition-all duration-200 relative ${isActive
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
                    {showNotificationBadge && (
                      <span className="absolute top-2.5 right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
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

        {/* Expiry Status */}
        <div>
          {companyInfo && (
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              {expiryStatus && (
                <div className={`mt-2 text-sm font-semibold flex items-center justify-center gap-2
                  ${expiryStatus.expired
                    ? 'text-white bg-red-500/20'
                    : expiryStatus.daysLeft <= 7
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {expiryStatus.expired ? (
                    <>
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      PACK Expired
                    </>
                  ) : (
                    <>
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      {expiryStatus.daysLeft <= 7
                        ? `Expiring in ${expiryStatus.daysLeft} day${expiryStatus.daysLeft === 1 ? '' : 's'}`
                        : `Expires in ${expiryStatus.daysLeft} day${expiryStatus.daysLeft === 1 ? '' : 's'}`}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-100'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${theme === 'dark'
              ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
              }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}