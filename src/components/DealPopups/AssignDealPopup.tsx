import React, { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

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

    const handleAssign = async () => {
        if (!selectedAssignee) return;
        
        setIsApiLoading(true);
        
        try {
            const response = await fetch('http://103.214.132.20:8002/api/method/frappe.desk.form.assign_to.add_multiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd' // You'll need to add your auth token
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
                            >
                                <option value="">Select an assignee</option>
                                {assignOptions.map((option) => (
                                    <option
                                        key={option}
                                        value={option}
                                        className={`${theme === 'dark' ? 'text-white bg-dark-accent' : 'text-gray-900 bg-white'
                                            }`}
                                    >
                                        {option}
                                    </option>
                                ))}
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