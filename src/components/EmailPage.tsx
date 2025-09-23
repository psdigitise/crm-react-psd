import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Mail, Send } from 'lucide-react';
import { showToast } from '../utils/toast';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';

interface Email {
  name: string;
  sender: string;
  recipients: Array<{
    recipient: string;
    status: string;
  }>;
  message: string;
  creation?: string;
  modified?: string;
}

interface EmailPageProps {
  onCreateEmail: () => void;
}

export function EmailPage({ onCreateEmail }: EmailPageProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v2/document/Email Queue`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:70fe26f35d23e6f'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setEmails(result.data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      showToast('Failed to fetch emails', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email =>
    Object.values(email).some(value => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (Array.isArray(value)) {
        return value.some(item => 
          typeof item === 'object' && item !== null &&
          Object.values(item).some(subValue => 
            typeof subValue === 'string' && 
            subValue.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
      return false;
    })
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary' 
          : 'bg-gray-50'
      }`}>
        <Header
          title="Email Queue"
          onRefresh={fetchEmails}
          onFilter={() => {}}
          onSort={() => {}}
          onColumns={() => {}}
          onCreate={onCreateEmail}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading emails...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary' 
        : 'bg-gray-50'
    }`}>
      <Header
        title="Email Queue"
        onRefresh={fetchEmails}
        onFilter={() => {}}
        onSort={() => {}}
        onColumns={() => {}}
        onCreate={onCreateEmail}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="p-4 sm:p-6">
        {/* Emails Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEmails.map((email) => (
            <div key={email.name} className={`rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
              theme === 'dark' 
                ? 'bg-custom-gradient border-white' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className={`w-5 h-5 ${theme === 'dark' ? 'bg-purplebg' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                </div>
                <Send className={`w-4 h-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>From:</label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{email.sender}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Recipients:</label>
                  <div className="space-y-1">
                    {/* {email.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>{recipient.recipient}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          recipient.status === 'Sent' 
                            ? theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                            : theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {recipient.status}
                        </span>
                      </div>
                    ))} */}
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Message:</label>
                  <p className={`text-sm p-3 rounded-lg mt-1 ${
                    theme === 'dark' ? 'bg-dark-tertiary text-gray-200' : 'bg-gray-50 text-gray-900'
                  }`}>
                    {email.message}
                  </p>
                </div>
                
                {email.creation && (
                  <div className={`text-xs pt-2 border-t ${
                    theme === 'dark' ? 'text-gray-500 border-purple-500/30' : 'text-white border-gray-200'
                  }`}>
                    Sent: {new Date(email.creation).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEmails.length === 0 && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No emails found</div>
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
              Send your first email to get started
            </div>
          </div>
        )}
      </div>
    </div>
  );
}