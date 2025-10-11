import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { AUTH_TOKEN } from '../../api/apiUrl';

interface ClearAssignmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  theme: string;
  onSuccess: () => void;
}

export function ClearAssignmentPopup({
  isOpen,
  onClose,
  selectedIds,
  theme,
  onSuccess
}: ClearAssignmentPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClearAssignment = async () => {
    if (selectedIds.length === 0) {
      setError("No leads selected for clearing assignment.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = `https://api.erpnext.ai/api/method/frappe.desk.form.assign_to.remove_multiple`;

      // Format the payload exactly as shown in the image
      const payload = {
        doctype: "CRM Lead",
        names: JSON.stringify(selectedIds),
        ignore_permissions: true
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to clear assignment: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Clear assignment successful:', result);

      onSuccess();
      onClose();

    } catch (error) {
      console.error("Failed to clear assignment:", error);
      setError(error instanceof Error ? error.message : 'Failed to clear assignment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
            Clear Assignment
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${
              theme === 'dark' 
                ? 'text-white hover:bg-purple-800/50' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Are you sure you want to clear assignment for {selectedIds.length} item(s)?
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 p-3 rounded text-sm ${
            theme === 'dark' 
              ? 'bg-red-900/30 text-red-300' 
              : 'bg-red-50 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-white hover:bg-purple-800/50 border border-purple-500/30'
                : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleClearAssignment}
            disabled={isLoading}
            className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2 ${
              theme === 'dark'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Clear Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
}