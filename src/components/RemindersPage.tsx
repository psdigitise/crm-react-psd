import React, { useState } from 'react';
import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface Reminder {
  id: string;
  customerName: string;
  message: string;
  date: string;
  createdBy: string;
}

interface RemindersPageProps {
  onCreateReminder: () => void;
}

const sampleReminders: Reminder[] = [
  {
    id: '1',
    customerName: 'Hari',
    message: 'Call client',
    date: '17 6 2025',
    createdBy: 'Vinoth'
  },
  {
    id: '2',
    customerName: 'Vinoth',
    message: 'Call client',
    date: '17 6 2025',
    createdBy: 'Hari'
  },
  {
    id: '3',
    customerName: 'Surya',
    message: 'Finish',
    date: '17 6 2025',
    createdBy: 'Surya'
  },
  {
    id: '4',
    customerName: 'Ganesh',
    message: 'report',
    date: '17 6 2025',
    createdBy: 'Sathya'
  },
  {
    id: '5',
    customerName: 'Sathya',
    message: 'Finish report',
    date: '17 6 2025',
    createdBy: 'Ganesh'
  },
  {
    id: '6',
    customerName: 'hari',
    message: 'Finish project',
    date: '17 6 2025',
    createdBy: 'hari'
  }
];

export function RemindersPage({ onCreateReminder }: RemindersPageProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [reminders] = useState<Reminder[]>(sampleReminders);

  const filteredReminders = reminders.filter(reminder =>
    Object.values(reminder).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className={`p-4 sm:p-6 min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary' 
        : 'bg-gray-50'
    }`}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Reminder</h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>/ reminder</p>
        </div>
        <button
          onClick={onCreateReminder}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            theme === 'dark' 
              ? 'bg-purplebg text-white hover:bg-purple-700' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Create</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            theme === 'dark' ? 'text-white' : 'text-white'
          }`} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 placeholder-black focus:ring-blue-500 focus:border-transparent w-full ${
              theme === 'dark' 
                ? 'bg-white-31 border-white text-white placeholder-gray-400' 
                : 'border-gray-300 placeholder-black'
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'text-white hover:text-white hover:bg-purple-800/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}>
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'text-white hover:text-white hover:bg-purple-800/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}>
            <Filter className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'text-white hover:text-white hover:bg-purple-800/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}>
            <ArrowUpDown className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'text-white hover:text-white hover:bg-purple-800/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}>
            <Columns className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'text-white hover:text-white hover:bg-purple-800/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reminders Table */}
      <div className={`rounded-lg shadow-sm border overflow-hidden ${
        theme === 'dark' 
          ? 'bg-custom-gradient border-white' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${
              theme === 'dark' ? 'bg-purplebg border-white' : 'bg-gray-50 border-gray-200'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                  Customer Name
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                  Message
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                  Created By
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
              {filteredReminders.map((reminder) => (
                <tr key={reminder.id} className={`transition-colors ${
                  theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                }`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {reminder.customerName}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {reminder.message}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {reminder.date}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {reminder.createdBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}