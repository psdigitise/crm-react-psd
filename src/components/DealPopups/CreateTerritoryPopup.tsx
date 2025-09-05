import React, { useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { apiAxios, AUTH_TOKEN } from "../../api/apiUrl";
import { Listbox } from "@headlessui/react";

interface CreateTerritoryPopupProps {
    isOpen: boolean;
    onClose: () => void;
    theme?: "light" | "dark";
    cardBgColor?: string;
    borderColor?: string;
    textColor?: string;
    textSecondaryColor?: string;
    inputBgColor?: string;
}

interface TerritoryOption {
    value: string;
    description: string;
}

interface ManagerOption {
    value: string;
    description: string;
}
export const CreateTerritoryPopup: React.FC<CreateTerritoryPopupProps> = ({
    isOpen,
    onClose,
    theme = "dark",
    cardBgColor = "bg-white dark:bg-dark-secondary",
    borderColor = "border-gray-300 dark:border-gray-700",
    textColor = "text-white",
    textSecondaryColor = "text-gray-700 dark:text-white",
    inputBgColor = "bg-white-31 text-white",
}) => {
    const [formData, setFormData] = React.useState({
        name: "",
        manager: "",
        oldParent: "",
        parentCRM: "",
        isGroup: false,
        // isParentGroup: false,
    });

    const [territoryOptions, setTerritoryOptions] = useState<TerritoryOption[]>([]);
    const [territorySearch, setTerritorySearch] = useState("");
    const [isTerritoryLoading, setIsTerritoryLoading] = useState(false);
    const [managerOptions, setManagerOptions] = useState<ManagerOption[]>([]);
    const [isManagerLoading, setIsManagerLoading] = useState(false);
    const [oldParentOptions, setOldParentOptions] = useState<TerritoryOption[]>([]);
    const [oldParentSearch, setOldParentSearch] = useState("");
    const [isOldParentLoading, setIsOldParentLoading] = useState(false);
    const [error, setError] = useState("");


    // Fetch territories from API
    const fetchTerritories = async (searchTerm: string) => {
        setIsTerritoryLoading(true);
        try {
            const response = await apiAxios.post(
                "/api/method/frappe.desk.search.search_link",
                {
                    txt: searchTerm,
                    doctype: "CRM Territory",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: AUTH_TOKEN,
                    },
                }
            );
            setTerritoryOptions(response.data.message || []);
        } catch (error) {
            console.error("❌ Error fetching territories:", error);
            setTerritoryOptions([]);
        } finally {
            setIsTerritoryLoading(false);
        }
    };

    // Debounced search for territories
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (isOpen) {
                fetchTerritories(territorySearch);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [territorySearch, isOpen]);

    // Managers dropdown list
    const fetchManagers = async () => {
        setIsManagerLoading(true);
        try {
            const response = await apiAxios.post(
                "/api/method/frappe.desk.search.search_link",
                {
                    txt: "",
                    doctype: "User",
                    filters: { company: "PSDigitise" },
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: AUTH_TOKEN,
                    },
                }
            );
            setManagerOptions(response.data.message || []);
        } catch (error) {
            console.error("❌ Error fetching managers:", error);
            setManagerOptions([]);
        } finally {
            setIsManagerLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchManagers();
        }
    }, [isOpen]);


    //Old parents dropdownlist
    const fetchOldParents = async (searchTerm: string) => {
        setIsOldParentLoading(true);
        try {
            const response = await apiAxios.post(
                "/api/method/frappe.desk.search.search_link",
                {
                    txt: searchTerm,
                    doctype: "CRM Territory",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: AUTH_TOKEN,
                    },
                }
            );
            setOldParentOptions(response.data.message || []);
        } catch (error) {
            console.error("❌ Error fetching old parents:", error);
            setOldParentOptions([]);
        } finally {
            setIsOldParentLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (isOpen) {
                fetchOldParents(oldParentSearch);
            }
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [oldParentSearch, isOpen]);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "name" && error) {
            setError("");
        }
    };

    const handleSubmit = async () => {

        if (!formData.name.trim()) {
            setError("Territory Name is required");
            return;
        }
        setError("");

        try {
            const payload = {
                doc: {
                    doctype: "CRM Territory",
                    territory_name: formData.name,
                    territory_manager: formData.manager,
                    old_parent: formData.oldParent,
                    parent_crm_territory: formData.parentCRM,
                    is_group: formData.isGroup,
                    //   is_parent_group: formData.isParentGroup,
                },
            };

            const response = await apiAxios.post(
                "/api/method/frappe.client.insert",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: AUTH_TOKEN,
                    },
                }
            );

            console.log("✅ Territory Created:", response.data.message);
            onClose();
        } catch (error: any) {
            console.error("❌ Error creating territory:", error.response?.data || error);
        }
    };

    if (!isOpen) return null;

    const labelClass = `block text-sm font-medium ${textSecondaryColor} mb-1`;
    const inputClass = `w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor} text-white`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                className={`w-full max-w-2xl ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                >
                    <IoCloseOutline size={24} />
                </button>

                {/* Header */}
                <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
                    New Territory
                </h3>

                {/* Form */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Territory Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className={inputClass}
                                placeholder="Territory Name"
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Territory Manager</label>
                            <select
                                value={formData.manager}
                                onChange={(e) => handleChange("manager", e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Select Manager</option>
                                {isManagerLoading ? (
                                    <option>Loading...</option>
                                ) : (
                                    managerOptions.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.description}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div>
                            <label className={labelClass}>Old Parent</label>
                            <Listbox
                                value={formData.oldParent || ""}
                                onChange={(value) => handleChange("oldParent", value)}
                            >
                                {({ open, close }) => (
                                    <div className="relative mt-1">
                                        {/* Button */}
                                        <Listbox.Button
                                            className={`relative w-full cursor-default rounded-md border ${borderColor} py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                                        >
                                            <span className="block truncate">
                                                {formData.oldParent || "Select or search old parent"}
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <svg
                                                    className="h-5 w-5 text-gray-400"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 3a1 1 0 01.707.293l3 
                    3a1 1 0 01-1.414 1.414L10 
                    5.414 7.707 7.707a1 1 
                    0 01-1.414-1.414l3-3A1 
                      1 0 0110 3zm-3.707 
                    9.293a1 1 0 011.414 
                    0L10 14.586l2.293-2.293a1 
                    1 0 011.414 1.414l-3 
                    3a1 1 0 01-1.414 
                    0l-3-3a1 1 0 
                    0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </span>
                                        </Listbox.Button>

                                        {/* Options */}
                                        <Listbox.Options
                                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md 
                     bg-white text-gray-900 py-1 text-base shadow-lg ring-1 ring-black 
                     ring-opacity-5 focus:outline-none sm:text-sm dark:bg-white dark:text-gray-900"
                                        >
                                            {/* Search Input */}
                                            <div className="sticky top-0 z-10 bg-white p-2 border-b">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search old parent..."
                                                        className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        onChange={(e) => setOldParentSearch(e.target.value)}
                                                        value={oldParentSearch}
                                                    />
                                                    {/* Search Icon */}
                                                    <svg
                                                        className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M21 21l-6-6m2-5a7 7 
                      0 11-14 0 7 7 0 0114 0z"
                                                        ></path>
                                                    </svg>
                                                    {/* Clear Button */}
                                                    <button
                                                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                                        onClick={() => setOldParentSearch("")}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Options */}
                                            {isOldParentLoading ? (
                                                <div className="py-2 px-4 text-gray-500">Loading...</div>
                                            ) : oldParentOptions.length > 0 ? (
                                                oldParentOptions.map((op) => (
                                                    <Listbox.Option
                                                        key={op.value}
                                                        value={op.value}
                                                        className={({ active }) =>
                                                            `relative cursor-default select-none border-b py-2 pl-3 pr-9 ${active
                                                                ? theme === "dark"
                                                                    ? "bg-blue-100 text-black"
                                                                    : "bg-blue-100 text-blue-900"
                                                                : theme === "dark"
                                                                    ? "text-black"
                                                                    : "text-gray-900"
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <span
                                                                className={`block truncate ${selected ? "font-medium" : "font-normal"
                                                                    }`}
                                                            >
                                                                {op.value}
                                                            </span>
                                                        )}
                                                    </Listbox.Option>
                                                ))
                                            ) : (
                                                <div className="py-2 px-4 text-gray-500">No old parents found</div>
                                            )}

                                            {/* Clear Option */}
                                            <div className="sticky bottom-0 bg-white border-t">
                                                <button
                                                    type="button"
                                                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleChange("oldParent", "");
                                                        setOldParentSearch("");
                                                        close();
                                                    }}
                                                >
                                                    ✕ Clear
                                                </button>
                                            </div>
                                        </Listbox.Options>
                                    </div>
                                )}
                            </Listbox>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.isGroup}
                                onChange={(e) => handleChange("isGroup", e.target.checked)}
                            />
                            <label className={textSecondaryColor}>Is Group</label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div>
                            <label className={labelClass}>Parent CRM Territory</label>
                            <Listbox
                                value={formData.parentCRM || ""}
                                onChange={(value) => handleChange("parentCRM", value)}
                            >
                                {({ open, close }) => (
                                    <div className="relative mt-1">
                                        {/* Button */}
                                        <Listbox.Button
                                            className={`relative w-full cursor-default rounded-md border ${borderColor} py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                                        >
                                            <span className="block truncate">
                                                {formData.parentCRM || "Select or search territory"}
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <svg
                                                    className="h-5 w-5 text-gray-400"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 3a1 1 0 01.707.293l3 
                                3a1 1 0 01-1.414 1.414L10 
                                5.414 7.707 7.707a1 1 
                                0 01-1.414-1.414l3-3A1 
                                  1 0 0110 3zm-3.707 
                                9.293a1 1 0 011.414 
                                0L10 14.586l2.293-2.293a1 
                                1 0 011.414 1.414l-3 
                                3a1 1 0 01-1.414 
                                0l-3-3a1 1 0 
                                0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </span>
                                        </Listbox.Button>

                                        {/* Options */}
                                        <Listbox.Options
                                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md 
                               bg-white text-gray-900 py-1 text-base shadow-lg ring-1 ring-black 
                               ring-opacity-5 focus:outline-none sm:text-sm dark:bg-white dark:text-gray-900"
                                        >
                                            {/* Search Input */}
                                            <div className="sticky top-0 z-10 bg-white p-2 border-b">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search territory..."
                                                        className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        onChange={(e) => setTerritorySearch(e.target.value)}
                                                        value={territorySearch}
                                                    />
                                                    {/* Search Icon */}
                                                    <svg
                                                        className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M21 21l-6-6m2-5a7 7 
                              0 11-14 0 7 7 0 0114 0z"
                                                        ></path>
                                                    </svg>
                                                    {/* Clear Button */}
                                                    <button
                                                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                                        onClick={() => setTerritorySearch("")}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Territory Options */}
                                            {isTerritoryLoading ? (
                                                <div className="py-2 px-4 text-gray-500">Loading...</div>
                                            ) : territoryOptions.length > 0 ? (
                                                territoryOptions.map((t) => (
                                                    <Listbox.Option
                                                        key={t.value}
                                                        value={t.value}
                                                        className={({ active }) =>
                                                            `relative cursor-default select-none border-b py-2 pl-3 pr-9 ${active
                                                                ? theme === "dark"
                                                                    ? "bg-blue-100 text-black"
                                                                    : "bg-blue-100 text-blue-900"
                                                                : theme === "dark"
                                                                    ? "text-black"
                                                                    : "text-gray-900"
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <span
                                                                className={`block truncate ${selected ? "font-medium" : "font-normal"
                                                                    }`}
                                                            >
                                                                {t.value}
                                                            </span>
                                                        )}
                                                    </Listbox.Option>
                                                ))
                                            ) : (
                                                <div className="py-2 px-4 text-gray-500">No territories found</div>
                                            )}

                                            {/* Clear Option */}
                                            <div className="sticky bottom-0 bg-white border-t">
                                                <button
                                                    type="button"
                                                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleChange("parentCRM", "");
                                                        setTerritorySearch("");
                                                        close();
                                                    }}
                                                >
                                                    ✕ Clear
                                                </button>
                                            </div>
                                        </Listbox.Options>
                                    </div>
                                )}
                            </Listbox>
                        </div>
                        {/* <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isParentGroup}
                onChange={(e) =>
                  handleChange("isParentGroup", e.target.checked)
                }
              />
              <label className={textSecondaryColor}>Is Group</label>
            </div> */}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-start mt-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={`px-4 py-2 rounded-lg text-white transition-colors ${theme === "dark"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};