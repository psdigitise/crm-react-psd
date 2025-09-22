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
  
  // Track if we're showing deal or contact detail to conditionally render header
  const [showingDetailView, setShowingDetailView] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2, count: null },
    { id: 'activity', label: 'Activity', icon: Activity, count: 0 },
    { id: 'notes', label: 'Notes', icon: FileText, count: 0 },
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
          'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd'
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
            'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd'
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

  // Handle deal/contact navigation state changes
  const handleDetailViewNavigation = (showingDetail: boolean) => {
    setShowingDetailView(showingDetail);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary' 
        : 'bg-gray-50'
    }`}>
      {/* Header - Only show when not showing deal/contact detail */}
      {!showingDetailView && (
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
          </div>
        </div>
      )}

      {/* Organization Details Component */}
      <OrganizationDetails 
        organizationId={organization.id} 
        onBack={onBack}
        onSave={onSave}
        onDetailViewNavigation={handleDetailViewNavigation}
      />
    </div>
  );
}