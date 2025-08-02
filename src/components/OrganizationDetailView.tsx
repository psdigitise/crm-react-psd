// import React, { useState } from 'react';
// import { ArrowLeft, Edit, Trash2, Globe, Building2, Users, DollarSign, MapPin, Calendar, User, FileText, MessageSquare, CheckSquare, Send, Activity } from 'lucide-react';
// import { useTheme } from './ThemeProvider';
// import { showToast } from '../utils/toast';

// interface Organization {
//   id: string;
//   name: string;
//   organization_name: string;
//   website: string;
//   territory: string;
//   industry: string;
//   no_of_employees?: string;
//   currency?: string;
//   annual_revenue?: string;
//   location?: string;
//   lastModified?: string;
//   // API fields
//   creation?: string;
//   modified?: string;
// }

// interface OrganizationDetailViewProps {
//   organization: Organization;
//   onBack: () => void;
//   onSave: (updatedOrganization: Organization) => void;
// }

// // type TabType = 'overview' | 'activity' | 'notes' | 'calls' | 'comments' | 'tasks' | 'emails';

// export function OrganizationDetailView({ organization, onBack, onSave }: OrganizationDetailViewProps) {
//   const { theme } = useTheme();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedOrganization, setEditedOrganization] = useState<Organization>(organization);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState<TabType>('overview');

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: Building2, count: null },
//     // { id: 'activity', label: 'Activity', icon: Activity, count: 0 },
//     // { id: 'notes', label: 'Notes', icon: FileText, count: 0 },
//     // { id: 'calls', label: 'Calls', icon: Phone, count: 0 },
//     // { id: 'comments', label: 'Comments', icon: MessageSquare, count: 0 },
//     // { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: 0 },
//     // { id: 'emails', label: 'Emails', icon: Send, count: 0 }
//   ];

//   const handleSave = async () => {
//     try {
//       setLoading(true);

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Organization/${organization.id}`;

//       const response = await fetch(apiUrl, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//         },
//         body: JSON.stringify({
//           organization_name: editedOrganization.organization_name,
//           website: editedOrganization.website,
//           territory: editedOrganization.territory,
//           industry: editedOrganization.industry,
//           no_of_employees: editedOrganization.no_of_employees,
//           currency: editedOrganization.currency,
//           annual_revenue: editedOrganization.annual_revenue
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Organization updated successfully', { type: 'success' });
//       onSave(editedOrganization);
//       setIsEditing(false);
//     } catch (error) {
//       console.error('Error updating organization:', error);
//       showToast('Failed to update organization', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = () => {
//     showToast('Are you sure you want to delete this organization?', {
//       type: 'warning',
//       duration: 0,
//       actions: [
//         {
//           label: 'Cancel',
//           action: () => { }
//         },
//         {
//           label: 'Delete',
//           action: async () => {
//             try {
//               setLoading(true);

//               const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Organization/${organization.id}`;

//               const response = await fetch(apiUrl, {
//                 method: 'DELETE',
//                 headers: {
//                   'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//                 }
//               });

//               if (!response.ok) {
//                 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//               }

//               showToast('Organization deleted successfully', { type: 'success' });
//               onBack();
//             } catch (error) {
//               console.error('Error deleting organization:', error);
//               showToast('Failed to delete organization', { type: 'error' });
//             } finally {
//               setLoading(false);
//             }
//           }
//         }
//       ]
//     });
//   };

//   const handleInputChange = (field: keyof Organization, value: string) => {
//     setEditedOrganization(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                 Organization Name
//               </label>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={editedOrganization.organization_name}
//                   onChange={(e) => handleInputChange('organization_name', e.target.value)}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 border-white text-white'
//                       : 'bg-white/80 border-gray-300'
//                     }`}
//                 />
//               ) : (
//                 <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {organization.organization_name}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                 Website
//               </label>
//               {isEditing ? (
//                 <input
//                   type="url"
//                   value={editedOrganization.website}
//                   onChange={(e) => handleInputChange('website', e.target.value)}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 border-white text-white'
//                       : 'bg-white/80 border-gray-300'
//                     }`}
//                 />
//               ) : (
//                 <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {organization.website}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                 Industry
//               </label>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={editedOrganization.industry}
//                   onChange={(e) => handleInputChange('industry', e.target.value)}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 border-white text-white'
//                       : 'bg-white/80 border-gray-300'
//                     }`}
//                 />
//               ) : (
//                 <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {organization.industry}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                 Territory
//               </label>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={editedOrganization.territory}
//                   onChange={(e) => handleInputChange('territory', e.target.value)}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 border-white text-white'
//                       : 'bg-white/80 border-gray-300'
//                     }`}
//                 />
//               ) : (
//                 <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {organization.territory}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                 Number of Employees
//               </label>
//               {isEditing ? (
//                 <select
//                   value={editedOrganization.no_of_employees || ''}
//                   onChange={(e) => handleInputChange('no_of_employees', e.target.value)}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 border-white text-white'
//                       : 'bg-white/80 border-gray-300'
//                     }`}
//                 >
//                   <option value="">Select Range</option>
//                   <option value="1-10">1-10</option>
//                   <option value="11-50">11-50</option>
//                   <option value="51-200">51-200</option>
//                   <option value="201-500">201-500</option>
//                   <option value="500+">500+</option>
//                 </select>
//               ) : (
//                 <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {organization.no_of_employees || 'N/A'}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
//                 Annual Revenue
//               </label>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={editedOrganization.annual_revenue || ''}
//                   onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-white-31 border-white text-white'
//                       : 'bg-white/80 border-gray-300'
//                     }`}
//                 />
//               ) : (
//                 <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {organization.annual_revenue || 'N/A'}
//                 </p>
//               )}
//             </div>
//           </div>
//         );

//       default:
//         return (
//           <div className="text-center py-12">
//             <Activity className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`} />
//             <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Data Found</h3>
//             <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//               Information will appear here when available.
//             </p>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className={`min-h-screen ${theme === 'dark'
//         ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//         : 'bg-gray-50'
//       }`}>
//       {/* Header */}
//       <div className={`border-b px-4 sm:px-6 py-4 backdrop-blur-md ${theme === 'dark'
//           ? 'bg-gradient-to-r from-dark-secondary/80 to-dark-tertiary/80 border-purple-500/30'
//           : 'bg-white/80 border-gray-200'
//         }`}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onBack}
//               className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//                 }`}
//             >
//               <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
//             </button>
//             <div>
//               <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                 Organizations / {organization.organization_name}
//               </h1>
//             </div>
//           </div>

//           <div className="flex items-center space-x-2">
//             {!isEditing ? (
//               <>
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-purplebg/80 text-white hover:bg-purple-700/80'
//                       : 'bg-gray-900/80 text-white hover:bg-gray-800/80'
//                     }`}
//                 >
//                   <Edit className="w-4 h-4" />
//                   <span>Edit</span>
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   disabled={loading}
//                   className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/80 transition-colors flex items-center space-x-2 disabled:opacity-50 backdrop-blur-sm"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   <span>Delete</span>
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={() => setIsEditing(false)}
//                   className={`px-4 py-2 rounded-lg transition-colors backdrop-blur-sm ${theme === 'dark'
//                       ? 'border border-purple-500/30 text-white hover:bg-purple-800/50'
//                       : 'border border-gray-300 text-gray-700 hover:bg-gray-50/80'
//                     }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={loading}
//                   className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 backdrop-blur-sm ${theme === 'dark'
//                       ? 'bg-purplebg/80 text-white hover:bg-purple-700/80'
//                       : 'bg-blue-600/80 text-white hover:bg-blue-700/80'
//                     }`}
//                 >
//                   {loading ? 'Saving...' : 'Save'}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className={`border-b backdrop-blur-md ${theme === 'dark'
//           ? 'bg-gradient-to-r from-dark-secondary/80 to-dark-tertiary/80 border-purple-500/30'
//           : 'bg-white/80 border-gray-200'
//         }`}>
//         <div className="px-4 sm:px-6">
//           <nav className="flex space-x-8 overflow-x-auto">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               const isActive = activeTab === tab.id;

//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as TabType)}
//                   className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${isActive
//                       ? theme === 'dark'
//                         ? 'border-purple-400 bg-purplebg'
//                         : 'border-blue-500 text-blue-600'
//                       : theme === 'dark'
//                         ? 'border-transparent text-white hover:text-white hover:border-gray-300'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   <span>{tab.label}</span>
//                   {tab.count !== null && (
//                     <span className={`px-2 py-0.5 rounded-full text-xs ${isActive
//                         ? theme === 'dark'
//                           ? 'bg-purplebg text-white'
//                           : 'bg-blue-100 text-blue-600'
//                         : theme === 'dark'
//                           ? 'bg-gray-700 text-white'
//                           : 'bg-gray-100 text-gray-600'
//                       }`}>
//                       {tab.count}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-4 sm:p-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             <div className={`rounded-lg shadow-sm border p-6 backdrop-blur-md ${theme === 'dark'
//                 ? 'bg-gradient-to-br from-dark-secondary/80 to-dark-accent/80 border-purple-500/30'
//                 : 'bg-white/80 border-gray-200'
//               }`}>
//               <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                 {activeTab === 'overview' ? 'Details' : tabs.find(t => t.id === activeTab)?.label}
//               </h2>

//               {renderTabContent()}
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Organization Information */}
//             <div className={`rounded-lg shadow-sm border p-6 backdrop-blur-md ${theme === 'dark'
//                 ? 'bg-gradient-to-br from-dark-secondary/80 to-dark-accent/80 border-purple-500/30'
//                 : 'bg-white/80 border-gray-200'
//               }`}>
//               <div className="flex items-center justify-center mb-6">
//                 <div className={`w-20 h-20 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
//                   }`}>
//                   <Building2 className={`w-10 h-10 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
//                     }`} />
//                 </div>
//               </div>

//               <div className="text-center mb-6">
//                 <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {organization.organization_name}
//                 </h3>
//                 <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                   {organization.industry}
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex items-center space-x-3">
//                   <Globe className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Website</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{organization.website}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <MapPin className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Territory</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{organization.territory}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Employees</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{organization.no_of_employees || 'N/A'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <DollarSign className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                   <div>
//                     <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Annual Revenue</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{organization.annual_revenue || 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Globe, Building2, Users, DollarSign, MapPin, Calendar, User, FileText, MessageSquare, CheckSquare, Send, Activity } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import OrganizationDetails from './OrganizationDetails';

interface Organization {
  id: string;
  name: string;
  organization_name: string;
  website: string;
  territory: string;
  industry: string;
  no_of_employees?: string;
  currency?: string;
  annual_revenue?: string;
  location?: string;
  lastModified?: string;
  // API fields
  creation?: string;
  modified?: string;
}

interface OrganizationDetailViewProps {
  organization: Organization;
  onBack: () => void;
  onSave: (updatedOrganization: Organization) => void;
}

type TabType = 'overview' | 'activity' | 'notes' | 'comments' | 'tasks' | 'emails';

export function OrganizationDetailView({ organization, onBack, onSave }: OrganizationDetailViewProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrganization, setEditedOrganization] = useState<Organization>(organization);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2, count: null },
    { id: 'activity', label: 'Activity', icon: Activity, count: 0 },
    { id: 'notes', label: 'Notes', icon: FileText, count: 0 },
    // { id: 'calls', label: 'Calls', icon: Phone, count: 0 },
    { id: 'comments', label: 'Comments', icon: MessageSquare, count: 0 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: 0 },
    { id: 'emails', label: 'Emails', icon: Send, count: 0 }
  ];

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Organization/${organization.id}`;
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        },
        body: JSON.stringify({
          organization_name: editedOrganization.organization_name,
          website: editedOrganization.website,
          territory: editedOrganization.territory,
          industry: editedOrganization.industry,
          no_of_employees: editedOrganization.no_of_employees,
          currency: editedOrganization.currency,
          annual_revenue: editedOrganization.annual_revenue
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Organization updated successfully', { type: 'success' });
      onSave(editedOrganization);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating organization:', error);
      showToast('Failed to update organization', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        setLoading(true);

        const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Organization/${organization.id}`;

        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        showToast('Organization deleted successfully', { type: 'success' });
        onBack();
      } catch (error) {
        console.error('Error deleting organization:', error);
        showToast('Failed to delete organization', { type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field: keyof Organization, value: string) => {
    setEditedOrganization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Organization Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedOrganization.organization_name}
                  onChange={(e) => handleInputChange('organization_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'bg-white-31 border-white text-white' 
                      : 'bg-white/80 border-gray-300'
                  }`}
                />
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {organization.organization_name}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={editedOrganization.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'bg-white-31 border-white text-white' 
                      : 'bg-white/80 border-gray-300'
                  }`}
                />
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {organization.website}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Industry
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedOrganization.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'bg-white-31 border-white text-white' 
                      : 'bg-white/80 border-gray-300'
                  }`}
                />
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {organization.industry}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Territory
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedOrganization.territory}
                  onChange={(e) => handleInputChange('territory', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'bg-white-31 border-white text-white' 
                      : 'bg-white/80 border-gray-300'
                  }`}
                />
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {organization.territory}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Number of Employees
              </label>
              {isEditing ? (
                <select
                  value={editedOrganization.no_of_employees || ''}
                  onChange={(e) => handleInputChange('no_of_employees', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'bg-white-31 border-white text-white' 
                      : 'bg-white/80 border-gray-300'
                  }`}
                >
                  <option value="">Select Range</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {organization.no_of_employees || 'N/A'}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Annual Revenue
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedOrganization.annual_revenue || ''}
                  onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'bg-white-31 border-white text-white' 
                      : 'bg-white/80 border-gray-300'
                  }`}
                />
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {organization.annual_revenue || 'N/A'}
                </p>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <Activity className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`} />
            <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Data Found</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
              Information will appear here when available.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary' 
        : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b px-4 sm:px-6 py-4 backdrop-blur-md ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-dark-secondary/80 to-dark-tertiary/80 border-purple-500/30' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
            </button>
            <div>
              <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Organizations / {organization.organization_name}
              </h1>
            </div>
          </div>
          
          {/* <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 backdrop-blur-sm ${
                    theme === 'dark' 
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
                  className={`px-4 py-2 rounded-lg transition-colors backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'border border-purple-500/30 text-white hover:bg-purple-800/50' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50/80'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'bg-purplebg/80 text-white hover:bg-purple-700/80' 
                      : 'bg-blue-600/80 text-white hover:bg-blue-700/80'
                  }`}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div> */}
        </div>
      </div>

      {/* Tabs */}
    

   
      <OrganizationDetails organizationId={organization.id} />
    </div>
  );
}