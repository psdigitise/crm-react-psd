import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Globe, Building2, IndianRupee, Users, Loader2, ChevronLeft, ChevronRight, Filter, X, Settings, RefreshCcw, Download } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { getUserSession } from '../utils/session';
import { BsThreeDots } from 'react-icons/bs';

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

interface OrganizationsTableProps {
  searchTerm: string;
  onOrganizationClick?: (organization: Organization) => void;
}

interface FilterState {
  industry: string[];
  territory: string[];
  currency: string[];
}

interface ColumnConfig {
  key: keyof Organization;
  label: string;
  visible: boolean;
  sortable: boolean;
}

interface FieldOption {
  label: string;
  value: string;
  fieldtype: string;
  options?: string[];
}

interface BulkEditState {
  showModal: boolean;
  selectedField: string;
  selectedValue: string;
  fieldOptions: FieldOption[];
  loadingFields: boolean;
  updating: boolean;
}

const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Organization Name', visible: true, sortable: true },
  { key: 'website', label: 'Website', visible: true, sortable: true },
  { key: 'industry', label: 'Industry', visible: true, sortable: true },
  { key: 'annual_revenue', label: 'Annual Revenue', visible: true, sortable: true },
  { key: 'no_of_employees', label: 'Employees', visible: true, sortable: true },
  { key: 'territory', label: 'Territory', visible: true, sortable: true },
  { key: 'lastModified', label: 'Last Modified', visible: true, sortable: true },
  { key: 'currency', label: 'Currency', visible: false, sortable: true },
];

