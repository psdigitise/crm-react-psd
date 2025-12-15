// import React from 'react';
// import { IoCloseOutline } from 'react-icons/io5';
// import { apiAxios, AUTH_TOKEN } from '../../api/apiUrl';

// interface DeleteTaskPopupProps {
//     closePopup: () => void;
//     task: {
//         name: string;
//         title?: string; // Optional title to display
//     };
//     theme?: 'light' | 'dark';
//     onDeleteSuccess: () => void; // Callback after successful deletion
// }

// export const DeleteTaskPopup: React.FC<DeleteTaskPopupProps> = ({
//     closePopup,
//     task,
//     theme = 'dark',
//     onDeleteSuccess,
// }) => {
//     const [isDeleting, setIsDeleting] = React.useState(false);

//     const handleDelete = async () => {
//         setIsDeleting(true);

//         try {
//             const response = await apiAxios.post(
//                 'https://api.erpnext.ai/api/method/frappe.client.delete',
//                 {
//                     doctype: "CRM Task", // Changed to "CRM Task"
//                     name: task.name
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': AUTH_TOKEN
//                     }
//                 }
//             );

//             if (response.status === 200) {
//                 onDeleteSuccess();
//                 closePopup();
//             }
//         } catch (error) {
//             console.error('Error deleting task:', error);
//             // You might want to show an error message here
//         } finally {
//             setIsDeleting(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
//             {/* Overlay */}
//             <div
//                 className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
//                 onClick={closePopup}
//             />

//             {/* Modal Content */}
//             <div
//                 className={`relative border border-gray-400 transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
//                     }`}
//             >
//                 <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
//                     }`}>
//                     {/* Close Button */}
//                     <div className="absolute top-0 right-0 pt-4 pr-4">
//                         <button
//                             type="button"
//                             className={`rounded-md ${theme === 'dark' ? 'text-white' : 'text-gray-400'
//                                 } hover:text-gray-500 focus:outline-none`}
//                             onClick={closePopup}
//                         >
//                             <IoCloseOutline size={24} />
//                         </button>
//                     </div>

//                     {/* Header */}
//                     <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                         }`}>
//                         Delete Task
//                     </h3>

//                     {/* Content */}
//                     <div className="mt-2">
//                         <p className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-500'
//                             }`}>
//                             {task.title
//                                 ? `Are you sure you want to delete "${task.title}"?`
//                                 : 'Are you sure you want to delete this task?'}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Footer with action buttons */}
//                 <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'
//                     }`}>
//                     <button
//                         type="button"
//                         onClick={handleDelete}
//                         disabled={isDeleting}
//                         className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
//                     >
//                         {isDeleting ? 'Deleting...' : 'Delete'}
//                     </button>
//                     <button
//                         type="button"
//                         onClick={closePopup}
//                         disabled={isDeleting}
//                         className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${theme === 'dark'
//                                 ? 'border-purple-500/30 bg-dark-accent text-white hover:bg-purple-800/50'
//                                 : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
//                             }`}
//                     >
//                         Cancel
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

import React from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { apiAxios, AUTH_TOKEN } from '../../api/apiUrl';
import { showToast } from '../../utils/toast';

interface DeleteTaskPopupProps {
    closePopup: () => void;
    task: {
        name: string;
        title?: string; // Optional title to display
    };
    theme?: 'light' | 'dark';
    onDeleteSuccess: () => void; // Callback after successful deletion
}

export const DeleteTaskPopup: React.FC<DeleteTaskPopupProps> = ({
    closePopup,
    task,
    theme = 'dark',
    onDeleteSuccess,
}) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            // Use the correct endpoint - remove the duplicate "api" in the URL
            const response = await apiAxios.post(
                'https://api.erpnext.ai/api/method/frappe.client.delete',
                {
                    doctype: "CRM Task",
                    name: task.name
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': AUTH_TOKEN
                    }
                }
            );

            if (response.status === 200) {
                onDeleteSuccess();
                closePopup();
            } else {
                console.error('Failed to delete task:', response);
                // Show error message to user
            }
        } catch (error: any) {
            console.error('Error deleting task:', error);
            let errorMessage = "Failed to delete task due to an unknown error.";

            if (error.response && error.response.data) {
                const responseData = error.response.data;

                // 1. Check for the Frappe _server_messages structure
                if (responseData._server_messages) {
                    try {
                        // The server message is a stringified JSON array containing a stringified JSON object
                        const messagesArray = JSON.parse(responseData._server_messages);

                        if (messagesArray.length > 0) {
                            const messageObject = JSON.parse(messagesArray[0]);
                            // Extract and clean the error message
                            errorMessage = messageObject.message.replace(/<\/?a[^>]*>/g, '').replace(/<\/?strong>/g, '');

                            // You can also check the indicator for toast type if needed
                            const dynamicMessage = messageObject.message.replace(/<\/?a[^>]*>/g, '').replace(/<\/?strong>/g, '');
                            errorMessage = `This task cannot be deleted because it is linked to a CRM Notification.`;
                            const indicator = messageObject.indicator || 'red';
                            //showToast(errorMessage, { type: indicator === 'red' ? 'error' : 'warning' });
                            showToast(errorMessage || dynamicMessage, { type: indicator === 'red' ? 'error' : 'warning' });
                            closePopup(); // Close the modal after showing the error
                            return; // Stop further execution
                        }
                    } catch (parseError) {
                        console.error("Failed to parse Frappe server messages:", parseError);
                        // Fallback to generic error message
                    }
                }

                // 2. Fallback to generic exception message
                if (responseData.exception) {
                    errorMessage = responseData.exception.split(':').pop()?.trim() || "Deletion failed.";
                }

                showToast(errorMessage, { type: 'error' });

            } else {
                // Network or other non-response errors
                showToast("Network error or server is unreachable. Please try again.", { type: 'error' });
            }
            // Show error message to user
        } finally {
            setIsDeleting(false);
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
                className={`relative border border-gray-400 transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
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
                        Delete Task
                    </h3>

                    {/* Content */}
                    <div className="mt-2">
                        <p className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                            }`}>
                            {task.title
                                ? `Are you sure you want to delete "${task.title}"?`
                                : 'Are you sure you want to delete this task?'}
                        </p>
                    </div>
                </div>

                {/* Footer with action buttons */}
                <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'
                    }`}>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                        type="button"
                        onClick={closePopup}
                        disabled={isDeleting}
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