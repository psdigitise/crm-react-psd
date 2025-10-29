import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Phone, Loader2, Filter, Settings, X, ChevronLeft, ChevronRight, RefreshCcw, Download } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { FaCircleDot } from 'react-icons/fa6';
import * as XLSX from 'xlsx';
import { apiAxios, AUTH_TOKEN } from '../api/apiUrl';
import { BsThreeDots } from 'react-icons/bs';
import { EditDealPopup } from './DealPopups/EditDealPopup';
import { DeleteDealPopup } from './DealPopups/DeleteDealPopup';
import { AssignDealPopup } from './DealPopups/AssignDealPopup';
import { ClearAssignmentPopup } from './DealPopups/ClearAssignmentPopup';
import axios from 'axios';
import { api } from '../api/apiService';
import { ExportPopup } from './LeadsPopup/ExportPopup';

interface Deal {
  id: string;
  name: string;
  organization: string;
  first_name: string;
  status: string;
  email: string;
  mobileNo: string;
  assignedTo: string;
  lastModified: string;
  annualRevenue: string;
  closeDate: string;
  website?: string;
  territory?: string;
  industry?: string;
  no_of_employees?: string;
  deal_owner?: string;
}

interface ApiDeal {
  name: string;
  organization_name: string;
  website: string;
  no_of_employees: string;
  territory: string;
  annual_revenue: string;
  industry: string;
  salutation: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  gender: string;
  status: string;
  deal_owner: string;
  modified: string;
}

interface DealsTableProps {
  searchTerm: string;
  onDealClick?: (deal: Deal) => void;
}

// const statusColors = {
//   Qualification: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//   // Demo/Making: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//   // Proposal/Quotation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//   Negotiation: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
// };
// const statusColors = {
//   Qualification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//   Demo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//   Proposal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//   Won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//   Lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-800',
//   ReadytoClose: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500',
//   Junk: 'bg-transparent text-black dark:bg-transparent dark:text-black',
//   Negotiation: 'bg-violet-500 text-violet-800 dark:bg-violet-900/30 dark:text-violet-500',
// };

const statusColors = {
  Qualification: ' !text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Demo/Making': ' !text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  'Proposal/Quotation': ' !text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Negotiation: ' !text-violet-800 dark:bg-violet-900/30 dark:text-violet-500',
  Won: ' !text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Lost: ' !text-red-800 dark:bg-red-900/30 dark:text-red-800',
  'Ready to Close': ' !text-orange-800 dark:bg-orange-900/30 dark:text-orange-500',
  Junk: 'bg-transparent text-black dark:bg-transparent dark:text-black',
};

const defaultColumns = [
  { key: 'organization', label: 'Organization', visible: true },
  // { key: 'first_name', label: 'First Name', visible: true },
  { key: 'name', label: 'Name', visible: false },
  { key: 'annualRevenue', label: 'Annual Revenue', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'mobileNo', label: 'Mobile No', visible: true },
  { key: 'assignedTo', label: 'Assigned To', visible: true },
  { key: 'lastModified', label: 'Last Modified', visible: true },
  { key: 'closeDate', label: 'Close Date', visible: true },
  { key: 'territory', label: 'Territory', visible: false },
  { key: 'industry', label: 'Industry', visible: false },
  { key: 'website', label: 'Website', visible: false }
];

