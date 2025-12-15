import React, { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { showToast } from '../utils/toast';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';
import { formatDistanceToNow } from 'date-fns';
import { AUTH_TOKEN, getAuthToken } from '../api/apiUrl';
import { api } from '../api/apiService';
import DOMPurify from 'dompurify';

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

interface NotesPageProps {
  onCreateNote: () => void;
  leadName?: string;
  onMenuToggle: () => void;
  refreshTrigger: number;
  searchTerm: string;
  onNavigateToDeal?: (dealName: string) => void;
  onNavigateToLead?: (leadName: string) => void;
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white !placeholder-gray-100'
                    : 'bg-white/80 border-gray-300 !placeholder-gray-500'
                    } `}
                  placeholder="Call with John Doe"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Content</label>
                <textarea
                  value={editForm.content.replace(/<[^>]+>/g, '')}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white !placeholder-gray-100'
                    : 'bg-white/80 border-gray-300 !placeholder-gray-500'
                    } `}
                  placeholder="Took a call with John Doe and discussed the new project"
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

export function NotesPage({ 
  onCreateNote, 
  leadName, 
  onMenuToggle, 
  refreshTrigger, 
  searchTerm,
  onNavigateToDeal,
  onNavigateToLead 
}: NotesPageProps) {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [leadName, refreshTrigger]);

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

      const result = await api.post('/api/method/crm.api.doc.get_data', payload);
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
    if (event && (event.target as HTMLElement).closest('.dropdown-menu')) {
      return;
    }
    handleEdit(note);
  };

  const toggleDropdown = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === noteId ? null : noteId);
  };

  // Remove the duplicate formatRelativeDate function at the bottom of the file
// And update the one inside the component to properly handle the date format

function formatRelativeDate(dateStr?: string | null) {
  if (!dateStr) return '';
  
  // Handle different date formats
  let parsed: Date;
  
  if (dateStr.includes('T')) {
    // Already in ISO format with T separator
    parsed = new Date(dateStr);
  } else {
    // Replace space with T for ISO format
    parsed = new Date(dateStr.replace(' ', 'T'));
  }
  
  if (isNaN(parsed.getTime())) return '';
  
  const distance = formatDistanceToNow(parsed, { addSuffix: true });
  
  // Convert "less than a minute ago" to "now"
  if (distance === 'less than a minute ago') {
    return 'now';
  }
  
  return distance;
}

  const handleDeleteClick = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    handleDelete(noteId);
    setOpenDropdown(null);
  };

  const handleOpenRecord = async () => {
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

    // Close the edit modal first
    setShowEditModal(false);
    setEditingNote(null);
    
    // Show loading state
    setNavigationLoading(true);

    try {
      if (editingNote.reference_doctype === 'CRM Deal' && onNavigateToDeal) {
        onNavigateToDeal(editingNote.reference_docname);
      } else if (editingNote.reference_doctype === 'CRM Lead' && onNavigateToLead) {
        onNavigateToLead(editingNote.reference_docname);
      } else {
        console.warn('Unknown reference doctype:', editingNote.reference_doctype);
        showToast(`Unsupported record type: ${editingNote.reference_doctype}`, { type: 'error' });
      }
    } catch (error) {
      console.error('Error navigating:', error);
      showToast('Failed to navigate to record', { type: 'error' });
    } finally {
      setNavigationLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const session = getUserSession();
       const token = getAuthToken();

      if (!session) {
        showToast('Session expired. Please login again.', { type: 'error' });
        return;
      }

      const apiUrl = `https://api.erpnext.ai/api/v2/document/FCRM Note/${editingNote?.name}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
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
    try {
      const session = getUserSession();
       const token = getAuthToken();

      if (!session) {
        showToast('Session expired. Please login again.', { type: 'error' });
        return;
      }

      const apiUrl = `https://api.erpnext.ai/api/v2/document/FCRM Note/${noteName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': token
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

  const filteredNotes = notes.filter(note =>
    Object.values(note).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

  const getDisplayName = (ownerEmail: string) => {
    if (!ownerEmail) return 'Unknown';
    return ownerEmail.split('@')[0];
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark'
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
        : 'bg-gray-50'
        }`}>
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
      <div className="p-4 sm:p-6">
        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.name}
              onClick={(event) => handleNoteClick(note, event)}
              className={`rounded-lg h-[200px] flex flex-col justify-between     shadow-sm border p-5 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] relative ${theme === 'dark'
                ? 'bg-custom-gradient border-white'
                : 'bg-white border-gray-200'
                }`}
            >
              <div className="flex items-start justify-between ">
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
                <div
                  className={`text-xs  mb-4 line-clamp-3 leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(note.content || '')
                  }}
                />
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${theme === 'dark' ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-700'}`}>
                      {note.owner ? note.owner.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                      {getDisplayName(note.owner)}
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

      {/* Edit Note Modal */}
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

      {/* Navigation loading overlay */}
      {navigationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-dark-secondary text-white' : 'bg-white text-gray-800'}`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span>Loading record details...</span>
          </div>
        </div>
      )}
    </div>
  );
}