import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Mail, Phone, Building2, Loader2, ChevronLeft, ChevronRight, Filter, X, Settings, RefreshCcw, Download } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { getUserSession } from '../utils/session';

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
  const [sortField, setSortField] = useState<keyof Contact | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
  const userSession = getUserSession();
  const Company = userSession?.company;

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    status: [] as string[],
    company_name: [] as string[],
    owner: [] as string[]
  });

  useEffect(() => {
    fetchContacts();

    // Start the soft refresh interval (every 1 second)
    intervalRef.current = setInterval(() => {
      softRefreshContacts();
    }, 1000);

    // Cleanup interval on unmount
    return () => {
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

      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';

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

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

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

  // Soft refresh function - fetches data without showing loading state
  const softRefreshContacts = async () => {
    try {
      const session = getUserSession();

      if (!session) {
        return;
      }

      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_data';

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

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error('Soft refresh failed:', response.status, response.statusText);
        return;
      }

      const result = await response.json();

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

      // Update contacts silently
      setContacts(transformedContacts);
    } catch (error) {
      console.error('Soft refresh error:', error);
      // Silently fail - don't show error toast for soft refresh failures
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      company_name: [],
      owner: []
    });
    setCurrentPage(1);
  };

  const toggleColumn = (columnKey: keyof Contact) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleDeleteSelected = async () => {
    // if (!window.confirm(`Delete ${selectedIds.length} selected contact(s)?`)) return;

    setLoading(true);
    setError(null);

    try {
      const session = getUserSession();
      for (const id of selectedIds) {
        const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${id}`;
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${session.api_key}:${session.api_secret}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to delete contact ${id}: ${response.statusText}`);
        }
      }
      setSelectedIds([]); // Clear selection
      fetchContacts(); // Refresh data
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
      // Search filter
      const matchesSearch = searchTerm === '' || Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Status filter
      const matchesStatus = filters.status.length === 0 ||
        (item.status && filters.status.includes(item.status));

      // Company filter
      const matchesCompany = filters.company_name.length === 0 ||
        (item.company_name && filters.company_name.includes(item.company_name));

      // Owner filter
      const matchesOwner = filters.owner.length === 0 ||
        (item.assignedTo && filters.owner.includes(item.assignedTo));

      return matchesSearch && matchesStatus && matchesCompany && matchesOwner;
    });

    // Sort data
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
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
            {/* Export Excel Button */}
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
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center space-x-3">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
        ? 'bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-b-purplebg' : 'bg-gray-50 border-gray-200'
              }`}>
              <tr className="divide-x-[1px]">
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(contact => selectedIds.includes(contact.id))}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedIds([
                          ...selectedIds,
                          ...paginatedData
                            .map(contact => contact.id)
                            .filter(id => !selectedIds.includes(id))
                        ]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => !paginatedData.map(contact => contact.id).includes(id)));
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
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, contact.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== contact.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {visibleColumns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.key === 'name' && (
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
                            }`}>
                            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                              }`}>
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.name}</div>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
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

        {paginatedData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No results found</div>
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Try adjusting your search criteria or filters
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
    </div>
  );
}