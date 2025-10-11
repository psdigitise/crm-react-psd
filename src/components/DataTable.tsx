import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Phone, Loader2, ChevronLeft, ChevronRight, Filter, X, Settings, RefreshCcw } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { exportToExcel } from '../utils/exportUtils';
import { Download } from 'lucide-react';
import { getUserSession } from '../utils/session';
import { FaCircleDot } from 'react-icons/fa6';
import { DeleteLeadPopup } from './LeadsPopup/DeleteLeadPopup';
import { BsThreeDots } from 'react-icons/bs';
import { AssignToPopup } from './LeadsPopup/AssignToLeadPopup';
import { ClearAssignmentPopup } from './LeadsPopup/ClearAssignmentPopup';
import { BulkEditPopup } from './LeadsPopup/EditLeadPopup';
import { ConvertToDealPopup } from './LeadsPopup/ConvertToDealPopup';
import { AUTH_TOKEN } from '../api/apiUrl';
import { api } from '../api/apiService';
import { ExportPopup } from './LeadsPopup/ExportPopup';
import axios from 'axios';


interface Lead {
  id: string;
  name: string;
  organization: string;
  status: string;
  email: string;
  mobile: string;
  assignedTo: string;
  lastModified: string;
  website?: string;
  territory?: string;
  industry?: string;
  jobTitle?: string;
  source?: string;
  salutation?: string;
  firstName: string;
  lastName?: string;
  leadId: string;
  converted?: number;
  // API specific fields
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  docstatus?: number;
  idx?: number;
  mobile_no?: string;
  naming_series?: string;
  lead_name?: string;
  gender?: string;
  no_of_employees?: string;
  annual_revenue?: number;
  image?: string;
  first_name?: string;
  last_name?: string;
  lead_owner?: string;
}

interface DataTableProps {
  searchTerm: string;
  onLeadClick: (lead: Lead) => void;
}

interface FilterState {
  status: string[];
  territory: string[];
  industry: string[];
  assignedTo: string[];
}

interface ColumnConfig {
  key: keyof Lead;
  label: string;
  visible: boolean;
  sortable: boolean;
}

const statusColors = {
  New: '!text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300',
  Contacted: ' text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Qualified: ' text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Unqualified: ' text-gray-500 dark:bg-gray-900/30 dark:text-gray-500',
  Junk: 'bg-transparent text-black dark:bg-transparent dark:text-black',
  Nurture: ' text-violet-500 dark:bg-violet-900/30 dark:text-violet-500',
};


const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Name', visible: true, sortable: true },
  { key: 'organization', label: 'Organization', visible: true, sortable: true },
  { key: 'status', label: 'Status', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'mobile', label: 'Mobile No', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Assigned To', visible: true, sortable: true },
  { key: 'lastModified', label: 'Last Modified', visible: true, sortable: true },
  { key: 'territory', label: 'Territory', visible: false, sortable: true },
  { key: 'industry', label: 'Industry', visible: false, sortable: true },
  { key: 'website', label: 'Website', visible: false, sortable: true },
];

