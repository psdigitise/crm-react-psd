import React from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { apiAxios, AUTH_TOKEN } from '../../api/apiUrl';

interface DeleteAttachmentPopupProps {
    closePopup: () => void;
    attachment: {
        name: string;
    };
    theme?: 'light' | 'dark';
    fetchAttachments: any;
}

export const DeleteAttachmentPopup: React.FC<DeleteAttachmentPopupProps> = ({
    closePopup,
    attachment,
    theme = 'dark',
    fetchAttachments,
}) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        
        try {
            const response = await apiAxios.post(
                '/api/method/frappe.client.delete',
                {
                    doctype: "File",
                    name: attachment.name
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': AUTH_TOKEN
                    }
                }
            );

            if (response.status === 200) {
                fetchAttachments();
                closePopup();
            }
        } catch (error) {
            console.error('Error deleting attachment:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 w-full max-w-md mx-4 ${
                theme === 'dark' 
                    ? 'bg-dark-accent border border-purple-500/30' 
                    : 'bg-white border border-gray-200'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        Delete Attachment
                    </h2>
                    <button
                        onClick={closePopup}
                        className={`p-1 rounded-full ${
                            theme === 'dark' 
                                ? 'text-white hover:bg-purple-800/50' 
                                : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        disabled={isDeleting}
                    >
                        <IoCloseOutline className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Are you sure you want to delete this attachment? This action cannot be undone.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={closePopup}
                        disabled={isDeleting}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                            theme === 'dark'
                                ? 'text-white hover:bg-purple-800/50 border border-purple-500/30'
                                : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2 ${
                            theme === 'dark'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAttachmentPopup;