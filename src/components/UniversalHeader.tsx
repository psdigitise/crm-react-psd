import React from 'react';
import { Plus, User } from 'lucide-react';

interface UniversalHeaderProps {
  onCreateLead: () => void;
  onCreateDeal: () => void;
  onCreateTodo: () => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  onNavigate: (page: string) => void;
  activeItem: string;
}

export function UniversalHeader({ 
  onCreateLead, 
  onCreateDeal, 
  onCreateTodo, 
  onCreateNote, 
  onCreateTask,
  onNavigate,
  activeItem
}: UniversalHeaderProps) {
  const quickActions = [
    { id: 'lead', label: 'Lead', onClick: onCreateLead, bgColor: 'bg-black hover:bg-gray-800' },
    { id: 'deal', label: 'Deal', onClick: onCreateDeal, bgColor: 'bg-purplebg hover:bg-purple-700' },
    { id: 'todo', label: 'TODO', onClick: onCreateTodo, bgColor: 'bg-black hover:bg-gray-800' },
    { id: 'notes', label: 'Notes', onClick: onCreateNote, bgColor: 'bg-black hover:bg-gray-800' },
    { id: 'task', label: 'Task', onClick: onCreateTask, bgColor: 'bg-black hover:bg-gray-800' },
  ];

  const navigationItems = [
    { id: 'leads', label: 'Leads' },
    { id: 'deals', label: 'Deals' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'reminders', label: 'Reminders' },
    { id: 'todos', label: 'TODOs' },
    { id: 'notes', label: 'Notes' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`${action.bgColor} text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 whitespace-nowrap text-sm font-medium`}
            >
              <Plus className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          ))}
          
          {/* More Actions Button */}
          <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">P Hari</div>
            <div className="text-xs text-gray-500">Store</div>
          </div>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Navigation Pills - Only show on certain pages */}
      {['reminders', 'todos', 'notifications'].includes(activeItem) && (
        <div className="flex items-center space-x-2 mt-3 overflow-x-auto">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeItem === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}