
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Globe, Building2, DollarSign, Users, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

import { getUserSession } from '../utils/session';

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

export function OrganizationsTable({ searchTerm, onOrganizationClick }: OrganizationsTableProps) {
  const { theme } = useTheme();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Organization | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = getUserSession();

      if (!session) {
        setOrganizations([]);
        setLoading(false);
        return;
      }

      const apiUrl = `http://103.214.132.20:8002/api/method/crm.api.doc.get_data`;

      const requestBody = {
        doctype: "CRM Organization",
        filters: {},
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
        page_length: 20,
        page_length_count: 20,
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
          'Authorization': `token ${session.api_key}:${session.api_secret}`
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
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch organizations');
      showToast('Failed to fetch organizations', { type: 'error' });
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

  const handleSort = (field: keyof Organization) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = organizations.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField] ?? '';
    const bValue = b[sortField] ?? '';

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

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

  return (
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="name">Organization Name</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="website">Website</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="industry">Industry</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="annual_revenue">Annual Revenue</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="no_of_employees">Employees</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="territory">Territory</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="lastModified">Last Modified</SortButton>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
            {sortedData.map((org) => (
              <tr
                key={org.id}
                className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                  }`}
                onClick={() => onOrganizationClick && onOrganizationClick(org)}
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-blue-100'
                      }`}>
                      <Building2 className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{org.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm hover:text-blue-800 ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600'
                    }`}>
                    <Globe className="w-4 h-4 mr-2" />
                    <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer">
                      {org.website}
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {org.industry}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                    <DollarSign className="w-4 h-4 mr-1" />
                    {org.annual_revenue}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Users className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                    {org.no_of_employees}
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {org.territory}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                  {org.lastModified}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No results found</div>
          <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
            Try adjusting your search criteria
          </div>
        </div>
      )}
    </div>
  );
}