export function DataTable({ searchTerm, onLeadClick }: DataTableProps) {
  const { theme } = useTheme();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Lead | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssignPopupOpen, setIsAssignPopupOpen] = useState(false);
  const [isClearAssignmentPopupOpen, setIsClearAssignmentPopupOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  // const selectedLeads = data.filter(d => selectedIds.includes(d.id));
  const [filteredData, setFilteredData] = useState<Lead[]>([]);
  const [isConvertToDealPopupOpen, setIsConvertToDealPopupOpen] = useState(false);
  const [isBulkEditPopupOpen, setIsBulkEditPopupOpen] = useState(false);
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    territory: [],
    industry: [],
    assignedTo: []
  });

  // Column management
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'Excel' | 'CSV'>('Excel');
  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    status: ['New', 'Contacted', 'Qualified', 'Lost', 'Unqualified', 'Junk', 'Nurture'],
    territory: [] as string[],
    industry: [] as string[],
    assignedTo: [] as string[]
  });

  useEffect(() => {
    fetchLeads();
  }, [currentPage, itemsPerPage, sortField, sortDirection, filters]);

  useEffect(() => {
    // Reset to first page when search term changes
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!session?.api_key || !session?.api_secret) {
        setError("User session or API credentials not found.");
        setLeads([]);
        setLoading(false);
        return;
      }

      // The new API endpoint for the POST request
      //const apiUrl = 'https://api.erpnext.ai/api/method/crm.api.doc.get_data';

      // The payload (body) for the POST request, as you provided
      const payload = {
        "doctype": "CRM Lead",
        "filters": {
          "company": sessionCompany
        },
        "order_by": "modified desc",
        "default_filters": {
          "converted": 0
        },
        "view": {
          "custom_view_name": 2,
          "view_type": "list",
          "group_by_field": "owner"
        },
        "column_field": "status",
        "title_field": "",
        "kanban_columns": "[]",
        "kanban_fields": "[]",
        "columns": "[{\"label\": \"Name\", \"type\": \"Data\", \"key\": \"lead_name\", \"width\": \"12rem\"}, {\"label\": \"Organization\", \"type\": \"Link\", \"key\": \"organization\", \"options\": \"CRM Organization\", \"width\": \"10rem\"}, {\"label\": \"Status\", \"type\": \"Select\", \"key\": \"status\", \"width\": \"8rem\"}, {\"label\": \"Email\", \"type\": \"Data\", \"key\": \"email\", \"width\": \"12rem\"}, {\"label\": \"Mobile No\", \"type\": \"Data\", \"key\": \"mobile_no\", \"width\": \"11rem\"}, {\"label\": \"Assigned To\", \"type\": \"Text\", \"key\": \"_assign\", \"width\": \"10rem\"}, {\"label\": \"Last Modified\", \"type\": \"Datetime\", \"key\": \"modified\", \"width\": \"8rem\"}]",
        "rows": "[\"name\", \"lead_name\", \"organization\", \"status\", \"email\", \"mobile_no\", \"lead_owner\", \"first_name\", \"last_name\", \"salutation\", \"converted\", \"sla_status\", \"response_by\", \"first_response_time\", \"first_responded_on\", \"modified\", \"_assign\", \"image\", \"owner\", \"creation\", \"modified_by\", \"docstatus\", \"idx\", \"naming_series\", \"gender\", \"no_of_employees\", \"annual_revenue\", \"website\", \"territory\", \"industry\"]",
        "page_length": 20,
        "page_length_count": 20
      };

      // const response = await fetch(apiUrl, {
      //   method: 'POST', // Changed method to POST
      //   headers: {
      //     'Content-Type': 'application/json',
      //     // Authorization token remains the same
      //     'Authorization': AUTH_TOKEN
      //   },
      //   // Added the body with the JSON payload
      //   body: JSON.stringify(payload)
      // });

      // if (!response.ok) {
      //   // Try to get more specific error info from the response body
      //   const errorBody = await response.text();
      //   throw new Error(`HTTP ${response.status}: ${response.statusText}. Body: ${errorBody}`);
      // }

      // const result = await response.json();
      const result = await api.post('/api/method/crm.api.doc.get_data', payload);
      console.log('API Response:', result);

      // IMPORTANT: The response structure from the new API might be different.
      // The leads data may be in `result.message` or `result.message.data` instead of `result.data`.
      // Please inspect the `console.log` output and adjust the line below if necessary.
      const leadsData = result.message?.data || result.data || [];

      // The transformation logic below assumes the field names (e.g., apiLead.first_name) are still correct.
      // You may need to update these based on the new API's response.
      const transformedLeads: Lead[] = leadsData
        // The converted filter is now in the payload, but filtering again here is safe.
        .filter((apiLead: any) => apiLead.converted === 0)
        .map((apiLead: any) => ({
          id: apiLead.name || apiLead.idx?.toString() || Math.random().toString(),
          name: apiLead.name || 'Unknown',
          firstName: apiLead.first_name || apiLead.lead_name?.split(' ')[0] || 'Unknown',
          lastName: apiLead.last_name || apiLead.lead_name?.split(' ').slice(1).join(' ') || '',
          leadId: apiLead.name || 'N/A',
          organization: apiLead.organization || 'N/A',
          status: mapApiStatus(apiLead.status),
          email: apiLead.email || 'N/A',
          mobile: apiLead.mobile_no || 'N/A',
          assignedTo: apiLead.lead_owner || apiLead.owner || 'N/A',
          lastModified: formatDate(apiLead.modified),
          website: apiLead.website || '',
          territory: apiLead.territory || '',
          industry: apiLead.industry || '',
          jobTitle: '',
          source: '',
          salutation: apiLead.salutation || '',
          converted: apiLead.converted || 0,
          // Keep original API fields
          ...apiLead // A simpler way to keep all original fields
        }));

      setLeads(transformedLeads);
      setTotalItems(transformedLeads.length);
      setSelectedIds([]);

      // Extract unique values for filter options (this logic remains the same)
      const territories = [...new Set(transformedLeads.map(lead => lead.territory).filter(Boolean))];
      const industries = [...new Set(transformedLeads.map(lead => lead.industry).filter(Boolean))];
      const assignedUsers = [...new Set(transformedLeads.map(lead => lead.assignedTo).filter(Boolean))];

      setFilterOptions(prev => ({
        ...prev,
        territory: territories.filter((t): t is string => typeof t === 'string'),
        industry: industries.filter((i): i is string => typeof i === 'string'),
        assignedTo: assignedUsers
      }));

    } catch (error) {
      console.error('Error fetching leads:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };


  const mapApiStatus = (
    apiStatus: string
  ): 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Junk' | 'Nurture' | string => {
    if (!apiStatus) return 'New';
    const status = apiStatus.toLowerCase();

    // if (status.includes('unqualified')) return 'Unqualified';
    // if (status.includes('qualified')) return 'Qualified';
    // if (status.includes('contacted')) return 'Contacted';
    // if (status.includes('nurture')) return 'Nurture';
    // if (status.includes('junk')) return 'Junk';
    // if (status.includes('lost')) return 'Lost';
    // if (status.includes('new')) return 'New';
    return apiStatus;
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

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = () => {
    fetchLeads();
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
      territory: [],
      industry: [],
      assignedTo: []
    });
    setCurrentPage(1);
  };

  const toggleColumn = (columnKey: keyof Lead) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected lead(s)?`)) return;

    setLoading(true);
    setError(null);

    try {
      const session = getUserSession();
      for (const id of selectedIds) {
        const apiUrl = `https://api.erpnext.ai/api/v2/document/CRM Lead/${id}`;
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH_TOKEN
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to delete lead ${id}: ${response.statusText}`);
        }
      }
      setSelectedIds([]); // Clear selection
      fetchLeads(); // Refresh data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete leads');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedData = () => {
    let filteredData = leads.filter(item => {
      // Search filter
      const matchesSearch = searchTerm === '' || Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Status filter
      const matchesStatus = filters.status.length === 0 || filters.status.includes(item.status);

      // Territory filter
      const matchesTerritory = filters.territory.length === 0 ||
        (item.territory && filters.territory.includes(item.territory));

      // Industry filter
      const matchesIndustry = filters.industry.length === 0 ||
        (item.industry && filters.industry.includes(item.industry));

      // Assigned To filter
      const matchesAssignedTo = filters.assignedTo.length === 0 ||
        filters.assignedTo.includes(item.assignedTo);

      return matchesSearch && matchesStatus && matchesTerritory && matchesIndustry && matchesAssignedTo;
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

  const SortButton = ({ field, children }: { field: keyof Lead; children: React.ReactNode }) => (
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
          <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purplebg' : 'text-blue-600'}`} />
          <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading leads...</span>
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
          <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading leads</div>
          <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
          <button
            onClick={fetchLeads}
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
  console.log("visibleColumns", visibleColumns)
  const filteredDataLength = getFilteredAndSortedData().length;

  // const handleExport = async () => {
  //   setIsExporting(true);

  //   try {
  //     const baseUrl =
  //       "https://api.erpnext.ai/api/method/frappe.desk.reportview.export_query";

  //     // ✅ Prepare request parameters
  //     const params:any = {
  //       file_format_type: "Excel",
  //       title: "CRM Lead",
  //       doctype: "CRM Lead",
  //       fields: JSON.stringify(visibleColumns.map(col => col.key)),
  //       order_by: sortField ? `${sortField} ${sortDirection}` : "modified desc",
  //       view: "Report",
  //       with_comment_count: 1,
  //       page_length: itemsPerPage,
  //       start: (currentPage - 1) * itemsPerPage,
  //       filters: JSON.stringify({ ...filters, converted: 0 }),
  //     };

  //     // Add selected items if any
  //     if (selectedIds.length > 0) {
  //       params["selected_items"] = JSON.stringify(selectedIds);
  //     }

  //     // ✅ Make the GET request via Axios
  //     const response = await axios.get(baseUrl, {
  //       params,
  //       headers: {
  //         Authorization: AUTH_TOKEN,
  //       },
  //       responseType: "blob", // Important for downloading files
  //     });

  //     // ✅ Convert response to Blob and trigger download
  //     const blob = new Blob([response.data], {
  //       type:
  //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });

  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = downloadUrl;
  //     a.download = `leads_export_${new Date()
  //       .toISOString()
  //       .split("T")[0]}.xlsx`;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     window.URL.revokeObjectURL(downloadUrl);

  //   } catch (error: any) {
  //     console.error("Export failed:", error);
  //     alert(`Export failed: ${error.message}`);
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  const handleExport = async (exportType: string = 'Excel', exportAll: boolean = true) => {
    setIsExporting(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      const baseUrl =
        "https://api.erpnext.ai/api/method/frappe.desk.reportview.export_query";

      // Build filters object properly
      const exportFilters: any = {
        company: sessionCompany,
        converted: 0
      };

      // Add active filters with proper Frappe format
      if (filters.status.length > 0) {
        exportFilters['status'] = ['in', filters.status];
      }
      if (filters.territory.length > 0) {
        exportFilters['territory'] = ['in', filters.territory];
      }
      if (filters.industry.length > 0) {
        exportFilters['industry'] = ['in', filters.industry];
      }
      if (filters.assignedTo.length > 0) {
        exportFilters['lead_owner'] = ['in', filters.assignedTo];
      }

      // Map visible column keys to actual database field names
      const columnToFieldMap: Record<string, string> = {
        'name': 'name',
        'organization': 'organization',
        'status': 'status',
        'email': 'email',
        'mobile': 'mobile_no',
        'assignedTo': 'lead_owner',
        'lastModified': 'modified',
        'territory': 'territory',
        'industry': 'industry',
        'website': 'website',
        'firstName': 'first_name',
        'lastName': 'last_name',
        'leadId': 'name'
      };

      // Get only visible columns and map them to database field names
      const visibleFields = visibleColumns
        .map(col => columnToFieldMap[col.key] || col.key)
        .filter((field, index, self) => self.indexOf(field) === index)
        .map(field => `\`tabCRM Lead\`.\`${field}\``);

      console.log('Export format:', exportType);
      console.log('Export all records:', exportAll);

      // Prepare request parameters
      const params: any = {
        file_format_type: exportType,
        title: "CRM Lead",
        doctype: "CRM Lead",
        fields: JSON.stringify(visibleFields),
        order_by: sortField
          ? `\`tabCRM Lead\`.\`${columnToFieldMap[sortField] || sortField}\` ${sortDirection}`
          : "`tabCRM Lead`.`modified` desc",
        filters: JSON.stringify(exportFilters),
        view: "Report",
        with_comment_count: 1
      };

      // Handle export scope
      if (!exportAll && selectedIds.length > 0) {
        // Export only selected items
        params.selected_items = JSON.stringify(selectedIds);
        console.log('Exporting selected items:', selectedIds);
      } else {
        // Export all filtered records
        params.page_length = 500;
        params.start = 0;
        console.log('Exporting all filtered records');
      }

      console.log('Export params:', params);

      // Make the GET request
      const response = await axios.get(baseUrl, {
        params,
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        responseType: "blob"
      });

      // Check if the response is actually an error in JSON format
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || errorData.exception || 'Export failed');
      }

      // Determine file extension and MIME type based on export format
      const fileExtension = exportType.toLowerCase() === 'csv' ? 'csv' : 'xlsx';
      const mimeType = exportType.toLowerCase() === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // Create and download the file
      const blob = new Blob([response.data], {
        type: mimeType
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      // Create descriptive filename
      const scope = exportAll ? 'all' : 'selected';
      a.download = `leads_${scope}_${new Date().toISOString().split("T")[0]}.${fileExtension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      // ✅ SUCCESS: Refresh the table data after successful export
      console.log('Export completed successfully, refreshing table data...');
      // Refresh the leads data

      setIsExportPopupOpen(false);
      await fetchLeads();

    } catch (error: any) {
      console.error("Export failed:", error);
      console.error("Error response:", error.response?.data);

      // Try to extract error message from blob if it's JSON
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          alert(`Export failed: ${errorData.message || errorData.exception || 'Unknown error'}`);
        } catch {
          alert(`Export failed: ${error.message}`);
        }
      } else {
        alert(`Export failed: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsExporting(false);
    }
  };
  // Add format change handler
  const handleFormatChange = (format: string) => {
    if (format === 'Excel' || format === 'CSV') {
      setExportFormat(format);
    }
  };

  const handleDeleteConfirmation = async () => {
    if (selectedIds.length === 0) {
      console.error("No leads selected for deletion.");
      setIsDeletePopupOpen(false);
      return;
    }

    setIsDeleting(true);

    try {
      const session = getUserSession();

      // Use frappe.desk.reportview.delete_items to delete all selected items
      const deleteApiUrl = `https://api.erpnext.ai/api/method/frappe.desk.reportview.delete_items`;

      const deletePayload = {
        items: JSON.stringify(selectedIds),
        doctype: "CRM Lead"
      };

      const deleteResponse = await fetch(deleteApiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(deletePayload)
      });

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete leads: ${deleteResponse.statusText}`);
      }

      // Instead of making a second API call, just refetch the leads using your existing function
      await fetchLeads();

      setIsDeletePopupOpen(false);
      setSelectedIds([]);
      setShowDropdown(false);

    } catch (error) {
      console.error("Failed to delete leads:", error);
      setError(error instanceof Error ? error.message : 'Failed to delete leads');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to transform API data
  const transformApiData = (apiData: any[]): Lead[] => {
    return apiData
      .filter((apiLead: any) => apiLead.converted === 0)
      .map((apiLead: any) => ({
        id: apiLead.name || apiLead.idx?.toString() || Math.random().toString(),
        name: apiLead.name || 'Unknown',
        firstName: apiLead.first_name || apiLead.lead_name?.split(' ')[0] || 'Unknown',
        lastName: apiLead.last_name || apiLead.lead_name?.split(' ').slice(1).join(' ') || '',
        leadId: apiLead.name || 'N/A',
        organization: apiLead.organization || 'N/A',
        status: mapApiStatus(apiLead.status),
        email: apiLead.email || 'N/A',
        mobile: apiLead.mobile_no || 'N/A',
        assignedTo: apiLead.lead_owner || apiLead.owner || 'N/A',
        lastModified: formatDate(apiLead.modified),
        website: apiLead.website || '',
        territory: apiLead.territory || '',
        industry: apiLead.industry || '',
        jobTitle: '',
        source: '',
        salutation: apiLead.salutation || '',
        converted: apiLead.converted || 0,
        owner: apiLead.owner,
        creation: apiLead.creation,
        modified: apiLead.modified,
        modified_by: apiLead.modified_by,
        docstatus: apiLead.docstatus,
        idx: apiLead.idx,
        mobile_no: apiLead.mobile_no,
        naming_series: apiLead.naming_series,
        lead_name: apiLead.lead_name,
        gender: apiLead.gender,
        no_of_employees: apiLead.no_of_employees,
        annual_revenue: apiLead.annual_revenue,
        image: apiLead.image,
        first_name: apiLead.first_name,
        last_name: apiLead.last_name,
        lead_owner: apiLead.lead_owner
      }));
  };

  // Handler for individual row selection
  const handleRowSelection = (leadId: string) => {
    setSelectedIds(prevSelected =>
      prevSelected.includes(leadId)
        ? prevSelected.filter(id => id !== leadId)
        : [...prevSelected, leadId]
    );
  };

  // Handler for the "Select All" checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentPageIds = paginatedData.map(d => d.id);
      setSelectedIds(currentPageIds);
    } else {
      setSelectedIds([]);
    }
  };

  // Handler to select all filtered results
  const handleSelectAllFiltered = () => {
    const allFilteredIds = getFilteredAndSortedData().map(d => d.id);
    setSelectedIds(allFilteredIds);
  };

  return (
    <div className="">
      {/* Action Bar */}

      {selectedIds.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2
       bg-white dark:bg-gray-800 shadow-2xl rounded-lg
       border dark:border-gray-700 p-2
       flex items-center justify-between
       w-[90%] max-w-md
       z-50 transition-all duration-300 ease-out">
          {/* Left Section - Count */}
          <span className="ml-4 font-semibold text-sm text-gray-800 dark:text-white">
            {selectedIds.length} Row{selectedIds.length > 1 ? "s" : ""} selected
          </span>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3 relative">
            {/* Three dots button */}
            <button
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
              onClick={() => setShowDropdown(prev => !prev)}
            >
              <BsThreeDots className="w-5 h-5" />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 bottom-10 bg-white dark:bg-gray-700 shadow-lg rounded-md border dark:border-gray-600 py-1 w-40 z-50">
                {/* <button
                  onClick={() => {
                    setIsBulkEditPopupOpen(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Edit
                </button> */}
                <button
                  onClick={() => {
                    setIsDeletePopupOpen(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                  Delete
                </button>
                <button
                  onClick={() => {
                    setIsAssignPopupOpen(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Assign To
                </button>
                <button
                  onClick={() => {
                    setIsClearAssignmentPopupOpen(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Clear Assignment
                </button>
                <button
                  onClick={() => {
                    setIsConvertToDealPopupOpen(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Convert To Deal
                </button>
              </div>
            )}

            {/* Select all button */}
            <button
              onClick={handleSelectAllFiltered}
              className="text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 font-medium hover:underline"
            >
              Select all
            </button>

            {/* Clear selection */}
            <button
              onClick={() => {
                setSelectedIds([]);
                setShowDropdown(false);
              }}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

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
                      className={theme === 'dark' ? 'text-white hover:text-white' : 'text-white hover:text-gray-600'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <FilterDropdown
                    title="Status"
                    options={filterOptions.status}
                    selected={filters.status}
                    onChange={(value) => handleFilterChange('status', value)}
                  />

                  {filterOptions.territory.length > 0 && (
                    <FilterDropdown
                      title="Territory"
                      options={filterOptions.territory}
                      selected={filters.territory}
                      onChange={(value) => handleFilterChange('territory', value)}
                    />
                  )}

                  {filterOptions.industry.length > 0 && (
                    <FilterDropdown
                      title="Industry"
                      options={filterOptions.industry}
                      selected={filters.industry}
                      onChange={(value) => handleFilterChange('industry', value)}
                    />
                  )}

                  <FilterDropdown
                    title="Assigned To"
                    options={filterOptions.assignedTo}
                    selected={filters.assignedTo}
                    onChange={(value) => handleFilterChange('assignedTo', value)}
                  />
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
                    className={theme === 'dark' ? 'text-white hover:text-white' : 'text-white hover:text-gray-600'}
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
            {/* Export Excel Button - Renders only if there's data */}
            {filteredDataLength > 0 && (
              <div title="Export Excel">
                <button
                  // onClick={() => exportToExcel(getFilteredAndSortedData(), 'Leads')}
                  onClick={() => setIsExportPopupOpen(true)}
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

      {/* Table */}
      <div className={`rounded-lg shadow-sm border overflow-hidden ${theme === 'dark'
        ? 'bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-transparent ' : 'bg-gray-50 border-gray-200'
              }`}>
              <tr className="divide-x-[1px]">
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                    onChange={handleSelectAll}
                    ref={el => {
                      if (el) {
                        el.indeterminate = selectedIds.length > 0 && selectedIds.length < paginatedData.length;
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {visibleColumns.map(column => (
                  <th key={column.key} className={`px-6 py-0 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
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
              {paginatedData.map((lead, index) => (
                <tr
                  key={lead.id}
                  className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => onLeadClick(lead)}
                >
                  {/* Replace the existing checkbox in table rows */}
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(lead.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelection(lead.id);
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
                              {lead.firstName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{lead.name}</div>
                        </div>
                      )}
                      {column.key === 'organization' && (
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purplebg' : 'bg-blue-100'
                            }`}>
                            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-600'
                              }`}>
                              {lead.organization.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{lead.organization}</div>
                        </div>
                      )}
                      {column.key === 'status' && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                          <FaCircleDot className={`mr-1 ${statusColors[lead.status as keyof typeof statusColors]}`} />
                          {lead.status}
                        </span>
                      )}
                      {column.key === 'mobile' && (
                        <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <Phone className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                          {lead.mobile}
                        </div>
                      )}
                      {column.key === 'assignedTo' && (
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
                            }`}>
                            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                              }`}>
                              {lead.assignedTo.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{lead.assignedTo}</div>
                        </div>
                      )}
                      {!['name', 'organization', 'status', 'mobile', 'assignedTo'].includes(column.key) && (
                        <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {lead[column.key] || 'N/A'}
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
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
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

      <DeleteLeadPopup
        isOpen={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        onConfirm={handleDeleteConfirmation}
        isLoading={isDeleting}
        theme={theme}
      />
      <AssignToPopup
        isOpen={isAssignPopupOpen}
        onClose={() => setIsAssignPopupOpen(false)}
        selectedIds={selectedIds}
        theme={theme}
        onSuccess={() => {
          // Refresh the leads after successful assignment
          fetchLeads();
          setSelectedIds([]);
        }}
      />
      <ClearAssignmentPopup
        isOpen={isClearAssignmentPopupOpen}
        onClose={() => setIsClearAssignmentPopupOpen(false)}
        selectedIds={selectedIds}
        theme={theme}
        onSuccess={() => {
          // Refresh the leads after successful assignment clearing
          fetchLeads();
          setSelectedIds([]);
        }}
      />
      <BulkEditPopup
        isOpen={isBulkEditPopupOpen}
        onClose={() => setIsBulkEditPopupOpen(false)}
        selectedIds={selectedIds}
        theme={theme}
        onSuccess={() => {
          // Refresh the leads after successful bulk edit
          fetchLeads();
          setSelectedIds([]);
        }}
      />
      <ConvertToDealPopup
        isOpen={isConvertToDealPopupOpen}
        onClose={() => setIsConvertToDealPopupOpen(false)}
        selectedIds={selectedIds}
        theme={theme}
        onSuccess={() => {
          // Refresh the leads after successful conversion
          fetchLeads();
          setSelectedIds([]);
        }}
      />
      <ExportPopup
        isOpen={isExportPopupOpen}
        onClose={() => setIsExportPopupOpen(false)}
        onConfirm={handleExport}
        recordCount={filteredDataLength}
        theme={theme}
        isLoading={isExporting}
        onFormatChange={handleFormatChange}
        selectedCount={selectedIds.length}
        onRefresh={fetchLeads}
      />
    </div>
  );
}