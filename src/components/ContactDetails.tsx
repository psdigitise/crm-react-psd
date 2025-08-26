import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, User, Calendar, MapPin, Zap, Loader2, Plus, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { getUserSession } from '../utils/session';
import { DealDetailView } from './DealDetailView'; // Import the DealDetailView component

interface Contact {
  id: string;
  name: string;
  first_name: string;
  full_name: string;
  status: string;
  company_name: string;
  email?: string;
  phone?: string;
  position?: string;
  lastContact?: string;
  assignedTo?: string;
  middle_name?: string;
  last_name?: string;
  user?: string;
  salutation?: string;
  designation?: string;
  gender?: string;
  creation?: string;
  modified?: string;
  email_id?: string;
  mobile_no?: string;
  owner?: string;
  image_url?: string; // Added property for image URL
  reference_deals?: Array<{
    name: string;
    organization: string;
    annual_revenue: number;
    status: string;
    email: string;
    mobile_no: string;
    deal_owner: string;
    modified: string;
  }>;
  email_ids?: Array<{
    name: string;
    email_id: string;
    is_primary: number;
  }>;
  phone_nos?: Array<{
    name: string;
    phone: string;
    is_primary_phone: number;
    is_primary_mobile_no: number;
  }>;
}

// Add Deal interface to match DealDetailView expectations
interface Deal {
  id: string;
  name: string;
  organization: string;
  status: 'Qualification' | 'Demo/Making' | 'Proposal/Quotation' | 'Negotiation';
  email: string;
  mobileNo: string;
  assignedTo: string;
  lastModified: string;
  annualRevenue: string;
  organization_name?: string;
  website?: string;
  no_of_employees?: string;
  territory?: string;
  annual_revenue?: string;
  industry?: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  mobile_no?: string;
  gender?: string;
  deal_owner?: string;
  close_date?: string;
  probability?: string;
  next_step?: string;
}

interface ContactDetailViewProps {
  contact: Contact;
  onBack: () => void;
  onSave: (updatedContact: Contact) => void;
  onDealClick?: (dealName: string) => void;
  onDealViewChange?: (showingDeal: boolean) => void; // Add this callback
}

const SALUTATION_OPTIONS = [
  'Dr',
  'Madam',
  'Master',
  'Miss',
  'Mr',
  'Mrs',
  'Ms'
];

const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say'
];

export default function ContactDetails({
  contact: initialContact,
  onBack,
  onSave,
  onDealClick,
  onDealViewChange
}: ContactDetailViewProps) {
  const { theme } = useTheme();
  const [contact, setContact] = useState<Contact>(initialContact);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);
  const [addingPhone, setAddingPhone] = useState(false);
  const [newEmailValue, setNewEmailValue] = useState('');
  const [newPhoneValue, setNewPhoneValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const isDark = theme === "dark";

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDealDetail, setShowDealDetail] = useState(false);

  useEffect(() => {
    if (onDealViewChange) {
      onDealViewChange(showDealDetail);
    }
  }, [showDealDetail, onDealViewChange]);

  // Fetch detailed contact data when component mounts
  useEffect(() => {
    fetchContactDetails();
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    if ((editingField === 'salutation' || editingField === 'gender') && selectRef.current) {
      selectRef.current.focus();
    }
  }, [editingField]);

  const fetchContactDetails = async () => {
    try {
      setFetchLoading(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.contact.get_contact';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          name: initialContact.id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const contactData = result.message;

      if (contactData) {
        const transformedContact: Contact = {
          id: contactData.name,
          name: contactData.full_name || contactData.first_name || 'Unknown',
          first_name: contactData.first_name || '',
          full_name: contactData.full_name || '',
          status: contactData.status || 'Open',
          company_name: contactData.company_name || 'N/A',
          email: contactData.email_id || contactData.email_ids?.[0]?.email_id || 'N/A',
          phone: contactData.mobile_no || contactData.phone || contactData.phone_nos?.[0]?.phone || 'N/A',
          position: contactData.designation || 'N/A',
          lastContact: formatDate(contactData.modified),
          assignedTo: contactData.owner || 'N/A',
          middle_name: contactData.middle_name,
          last_name: contactData.last_name,
          user: contactData.user,
          salutation: contactData.salutation,
          designation: contactData.designation,
          gender: contactData.gender,
          creation: contactData.creation,
          modified: contactData.modified,
          email_id: contactData.email_id,
          mobile_no: contactData.mobile_no,
          owner: contactData.owner,

          // FIX: Map the 'image' field from API to 'image_url' for display
          image_url: contactData.image ? `http://103.214.132.20:8002${contactData.image}` : null,

          reference_deals: [],
          email_ids: contactData.email_ids || [],
          phone_nos: contactData.phone_nos || []
        };

        setContact(transformedContact);

        // Fetch linked deals separately
        await fetchLinkedDeals(contactData.name);
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      showToast('Failed to fetch detailed contact information', { type: 'error' });
      // Keep using the initial contact data if API fails
    } finally {
      setFetchLoading(false);
    }
  };

  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a valid image file (JPEG, PNG, or GIF)', { type: 'error' });
      return;
    }

    // Validate file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      showToast('Image size should be less than 5MB', { type: 'error' });
      return;
    }

    try {
      setUploadingImage(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('is_private', '0'); // Public file
      formData.append('folder', 'Home/Attachments');

      // Upload file to server
      const uploadResponse = await fetch('http://103.214.132.20:8002/api/method/upload_file', {
        method: 'POST',
        headers: {
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      const fileData = uploadResult.message;

      if (!fileData || !fileData.file_url) {
        throw new Error('Upload successful but no file URL returned');
      }

      // Now update the contact's image field with the uploaded file URL
      const updateResponse = await fetch('http://103.214.132.20:8002/api/method/frappe.client.set_value', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          doctype: "Contact",
          name: contact.id,
          fieldname: "image",
          value: fileData.file_url
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Update failed: ${updateResponse.status} ${updateResponse.statusText}`);
      }

      const updateResult = await updateResponse.json();

      const updatedContact = {
        ...contact,
        // Set the image_url for display purposes  
        image_url: `http://103.214.132.20:8002${fileData.file_url}`,
        modified: updateResult.message?.modified || contact.modified
      };

      setContact(updatedContact);
      onSave(updatedContact);

      // Clean up preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      showToast('Profile image updated successfully', { type: 'success' });

      // Refresh contact details to ensure we have the latest data
      await fetchContactDetails();

    } catch (error) {
      console.error('Error uploading image:', error);

      // Clean up preview on error
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      showToast(`Failed to upload image: ${error.message}`, { type: 'error' });
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fetchLinkedDeals = async (contactName: string) => {
    try {
      const session = getUserSession();
      if (!session) return;

      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.contact.get_linked_deals';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          contact: contactName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const deals = result.message || [];

      // Transform deals data
      const transformedDeals = deals.map((deal: any) => ({
        name: deal.name,
        organization: deal.organization || deal.organization_name || 'No organization',
        annual_revenue: deal.annual_revenue || 0,
        status: deal.status || 'Qualification',
        email: deal.email || 'No email',
        mobile_no: deal.mobile_no || 'No phone',
        deal_owner: deal.deal_owner || 'Unassigned',
        modified: deal.modified || ''
      }));

      // Update contact with deals
      setContact(prevContact => ({
        ...prevContact,
        reference_deals: transformedDeals
      }));

    } catch (error) {
      console.error('Error fetching linked deals:', error);
      // Don't show toast error for deals fetch failure - it's secondary data
    }
  };

  // Function to fetch full deal details and navigate to deal view
  const fetchDealDetailsAndNavigate = async (dealName: string) => {
    try {
      setLoading(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      // Fetch full deal details from API
      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.client.get';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          doctype: "CRM Deal",
          name: dealName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const dealData = result.message;

      if (dealData) {
        // Transform the deal data to match Deal interface
        const transformedDeal: Deal = {
          id: dealData.name,
          name: dealData.name,
          organization: dealData.organization || dealData.organization_name || 'No Organization',
          status: dealData.status || 'Qualification',
          email: dealData.email || 'No email',
          mobileNo: dealData.mobile_no || 'No phone',
          assignedTo: dealData.deal_owner || 'Unassigned',
          lastModified: dealData.modified || '',
          annualRevenue: dealData.annual_revenue?.toString() || '0',
          organization_name: dealData.organization_name,
          website: dealData.website,
          no_of_employees: dealData.no_of_employees,
          territory: dealData.territory,
          annual_revenue: dealData.annual_revenue?.toString() || '0',
          industry: dealData.industry,
          salutation: dealData.salutation,
          first_name: dealData.first_name,
          last_name: dealData.last_name,
          mobile_no: dealData.mobile_no,
          gender: dealData.gender,
          deal_owner: dealData.deal_owner,
          close_date: dealData.close_date,
          probability: dealData.probability?.toString() || '0',
          next_step: dealData.next_step
        };

        setSelectedDeal(transformedDeal);
        setShowDealDetail(true);
      }
    } catch (error) {
      console.error('Error fetching deal details:', error);
      showToast('Failed to fetch deal details', { type: 'error' });
    } finally {
      setLoading(false);
    }
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

  // Changed from handleDoubleClick to handleSingleClick
  const handleSingleClick = (field: keyof Contact) => {
    setEditingField(field as string);
    setEditValue(contact[field] as string || '');
  };

  const handleSave = async (field: string, value: string) => {
    if (value === contact[field as keyof Contact]) {
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

      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.client.set_value';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          doctype: "Contact",
          name: contact.id,
          fieldname: field,
          value: value
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const updatedContactData = result.message;

      if (updatedContactData) {
        // Update the contact with the response data
        const updatedContact = {
          ...contact,
          [field]: value,
          // Update other fields from the response if available
          full_name: updatedContactData.full_name || contact.full_name,
          modified: updatedContactData.modified || contact.modified,
        };

        setContact(updatedContact);
        onSave(updatedContact);
        showToast('Contact updated successfully', { type: 'success' });
      }

      setEditingField(null);
    } catch (error) {
      console.error('Error updating contact:', error);
      showToast('Failed to update contact', { type: 'error' });
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
    // if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      setLoading(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${contact.id}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Contact deleted successfully', { type: 'success' });
      onBack();
    } catch (error) {
      console.error('Error deleting contact:', error);
      showToast('Failed to delete contact', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Add email functionality
  const handleAddEmail = async () => {
    if (!newEmailValue.trim()) {
      showToast('Please enter a valid email address', { type: 'error' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailValue.trim())) {
      showToast('Please enter a valid email address', { type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.contact.create_new';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          contact: contact.id,
          field: "email",
          value: newEmailValue.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      showToast('Email added successfully', { type: 'success' });
      setNewEmailValue('');
      setAddingEmail(false);

      // Refresh contact details to get updated email list
      await fetchContactDetails();

    } catch (error) {
      console.error('Error adding email:', error);
      showToast('Failed to add email', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Add phone functionality
  const handleAddPhone = async () => {
    if (!newPhoneValue.trim()) {
      showToast('Please enter a valid phone number', { type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.contact.create_new';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify({
          contact: contact.id,
          field: "phone",
          value: newPhoneValue.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      showToast('Phone number added successfully', { type: 'success' });
      setNewPhoneValue('');
      setAddingPhone(false);

      // Refresh contact details to get updated phone list
      await fetchContactDetails();

    } catch (error) {
      console.error('Error adding phone:', error);
      showToast('Failed to add phone number', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Modified deal row click handler
  const handleDealRowClick = (dealName: string) => {
    fetchDealDetailsAndNavigate(dealName);
  };

  // Handle deal detail back navigation
  const handleDealDetailBack = () => {
    setShowDealDetail(false);
    setSelectedDeal(null);
  };

  // Handle deal save
  const handleDealSave = (updatedDeal: Deal) => {
    setSelectedDeal(updatedDeal);
    // Optionally refresh contact details to get updated deal information
    fetchContactDetails();
  };

  // If showing deal detail, render DealDetailView
  if (showDealDetail && selectedDeal) {
    return (
      <DealDetailView
        deal={selectedDeal}
        onBack={handleDealDetailBack}
        onSave={handleDealSave}
      />
    );
  }

  const renderEmailDropdownField = () => {
    const emails = contact.email_ids || [];

    const handleEmailSelectChange = (e) => {
      const selectedValue = e.target.value;
      if (selectedValue === 'create_new') {
        setAddingEmail(true);
        e.target.value = emails.find(e => e.is_primary)?.email_id || emails[0]?.email_id || '';
      }
    }

    return (
      <div className="text-sm flex gap-1 group">
        <p className={`w-32 ${isDark ? "text-white/80" : "text-gray-600"}`}>Email Address:</p>
        <div className="flex-1 flex items-center gap-2">
          {emails.length > 0 ? (
            <select
              className={`flex-1 px-2 py-1 border rounded ${isDark
                ? 'bg-dark-secondary text-white border-white/20 focus:border-purple-400'
                : 'bg-white text-gray-800 border-gray-300 focus:border-blue-400'
                } focus:outline-none`}
              defaultValue={emails.find(e => e.is_primary)?.email_id || emails[0]?.email_id || ''}
              onChange={handleEmailSelectChange}
            >
              {emails.map((emailItem, index) => (
                <option className="bg-white text-gray-800" key={index} value={emailItem.email_id}>
                  {emailItem.email_id} {emailItem.is_primary ? '(Primary)' : ''}
                </option>
              ))}
              <option
                className="bg-white text-gray-800 border-t border-gray-200"
                value="create_new"
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '8px',
                  marginTop: '4px'
                }}
              >
                + Create New
              </option>
            </select>
          ) : (
            <select
              className={`flex-1 px-2 py-1 border rounded ${isDark
                ? 'bg-dark-secondary text-white border-white/20 focus:border-purple-400'
                : 'bg-white text-gray-800 border-gray-300 focus:border-blue-400'
                } focus:outline-none`}
              onChange={handleEmailSelectChange}
            >
              <option className="bg-white text-gray-800" value="">
                No email addresses
              </option>
              <option
                className="bg-white text-gray-800 border-t border-gray-200"
                value="create_new"
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '8px',
                  marginTop: '4px'
                }}
              >
                + Create New
              </option>
            </select>
          )}
        </div>

        {/* Add email input modal - keep existing modal code */}
        {addingEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-96`}>
              <h3 className="text-lg font-semibold mb-3">Add Email Address</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={newEmailValue}
                  onChange={(e) => setNewEmailValue(e.target.value)}
                  placeholder="Enter email address..."
                  className={`flex-1 px-3 py-2 border rounded ${isDark
                    ? 'bg-gray-700 text-white border-white/20 focus:border-green-400'
                    : 'bg-white text-gray-800 border-gray-300 focus:border-green-400'
                    } focus:outline-none`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddEmail();
                    } else if (e.key === 'Escape') {
                      setAddingEmail(false);
                      setNewEmailValue('');
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setAddingEmail(false);
                    setNewEmailValue('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEmail}
                  disabled={loading || !newEmailValue.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Add Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render phone dropdown field
  const renderPhoneDropdownField = () => {
    const phones = contact.phone_nos || [];

    return (
      <div className="text-sm flex gap-1 group">
        <p className={`w-32 ${isDark ? "text-white/80" : "text-gray-600"}`}>Mobile No:</p>
        <div className="flex-1 flex items-center gap-2">
          {phones.length > 0 ? (
            <select
              className={`flex-1 px-2 py-1 border rounded ${isDark
                ? 'bg-dark-secondary text-white border-white/20 focus:border-purple-400'
                : 'bg-white text-gray-800 border-gray-300 focus:border-blue-400'
                } focus:outline-none`}
              defaultValue={phones.find(p => p.is_primary_phone || p.is_primary_mobile_no)?.phone || phones[0]?.phone || ''}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === 'create_new') {
                  setAddingPhone(true);
                  // Reset the select to show the first phone or empty
                  e.target.value = phones.find(p => p.is_primary_phone || p.is_primary_mobile_no)?.phone || phones[0]?.phone || '';
                }
              }}
            >
              {phones.map((phoneItem, index) => (
                <option className="bg-white text-gray-800" key={index} value={phoneItem.phone}>
                  {phoneItem.phone} {(phoneItem.is_primary_phone || phoneItem.is_primary_mobile_no) ? '(Primary)' : ''}
                </option>
              ))}
              <option
                className="bg-white text-gray-800"
                value="create_new"
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '8px',
                  marginTop: '4px'
                }}
              >
                + Create New
              </option>
            </select>
          ) : (
            <select
              className={`flex-1 px-2 py-1 border rounded ${isDark
                ? 'bg-dark-secondary text-white border-white/20 focus:border-purple-400'
                : 'bg-white text-gray-800 border-gray-300 focus:border-blue-400'
                } focus:outline-none`}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === 'create_new') {
                  setAddingPhone(true);
                  e.target.value = '';
                }
              }}
            >
              <option className="bg-white text-gray-800" value="">
                No phone numbers
              </option>
              <option
                className="bg-white text-gray-800"
                value="create_new"
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '8px',
                  marginTop: '4px'
                }}
              >
                + Create New
              </option>
            </select>
          )}
        </div>

        {/* Add phone input */}
        {addingPhone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} w-96`}>
              <h3 className="text-lg font-semibold mb-3">Add Phone Number</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="tel"
                  value={newPhoneValue}
                  onChange={(e) => setNewPhoneValue(e.target.value)}
                  placeholder="Enter phone number..."
                  className={`flex-1 px-3 py-2 border rounded ${isDark
                    ? 'bg-gray-700 text-white border-white/20 focus:border-green-400'
                    : 'bg-white text-gray-800 border-gray-300 focus:border-green-400'
                    } focus:outline-none`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPhone();
                    } else if (e.key === 'Escape') {
                      setAddingPhone(false);
                      setNewPhoneValue('');
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setAddingPhone(false);
                    setNewPhoneValue('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPhone}
                  disabled={loading || !newPhoneValue.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Add Phone
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEditableField = (label: string, field: keyof Contact) => {
    const value = contact[field] as string;
    const isEditing = editingField === field;

    return (
      <div key={field} className="text-sm flex gap-1 group">
        <p className={`w-32 ${isDark ? "text-white/80" : "text-gray-600"}`}>{label}:</p>
        {isEditing ? (
          (field === 'salutation' || field === 'gender') ? (
            <select
              ref={selectRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleBlur(field as string)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave(field as string, editValue);
                } else if (e.key === 'Escape') {
                  setEditingField(null);
                }
              }}
              className={`flex-1 px-2 py-1 border rounded ${isDark
                ? 'bg-dark-secondary text-white border-white/20 focus:border-purple-400'
                : 'bg-white text-gray-800 border-gray-300 focus:border-blue-400'
                } focus:outline-none`}
              disabled={loading}
            >
              <option
                value=""
                className={isDark ? 'bg-dark-secondary text-white' : ''}
              >
                {field === 'salutation' ? 'Select salutation...' : 'Select gender...'}
              </option>
              {(field === 'salutation' ? SALUTATION_OPTIONS : GENDER_OPTIONS).map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                    className={isDark ? 'bg-dark-secondary text-white' : ''}
                  >
                    {option}
                  </option>
                )
              )}
            </select>

          ) : (
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
          )
        ) : (
          <p
            className={`flex-1 cursor-pointer px-2 py-1 rounded transition-colors hover:bg-opacity-50 ${isDark
              ? "text-white hover:bg-white/10"
              : "text-gray-800 hover:bg-gray-100"
              } ${!value || value === 'N/A' ? 'italic opacity-60' : ''}`}
            onClick={() => handleSingleClick(field)}
            title="Click to edit"
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

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
      {fetchLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span>Loading contact details...</span>
          </div>
        </div>
      )}

      {/* Sidebar - Only show when NOT showing deal detail */}
      {!showDealDetail && (
        <div className={`w-80 border-r ${isDark ? "border-white bg-transparent" : "border-gray-300 bg-white"}`}>
          {/* Header */}
          <div className={`p-4 border-b ${isDark ? "border-white/20" : "border-gray-300"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  onClick={handleClick}
                  className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-lg font-semibold bg-gray-200 cursor-pointer relative group"
                >
                  {uploadingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                    </div>
                  ) : (
                    <>
                      {imagePreview || contact.image_url ? (
                        <img
                          src={imagePreview || contact.image_url}
                          alt={contact.first_name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600">
                          {contact.first_name?.[0]?.toUpperCase() || 'C'}
                        </span>
                      )}

                      {/* Upload overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium">Upload</span>
                      </div>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploadingImage}
                  />
                </div>

                {/* Name & Company */}
                <div>
                  <h2 className="text-lg font-semibold">
                    {contact.full_name || contact.name}
                  </h2>
                  <span className="text-xs text-gray-400 block">
                    {contact.company_name || 'No company'}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
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
            {renderEditableField("Salutation", "salutation")}
            {renderEditableField("First Name", "first_name")}
            {renderEditableField("Last Name", "last_name")}
            {renderEmailDropdownField()}
            {renderPhoneDropdownField()}
            {renderEditableField("Gender", "gender")}
            {renderEditableField("Company Name", "company_name")}
            {renderEditableField("Designation", "designation")}
          </div>
        </div>
      )}

      {/* Main Content - Only show when NOT showing deal detail */}
      {!showDealDetail && (
        <div className="flex-1">
          {/* Tabs */}
          <div className={`flex items-center gap-6 border-b p-6 ${isDark ? "border-white/20" : "border-gray-300"}`}>
            <button className="flex items-center gap-1 font-medium relative">
              <Zap size={16} />
              Deals
              <span className="bg-black text-white text-xs rounded-full px-1.5 ml-1">
                {contact.reference_deals?.length || 0}
              </span>
            </button>
          </div>
          {/* Deals Table */}
          <div className="p-6 overflow-x-auto">
            {contact.reference_deals?.length ? (
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className={`${isDark ? "bg-white/10" : "bg-gray-100"} text-left`}>
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
                  {contact.reference_deals.map((deal, index) => (
                    <tr
                      key={index}
                      className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} hover:bg-opacity-50 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                      onClick={() => handleDealRowClick(deal.name)}
                      title="Click to view deal details"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-purple-600' : 'bg-gray-300'} text-white`}>
                            {deal.organization?.[0]?.toUpperCase() || 'O'}
                          </div>
                          <div>
                            <p className="font-medium">{deal.organization || 'No organization'}</p>
                            <p className="text-xs text-gray-500">{deal.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">₹ {deal.annual_revenue?.toLocaleString() || '0.00'}</span>
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
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-blue-500" />
                          <span className={`text-sm ${deal.email !== 'No email' ? 'text-blue-500' : 'text-gray-400'}`}>
                            {deal.email || 'No email'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-green-500" />
                          <span className="text-sm">{deal.mobile_no || 'No phone'}</span>
                        </div>
                      </td>
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
              <div className="flex items-center justify-center min-h-[calc(100vh-250px)]">
                <div className="flex flex-col items-center gap-2 p-8 text-gray-500">
                  <Zap className="w-8 h-8 text-gray-400" />
                  <p>No Deals Found</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}