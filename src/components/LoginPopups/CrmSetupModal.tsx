import React, { useState } from 'react';
import { getUserSession } from '../../utils/session';
import { AUTH_TOKEN } from '../../api/apiUrl';

interface CrmSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CrmSetupModal({ isOpen, onClose }: CrmSetupModalProps) {
    const [companyName, setCompanyName] = useState('');
    const [employeeCount, setEmployeeCount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const userSession = getUserSession();
    const userEmail = userSession?.email || "Administrator";
    const userName = userSession?.full_name || "";
    // const userPhone = userSession?.phone || "";

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const companyPayload = {
            company_name: companyName,
            email_id: userEmail,
            no_employees: employeeCount,
        };

        const userPayload = {
            doc: {
                docstatus: 0,
                doctype: "User",
                __islocal: 1,
                __unsaved: 1,
                owner: "Administrator",
                enabled: 1,
                language: "en",
                send_welcome_email: 1,
                unsubscribed: 0,
                mute_sounds: 0,
                desk_theme: "Light",
                search_bar: 1,
                notifications: 1,
                list_sidebar: 1,
                bulk_actions: 1,
                view_switcher: 1,
                form_sidebar: 1,
                timeline: 1,
                dashboard: 1,
                logout_all_sessions: 1,
                document_follow_notify: 0,
                document_follow_frequency: "Daily",
                follow_created_documents: 0,
                follow_commented_documents: 0,
                follow_liked_documents: 0,
                follow_assigned_documents: 0,
                follow_shared_documents: 0,
                thread_notify: 1,
                send_me_a_copy: 0,
                allowed_in_mentions: 1,
                user_emails: [],
                defaults: [],
                simultaneous_sessions: 2,
                user_type: "System User",
                bypass_restrict_ip_check_if_2fa_enabled: 0,
                social_logins: [],
                onboarding_status: "{}",
                __run_link_triggers: 1,
                email: userEmail,
                first_name: userName,
                role_profile_name: "Only If Create",
                company: companyName,
            },
        };

        // 🔹 Fire both requests simultaneously
        const [companyResponse, userSaveResponse] = await Promise.all([
            fetch("https://api.erpnext.ai/api/v2/document/Company/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: AUTH_TOKEN,
                },
                body: JSON.stringify(companyPayload),
            }),
            fetch("https://api.erpnext.ai/api/method/frappe.client.save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: AUTH_TOKEN,
                },
                body: JSON.stringify(userPayload),
            }),
        ]);

        if (!companyResponse.ok) {
            throw new Error(`Company API error! status: ${companyResponse.status}`);
        }
        if (!userSaveResponse.ok) {
            throw new Error(`User save API error! status: ${userSaveResponse.status}`);
        }

        const companyData = await companyResponse.json();
        const userSaveData = await userSaveResponse.json();

        console.log("Company API Response:", companyData);
        console.log("User Save API Response:", userSaveData);

        onClose();
    } catch (error) {
        console.error("Error in CRM setup process:", error);
    } finally {
        setIsLoading(false);
    }
};



    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            <div className="bg-gradient-to-br from-black via-[#2A2352] to-black backdrop-blur-md rounded-lg shadow-xl p-8 w-full max-w-md m-4">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">CRM Setup</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-white">
                            Company Name
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                            placeholder="Your Company Inc."
                        />
                    </div>
                    <div>
                        <label htmlFor="employeeCount" className="block text-sm font-medium text-white">
                            Employee Count
                        </label>
                        <input
                            type="number"
                            id="employeeCount"
                            value={employeeCount}
                            onChange={(e) => setEmployeeCount(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                            placeholder="e.g., 50"
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Setting up CRM...' : 'Complete Setup'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}