import React from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { apiAxios, AUTH_TOKEN, getAuthToken } from '../../api/apiUrl';

interface AttachmentPrivatePopupProps {
    closePopup: () => void;
    attachment: {
        name: string;
        is_private: number;
    };
    theme?: 'light' | 'dark';
    fetchAttachments: () => void;
}

export const LeadPrivatePopup: React.FC<AttachmentPrivatePopupProps> = ({
    closePopup,
    attachment,
    theme = 'dark',
    fetchAttachments,
}) => {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const token =  getAuthToken();

    const handleTogglePrivacy = async () => {
        setIsUpdating(true);

        try {
            const newValue = attachment.is_private === 1 ? 0 : 1;

            const response = await apiAxios.post(
                '/api/method/frappe.client.set_value',
                {
                    doctype: "File",
                    name: attachment.name,
                    fieldname: "is_private",
                    value: newValue
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );

            if (response.status === 200) {
                fetchAttachments();
                closePopup();
            }
        } catch (error) {
            console.error('Error updating attachment privacy:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={closePopup}
            />

            {/* Modal Content */}
            <div
                className={`relative border border-gray-800 transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${theme === 'dark'
                        ? 'bg-dark-accent border border-purple-500/30'
                        : 'bg-white border border-gray-200'
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
                            onClick={closePopup}
                        >
                            <IoCloseOutline size={24} />
                        </button>
                    </div>

                    {/* Header */}
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        {attachment.is_private ? 'Make Attachment Public' : 'Make Attachment Private'}
                    </h3>

                    {/* Content */}
                    <div className="mt-2">
                        <p className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                            }`}>
                            Are you sure you want to make this attachment {attachment.is_private ? 'public' : 'private'}?
                        </p>
                    </div>
                </div>

                {/* Footer with action buttons */}
                <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'
                    }`}>
                    <button
                        type="button"
                        onClick={handleTogglePrivacy}
                        disabled={isUpdating}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating...' : attachment.is_private ? 'Make Public' : 'Make Private'}
                    </button>
                    <button
                        type="button"
                        onClick={closePopup}
                        disabled={isUpdating}
                        className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${theme === 'dark'
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

export default LeadPrivatePopup;