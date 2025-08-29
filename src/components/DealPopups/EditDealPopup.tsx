import React, { useState, useEffect } from 'react';
import { IoCloseOutline } from "react-icons/io5";
import { Loader2 } from 'lucide-react';

interface EditDealPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  theme: "light" | "dark";
  onSuccess: () => void;
}

interface FieldOption {
  label: string;
  value: string;
  fieldtype: string;
  options?: string;
}

export const EditDealPopup: React.FC<EditDealPopupProps> = ({
  isOpen,
  onClose,
  selectedIds,
  theme = "light",
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');
  const [fieldValue, setFieldValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedIds.length > 0) {
      fetchFieldOptions();
    }
  }, [isOpen, selectedIds]);

  const fetchFieldOptions = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_fields';

      const payload = {
        doctype: "CRM Deal"
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.message) {
        throw new Error('Invalid response format from server');
      }
      
      // Transform the API response to match our FieldOption interface
      const fields = result.message.map((field: any) => ({
        label: field.label,
        value: field.fieldname,
        fieldtype: field.fieldtype,
        options: field.options
      }));
      
      setFieldOptions(fields);
    } catch (error) {
      console.error('Error fetching field options:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch field options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedField) {
      setError('Please select a field');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = 'http://103.214.132.20:8002/api/method/frappe.desk.doctype.bulk_update.bulk_update.submit_cancel_or_update_docs';
      
      // Prepare the payload as specified
      const payload = {
        doctype: "CRM Deal",
        docnames: selectedIds,
        action: "update",
        data: {
          [selectedField]: fieldValue
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      onClose();
      
      if (result.message && result.message === "success") {
        onSuccess();
        onClose();
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating deals:', error);
      setError(error instanceof Error ? error.message : 'Failed to update deals');
    } finally {
      setLoading(false);
    }
  };

  const getInputType = (fieldType: string) => {
    switch (fieldType) {
      case 'Data':
      case 'Text':
      case 'Small Text':
        return 'text';
      case 'Int':
      case 'Float':
        return 'number';
      case 'Date':
        return 'date';
      case 'Check':
        return 'checkbox';
      default:
        return 'text';
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

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-auto rounded-lg shadow-lg ${
          theme === "dark"
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
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
          <button 
            onClick={onClose} 
            className={`rounded-full p-1 ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <IoCloseOutline size={24} className={theme === "dark" ? "text-white" : "text-gray-600"} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {fetchError && (
            <div className={`mb-4 p-3 rounded text-sm ${
              theme === 'dark' 
                ? 'bg-red-900/30 text-red-300 border border-red-700/50' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              <div className="font-medium">Failed to fetch</div>
              <div className="mt-1">{fetchError}</div>
            </div>
          )}

          {error && (
            <div className={`mb-4 p-3 rounded text-sm ${
              theme === 'dark' 
                ? 'bg-red-900/30 text-red-300 border border-red-700/50' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Field
              </label>
              <select
                value={selectedField}
                onChange={(e) => {
                  setSelectedField(e.target.value);
                  setFieldValue('');
                  setError(null);
                }}
                className={`w-full p-2.5 rounded-md border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={loading || !!fetchError}
              >
                <option value="">Select a field</option>
                {fieldOptions.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedField && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Value
                </label>
                {fieldOptions.find(f => f.value === selectedField)?.options ? (
                  <select
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className={`w-full p-2.5 rounded-md border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    disabled={loading}
                  >
                    <option value="">Select a value</option>
                    {fieldOptions
                      .find(f => f.value === selectedField)
                      ?.options?.split('\n')
                      .filter(option => option.trim() !== '')
                      .map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type={getInputType(fieldOptions.find(f => f.value === selectedField)?.fieldtype || 'text')}
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className={`w-full p-2.5 rounded-md border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter value"
                  />
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-md border text-sm font-medium ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-gray-700 border-gray-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-300"
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={loading || !selectedField}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Update {selectedIds.length} records
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};