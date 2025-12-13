import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Phone, Loader2, ChevronLeft, ChevronRight, Filter, X, Settings, RefreshCcw, Upload, Download, LayoutGrid, List } from 'lucide-react';
import { useTheme } from './ThemeProvider';
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
import { LinkedItemsPopup } from './LeadsPopup/LinkedItemsPopup';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { getAuthToken } from '../api/apiUrl';

// Add toast notification component
const Toast = ({ message, type = 'error', onClose }: { message: string; type?: 'error' | 'success'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
      }`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

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
  _assign?: string;
  lead_score?: number;
  lead_summary?: string;
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

interface UnmappedColumn {
  column_name: string;
  suggested_field: string | null;
}

const statusColors: Record<string, string> = {
  New: '!text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300',
  Contacted: ' text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Qualified: ' text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Unqualified: ' text-gray-500 dark:bg-gray-900/30 dark:text-gray-500',
  Junk: 'bg-transparent text-black dark:bg-gray-900/30 dark:text-gray-400',
  Nurture: ' text-violet-500 dark:bg-violet-900/30 dark:text-violet-500',
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
};

const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Lead Name', visible: true, sortable: true },
  { key: 'firstName', label: 'First Name', visible: false, sortable: true },
  { key: 'lastName', label: 'Last Name', visible: false, sortable: true },
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
  const [linkedItems, setLinkedItems] = useState<any[]>([]);
  const [isLinkedItemsPopupOpen, setIsLinkedItemsPopupOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isCheckingLinkedItems, setIsCheckingLinkedItems] = useState(false);
  const [showDeleteLinkedConfirm, setShowDeleteLinkedConfirm] = useState(false);
  const [leadsToDelete, setLeadsToDelete] = useState<string[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
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

  // View mode state
  const [view, setView] = useState<'table' | 'kanban'>('table');




  // Mobile dropdown state
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Column mapping state
  const [unmappedColumns, setUnmappedColumns] = useState<UnmappedColumn[]>([]);
  const [manualMappings, setManualMappings] = useState<Record<string, string>>({});
  const [showMappingPopup, setShowMappingPopup] = useState(false);

  // Import popup state
  const [showImportPopup, setShowImportPopup] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    status: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Junk', 'Nurture'],
    territory: [] as string[],
    industry: [] as string[],

  });
  const token = getAuthToken();

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  useEffect(() => {
    fetchLeads();
  }, [currentPage, itemsPerPage, sortField, sortDirection, filters]);

  useEffect(() => {
    // Reset to first page when search term changes
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const analyzeLeadScore = async (leadId: string) => {
    try {
      const response = await axios.get(
        'https://api.erpnext.ai/api/method/customcrm.email.getcompany_info.analyze_lead_score',
        {
          params: { lead_id: leadId },
          headers: {
            Authorization: token,
          }
        }
      );

      console.log("Analyze API response:", response.data);
      return response.data.message;
    } catch (error: any) {
      console.error("Error analyzing lead score:", error);
      if (error.response) {
        console.error("Server Response:", error.response.data);
      }
      return null;
    }
  };

  const saveLeadScore = async (leadId: string, score: number, summary: string) => {
    try {
      await axios.post(
        "https://api.erpnext.ai/api/method/frappe.client.set_value",
        {
          doctype: "CRM Lead",
          name: leadId,
          fieldname: { lead_score: score, lead_summary: summary }
        },
        { headers: { Authorization: token } }
      );

      console.log("Lead score & summary updated!");
    } catch (error: any) {
      console.error("Error updating score:", error.response?.data || error);
    }
  };

  const handleLeadOpen = async (lead: Lead, preGeneratedSummary?: string) => {
    onLeadClick(lead);

    console.log("Analyzing lead score for:", lead.id);

    const analysis = await analyzeLeadScore(lead.id);
    if (!analysis) return;

    const lead_score = analysis.lead_score || analysis.score;
    const lead_summary = preGeneratedSummary || analysis.lead_summary || analysis.summary;

    if (lead_score !== undefined && lead_summary) {
      await saveLeadScore(lead.id, lead_score, lead_summary);

      setLeads(prev =>
        prev.map(l =>
          l.id === lead.id
            ? {
              ...l,
              lead_score: lead_score.toString(),
              lead_summary: lead_summary
            }
            : l
        )
      );
    }
  };

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
        "page_length": 9000000000000,
        "page_length_count": 9000000000000
      };

      const result = await api.post('/api/method/crm.api.doc.get_data', payload);
      console.log('API Response:', result);

      const leadsData = result.message?.data || result.data || [];

      const transformedLeads = await Promise.all(
        leadsData
          .filter((apiLead: any) => apiLead.converted === 0)
          .map(async (apiLead: any) => {
            return {
              id: apiLead.name || apiLead.idx?.toString() || Math.random().toString(),
              name: apiLead.name || 'Unknown',
              firstName: apiLead.first_name || apiLead.lead_name?.split(' ')[0] || 'Unknown',
              lastName: apiLead.last_name || apiLead.lead_name?.split(' ').slice(1).join(' ') || '',
              leadId: apiLead.name || 'N/A',
              organization: apiLead.organization || 'N/A',
              status: mapApiStatus(apiLead.status),
              email: apiLead.email || 'N/A',
              mobile: apiLead.mobile_no || 'N/A',
              assignedTo: apiLead._assign || 'N/A',
              lastModified: formatDate(apiLead.modified),
              website: apiLead.website || '',
              territory: apiLead.territory || '',
              industry: apiLead.industry || '',
              jobTitle: '',
              source: '',
              salutation: apiLead.salutation || '',
              converted: apiLead.converted || 0,
              ...apiLead
            };
          })
      );

      setLeads(transformedLeads);
      console.log(transformedLeads, "Transformed leads with analyzed scores");

      setTotalItems(transformedLeads.length);
      setSelectedIds([]);

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

  const shouldRefreshScore = (lead: any): boolean => {
    if (!lead.lead_score || lead.lead_score === 'null') return true;

    if (lead.modified) {
      const modifiedDate = new Date(lead.modified);
      const now = new Date();
      const daysSinceModification = (now.getTime() - modifiedDate.getTime()) / (1000 * 3600 * 24);
      return daysSinceModification < 7;
    }

    return false;
  };

  // Import Popup Component
  const ImportPopup = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-lg shadow-lg max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              Import Leads
            </h3>
            <button
              onClick={() => setShowImportPopup(false)}
              className={`p-1 rounded ${theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Choose an option to import leads:
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleDownloadTemplate}
                disabled={importStatus === 'Downloading template...'}
                className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${theme === 'dark'
                  ? 'border-purple-500 text-purple-400 hover:bg-purple-900/30'
                  : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                  } ${importStatus === 'Downloading template...' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Download Template</div>
                  <div className="text-xs opacity-75">Get CSV template with required fields</div>
                </div>
              </button>

              <button
                onClick={handleAttachFile}
                className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${theme === 'dark'
                  ? 'border-green-500 text-green-400 hover:bg-green-900/30'
                  : 'border-green-500 text-green-600 hover:bg-green-50'
                  }`}
              >
                <Upload className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Attach File</div>
                  <div className="text-xs opacity-75">Upload your CSV file to import</div>
                </div>
              </button>
            </div>

            {importStatus && (
              <div className={`text-sm text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                {importStatus}
              </div>
            )}

            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
              <strong>Note:</strong> Use the template to ensure your CSV file has the correct format. Required fields include name, email, organization, and status.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleDownloadTemplate = async () => {
    try {
      setImportStatus('Downloading template...');

      const response = await fetch(
        'https://api.erpnext.ai/api/method/frappe.core.doctype.data_import.data_import.download_template',
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "doctype": "CRM Lead",
            "file_type": "CSV",
            "export_records": "blank_template",
            "export_fields": {
              "CRM Lead": [
                "first_name",
                "last_name",
                "email",
                "mobile_no",
                "organization",
                "website",
                "annual_revenue"
              ]
            },
            "export_filters": null
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Template download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'CRM_Lead_Template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setImportStatus('');
      setShowImportPopup(false);
      showToast('Template downloaded successfully!', 'success');

    } catch (error) {
      console.error('Template download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download template';
      showToast(`Download failed: ${errorMessage}`);
      setImportStatus('');
    }
  };

  const handleAttachFile = () => {
    setShowImportPopup(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportClick = () => {
    setShowImportPopup(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Please select a CSV file');
      return;
    }

    setSelectedFile(file);
    await handleBulkImport(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const continueImportProcess = async (dataImportName: string) => {
    try {
      setImportProgress(60);
      setImportStatus('Starting data import...');

      const startImportPayload: any = {
        data_import: dataImportName
      };

      const startImportResponse = await fetch(
        `https://api.erpnext.ai/api/method/frappe.core.doctype.data_import.data_import.form_start_import`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(startImportPayload)
        }
      );

      if (!startImportResponse.ok) {
        throw new Error(`Start import API failed: ${startImportResponse.statusText}`);
      }

      const startImportResult = await startImportResponse.json();
      console.log('Start Import API Response:', startImportResult);

      setImportProgress(100);
      setImportStatus('Import completed successfully!');

      showToast('Leads imported successfully!', 'success');

      setTimeout(() => {
        fetchLeads();
        setIsImporting(false);
        setImportProgress(0);
        setImportStatus('');
        setSelectedFile(null);
      }, 1000);

    } catch (error) {
      throw error;
    }
  };

  const handleBulkImport = async (file: File) => {
    try {
      setIsImporting(true);
      setImportProgress(0);
      setImportStatus('Starting import process...');

      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!session?.api_key || !session?.api_secret) {
        throw new Error("User session or API credentials not found.");
      }

      setImportProgress(20);
      setImportStatus('Uploading CSV file...');

      const formData = new FormData();
      formData.append('reference_doctype', 'CRM Lead');
      formData.append('import_type', 'Insert New Records');
      formData.append('company', sessionCompany || '');
      formData.append('filedata', file);

      const importResponse = await fetch(
        'https://api.erpnext.ai/api/method/customcrm.email.import.import_leads_with_company',
        {
          method: 'POST',
          headers: {
            'Authorization': token,
          },
          body: formData
        }
      );

      if (!importResponse.ok) {
        throw new Error(`Import API failed: ${importResponse.statusText}`);
      }

      const importResult = await importResponse.json();
      console.log('Initial Import API Response:', importResult);

      if (importResult.message?.unmapped_columns && importResult.message.unmapped_columns.length > 0) {
        const unmappedColumns = importResult.message.unmapped_columns;

        setImportProgress(0);
        setImportStatus('');
        setIsImporting(false);

        setUnmappedColumns(unmappedColumns);
        setManualMappings({});
        setShowMappingPopup(true);
        return;
      }

      setImportProgress(100);
      setImportStatus('Import completed successfully!');

      showToast('Leads imported successfully!', 'success');

      setTimeout(() => {
        fetchLeads();
        setIsImporting(false);
        setImportProgress(0);
        setImportStatus('');
        setSelectedFile(null);
      }, 1000);

    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import leads';
      setError(errorMessage);
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
      showToast(`Import failed: ${errorMessage}`);
      setSelectedFile(null);
    }
  };

  const handleMappingSubmit = async () => {
    if (Object.keys(manualMappings).length !== unmappedColumns.length) {
      showToast('Please map all unmapped columns before continuing');
      return;
    }

    if (!selectedFile) {
      showToast('File not found. Please select the file again.');
      return;
    }

    setShowMappingPopup(false);
    setIsImporting(true);
    setImportProgress(40);
    setImportStatus('Applying column mappings...');

    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      const formData = new FormData();
      formData.append('reference_doctype', 'CRM Lead');
      formData.append('import_type', 'Insert New Records');
      formData.append('company', sessionCompany || '');
      formData.append('filedata', selectedFile);

      const manualMappingsJson = JSON.stringify(manualMappings);
      formData.append('manual_mappings', manualMappingsJson);

      console.log('Sending manual mappings:', manualMappings);
      console.log('Manual mappings JSON:', manualMappingsJson);

      const importResponse = await fetch(
        'https://api.erpnext.ai/api/method/customcrm.email.import.import_leads_with_company',
        {
          method: 'POST',
          headers: {
            'Authorization': token,
          },
          body: formData
        }
      );

      if (!importResponse.ok) {
        throw new Error(`Import API failed: ${importResponse.statusText}`);
      }

      const importResult = await importResponse.json();
      console.log('Second Import API Response with mappings:', importResult);

      if (importResult.message?.unmapped_columns && importResult.message.unmapped_columns.length > 0) {
        setUnmappedColumns(importResult.message.unmapped_columns);
        setManualMappings({});
        setShowMappingPopup(true);
        setIsImporting(false);
        setImportProgress(0);
        setImportStatus('');
        showToast('Some columns still need mapping');
        return;
      }

      setImportProgress(100);
      setImportStatus('Import completed successfully!');

      showToast('Leads imported successfully!', 'success');

      setTimeout(() => {
        fetchLeads();
        setIsImporting(false);
        setImportProgress(0);
        setImportStatus('');
        setUnmappedColumns([]);
        setManualMappings({});
        setSelectedFile(null);
      }, 1000);

    } catch (error) {
      console.error('Mapping submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply mappings';
      showToast(`Import failed: ${errorMessage}`);
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
      setUnmappedColumns([]);
      setManualMappings({});
      setSelectedFile(null);
    }
  };

  // Column Mapping Popup Component
  const ColumnMappingPopup = () => {
    const crmLeadFields = [
      'first_name', 'last_name', 'lead_name', 'organization', 'status',
      'email', 'mobile_no', 'website', 'territory', 'industry',
      'job_title', 'source', 'salutation', 'gender', 'no_of_employees',
      'annual_revenue', 'lead_owner', 'notes', '_assign'
    ];

    const handleMappingChange = (columnName: string, field: string) => {
      setManualMappings(prev => ({
        ...prev,
        [columnName]: field
      }));
    };

    const handleCancel = () => {
      setShowMappingPopup(false);
      setUnmappedColumns([]);
      setManualMappings({});
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
      setSelectedFile(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              Map CSV Columns
            </h3>
          </div>

          <div className="mb-4">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              The following columns in your CSV file could not be automatically mapped.
              Please select the appropriate CRM Lead field for each column.
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
              File: {selectedFile?.name}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {unmappedColumns.map((column) => (
              <div key={column.column_name} className="flex items-center justify-between">
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                  {column.column_name}
                </span>

                <select
                  value={manualMappings[column.column_name] || ''}
                  onChange={(e) => handleMappingChange(column.column_name, e.target.value)}
                  className={`ml-4 px-3 py-2 border rounded ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="">Select Field</option>
                  {crmLeadFields.map(field => (
                    <option key={field} value={field}>
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className={`px-4 py-2 border rounded-lg transition-colors ${theme === 'dark'
                ? 'border-gray-600 text-white hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              Cancel Import
            </button>
            <button
              onClick={handleMappingSubmit}
              disabled={Object.keys(manualMappings).length !== unmappedColumns.length}
              className={`px-4 py-2 rounded-lg transition-colors ${Object.keys(manualMappings).length !== unmappedColumns.length
                ? 'bg-gray-400 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
            >
              Continue Import
            </button>
          </div>
        </div>
      </div>
    );
  };

  const mapApiStatus = (
    apiStatus: string
  ): 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Junk' | 'Nurture' | string => {
    if (!apiStatus) return 'New';
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
    setCurrentPage(1);
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

  // Updated handleDeleteAfterUnlink function - just shows confirmation
  const handleDeleteAfterUnlink = async () => {
    // Show confirmation popup
    setShowDeleteLinkedConfirm(true);
  };


  const handleConfirmDeleteLinkedItems = async () => {
    setIsDeleting(true);

    try {
      // Delete the leads using ONLY frappe.client.delete
      await deleteLeadsDirectly(leadsToDelete);

      setShowDeleteLinkedConfirm(false);
      setIsLinkedItemsPopupOpen(false);
      setLinkedItems([]);
      setLeadsToDelete([]);
      showToast('Leads deleted successfully!', 'success');

    } catch (error) {
      console.error("Error deleting leads after unlinking:", error);
      showToast("Failed to delete leads after unlinking", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Update your Delete button click handler
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      showToast("No leads selected", "error");
      return;
    }
    await checkLinkedItems();
  };

  const getFilteredAndSortedData = () => {
    let filteredData = leads.filter(item => {
      const matchesSearch = searchTerm === '' || Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesStatus = filters.status.length === 0 || filters.status.includes(item.status);

      const matchesTerritory = filters.territory.length === 0 ||
        (item.territory && filters.territory.includes(item.territory));

      const matchesIndustry = filters.industry.length === 0 ||
        (item.industry && filters.industry.includes(item.industry));

      const matchesAssignedTo = filters.assignedTo.length === 0 ||
        filters.assignedTo.includes(item.assignedTo);

      return matchesSearch && matchesStatus && matchesTerritory && matchesIndustry && matchesAssignedTo;
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
  const toggleLeadDetails = (leadId: string) => {
    setExpandedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const isLeadExpanded = (leadId: string) => {
    return expandedLeads.has(leadId);
  };

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

  // Render cell function with updated assignedTo logic
  const renderCell = (lead: Lead, key: keyof Lead, theme: string) => {
    switch (key) {
      case 'firstName':
        return (
          <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {lead.firstName || 'N/A'}
          </div>
        );
      case 'lastName':
        return (
          <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {lead.lastName || 'N/A'}
          </div>
        );
      case 'name':
        return (
          <div className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
              }`}>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}>
                {lead.firstName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              {lead.name}
            </div>
          </div>
        );
      case 'organization':
        return (
          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {lead.organization}
          </div>
        );
      case 'status':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
            <FaCircleDot className="w-2 h-2 mr-1" />
            {lead.status}
          </span>
        );
      case 'email':
        return (
          <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            {lead.email}
          </div>
        );
      case 'mobile':
        return (
          <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            <Phone className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
            {lead.mobile}
          </div>
        );
      case 'assignedTo':
        // Handle both string and array formats for assignedTo
        let assignedNames: string[] = [];

        if (Array.isArray(lead.assignedTo)) {
          assignedNames = lead.assignedTo.map(name => name.trim()).filter(name => name);
        } else if (typeof lead.assignedTo === 'string') {
          try {
            const parsed = JSON.parse(lead.assignedTo);
            if (Array.isArray(parsed)) {
              assignedNames = parsed.map(name => name.trim()).filter(name => name);
            } else {
              assignedNames = lead.assignedTo.split(',').map(name => name.trim()).filter(name => name);
            }
          } catch {
            assignedNames = lead.assignedTo.split(',').map(name => name.trim()).filter(name => name);
          }
        }

        if (assignedNames.length === 0) {
          return (
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Unassigned
            </div>
          );
        } else if (assignedNames.length === 1) {
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
          return (
            <div className="flex items-center">
              {assignedNames.slice(0, 3).map((name, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${theme === "dark" ? "bg-purplebg border-purplebg" : "bg-gray-200 border-white"
                    }`}
                  style={{
                    marginLeft: index === 0 ? "0px" : "-8px",
                    zIndex: 10 - index,
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
      case 'lastModified':
        return (
          <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
            {lead.lastModified}
          </div>
        );
      default:
        return (
          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            {lead[key] || 'N/A'}
          </span>
        );
    }
  };

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

  // Add this function to define export column order
  const getExportColumnOrder = () => {
    // Define the exact order you want columns to appear in export
    const exportOrder = [
      'name',
      'firstName',
      'lastName',
      'organization',
      'status',
      'email',
      'mobile',
      'assignedTo',
      'lastModified',
      'territory',
      'industry',
      'website',
      'leadId' // Add other fields as needed
    ];

    return exportOrder;
  };

  const handleExport = async (exportType: string = 'Excel', exportAll: boolean = true) => {
    setIsExporting(true);

    try {
      const session = getUserSession();
      const sessionCompany = session?.company;

      const exportFilters: any = {
        company: sessionCompany,
        converted: 0
      };

      const dataToExport = exportAll ? getFilteredAndSortedData() : leads.filter(lead => selectedIds.includes(lead.id));

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
        exportFilters['_assign'] = ['in', filters.assignedTo];
      }

      const columnToFieldMap: Record<string, string> = {
        'name': 'name',
        'firstName': 'first_name',
        'lastName': 'last_name', // This is correct
        'organization': 'organization',
        'status': 'status',
        'email': 'email',
        'mobile': 'mobile_no',
        'assignedTo': '_assign',
        'lastModified': 'modified',
        'territory': 'territory',
        'industry': 'industry',
        'website': 'website',
        'leadId': 'name',
        'jobTitle': 'job_title',
        'source': 'source',
        'salutation': 'salutation'
      };

      // Define the desired export order
      const preferredOrder = [
        'name',
        'firstName',
        'lastName',
        'organization',
        'email',
        'mobile',
        'assignedTo',
        'status',
        'territory',
        'industry',
        'website',
        'jobTitle',
        'source',
        'salutation',
        'leadId'
      ];


      // Get visible columns from user settings
      const visibleColumnsFromSettings = columns.filter(col => col.visible);

      // Add firstName and lastName to export even if they're not visible in the table
      const exportColumns = [...visibleColumnsFromSettings];

      // Add firstName if not already in export columns
      if (!exportColumns.find(col => col.key === 'firstName')) {
        exportColumns.push({ key: 'firstName', label: 'First Name', visible: true, sortable: true });
      }

      // Add lastName if not already in export columns
      if (!exportColumns.find(col => col.key === 'lastName')) {
        exportColumns.push({ key: 'lastName', label: 'Last Name', visible: true, sortable: true });
      }

      // Remove duplicates (in case firstName/lastName were already visible)
      const uniqueColumns = exportColumns.filter((col, index, self) =>
        index === self.findIndex((t) => t.key === col.key)
      );

      // Remove 'lastModified' from export
      const columnsForExport = uniqueColumns.filter(col => col.key !== 'lastModified');

      // Sort columns according to preferred order
      const sortedColumns = columnsForExport.sort((a, b) => {
        const indexA = preferredOrder.indexOf(a.key);
        const indexB = preferredOrder.indexOf(b.key);
        // Put items not in preferredOrder at the end, maintaining their relative order
        const posA = indexA === -1 ? 999 + columnsForExport.indexOf(a) : indexA;
        const posB = indexB === -1 ? 999 + columnsForExport.indexOf(b) : indexB;
        return posA - posB;
      });

      console.log('Export column order:', sortedColumns.map(col => `${col.key} (${col.label})`));

      const headers = sortedColumns.map(col => {
        if (col.key === 'assignedTo') return 'Assign';
        return col.label;
      });

      const data = dataToExport.map(lead => {
        return sortedColumns.map(col => {
          if (col.key === 'assignedTo') {
            let assignedNames: string[] = [];
            if (typeof lead.assignedTo === 'string' && lead.assignedTo.startsWith('[')) {
              try {
                const parsed = JSON.parse(lead.assignedTo);
                if (Array.isArray(parsed)) {
                  assignedNames = parsed;
                }
              } catch { /* ignore parse error */ }
            } else if (typeof lead.assignedTo === 'string') {
              assignedNames = lead.assignedTo.split(',').map(s => s.trim());
            }
            return assignedNames.join(',');
          }
          return lead[col.key as keyof Lead] ?? '';
        });
      });

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

      const fileExtension = exportType.toLowerCase() === 'csv' ? 'csv' : 'xlsx';
      const scope = exportAll ? 'all' : 'selected';
      const fileName = `leads_${scope}_${new Date().toISOString().split("T")[0]}.${fileExtension}`;

      XLSX.writeFile(workbook, fileName, { bookType: exportType === 'Excel' ? 'xlsx' : 'csv' });

      setIsExportPopupOpen(false);
      showToast('Export completed successfully!', 'success');

    } catch (error: any) {
      console.error("Export failed:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          showToast(`Export failed: ${errorData.message || errorData.exception || 'Unknown error'}`);
        } catch {
          showToast(`Export failed: ${error.message}`);
        }
      } else {
        showToast(`Export failed: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsExporting(false);
    }

  };

  const handleFormatChange = (format: string) => {
    if (format === 'Excel' || format === 'CSV') {
      setExportFormat(format);
    }
  };


  // Updated checkLinkedItems function
  const checkLinkedItems = async () => {
    if (selectedIds.length === 0) {
      showToast("No leads selected", "error");
      return;
    }

    setIsCheckingLinkedItems(true);

    try {
      // Store the leads that need to be deleted after unlinking
      setLeadsToDelete(selectedIds);

      // Check linked items for the first selected lead
      const leadId = selectedIds[0];
      console.log(`Checking linked items for lead: ${leadId}`);

      const linkedDocsResponse = await fetch(
        "https://api.erpnext.ai/api/method/crm.api.doc.get_linked_docs_of_document",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            doctype: "CRM Lead",
            docname: leadId
          })
        }
      );

      if (linkedDocsResponse.ok) {
        const linkedDocsResult = await linkedDocsResponse.json();
        const items = linkedDocsResult.message || [];

        if (items.length > 0) {
          setLinkedItems(items);
          setIsLinkedItemsPopupOpen(true);
        } else {
          // No linked items, proceed directly to delete using frappe.client.delete
          await deleteLeadsDirectly(selectedIds);
        }
      } else {
        throw new Error("Failed to fetch linked items");
      }
    } catch (error) {
      console.error("Error checking linked items:", error);
      showToast("Failed to check linked items", "error");
    } finally {
      setIsCheckingLinkedItems(false);
    }
  };

  // Function to delete leads directly (when no linked items)
  const deleteLeadsDirectly = async (leadIds: string[]) => {
    setIsDeleting(true);

    try {
      // Delete each lead individually using ONLY frappe.client.delete
      for (const leadId of leadIds) {
        const deleteResponse = await fetch(
          "https://api.erpnext.ai/api/method/frappe.client.delete",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({
              doctype: "CRM Lead",
              name: leadId
            })
          }
        );

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.message || `Failed to delete lead ${leadId}`);
        }

        const result = await deleteResponse.json();
        console.log(`Lead ${leadId} deleted successfully:`, result);
      }

      setSelectedIds([]);
      setShowDropdown(false);
      await fetchLeads();
      showToast('Leads deleted successfully!', 'success');

    } catch (error: any) {
      console.error("Delete error:", error);
      showToast(`Deletion failed: ${error.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnlinkAll = async (): Promise<void> => {
    setIsUnlinking(true);

    try {
      // STEP 1: Unlink items using remove_linked_doc_reference WITHOUT deleting
      const itemsToUnlink = linkedItems.map((item: any) => ({
        doctype: item.reference_doctype,
        docname: item.reference_docname
      }));

      if (itemsToUnlink.length > 0) {
        const unlinkResponse = await fetch(
          "https://api.erpnext.ai/api/method/crm.api.doc.remove_linked_doc_reference",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({
              items: itemsToUnlink,
              remove_contact: false,
              delete: false
            })
          }
        );

        if (!unlinkResponse.ok) {
          throw new Error("Failed to unlink items");
        }

        const unlinkResult = await unlinkResponse.json();
        console.log("Unlink response:", unlinkResult);

        // STEP 2: Verify unlinking was successful
        const leadId = leadsToDelete[0];
        const verifyResponse = await fetch(
          "https://api.erpnext.ai/api/method/crm.api.doc.get_linked_docs_of_document",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({
              doctype: "CRM Lead",
              docname: leadId
            })
          }
        );

        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();
          const remainingItems = verifyResult.message || [];

          if (remainingItems.length === 0) {
            // STEP 3: All items unlinked successfully - close the popup and show toast
            showToast('Items unlinked successfully!', 'success');

            // Close the LinkedItemsPopup automatically
            setIsLinkedItemsPopupOpen(false);
            setLinkedItems([]);

            return; // Resolve the promise
          } else {
            throw new Error("Some items could not be unlinked");
          }
        } else {
          throw new Error("Failed to verify unlinking");
        }
      }
    } catch (error) {
      console.error("Error unlinking items:", error);
      showToast("Failed to unlink items", "error");
      throw error; // Re-throw the error
    } finally {
      setIsUnlinking(false);
    }
  };

  // Remove the old handleDeleteConfirmation function and replace it with:
  const handleDeleteConfirmation = async () => {
    // This function is now only called from DeleteLeadPopup
    // It should directly delete without checking linked items
    await deleteLeadsDirectly(selectedIds);
    setIsDeletePopupOpen(false);
  };

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
        assignedTo: apiLead._assign || 'N/A',
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

  const handleRowSelection = (leadId: string) => {
    setSelectedIds(prevSelected =>
      prevSelected.includes(leadId)
        ? prevSelected.filter(id => id !== leadId)
        : [...prevSelected, leadId]
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

  // Kanban View Component
  const KanbanView = ({ leads, onLeadClick, theme }: { leads: Lead[], onLeadClick: (lead: Lead) => void, theme: string }) => {
    const kanbanColumns = filterOptions.status;

    const leadsByStatus = kanbanColumns.reduce((acc, status) => {
      acc[status] = leads.filter(lead => lead.status === status);
      return acc;
    }, {} as Record<string, Lead[]>);

    return (
      <div className="flex overflow-x-auto p-4 space-x-4">
        {kanbanColumns.map(status => (
          <div key={status} className="w-72 flex-shrink-0">
            <div className={`p-3 rounded-t-lg ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold text-sm flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <span>{status}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                  {leadsByStatus[status].length}
                </span>
              </h3>
            </div>
            <div className={`p-2 rounded-b-lg h-full ${theme === 'dark' ? 'bg-dark-accent' : 'bg-gray-50'}`}>
              <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {leadsByStatus[status].map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className={`p-3 rounded-lg shadow-sm cursor-pointer transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-white hover:bg-gray-50 border'}`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purple-700' : 'bg-gray-200'}`}>
                        <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                          {lead.firstName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className={`font-semibold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {lead.name}
                      </p>
                    </div>
                    <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lead.organization}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        {(() => {
                          let assignedNames: string[] = [];
                          if (Array.isArray(lead.assignedTo)) {
                            assignedNames = lead.assignedTo.map(name => name.trim()).filter(name => name);
                          } else if (typeof lead.assignedTo === 'string') {
                            try {
                              const parsed = JSON.parse(lead.assignedTo);
                              if (Array.isArray(parsed)) {
                                assignedNames = parsed.map(name => name.trim()).filter(name => name);
                              } else {
                                assignedNames = lead.assignedTo.split(',').map(name => name.trim()).filter(name => name);
                              }
                            } catch {
                              assignedNames = lead.assignedTo.split(',').map(name => name.trim()).filter(name => name);
                            }
                          }

                          if (assignedNames.length > 0) {
                            return (
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${theme === "dark" ? "bg-purplebg border-purplebg" : "bg-gray-200 border-white"}`}
                                title={assignedNames.join(', ')}
                              >
                                <span className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                                  {assignedNames[0].charAt(0).toUpperCase()}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {lead.lastModified}
                      </p>
                    </div>
                  </div>
                ))}
                {leadsByStatus[status].length === 0 && (
                  <div className={`text-center py-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No leads
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {showDeleteLinkedConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full max-w-md mx-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                Delete Lead
              </h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                Are you sure you want to delete this Lead?
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteLinkedConfirm(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${theme === 'dark'
                    ? 'border-gray-600 text-white hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteLinkedItems}
                  disabled={isDeleting}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center ${theme === 'dark'
                    ? 'border-red-500 bg-red-600 text-white hover:bg-red-700'
                    : 'border-red-500 bg-red-600 text-white hover:bg-red-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Popup */}
      {showImportPopup && <ImportPopup />}

      {/* Column Mapping Popup */}
      {showMappingPopup && <ColumnMappingPopup />}

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv"
        style={{ display: 'none' }}
      />

      {/* Import Progress Overlay */}
      {isImporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Importing Leads
              </h3>
              <div className="text-sm font-medium">{importProgress}%</div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>

            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {importStatus}
            </p>
          </div>
        </div>
      )}

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
                <button
                  onClick={() => {
                    handleDeleteSelected();
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
                {/* <button
                  onClick={() => {
                    setIsConvertToDealPopupOpen(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Convert To Deal
                </button> */}
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

          {/* Updated Import Button */}
          <button
            onClick={handleImportClick}
            className={`px-3 py-2 text-sm border rounded-lg transition-colors flex items-center space-x-1 ${theme === 'dark'
              ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
              : 'border-gray-300 hover:bg-gray-50'
              }`}
          >
            <Download className="w-4 h-4" />
            <span>Import</span>

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
                      // className={theme === 'dark' ? 'text-white hover:text-white' : 'text-white hover:text-gray-600'}
                      className={`p-1 rounded ${theme === 'dark'
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
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
                    // className={theme === 'dark' ? 'text-white hover:text-white' : 'text-white hover:text-gray-600'}
                    className={`p-1 rounded ${theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
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
          {/* View Switcher */}
          <div className={`flex items-center p-1 rounded-lg ${theme === 'dark' ? 'bg-dark-accent' : 'bg-gray-200'}`}>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1 text-sm rounded-md flex items-center space-x-2 transition-colors ${view === 'table'
                ? theme === 'dark' ? 'bg-purplebg text-white' : 'bg-white text-gray-800 shadow-sm'
                : theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1 text-sm rounded-md flex items-center space-x-2 transition-colors ${view === 'kanban'
                ? theme === 'dark' ? 'bg-purplebg text-white' : 'bg-white text-gray-800 shadow-sm'
                : theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban</span>
            </button>
          </div>



          <div className="flex items-center space-x-2">
            {filteredDataLength > 0 && (
              <div title="Export Excel">
                <button
                  onClick={() => setIsExportPopupOpen(true)}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${theme === 'dark'
                    ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'} ${view === 'kanban' ? 'hidden' : ''}`}>
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
      <div
        className={`rounded-lg shadow-sm max-sm:bg-none border overflow-hidden ${theme === 'dark'
          ? '  bg-custom-gradient border-transparent !rounded-none'
          : 'bg-white border-gray-200'
          }`}
      >
        {view === 'kanban' ? (
          <KanbanView leads={getFilteredAndSortedData()} onLeadClick={handleLeadOpen} theme={theme} />
        ) : (
          <div className="w-full">
            {/* ================= Desktop Table View ================= */}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`border-b ${theme === 'dark'
                    ? 'bg-purplebg border-transparent'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <tr className="divide-x-[1px]">
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          paginatedData.length > 0 &&
                          selectedIds.length === paginatedData.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    {visibleColumns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                          }`}
                      >
                        {column.sortable ? (
                          <SortButton field={column.key}>{column.label}</SortButton>
                        ) : (
                          column.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody
                  className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'
                    }`}
                >
                  {paginatedData.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`transition-colors cursor-pointer ${theme === 'dark'
                        ? 'hover:bg-purple-800/20'
                        : 'hover:bg-gray-50'
                        }`}
                      onClick={() => handleLeadOpen(lead)}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
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

                      {/* === Render all columns === */}
                      {visibleColumns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {renderCell(lead, column.key, theme)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ================= Mobile Card View ================= */}
            <div className="block md:hidden space-y-4">
              {paginatedData.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-4 rounded-lg border ${theme === 'dark'
                    ? 'bg-purplebg border-transparent'
                    : 'bg-white border-gray-200'
                    } shadow-sm`}
                >
                  <div className="flex justify-between items-center">

                    <input
                      type="checkbox"
                      checked={selectedIds.includes(lead.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelection(lead.id);
                      }}
                      className="rounded mr-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div
                      className="flex items-center flex-1 cursor-pointer"
                      onClick={() => onLeadClick(lead)}
                    >

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purple-700' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}
                        >
                          {lead.firstName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3
                        className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                      >
                        {lead.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status badge for mobile */}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}
                      >
                        <FaCircleDot className="w-2 h-2 mr-1" />
                        {lead.status}
                      </span>

                      {/* Dropdown arrow */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLeadDetails(lead.id);
                        }}
                        className={`p-1 rounded transition-transform ${theme === 'dark' ? 'hover:bg-purple-700' : 'hover:bg-gray-100'
                          }`}
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform ${isLeadExpanded(lead.id) ? 'rotate-180' : ''
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
                  {isLeadExpanded(lead.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {/* Render all other columns as label:value */}
                      {visibleColumns.map((column) =>
                        column.key !== 'name' && column.key !== 'status' ? (
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
                              {column.key === 'assignedTo' ? (
                                (() => {
                                  let assignedNames: string[] = [];
                                  if (Array.isArray(lead.assignedTo)) {
                                    assignedNames = lead.assignedTo.map(name => name.trim()).filter(name => name);
                                  } else if (typeof lead.assignedTo === 'string') {
                                    try {
                                      const parsed = JSON.parse(lead.assignedTo);
                                      if (Array.isArray(parsed)) {
                                        assignedNames = parsed.map(name => name.trim()).filter(name => name);
                                      } else {
                                        assignedNames = lead.assignedTo.split(',').map(name => name.trim()).filter(name => name);
                                      }
                                    } catch {
                                      assignedNames = lead.assignedTo.split(',').map(name => name.trim()).filter(name => name);
                                    }
                                  }

                                  if (assignedNames.length === 0) {
                                    return 'Unassigned';
                                  } else if (assignedNames.length === 1) {
                                    return assignedNames[0];
                                  } else {
                                    return `${assignedNames.slice(0, 2).join(', ')}${assignedNames.length > 2 ? ` +${assignedNames.length - 2}` : ''}`;
                                  }
                                })()
                              ) : (
                                lead[column.key] || 'N/A'
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
        )}
        {/* ================= No Results ================= */}
        {paginatedData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>
              No results found
            </div>
            <div
              className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}
            >
              Please adjust your search criteria or filters
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && view === 'table' && (
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
        onConfirm={handleDeleteConfirmation} // This now calls deleteLeadsDirectly
        isLoading={isDeleting}
        theme={theme}
      />
      <LinkedItemsPopup
        isOpen={isLinkedItemsPopupOpen}
        onClose={() => {
          setIsLinkedItemsPopupOpen(false);
          setLinkedItems([]);
          setLeadsToDelete([]);
        }}
        linkedItems={linkedItems}
        onUnlinkAll={handleUnlinkAll}
        isUnlinking={isUnlinking}
        theme={theme}
        selectedIds={leadsToDelete}
        onDeleteAfterUnlink={() => {
          // This will show the final delete confirmation popup after unlinking
          setShowDeleteLinkedConfirm(true);
        }}
      />

      <AssignToPopup
        isOpen={isAssignPopupOpen}
        onClose={() => setIsAssignPopupOpen(false)}
        selectedIds={selectedIds}
        theme={theme}
        onSuccess={() => {
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