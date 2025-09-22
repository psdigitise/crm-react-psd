import React from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { apiAxios } from '../../api/apiUrl';

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

    // const handleTogglePrivacy = async () => {
    //     setIsUpdating(true);

    //     try {
    //         const response = await apiAxios.post(
    //             '/api/method/frappe.client.set_value',
    //             {
    //                 doctype: "File",
    //                 name: attachment.name,
    //                 fieldname: {
    //                     is_private: attachment.is_private ? false : true
    //                 }
    //             },
    //             {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd'
    //                 }
    //             }
    //         );

    //         if (response.status === 200) {
    //             fetchAttachments();
    //             closePopup();
    //         }
    //     } catch (error) {
    //         console.error('Error updating attachment privacy:', error);
    //         // You might want to show an error message here
    //     } finally {
    //         setIsUpdating(false);
    //     }
    // };


// const handleTogglePrivacy = async () => {
//   setIsUpdating(true);

//   try {
//     const response = await apiAxios.post(
//       '/api/method/frappe.client.set_value',
//       {
//         doctype: "File",
//         name: attachment.name,
//         fieldname: "is_private", // <-- string name of the field
//         value: Number(!attachment.is_private) // <-- new value
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd'
//         }
//       }
//     );

//     if (response.status === 200) {
//       fetchAttachments();
//       closePopup();
//     }
//   } catch (error) {
//     console.error('Error updating attachment privacy:', error);
//   } finally {
//     setIsUpdating(false);
//   }
// };
const handleTogglePrivacy = async () => {
  setIsUpdating(true);

  try {
    // Flip the current value: 1 -> 0, 0 -> 1
    const newValue = attachment.is_private === 1 ? 0 : 1;

    const response = await apiAxios.post(
      '/api/method/frappe.client.set_value',
      {
        doctype: "File",
        name: attachment.name,
        fieldname: "is_private", // string field name
        value: newValue            // numeric 0 or 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd'
        }
      }
    );

    if (response.status === 200) {
      fetchAttachments(); // refresh file list
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
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${attachment.is_private
                                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                    >
                        {isUpdating ? 'Updating...' : attachment.is_private ? 'Make Public' : 'Make Private'}
                    </button>
                 
                </div>
            </div>
        </div>
    );
};

export default LeadPrivatePopup;