import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Mail, Phone, Building2, Loader2, ChevronLeft, ChevronRight, Filter, X, Settings, RefreshCcw, Download } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { exportToExcel } from '../utils/exportUtils';
import { getUserSession } from '../utils/session';
import { BsThreeDots } from 'react-icons/bs';
import { apiUrl, AUTH_TOKEN } from '../api/apiUrl';
import { api } from '../api/apiService';

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
  // API fields
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
  image?: string;
  owner?: string;
}

interface ContactsTableProps {
  searchTerm: string;
  onContactClick?: (contact: Contact) => void;
}

interface FilterState {
  status: string[];
  company_name: string[];
  owner: string[];
}

interface ColumnConfig {
  key: keyof Contact;
  label: string;
  visible: boolean;
  sortable: boolean;
}

interface FieldOption {
  label: string;
  value: string;
  fieldtype: string;
}

const statusColors = {
  Open: 'text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Closed: 'text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Replied: 'text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Not Replied': 'text-gray-500 dark:bg-gray-900/30 dark:text-gray-500',
};

const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Name', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Phone', visible: true, sortable: true },
  { key: 'company_name', label: 'Organization', visible: true, sortable: true },
  { key: 'lastContact', label: 'Last Contact', visible: true, sortable: true },
  { key: 'status', label: 'Status', visible: false, sortable: true },
  { key: 'assignedTo', label: 'Assigned To', visible: false, sortable: true },
];

