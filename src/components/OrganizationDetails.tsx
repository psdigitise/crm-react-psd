import { useState, useEffect, useRef } from 'react';
import { Trash2, Zap, User2, Loader2 } from "lucide-react";
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { getUserSession } from '../utils/session';
import { DealDetailView } from './DealDetailView';
import { ContactDetailView } from './ContactDetailView';

interface Organization {
  name: string;
  organization_name: string;
  website?: string;
  territory?: string;
  industry?: string;
  no_of_employees?: string;
  currency?: string;
  annual_revenue?: number;
  organization_logo?: string;
  address?: string;
  company?: string;
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  docstatus?: number;
  idx?: number;
}

interface Deal {
  name: string;
  organization: string;
  currency: string;
  annual_revenue: number;
  status: string;
  email: string;
  mobile_no: string;
  deal_owner: string;
  modified: string;
  id: string;
  mobileNo: string;
  assignedTo: string;
  lastModified: string;
  annualRevenue: string;
  organization_name?: string;
  website?: string;
  no_of_employees?: string;
  territory?: string;
  industry?: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  close_date?: string;
  probability?: string;
  next_step?: string;
}

interface Contact {
  name: string;
  full_name: string;
  image: string;
  email_id: string;
  mobile_no: string;
  company_name: string;
  modified: string;
  // Add additional fields to match ContactDetailView interface
  id: string;
  salutation?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  status: string;
  position?: string;
  lastContact?: string;
  assignedTo?: string;
  middle_name?: string;
  user?: string;
  designation?: string;
  creation?: string;
}

interface OrganizationDetailsProps {
  organizationId: string;
  onBack?: () => void;
  onSave?: (updatedOrg: Organization) => void;
  onDetailViewNavigation?: (showingDetail: boolean) => void; // Add this prop
}

