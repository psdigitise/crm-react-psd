// import { Trash2, Link, Zap, User2 } from "lucide-react";
// import { useTheme } from './ThemeProvider';


// export default function OrganizationDetails() {
//     const { theme } = useTheme();


//     return (
//         <div
//             className={`min-h-screen flex ${theme ? "bg-transparent text-white" : "bg-white text-gray-800"}`}
//         >
//             {/* Sidebar */}
//             <div
//                 className={`w-80  border-r ${theme === "dark" ? "border-white bg-transparent text-white" : "border-gray-300 bg-white text-gray-800"
//                     }`}
//             >
//                 <div className={`p-4 pb-0 border-b-2 border-white ${theme ===  "dark" ? 'border-whitr' : 'border-gray-500'}`}>

//                 {/* Header */}
//                 <div className="flex items-center gap-3 mb-4">
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purplebg' : 'bg-blue-100'
//             }`}>
//                         T
//                     </div>
//                     <h2 className="text-lg font-semibold">tovooooovo</h2>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex gap-2 mb-6 ">
//                     <button className="flex items-center gap-1 text-red-500 border border-red-500 px-2 py-1 rounded text-sm">
//                         <Trash2 size={14} /> Delete
//                     </button>
//                     <button
//                         className={`border px-2 py-1 rounded text-sm ${theme === "dark" ? "border-white text-white" : "border-gray-300 text-gray-700"
//                             }`}
//                     >
//                         <Link size={14} />
//                     </button>
//                 </div>
//                 </div>


//                 {/* Details */}
//                 <div className="space-y-2 p-4">
//                     <h3 className="text-sm font-semibold mb-2">Details</h3>
//                     <div className="text-sm space-y-1">
//                         <div className="flex gap-2 pb-3">
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Organization Name:</p>
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>tova</p>

//                              </div>
//                         <div className="flex gap-2 pb-3">
//                             <p className={`block text-base font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Website:</p>{" "}
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Add Website...</p>
//                         </div>
//                         <div className="flex gap-2 pb-3">
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Territory:</p>{" "}
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Add Territory...</p>
//                         </div>
//                         <div className="flex gap-2 pb-3">
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Industry:</p>{" "}
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Add Industry...</p>
//                         </div>
//                         <div className="flex gap-2 pb-3">
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>No. of Employees:</p>{" "}
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Add No. of Employees...</p>
//                         </div>
//                         <div className="flex gap-2 pb-3">
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Address:</p>{" "}
//                             <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Add Address...</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="flex-1 ">
//                 {/* Tabs */}
//                 <div className="flex items-center gap-6 border-b pb-3 text-sm p-6" >
//                     <button className="flex items-center gap-1 font-medium relative">
//                         <Zap size={16} />
//                         Deals
//                         <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">0</span>
//                     </button>
//                     <button className="flex items-center gap-1 font-medium text-gray-500 relative">
//                         <User2 size={16} />
//                         Contacts
//                         <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">0</span>
//                     </button>
//                 </div>

//                 {/* Empty State */}
//                 <div className="flex flex-col items-center justify-center h-96 text-center text-gray-400 p-6">
//                     <Zap className="w-8 h-8 mb-2" />
//                     <p>No Deals Found</p>
//                 </div>
//             </div>
//         </div>
//     );
// }



import { useState, useEffect } from 'react';
import { Trash2, Link, Zap, User2 } from "lucide-react";
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

interface Organization {
  id: string;
  organization_name: string;
  website?: string;
  territory?: string;
  industry?: string;
  no_of_employees?: string;
  currency?: string;
  annual_revenue?: string;
}

interface OrganizationDetailsProps {
  organizationId: string;
}

export default function OrganizationDetails({ organizationId }: OrganizationDetailsProps) {
  const { theme } = useTheme();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrganization, setEditedOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://103.214.132.20:8002/api/v2/document/CRM Organization/${organizationId}`,
          {
            headers: {
              'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setOrganization(data.data);
        setEditedOrganization(data.data);
      } catch (error) {
        console.error('Error fetching organization:', error);
        showToast('Failed to load organization', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  const handleSave = async () => {
    if (!editedOrganization) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/CRM Organization/${organizationId}`,
        {
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
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Organization updated successfully', { type: 'success' });
      setOrganization(editedOrganization);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating organization:', error);
      showToast('Failed to update organization', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://103.214.132.20:8002/api/v2/document/CRM Organization/${organizationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Organization deleted successfully', { type: 'success' });
      // You might want to redirect after deletion
    } catch (error) {
      console.error('Error deleting organization:', error);
      showToast('Failed to delete organization', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Organization, value: string) => {
    if (editedOrganization) {
      setEditedOrganization({
        ...editedOrganization,
        [field]: value
      });
    }
  };

  const renderField = (label: string, field: keyof Organization) => {
    const value = isEditing 
      ? editedOrganization?.[field] 
      : organization?.[field];
    
    return (
      <div className="flex gap-2 pb-3" key={field}>
        <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
          {label}:
        </p>
        {isEditing ? (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`flex-1 ${theme === 'dark' ? 'bg-dark-secondary text-white' : 'bg-white'} border rounded px-2 py-1`}
          />
        ) : (
          <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
            {value || `Add ${label}...`}
          </p>
        )}
      </div>
    );
  };

  if (!organization) {
    return (
      <div className={`min-h-screen flex ${theme === "dark" ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
        <div className="flex-1 flex items-center justify-center">
          {loading ? 'Loading...' : 'Organization not found'}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
      {/* Sidebar */}
      <div className={`w-80 border-r ${theme === "dark" ? "border-white bg-transparent" : "border-gray-300 bg-white"}`}>
        <div className={`p-4 pb-0 border-b-2 ${theme === "dark" ? 'border-white' : 'border-gray-500'}`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 ${
              theme === 'dark' ? 'bg-purplebg' : 'bg-blue-100'
            }`}>
              {organization.organization_name?.[0] || 'O'}
            </div>
            <h2 className="text-lg font-semibold">
              {isEditing ? (
                <input
                  type="text"
                  value={editedOrganization?.organization_name || ''}
                  onChange={(e) => handleInputChange('organization_name', e.target.value)}
                  className={`${theme === 'dark' ? 'bg-dark-secondary text-white' : 'bg-white'} border rounded px-2 py-1`}
                />
              ) : (
                organization.organization_name || 'No name'
              )}
            </h2>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-6">
            <button 
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-1 text-red-500 border border-red-500 px-2 py-1 rounded text-sm disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
              className={`border px-2 py-1 rounded text-sm ${
                theme === "dark" 
                  ? "border-white text-white" 
                  : "border-gray-300 text-gray-700"
              } disabled:opacity-50`}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-2 py-1 rounded text-sm ${
                  theme === "dark" 
                    ? "bg-purple-600 text-white" 
                    : "bg-blue-600 text-white"
                } disabled:opacity-50`}
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 p-4">
          <h3 className="text-sm font-semibold mb-2">Details</h3>
          <div className="text-sm space-y-1">
            {renderField("Website", "website")}
            {renderField("Territory", "territory")}
            {renderField("Industry", "industry")}
            {renderField("No. of Employees", "no_of_employees")}
            {renderField("Currency", "currency")}
            {renderField("Annual Revenue", "annual_revenue")}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b pb-3 text-sm p-6">
          <button className="flex items-center gap-1 font-medium relative">
            <Zap size={16} />
            Deals
            <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">0</span>
          </button>
          <button className="flex items-center gap-1 font-medium text-gray-500 relative">
            <User2 size={16} />
            Contacts
            <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">0</span>
          </button>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center h-96 text-center text-gray-400 p-6">
          <Zap className="w-8 h-8 mb-2" />
          <p>No Deals Found</p>
        </div>
      </div>
    </div>
  );
}