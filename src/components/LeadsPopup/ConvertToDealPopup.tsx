import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ConvertToDealPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  theme: string;
  onSuccess: () => void;
}

export function ConvertToDealPopup({ 
  isOpen, 
  onClose, 
  selectedIds, 
  theme, 
  onSuccess 
}: ConvertToDealPopupProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConvert = async () => {
    if (selectedIds.length === 0) {
      setError("No leads selected for conversion.");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      
      // Convert each selected lead to a deal
      for (const leadId of selectedIds) {
        const apiUrl = `http://103.214.132.20:8002/api/method/crm.fcrm.doctype.crm_lead.crm_lead.convert_to_deal`;
        
        const payload = {
          lead: leadId
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Failed to convert lead ${leadId}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`Converted lead ${leadId} to deal:`, result);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to convert leads:", error);
      setError(error instanceof Error ? error.message : 'Failed to convert leads');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 w-full max-w-md ${
        theme === 'dark' 
          ? 'bg-dark-accent border border-purple-500/30' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Convert to Deal
          </h3>
          <button
            onClick={onClose}
            className={theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-700'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
          Are you sure you want to convert {selectedIds.length} Lead(s) to Deal(s)?
        </div>

        {error && (
          <div className={`mb-4 p-2 rounded text-sm ${
            theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={isConverting}
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              theme === 'dark'
                ? 'bg-purplebg text-white hover:bg-purple-700'
                : 'bg-purplebg text-white hover:bg-purple-700'
            }`}
            disabled={isConverting}
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}