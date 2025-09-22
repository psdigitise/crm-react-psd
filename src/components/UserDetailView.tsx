import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Mail, User, Building2, Calendar, Shield, FileText, MessageSquare, CheckSquare, Send, Activity } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

interface User {
  name: string;
  email: string;
  first_name: string;
  last_name?: string;
  full_name?: string;
  creation?: string;
  modified?: string;
  company?: string;
  role_profile_name?: string;
}

interface UserDetailViewProps {
  user: User;
  onBack: () => void;
  onSave: (updatedUser: User) => void;
}

type TabType = 'overview' | 'activity' | 'notes' | 'calls' | 'comments' | 'tasks' | 'emails';

export function UserDetailView({ user, onBack, onSave }: UserDetailViewProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(user);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User, count: null },
    // { id: 'activity', label: 'Activity', icon: Activity, count: 0 },
    // { id: 'notes', label: 'Notes', icon: FileText, count: 0 },
    // { id: 'calls', label: 'Calls', icon: MessageSquare, count: 0 },
    // { id: 'comments', label: 'Comments', icon: MessageSquare, count: 0 },
    // { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: 0 },
    // { id: 'emails', label: 'Emails', icon: Send, count: 0 }
  ];

  const handleSave = async () => {
    try {
      setLoading(true);

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/User/${user.name}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd'
        },
        body: JSON.stringify({
          first_name: editedUser.first_name,
          last_name: editedUser.last_name,
          email: editedUser.email
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('User updated successfully', { type: 'success' });
      onSave(editedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Failed to update user', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/User/${encodeURIComponent(user.email)}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: user.email }) // 👈 sometimes needed
      });


      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('User deleted successfully', { type: 'success' });
      onBack();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };



  const handleInputChange = (field: keyof User, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return dateString;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-white/80 border-gray-300'
                    }`}
                />
              ) : (
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.first_name || 'N/A'}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-white/80 border-gray-300'
                    }`}
                />
              ) : (
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.last_name || 'N/A'}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'bg-white/80 border-gray-300'
                    }`}
                />
              ) : (
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.email}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Full Name
              </label>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Company
              </label>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {user.company || 'N/A'}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Role
              </label>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {user.role_profile_name || 'N/A'}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Created
              </label>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(user.creation)}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Last Modified
              </label>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(user.modified)}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Activity className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`} />
            <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Data Found</h3>
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
              Information will appear here when available.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark'
      ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
      : 'bg-gray-50'
      }`}>
      {/* Header */}
      <div className={`border-b px-4 sm:px-6 py-4 backdrop-blur-md ${theme === 'dark'
        ? 'bg-gradient-to-r from-dark-secondary/80 to-dark-tertiary/80 border-purple-500/30'
        : 'bg-white/80 border-gray-200'
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                }`}
            >
              <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
            </button>
            <div>
              <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Users / {user.full_name || user.first_name || user.email}
              </h1>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-purplebg/80 text-white hover:bg-purple-700/80'
                    : 'bg-gray-900/80 text-white hover:bg-gray-800/80'
                    }`}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/80 transition-colors flex items-center space-x-2 disabled:opacity-50 backdrop-blur-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`px-4 py-2 rounded-lg transition-colors backdrop-blur-sm ${theme === 'dark'
                    ? 'border border-purple-500/30 text-white hover:bg-purple-800/50'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50/80'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-purplebg/80 text-white hover:bg-purple-700/80'
                    : 'bg-blue-600/80 text-white hover:bg-blue-700/80'
                    }`}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b backdrop-blur-md ${theme === 'dark'
        ? 'bg-gradient-to-r from-dark-secondary/80 to-dark-tertiary/80 border-purple-500/30'
        : 'bg-white/80 border-gray-200'
        }`}>
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${isActive
                    ? theme === 'dark'
                      ? 'border-purple-400 text-purple-400'
                      : 'border-blue-500 text-blue-600'
                    : theme === 'dark'
                      ? 'border-transparent text-white hover:text-white hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${isActive
                      ? theme === 'dark'
                        ? 'bg-purplebg text-white'
                        : 'bg-blue-100 text-blue-600'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}


          {/* Sidebar */}
          <div className="space-y-6 h-full">
            {/* User Information */}
            <div className={`rounded-lg shadow-sm border p-6 backdrop-blur-md h-full ${theme === 'dark'
              ? 'bg-white border-white'
              : 'bg-white/80 border-gray-200'
              }`}>
              <div className='flex items-center gap-3 flex-wrap mb-4'>
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
                    }`}>
                    <User className={`w-10 h-10 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                      }`} />
                  </div>
                </div>

                <div className="text-start mb-6">
                  <h3 className={`text-2xl font-semibold mb-1 ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>
                    {user.full_name || user.first_name || user.email}
                  </h3>
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-black' : 'text-gray-500'}`}>
                    {user.role_profile_name || 'User'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className={`w-5 h-5 ${theme === 'dark' ? 'text-black' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-700'}`}>Email</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building2 className={`w-5 h-5 ${theme === 'dark' ? 'text-black' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-700'}`}>Company</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>{user.company || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className={`w-5 h-5 ${theme === 'dark' ? 'text-black' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-700'}`}>Role</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>{user.role_profile_name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-black' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-700'}`}>Created</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>{formatDate(user.creation)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 h-full">
            <div className={`rounded-lg shadow-sm border p-6 backdrop-blur-md h-full ${theme === 'dark'
              ? 'bg-custom-gradient border-white'
              : 'bg-white/80 border-gray-200'
              }`}>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'overview' ? 'User Details' : tabs.find(t => t.id === activeTab)?.label}
              </h2>

              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}