export function DealsTable({ searchTerm, onDealClick }: DealsTableProps) {
  const { theme } = useTheme();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columns, setColumns] = useState(defaultColumns);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [currentEditDeal, setCurrentEditDeal] = useState<Deal | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssignPopupOpen, setIsAssignPopupOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isClearAssignmentPopupOpen, setIsClearAssignmentPopupOpen] = useState(false);
  const [isClearingAssignment, setIsClearingAssignment] = useState(false);
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'Excel' | 'CSV'>('Excel');
  // Filter state
  const [filters, setFilters] = useState({
    status: [] as string[],
    territory: [] as string[],
    industry: [] as string[],
    assignedTo: [] as string[]
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    status: [] as string[],
    territory: [] as string[],
    industry: [] as string[],
    assignedTo: [] as string[]
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setDeals([]);
        setLoading(false);
        return;
      }

      const requestData = {
        "doctype": "CRM Deal",
        "filters": {
          "company": sessionCompany
        },
        "order_by": "modified desc",
        "default_filters": {},
        "view": {
          "custom_view_name": 1,
          "view_type": "list",
          "group_by_field": "owner"
        },
        "column_field": "status",
        "title_field": "",
        "kanban_columns": "[]",
        "kanban_fields": "[]",
        "columns": "[{\"label\": \"Organization\", \"type\": \"Link\", \"key\": \"organization\", \"options\": \"CRM Organization\", \"width\": \"11rem\"}, {\"label\": \"First Name\", \"type\": \"Data\", \"key\": \"first_name\", \"width\": \"10rem\", \"align\": \"left\"}, {\"label\": \"Annual Revenue\", \"type\": \"Currency\", \"key\": \"annual_revenue\", \"align\": \"right\", \"width\": \"9rem\"}, {\"label\": \"Status\", \"type\": \"Select\", \"key\": \"status\", \"width\": \"10rem\"}, {\"label\": \"Email\", \"type\": \"Data\", \"key\": \"email\", \"width\": \"12rem\"}, {\"label\": \"Mobile No\", \"type\": \"Data\", \"key\": \"mobile_no\", \"width\": \"11rem\"}, {\"label\": \"Assigned To\", \"type\": \"Text\", \"key\": \"_assign\", \"width\": \"10rem\"}, {\"label\": \"Last Modified\", \"type\": \"Datetime\", \"key\": \"modified\", \"width\": \"8rem\"}, {\"label\": \"Close Date\", \"type\": \"Date\", \"key\": \"close_date\", \"width\": \"10rem\", \"align\": \"left\"}]",
        "rows": "[\"name\", \"organization\", \"annual_revenue\", \"status\", \"email\", \"currency\", \"mobile_no\", \"deal_owner\", \"sla_status\", \"response_by\", \"first_response_time\", \"first_responded_on\", \"modified\", \"_assign\", \"owner\", \"creation\", \"modified_by\", \"_liked_by\", null, \"first_name\"]",
        "page_length": 20,
        "page_length_count": 20
      };

      // const response = await fetch("https://api.erpnext.ai/api/method/crm.api.doc.get_data", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": AUTH_TOKEN
      //   },
      //   body: JSON.stringify(requestData)
      // });

      // if (!response.ok) {
      //   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      // }

      //const result = await response.json();
      const result = await api.post('/api/method/crm.api.doc.get_data', requestData);

      // Transform the API response to match your Deal interface
      const transformedDeals: Deal[] = result.message.data.map((apiDeal: any) => ({
        id: apiDeal.name || Math.random().toString(),
        organization: apiDeal.organization || 'N/A',
        first_name: apiDeal.first_name || 'Unknown',
        name: apiDeal.name || 'Unknown',
        status: apiDeal.status || 'Qualification',
        email: apiDeal.email || 'N/A',
        mobileNo: apiDeal.mobile_no || 'N/A',
        assignedTo: apiDeal._assign || apiDeal.deal_owner || 'N/A',
        lastModified: formatDate(apiDeal.modified),
        annualRevenue: formatCurrency(apiDeal.annual_revenue),
        closeDate: apiDeal.close_date ? formatDate(apiDeal.close_date) : 'N/A',
        territory: apiDeal.territory,
        industry: apiDeal.industry,
        website: apiDeal.website
      }));

      setDeals(transformedDeals);
      setSelectedDeals([]);

      // Update filter options
      setFilterOptions({
        status: Array.from(new Set(transformedDeals.map(d => d.status).filter(Boolean))),
        territory: Array.from(new Set(transformedDeals.map(d => d.territory).filter(Boolean))),
        industry: Array.from(new Set(transformedDeals.map(d => d.industry).filter(Boolean))),
        // assignedTo: Array.from(new Set(transformedDeals.map(d => d.assignedTo).filter(Boolean)))
        assignedTo: Array.from(new Set(
          transformedDeals.flatMap(d => {
            let names: string[] = [];
            if (Array.isArray(d.assignedTo)) {
              names = d.assignedTo;
            } else if (typeof d.assignedTo === "string") {
              try {
                const parsed = JSON.parse(d.assignedTo);
                names = Array.isArray(parsed) ? parsed : d.assignedTo.split(",");
              } catch {
                names = d.assignedTo.split(",");
              }
            }
            return names.map(name => name.trim()).filter(name => name !== "");
          })
        ))

      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
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

  const formatCurrency = (value?: string | number): string => {
    if (!value) return '₹0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(numValue);
  };

  // Handler for individual row selection
  const handleRowSelection = (dealId: string) => {
    setSelectedDeals(prevSelected =>
      prevSelected.includes(dealId)
        ? prevSelected.filter(id => id !== dealId)
        : [...prevSelected, dealId]
    );
  };

  // Handler for the "Select All" checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentPageIds = paginatedData.map(d => d.id);
      setSelectedDeals(currentPageIds);
    } else {
      setSelectedDeals([]);
    }
  };

  // Handler to select all filtered results
  const handleSelectAllFiltered = () => {
    const allFilteredIds = sortedData.map(d => d.id);
    setSelectedDeals(allFilteredIds);
  };

  // Filtering, sorting, and pagination
  const filteredData = deals.filter(item => {
    const matchesSearch = searchTerm === '' || Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = filters.status.length === 0 || filters.status.includes(item.status);
    const matchesTerritory = filters.territory.length === 0 || (item.territory && filters.territory.includes(item.territory));
    const matchesIndustry = filters.industry.length === 0 || (item.industry && filters.industry.includes(item.industry));
    const matchesAssignedTo = filters.assignedTo.length === 0 || filters.assignedTo.includes(item.assignedTo);
    return matchesSearch && matchesStatus && matchesTerritory && matchesIndustry && matchesAssignedTo;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField as keyof Deal]?.toString() || '';
    const bValue = b[sortField as keyof Deal]?.toString() || '';
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Column management
  const toggleColumn = (columnKey: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to Excel
  const handleExport = async (exportType: string = 'Excel', exportAll: boolean = true) => {
    setIsExporting(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      const baseUrl = "https://api.erpnext.ai/api/method/frappe.desk.reportview.export_query";

      // Build filters object
      const exportFilters: any = {
        company: sessionCompany
      };

      // Add active filters
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
        exportFilters['deal_owner'] = ['in', filters.assignedTo];
      }

      // Map visible column keys to actual database field names
      const columnToFieldMap: Record<string, string> = {
        'organization': 'organization',
        'name': 'name',
        'annualRevenue': 'annual_revenue',
        'status': 'status',
        'email': 'email',
        'mobileNo': 'mobile_no',
        'assignedTo': 'deal_owner',
        'lastModified': 'modified',
        'closeDate': 'close_date',
        'territory': 'territory',
        'industry': 'industry',
        'website': 'website',
        'first_name': 'first_name'
      };

      // Get visible columns and map to database fields
      const visibleFields = columns
        .filter(col => col.visible)
        .map(col => columnToFieldMap[col.key] || col.key)
        .filter((field, index, self) => self.indexOf(field) === index)
        .map(field => `\`tabCRM Deal\`.\`${field}\``);

      console.log('Export format:', exportType);
      console.log('Export all records:', exportAll);

      // Prepare request parameters
      const params: any = {
        file_format_type: exportType,
        title: "CRM Deal",
        doctype: "CRM Deal",
        fields: JSON.stringify(visibleFields),
        order_by: sortField
          ? `\`tabCRM Deal\`.\`${columnToFieldMap[sortField] || sortField}\` ${sortDirection}`
          : "`tabCRM Deal`.`modified` desc",
        filters: JSON.stringify(exportFilters),
        view: "Report",
        with_comment_count: 1
      };

      // Handle export scope
      if (!exportAll && selectedDeals.length > 0) {
        // Export only selected items
        params.selected_items = JSON.stringify(selectedDeals);
        console.log('Exporting selected deals:', selectedDeals);
      } else {
        // Export all filtered records
        params.page_length = 500;
        params.start = 0;
        console.log('Exporting all filtered deals');
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
      a.download = `deals_${scope}_${new Date().toISOString().split("T")[0]}.${fileExtension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setIsExportPopupOpen(false);
      await fetchDeals();
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

  // Filter dropdown
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

  // Handler functions
  const handleEditClick = (deal: Deal) => {
    setSelectedDeals([deal.id]);
    setIsEditPopupOpen(true);
    setShowDropdown(false);
  };

  const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
    setCurrentEditDeal(null);
  };

  const handleDeleteConfirmation = async () => {
    if (selectedDeals.length === 0) {
      console.error("No deals selected for deletion.");
      setIsDeletePopupOpen(false);
      return;
    }

    setIsDeleting(true);

    try {
      const requestBody = {
        doctype: "CRM Deal",
        items: JSON.stringify(selectedDeals),
      };

      const response = await apiAxios.post(
        "/api/method/frappe.desk.reportview.delete_items",
        requestBody,
        {
          headers: {
            "Authorization": AUTH_TOKEN,
          },
        }
      );

      console.log("Deals deleted successfully:", response.data);
      setIsDeletePopupOpen(false);
      setSelectedDeals([]);
      setShowDropdown(false);
      await fetchDeals();

    } catch (error) {
      let errorMessage = "An unknown error occurred during deletion.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || `API Error: ${error.response.status}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Failed to delete deals:", errorMessage);
      setError(errorMessage);

    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignConfirmation = (assignee: string) => {
    setIsAssigning(true);
    console.log(`Assigning deals to ${assignee}`);

    setTimeout(() => {
      setIsAssigning(false);
      setIsAssignPopupOpen(false);
      setSelectedDeals([]);
      fetchDeals();
    }, 1000);
  };

  const handleClearAssignmentConfirmation = async () => {
    setIsClearingAssignment(true);
    setError(null);

    try {
      if (selectedDeals.length === 0) {
        throw new Error("No deals selected for clearing assignment.");
      }

      const apiUrl = "https://api.erpnext.ai/api/method/frappe.desk.form.assign_to.remove_multiple";

      const payload = {
        doctype: "CRM Deal",
        names: JSON.stringify(selectedDeals),
        ignore_permissions: true
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to clear assignment: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Clear assignment successful:', result);

      setSelectedDeals([]);
      await fetchDeals();

    } catch (error) {
      console.error("Failed to clear assignment:", error);
      setError(error instanceof Error ? error.message : 'Failed to clear assignment');
    } finally {
      setIsClearingAssignment(false);
      setIsClearAssignmentPopupOpen(false);
    }
  };

  // Render cell function with updated assignedTo logic
  const renderCell = (deal: Deal, key: keyof Deal, theme: string) => {
    switch (key) {
      case 'name':
        return (
          <div className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
              }`}>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}>
                {deal.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {deal.name}
            </div>
          </div>
        );
      case 'organization':
        return (
          <div className="flex items-center">
            <div className={`w-6 h-6 rounded flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purplebg' : 'bg-blue-100'
              }`}>
              <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-600'
                }`}>
                {deal.organization.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {deal.organization}
            </div>
          </div>
        );
      case 'first_name':
        return (
          <div className="flex items-center">
            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {deal.first_name}
            </div>
          </div>
        );
      case 'status':
        return (
          <span className={` inline-flex text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaCircleDot className={`mr-2 flex items-center text-white ${statusColors[deal.status as keyof typeof statusColors]}`} />
            {deal.status}
          </span>
        );
      case 'mobileNo':
        return (
          <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Phone className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
            {deal.mobileNo}
          </div>
        );
      case 'assignedTo':
        // Handle both string and array formats for assignedTo
        let assignedNames: string[] = [];

        if (Array.isArray(deal.assignedTo)) {
          // If it's already an array, use it directly
          assignedNames = deal.assignedTo.map(name => name.trim()).filter(name => name);
        } else if (typeof deal.assignedTo === 'string') {
          // If it's a string, try to parse it as JSON array first
          try {
            const parsed = JSON.parse(deal.assignedTo);
            if (Array.isArray(parsed)) {
              assignedNames = parsed.map(name => name.trim()).filter(name => name);
            } else {
              // If not a JSON array, split by commas
              assignedNames = deal.assignedTo.split(',').map(name => name.trim()).filter(name => name);
            }
          } catch {
            // If JSON parsing fails, split by commas
            assignedNames = deal.assignedTo.split(',').map(name => name.trim()).filter(name => name);
          }
        }

        if (assignedNames.length === 0) {
          return (
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Unassigned
            </div>
          );
        } else if (assignedNames.length === 1) {
          // Single name - show as before
          return (
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
                }`}>
                <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  {assignedNames[0].charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {assignedNames[0]}
              </div>
            </div>
          );
        } else {
          // Multiple names - show in the format from your image
          return (
            <div className="flex items-center">
              {assignedNames.slice(0, 3).map((name, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${theme === "dark" ? "bg-purplebg border-purplebg" : "bg-gray-200 border-white"
                    }`}
                  style={{
                    marginLeft: index === 0 ? "0px" : "-8px", // overlap effect
                    zIndex: 10 - index, // keep order visible
                  }}
                >
                  <span
                    className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-gray-700"
                      }`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}

              {assignedNames.length > 3 && (
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${theme === "dark" ? "bg-purplebg border-purplebg" : "bg-gray-200 border-white"
                    }`}
                  style={{ marginLeft: "-8px" }}
                >
                  <span
                    className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-gray-700"
                      }`}
                  >
                    +{assignedNames.length - 3}
                  </span>
                </div>
              )}
            </div>
          );
        }
      case 'annualRevenue':
        return (
          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
            {deal.annualRevenue}
          </div>
        );
      case 'lastModified':
        return (
          <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
            {deal.lastModified}
          </div>
        );
      case 'email':
        return (
          <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
            {deal.email}
          </div>
        );
      case 'closeDate':
        return (
          <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
            {deal.closeDate}
          </div>
        );
      default:
        return deal[key]?.toString() || 'N/A';
    }
  };

  if (loading) {
    return (
      <div className={`rounded-lg shadow-sm border p-8 ${theme === 'dark'
        ? 'bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-center">
          <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purplebg' : 'text-blue-600'}`} />
          <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading deals...</span>
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
          <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading deals</div>
          <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
          <button
            onClick={fetchDeals}
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

  return (
    <div className=" max-h-[100vh]  pr-3">
      {/* Action Bar */}
      <div className="flex flex-col mb-3  sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDeals}
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
                      onClick={() => setFilters({ status: [], territory: [], industry: [], assignedTo: [] })}
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
                    onChange={value => setFilters(f => ({
                      ...f,
                      status: f.status.includes(value)
                        ? f.status.filter(v => v !== value)
                        : [...f.status, value]
                    }))}
                  />
                  {filterOptions.territory.length > 0 && (
                    <FilterDropdown
                      title="Territory"
                      options={filterOptions.territory}
                      selected={filters.territory}
                      onChange={value => setFilters(f => ({
                        ...f,
                        territory: f.territory.includes(value)
                          ? f.territory.filter(v => v !== value)
                          : [...f.territory, value]
                      }))}
                    />
                  )}
                  {filterOptions.industry.length > 0 && (
                    <FilterDropdown
                      title="Industry"
                      options={filterOptions.industry}
                      selected={filters.industry}
                      onChange={value => setFilters(f => ({
                        ...f,
                        industry: f.industry.includes(value)
                          ? f.industry.filter(v => v !== value)
                          : [...f.industry, value]
                      }))}
                    />
                  )}
                  <FilterDropdown
                    title="Assigned To"
                    options={filterOptions.assignedTo}
                    selected={filters.assignedTo}
                    onChange={value => setFilters(f => ({
                      ...f,
                      assignedTo: f.assignedTo.includes(value)
                        ? f.assignedTo.filter(v => v !== value)
                        : [...f.assignedTo, value]
                    }))}
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
          {/* Only show download button when there's data */}
          {sortedData.length > 0 && (
            <button
              onClick={() => setIsExportPopupOpen(true)}
              title="Export to Excel"
              className={`p-2 text-sm border rounded-lg transition-colors flex items-center justify-center ${theme === 'dark'
                ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
          </span>
          <select
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={`text-sm border rounded px-2 py-1 ${theme === 'dark'
              ? 'bg-white-31 border-white text-white'
              : 'border-gray-300'
              }`}
          >
            <option value={5}>5 per page</option>
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
                <th className="p-3.5">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedData.length > 0 && selectedDeals.length === paginatedData.length}
                    // ref={el => {
                    //   if (el) {
                    //     el.indeterminate = selectedDeals.length > 0 && selectedDeals.length < paginatedData.length;
                    //   }
                    // }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {columns.filter(col => col.visible).map(column => (
                  <th key={column.key} className={`p-3.5 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                    }`}>
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center space-x-1 text-left font-medium hover:text-gray-700"
                    >
                      <span>{column.label}</span>
                      {sortField === column.key && (
                        sortDirection === 'asc'
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
              {paginatedData.map((deal) => (
                <tr
                  key={deal.id}
                  className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => onDealClick?.(deal)}
                >
                  <td className="px-6 py-4 whitespace-nowrap flex justify-center">
                    <input
                      type="checkbox"
                      checked={selectedDeals.includes(deal.id)}
                      onChange={() => handleRowSelection(deal.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {columns.filter(col => col.visible).map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {renderCell(deal, column.key as keyof Deal, theme)}
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

      {selectedDeals.length > 0 && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2
               bg-white dark:bg-gray-800 shadow-2xl rounded-lg
               border dark:border-gray-700 p-2
               flex items-center justify-between
               w-[90%] max-w-md
               z-50 transition-all duration-300 ease-out"
        >
          {/* Left Section - Count */}
          <span className="ml-4 font-semibold text-sm text-gray-800 dark:text-white">
            {selectedDeals.length} Row{selectedDeals.length > 1 ? "s" : ""} selected
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
                    // Remove the single selection restriction
                    setIsEditPopupOpen(true);
                    setShowDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${selectedDeals.length === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  disabled={selectedDeals.length === 0}
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
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                  Assign To
                </button>
                <button
                  onClick={() => {
                    setIsClearAssignmentPopupOpen(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                  Clear Assignment
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
                setSelectedDeals([]);
                setShowDropdown(false);
              }}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <EditDealPopup
        isOpen={isEditPopupOpen}
        onClose={handleCloseEditPopup}
        selectedIds={selectedDeals}
        theme={theme}
        onSuccess={() => {
          fetchDeals();
          setSelectedDeals([]);
        }}
      />
      <DeleteDealPopup
        isOpen={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        onConfirm={handleDeleteConfirmation}
        isLoading={isDeleting}
        theme={theme}
      />
      <AssignDealPopup
        isOpen={isAssignPopupOpen}
        onClose={() => setIsAssignPopupOpen(false)}
        onAssign={handleAssignConfirmation}
        isLoading={isAssigning}
        assignOptions={filterOptions.assignedTo}
        currentAssignee={selectedDeals.length === 1
          ? deals.find(d => d.id === selectedDeals[0])?.assignedTo || ''
          : ''}
        theme={theme}
      />
      <ClearAssignmentPopup
        isOpen={isClearAssignmentPopupOpen}
        onClose={() => setIsClearAssignmentPopupOpen(false)}
        onConfirm={handleClearAssignmentConfirmation}
        isLoading={isClearingAssignment}
        theme={theme}
      />
      <ExportPopup
        isOpen={isExportPopupOpen}
        onClose={() => setIsExportPopupOpen(false)}
        onConfirm={handleExport}
        recordCount={sortedData.length}
        selectedCount={selectedDeals.length}
        theme={theme}
        isLoading={isExporting}
        onFormatChange={handleFormatChange}
        onRefresh={fetchDeals}
      />
    </div>
  );
}