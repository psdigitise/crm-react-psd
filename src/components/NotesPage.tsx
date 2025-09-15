import React, { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { showToast } from '../utils/toast';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { DealDetailView } from './DealDetailView';
import { LeadDetailView } from './LeadDetailView';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  name: string;
  owner: string;
  title: string;
  content: string;
  reference_doctype?: string;
  reference_docname?: string;
  creation?: string;
  modified?: string;
}

interface Deal {
  name: string;
  organization: string;
  currency: string;
  annual_revenue: number;
  status: string;
  email: string;
  mobile_no: string;
  deal_owner: string;
  modified: string;
  id: string;
  mobileNo: string;
  assignedTo: string;
  lastModified: string;
  annualRevenue: string;
  organization_name?: string;
  website?: string;
  no_of_employees?: string;
  territory?: string;
  industry?: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  close_date?: string;
  probability?: string;
  next_step?: string;
}

interface Lead {
  id: string;
  name: string;
  firstName: string;
  lastName?: string;
  organization: string;
  status: string;
  email: string;
  mobile: string;
  assignedTo: string;
  lastModified: string;
  website?: string;
  territory?: string;
  industry?: string;
  jobTitle?: string;
  source?: string;
  salutation?: string;
  leadId: string;
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  docstatus?: number;
  idx?: number;
  mobile_no?: string;
  naming_series?: string;
  lead_name?: string;
  gender?: string;
  no_of_employees?: string;
  annual_revenue?: number;
  image?: string;
  first_name?: string;
  last_name?: string;
  lead_owner?: string;
  converted?: string;
}

interface NotesPageProps {
  onCreateNote: () => void;
  leadName?: string;
}