export function ContactsTable({ searchTerm, onContactClick }: ContactsTableProps) {
  const { theme } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sortField, setSortField] = useState<keyof Contact | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [addressOptions, setAddressOptions] = useState([]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    company_name: [],
    owner: []
  });

  // Column management
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Bulk Edit state
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');
  const [fieldValue, setFieldValue] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  // Mobile dropdown state
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(new Set());

  const userSession = getUserSession();
  const Company = userSession?.company;

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    status: [] as string[],
    company_name: [] as string[],
    owner: [] as string[]
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      await fetchContacts();
    };

    fetchData();

    // Start the soft refresh interval (every 1 second)
    intervalRef.current = setInterval(() => {
      if (isMounted) {
        softRefreshContacts();
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Reset to first page when search term changes
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = getUserSession();

      if (!session) {
        setContacts([]);
        setLoading(false);
        return;
      }

      const requestBody = {
        doctype: "Contact",
        filters: {
          company: Company
        },
        order_by: "modified desc",
        default_filters: {},
        column_field: "status",
        columns: JSON.stringify([
          { "label": "Name", "type": "Data", "key": "full_name", "width": "17rem" },
          { "label": "Email", "type": "Data", "key": "email_id", "width": "12rem" },
          { "label": "Phone", "type": "Data", "key": "mobile_no", "width": "12rem" },
          { "label": "Organization", "type": "Data", "key": "company_name", "width": "12rem" },
          { "label": "Last Modified", "type": "Datetime", "key": "modified", "width": "8rem" }
        ]),
        kanban_columns: "[]",
        kanban_fields: "[]",
        page_length: 1000,
        page_length_count: 1000,
        rows: JSON.stringify(["name", "full_name", "company_name", "email_id", "mobile_no", "modified", "image", "status", "owner"]),
        title_field: "",
        view: {
          custom_view_name: 10,
          view_type: "list",
          group_by_field: "owner"
        }
      };

      const result = await api.post('/api/method/crm.api.doc.get_data', requestBody);

      // Transform the API response data
      const transformedContacts: Contact[] = result.message.data.map((apiContact: any) => ({
        id: apiContact.name || Math.random().toString(),
        name: apiContact.full_name || apiContact.first_name || 'Unknown',
        first_name: apiContact.first_name || '',
        full_name: apiContact.full_name || '',
        status: apiContact.status || 'Open',
        company_name: apiContact.company_name || 'N/A',
        email: apiContact.email_id || 'N/A',
        phone: apiContact.mobile_no || apiContact.phone || 'N/A',
        position: apiContact.designation || 'N/A',
        lastContact: formatDate(apiContact.modified),
        assignedTo: apiContact.owner || 'N/A',
        // Keep original API fields
        middle_name: apiContact.middle_name,
        last_name: apiContact.last_name,
        user: apiContact.user,
        salutation: apiContact.salutation,
        designation: apiContact.designation,
        gender: apiContact.gender,
        creation: apiContact.creation,
        modified: apiContact.modified,
        email_id: apiContact.email_id,
        mobile_no: apiContact.mobile_no,
        image: apiContact.image,
        owner: apiContact.owner
      }));

      setContacts(transformedContacts);

      // Extract unique values for filter options
      const statuses = [...new Set(transformedContacts.map(contact => contact.status).filter(Boolean))];
      const companies = [...new Set(transformedContacts.map(contact => contact.company_name).filter(Boolean))];
      const owners = [...new Set(transformedContacts.map(contact => contact.assignedTo).filter(Boolean))];

      setFilterOptions({
        status: statuses.filter((s): s is string => typeof s === 'string'),
        company_name: companies.filter((c): c is string => typeof c === 'string'),
        owner: owners.filter((o): o is string => typeof o === 'string')
      });

    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch contacts');
      showToast('Failed to fetch contacts', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const session = getUserSession();
      if (!session) return;

      const apiUrl = 'https://api.erpnext.ai/api/v2/document/Address';

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': AUTH_TOKEN
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setAddressOptions(result.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      showToast('Failed to fetch addresses', { type: 'error' });
    }
  };

  const fetchFieldOptions = async () => {
    try {
      const session = getUserSession();
      if (!session) return;

      const apiUrl = 'https://api.erpnext.ai/api/method/crm.api.doc.get_fields';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify({
          doctype: "Contact"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Transform the field options to a simpler format
      const options: FieldOption[] = result.message.map((field: any) => ({
        label: field.label || field.fieldname,
        value: field.fieldname,
        fieldtype: field.fieldtype
      }));

      setFieldOptions(options);
      await fetchAddresses();
    } catch (error) {
      console.error('Error fetching field options:', error);
      showToast('Failed to fetch field options', { type: 'error' });
    }
  };

  const softRefreshContacts = async () => {
    try {
      const session = getUserSession();

      if (!session) {
        return;
      }

      const requestBody = {
        doctype: "Contact",
        filters: {
          company: Company
        },
        order_by: "modified desc",
        default_filters: {},
        column_field: "status",
        columns: JSON.stringify([
          { "label": "Name", "type": "Data", "key": "full_name", "width": "17rem" },
          { "label": "Email", "type": "Data", "key": "email_id", "width": "12rem" },
          { "label": "Phone", "type": "Data", "key": "mobile_no", "width": "12rem" },
          { "label": "Organization", "type": "Data", "key": "company_name", "width": "12rem" },
          { "label": "Last Modified", "type": "Datetime", "key": "modified", "width": "8rem" }
        ]),
        kanban_columns: "[]",
        kanban_fields: "[]",
        page_length: 1000,
        page_length_count: 1000,
        rows: JSON.stringify(["name", "full_name", "company_name", "email_id", "mobile_no", "modified", "image", "status", "owner"]),
        title_field: "",
        view: {
          custom_view_name: 10,
          view_type: "list",
          group_by_field: "owner"
        }
      };

      const result = await api.post('/api/method/crm.api.doc.get_data', requestBody);

      const transformedContacts: Contact[] = result.message.data.map((apiContact: any) => ({
        id: apiContact.name || Math.random().toString(),
        name: apiContact.full_name || apiContact.first_name || 'Unknown',
        first_name: apiContact.first_name || '',
        full_name: apiContact.full_name || '',
        status: apiContact.status || 'Open',
        company_name: apiContact.company_name || 'N/A',
        email: apiContact.email_id || 'N/A',
        phone: apiContact.mobile_no || apiContact.phone || 'N/A',
        position: apiContact.designation || 'N/A',
        lastContact: formatDate(apiContact.modified),
        assignedTo: apiContact.owner || 'N/A',
        middle_name: apiContact.middle_name,
        last_name: apiContact.last_name,
        user: apiContact.user,
        salutation: apiContact.salutation,
        designation: apiContact.designation,
        gender: apiContact.gender,
        creation: apiContact.creation,
        modified: apiContact.modified,
        email_id: apiContact.email_id,
        mobile_no: apiContact.mobile_no,
        image: apiContact.image,
        owner: apiContact.owner
      }));

      setContacts(transformedContacts);
    } catch (error) {
      console.error('Soft refresh error:', error);
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

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = () => {
    fetchContacts();
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      company_name: [],
      owner: []
    });
    setCurrentPage(1);
  };

  const handleBulkUpdate = async () => {
    if (!selectedField || !fieldValue || selectedIds.length === 0) {
      showToast('Please select a field and enter a value', { type: 'error' });
      return;
    }

    setUpdating(true);
    try {
      const session = getUserSession();
      if (!session) {
        throw new Error('No active session');
      }

      const apiUrl = 'https://api.erpnext.ai/api/method/frappe.desk.doctype.bulk_update.bulk_update.submit_cancel_or_update_docs';

      const payload = {
        doctype: "Contact",
        docnames: selectedIds,
        action: "update",
        data: {
          [selectedField]: fieldValue
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.message || result.exc || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      if (response.status === 200 &&
        (result.message === "success" ||
          (Array.isArray(result.message) && result.message.length === 0) ||
          (result.message && result.message.status === "success"))) {
        showToast(`Updated ${selectedIds.length} record(s) successfully`, { type: 'success' });
        setShowBulkEdit(false);
        setSelectedField('');
        setFieldValue('');
        fetchContacts();
      } else {
        console.log('API Response:', result);
        throw new Error('Update failed with unknown response format');
      }
    } catch (error) {
      console.error('Error updating contacts:', error);
      showToast(error.message || 'Failed to update contacts', { type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const toggleColumn = (columnKey: keyof Contact) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleDeleteSelected = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = `https://api.erpnext.ai/api/method/frappe.desk.reportview.delete_items`;
      const payload = {
        items: JSON.stringify(selectedIds),
        doctype: "Contact"
      };

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to delete contacts: ${response.statusText}`);
      }

      setSelectedIds([]);
      fetchContacts();
      showToast('Contacts deleted successfully', { type: 'success' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete contacts');
      showToast('Failed to delete contacts', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedData = () => {
    let filteredData = contacts.filter(item => {
      const matchesSearch = searchTerm === '' || Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesStatus = filters.status.length === 0 ||
        (item.status && filters.status.includes(item.status));

      const matchesCompany = filters.company_name.length === 0 ||
        (item.company_name && filters.company_name.includes(item.company_name));

      const matchesOwner = filters.owner.length === 0 ||
        (item.assignedTo && filters.owner.includes(item.assignedTo));

      return matchesSearch && matchesStatus && matchesCompany && matchesOwner;
    });

    if (sortField) {
      filteredData.sort((a, b) => {
        const aValue = a[sortField] ?? '';
        const bValue = b[sortField] ?? '';

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  };

  const getPaginatedData = () => {
    const filteredData = getFilteredAndSortedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filteredData = getFilteredAndSortedData();
    return Math.ceil(filteredData.length / itemsPerPage);
  };

  const getVisibleColumns = () => columns.filter(col => col.visible);

  // Mobile dropdown functions
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

  const isContactExpanded = (contactId: string) => {
    return expandedContacts.has(contactId);
  };

  const handleRowSelection = (contactId: string) => {
    setSelectedIds(prevSelected =>
      prevSelected.includes(contactId)
        ? prevSelected.filter(id => id !== contactId)
        : [...prevSelected, contactId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentPageIds = paginatedData.map(d => d.id);
      setSelectedIds(currentPageIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = getFilteredAndSortedData().map(d => d.id);
    setSelectedIds(allFilteredIds);
  };

  const SortButton = ({ field, children }: { field: keyof Contact; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center space-x-1 text-left font-medium hover:text-gray-700 ${theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-900'
        }`}
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc'
          ? <ChevronUp className="w-4 h-4" />
          : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  const FilterDropdown = ({
    title,
    options,
    selected,
    onChange
  }: {
    title: string;
    options: string[];
    selected: string[];
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
        ? 'bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-center">
          <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purple-400' : 'text-blue-600'}`} />
          <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading contacts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
        ? 'bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        <div className="text-center">
          <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading contacts</div>
          <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
          <button
            onClick={fetchContacts}
            className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
              ? 'bg-purplebg text-white hover:bg-purple-700'
              : 'bg-purplebg text-white hover:purple-700'
              }`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const paginatedData = getPaginatedData();
  const totalPages = getTotalPages();
  const visibleColumns = getVisibleColumns();
  const filteredDataLength = getFilteredAndSortedData().length;

  return (
    <div className="">
      {/* Action Bar */}
      <div className="flex flex-col mb-3 sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${theme === 'dark'
              ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
              : 'border-gray-300 hover:bg-gray-50'
              }`}
          >
            <RefreshCcw className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors flex items-center space-x-1 ${Object.values(filters).some(arr => arr.length > 0)
                ? theme === 'dark'
                  ? 'border-purple-500 bg-purplebg/30 text-purple-300'
                  : 'border-blue-500 bg-blue-50 text-blue-700'
                : theme === 'dark'
                  ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                  : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {Object.values(filters).some(arr => arr.length > 0) && (
                <span className="bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)}
                </span>
              )}
            </button>

            {showFilters && (
              <div className={`absolute top-full left-0 mt-2 w-80 rounded-lg shadow-lg z-10 p-4 ${theme === 'dark'
                ? 'bg-dark-accent border border-purple-500/30'
                : 'bg-white border border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={clearFilters}
                      className={`text-sm ${theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className={theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-600'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filterOptions.status.length > 0 && (
                    <FilterDropdown
                      title="Status"
                      options={filterOptions.status}
                      selected={filters.status}
                      onChange={(value) => handleFilterChange('status', value)}
                    />
                  )}

                  {filterOptions.company_name.length > 0 && (
                    <FilterDropdown
                      title="Organization"
                      options={filterOptions.company_name}
                      selected={filters.company_name}
                      onChange={(value) => handleFilterChange('company_name', value)}
                    />
                  )}

                  {filterOptions.owner.length > 0 && (
                    <FilterDropdown
                      title="Assigned To"
                      options={filterOptions.owner}
                      selected={filters.owner}
                      onChange={(value) => handleFilterChange('owner', value)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors flex items-center space-x-1 ${theme === 'dark'
                ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Settings className="w-4 h-4" />
              <span>Columns</span>
            </button>

            {showColumnSettings && (
              <div className={`absolute top-full left-0 mt-2 w-64 rounded-lg shadow-lg z-10 p-4 ${theme === 'dark'
                ? 'bg-dark-accent border border-purple-500/30'
                : 'bg-white border border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manage Columns</h3>
                  <button
                    onClick={() => setShowColumnSettings(false)}
                    className={theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-600'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {columns.map(column => (
                    <label key={column.key} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => toggleColumn(column.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {getFilteredAndSortedData().length > 0 && (
              <div title="Export Excel">
                <button
                  onClick={() => exportToExcel(getFilteredAndSortedData(), 'Contacts')}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${theme === 'dark'
                    ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDataLength)} of {filteredDataLength} results
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={`text-sm border rounded px-2 py-1 ${theme === 'dark'
              ? 'bg-white-31 border-white text-white'
              : 'border-gray-300'
              }`}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Floating delete button */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2
         bg-white dark:bg-gray-800 shadow-2xl rounded-lg
         border dark:border-gray-700 p-2
         flex items-center justify-between
         w-[90%] max-w-md
         z-50 transition-all duration-300 ease-out">
          <span className="text-sm ml-4 text-gray-900 dark:text-white font-medium">
            {selectedIds.length} {selectedIds.length === 1 ? "Row" : "Rows"} selected
          </span>

          <div className="flex items-center space-x-4">
            {/* More actions */}
            <div className="relative">
              <button
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
                onClick={() => setShowMenu(prev => !prev)}
              >
                <BsThreeDots className="w-5 h-5" />
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 bottom-10 bg-white dark:bg-gray-700 dark:text-white shadow-lg rounded-md border dark:border-gray-600 py-1 w-40 z-50">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={async () => {
                      await fetchFieldOptions();
                      setShowBulkEdit(true);
                      setShowMenu(false);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSelectAllFiltered}
              className="text-sm font-medium text-gray-900 dark:text-white hover:underline"
            >
              Select all
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-gray-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Confirmation
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete {selectedIds.length} item(s)? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteSelected();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
        ? 'bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        <div className="w-full">
          {/* ================= Desktop Table View ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-b-purplebg' : 'bg-gray-50 border-gray-200'
                }`}>
                <tr className="divide-x-[1px]">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                      onChange={handleSelectAll}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate =
                            selectedIds.length > 0 &&
                            selectedIds.length < paginatedData.length;
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {visibleColumns.map(column => (
                    <th key={column.key} className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                      }`}>
                      {column.sortable ? (
                        <SortButton field={column.key}>{column.label}</SortButton>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
                {paginatedData.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                      }`}
                    onClick={() => onContactClick && onContactClick(contact)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(contact.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelection(contact.id);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    {visibleColumns.map(column => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {column.key === 'name' && (
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
                              }`}>
                              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                                }`}>
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.name}</div>
                          </div>
                        )}
                        {column.key === 'email' && (
                          <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Mail className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                            {contact.email}
                          </div>
                        )}
                        {column.key === 'phone' && (
                          <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Phone className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                            {contact.phone}
                          </div>
                        )}
                        {column.key === 'company_name' && (
                          <div className="flex items-center">
                            <Building2 className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.company_name}</div>
                          </div>
                        )}
                        {column.key === 'status' && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[contact.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                            }`}>
                            {contact.status}
                          </span>
                        )}
                        {!['name', 'email', 'phone', 'company_name', 'status'].includes(column.key) && (
                          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {contact[column.key] || 'N/A'}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= Mobile Card View ================= */}
          <div className="block md:hidden space-y-4">
            {paginatedData.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 rounded-lg border ${theme === 'dark'
                  ? 'bg-purplebg border-transparent'
                  : 'bg-white border-gray-200'
                  } shadow-sm`}
              >
                <div className="flex justify-between items-center">
                  <div 
                    className="flex items-center flex-1 cursor-pointer"
                    onClick={() => onContactClick && onContactClick(contact)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purple-700' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}
                      >
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3
                      className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                      {contact.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(contact.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelection(contact.id);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    {/* Dropdown arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleContactDetails(contact.id);
                      }}
                      className={`p-1 rounded transition-transform ${
                        theme === 'dark' ? 'hover:bg-purple-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${
                          isContactExpanded(contact.id) ? 'rotate-180' : ''
                        } ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Collapsible details section */}
                {isContactExpanded(contact.id) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {visibleColumns.map((column) =>
                      column.key !== 'name' ? (
                        <div
                          key={column.key}
                          className="flex justify-between text-sm py-1"
                        >
                          <span
                            className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                              }`}
                          >
                            {column.label}:
                          </span>
                          <span
                            className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}
                          >
                            {column.key === 'status' ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${statusColors[contact.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                                }`}>
                                {contact[column.key] || 'N/A'}
                              </span>
                            ) : (
                              contact[column.key] || 'N/A'
                            )}
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {paginatedData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No results found</div>
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Please adjust your search criteria or filters
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${currentPage === pageNum
                      ? theme === 'dark'
                        ? 'border-purple-500 bg-purplebg/30 text-purple-300'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : theme === 'dark'
                        ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                        : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Bulk Edit
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Field
                </label>
                <select
                  value={selectedField}
                  onChange={(e) => {
                    setSelectedField(e.target.value);
                    setFieldValue('');
                  }}
                  className={`w-full p-2 border rounded-lg ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="">Select a field</option>
                  {fieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedField && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Value
                  </label>

                  {/* Yes/No Dropdown for specific fields */}
                  {['is_primary_contact', 'sync_with_google_contacts', 'google_contacts'].includes(selectedField) && (
                    <select
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                      className={`w-full p-2 border rounded-lg ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="">Select Option</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  )}

                  {/* Salutation Dropdown */}
                  {selectedField === 'salutation' && (
                    <select
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                      className={`w-full p-2 border rounded-lg ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="">Select Salutation</option>
                      <option value="Mr">Mr</option>
                      <option value="Ms">Ms</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </select>
                  )}

                  {/* Gender Dropdown */}
                  {selectedField === 'gender' && (
                    <select
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                      className={`w-full p-2 border rounded-lg ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  )}

                  {/* Address Dropdown */}
                  {selectedField === 'address' && (
                    <div className="relative">
                      <select
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        className={`w-full p-2 border rounded-lg ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                          }`}
                      >
                        <option value="">Select Address</option>
                        {addressOptions.map((address) => (
                          <option key={address.name} value={address.name}>
                            {address.address_title || address.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Default Text Input for other fields */}
                  {!['salutation', 'gender', 'address', 'is_primary_contact', 'sync_with_google_contacts', 'google_contacts'].includes(selectedField) && (
                    <input
                      type="text"
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                      className={`w-full p-2 border rounded-lg ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      placeholder="Enter value"
                    />
                  )}
                </div>
              )}

              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Update {selectedIds.length} Record{selectedIds.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBulkEdit(false);
                  setSelectedField('');
                  setFieldValue('');
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={updating || !selectedField || !fieldValue}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                    Updating...
                  </>
                ) : (
                  'Update Records'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}