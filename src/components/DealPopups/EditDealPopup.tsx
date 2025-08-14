import { IoCloseOutline } from "react-icons/io5";

interface EditDealPopupProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
}

export const EditDealPopup: React.FC<EditDealPopupProps> = ({
  isOpen,
  onClose,
  theme = "light",
}) => {


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg mx-auto rounded-lg shadow-lg border ${
          theme === "dark"
            ? "bg-[#111827] border-gray-700"
            : "bg-white border-gray-300"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-600">
          <h2
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
           Bulk Edit
          </h2>
          <button onClick={onClose} className="p-1">
            <IoCloseOutline size={24} className={theme === "dark" ? "text-white" : "text-gray-600"} />
          </button>
        </div>

        {/* Body */}
        <form >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Field
              </label>
              <select
                name="status"
                className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="Qualification">Qualification</option>
                <option value="Demo/Making">Demo/Making</option>
                <option value="Proposal/Quotation">Proposal/Quotation</option>
                <option value="Negotiation">Negotiation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Value
              </label>
              <input
                type="text"
                name="name"
               
                className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// import { IoCloseOutline } from "react-icons/io5";
// import { useEffect, useState } from "react";

// interface EditDealPopupProps {
//   isOpen: boolean;
//   onClose: () => void;
//   theme?: "light" | "dark";
// }

// interface Field {
//   label: string;
//   fieldname: string;
//   fieldtype: string;
// }

// export const EditDealPopup: React.FC<EditDealPopupProps> = ({
//   isOpen,
//   onClose,
//   theme = "light",
// }) => {
//   const [fields, setFields] = useState<Field[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!isOpen) return;

//     const fetchFields = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch("http://103.214.132.20:8002/api/method/crm.api.doc.get_fields", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ doctype: "CRM Deal" }),
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         if (data.message && Array.isArray(data.message)) {
//           // Extract only the label and fieldname from each field
//           const filteredFields = data.message.map((field: any) => ({
//             label: field.label,
//             fieldname: field.fieldname,
//             fieldtype: field.fieldtype,
//           }));
//           setFields(filteredFields);
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to fetch fields");
//         console.error("Error fetching fields:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFields();
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
//       {/* Overlay */}
//       <div
//         className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
//         onClick={onClose}
//       />

//       {/* Modal */}
//       <div
//         className={`relative w-full max-w-lg mx-auto rounded-lg shadow-lg border ${
//           theme === "dark"
//             ? "bg-[#111827] border-gray-700"
//             : "bg-white border-gray-300"
//         }`}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-600">
//           <h2
//             className={`text-lg font-semibold ${
//               theme === "dark" ? "text-white" : "text-gray-900"
//             }`}
//           >
//             Bulk Edit
//           </h2>
//           <button onClick={onClose} className="p-1">
//             <IoCloseOutline size={24} className={theme === "dark" ? "text-white" : "text-gray-600"} />
//           </button>
//         </div>

//         {/* Body */}
//         <form>
//           <div className="p-6 space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                 Field
//               </label>
//               {loading ? (
//                 <div className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white">
//                   Loading fields...
//                 </div>
//               ) : error ? (
//                 <div className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white text-red-500">
//                   {error}
//                 </div>
//               ) : (
//                 <select
//                   name="field"
//                   className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
//                 >
//                   <option value="">Select a field</option>
//                   {fields.map((field) => (
//                     <option key={field.fieldname} value={field.fieldname}>
//                       {field.label} ({field.fieldtype})
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                 Value
//               </label>
//               <input
//                 type="text"
//                 name="value"
//                 className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
//               />
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex justify-end space-x-3 px-6 py-4 border-t dark:border-gray-600">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 rounded-md border text-sm font-medium text-gray-600 dark:text-gray-300"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
//             >
//               Save
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };