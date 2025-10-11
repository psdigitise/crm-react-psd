import React, { useState, useEffect, useRef } from 'react';
import { X, Search, User } from 'lucide-react';
import { getUserSession } from '../../utils/session';
import { AUTH_TOKEN } from '../../api/apiUrl';

interface AssignToPopupProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIds: string[];
    theme: string;
    onSuccess?: () => void;
}

interface UserOption {
    value: string;
    description: string;
}

export function AssignToPopup({ isOpen, onClose, selectedIds, theme, onSuccess }: AssignToPopupProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserOption[]>([]);
    const [groupedUsers, setGroupedUsers] = useState<Record<string, UserOption[]>>({});
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers('');
        }
    }, [isOpen]);

    useEffect(() => {
        const grouped = users.reduce((acc, user) => {
            const firstLetter = user.description?.charAt(0).toUpperCase() || 'Other';
            if (!acc[firstLetter]) acc[firstLetter] = [];
            acc[firstLetter].push(user);
            return acc;
        }, {} as Record<string, UserOption[]>);
        setGroupedUsers(grouped);
    }, [users]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchUsers = async (searchText: string) => {
        setIsLoading(true);
        try {
            const session = getUserSession();
            const sessionCompany = session?.company;
            const apiUrl = 'https://api.erpnext.ai/api/method/frappe.desk.search.search_link';

            const payload = {
                txt: searchText,
                doctype: "User",
                filters: sessionCompany ? { company: sessionCompany } : null
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const result = await response.json();
            setUsers(result.message || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchUsers(value);
    };

    const handleSearchFocus = () => {
        setShowDropdown(true);
    };

    const handleUserSelect = (userValue: string) => {
        setSelectedUsers(prev => {
            if (prev.includes(userValue)) {
                return prev.filter(u => u !== userValue);
            } else {
                return [...prev, userValue];
            }
        });
        setShowDropdown(false); // Close dropdown after selection
    };

    const handleAssign = async () => {
        if (selectedUsers.length === 0 || selectedIds.length === 0) return;

        setIsSubmitting(true);
        try {
            const apiUrl = 'https://api.erpnext.ai/api/method/frappe.desk.form.assign_to.add_multiple';

            const payload = {
                doctype: "CRM Lead",
                name: JSON.stringify(selectedIds),
                assign_to: selectedUsers,
                bulk_assign: true,
                re_assign: true
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const result = await response.json();
            console.log('Assignment successful:', result);

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error assigning leads:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg w-[500px]  ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                {/* Header */}
                <div className={`flex justify-between items-center px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Assign To
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Search */}
                    <div className="mb-4">
                        <div className={`relative flex items-center p-2 rounded-xl ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                            <Search className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="John Doe"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={handleSearchFocus}
                                className={`w-full bg-transparent focus:outline-none ${theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                            />
                        </div>

                        {/* Selected Users as Tags */}
                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedUsers.map(userId => {
                                    const user = users.find(u => u.value === userId);
                                    return (
                                        <div
                                            key={userId}
                                            className={`flex items-center rounded-full px-3 py-1 text-sm font-medium ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}
                                        >
                                            {user?.description || userId}
                                            <button
                                                className="ml-2"
                                                onClick={() => setSelectedUsers(prev => prev.filter(u => u !== userId))}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* User List Dropdown */}
                        {showDropdown && (
                            <div
                                ref={dropdownRef}
                                className={`max-h-60 overflow-y-auto mt-4 rounded ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}
                            >
                                {isLoading ? (
                                    <div className="text-center py-4">Loading users...</div>
                                ) : Object.keys(groupedUsers).length === 0 ? (
                                    <div className="text-center py-4">No users found</div>
                                ) : (
                                    Object.entries(groupedUsers).map(([letter, users]) => (
                                        <div key={letter}>
                                            <div className={`px-3 py-1 font-semibold text-xs ${theme === 'dark' ? 'bg-gray-750 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                                {letter}
                                            </div>
                                            {users.map(user => (
                                                <div
                                                    key={user.value}
                                                    className={`flex items-center p-3 cursor-pointer border-b last:border-b-0 ${theme === 'dark'
                                                        ? 'border-gray-700 hover:bg-gray-750'
                                                        : 'border-gray-200 hover:bg-gray-100'
                                                        } ${selectedUsers.includes(user.value)
                                                            ? theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                                                            : ''
                                                        }`}
                                                    onClick={() => handleUserSelect(user.value)}
                                                >
                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${theme === 'dark' ? 'bg-blue-800' : 'bg-blue-100'}`}>
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                            {user.value}
                                                        </div>
                                                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {user.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                </div>


                {/* Footer */}
                <div className={` w-full px-3 py-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 mb-2 rounded-xl w-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 `}
                    >
                        cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={isSubmitting || selectedUsers.length === 0}
                        className={`px-4 py-2 rounded-xl w-full text-sm font-medium ${isSubmitting || selectedUsers.length === 0
                            ? 'bg-blue-300 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isSubmitting ? 'updating...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
}