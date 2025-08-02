import React from 'react';

interface Notification {
  id: string;
  sender: string;
  message: string;
  time: string;
}

const todayNotifications: Notification[] = [
  {
    id: '1',
    sender: 'Matt D. Smith',
    message: 'This is a test message. Use this for a demo notification on your app designs.',
    time: '2 hours ago'
  },
  {
    id: '2',
    sender: 'Matt D. Smith',
    message: 'This is a test message. Use this for a demo notification on your app designs.',
    time: '3 hours ago'
  },
  {
    id: '3',
    sender: 'Matt D. Smith',
    message: 'This is a test message. Use this for a demo notification on your app designs.',
    time: '4 hours ago'
  },
  {
    id: '4',
    sender: 'Matt D. Smith',
    message: 'This is a test message. Use this for a demo notification on your app designs.',
    time: '5 hours ago'
  }
];

const yesterdayNotifications: Notification[] = [
  {
    id: '5',
    sender: 'Matt D. Smith',
    message: 'This is a test message. Use this for a demo notification on your app designs.',
    time: 'Yesterday'
  }
];

export function NotificationsPage() {
  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
      <div className="bg-gray-200 rounded-lg px-3 py-2 mb-3">
        <h3 className="font-semibold text-gray-900">{notification.sender}</h3>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{notification.message}</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen max-w-4xl mx-auto">
      {/* Today Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">Today</h2>
        <div className="space-y-4">
          {todayNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>

      {/* Yesterday Section */}
      <div>
        <h2 className="text-2xl font-bold text-purple-600 mb-6">Yesterday</h2>
        <div className="space-y-4">
          {yesterdayNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    </div>
  );
}