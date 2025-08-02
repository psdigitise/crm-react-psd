import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, User, Mail, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';

import { getUserSession } from '../utils/session';

interface User {
  name: string;
  email: string;
  first_name: string;
  last_name?: string;
  full_name?: string;
  creation?: string;
  modified?: string;
}

interface UsersTableProps {
  searchTerm: string;
  onUserClick?: (user: User) => void;
}

export function UsersTable({ searchTerm, onUserClick }: UsersTableProps) {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchUsers();
  }, []);

  // const fetchUsers = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     // Get company from session
  //     const sessionCompany = sessionStorage.getItem('company');
  //     if (!sessionCompany) {
  //       setUsers([]);
  //       setLoading(false);
  //       return;
  //     }
  //     const filters = encodeURIComponent(JSON.stringify([["company", "=", sessionCompany]]));
  //     // const apiUrl = 'http://103.214.132.20:8002/api/v2/document/User?fields=["name","email","first_name","last_name","full_name","creation","modified"]filters=' + filters;
  //     const apiUrl = `http://103.214.132.20:8002/api/v2/document/User?fields=["name","email","first_name","last_name","full_name","creation","modified"]&filters=${filters}`;
  //     console.log('Session Company:', sessionCompany);
  //     console.log('API URL:', apiUrl);


  //     const response = await fetch(apiUrl, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
  //       }
  //     });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get session and extract company
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const filters = encodeURIComponent(JSON.stringify([
        ["company", "=", sessionCompany]
      ]));

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/User?fields=["name","email","first_name","last_name","full_name","creation","modified"]&filters=${filters}`;

      console.log('Session Company:', sessionCompany);
      console.log('API URL:', apiUrl);

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

      // Transform API data to match our User interface
      const transformedUsers: User[] = result.data.map((apiUser: any) => ({
        name: apiUser.name || apiUser.email || 'Unknown',
        email: apiUser.email || 'N/A',
        first_name: apiUser.first_name || '',
        last_name: apiUser.last_name || '',
        full_name: apiUser.full_name || `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || apiUser.email,
        creation: apiUser.creation,
        modified: apiUser.modified
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
      showToast('Failed to fetch users', { type: 'error' });
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

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = users.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortButton = ({ field, children }: { field: keyof User; children: React.ReactNode }) => (
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
          <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-purplebg' : 'text-blue-600'}`} />
          <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading users...</span>
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
          <div className={`mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error loading users</div>
          <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{error}</div>
          <button
            onClick={fetchUsers}
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
                <SortButton field="full_name">Name</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="email">Email</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="first_name">First Name</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="last_name">Last Name</SortButton>
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                <SortButton field="creation">Created</SortButton>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
            {sortedData.map((user) => (
              <tr
                key={user.name}
                className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                  }`}
                onClick={() => onUserClick && onUserClick(user)}
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-200'
                      }`}>
                      <User className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
                    </div>
                    <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user.full_name || user.first_name || user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Mail className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                    {user.email}
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.first_name || 'N/A'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.last_name || 'N/A'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                  {formatDate(user.creation || '')}
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