interface EditModalProps {
  show: boolean;
  theme: string;
  editForm: { title: string; content: string };
  setEditForm: React.Dispatch<React.SetStateAction<{ title: string; content: string }>>;
  onUpdate: () => void;
  onClose: () => void;
  editingNote: Note | null;
  onOpenRecord: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ show, theme, editForm, setEditForm, onUpdate, onClose, editingNote, onOpenRecord }) => {
  if (!show) return null;

  const getOpenButtonText = () => {
    if (editingNote?.reference_doctype === 'CRM Deal') return 'Open Deal';
    if (editingNote?.reference_doctype === 'CRM Lead') return 'Open Lead';
    return null;
  };

  const showOpenButton = editingNote?.reference_doctype &&
    editingNote?.reference_docname &&
    (editingNote.reference_doctype === 'CRM Deal' || editingNote.reference_doctype === 'CRM Lead');

  const handleOpenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Open button clicked, editingNote:', editingNote);
    onOpenRecord();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
          <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Note</h3>
              <div className="flex items-center space-x-2">
                {showOpenButton && (
                  <button
                    type="button"
                    onClick={handleOpenClick}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border ${theme === 'dark'
                      ? 'border-purple-500/30 bg-dark-accent text-white hover:bg-purple-800/50'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    {getOpenButtonText()}
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className={`text-gray-400 hover:text-gray-600 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : ''}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'border-gray-300 bg-gray-50'
                    }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Content</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'border-gray-300 bg-gray-50'
                    }`}
                />
              </div>
            </div>
          </div>
          <div className={`px-4 py-3 sm:px-6 ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
            <button
              type="button"
              onClick={onUpdate}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function NotesPage({ onCreateNote, leadName }: NotesPageProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [formData, setFormData] = useState<Note | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  // Add state for deal and lead navigation
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dealLoading, setDealLoading] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  // Add state for dropdown menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [leadName]);

  const fetchNotes = async () => {
    try {
      setLoading(true);

      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!session) {
        setNotes([]);
        setLoading(false);
        return;
      }

      let filters: any = {};
      if (leadName) {
        filters.reference_docname = leadName;
      }

      if (sessionCompany) {
        filters.company = sessionCompany;
      }

      const payload = {
        doctype: "FCRM Note",
        filters: filters,
        order_by: "modified desc",
        default_filters: {},
        column_field: "status",
        columns: "",
        kanban_columns: "",
        kanban_fields: "",
        page_length: 1000,
        page_length_count: 1000,
        rows: "",
        title_field: "",
        view: {
          custom_view_name: "",
          view_type: "list",
          group_by_field: "owner"
        }
      };

      const apiUrl = `http://103.214.132.20:8002/api/method/crm.api.doc.get_data`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const notesData = result.message?.data || result.data || [];

      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching notes:', error);
      showToast('Failed to fetch notes', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setEditForm({ title: note.title, content: note.content });
    setShowEditModal(true);
  };

  const handleNoteClick = (note: Note, event?: React.MouseEvent) => {
    // Don't open edit modal if clicking on dropdown or its children
    if (event && (event.target as HTMLElement).closest('.dropdown-menu')) {
      return;
    }
    handleEdit(note);
  };

  const toggleDropdown = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === noteId ? null : noteId);
  };

  function formatRelativeDate(dateStr?: string | null) {
    if (!dateStr) return '';
    // Just parse directly
    const parsed = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(parsed.getTime())) return '';
    return formatDistanceToNow(parsed, { addSuffix: true });
  }


  const handleDeleteClick = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    handleDelete(noteId);
    setOpenDropdown(null);
  };

  // Function to fetch deal details
  const fetchDealDetails = async (dealName: string): Promise<Deal | null> => {
    try {
      setDealLoading(true);

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return null;
      }

      const response = await fetch(`http://103.214.132.20:8002/api/method/frappe.client.get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
        },
        body: JSON.stringify({
          doctype: "CRM Deal",
          name: dealName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const dealData = data.message;

      if (!dealData) {
        throw new Error('Deal data not found');
      }

      const transformedDeal: Deal = {
        name: dealData.name,
        id: dealData.name,
        organization: dealData.organization || '',
        currency: dealData.currency || '',
        annual_revenue: dealData.annual_revenue || 0,
        status: dealData.status || '',
        email: dealData.email || '',
        mobile_no: dealData.mobile_no || '',
        mobileNo: dealData.mobile_no || '',
        deal_owner: dealData.deal_owner || '',
        assignedTo: dealData.deal_owner || '',
        modified: dealData.modified || '',
        lastModified: dealData.modified || '',
        annualRevenue: dealData.annual_revenue?.toString() || '0',
        organization_name: dealData.organization_name,
        website: dealData.website,
        no_of_employees: dealData.no_of_employees,
        territory: dealData.territory,
        industry: dealData.industry,
        salutation: dealData.salutation,
        first_name: dealData.first_name,
        last_name: dealData.last_name,
        gender: dealData.gender,
        close_date: dealData.close_date,
        probability: dealData.probability,
        next_step: dealData.next_step
      };

      return transformedDeal;
    } catch (error) {
      console.error('Error fetching deal details:', error);
      showToast('Failed to fetch deal details', { type: 'error' });
      return null;
    } finally {
      setDealLoading(false);
    }
  };

  // Function to fetch lead details
  const fetchLeadDetails = async (leadName: string): Promise<Lead | null> => {
    try {
      setLeadLoading(true);
      console.log('Fetching lead details for:', leadName); // Debug log

      const session = getUserSession();
      if (!session) {
        showToast('Session not found', { type: 'error' });
        return null;
      }

      const response = await fetch(`http://103.214.132.20:8002/api/method/frappe.client.get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
        },
        body: JSON.stringify({
          doctype: "CRM Lead",
          name: leadName
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lead fetch error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Lead API response:', data); // Debug log

      const leadData = data.message;

      if (!leadData) {
        console.error('Lead data is null or undefined');
        throw new Error('Lead data not found');
      }

      console.log('Lead data received:', leadData); // Debug log

      // Transform the lead data to match LeadDetailView interface
      const transformedLead: Lead = {
        id: leadData.name || '',
        name: leadData.name || '',
        leadId: leadData.name || '',
        firstName: leadData.first_name || '',
        lastName: leadData.last_name || '',
        organization: leadData.organization || '',
        status: leadData.status || '',
        email: leadData.email || '',
        mobile: leadData.mobile_no || '',
        mobile_no: leadData.mobile_no || '',
        assignedTo: leadData.lead_owner || '',
        lead_owner: leadData.lead_owner || '',
        lastModified: leadData.modified || '',
        modified: leadData.modified || '',
        creation: leadData.creation || '',
        website: leadData.website || '',
        territory: leadData.territory || '',
        industry: leadData.industry || '',
        jobTitle: leadData.job_title || '',
        source: leadData.source || '',
        salutation: leadData.salutation || '',
        owner: leadData.owner || '',
        modified_by: leadData.modified_by || '',
        docstatus: leadData.docstatus || 0,
        idx: leadData.idx || 0,
        naming_series: leadData.naming_series || '',
        lead_name: leadData.lead_name || `${leadData.first_name || ''} ${leadData.last_name || ''}`.trim(),
        gender: leadData.gender || '',
        no_of_employees: leadData.no_of_employees || '',
        annual_revenue: leadData.annual_revenue || 0,
        image: leadData.image || '',
        first_name: leadData.first_name || '',
        last_name: leadData.last_name || '',
        converted: leadData.converted || ''
      };

      console.log('Transformed lead:', transformedLead); // Debug log
      return transformedLead;
    } catch (error) {
      console.error('Error fetching lead details:', error);
      showToast(`Failed to fetch lead details: ${error.message}`, { type: 'error' });
      return null;
    } finally {
      setLeadLoading(false);
    }
  };

  const handleOpenRecord = async () => {
    console.log('handleOpenRecord called');
    console.log('editingNote:', editingNote);
    console.log('editingNote?.reference_docname:', editingNote?.reference_docname);
    console.log('editingNote?.reference_doctype:', editingNote?.reference_doctype);

    if (!editingNote) {
      console.error('No editing note available');
      showToast('No note selected', { type: 'error' });
      return;
    }

    if (!editingNote.reference_docname) {
      console.error('No reference docname in editing note');
      showToast('This note is not linked to any record', { type: 'error' });
      return;
    }

    if (!editingNote.reference_doctype) {
      console.error('No reference doctype in editing note');
      showToast('Unknown record type for this note', { type: 'error' });
      return;
    }

    console.log('Opening record:', editingNote.reference_doctype, editingNote.reference_docname);

    // Handle opening the related record
    if (editingNote.reference_doctype === 'CRM Deal') {
      console.log('Opening Deal:', editingNote.reference_docname);

      const dealDetails = await fetchDealDetails(editingNote.reference_docname);
      if (dealDetails) {
        console.log('Setting selected deal:', dealDetails);
        setSelectedDeal(dealDetails);
        setShowEditModal(false);
      }
    } else if (editingNote.reference_doctype === 'CRM Lead') {
      console.log('Opening Lead:', editingNote.reference_docname);

      const leadDetails = await fetchLeadDetails(editingNote.reference_docname);
      if (leadDetails) {
        console.log('Setting selected lead:', leadDetails);
        setSelectedLead(leadDetails);
        setShowEditModal(false);
      } else {
        console.error('Failed to fetch lead details');
        showToast('Failed to load lead details', { type: 'error' });
      }
    } else {
      console.warn('Unknown reference doctype:', editingNote.reference_doctype);
      showToast(`Unsupported record type: ${editingNote.reference_doctype}`, { type: 'error' });
    }
  };

  const handleUpdate = async () => {
    try {
      const session = getUserSession();

      if (!session) {
        showToast('Session expired. Please login again.', { type: 'error' });
        return;
      }

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note/${editingNote?.name}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
        },
        body: JSON.stringify({
          title: editForm.title,
          content: editForm.content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Note updated successfully', { type: 'success' });
      setShowEditModal(false);
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      showToast('Failed to update note', { type: 'error' });
    }
  };

  const handleDelete = async (noteName: string) => {
    // if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const session = getUserSession();

      if (!session) {
        showToast('Session expired. Please login again.', { type: 'error' });
        return;
      }

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note/${noteName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Note deleted successfully', { type: 'success' });
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      showToast('Failed to delete note', { type: 'error' });
    }
  };

  // Handle deal save from DealDetailView
  const handleDealSave = (updatedDeal: Deal) => {
    setSelectedDeal(updatedDeal);
    showToast('Deal updated successfully', { type: 'success' });
  };

  // Handle lead save from LeadDetailView
  const handleLeadSave = (updatedLead: Lead) => {
    setSelectedLead(updatedLead);
    showToast('Lead updated successfully', { type: 'success' });
  };

  // Handle back from deal detail view
  const handleBackFromDeal = () => {
    setSelectedDeal(null);
  };

  // Handle back from lead detail view
  const handleBackFromLead = () => {
    setSelectedLead(null);
  };

  const filteredNotes = notes.filter(note =>
    Object.values(note).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Debug logs for state changes
  useEffect(() => {
    console.log('Selected deal changed:', selectedDeal);
  }, [selectedDeal]);

  useEffect(() => {
    console.log('Selected lead changed:', selectedLead);
  }, [selectedLead]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!((event.target as HTMLElement).closest('.dropdown-menu'))) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // If a deal is selected, show DealDetailView
  if (selectedDeal) {
    console.log('Rendering DealDetailView with:', selectedDeal);
    return (
      <DealDetailView
        deal={selectedDeal}
        onBack={handleBackFromDeal}
        onSave={handleDealSave}
      />
    );
  }

  // If a lead is selected, show LeadDetailView
  if (selectedLead) {
    console.log('Rendering LeadDetailView with:', selectedLead);
    return (
      <LeadDetailView
        lead={selectedLead}
        onBack={handleBackFromLead}
        onSave={handleLeadSave}
      />
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark'
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
        : 'bg-gray-50'
        }`}>
        <Header
          title="Notes"
          subtitle={leadName ? `For Lead: ${leadName}` : undefined}
          onRefresh={fetchNotes}
          onFilter={() => { }}
          onSort={() => { }}
          onColumns={() => { }}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading notes...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark'
      ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
      : 'bg-gray-50'
      }`}>
      <Header
        title="Notes"
        subtitle={leadName ? `For Lead: ${leadName}` : undefined}
        onRefresh={fetchNotes}
        onFilter={() => { }}
        onSort={() => { }}
        onColumns={() => { }}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="p-4 sm:p-6">
        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.name}
              onClick={(event) => handleNoteClick(note, event)}
              className={`rounded-lg shadow-sm border p-5 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] relative ${theme === 'dark'
                ? 'bg-custom-gradient border-white'
                : 'bg-white border-gray-200'
                }`}
            >
              <div className="flex items-start justify-between mb-20">
                <h3 className={`text-sm font-semibold truncate pr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {note.title}
                </h3>



                <div className="relative dropdown-menu">
                  <button
                    onClick={(event) => toggleDropdown(note.name, event)}
                    className={`text-gray-400 hover:text-gray-600 flex-shrink-0 ${theme === 'dark' ? 'text-white hover:text-gray-300' : ''}`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>




                  {openDropdown === note.name && (
                    <div className={`absolute right-0 top-6 mt-1 w-32 rounded-md shadow-lg z-10 ${theme === 'dark' ? 'bg-dark-secondary border border-gray-600' : 'bg-white border border-gray-200'
                      }`}>
                      <div className="py-1">
                        <button
                          onClick={(event) => handleDeleteClick(note.name, event)}
                          className={`flex items-center w-full px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${theme === 'dark' ? 'text-white hover:bg-red-900/20 hover:text-red-300' : 'text-gray-700'
                            }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
              <div className="h-50 overflow-hidden">
                <h2 className={`text-xs mb-4 line-clamp-3 leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                  {note.content}
                </h2>
              </div>


              <div className="mt-auto">
                {/* {note.reference_docname && (
                  <div className={`text-xs mb-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                    {note.reference_doctype}: {note.reference_docname}
                  </div>
                )} */}

                {/* Debug info - remove this later */}
                {/* <div className={`text-xs mb-2 opacity-50 ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`}>
                  Debug: doctype={note.reference_doctype || 'null'}, docname={note.reference_docname || 'null'}
                </div> */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${theme === 'dark' ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-700'}`}>
                      {note.owner ? note.owner.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                      {note.owner}
                    </span>
                  </div>

                  {note.modified && (
                    <div className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                      {formatRelativeDate(note.modified)}
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No notes found</div>
            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-grey-500'}`}>
              {leadName ? 'No notes for this lead' : 'Create your first note to get started'}
            </div>
          </div>
        )}
      </div>

      <EditModal
        show={!!editingNote && showEditModal}
        theme={theme}
        editForm={editForm}
        setEditForm={setEditForm}
        onUpdate={handleUpdate}
        onClose={() => setShowEditModal(false)}
        editingNote={editingNote}
        onOpenRecord={handleOpenRecord}
      />

      {/* Loading overlay for deal/lead navigation */}
      {(dealLoading || leadLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-dark-secondary text-white' : 'bg-white text-gray-800'}`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span>Loading {dealLoading ? 'deal' : 'lead'} details...</span>
          </div>
        </div>
      )}
    </div>
  );
}