export function OrganizationsTable({ searchTerm, onOrganizationClick }: OrganizationsTableProps) {
  const { theme } = useTheme();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Organization | null>(null);
  const [showMenu, setShowMenu] = useState(false);
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
    industry: [],
    territory: [],
    currency: []
  });

  // Column management
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    industry: [] as string[],
    territory: [] as string[],
    currency: [] as string[]
  });

  const [bulkEdit, setBulkEdit] = useState<BulkEditState>({
    showModal: false,
    selectedField: '',
    selectedValue: '',
    fieldOptions: [
      { label: 'Organization Name', value: 'organization_name', fieldtype: 'Data' },
      // { label: 'No. of Employees', value: 'no_of_employees', fieldtype: 'Int' },
      {
        label: 'No. of Employees',
        value: 'no_of_employees',
        fieldtype: 'Select',
        options: ['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+']
      },
      { label: 'Industry', value: 'industry', fieldtype: 'Link', options: [] },
      { label: 'Website', value: 'website', fieldtype: 'Data' },
      { label: 'Annual Revenue', value: 'annual_revenue', fieldtype: 'Currency' },
      { label: 'Territory', value: 'territory', fieldtype: 'Link', options: [] },
      { label: 'Address', value: 'address', fieldtype: 'Text', options: [] }
    ],
    loadingFields: false,
    updating: false,
  });

  // State for dynamic options
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [territoryOptions, setTerritoryOptions] = useState<string[]>([]);
  const [addressOptions, setAddressOptions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    fetchOrganizations();
    fetchIndustryOptions();
    fetchTerritoryOptions();
    fetchAddressOptions();

    // Start the soft refresh interval (every 1 second)
    intervalRef.current = setInterval(() => {
      softRefreshOrganizations();
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

  const fetchIndustryOptions = async () => {
    try {
      const session = getUserSession();
      if (!session) return;

      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

      const requestBody = {
        txt: "",
        doctype: "CRM Industry"
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const industries = result.message.map((item: any) => item.value);
      setIndustryOptions(industries);

      // Update field options with industry values
      setBulkEdit(prev => ({
        ...prev,
        fieldOptions: prev.fieldOptions.map(field =>
          field.value === 'industry' ? { ...field, options: industries } : field
        )
      }));
    } catch (error) {
      console.error('Error fetching industry options:', error);
    }
  };

  const fetchTerritoryOptions = async () => {
    try {
      const session = getUserSession();
      if (!session) return;

      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.search.search_link';

      const requestBody = {
        txt: "",
        doctype: "CRM Territory"
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const territories = result.message.map((item: any) => item.value);
      setTerritoryOptions(territories);

      // Update field options with territory values
      setBulkEdit(prev => ({
        ...prev,
        fieldOptions: prev.fieldOptions.map(field =>
          field.value === 'territory' ? { ...field, options: territories } : field
        )
      }));
    } catch (error) {
      console.error('Error fetching territory options:', error);
    }
  };

  const fetchAddressOptions = async () => {
    try {
      const session = getUserSession();
      if (!session) return;

      const apiUrl = 'http://103.214.132.20:8002/api/v2/document/Address';

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const addresses = result.data.map((item: any) => item.address_title || item.name);
      setAddressOptions(addresses);

      // Update field options with address values
      setBulkEdit(prev => ({
        ...prev,
        fieldOptions: prev.fieldOptions.map(field =>
          field.value === 'address' ? { ...field, options: addresses } : field
        )
      }));
    } catch (error) {
      console.error('Error fetching address options:', error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!session) {
        setOrganizations([]);
        setLoading(false);
        return;
      }

      const apiUrl = `http://103.214.132.20:8002/api/method/crm.api.doc.get_data`;

      const requestBody = {
        doctype: "CRM Organization",
        filters: {
          company: sessionCompany
        },
        order_by: "modified desc",
        default_filters: {},
        column_field: "status",
        columns: JSON.stringify([
          { label: "Organization", type: "Data", key: "organization_name", width: "16rem" },
          { label: "Website", type: "Data", key: "website", width: "14rem" },
          { label: "Industry", type: "Link", key: "industry", options: "CRM Industry", width: "92px" },
          { label: "Annual Revenue", type: "Currency", key: "annual_revenue", width: "14rem" },
          { label: "Last Modified", type: "Datetime", key: "modified", width: "8rem" }
        ]),
        kanban_columns: JSON.stringify([]),
        kanban_fields: JSON.stringify([]),
        page_length: 1000,
        page_length_count: 1000,
        rows: JSON.stringify([
          "name", "organization_name", "organization_logo", "website", "industry",
          "currency", "annual_revenue", "modified", "owner", "creation",
          "modified_by", "_assign", "_liked_by", "territory", "no_of_employees"
        ]),
        title_field: "",
        view: {
          custom_view_name: 8,
          view_type: "list",
          group_by_field: "owner"
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Transform API data to match our Organization interface
      const transformedOrganizations: Organization[] = result.message.data.map((apiOrg: any) => ({
        id: apiOrg.name || Math.random().toString(),
        name: apiOrg.organization_name || 'Unknown',
        organization_name: apiOrg.organization_name || '',
        website: apiOrg.website || 'N/A',
        territory: apiOrg.territory || 'N/A',
        industry: apiOrg.industry || 'N/A',
        no_of_employees: apiOrg.no_of_employees || 'N/A',
        currency: apiOrg.currency || 'INR',
        annual_revenue: apiOrg.annual_revenue ? `${apiOrg.currency || 'INR'} ${apiOrg.annual_revenue}` : 'N/A',
        location: apiOrg.territory || 'N/A',
        lastModified: formatDate(apiOrg.modified),
        // Keep original API fields
        creation: apiOrg.creation,
        modified: apiOrg.modified
      }));

      setOrganizations(transformedOrganizations);

      // Extract unique values for filter options
      const industries = [...new Set(transformedOrganizations.map(org => org.industry).filter(Boolean))];
      const territories = [...new Set(transformedOrganizations.map(org => org.territory).filter(Boolean))];
      const currencies = [...new Set(transformedOrganizations.map(org => org.currency).filter(Boolean))];

      setFilterOptions({
        industry: industries.filter((i): i is string => typeof i === 'string'),
        territory: territories.filter((t): t is string => typeof t === 'string'),
        currency: currencies.filter((c): c is string => typeof c === 'string')
      });

    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch organizations');
      showToast('Failed to fetch organizations', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Soft refresh function - fetches data without showing loading state
  const softRefreshOrganizations = async () => {
    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!session) {
        return;
      }

      const apiUrl = `http://103.214.132.20:8002/api/method/crm.api.doc.get_data`;

      const requestBody = {
        doctype: "CRM Organization",
        filters: {
          company: sessionCompany
        },
        order_by: "modified desc",
        default_filters: {},
        column_field: "status",
        columns: JSON.stringify([
          { label: "Organization", type: "Data", key: "organization_name", width: "16rem" },
          { label: "Website", type: "Data", key: "website", width: "14rem" },
          { label: "Industry", type: "Link", key: "industry", options: "CRM Industry", width: "92px" },
          { label: "Annual Revenue", type: "Currency", key: "annual_revenue", width: "14rem" },
          { label: "Last Modified", type: "Datetime", key: "modified", width: "8rem" }
        ]),
        kanban_columns: JSON.stringify([]),
        kanban_fields: JSON.stringify([]),
        page_length: 1000,
        page_length_count: 1000,
        rows: JSON.stringify([
          "name", "organization_name", "organization_logo", "website", "industry",
          "currency", "annual_revenue", "modified", "owner", "creation",
          "modified_by", "_assign", "_liked_by", "territory", "no_of_employees"
        ]),
        title_field: "",
        view: {
          custom_view_name: 8,
          view_type: "list",
          group_by_field: "owner"
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error('Soft refresh failed:', response.status, response.statusText);
        return;
      }

      const result = await response.json();

      // Transform API data to match our Organization interface
      const transformedOrganizations: Organization[] = result.message.data.map((apiOrg: any) => ({
        id: apiOrg.name || Math.random().toString(),
        name: apiOrg.organization_name || 'Unknown',
        organization_name: apiOrg.organization_name || '',
        website: apiOrg.website || 'N/A',
        territory: apiOrg.territory || 'N/A',
        industry: apiOrg.industry || 'N/A',
        no_of_employees: apiOrg.no_of_employees || 'N/A',
        currency: apiOrg.currency || 'INR',
        annual_revenue: apiOrg.annual_revenue ? `${apiOrg.currency || 'INR'} ${apiOrg.annual_revenue}` : 'N/A',
        location: apiOrg.territory || 'N/A',
        lastModified: formatDate(apiOrg.modified),
        // Keep original API fields
        creation: apiOrg.creation,
        modified: apiOrg.modified
      }));

      // Update organizations silently
      setOrganizations(transformedOrganizations);
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

  const renderValueInput = () => {
    const selectedField = bulkEdit.fieldOptions.find(f => f.value === bulkEdit.selectedField);

    if (!selectedField) return null;

    // If field has options (dropdown)
    if (selectedField.options && selectedField.options.length > 0) {
      return (
        <select
          value={bulkEdit.selectedValue}
          onChange={(e) => setBulkEdit(prev => ({ ...prev, selectedValue: e.target.value }))}
          className={`w-full p-2 border rounded-lg ${theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900'
            }`}
        >
          <option value="">Select No. of Employees</option>
          {selectedField.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // For text/number fields
    return (
      <input
        type={selectedField.fieldtype === 'Int' || selectedField.fieldtype === 'Float' ? 'number' : 'text'}
        value={bulkEdit.selectedValue}
        onChange={(e) => setBulkEdit(prev => ({ ...prev, selectedValue: e.target.value }))}
        className={`w-full p-2 border rounded-lg ${theme === 'dark'
          ? 'bg-gray-700 border-gray-600 text-white'
          : 'bg-white border-gray-300 text-gray-900'
          }`}
        placeholder={`Enter ${selectedField.label}`}
      />
    );
  };

  const handleSort = (field: keyof Organization) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = () => {
    fetchOrganizations();
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
      industry: [],
      territory: [],
      currency: []
    });
    setCurrentPage(1);
  };

  const toggleColumn = (columnKey: keyof Organization) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  // Function to handle the delete API call
  const handleDeleteItems = async () => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const session = getUserSession();
      if (!session) {
        throw new Error('No active session');
      }

      const apiUrl = `http://103.214.132.20:8002/api/method/frappe.desk.reportview.delete_items`;

      const requestBody = {
        items: JSON.stringify(selectedIds),
        doctype: "CRM Organization"
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to delete items: ${response.statusText}`);
      }

      // Clear selection and refresh data
      setSelectedIds([]);
      setShowDeleteConfirm(false);
      fetchOrganizations();
      showToast('Items deleted successfully', { type: 'success' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete items');
      showToast('Failed to delete items', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkEdit.selectedField || !bulkEdit.selectedValue || selectedIds.length === 0) {
      showToast('Please select a field and value', { type: 'error' });
      return;
    }

    try {
      setBulkEdit(prev => ({ ...prev, updating: true }));
      const session = getUserSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Map frontend field names to backend field names
      const fieldMapping: Record<string, string> = {
        'organization_name': 'organization_name',
        'website': 'website',
        'no_of_employees': 'no_of_employees',
        'territory': 'territory',
        'currency': 'currency',
        'industry': 'industry',
        'annual_revenue': 'annual_revenue',
        'address': 'address'
      };

      const backendFieldName = fieldMapping[bulkEdit.selectedField] || bulkEdit.selectedField;

      // Use the correct API endpoint with the proper format
      const apiUrl = `http://103.214.132.20:8002/api/method/frappe.desk.doctype.bulk_update.bulk_update.submit_cancel_or_update_docs`;

      const requestBody = {
        doctype: "CRM Organization",
        docnames: selectedIds,
        action: "update",
        data: {
          [backendFieldName]: bulkEdit.selectedValue
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:f32066fea74d0fe`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!response.ok) {
        // Try to get error message from response
        const errorMsg = result.message || result.exc || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Updated success condition to handle empty array response
      // A 200 status with an empty array message indicates success in this API
      if (response.status === 200 &&
        (result.message === "success" ||
          (Array.isArray(result.message) && result.message.length === 0) ||
          (result.message && result.message.status === "success"))) {
        showToast('Records updated successfully', { type: 'success' });
        setBulkEdit(prev => ({
          ...prev,
          showModal: false,
          selectedField: '',
          selectedValue: '',
          updating: false
        }));
        setSelectedIds([]);
        fetchOrganizations(); // Refresh the data
      } else {
        // Log the actual response for debugging
        console.log('API Response:', result);
        throw new Error('Update failed with unknown response format');
      }
    } catch (error) {
      console.error('Error updating records:', error);
      setBulkEdit(prev => ({ ...prev, updating: false }));
      showToast(error.message || 'Failed to update records', { type: 'error' });
    }
  };

  const openBulkEditModal = () => {
    setBulkEdit(prev => ({ ...prev, showModal: true }));
  };

  const getFilteredAndSortedData = () => {
    let filteredData = organizations.filter(item => {
      // Search filter
      const matchesSearch = searchTerm === '' || Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Industry filter
      const matchesIndustry = filters.industry.length === 0 ||
        (item.industry && filters.industry.includes(item.industry));

      // Territory filter
      const matchesTerritory = filters.territory.length === 0 ||
        (item.territory && filters.territory.includes(item.territory));

      // Currency filter
      const matchesCurrency = filters.currency.length === 0 ||
        (item.currency && filters.currency.includes(item.currency));

      return matchesSearch && matchesIndustry && matchesTerritory && matchesCurrency;
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

  const SortButton = ({ field, children }: { field: keyof Organization; children: React.ReactNode }) => (
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
          <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading organizations...</span>
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
          <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading organizations</div>
          <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
          <button
            onClick={fetchOrganizations}
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
                <span className="bg-blue-600 text-white text-sm font-semibold rounded-full w-5 h-5 flex items-center justify-center">
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
                  {filterOptions.industry.length > 0 && (
                    <FilterDropdown
                      title="Industry"
                      options={filterOptions.industry}
                      selected={filters.industry}
                      onChange={(value) => handleFilterChange('industry', value)}
                    />
                  )}

                  {filterOptions.territory.length > 0 && (
                    <FilterDropdown
                      title="Territory"
                      options={filterOptions.territory}
                      selected={filters.territory}
                      onChange={(value) => handleFilterChange('territory', value)}
                    />
                  )}

                  {filterOptions.currency.length > 0 && (
                    <FilterDropdown
                      title="Currency"
                      options={filterOptions.currency}
                      selected={filters.currency}
                      onChange={(value) => handleFilterChange('currency', value)}
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
                  onClick={() => exportToExcel(getFilteredAndSortedData(), 'Organizations')}
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
            <option value={10}>10 per page </option>
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
          <span className="ml-4 font-semibold text-sm text-gray-800 dark:text-white">
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
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                    onClick={() => {
                      openBulkEditModal();
                      setShowMenu(false);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300"
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

            {/* Select all */}
            <button
              onClick={() => {
                const allIds = getFilteredAndSortedData().map((org) => org.id);
                setSelectedIds(allIds);
              }}
              className="text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 font-medium hover:underline"
            >
              Select all
            </button>

            {/* Close */}
            <button
              onClick={() => setSelectedIds([])}
              className="text-gray-400 hover:text-black dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 mt-1 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Delete Confirmation
            </h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete {selectedIds.length} item(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItems}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-b-purplebg' : 'bg-gray-50 border-gray-200'
              }`}>
              <tr className="divide-x-[1px]">
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(org => selectedIds.includes(org.id))}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedIds([
                          ...selectedIds,
                          ...paginatedData
                            .map(org => org.id)
                            .filter(id => !selectedIds.includes(id))
                        ]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => !paginatedData.map(org => org.id).includes(id)));
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
              {paginatedData.map((org) => (
                <tr
                  key={org.id}
                  className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => onOrganizationClick && onOrganizationClick(org)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(org.id)}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, org.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== org.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {visibleColumns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.key === 'name' && (
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-blue-100'
                            }`}>
                            <Building2 className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
                          </div>
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{org.name}</div>
                        </div>
                      )}
                      {column.key === 'website' && (
                        <div className={`flex items-center text-sm hover:text-blue-800 ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600'
                          }`}>
                          <Globe className="w-4 h-4 mr-2" />
                          <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            {org.website}
                          </a>
                        </div>
                      )}
                      {column.key === 'industry' && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {org.industry}
                        </span>
                      )}
                      {column.key === 'annual_revenue' && (
                        <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>
                          <IndianRupee className="w-4 h-4 mr-1" />
                          {org.annual_revenue}
                        </div>
                      )}
                      {column.key === 'no_of_employees' && (
                        <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <Users className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                          {org.no_of_employees}
                        </div>
                      )}
                      {!['name', 'website', 'industry', 'annual_revenue', 'no_of_employees'].includes(column.key) && (
                        <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {org[column.key] || 'N/A'}
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
      {bulkEdit.showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Bulk Edit
            </h3>

            <div className="space-y-4 mb-6">
              {/* Field Dropdown */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Field
                </label>
                <select
                  value={bulkEdit.selectedField}
                  onChange={(e) => setBulkEdit(prev => ({ ...prev, selectedField: e.target.value, selectedValue: '' }))}
                  className={`w-full p-2 border rounded-lg ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="">Select a field</option>
                  {bulkEdit.fieldOptions.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Input/Dropdown */}
              {bulkEdit.selectedField && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Value
                  </label>
                  {renderValueInput()}
                </div>
              )}

              {/* Selected Records Info */}
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                This will update {selectedIds.length} record(s)
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setBulkEdit(prev => ({ ...prev, showModal: false }))}
                className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={!bulkEdit.selectedField || !bulkEdit.selectedValue || bulkEdit.updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkEdit.updating ? 'Updating...' : 'Update Records'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}