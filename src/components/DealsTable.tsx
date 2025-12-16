import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Phone, Loader2, Filter, Settings, X, ChevronLeft, ChevronRight, RefreshCcw, Download, Upload, LayoutGrid, List } from 'lucide-react';
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
import { LinkedItemsPopup } from './LeadsPopup/LinkedItemsPopup';

interface Deal {
  id: string;
  name: string;
  organization: string;
  first_name: string;
  lastName?: string;
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

interface ColumnConfig {
  key: keyof Deal;
  label: string;
  visible: boolean;
  sortable: boolean;
}

interface FilterState {
  status: string[];
  territory: string[];
  industry: string[];
  assignedTo: string[];
}

interface UnmappedColumn {
  column_name: string;
  suggested_field: string | null;
}

const statusColors = {
  Qualification: ' !text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Demo/Making': ' !text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  'Proposal/Quotation': ' !text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Negotiation: ' !text-violet-800 dark:bg-violet-900/30 dark:text-violet-500',
  Won: ' !text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Lost: ' !text-red-800 dark:bg-red-900/30 dark:text-red-800',
  'Ready to Close': ' !text-orange-800 dark:bg-orange-900/30 dark:text-orange-500',
  Junk: 'bg-transparent text-black dark:bg-transparent dark:text-gray-300',
};

const defaultColumns: ColumnConfig[] = [
  { key: 'organization', label: 'Organization', visible: true, sortable: true },
  { key: 'name', label: 'Name', visible: false, sortable: true },
  { key: 'annualRevenue', label: 'Annual Revenue', visible: true, sortable: true },
  { key: 'status', label: 'Status', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'mobileNo', label: 'Mobile No', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Assigned To', visible: true, sortable: true },
  { key: 'lastModified', label: 'Last Modified', visible: true, sortable: true },

  { key: 'territory', label: 'Territory', visible: false, sortable: true },
  { key: 'industry', label: 'Industry', visible: false, sortable: true },
  { key: 'website', label: 'Website', visible: false, sortable: true }
];

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

export function DealsTable({ searchTerm, onDealClick }: DealsTableProps) {
  const { theme } = useTheme();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Deal | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
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
  const [expandedDeals, setExpandedDeals] = useState<Set<string>>(new Set());

  // View mode state
  const [view, setView] = useState<'table' | 'kanban'>('table');

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // New state for import popup
  const [showImportPopup, setShowImportPopup] = useState(false);

  // Column mapping state
  const [unmappedColumns, setUnmappedColumns] = useState<UnmappedColumn[]>([]);
  const [manualMappings, setManualMappings] = useState<Record<string, string>>({});
  const [showMappingPopup, setShowMappingPopup] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    territory: [],
    industry: [],
    assignedTo: []
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    status: [] as string[],
    territory: [] as string[],
    industry: [] as string[],
    assignedTo: [] as string[]
  });

