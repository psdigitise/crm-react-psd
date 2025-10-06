import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

// Define the props the component will accept
interface ExportPopupProps {
    isOpen: boolean;
    onClose: () => void;
    recordCount: number;
    selectedCount: number; // Add selected count
    onConfirm: (exportType: string, exportAll: boolean) => void; // Updated to include exportAll parameter
    theme: 'light' | 'dark';
    isLoading: boolean;
    onFormatChange?: (format: 'Excel' | 'CSV') => void;
    onRefresh?: () => void;
}

export function ExportPopup({
    isOpen,
    onClose,
    recordCount,
    selectedCount,
    onConfirm,
    theme,
    isLoading,
    onFormatChange,
    onRefresh // Destructure the new prop
}: ExportPopupProps) {
    const [exportAll, setExportAll] = useState(true); // Default to export all
    const [exportType, setExportType] = useState('Excel'); // Default to Excel

    const handleClose = () => {
        onClose();
        // Call refresh after a short delay to ensure popup is fully closed
        setTimeout(() => {
            if (onRefresh) {
                onRefresh();
            }
        }, 100);
    };

    // Reset state when popup opens/closes or selectedCount changes
    useEffect(() => {
        if (isOpen) {
            // If there are selected rows, default to exporting only selected
            // If no rows selected, default to exporting all
            setExportAll(selectedCount === 0);
        }
    }, [isOpen, selectedCount]);

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        onConfirm(exportType, exportAll); // Pass both exportType and exportAll
    };

    const handleExportTypeChange = (value: string) => {
        setExportType(value);
        if (onFormatChange) {
            onFormatChange(value as 'Excel' | 'CSV');
        }
    };

    const handleExportAllChange = (checked: boolean) => {
        setExportAll(checked);
    };

    // Determine which records will be exported
    const recordsToExport = exportAll ? recordCount : selectedCount;
    const exportDescription = exportAll
        ? `All ${recordCount} Record(s)`
        : `${selectedCount} Selected Record(s)`;

    return (
        // Backdrop
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={handleClose} 
        >
            {/* Popup Modal */}
            <div
                className={`rounded-lg shadow-xl p-6 w-full max-w-md relative transform transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Export</h2>
                    <button  onClick={handleClose}  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-5">
                    <div>
                        <label htmlFor="export-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Export Type
                        </label>
                        <select
                            id="export-type"
                            value={exportType}
                            onChange={(e) => handleExportTypeChange(e.target.value)}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        >
                            <option value="Excel">Excel</option>
                            <option value="CSV">CSV</option>
                        </select>
                    </div>

                    {/* Show selection options only if there are selected rows */}
                    {selectedCount > 0 && (
                        <div className="space-y-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center">
                                <input
                                    id="export-selected"
                                    type="radio"
                                    name="exportScope"
                                    checked={!exportAll}
                                    onChange={(e) => handleExportAllChange(false)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="export-selected" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Export {selectedCount} Selected Record(s)
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="export-all"
                                    type="radio"
                                    name="exportScope"
                                    checked={exportAll}
                                    onChange={(e) => handleExportAllChange(true)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="export-all" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Export All {recordCount} Record(s)
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Show simple checkbox if no rows are selected */}
                    {selectedCount === 0 && (
                        <div className="flex items-center">
                            <input
                                id="export-all-records"
                                type="checkbox"
                                checked={exportAll}
                                onChange={(e) => handleExportAllChange(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="export-all-records" className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                                Export All {recordCount} Record(s)
                            </label>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8">
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Exporting: <span className="font-semibold">{exportDescription}</span>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || recordsToExport === 0}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors duration-200 ease-in-out ${isLoading || recordsToExport === 0
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-700'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Downloading
                            </span>
                        ) : (
                            `Download ${recordsToExport} Record${recordsToExport !== 1 ? 's' : ''}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}