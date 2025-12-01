import React, { useState, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { Loader2 } from 'lucide-react';

interface LinkedItem {
    reference_doctype: string;
    reference_docname: string;
    [key: string]: any;
}

interface LinkedItemsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    linkedItems: LinkedItem[];
    onUnlinkAll: () => void;
    isUnlinking: boolean;
    theme?: 'light' | 'dark';
    selectedIds: string[];
    onDeleteAfterUnlink: () => void;
}

export const LinkedItemsPopup: React.FC<LinkedItemsPopupProps> = ({
    isOpen,
    onClose,
    linkedItems,
    onUnlinkAll,
    isUnlinking,
    theme = 'dark',
    selectedIds,
    onDeleteAfterUnlink,
}) => {
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
    const [selectedItems, setSelectedItems] = useState<LinkedItem[]>([]);
    const [showDeleteLinkedConfirm, setShowDeleteLinkedConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedItems(linkedItems.map(item => ({ ...item, selected: true })));
        }
    }, [isOpen, linkedItems]);

    const handleItemSelection = (index: number) => {
        setSelectedItems(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, selected: !item.selected } : item
            )
        );
    };

    const handleSelectAll = () => {
        const allSelected = selectedItems.every(item => item.selected);
        setSelectedItems(prev =>
            prev.map(item => ({ ...item, selected: !allSelected }))
        );
    };

    const getSelectedCount = () => {
        return selectedItems.filter(item => item.selected).length;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Main Linked Items Popup */}
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <div
                    className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full max-w-2xl mx-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                        }`}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            Delete or unlink linked documents
                        </h3>
                        <button
                            type="button"
                            className={`rounded-md p-1 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                                } focus:outline-none`}
                            onClick={onClose}
                        >
                            <IoCloseOutline size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            Delete or unlink these linked documents before deleting this document
                        </p>

                        {/* Select All Checkbox */}
                        <div className="flex items-center mb-3">
                            <input
                                type="checkbox"
                                id="select-all"
                                checked={selectedItems.length > 0 && selectedItems.every(item => item.selected)}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                                htmlFor="select-all"
                                className={`ml-2 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}
                            >
                                Select all ({getSelectedCount()} of {linkedItems.length} selected)
                            </label>
                        </div>

                        {/* Linked Items List */}
                        <div className={`max-h-60 overflow-y-auto rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                            <ul className="divide-y divide-gray-700">
                                {linkedItems.map((item, index) => (
                                    <li key={index} className="px-4 py-3">
                                        <div className="flex items-start space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems[index]?.selected || false}
                                                onChange={() => handleItemSelection(index)}
                                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                        }`}>
                                                        {item.reference_doctype}
                                                    </span>
                                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>
                                                        {item.reference_docname}
                                                    </span>
                                                </div>
                                                {item.reference_doctype === 'CRM Notification' && (
                                                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>
                                                        William assigned a CRM Lead {selectedIds[0]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className={`flex justify-between items-center px-6 py-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                        }`}>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {getSelectedCount()} item(s) selected
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${theme === 'dark'
                                    ? 'border-gray-600 text-white hover:bg-gray-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Cancel
                            </button>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUnlinkConfirm(true)}
                                    disabled={getSelectedCount() === 0 || isUnlinking}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${theme === 'dark'
                                        ? 'border-purple-500 text-purple-400 hover:bg-purple-900/30'
                                        : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Unlink {getSelectedCount() > 0 ? getSelectedCount() : ''} item(s)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (getSelectedCount() === 0) {
                                            return;
                                        }
                                        setShowDeleteLinkedConfirm(true);
                                    }}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${theme === 'dark'
                                        ? 'border-red-500 text-red-400 hover:bg-red-900/30'
                                        : 'border-red-500 text-red-600 hover:bg-red-50'
                                        }`}
                                >
                                    Delete {getSelectedCount() > 0 ? getSelectedCount() : ''} item(s)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDeleteLinkedConfirm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                    <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full max-w-md mx-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                        }`}>
                        <div className="p-6">
                            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                Delete linked item
                            </h3>
                            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                Are you sure you want to delete all linked item(s)?
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteLinkedConfirm(false)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${theme === 'dark'
                                        ? 'border-gray-600 text-white hover:bg-gray-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setShowDeleteLinkedConfirm(false);
                                        // First unlink the items
                                        await onUnlinkAll();
                                        // Then call the parent to show the final delete confirmation
                                        onDeleteAfterUnlink();
                                    }}
                                    disabled={isUnlinking}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center ${theme === 'dark'
                                        ? 'border-red-500 bg-red-600 text-white hover:bg-red-700'
                                        : 'border-red-500 bg-red-600 text-white hover:bg-red-700'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isUnlinking ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete linked item'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Unlink Confirmation Popup */}
            {showUnlinkConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                    <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full max-w-md mx-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                        }`}>
                        <div className="p-6">
                            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                Unlink linked item
                            </h3>
                            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                Are you sure you want to unlink {getSelectedCount()} linked item(s)?
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowUnlinkConfirm(false)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${theme === 'dark'
                                        ? 'border-gray-600 text-white hover:bg-gray-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onUnlinkAll();
                                        setShowUnlinkConfirm(false);
                                    }}
                                    disabled={isUnlinking}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center ${theme === 'dark'
                                        ? 'border-purple-500 bg-purple-600 text-white hover:bg-purple-700'
                                        : 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isUnlinking ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Unlinking...
                                        </>
                                    ) : (
                                        `Unlink linked item`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};