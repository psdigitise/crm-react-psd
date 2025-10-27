import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "./ThemeProvider";
import { showToast } from "../utils/toast";
import { Loader2, Bell, Menu } from "lucide-react";
import { api } from "../api/apiService";
import { getUserSession } from "../utils/session";

interface Notification {
  name: string;
  creation: string;
  modified: string;
  message: string;
  read?: boolean;
}

interface NotificationsPageProps {
  onMenuToggle: () => void;
}

export function NotificationsPageNew({ onMenuToggle }: NotificationsPageProps) {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    const userSession = getUserSession();
    const Company = userSession?.company;

    try {
      setLoading(true);
      setError(null);

      const result = await api.get('api/v2/document/CRM Notification', {
        fields: JSON.stringify(["name", "creation", "modified", "message", "read"]),
        filters: JSON.stringify({
          company: Company,
          read: 1
        }),
      });

      setNotifications(result.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch notifications"
      );
      showToast("Failed to fetch notifications", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`api/v2/document/CRM Notification/${notificationId}`, {
        read: 1
      });
      
      // Update local state to reflect the read status
      setNotifications(prev => prev.map(notif => 
        notif.name === notificationId ? { ...notif, read: true } : notif
      ));
      
      showToast("Notification marked as read", { type: "success" });
      
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showToast("Failed to mark notification as read", { type: "error" });
    }
  };

  // Mark all notifications as read when component mounts
  useEffect(() => {
    const markAllAsRead = async () => {
      const userSession = getUserSession();
      const Company = userSession?.company;
      
      try {
        // Directly update all unread notifications for this company
        await api.patch('api/v2/document/CRM Notification', {
          data: { read: 1 },
          filters: JSON.stringify({
            company: Company,
            read: 0 // Only mark unread ones as read
          })
        });
        
        // Update local state to mark all as read
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    };

    // Only run once when component mounts
    markAllAsRead();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.name);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Unknown time";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInHours < 48) return "1 day ago";
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;

      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayNotifications: Notification[] = [];
    const yesterdayNotifications: Notification[] = [];
    const olderNotifications: Notification[] = [];

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.creation);

      if (notificationDate.toDateString() === today.toDateString()) {
        todayNotifications.push(notification);
      } else if (notificationDate.toDateString() === yesterday.toDateString()) {
        yesterdayNotifications.push(notification);
      } else {
        olderNotifications.push(notification);
      }
    });

    return { todayNotifications, yesterdayNotifications, olderNotifications };
  };

  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => (
    <div
      className={`${theme === "dark"
        ? "bg-custom-gradient border-0 rounded-none"
        : "bg-white/80 border-gray-100"
        } rounded-lg p-4 mb-4 shadow-sm border backdrop-blur-md hover:shadow-md transition-all ${!notification.read ? "border-l-4 border-l-blue-500" : ""
        }`}
      onClick={() => handleNotificationClick(notification)}
      style={{ cursor: "pointer" }}
    >
      <div
        className={`p-2 ${theme === "dark" ? "bg-transparent" : "bg-white"
          } rounded-lg mb-3`}
      >
        <div className="flex items-center justify-between gap-5">
          <div className="w-full">
            <h3
              className={`text-lg font-semibold pb-2 mb-3 border-b w-full ${theme === "dark" ? "text-white" : "text-gray-900"
                }`}
            >
              <Bell
                className={`w-5 h-5 mr-2 inline-block ${theme === "dark" ? "text-white" : "text-blue-600"
                  }`}
              />
              Notification
              {!notification.read && (
                <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </h3>
            <p
              className={`text-base font-semibold ps-5 leading-relaxed ${theme === "dark" ? "text-white" : "text-gray-700"
                }`}
            >
              {notification.message}
            </p>

            {notification.modified !== notification.creation && (
              <div
                className={`text-sm ps-5 mt-2  ${theme === "dark"
                  ? "text-white border-purple-500/30"
                  : "text-gray-600 border-gray-200"
                  }`}
              >
                Modified: {formatDate(notification.modified)}
              </div>
            )}
          </div>

          <p
            className={`text-sm w-[100px] self-end ${theme === "dark" ? "text-white" : "text-gray-500"
              }`}
          >
            {formatDate(notification.creation)}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        className={`p-4 sm:p-6 min-h-screen w-full ${theme === "dark"
          ? "bg-gradient-to-b from-[#1E1A2B] to-[#191428]"
          : "bg-gray-100"
          }`}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2
            className={`w-8 h-8 animate-spin mr-3 ${theme === "dark" ? "text-purple-500" : "text-blue-600"
              }`}
          />
          <span className={theme === "dark" ? "text-white" : "text-gray-600"}>
            Loading notifications...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 sm:p-6 min-h-screen w-full ${theme === "dark"
          ? "bg-gradient-to-b from-[#1E1A2B] to-[#191428]"
          : "bg-gray-100"
          }`}
      >
        <div className="text-center py-12">
          <div
            className={`mb-2 ${theme === "dark" ? "text-red-400" : "text-red-600"
              }`}
          >
            Error loading notifications
          </div>
          <div
            className={`text-sm mb-4 ${theme === "dark" ? "text-white" : "text-gray-500"
              }`}
          >
            {error}
          </div>
          <button
            onClick={fetchNotifications}
            className={`px-4 py-2 rounded-lg transition-colors ${theme === "dark"
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { todayNotifications, yesterdayNotifications, olderNotifications } =
    groupNotificationsByDate(notifications);

  return (
    <div
      className={`p-4 sm:p-6 overflow-auto h-[100vh] w-full ${theme === "dark"
        ? "bg-gradient-to-b from-[#1E1A2B] to-[#191428]"
        : "bg-gray-100"
        }`}
    >
      <div className="flex">
        <div className="p-4 sm:p-6 lg:hidden">
          <button
            onClick={onMenuToggle}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
          >
            <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
          </button>
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Bell
              className={`w-8 h-8 ${theme === "dark" ? "text-purple-500" : "text-blue-600"
                }`}
            />
            <h1
              className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"
                }`}
            >
              Notifications
            </h1>
          </div>
          <p className={`${theme === "dark" ? "text-white" : "text-gray-600"}`}>
            Stay updated with your latest CRM activities
          </p>
        </div>

      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell
            className={`w-16 h-16 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
          />
          <h3
            className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"
              }`}
          >
            No Notifications
          </h3>
          <p
            className={`text-sm ${theme === "dark" ? "text-white" : "text-gray-500"
              }`}
          >
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Today Section */}
          {todayNotifications.length > 0 && (
            <div className="mb-8">
              <h2
                className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-black"
                  }`}
              >
                Today ({todayNotifications.length})
              </h2>
              <div className="space-y-4">
                {todayNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.name}
                    notification={notification}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday Section */}
          {yesterdayNotifications.length > 0 && (
            <div className="mb-8">
              <h2
                className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-black"
                  }`}
              >
                Yesterday ({yesterdayNotifications.length})
              </h2>
              <div className="space-y-4">
                {yesterdayNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.name}
                    notification={notification}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Older Section */}
          {olderNotifications.length > 0 && (
            <div>
              <h2
                className={`text-xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-black"
                  }`}
              >
                Older ({olderNotifications.length})
              </h2>
              <div className="space-y-4">
                {olderNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.name}
                    notification={notification}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}