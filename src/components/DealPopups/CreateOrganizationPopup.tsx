import React, { useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { apiAxios, AUTH_TOKEN } from "../../api/apiUrl";
import { Listbox } from "@headlessui/react";
import { getUserSession } from "../../utils/session";
import { showToast } from "../../utils/toast";

interface AddressOption {
    value: string;
    description: string;
}

interface CreateOrganizationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    theme?: "light" | "dark";
    cardBgColor?: string;
    borderColor?: string;
    textColor?: string;
    textSecondaryColor?: string;
    inputBgColor?: string;
    onOrganizationCreated?: () => void;
}

export const CreateOrganizationPopup: React.FC<CreateOrganizationPopupProps> = ({
    isOpen,
    onClose,
    theme = "dark",
    cardBgColor = "bg-white dark:bg-dark-secondary",
    borderColor = "border-gray-300 dark:border-gray-700",
    textColor = "text-white",
    textSecondaryColor = "text-gray-700 dark:text-white",
    inputBgColor = "bg-white-31 text-white",
    onOrganizationCreated,
}) => {
    const [formData, setFormData] = React.useState({
        name: "",
        website: "",
        revenue: "₹ 0.00",
        territory: "",
        employees: "",
        industry: "",
        address: "",
    });
    const [addressOptions, setAddressOptions] = useState<AddressOption[]>([]);
    const [addressSearch, setAddressSearch] = useState("");
    const [isAddressLoading, setIsAddressLoading] = useState(false);
    const [territoryOptions, setTerritoryOptions] = useState<AddressOption[]>([]);
    const [territorySearch, setTerritorySearch] = useState("");
    const [isTerritoryLoading, setIsTerritoryLoading] = useState(false);
    const [industryOptions, setIndustryOptions] = useState<AddressOption[]>([]);
    const [industrySearch, setIndustrySearch] = useState("");
    const [isIndustryLoading, setIsIndustryLoading] = useState(false);


    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleClose = () => {
        // Clear all form fields
        setFormData({
            name: "",
            website: "",
            revenue: "₹ 0.00",
            territory: "",
            employees: "",
            industry: "",
            address: "",
        });

        // Clear search fields
        setAddressSearch("");
        setTerritorySearch("");
        setIndustrySearch("");

        // Call the original onClose
        onClose();
    };

    // Address dropdown
    const fetchAddresses = async (searchTerm: string) => {
        setIsAddressLoading(true);
        try {
            const session = getUserSession();
            const sessionCompany = session?.company || '';

            const response = await apiAxios.post(
                "/api/method/frappe.desk.search.search_link",
                {
                    txt: searchTerm,
                    doctype: "Address",
                    filters: {
                        company: sessionCompany,
                    }
                    // company: sessionCompany,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: AUTH_TOKEN,
                    },
                }
            );
            setAddressOptions(response.data.message || []);
        } catch (error) {
            console.error("❌ Error fetching addresses:", error);
            setAddressOptions([]); // Reset on error
        } finally {
            setIsAddressLoading(false);
        }
    };

    // --- NEW: useEffect to fetch addresses with debouncing ---
    useEffect(() => {
        // Use a timer to delay the API call, reducing requests while typing
        const debounceTimer = setTimeout(() => {
            // Only fetch if the popup is open
            if (isOpen) {
                fetchAddresses(addressSearch);
            }
        }, 500); // 500ms delay
        // Cleanup function to clear the timer if the component unmounts or search term changes
        return () => clearTimeout(debounceTimer);
    }, [addressSearch, isOpen]);

    //Territory dropdown
    const fetchTerritories = async (searchTerm: string) => {
        setIsTerritoryLoading(true);
        try {
            // const session = getUserSession();
            // const sessionCompany = session?.company || '';
            const response = await apiAxios.post(
                "/api/method/frappe.desk.search.search_link",
                {
                    txt: searchTerm,
                    doctype: "CRM Territory",
                    // "filters": {
                    //     "company": sessionCompany,
                    // }
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

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (isOpen) {
                fetchTerritories(territorySearch);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [territorySearch, isOpen]);

    //Industry dropdown list
    const fetchIndustries = async (searchTerm: string) => {
        setIsIndustryLoading(true);
        try {
            const response = await apiAxios.post(
                "/api/method/frappe.desk.search.search_link",
                {
                    txt: searchTerm,
                    doctype: "CRM Industry",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: AUTH_TOKEN,
                    },
                }
            );
            setIndustryOptions(response.data.message || []);
        } catch (error) {
            console.error("❌ Error fetching industries:", error);
            setIndustryOptions([]);
        } finally {
            setIsIndustryLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (isOpen) {
                fetchIndustries(industrySearch);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [industrySearch, isOpen]);

    const showToast = ({ title, message, type = 'info', duration = 3000 }) => {
        // Create a simple toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        transition: opacity 0.3s;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, duration);
    };



    const handleSubmit = async () => {
        try {
            const session = getUserSession();
            const sessionCompany = session?.company || '';
            const payload = {
                doc: {
                    doctype: "CRM Organization",
                    no_of_employees: formData.employees,
                    organization_name: formData.name,
                    territory: formData.territory,
                    // "filters": {
                    //     "company": sessionCompany
                    // },
                    company: sessionCompany,
                    industry: formData.industry,
                    annual_revenue: parseFloat(
                        formData.revenue.toString().replace(/[^\d.-]/g, "")
                    ) || 0,
                    website: formData.website,
                    address: formData.address,
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

            console.log("✅ Created organization:", response.data);

            // Show success toast message
            showToast({
                title: "Success",
                message: "Organization created successfully!",
                type: "success",
                duration: 3000
            });

            // 1. Clear all form fields
            setFormData({
                name: "",
                website: "",
                revenue: "₹ 0.00",
                territory: "",
                employees: "",
                industry: "",
                address: "",
            });

            // 2. Clear search fields
            setAddressSearch("");
            setTerritorySearch("");
            setIndustrySearch("");

            if (onOrganizationCreated) {
                onOrganizationCreated();
            }
            // Close popup after success
            onClose();
        } catch (error: any) {
            console.error("❌ Error creating organization:", error);

            // Extract error message from _server_messages
            let errorMessage = "Failed to create organization";

            try {
                // Check if the error response has _server_messages
                if (error.response?.data?._server_messages) {
                    // Parse the _server_messages array (it's a stringified JSON array)
                    const serverMessages = JSON.parse(error.response.data._server_messages);

                    if (serverMessages.length > 0) {
                        // Parse the first message (which is also a stringified JSON object)
                        const firstMessage = JSON.parse(serverMessages[0]);

                        // Remove HTML tags from the message
                        errorMessage = firstMessage.message
                            ? firstMessage.message.replace(/<[^>]*>/g, '')
                            : errorMessage;

                        // You can also use the title if you want
                        const errorTitle = firstMessage.title || "Error";

                        showToast({
                            title: errorTitle,
                            message: errorMessage,
                            type: "error",
                            duration: 5000
                        });
                        return; // Return early since we've shown the error
                    }
                }

                // Fallback to regular error message extraction
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

            } catch (parseError) {
                console.error("Error parsing server messages:", parseError);
                // If parsing fails, use the original error message
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }


            // Show error toast message
            showToast({
                title: "Error",
                message: error.response?.data?.message || "Failed to create organization",
                type: "error",
                duration: 5000
            });
        }
    };


    if (!isOpen) return null;


    const labelClass = `block text-sm font-medium ${textSecondaryColor} mb-1`;
    const inputClass = `w-full px-3 py-2 border text-white ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputBgColor}}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                className={`w-full max-w-2xl ${cardBgColor} rounded-lg shadow-lg p-6 relative border ${borderColor}`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                >
                    <IoCloseOutline size={24} />
                </button>

                {/* Header */}
                <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
                    New Organization
                </h3>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="orgName" className={labelClass}>
                            Organization Name
                        </label>
                        <input
                            id="orgName"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className={inputClass}
                            placeholder="Enter organization name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="orgWebsite" className={labelClass}>
                                Website
                            </label>
                            <input
                                id="orgWebsite"
                                type="text"
                                value={formData.website}
                                onChange={(e) => handleChange("website", e.target.value)}
                                className={inputClass}
                                placeholder="https://example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="orgRevenue" className={labelClass}>
                                Annual Revenue
                            </label>
                            <input
                                id="orgRevenue"
                                type="text"
                                value={formData.revenue}
                                onChange={(e) => handleChange("revenue", e.target.value)}
                                className={inputClass}
                                placeholder="Annual Revenue"
                            />
                        </div>
                    </div>


                    <div>
                        <label className={labelClass}>Territory</label>
                        <Listbox
                            value={formData.territory || ""}
                            onChange={(value) => handleChange("territory", value)}
                        >
                            {({ open, close }) => (
                                <div className="relative mt-1">
                                    {/* Button */}
                                    <Listbox.Button
                                        className={`relative w-full cursor-default rounded-md border ${borderColor} py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                                    >
                                        <span className="block truncate">
                                            {formData.territory || "Select or search territory"}
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
                                                       010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    </Listbox.Button>

                                    {/* Options */}
                                    <Listbox.Options
                                        className="absolute z-10 mb-1 max-h-60 w-full overflow-auto rounded-md 
                               bg-white  text-gray-900 py-1 text-base shadow-lg ring-1 ring-black 
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

                                        {/* Create New */}
                                        <div className="sticky bottom-0 bg-white border-t">
                                            <button
                                                type="button"
                                                className="flex items-center w-full px-3 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                                onClick={() => {
                                                    console.log("Create New Territory");
                                                    // You can open a "Create Territory" modal here
                                                    // close();
                                                }}
                                            >
                                                + Create New
                                            </button>
                                        </div>

                                        {/* Clear */}
                                        <div className="sticky bottom-0 bg-white border-t">
                                            <button
                                                type="button"
                                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                onClick={() => {
                                                    handleChange("territory", "");
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


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="orgEmployees" className={labelClass}>
                                No. of Employees
                            </label>
                            <select
                                id="orgEmployees"
                                value={formData.employees}
                                onChange={(e) => handleChange("employees", e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Select employee count</option>
                                <option value="1-10">1 - 10</option>
                                <option value="11-50">11 - 50</option>
                                <option value="51-200">51 - 200</option>
                                <option value="201-500">201 - 500</option>
                                <option value="501-1000">501 - 1000</option>
                                <option value="1000+">1000+</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="orgIndustry" className={labelClass}>
                                Industry
                            </label>
                            <Listbox
                                value={formData.industry || ""}
                                onChange={(value) => handleChange("industry", value)}
                            >
                                {({ open, close }) => (
                                    <div className="relative mt-1">
                                        <Listbox.Button
                                            className={`relative w-full cursor-default rounded-md border ${borderColor} py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                                        >
                                            <span className="block truncate">
                                                {formData.industry || "Select or search industry"}
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
                                                       010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </span>
                                        </Listbox.Button>

                                        <Listbox.Options
                                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md 
                bg-white text-gray-900 py-1 text-base shadow-lg ring-1 ring-black 
                ring-opacity-5 focus:outline-none sm:text-sm dark:bg-white dark:text-gray-900"
                                        >
                                            {/* Search Box */}
                                            <div className="sticky top-0 z-10 bg-white p-2 border-b">
                                                <input
                                                    type="text"
                                                    placeholder="Search industry..."
                                                    className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    onChange={(e) => setIndustrySearch(e.target.value)}
                                                    value={industrySearch}
                                                />
                                                <svg
                                                    className="absolute left-4 top-5 h-4 w-4 text-gray-400"
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
                                                    className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setIndustrySearch("")}
                                                >
                                                    ×
                                                </button>
                                            </div>


                                            {/* Options */}
                                            {isIndustryLoading ? (
                                                <div className="py-2 px-4 text-gray-500">Loading...</div>
                                            ) : industryOptions.length > 0 ? (
                                                industryOptions.map((i) => (
                                                    <Listbox.Option
                                                        key={i.value}
                                                        value={i.value}
                                                        className={({ active }) =>
                                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${active
                                                                ? "bg-blue-100 text-blue-900"
                                                                : "text-gray-900"}`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                                {i.value}
                                                            </span>
                                                        )}
                                                    </Listbox.Option>
                                                ))
                                            ) : (
                                                <div className="py-2 px-4 text-gray-500">No industries found</div>
                                            )}
                                            {/* <div className="sticky bottom-0 bg-white  border-t">
                                                <button
                                                    type="button"
                                                    className="flex items-center w-full px-3 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                                    onClick={() => {
                                                        // You can open a "Create Address" modal here
                                                        console.log("Create New Address");
                                                        //close();
                                                    }}
                                                >
                                                    + Create New
                                                </button>
                                            </div> */}

                                            {/* Clear */}
                                            {/* <div className="sticky bottom-0 bg-white border-t">
                                                <button
                                                    type="button"
                                                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleChange("industry", "");
                                                        setIndustrySearch("");
                                                        close();
                                                    }}
                                                >
                                                    ✕ Clear
                                                </button>
                                            </div> */}
                                        </Listbox.Options>
                                    </div>
                                )}
                            </Listbox>

                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${textSecondaryColor}`}>
                            Address
                        </label>
                        <Listbox
                            value={formData.address || ""}
                            onChange={(value) => handleChange("address", value)}
                        >
                            {({ open, close }) => (
                                <div className="relative mt-1">
                                    {/* Button */}
                                    <Listbox.Button
                                        className={`relative w-full cursor-default rounded-md border ${borderColor} py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${inputBgColor}`}
                                    >
                                        <span className="block truncate">
                                            {formData.address || "Select or search address"}
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
                                                             010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    </Listbox.Button>

                                    {/* Options */}
                                    <Listbox.Options
                                        className="absolute z-10 bottom-full mb-1 max-h-60 w-full overflow-auto 
               rounded-md bg-white text-gray-900 py-1 text-base shadow-lg 
               ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm 
               dark:bg-white dark:text-gray-900"
                                    >

                                        {/* Search Input */}
                                        <div className="sticky top-0 z-10 bg-white  p-2 border-b">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search address..."
                                                    className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    onChange={(e) => setAddressSearch(e.target.value)}
                                                    value={addressSearch}
                                                />
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
                                                <button
                                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setAddressSearch("")}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>

                                        {/* Address Options */}
                                        {isAddressLoading ? (
                                            <div className="py-2 px-4 text-gray-500">Loading...</div>
                                        ) : addressOptions.length > 0 ? (
                                            addressOptions
                                                .filter((a) =>
                                                    a.value.toLowerCase().includes(addressSearch.toLowerCase())
                                                )
                                                .map((a) => (
                                                    <Listbox.Option
                                                        key={a.value}
                                                        value={a.value}
                                                        className={({ active }) =>
                                                            `relative cursor-default select-none border-b py-2 pl-3 pr-9 
                                                             ${active
                                                                ? (theme === "dark"
                                                                    ? "bg-blue-100 text-black"
                                                                    : "bg-blue-100 text-blue-900")
                                                                : (theme === "dark"
                                                                    ? "text-black"
                                                                    : "text-gray-900")}
`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span
                                                                    className={`block truncate ${selected ? "font-medium" : "font-normal"
                                                                        }`}
                                                                >
                                                                    {a.value}
                                                                </span>
                                                                <span className="block text-xs opacity-70">
                                                                    {a.description}
                                                                </span>
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))
                                        ) : (
                                            <div className="py-2 px-4 text-gray-500">No addresses found</div>
                                        )}

                                        {/* Create New */}
                                        <div className="sticky bottom-0 bg-white  border-t">
                                            <button
                                                type="button"
                                                className="flex items-center w-full px-3 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                                onClick={() => {
                                                    // You can open a "Create Address" modal here
                                                    console.log("Create New Address");
                                                    //close();
                                                }}
                                            >
                                                + Create New
                                            </button>
                                        </div>

                                        {/* Clear */}
                                        <div className="sticky bottom-0 bg-white border-t">
                                            <button
                                                type="button"
                                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                onClick={() => {
                                                    handleChange("address", "");
                                                    setAddressSearch("");
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

                </div>

                {/* Footer */}
                <div className="flex justify-end mt-6">
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
