import { useState, useEffect, useRef } from 'react';
import { Trash2, Zap, User2, Loader2, X, Mail, Phone, Building2, Upload } from "lucide-react";
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { getUserSession } from '../utils/session';
import { DealDetailView } from './DealDetailView';
import { ContactDetailView } from './ContactDetailView';
import { AUTH_TOKEN, getAuthToken } from '../api/apiUrl';

// Helper function to convert relative image paths to full URLs
const getFullImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('/')) {
    return `https://api.erpnext.ai${imagePath}`;
  }

  return `https://api.erpnext.ai/files/${imagePath}`;
};

interface Organization {
  name: string;
  originalName?: string;
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
  onDetailViewNavigation?: (showingDetail: boolean) => void;
}

const EMPLOYEE_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000'
];

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
  const selectRef = useRef<HTMLSelectElement>(null);
  const isDark = theme === "dark";
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currencyOptions, setCurrencyOptions] = useState<string[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [territoryOptions, setTerritoryOptions] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [addressOptions, setAddressOptions] = useState<string[]>([]);
  const [loadingTerritories, setLoadingTerritories] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTab, setSelectedTab] = useState<'deals' | 'contacts'>('deals');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedDeals, setExpandedDeals] = useState<Set<string>>(new Set());
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(new Set());
  const token = getAuthToken();

  const API_BASE = 'https://api.erpnext.ai/api/method';

  // Mobile dropdown functions
  const toggleDealDetails = (dealId: string) => {
    setExpandedDeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  };

  const toggleContactDetails = (contactId: string) => {
    setExpandedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const isDealExpanded = (dealId: string) => expandedDeals.has(dealId);
  const isContactExpanded = (contactId: string) => expandedContacts.has(contactId);

  // Fetch address options from API
  const fetchAddressOptions = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;
      setLoadingAddresses(true);

      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const response = await fetch(`${API_BASE}/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          txt: "",
          doctype: "Address",
          filters: sessionCompany ? { company: sessionCompany } : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const addresses = data.message.map((item: any) => item.value);
      setAddressOptions(addresses);

    } catch (error) {
      console.error('Error fetching address options:', error);
      showToast('Failed to load address options', { type: 'error' });
      setAddressOptions([
        '123 Main St, New York, NY 10001',
        '456 Oak Ave, Los Angeles, CA 90001',
        '789 Pine Rd, Chicago, IL 60601',
        '101 Maple Blvd, Houston, TX 77001',
        '202 Cedar Ln, Phoenix, AZ 85001'
      ]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Fetch territory options from API
  const fetchTerritoryOptions = async () => {
    try {
      setLoadingTerritories(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const response = await fetch(`${API_BASE}/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Territory",
          filters: null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const territories = data.message.map((item: any) => item.value);
      setTerritoryOptions(territories);

    } catch (error) {
      console.error('Error fetching territory options:', error);
      showToast('Failed to load territory options', { type: 'error' });
      setTerritoryOptions(['India', 'US', 'UK', 'Canada', 'Australia']);
    } finally {
      setLoadingTerritories(false);
    }
  };

  // Fetch industry options from API
  const fetchIndustryOptions = async () => {
    try {
      setLoadingIndustries(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const response = await fetch(`${API_BASE}/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          txt: "",
          doctype: "CRM Industry",
          filters: null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const industries = data.message.map((item: any) => item.value);
      setIndustryOptions(industries);

    } catch (error) {
      console.error('Error fetching industry options:', error);
      showToast('Failed to load industry options', { type: 'error' });
      setIndustryOptions([
        'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
        'Education', 'Real Estate', 'Construction', 'Automotive', 'Energy'
      ]);
    } finally {
      setLoadingIndustries(false);
    }
  };

  // Fetch currency options from API
  const fetchCurrencyOptions = async () => {
    try {
      setLoadingCurrencies(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const response = await fetch(`${API_BASE}/frappe.desk.search.search_link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          txt: "",
          doctype: "Currency",
          filters: null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const currencies = data.message.map((item: any) => item.value);
      setCurrencyOptions(currencies);

    } catch (error) {
      console.error('Error fetching currency options:', error);
      showToast('Failed to load currency options', { type: 'error' });
      setCurrencyOptions(['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD', 'AED']);
    } finally {
      setLoadingCurrencies(false);
    }
  };

  // Fetch all dropdown options when component mounts
  useEffect(() => {
    fetchCurrencyOptions();
    fetchTerritoryOptions();
    fetchIndustryOptions();
    fetchAddressOptions();
  }, []);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a valid image file (JPEG, PNG, or GIF)', { type: 'error' });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
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

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('is_private', '0');
      formData.append('folder', 'Home/Attachments');

      const uploadResponse = await fetch('https://api.erpnext.ai/api/method/upload_file', {
        method: 'POST',
        headers: {
          'Authorization': token
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

      const updateResponse = await fetch(`${API_BASE}/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          doctype: "CRM Organization",
          name: organization!.name,
          fieldname: "organization_logo",
          value: fileData.file_url
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Update failed: ${updateResponse.status} ${updateResponse.statusText}`);
      }

      const updateResult = await updateResponse.json();
      const updatedOrganization = {
        ...organization!,
        organization_logo: fileData.file_url,
        modified: updateResult.message?.modified || organization!.modified
      };

      setOrganization(updatedOrganization);
      if (onSave) onSave(updatedOrganization);

      URL.revokeObjectURL(previewUrl);
      setImagePreview(null);

      showToast('Organization logo updated successfully', { type: 'success' });

    } catch (error: any) {
      console.error('Error during image upload process:', error);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      showToast(`Failed to upload logo: ${error.message}`, { type: 'error' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!organization?.organization_logo) return;

    if (!window.confirm('Are you sure you want to remove the organization logo?')) {
      return;
    }

    try {
      setUploadingImage(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return;
      }

      const response = await fetch(`${API_BASE}/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          doctype: "CRM Organization",
          name: organization.name,
          fieldname: "organization_logo",
          value: ""
        })
      });

      if (!response.ok) {
        throw new Error(`Remove failed: ${response.status} ${response.statusText}`);
      }

      const updatedOrganization = {
        ...organization,
        organization_logo: null
      };

      setOrganization(updatedOrganization);
      if (onSave) onSave(updatedOrganization);

      showToast('Organization logo removed successfully', { type: 'success' });

    } catch (error: any) {
      console.error('Error removing logo:', error);
      showToast(`Failed to remove logo: ${error.message}`, { type: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Image Display Component
  const ImageDisplay = () => {
    const imageUrl = imagePreview || (organization?.organization_logo ? getFullImageUrl(organization.organization_logo) : null);

    return (
      <div
        onClick={handleImageClick}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold cursor-pointer relative group overflow-hidden ${isDark ? "bg-purple-800" : "bg-gray-200"}`}
      >
        {uploadingImage ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-full">
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          </div>
        ) : (
          <>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Organization Logo"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentNode?.querySelector('.fallback-initials') as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                    fallback.style.position = 'absolute';
                    fallback.style.inset = '0';
                  }
                }}
              />
            ) : null}

            <div
              className={`fallback-initials ${imageUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center ${isDark ? "text-white" : "text-gray-600"}`}
            >
              {organization?.organization_name?.[0]?.toUpperCase() || 'O'}
            </div>

            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10">
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-4 h-4 text-white" />
              </div>
            </div>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageChange}
          disabled={uploadingImage}
        />
      </div>
    );
  };

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
    if (editingField && selectRef.current) {
      selectRef.current.focus();
    }
  }, [editingField]);



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
            'Authorization': token
          },
          body: JSON.stringify({
            doctype: "CRM Organization",
            name: organizationId
          })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const data = await response.json();
        const organizationData = data.message;

        // Store the original name as a separate property
        const originalName = organizationData.name;
        const displayName = originalName?.includes('@')
          ? originalName.split('@')[0]
          : originalName;

        const displayOrgName = organizationData.organization_name?.includes('@')
          ? organizationData.organization_name.split('@')[0]
          : organizationData.organization_name;

        setOrganization({
          ...organizationData,
          name: displayName, // Display name without @
          organization_name: displayOrgName, // Display name without @
          originalName: originalName // Store original name with @
        });

      } catch (error) {
        console.error('Error fetching organization:', error);
        showToast('Failed to load organization details', { type: 'error' });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  // Fetch deals data
  // Fetch deals data
useEffect(() => {
  const fetchDeals = async () => {
    if (!organization) return;

    try {
      const session = getUserSession();
      if (!session) return;

      // Use the original organization name with @
      const apiOrganizationName = organization.originalName || organization.name;

      const response = await fetch(`${API_BASE}/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
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
            organization: apiOrganizationName // Use original name here
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
      const transformedDeals = (data.message || []).map((deal: any) => {
        // Extract name before @ symbol for display only
        const displayOrganizationName = deal.organization?.includes('@') 
          ? deal.organization.split('@')[0] 
          : deal.organization;
        
        const displayDealName = deal.name?.includes('@') 
          ? deal.name.split('@')[0] 
          : deal.name;

        return {
          ...deal,
          name: displayDealName,
          organization: displayOrganizationName, // For display
          id: deal.name, // Keep original ID
          mobileNo: deal.mobile_no,
          assignedTo: deal.deal_owner,
          lastModified: deal.modified,
          annualRevenue: deal.annual_revenue?.toString() || '0'
        };
      });

      setDeals(transformedDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      showToast('Failed to load deals', { type: 'error' });
    }
  };

  fetchDeals();
}, [organization]);

// Fetch contacts data
useEffect(() => {
  const fetchContacts = async () => {
    if (!organization) return;

    try {
      const session = getUserSession();
      if (!session) return;

      // Use the original organization name with @
      const apiOrganizationName = organization.originalName || organization.name;

      const response = await fetch(`${API_BASE}/frappe.client.get_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
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
            company_name: apiOrganizationName // Use original name here
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
      const transformedContacts = (data.message || []).map((contact: any) => {
        // Extract name before @ symbol for display only
        const displayCompanyName = contact.company_name?.includes('@') 
          ? contact.company_name.split('@')[0] 
          : contact.company_name;
        
        const displayContactName = contact.name?.includes('@') 
          ? contact.name.split('@')[0] 
          : contact.name;

        return {
          ...contact,
          name: displayContactName,
          company_name: displayCompanyName, // For display
          id: contact.name, // Keep original ID
          email: contact.email_id,
          phone: contact.mobile_no,
          status: contact.status || 'Active'
        };
      });

      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showToast('Failed to load contacts', { type: 'error' });
    }
  };

  fetchContacts();
}, [organization]);


    

  const handleClick = (field: keyof Organization) => {
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

      if (!organization.name) {
        console.error('Organization name is missing:', organization);
        showToast('Organization name is missing', { type: 'error' });
        return;
      }

      const requestBody = {
        doctype: "CRM Organization",
        name: organization.name,
        fieldname: field,
        value: value
      };

      const response = await fetch(`${API_BASE}/frappe.client.set_value`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const updatedOrgData = result.message;

      if (updatedOrgData) {
        const updatedOrganization = {
          ...organization,
          [field]: value,
          modified: updatedOrgData.modified || organization.modified,
        };

        setOrganization(updatedOrganization);
        if (onSave) onSave(updatedOrganization);
        showToast('Organization updated successfully', { type: 'success' });
      }

      setEditingField(null);
    } catch (error: any) {
      console.error('Error updating organization:', error);
      showToast(`Failed to update organization: ${error.message}`, { type: 'error' });
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

  // Delete organization function
  const handleDelete = async () => {
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
          'Authorization': token
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
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      showToast('Failed to delete organization', { type: 'error' });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getDropdownOptions = (field: string) => {
    switch (field) {
      case 'territory':
        return territoryOptions;
      case 'industry':
        return industryOptions;
      case 'no_of_employees':
        return EMPLOYEE_OPTIONS;
      case 'currency':
        return currencyOptions;
      case 'address':
        return addressOptions;
      default:
        return [];
    }
  };

  const getDropdownLoadingState = (field: string) => {
    switch (field) {
      case 'territory':
        return loadingTerritories;
      case 'industry':
        return loadingIndustries;
      case 'currency':
        return loadingCurrencies;
      case 'address':
        return loadingAddresses;
      default:
        return false;
    }
  };

  const isDropdownField = (field: string) => {
    return ['territory', 'industry', 'no_of_employees', 'currency', 'address'].includes(field);
  };

  const renderEditableField = (label: string, field: keyof Organization) => {
    const value = organization?.[field]?.toString() || '';
    const isEditing = editingField === field;
    const isDropdown = isDropdownField(field as string);
    const isLoading = getDropdownLoadingState(field as string);

    return (
      <div key={field} className="text-sm flex gap-1 items-center group min-w-0">
        <p className={`w-32 max-sm:w-24 shrink-0 ${isDark ? "text-white/80" : "text-gray-600"}`}>{label}:</p>
        {isEditing ? (
          isDropdown ? (
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className={`flex items-center justify-center px-2 py-1 border rounded ${isDark
                  ? 'bg-dark-secondary text-white border-white/20'
                  : 'bg-white text-gray-800 border-gray-300'
                  }`}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                <select
                  ref={selectRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleBlur(field as string)}
                  onKeyDown={(e) => handleKeyDown(e, field as string)}
                  className={`w-full px-2 py-1 border rounded text-sm ${isDark
                    ? 'bg-dark-secondary text-white border-white/20 focus:border-purple-400'
                    : 'bg-white text-gray-800 border-gray-300 focus:border-blue-400'
                    } focus:outline-none max-w-[200px]`}
                  disabled={loading}
                >
                  <option className={`px-4 py-2 rounded border ${isDark
                    ? 'border-gray-600 text-white hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    } transition-colors`} value="">Select {label.toLowerCase()}...</option>
                  {getDropdownOptions(field as string).map((option) => (
                    <option
                      key={option}
                      value={option}
                      className={isDark ? 'bg-dark-secondary text-white' : ''}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleBlur(field as string)}
                onKeyDown={(e) => handleKeyDown(e, field as string)}
                className={`w-full px-2 py-1 border rounded text-sm ${isDark
                  ? 'bg-dark-secondary text-white border-white/20 focus:border-purple-400'
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-400'
                  } focus:outline-none max-w-[200px]`}
                disabled={loading}
              />
            </div>
          )
        ) : (
          <div className="flex-1 min-w-0">
            <p
              className={`cursor-pointer px-2 py-1 rounded text-sm transition-colors hover:bg-opacity-50 truncate ${isDark
                ? "text-white hover:bg-white/10"
                : "text-gray-800 hover:bg-gray-100"
                } ${!value || value === 'N/A' ? 'italic opacity-60' : ''}`}
              onClick={() => handleClick(field)}
              title={value || `Add ${label.toLowerCase()}...`}
            >
              {value || `Add ${label.toLowerCase()}...`}
            </p>
          </div>
        )}
        {loading && editingField === field && (
          <Loader2 className="w-4 h-4 animate-spin text-purple-600 ml-1 shrink-0" />
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

  // Delete Confirmation Popup Component
  const DeleteConfirmationPopup = () => {
    if (!showDeleteConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Delete Organization
            </h3>
            <button
              onClick={handleCancelDelete}
              className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete <span className="font-semibold">{organization?.organization_name}</span>? This action cannot be undone and all associated data will be permanently removed.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancelDelete}
              className={`px-4 py-2 rounded border ${isDark
                ? 'border-gray-600 text-white hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                } transition-colors`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
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
    <>
      <div className={`h-screen flex flex-col sm:flex-row ${isDark ? "bg-transparent text-white" : "bg-white text-gray-800"}`}>
        {fetchLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span>Loading organization details...</span>
            </div>
          </div>
        )}

        <DeleteConfirmationPopup />

        {/* Sidebar */}
        <div className={`w-80 max-sm:w-full border-r max-sm:border-none max-sm:h-auto flex-shrink-0 ${isDark ? "border-white/20 bg-transparent" : "border-gray-300 bg-white"}`}>
          {/* Header */}
          <div className={`p-4 border-b ${isDark ? "border-white/20" : "border-gray-300"}`}>
            <div className="flex items-center gap-3 mb-4">
              <ImageDisplay />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">{organization.organization_name || 'No name'}</h2>
                <span className="text-xs text-gray-400 block truncate">{organization.industry || 'No industry'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={handleDeleteClick}
                disabled={loading}
                className="flex items-center gap-1 text-red-500 border border-red-500 px-2 py-1 rounded text-sm disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-180px)]">
            <h3 className="text-sm font-semibold mb-1 sticky top-0 bg-inherit z-10 py-1">Details</h3>
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className={`flex items-center gap-6 border-b p-6 flex-shrink-0 ${isDark ? "border-white/20" : "border-gray-300"}`}>
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

          {/* Table Data - Scrollable area */}
          <div className="flex-1  p-6">
            {selectedTab === 'deals' ? (
              deals.length > 0 ? (
                <div className="h-full flex flex-col">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto ">
                    <table className="min-w-full text-sm border-collapse">
                      <thead>
                        <tr className={`${isDark ? "bg-white/10" : "bg-gray-100"} text-left sticky top-0 z-10`}>
                          <th className="p-3 font-medium min-w-[150px]">Organization</th>
                          <th className="p-3 font-medium min-w-[100px]">Amount</th>
                          <th className="p-3 font-medium min-w-[120px]">Status</th>
                          <th className="p-3 font-medium min-w-[180px]">Email</th>
                          <th className="p-3 font-medium min-w-[130px]">Mobile No</th>
                          <th className="p-3 font-medium min-w-[150px]">Deal Owner</th>
                          <th className="p-3 font-medium min-w-[130px]">Last Modified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map((deal, idx) => (
                          <tr
                            key={idx}
                            className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} hover:bg-opacity-50 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                            onClick={() => handleDealClick(deal)}
                          >
                            <td className="p-3 min-w-[150px]">
                              <div className="truncate">{deal.organization}</div>
                            </td>
                            <td className="p-3 min-w-[100px]">
                              <span className="font-medium whitespace-nowrap">{deal.currency} {deal.annual_revenue?.toLocaleString() || '0.00'}</span>
                            </td>
                            <td className="p-3 min-w-[120px]">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${deal.status === 'Qualification' ? 'bg-blue-500' :
                                  deal.status === 'Demo/Making' ? 'bg-yellow-500' :
                                    deal.status === 'Proposal/Quotation' ? 'bg-orange-500' :
                                      deal.status === 'Negotiation' ? 'bg-purple-500' :
                                        deal.status === 'Won' ? 'bg-green-500' :
                                          deal.status === 'Lost' ? 'bg-red-500' :
                                            'bg-gray-500'
                                  }`}></div>
                                <span className="text-sm truncate">{deal.status || 'Qualification'}</span>
                              </div>
                            </td>
                            <td className="p-3 min-w-[180px]">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-blue-500 flex-shrink-0" />
                                <span className={`text-sm truncate ${deal.email !== 'N/A' ? 'text-blue-500' : 'text-gray-400'}`}>
                                  {deal.email || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 min-w-[130px]">
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-green-500 flex-shrink-0" />
                                <span className="text-sm truncate">{deal.mobile_no || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="p-3 min-w-[150px]">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-gray-600' : 'bg-gray-400'} text-white flex-shrink-0`}>
                                  {deal.deal_owner?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm truncate">{deal.deal_owner || 'Unassigned'}</span>
                              </div>
                            </td>
                            <td className="p-3 min-w-[130px]">
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                {formatDate(deal.modified)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-4 overflow-auto flex-1">
                    {deals.map((deal, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${isDark
                          ? 'bg-purplebg border-transparent'
                          : 'bg-white border-gray-200'
                          } shadow-sm`}
                      >
                        <div className="flex justify-between items-center">
                          <div
                            className="flex items-center flex-1 cursor-pointer min-w-0"
                            onClick={() => handleDealClick(deal)}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${isDark ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                            >
                              <span
                                className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-700'
                                  }`}
                              >
                                {deal.organization?.[0]?.toUpperCase() || 'O'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3
                                className={`text-base font-semibold truncate ${isDark ? 'text-white' : 'text-gray-700'
                                  }`}
                              >
                                {deal.organization}
                              </h3>
                              <p className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-500'
                                }`}>{deal.name}</p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDealDetails(deal.id);
                            }}
                            className={`p-1 rounded transition-transform flex-shrink-0 ${isDark ? 'hover:bg-purple-700' : 'hover:bg-gray-100'
                              }`}
                          >
                            <svg
                              className={`w-4 h-4 transform transition-transform ${isDealExpanded(deal.id) ? 'rotate-180' : ''
                                } ${isDark ? 'text-white' : 'text-gray-600'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Collapsible details section */}
                        {isDealExpanded(deal.id) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Amount:
                              </span>
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {deal.currency} {deal.annual_revenue?.toLocaleString() || '0.00'}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Status:
                              </span>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${deal.status === 'Qualification' ? 'bg-blue-500' :
                                  deal.status === 'Demo/Making' ? 'bg-yellow-500' :
                                    deal.status === 'Proposal/Quotation' ? 'bg-orange-500' :
                                      deal.status === 'Negotiation' ? 'bg-purple-500' :
                                        deal.status === 'Won' ? 'bg-green-500' :
                                          deal.status === 'Lost' ? 'bg-red-500' :
                                            'bg-gray-500'
                                  }`}></div>
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {deal.status || 'Qualification'}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Email:
                              </span>
                              <div className="flex items-center gap-2">
                                <Mail size={12} className="text-blue-500 flex-shrink-0" />
                                <span className={`font-semibold truncate ${deal.email !== 'N/A' ? 'text-blue-500' : 'text-gray-400'}`}>
                                  {deal.email || 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Mobile No:
                              </span>
                              <div className="flex items-center gap-2">
                                <Phone size={12} className="text-green-500 flex-shrink-0" />
                                <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {deal.mobile_no || 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Deal Owner:
                              </span>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-gray-600' : 'bg-gray-400'
                                    } text-white flex-shrink-0`}
                                >
                                  {deal.deal_owner?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {deal.deal_owner || 'Unassigned'}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Last Modified:
                              </span>
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatDate(deal.modified)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2 p-8 text-gray-500">
                    <Zap className="w-8 h-8 text-gray-400" />
                    <p>No Deals Found</p>
                  </div>
                </div>
              )
            ) : (
              contacts.length > 0 ? (
                <div className="h-full flex flex-col">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-auto flex-1">
                    <table className="min-w-full text-sm border-collapse">
                      <thead>
                        <tr className={`${isDark ? "bg-white/10" : "bg-gray-100"} text-left sticky top-0 z-10`}>
                          <th className="p-3 font-medium min-w-[150px]">Name</th>
                          <th className="p-3 font-medium min-w-[150px]">Full Name</th>
                          <th className="p-3 font-medium min-w-[180px]">Email</th>
                          <th className="p-3 font-medium min-w-[130px]">Phone</th>
                          <th className="p-3 font-medium min-w-[150px]">Company</th>
                          <th className="p-3 font-medium min-w-[130px]">Last Modified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact, idx) => (
                          <tr
                            key={idx}
                            className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} hover:bg-opacity-50 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                            onClick={() => handleContactClick(contact)}
                          >
                            <td className="p-3 min-w-[150px]">
                              <div className="flex items-center gap-2">
                                {contact.image ? (
                                  <img
                                    src={getFullImageUrl(contact.image)}
                                    alt="Contact"
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-purple-600' : 'bg-gray-300'} text-white ${contact.image ? 'hidden' : 'flex'} flex-shrink-0`}>
                                  {contact.name?.[0]?.toUpperCase() || 'C'}
                                </div>
                                <span className="font-medium truncate">{contact.name}</span>
                              </div>
                            </td>
                            <td className="p-3 min-w-[150px]">
                              <div className="truncate">{contact.full_name}</div>
                            </td>
                            <td className="p-3 min-w-[180px]">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-blue-500 flex-shrink-0" />
                                <span className={`text-sm truncate ${contact.email_id ? 'text-blue-500' : 'text-gray-400'}`}>
                                  {contact.email_id || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 min-w-[130px]">
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-green-500 flex-shrink-0" />
                                <span className="text-sm truncate">{contact.mobile_no || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="p-3 min-w-[150px]">
                              <div className="truncate">{contact.company_name}</div>
                            </td>
                            <td className="p-3 min-w-[130px]">
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                {formatDate(contact.modified)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-4 overflow-auto flex-1">
                    {contacts.map((contact, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${isDark
                          ? 'bg-purplebg border-transparent'
                          : 'bg-white border-gray-200'
                          } shadow-sm`}
                      >
                        <div className="flex justify-between items-center">
                          <div
                            className="flex items-center flex-1 cursor-pointer min-w-0"
                            onClick={() => handleContactClick(contact)}
                          >
                            {contact.image ? (
                              <img
                                src={getFullImageUrl(contact.image)}
                                alt="Contact"
                                className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${isDark ? 'bg-purple-600' : 'bg-gray-300'
                              } ${contact.image ? 'hidden' : 'flex'}`}
                            >
                              <span
                                className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-700'
                                  }`}
                              >
                                {contact.name?.[0]?.toUpperCase() || 'C'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3
                                className={`text-base font-semibold truncate ${isDark ? 'text-white' : 'text-gray-700'
                                  }`}
                              >
                                {contact.name}
                              </h3>
                              <p className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-500'
                                }`}>{contact.full_name}</p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleContactDetails(contact.id);
                            }}
                            className={`p-1 rounded transition-transform flex-shrink-0 ${isDark ? 'hover:bg-purple-700' : 'hover:bg-gray-100'
                              }`}
                          >
                            <svg
                              className={`w-4 h-4 transform transition-transform ${isContactExpanded(contact.id) ? 'rotate-180' : ''
                                } ${isDark ? 'text-white' : 'text-gray-600'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Collapsible details section */}
                        {isContactExpanded(contact.id) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Full Name:
                              </span>
                              <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {contact.full_name}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Email:
                              </span>
                              <div className="flex items-center gap-2">
                                <Mail size={12} className="text-blue-500 flex-shrink-0" />
                                <span className={`font-semibold truncate ${contact.email_id ? 'text-blue-500' : 'text-gray-400'}`}>
                                  {contact.email_id || 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Phone:
                              </span>
                              <div className="flex items-center gap-2">
                                <Phone size={12} className="text-green-500 flex-shrink-0" />
                                <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {contact.mobile_no || 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Company:
                              </span>
                              <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {contact.company_name}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                Last Modified:
                              </span>
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatDate(contact.modified)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2 p-8 text-gray-500">
                    <User2 className="w-8 h-8 text-gray-400" />
                    <p>No Contacts Found</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}