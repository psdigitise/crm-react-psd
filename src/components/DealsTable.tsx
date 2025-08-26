import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Phone, Loader2, Filter, Settings, X, ChevronLeft, ChevronRight, RefreshCcw, Download } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { FaCircleDot } from 'react-icons/fa6';
import * as XLSX from 'xlsx';

interface Deal {
  id: string;
  name: string;
  organization: string;
  status: string;
  email: string;
  mobileNo: string;
  assignedTo: string;
  lastModified: string;
  annualRevenue: string;
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

const statusColors = {
  Qualification: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Demo/Making': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Proposal/Quotation': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Negotiation: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
};

const defaultColumns = [
  { key: 'name', label: 'Name', visible: true },
  { key: 'organization', label: 'Organization', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'mobileNo', label: 'Mobile No', visible: true },
  { key: 'assignedTo', label: 'Assigned To', visible: true },
  { key: 'lastModified', label: 'Last Modified', visible: true },
  { key: 'annualRevenue', label: 'Annual Revenue', visible: false },
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

      const filters = encodeURIComponent(JSON.stringify([
        ["company", "=", sessionCompany]
      ]));

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/CRM Deal?fields=["organization_name","website","no_of_employees","territory","annual_revenue","industry","salutation","first_name","last_name","email","mobile_no","gender","status","deal_owner","name","modified"]&filters=${filters}&limit_page_length=1000&limit_start=0`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Transform API data to match our Deal interface
      const transformedDeals: Deal[] = result.data.map((apiDeal: ApiDeal) => ({
        id: apiDeal.name || Math.random().toString(),
        name: apiDeal.name || 'Unknown',
        organization: apiDeal.organization_name || 'N/A',
        status: apiDeal.status || 'Qualification',
        email: apiDeal.email || 'N/A',
        mobileNo: apiDeal.mobile_no || 'N/A',
        assignedTo: apiDeal.deal_owner || 'N/A',
        lastModified: formatDate(apiDeal.modified),
        annualRevenue: formatCurrency(apiDeal.annual_revenue),
        website: apiDeal.website,
        territory: apiDeal.territory,
        industry: apiDeal.industry,
        no_of_employees: apiDeal.no_of_employees,
        deal_owner: apiDeal.deal_owner
      }));

      setDeals(transformedDeals);

      // Set filter options
      setFilterOptions({
        status: Array.from(new Set(transformedDeals.map(d => d.status).filter(Boolean))),
        territory: Array.from(new Set(transformedDeals.map(d => d.territory).filter(Boolean))),
        industry: Array.from(new Set(transformedDeals.map(d => d.industry).filter(Boolean))),
        assignedTo: Array.from(new Set(transformedDeals.map(d => d.assignedTo).filter(Boolean)))
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
  const exportToExcel = () => {
    const visibleColumns = columns.filter(col => col.visible);
    const exportData = sortedData.map(deal => {
      const row: Record<string, any> = {};
      visibleColumns.forEach(col => {
        row[col.label] = deal[col.key as keyof Deal] ?? '';
      });
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deals');
    XLSX.writeFile(workbook, 'deals_export.xlsx');
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
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
          <button
            onClick={exportToExcel}
            title="Export to Excel"
            className={`p-2 text-sm border rounded-lg transition-colors flex items-center justify-center ${theme === 'dark'
              ? 'border-purple-500/30 text-white hover:bg-purple-800/50'
              : 'border-gray-300 hover:bg-gray-50'
              }`}
          >
            <Download className="w-4 h-4" />
          </button>
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

function renderCell(deal: Deal, key: keyof Deal, theme: string) {
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
    case 'status':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
          <FaCircleDot className={`mr-1 ${statusColors[deal.status as keyof typeof statusColors]}`} />
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
      return (
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
            }`}>
            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'
              }`}>
              {deal.assignedTo.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {deal.assignedTo}
          </div>
        </div>
      );
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
    default:
      return deal[key]?.toString() || 'N/A';
  }
}