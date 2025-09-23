import  { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { showToast } from '../utils/toast';
import ContactDetails from './ContactDetails';

interface Contact {
    id: string;
    name: string;
    salutation?: string;
    first_name: string;
    last_name?: string;
    full_name: string;
    email?: string;
    phone?: string;
    gender?: string;
    company_name: string;
    status: string;
    position?: string;
    lastContact?: string;
    assignedTo?: string;
    middle_name?: string;
    user?: string;
    designation?: string;
    creation?: string;
    modified?: string;
}

interface ContactDetailViewProps {
    contact: Contact;
    onBack: () => void;
    onSave: (updatedContact: Contact) => void;
}

export function ContactDetailView({ contact, onBack, onSave }: ContactDetailViewProps) {
    const { theme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContact, setEditedContact] = useState<Contact>(contact);
    const [loading, setLoading] = useState(false);
    const [showingDealDetail, setShowingDealDetail] = useState(false);

    

    const handleSave = async () => {
        try {
            setLoading(true);

            const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${contact.id}`;

            const response = await fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'token 1b670b800ace83b:f32066fea74d0fe'
                },
                body: JSON.stringify({
                    first_name: editedContact.first_name,
                    middle_name: editedContact.middle_name,
                    last_name: editedContact.last_name,
                    salutation: editedContact.salutation,
                    designation: editedContact.designation,
                    gender: editedContact.gender,
                    company_name: editedContact.company_name,
                    status: editedContact.status
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            showToast('Contact updated successfully', { type: 'success' });
            onSave(editedContact);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating contact:', error);
            showToast('Failed to update contact', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            setLoading(true);

            const apiUrl = `http://103.214.132.20:8002/api/v2/document/Contact/${contact.id}`;

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'token 1b670b800ace83b:f32066fea74d0fe'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            showToast('Contact deleted successfully', { type: 'success' });
            onBack();
        } catch (error) {
            console.error('Error deleting contact:', error);
            showToast('Failed to delete contact', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof Contact, value: string) => {
        setEditedContact(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle when deal view state changes
    const handleDealViewChange = (showingDeal: boolean) => {
        setShowingDealDetail(showingDeal);
    };

    return (
        <div className={`min-h-screen ${theme === 'dark'
            ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
            : 'bg-gray-50'
            }`}>
            {/* Header - Only show when NOT showing deal detail */}
            {!showingDealDetail && (
                <div className={`border-b px-4 sm:px-6 py-4 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30'
                    : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                            </button>
                            <div>
                                <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {contact.name}
                                </h1>
                                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                    {contact.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pass the deal view change handler to ContactDetails */}
            <ContactDetails 
                contact={contact} 
                onBack={onBack} 
                onSave={onSave} 
                onDealViewChange={handleDealViewChange}
            />
        </div>
    );
}