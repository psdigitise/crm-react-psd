import React, { useEffect, useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { AUTH_TOKEN } from '../../api/apiUrl';
import { getUserSession } from '../../utils/session';

interface AssignDealPopupProps {
    isOpen: boolean;
    onClose: () => void;
    theme?: 'light' | 'dark';
    onAssign: (assignee: string) => void;
    isLoading?: boolean;
    assignOptions: string[]; // Array of possible assignees
    currentAssignee?: string; // Currently assigned person
    dealNames: string[]; // Array of deal names to assign
}

interface UserOption {
    value: string;
    description: string;
}

export const AssignDealPopup: React.FC<AssignDealPopupProps> = ({
    isOpen,
    onClose,
    theme = 'dark',
    onAssign,
    assignOptions,
    currentAssignee = '',
    dealNames = []
}) => {
    const [selectedAssignee, setSelectedAssignee] = useState(currentAssignee);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Fetch users when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchUserOptions();
        }
    }, [isOpen]);

    const fetchUserOptions = async () => {
        try {
            setIsLoadingUsers(true);


            const session = getUserSession();
            const sessionCompany = session?.company;

            const response = await fetch('https://api.erpnext.ai/api/method/frappe.desk.search.search_link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN
                },
                body: JSON.stringify({
                    txt: "",
                    doctype: "User",
                    filters: {
                        company: sessionCompany
                    }
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.message && Array.isArray(result.message)) {
                    const users = result.message.map((item: any) => ({
                        value: item.value, // Email address
                        description: item.description || item.value // Full name
                    }));
                    setUserOptions(users);
                }
            } else {
                console.error('Failed to fetch users:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedAssignee) return;

        setIsApiLoading(true);

        try {
            const response = await fetch('https://api.erpnext.ai/api/method/frappe.desk.form.assign_to.add_multiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_TOKEN // You'll need to add your auth token
                },
                body: JSON.stringify({
                    doctype: "CRM Deal",
                    name: JSON.stringify(dealNames), // Format as required
                    assign_to: selectedAssignee,
                    bulk_assign: true,
                    re_assign: true
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Assignment successful:', result);
                onAssign(selectedAssignee);
                onClose();
            } else {
                console.error('Assignment failed:', response.statusText);
                // Handle error (show message to user, etc.)
            }
        } catch (error) {
            console.error('Error assigning deal:', error);
            // Handle error (show message to user, etc.)
        } finally {
            setIsApiLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative border border-gray-800 transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
                    }`}
            >
                <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
                    }`}>
                    {/* Close Button */}
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className={`rounded-md ${theme === 'dark' ? 'text-white' : 'text-gray-400'
                                } hover:text-gray-500 focus:outline-none`}
                            onClick={onClose}
                        >
                            <IoCloseOutline size={24} />
                        </button>
                    </div>

                    {/* Header */}
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        Assign Deal
                    </h3>

                    {/* Content */}
                    <div className="mt-2 space-y-4">
                        <div>
                            <select
                                id="assignee"
                                value={selectedAssignee}
                                onChange={(e) => setSelectedAssignee(e.target.value)}
                                className={`block w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${theme === 'dark'
                                    ? 'bg-dark-accent border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                                    : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                disabled={isLoadingUsers}
                            >
                                <option value="">Select an assignee</option>
                                {isLoadingUsers ? (
                                    <option value="" disabled>Loading users...</option>
                                ) : (
                                    userOptions.map((user) => (
                                        <option
                                            key={user.value}
                                            value={user.value}
                                            className={`${theme === 'dark' ? 'text-white bg-dark-accent' : 'text-gray-900 bg-white'
                                                }`}
                                        >
                                            {user.description} {/* Display full name */}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer with action buttons */}
                <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'
                    }`}>
                    <button
                        type="button"
                        onClick={handleAssign}
                        disabled={isApiLoading || !selectedAssignee}
                        className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-1.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${isApiLoading || !selectedAssignee
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                    >
                        {isApiLoading ? 'Assigning...' : 'Update'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isApiLoading}
                        className={`inline-flex justify-center rounded-md border shadow-sm px-4 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'dark'
                            ? 'border-purple-500/30 bg-dark-accent text-white hover:bg-purple-800/50'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};