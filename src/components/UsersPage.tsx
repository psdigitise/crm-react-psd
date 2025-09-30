import React, { useState } from 'react';
import { UsersTable } from './UsersTable';
import { UserDetailView } from './UserDetailView';
import { CreateUserModal } from './CreateUserModal';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';

interface User {
  name: string;
  email: string;
  first_name: string;
  last_name?: string;
  full_name?: string;
  creation?: string;
  modified?: string;
  company?: string;
  role_profile_name?: string;
}

export function UsersPage() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleUserBack = () => {
    setSelectedUser(null);
  };

  const handleUserSave = (updatedUser: User) => {
    setSelectedUser(updatedUser);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (data: any) => {
    console.log('User created successfully:', data);
    setShowCreateModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    console.log('Refreshing users...');
  };

  const handleFilter = () => {
    console.log('Opening filter...');
  };

  const handleSort = () => {
    console.log('Opening sort...');
  };

  const handleColumns = () => {
    console.log('Opening column settings...');
  };

  if (selectedUser) {
    return (
      <UserDetailView
        user={selectedUser}
        onBack={handleUserBack}
        onSave={handleUserSave}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark'
      ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
      : 'bg-gray-50'
      }`}>
      <Header
        title="Users"
        subtitle="List"
        onRefresh={handleRefresh}
        onFilter={handleFilter}
        onSort={handleSort}
        onColumns={handleColumns}
        onCreate={handleCreate}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="p-4 sm:p-6">
        <UsersTable
          searchTerm={searchTerm}
          refreshTrigger={refreshTrigger}
          onUserClick={handleUserClick}
        />
      </div>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}