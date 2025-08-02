import React from 'react';
import { X, Bell } from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  if (!isOpen) return null;

  // return (
  //   <div className="fixed inset-0 z-50 overflow-hidden">
  //     {/* Backdrop */}
  //     <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
  //     {/* Panel */}
  //     <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
  //       {/* Header */}
  //       <div className="flex items-center justify-between p-4 border-b border-gray-200">
  //         <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
  //         <button
  //           onClick={onClose}
  //           className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
  //         >
  //           <X className="w-5 h-5 text-gray-500" />
  //         </button>
  //       </div>

  //       {/* Content */}
  //       <div className="flex-1 flex items-center justify-center p-8">
  //         <div className="text-center">
  //           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //             <Bell className="w-8 h-8 text-white" />
  //           </div>
  //           <p className="text-gray-500 text-lg">No new notifications</p>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}