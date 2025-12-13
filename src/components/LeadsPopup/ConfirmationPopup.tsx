// src/components/ConfirmationPopup.js

import React from 'react';
import { useTheme } from '../../components/ThemeProvider'; // Adjust path if necessary
import { Loader2, X } from 'lucide-react';

interface ConfirmationPopupProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  CancelText?: string;
  isLoading?: boolean;
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  show,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Generate",
  CancelText = "Cancel",
  isLoading = false,
}) => {
  const { theme } = useTheme();

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 w-screen h-screen">

      <div
        className={`relative w-full max-w-md rounded-lg p-6 shadow-xl border ${theme === 'dark'
            ? 'bg-dark-secondary border-gray-700'
            : 'bg-white border-gray-200'
          }`}
      >
         <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {message}
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium ${theme === 'dark'
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } disabled:opacity-50`}
          >
            {CancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white ${theme === 'dark'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-purplebg hover:bg-purple-700 text-white'
              } disabled:opacity-50`}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Generating...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};