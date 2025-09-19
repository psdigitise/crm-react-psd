import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getUserSession } from '../../utils/session';

interface BulkEditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  theme: string;
  onSuccess: () => void;
}

interface FieldOption {
  label: string;
  value: string;
  fieldtype: string;
  options?: string;
}

export function BulkEditPopup({ isOpen, onClose, selectedIds, theme, onSuccess }: BulkEditPopupProps) {
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
      const session = getUserSession();
      const sessionCompany = session?.company || '';
      setLoading(true);
      setFetchError(null);
      
      const apiUrl = 'http://103.214.132.20:8002/api/method/crm.api.doc.get_fields';

      const payload = {
        doctype: "CRM Lead",
         filters: JSON.stringify({
            company: sessionCompany
          })
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:9f48cd1310e112b'
        },
        body: JSON.stringify(payload) // Fixed: Added comma after headers
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
        doctype: "CRM Lead",
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
          'Authorization': 'token 1b670b800ace83b:9f48cd1310e112b'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.message && result.message === "success") {
        onSuccess();
        onClose();
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating leads:', error);
      setError(error instanceof Error ? error.message : 'Failed to update leads');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg shadow-lg p-6 w-full max-w-md ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Bulk Edit
          </h2>
          <button
            onClick={onClose}
            className={`rounded-full p-1 ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                  // disabled={loading}
                  placeholder="Enter value"
                />
              )}
            </div>
          )}

          <div className="w-full space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              disabled={loading}
            >
              Cancel
            </button> */}
            <button
              type="submit"
              className={`px-4 py-2 w-full text-sm font-medium text-white bg-blue-600 rounded-xl transition-colors hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={loading || !selectedField}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Update {selectedIds.length} records
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}