export default function OrganizationDetails({
  organizationId,
  onBack,
  onSave,
  onDetailViewNavigation
}: OrganizationDetailsProps) {
  const { theme } = useTheme();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === "dark";

  // Add state for deal detail view
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  // Add state for contact detail view
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTab, setSelectedTab] = useState<'deals' | 'contacts'>('deals');

  const API_BASE = 'http://103.214.132.20:8002/api/method';

  // Notify parent when detail view state changes
  useEffect(() => {
    if (onDetailViewNavigation) {
      onDetailViewNavigation(selectedDeal !== null || selectedContact !== null);
    }
  }, [selectedDeal, selectedContact, onDetailViewNavigation]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  // Fetch organization details
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setFetchLoading(true);

        const session = getUserSession();
        if (!session) {
          showToast('Session not found', { type: 'error' });
          return;
        }

        const response = await fetch(`${API_BASE}/frappe.client.get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${session.api_key}:${session.api_secret}`
          },
          body: JSON.stringify({
            doctype: "CRM Organization",
            name: organizationId
          })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const data = await response.json();
        setOrganization(data.message);
      } catch (error) {
        console.error('Error fetching organization:', error);
        showToast('Failed to load organization', { type: 'error' });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  // Fetch deals data
  useEffect(() => {
    const fetchDeals = async () => {
      if (!organization?.organization_name) return;

      try {
        const session = getUserSession();
        if (!session) return;

        const response = await fetch(`${API_BASE}/frappe.client.get_list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${session.api_key}:${session.api_secret}`
          },
          body: JSON.stringify({
            doctype: "CRM Deal",
            fields: [
              "name",
              "organization",
              "currency",
              "annual_revenue",
              "status",
              "email",
              "mobile_no",
              "deal_owner",
              "modified"
            ],
            filters: {
              organization: organization.organization_name
            },
            limit: 1000,
            limit_page_length: 1000,
            limit_start: 0,
            order_by: "modified desc",
            start: 0,
            debug: 0
          })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const data = await response.json();

        // Transform deals to match DealDetailView interface
        const transformedDeals = (data.message || []).map((deal: any) => ({
          ...deal,
          id: deal.name, // Use name as id
          mobileNo: deal.mobile_no,
          assignedTo: deal.deal_owner,
          lastModified: deal.modified,
          annualRevenue: deal.annual_revenue?.toString() || '0'
        }));

        setDeals(transformedDeals);
      } catch (error) {
        console.error('Error fetching deals:', error);
        showToast('Failed to load deals', { type: 'error' });
      }
    };

    fetchDeals();
  }, [organization?.organization_name]);

  // Fetch contacts data
  useEffect(() => {
    const fetchContacts = async () => {
      if (!organization?.organization_name) return;

      try {
        const session = getUserSession();
        if (!session) return;

        const response = await fetch(`${API_BASE}/frappe.client.get_list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${session.api_key}:${session.api_secret}`
          },
          body: JSON.stringify({
            doctype: "Contact",
            fields: [
              "name",
              "full_name",
              "image",
              "email_id",
              "mobile_no",
              "company_name",
              "modified",
              "salutation",
              "first_name",
              "last_name",
              "gender",
              "status",
              "designation",
              "middle_name",
              "creation"
            ],
            filters: {
              company_name: organization.organization_name
            },
            limit: 1000,
            limit_page_length: 1000,
            limit_start: 0,
            order_by: "modified desc",
            start: 0,
            debug: 0
          })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const data = await response.json();

        // Transform contacts to match ContactDetailView interface
        const transformedContacts = (data.message || []).map((contact: any) => ({
          ...contact,
          id: contact.name, // Use name as id
          email: contact.email_id,
          phone: contact.mobile_no,
          status: contact.status || 'Active'
        }));

        setContacts(transformedContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        showToast('Failed to load contacts', { type: 'error' });
      }
    };

    fetchContacts();
  }, [organization?.organization_name]);

  const handleDoubleClick = (field: keyof Organization) => {
    setEditingField(field as string);
    setEditValue(organization?.[field]?.toString() || '');
  };

  const handleSave = async (field: string, value: string) => {
    if (!organization || value === organization[field as keyof Organization]?.toString()) {
      setEditingField(null);
      return;
    }

    try {
      setLoading(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const response = await fetch(`${API_BASE}/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          doctype: "CRM Organization",
          name: organization.name,
          fieldname: field,
          value: value
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const updatedOrgData = result.message;

      if (updatedOrgData) {
        // Update the organization with the response data
        const updatedOrganization = {
          ...organization,
          [field]: value,
          // Update other fields from the response if available
          modified: updatedOrgData.modified || organization.modified,
        };

        setOrganization(updatedOrganization);
        if (onSave) onSave(updatedOrganization);
        showToast('Organization updated successfully', { type: 'success' });
      }

      setEditingField(null);
    } catch (error) {
      console.error('Error updating organization:', error);
      showToast('Failed to update organization', { type: 'error' });
      setEditingField(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSave(field, editValue);
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const handleBlur = (field: string) => {
    handleSave(field, editValue);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    if (!organization) return;

    try {
      setLoading(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const response = await fetch(`${API_BASE}/frappe.client.delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          doctype: "CRM Organization",
          name: organization.name
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Organization deleted successfully', { type: 'success' });
      if (onBack) onBack();
    } catch (error) {
      console.error('Error deleting organization:', error);
      showToast('Failed to delete organization', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderEditableField = (label: string, field: keyof Organization) => {
    const value = organization?.[field]?.toString() || '';
    const isEditing = editingField === field;

    return (
      <div key={field} className="text-sm flex gap-1 group">
        <p className={`w-32 ${isDark ? "text-white/80" : "text-gray-600"}`}>{label}:</p>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleBlur(field as string)}
            onKeyDown={(e) => handleKeyDown(e, field as string)}
            className={`flex-1 px-2 py-1 border rounded ${isDark
              ? 'bg-dark-secondary text-white border-white/20 focus:border-purple-400'
              : 'bg-white text-gray-800 border-gray-300 focus:border-blue-400'
              } focus:outline-none`}
            disabled={loading}
          />
        ) : (
          <p
            className={`flex-1 cursor-pointer px-2 py-1 rounded transition-colors hover:bg-opacity-50 ${isDark
              ? "text-white hover:bg-white/10"
              : "text-gray-800 hover:bg-gray-100"
              } ${!value || value === 'N/A' ? 'italic opacity-60' : ''}`}
            onDoubleClick={() => handleDoubleClick(field)}
            title="Double-click to edit"
          >
            {value || `Add ${label.toLowerCase()}...`}
          </p>
        )}
        {loading && editingField === field && (
          <Loader2 className="w-4 h-4 animate-spin text-purple-600 ml-1" />
        )}
      </div>
    );
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInHours < 48) return '1 day ago';
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;

      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Handle deal click
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  // Handle contact click
  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  // Handle deal save
  const handleDealSave = (updatedDeal: Deal) => {
    setDeals(prevDeals =>
      prevDeals.map(deal =>
        deal.id === updatedDeal.id ? updatedDeal : deal
      )
    );
  };

  // Handle contact save
  const handleContactSave = (updatedContact: Contact) => {
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
  };

  // Handle back from deal detail
  const handleBackFromDeal = () => {
    setSelectedDeal(null);
  };

  // Handle back from contact detail
  const handleBackFromContact = () => {
    setSelectedContact(null);
  };

  // If a deal is selected, show DealDetailView
  if (selectedDeal) {
    return (
      <DealDetailView
        deal={selectedDeal}
        onBack={handleBackFromDeal}
        onSave={handleDealSave}
      />
    );
  }

  // If a contact is selected, show ContactDetailView
  if (selectedContact) {
    return (
      <ContactDetailView
        contact={selectedContact}
        onBack={handleBackFromContact}
        onSave={handleContactSave}
      />
    );
  }

  if (!organization) {
    return (
      <div className={`min-h-screen flex ${theme === "dark" ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
        {fetchLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span>Loading organization details...</span>
            </div>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          {fetchLoading ? '' : 'Organization not found'}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
      {fetchLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span>Loading organization details...</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`w-80 border-r ${isDark ? "border-white bg-transparent" : "border-gray-300 bg-white"}`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? "border-white/20" : "border-gray-300"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${isDark ? "bg-purple-800" : "bg-gray-200"}`}>
              {organization.organization_logo ? (
                <img src={organization.organization_logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                organization.organization_name?.[0]?.toUpperCase() || 'O'
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{organization.organization_name || 'No name'}</h2>
              <span className="text-xs text-gray-400 block">{organization.industry || 'No industry'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-4 transition-all duration-300">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-1 text-red-500 border border-red-500 px-2 py-1 rounded text-sm disabled:opacity-50 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-semibold mb-1">Details</h3>
          {renderEditableField("Organization Name", "organization_name")}
          {renderEditableField("Website", "website")}
          {renderEditableField("Territory", "territory")}
          {renderEditableField("Industry", "industry")}
          {renderEditableField("No. of Employees", "no_of_employees")}
          {renderEditableField("Currency", "currency")}
          {renderEditableField("Annual Revenue", "annual_revenue")}
          {renderEditableField("Address", "address")}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Tabs */}
        <div className={`flex items-center gap-6 border-b p-6 ${isDark ? "border-white/20" : "border-gray-300"}`}>
          <button
            onClick={() => setSelectedTab('deals')}
            className={`flex items-center gap-1 font-medium relative ${selectedTab === 'deals' ? '' : 'text-gray-500'
              }`}
          >
            <Zap size={16} />
            Deals
            <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">
              {deals.length}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab('contacts')}
            className={`flex items-center gap-1 font-medium relative ${selectedTab === 'contacts' ? '' : 'text-gray-500'
              }`}
          >
            <User2 size={16} />
            Contacts
            <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">
              {contacts.length}
            </span>
          </button>
        </div>
        {/* Table Data */}
        <div className="p-6 overflow-x-auto">
          {selectedTab === 'deals' ? (
            deals.length > 0 ? (
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className={`${isDark ? "bg-white/10" : "bg-gray-100"} text-left`}>
                    <th className="p-3 font-medium">Deal Name</th>
                    <th className="p-3 font-medium">Organization</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Mobile No</th>
                    <th className="p-3 font-medium">Deal Owner</th>
                    <th className="p-3 font-medium">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal, idx) => (
                    <tr
                      key={idx}
                      className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} hover:bg-opacity-50 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                      onClick={() => handleDealClick(deal)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-purple-600' : 'bg-gray-300'} text-white`}>
                            {deal.name?.[0]?.toUpperCase() || 'D'}
                          </div>
                          <span className="font-medium">{deal.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{deal.organization}</td>
                      <td className="p-3">
                        <span className="font-medium">{deal.currency} {deal.annual_revenue?.toLocaleString() || '0.00'}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${deal.status === 'Qualification' ? 'bg-blue-500' :
                            deal.status === 'Demo/Making' ? 'bg-yellow-500' :
                              deal.status === 'Proposal/Quotation' ? 'bg-orange-500' :
                                deal.status === 'Negotiation' ? 'bg-purple-500' :
                                  deal.status === 'Won' ? 'bg-green-500' :
                                    deal.status === 'Lost' ? 'bg-red-500' :
                                      'bg-gray-500'
                            }`}></div>
                          <span className="text-sm">{deal.status || 'Qualification'}</span>
                        </div>
                      </td>
                      <td className="p-3">{deal.email || 'N/A'}</td>
                      <td className="p-3">{deal.mobile_no || 'N/A'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-gray-600' : 'bg-gray-400'} text-white`}>
                            {deal.deal_owner?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm">{deal.deal_owner || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-500">
                          {formatDate(deal.modified)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center gap-2 p-8 text-gray-500">
                <Zap className="w-8 h-8 text-gray-400" />
                <p>No Deals Found</p>
              </div>
            )
          ) : (
            contacts.length > 0 ? (
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className={`${isDark ? "bg-white/10" : "bg-gray-100"} text-left`}>
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Full Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Phone</th>
                    <th className="p-3 font-medium">Company</th>
                    <th className="p-3 font-medium">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, idx) => (
                    <tr
                      key={idx}
                      className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} hover:bg-opacity-50 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                      onClick={() => handleContactClick(contact)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {contact.image ? (
                            <img src={contact.image} alt="Contact" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-purple-600' : 'bg-gray-300'} text-white`}>
                              {contact.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                          )}
                          <span className="font-medium">{contact.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{contact.full_name}</td>
                      <td className="p-3">{contact.email_id}</td>
                      <td className="p-3">{contact.mobile_no || 'N/A'}</td>
                      <td className="p-3">{contact.company_name}</td>
                      <td className="p-3">
                        <span className="text-sm text-gray-500">
                          {formatDate(contact.modified)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center gap-2 p-8 text-gray-500">
                <User2 className="w-8 h-8 text-gray-400" />
                <p>No Contacts Found</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}