  // Linked items state (NEW - copied from leads table)
  const [linkedItems, setLinkedItems] = useState<any[]>([]);
  const [isLinkedItemsPopupOpen, setIsLinkedItemsPopupOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isCheckingLinkedItems, setIsCheckingLinkedItems] = useState(false);
  const [showDeleteLinkedConfirm, setShowDeleteLinkedConfirm] = useState(false);
  const [dealsToDelete, setDealsToDelete] = useState<string[]>([]);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

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
        "columns": "[{\"label\": \"Organization\", \"type\": \"Link\", \"key\": \"organization\", \"options\": \"CRM Organization\", \"width\": \"11rem\"}, {\"label\": \"First Name\", \"type\": \"Data\", \"key\": \"first_name\", \"width\": \"10rem\", \"align\": \"left\"}, {\"label\": \"Annual Revenue\", \"type\": \"Currency\", \"key\": \"annual_revenue\", \"align\": \"right\", \"width\": \"9rem\"}, {\"label\": \"Status\", \"type\": \"Select\", \"key\": \"status\", \"width\": \"10rem\"}, {\"label\": \"Email\", \"type\": \"Data\", \"key\": \"email\", \"width\": \"12rem\"}, {\"label\": \"Mobile No\", \"type\": \"Data\", \"key\": \"mobile_no\", \"width\": \"11rem\"}, {\"label\": \"Assigned To\", \"type\": \"Text\", \"key\": \"_assign\", \"width\": \"10rem\"}, {\"label\": \"Last Modified\", \"type\": \"Datetime\", \"key\": \"modified\", \"width\": \"8rem\"}]",
        "rows": "[\"name\", \"organization\", \"annual_revenue\", \"status\", \"email\", \"currency\", \"mobile_no\", \"deal_owner\", \"sla_status\", \"response_by\", \"first_response_time\", \"first_responded_on\", \"modified\", \"_assign\", \"owner\", \"creation\", \"modified_by\", \"_liked_by\", null, \"first_name\"]",
        "page_length": 9000000000,
        "page_length_count": 900000000
      };

      const result = await api.post('/api/method/crm.api.doc.get_data', requestData);

      const transformedDeals: Deal[] = result.message.data.map((apiDeal: any) => ({
        id: apiDeal.name || Math.random().toString(),
        organization: apiDeal.organization || 'N/A',
        first_name: apiDeal.first_name || 'Unknown',
        lastName: apiDeal.last_name || '',
        name: apiDeal.name || 'Unknown',
        status: apiDeal.status || 'Qualification',
        email: apiDeal.email || 'N/A',
        mobileNo: apiDeal.mobile_no || 'N/A',
        assignedTo: apiDeal._assign || 'N/A',
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
        assignedTo: Array.from(new Set(
          transformedDeals.flatMap(d => {
            let names: string[] = [];
            if (Array.isArray(d.assignedTo)) {
              names = d.assignedTo;
            } else if (typeof d.assignedTo === "string") {
              try {
                const parsed = JSON.parse(d.assignedTo);
                if (Array.isArray(parsed)) {
                  names = parsed.map(name => name.trim()).filter(name => name);
                } else {
                  names = d.assignedTo.split(',').map(name => name.trim()).filter(name => name);
                }
              } catch {
                names = d.assignedTo.split(',').map(name => name.trim()).filter(name => name);
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

  // Extract the import continuation logic into a separate function
  const continueImportProcess = async (dataImportName: string) => {
    try {
      setImportProgress(60);
      setImportStatus('Starting data import...');

      // Start the actual import process
      const startImportPayload: any = {
        data_import: dataImportName
      };

      const startImportResponse = await fetch(
        `https://api.erpnext.ai/api/method/frappe.core.doctype.data_import.data_import.form_start_import`,
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
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

      // Show success toast
      showToast('Deals imported successfully!', 'success');

      // Refresh the deals data after successful import
      setTimeout(() => {
        fetchDeals();
        setIsImporting(false);
        setImportProgress(0);
        setImportStatus('');
        setSelectedFile(null); // Clear the file after successful import
      }, 1000);

    } catch (error) {
      throw error;
    }
  };

  // Show import popup instead of directly opening file input
  const handleImportClick = () => {
    setShowImportPopup(true);
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      setImportStatus('Downloading template...');

      const response = await fetch(
        'https://api.erpnext.ai/api/method/frappe.core.doctype.data_import.data_import.download_template',
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "doctype": "CRM Deal",
            "file_type": "CSV",
            "export_records": "blank_template",
            "export_fields": {
              "CRM Deal": [
                "first_name",
                "last_name",
                "email",
                "mobile_no",
                "gender",
                "organization_name",
                "website",
                "annual_revenue",
                "expected_deal_value",
                "expected_closure_date"
              ]
            },
            "export_filters": null
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Template download failed: ${response.statusText}`);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'CRM_Deal_Template.csv';
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

  // Handle attach file
  const handleAttachFile = () => {
    setShowImportPopup(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Please select a CSV file');
      return;
    }

    const text = await file.text();
    const lines = text.trim().split('\n');

    // CSV with only header or empty
    if (lines.length <= 1) {
      showToast('CSV file is empty. Please add at least one record.');
      return;
    }
    setSelectedFile(file);

    await handleBulkImport(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

      // Step 1: Import deals with company
      const formData = new FormData();
      formData.append('reference_doctype', 'CRM Deal');
      formData.append('import_type', 'Insert New Records');
      formData.append('company', sessionCompany || '');
      formData.append('filedata', file);

      const importResponse = await fetch(
        'https://api.erpnext.ai/api/method/customcrm.email.import.import_leads_with_company',
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
          },
          body: formData
        }
      );

      if (!importResponse.ok) {
        throw new Error(`Import API failed: ${importResponse.statusText}`);
      }

      const importResult = await importResponse.json();
      console.log('Initial Import API Response:', importResult);

      // Check for unmapped columns in the response
      if (importResult.message?.unmapped_columns && importResult.message.unmapped_columns.length > 0) {
        const unmappedColumns = importResult.message.unmapped_columns;

        setImportProgress(0);
        setImportStatus('');
        setIsImporting(false);

        // Store unmapped columns and show mapping popup
        setUnmappedColumns(unmappedColumns);
        setManualMappings({});
        setShowMappingPopup(true);
        return; // Stop the import process until user maps columns
      }

      // If no unmapped columns, continue directly with the import process
      const dataImportName = importResult.message?.name || importResult.message?.data_import_name;

      if (!dataImportName) {
        throw new Error('Could not get import reference from response');
      }

      // Continue with the import process
      await continueImportProcess(dataImportName);

    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import deals';
      setError(errorMessage);
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
      showToast(`Import failed: ${errorMessage}`);
      // Clear the file on error
      setSelectedFile(null);
    }
  };

  // Function to handle mapping submission
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

      // Re-upload the file with manual mappings using the stored file
      const formData = new FormData();
      formData.append('reference_doctype', 'CRM Deal');
      formData.append('import_type', 'Insert New Records');
      formData.append('company', sessionCompany || '');
      formData.append('filedata', selectedFile);

      // Convert manual mappings to JSON string
      const manualMappingsJson = JSON.stringify(manualMappings);
      formData.append('manual_mappings', manualMappingsJson);

      console.log('Sending manual mappings:', manualMappings);
      console.log('Manual mappings JSON:', manualMappingsJson);

      const importResponse = await fetch(
        'https://api.erpnext.ai/api/method/customcrm.email.import.import_leads_with_company',
        {
          method: 'POST',
          headers: {
            'Authorization': AUTH_TOKEN,
          },
          body: formData
        }
      );

      if (!importResponse.ok) {
        throw new Error(`Import API failed: ${importResponse.statusText}`);
      }

      const importResult = await importResponse.json();
      console.log('Second Import API Response with mappings:', importResult);

      // Check if there are still unmapped columns
      if (importResult.message?.unmapped_columns && importResult.message.unmapped_columns.length > 0) {
        // Show mapping popup again with remaining unmapped columns
        setUnmappedColumns(importResult.message.unmapped_columns);
        setManualMappings({});
        setShowMappingPopup(true);
        setIsImporting(false);
        setImportProgress(0);
        setImportStatus('');
        showToast('Some columns still need mapping');
        return;
      }

      // If no more unmapped columns, continue with the import process
      const dataImportName = importResult.message?.name || importResult.message?.data_import_name;

      if (!dataImportName) {
        throw new Error('Could not get import reference from response');
      }

      // Continue with the import process using the same function
      await continueImportProcess(dataImportName);

    } catch (error) {
      console.error('Mapping submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply mappings';
      showToast(`Import failed: ${errorMessage}`);
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
      setUnmappedColumns([]);
      setManualMappings({});
      setSelectedFile(null); // Clear file on error
    }
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
              Import Deals
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
              Choose an option to import deals:
            </p>

            <div className="grid grid-cols-1 gap-3">
              {/* Download Template Button */}
              <button
                onClick={handleDownloadTemplate}
                disabled={importStatus === 'Downloading template...'}
                className={`flex items-center justify-center space-x-2 px-4 py-3 border-2  rounded-lg transition-colors ${theme === 'dark'
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

              {/* Attach File Button */}
              <button
                onClick={handleAttachFile}
                className={`flex items-center justify-center space-x-2 px-4 py-3 border-2  rounded-lg transition-colors ${theme === 'dark'
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

            {/* Download status */}
            {importStatus && (
              <div className={`text-sm text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                {importStatus}
              </div>
            )}

            {/* Help text */}
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
              <strong>Note:</strong> Use the template to ensure your CSV file has the correct format. Required fields include organization name, contact details, and deal information.
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Column Mapping Popup Component
  const ColumnMappingPopup = () => {
    // Available CRM Deal fields for mapping
    const crmDealFields = [
      'name', 'organization', 'annual_revenue', 'status', 'email',
      'mobile_no', 'deal_owner', 'territory', 'industry',
      'website', 'first_name', 'last_name', 'salutation', 'no_of_employees',
      'description', 'probability', 'expected_value', 'next_step'
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
      setSelectedFile(null); // Clear the file on cancel
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
              Please select the appropriate CRM Deal field for each column.
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
                  {crmDealFields.map(field => (
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
      const currentPageIds = getPaginatedData().map(d => d.id);
      setSelectedDeals(currentPageIds);
    } else {
      setSelectedDeals([]);
    }
  };

  // Handler to select all filtered results
  const handleSelectAllFiltered = () => {
    const allFilteredIds = getFilteredAndSortedData().map(d => d.id);
    setSelectedDeals(allFilteredIds);
  };

  // Filtering, sorting, and pagination
  const getFilteredAndSortedData = () => {
    let filteredData = deals.filter(item => {
      const matchesSearch = searchTerm === '' || Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = filters.status.length === 0 || filters.status.includes(item.status);
      const matchesTerritory = filters.territory.length === 0 || (item.territory && filters.territory.includes(item.territory));
      const matchesIndustry = filters.industry.length === 0 || (item.industry && filters.industry.includes(item.industry));
      const matchesAssignedTo = filters.assignedTo.length === 0 || filters.assignedTo.includes(item.assignedTo);
      return matchesSearch && matchesStatus && matchesTerritory && matchesIndustry && matchesAssignedTo;
    });

    if (sortField) {
      filteredData.sort((a, b) => {
        const aValue = a[sortField]?.toString() || '';
        const bValue = b[sortField]?.toString() || '';
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

  // Column management
  const toggleColumn = (columnKey: keyof Deal) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Sorting
  const handleSort = (field: keyof Deal) => {
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
      const dataToExport = exportAll ? getFilteredAndSortedData() : deals.filter(deal => selectedDeals.includes(deal.id));

      // Define the exact order and columns you want for the export
      const exportColumnsConfig: { key: keyof Deal; label: string }[] = [
        { key: 'name', label: 'Deal Name' },
        { key: 'first_name', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'organization', label: 'Organization' },
        { key: 'status', label: 'Status' },
        { key: 'email', label: 'Email' },
        { key: 'mobileNo', label: 'Mobile No' },
        { key: 'assignedTo', label: 'Assigned To' },
        { key: 'closeDate', label: 'Close Date' },
        { key: 'territory', label: 'Territory' },
        { key: 'annualRevenue', label: 'Annual Revenue' },
        { key: 'industry', label: 'Industry' },
        { key: 'website', label: 'Website' },
      ];

      const headers = exportColumnsConfig.map(col => col.label);

      const data = dataToExport.map(deal => {
        return exportColumnsConfig.map(col => {
          if (col.key === 'assignedTo') {
            let assignedNames: string[] = [];
            if (typeof deal.assignedTo === 'string' && deal.assignedTo.startsWith('[')) {
              try {
                const parsed = JSON.parse(deal.assignedTo);
                if (Array.isArray(parsed)) {
                  assignedNames = parsed;
                }
              } catch { /* ignore parse error */ }
            } else if (typeof deal.assignedTo === 'string') {
              assignedNames = deal.assignedTo.split(',').map(s => s.trim());
            }
            return assignedNames.join(',');
          }
          return deal[col.key as keyof Deal] ?? '';
        });
      });

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Deals");

      const fileExtension = exportType.toLowerCase() === 'csv' ? 'csv' : 'xlsx';
      const scope = exportAll ? 'all' : 'selected';
      const fileName = `deals_${scope}_${new Date().toISOString().split("T")[0]}.${fileExtension}`;

      XLSX.writeFile(workbook, fileName, { bookType: exportType === 'Excel' ? 'xlsx' : 'csv' });

      setIsExportPopupOpen(false);
      showToast('Export completed successfully!', 'success');

    } catch (error: any) {
      console.error("Export failed:", error);
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

  const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
    setCurrentEditDeal(null);
  };

  // NEW: Check linked items function for deals
  const checkLinkedItems = async () => {
    if (selectedDeals.length === 0) {
      showToast("No deals selected", "error");
      return;
    }

    setIsCheckingLinkedItems(true);

    try {
      // Store the deals that need to be deleted after unlinking
      setDealsToDelete(selectedDeals);

      // Check linked items for the first selected deal
      const dealId = selectedDeals[0];
      console.log(`Checking linked items for deal: ${dealId}`);

      const linkedDocsResponse = await fetch(
        "https://api.erpnext.ai/api/method/crm.api.doc.get_linked_docs_of_document",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH_TOKEN
          },
          body: JSON.stringify({
            doctype: "CRM Deal",
            docname: dealId
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
          await deleteDealsDirectly(selectedDeals);
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

  // NEW: Function to delete deals directly (when no linked items)
  const deleteDealsDirectly = async (dealIds: string[]) => {
    setIsDeleting(true);

    try {
      // Delete each deal individually using ONLY frappe.client.delete
      for (const dealId of dealIds) {
        const deleteResponse = await fetch(
          "https://api.erpnext.ai/api/method/frappe.client.delete",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify({
              doctype: "CRM Deal",
              name: dealId
            })
          }
        );

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.message || `Failed to delete deal ${dealId}`);
        }

        const result = await deleteResponse.json();
        console.log(`Deal ${dealId} deleted successfully:`, result);
      }

      setSelectedDeals([]);
      setShowDropdown(false);
      await fetchDeals();
      showToast('Deals deleted successfully!', 'success');

    } catch (error: any) {
      console.error("Delete error:", error);
      showToast(`Deletion failed: ${error.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // NEW: Handle delete selected (triggers linked items check)
  const handleDeleteSelected = async () => {
    if (selectedDeals.length === 0) {
      showToast("No deals selected", "error");
      return;
    }
    await checkLinkedItems();
  };

  // NEW: Handle unlink all function for deals
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
              'Authorization': AUTH_TOKEN
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
        const dealId = dealsToDelete[0];
        const verifyResponse = await fetch(
          "https://api.erpnext.ai/api/method/crm.api.doc.get_linked_docs_of_document",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify({
              doctype: "CRM Deal",
              docname: dealId
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

  // NEW: Handle confirm delete after unlinking
  const handleConfirmDeleteLinkedItems = async () => {
    setIsDeleting(true);

    try {
      // Delete the deals using ONLY frappe.client.delete
      await deleteDealsDirectly(dealsToDelete);

      setShowDeleteLinkedConfirm(false);
      setIsLinkedItemsPopupOpen(false);
      setLinkedItems([]);
      setDealsToDelete([]);
      showToast('Deals deleted successfully!', 'success');

    } catch (error) {
      console.error("Error deleting deals after unlinking:", error);
      showToast("Failed to delete deals after unlinking", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // UPDATED: Handle delete confirmation (now only called from DeleteDealPopup)
  const handleDeleteConfirmation = async () => {
    // This function is now only called from DeleteDealPopup
    // It should directly delete without checking linked items
    await deleteDealsDirectly(selectedDeals);
    setIsDeletePopupOpen(false);
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

  const isDealExpanded = (dealId: string) => {
    return expandedDeals.has(dealId);
  };

  // Sort Button Component
  const SortButton = ({ field, children }: { field: keyof Deal; children: React.ReactNode }) => (
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
          <span className={`inline-flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaCircleDot className={`mr-2 ${statusColors[deal.status as keyof typeof statusColors]}`} />
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
          assignedNames = deal.assignedTo.map(name => name.trim()).filter(name => name);
        } else if (typeof deal.assignedTo === 'string') {
          try {
            const parsed = JSON.parse(deal.assignedTo);
            if (Array.isArray(parsed)) {
              assignedNames = parsed.map(name => name.trim()).filter(name => name);
            } else {
              assignedNames = deal.assignedTo.split(',').map(name => name.trim()).filter(name => name);
            }
          } catch {
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

  // Kanban View Component
  const KanbanView = ({ deals, onDealClick, theme }: { deals: Deal[], onDealClick: (deal: Deal) => void, theme: string }) => {
    const kanbanColumns = [
      'Qualification',
      'Demo/Making',
      'Proposal/Quotation',
      'Negotiation',
      'Won',
      'Lost',
      'Ready to Close',
      'Junk'];

    const dealsByStatus = kanbanColumns.reduce((acc, status) => {
      acc[status] = deals.filter(deal => deal.status === status);
      return acc;
    }, {} as Record<string, Deal[]>);

    return (
      <div className="flex overflow-x-auto p-4 space-x-4">
        {kanbanColumns.map(status => (
          <div key={status} className="w-72 flex-shrink-0">
            <div className={`p-3 rounded-t-lg ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold text-sm flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <span>{status}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                  {dealsByStatus[status].length}
                </span>
              </h3>
            </div>
            <div className={`p-2 rounded-b-lg h-full ${theme === 'dark' ? 'bg-dark-accent' : 'bg-gray-50'}`}>
              <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {dealsByStatus[status].map(deal => (
                  <div
                    key={deal.id}
                    onClick={() => onDealClick?.(deal)}
                    className={`p-3 rounded-lg shadow-sm cursor-pointer transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-white hover:bg-gray-50 border'}`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purple-700' : 'bg-gray-200'}`}>
                        <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                          {deal.first_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className={`font-semibold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {deal.name}
                      </p>
                    </div>
                    <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {deal.organization}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        {(() => {
                          let assignedNames: string[] = [];
                          if (Array.isArray(deal.assignedTo)) {
                            assignedNames = deal.assignedTo.map(name => name.trim()).filter(name => name);
                          } else if (typeof deal.assignedTo === 'string') {
                            try {
                              const parsed = JSON.parse(deal.assignedTo);
                              if (Array.isArray(parsed)) {
                                assignedNames = parsed.map(name => name.trim()).filter(name => name);
                              } else {
                                assignedNames = deal.assignedTo.split(',').map(name => name.trim()).filter(name => name);
                              }
                            } catch {
                              assignedNames = deal.assignedTo.split(',').map(name => name.trim()).filter(name => name);
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
                        {deal.lastModified}
                      </p>
                    </div>
                  </div>
                ))}
                {dealsByStatus[status].length === 0 && (
                  <div className={`text-center py-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No deals
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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

  const paginatedData = getPaginatedData();
  const totalPages = getTotalPages();
  const visibleColumns = getVisibleColumns();
  const filteredDataLength = getFilteredAndSortedData().length;

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

      {/* Delete Linked Items Confirmation */}
      {showDeleteLinkedConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full max-w-md mx-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                Delete Deal
              </h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                Are you sure you want to delete this Deal?
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
                Importing Deals
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
      <div className="flex flex-col mb-3 sm:flex-row gap-4 items-start sm:items-center justify-between">
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
                      onClick={() => setFilters({ status: [], territory: [], industry: [], assignedTo: [] })}
                      className={`text-sm ${theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
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
                  
                </div>
              </div>
            )}
          </div>

          {view === 'table' && (
            <>
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
            </>
          )}
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

          {/* Only show download button when there's data */}
          {filteredDataLength > 0 && (
            <button
              onClick={() => setIsExportPopupOpen(true)}
              title="Export to Excel"
              className={`p-2 text-sm border rounded-lg transition-colors flex items-center justify-center ${theme === 'dark'
                ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
          {view === 'table' && (
            <>
              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-600'} ${view === 'kanban' ? 'hidden' : ''}`}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDataLength)} of {filteredDataLength} results
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
            </>
          )}
        </div>
      </div >

      {/* Rest of the component remains the same... */}
      {/* Table */}
      <div className={`rounded-lg shadow-sm max-sm:bg-none border overflow-hidden ${theme === 'dark'
        ? ' bg-custom-gradient border-transparent !rounded-none'
        : 'bg-white border-gray-200'
        }`}>
        {view === 'kanban' ? (
          <KanbanView deals={getFilteredAndSortedData()} onDealClick={(deal) => onDealClick?.(deal)} theme={theme} />
        ) : (
          <div className="w-full">
            {/* ================= Desktop Table View ================= */}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'bg-purplebg border-transparent ' : 'bg-gray-50 border-gray-200'
                  }`}>
                  <tr className="divide-x-[1px]">
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={paginatedData.length > 0 && selectedDeals.length === paginatedData.length}
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
                  {paginatedData.map((deal) => (
                    <tr
                      key={deal.id}
                      className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                        }`}
                      onClick={() => onDealClick?.(deal)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedDeals.includes(deal.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelection(deal.id);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      {visibleColumns.map(column => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {renderCell(deal, column.key, theme)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ================= Mobile Card View ================= */}
            <div className="block md:hidden space-y-4">
              {paginatedData.map((deal) => (
                <div
                  key={deal.id}
                  className={`p-4 rounded-lg border ${theme === 'dark'
                    ? 'bg-purplebg border-transparent'
                    : 'bg-white border-gray-200'
                    } shadow-sm`}
                >
                  <div className="flex justify-between items-center">
                    <input
                      type="checkbox"
                      checked={selectedDeals.includes(deal.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelection(deal.id);
                      }}
                      className="rounded mr-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div
                      className="flex items-center flex-1 cursor-pointer"
                      onClick={() => onDealClick?.(deal)}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purple-700' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}
                        >
                          {deal.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3
                        className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                      >
                        {deal.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">


                      {/* Dropdown arrow */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDealDetails(deal.id);
                        }}
                        className={`p-1 rounded transition-transform ${theme === 'dark' ? 'hover:bg-purple-700' : 'hover:bg-gray-100'
                          }`}
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform ${isDealExpanded(deal.id) ? 'rotate-180' : ''
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
                  {isDealExpanded(deal.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {/* Render all other columns as label:value */}
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
                              {deal[column.key] || 'N/A'}
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
      {
        totalPages > 1 && view === 'table' && (
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
        )
      }

      {
        selectedDeals.length > 0 && (
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
                  <button
                    onClick={() => {
                      handleDeleteSelected(); // UPDATED: Now checks linked items first
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
        )
      }
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
        onConfirm={handleDeleteConfirmation} // UPDATED: Now calls deleteDealsDirectly
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
        recordCount={filteredDataLength}
        selectedCount={selectedDeals.length}
        theme={theme}
        isLoading={isExporting}
        onFormatChange={handleFormatChange}
        onRefresh={fetchDeals}
      />

      {/* NEW: Linked Items Popup for Deals */}
      <LinkedItemsPopup
        isOpen={isLinkedItemsPopupOpen}
        onClose={() => {
          setIsLinkedItemsPopupOpen(false);
          setLinkedItems([]);
          setDealsToDelete([]);
        }}
        linkedItems={linkedItems}
        onUnlinkAll={handleUnlinkAll}
        isUnlinking={isUnlinking}
        theme={theme}
        selectedIds={dealsToDelete}
        onDeleteAfterUnlink={() => {
          // This will show the final delete confirmation popup after unlinking
          setShowDeleteLinkedConfirm(true);
        }}
      />
    </div >
  );
}