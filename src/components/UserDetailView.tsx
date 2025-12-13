import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Mail, User, Building2, Calendar, Shield, FileText, MessageSquare, CheckSquare, Send, Activity, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { AUTH_TOKEN } from '../api/apiUrl';
import { getUserSession } from '../utils/session';

interface Role {
  role: string;
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  parent: string;
  parentfield: string;
  parenttype: string;
  doctype: string;
}

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
  roles?: Role[];
  enabled?: number;
  owner?: string;
  modified_by?: string;
  docstatus?: number;
  idx?: number;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const session = getUserSession();
  const sessionRoleProfile = session?.role_profile;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User, count: null },
    // { id: 'activity', label: 'Activity', icon: Activity, count: 0 },
    // { id: 'notes', label: 'Notes', icon: FileText, count: 0 },
    // { id: 'calls', label: 'Calls', icon: MessageSquare, count: 0 },
    // { id: 'comments', label: 'Comments', icon: MessageSquare, count: 0 },
    // { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: 0 },
    // { id: 'emails', label: 'Emails', icon: Send, count: 0 }
  ];

  // Fetch detailed user data
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const apiUrl = `https://api.erpnext.ai/api/v2/document/User/${user.name}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.data) {
          setUserDetails(data.data);
          setEditedUser(data.data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        showToast('Failed to load user details', { type: 'error' });
      }
    };

    if (user.name) {
      fetchUserDetails();
    }
  }, [user.name]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const apiUrl = `https://api.erpnext.ai/api/v2/document/User/${user.name}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify({
          first_name: editedUser.first_name,
          last_name: editedUser.last_name,
          email: editedUser.email,
          company: editedUser.company,
          role_profile_name: editedUser.role_profile_name
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedData = await response.json();
      const updatedUser = updatedData.data;
      
      showToast('User updated successfully', { type: 'success' });
      onSave(updatedUser);
      setIsEditing(false);
      
      // Update local state with the response
      setUserDetails(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Failed to update user', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);

      const apiUrl = `https://api.erpnext.ai/api/method/customcrm.api.disable_user`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('User deleted successfully', { type: 'success' });
      setShowDeleteModal(false);
      onBack();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
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

  const getCompany = () => {
    // Use userDetails first, then editedUser, then original user
    return userDetails?.company || editedUser?.company || user?.company || 'N/A';
  };

  const getRoleProfile = () => {
    // Use userDetails first, then editedUser, then original user
    return userDetails?.role_profile_name || editedUser?.role_profile_name || user?.role_profile_name || 'N/A';
  };

  const getFullName = () => {
    const currentUser = userDetails || editedUser || user;
    return currentUser?.full_name || 
           `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 
           currentUser?.email || 
           'N/A';
  };

  const getRoles = () => {
    return userDetails?.roles || user?.roles || [];
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
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/80 border-gray-300'
                    }`}
                />
              ) : (
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {(userDetails?.first_name || user.first_name || 'N/A').trim()}
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
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/80 border-gray-300'
                    }`}
                />
              ) : (
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {(userDetails?.last_name || user.last_name || 'N/A').trim()}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Email
              </label>
                
             
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {userDetails?.email || user.email}
                </p>
              
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Full Name
              </label>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {getFullName()}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Company
              </label>
              
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {getCompany()}
                </p>
              
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Role Profile
              </label>
              
                <div>
                  <p className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {getRoleProfile()}
                  </p>
                  
                </div>
              
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Created
              </label>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(userDetails?.creation || user.creation)}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Last Modified
              </label>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(userDetails?.modified || user.modified)}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Activity className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Data Found</h3>
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
              Information will appear here when available.
            </p>
          </div>
        );
    }
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-lg max-w-md w-full ${theme === 'dark'
        ? 'bg-gradient-to-br from-dark-secondary to-dark-tertiary border border-purple-500/30'
        : 'bg-white border border-gray-200'
        }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark'
          ? 'border-purple-500/30'
          : 'border-gray-200'
          }`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Delete User
          </h3>
          <button
            onClick={handleDeleteCancel}
            className={`p-1 rounded-full hover:bg-opacity-20 ${theme === 'dark'
              ? 'hover:bg-white text-white'
              : 'hover:bg-gray-200 text-gray-600'
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
            Are you sure you want to delete this user?
          </p>

          {/* User Info Card */}
          <div className={`p-3 rounded-lg mb-4 ${theme === 'dark'
            ? 'bg-dark-primary/50 border border-purple-500/20'
            : 'bg-gray-100 border border-gray-200'
            }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark'
                ? 'bg-purple-800'
                : 'bg-gray-300'
                }`}>
                <User className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
              </div>
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {getFullName()}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user.email}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {getCompany()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`flex justify-end space-x-3 p-4 border-t ${theme === 'dark'
          ? 'border-purple-500/30'
          : 'border-gray-200'
          }`}>
          <button
            onClick={handleDeleteCancel}
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${theme === 'dark'
              ? 'border border-purple-500/30 text-white hover:bg-purple-800/50'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );

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
                Users / {getFullName()}
              </h1>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
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
                    ? 'bg-purple-600/80 text-white hover:bg-purple-700/80'
                    : 'bg-gray-900/80 text-white hover:bg-gray-800/80'
                    }`}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                {sessionRoleProfile !== 'User' && (
                  <button
                    onClick={handleDeleteClick}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/80 transition-colors flex items-center space-x-2 disabled:opacity-50 backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
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
                    ? 'bg-purple-600/80 text-white hover:bg-purple-700/80'
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
                      ? 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${isActive
                      ? theme === 'dark'
                        ? 'bg-purple-600 text-white'
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
          {/* Sidebar */}
          <div className="space-y-6 h-full">
            {/* User Information */}
            <div className={`rounded-lg shadow-sm border p-6 backdrop-blur-md h-full ${theme === 'dark'
              ? 'bg-gradient-to-br from-dark-secondary/80 to-dark-tertiary/80 border-purple-500/30'
              : 'bg-white/80 border-gray-200'
              }`}>
              <div className='flex items-center gap-3 flex-wrap mb-4'>
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-200'
                    }`}>
                    <User className={`w-10 h-10 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                      }`} />
                  </div>
                </div>

                <div className="text-start mb-6">
                  <h3 className={`text-2xl font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {getFullName()}
                  </h3>
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {getRoleProfile()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Email</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {userDetails?.email || user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building2 className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Company</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {getCompany()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Role Profile</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {getRoleProfile()}
                    </p>
                   
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Created</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatDate(userDetails?.creation || user.creation)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 h-full">
            <div className={`rounded-lg shadow-sm border p-6 backdrop-blur-md h-full ${theme === 'dark'
              ? 'bg-gradient-to-br from-dark-secondary/80 to-dark-tertiary/80 border-purple-500/30'
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
}