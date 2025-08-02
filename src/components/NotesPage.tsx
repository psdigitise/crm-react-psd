// import React, { useState, useEffect } from 'react';
// import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Edit, Trash2 } from 'lucide-react';
// import { showToast } from '../utils/toast';
// import { Header } from './Header';
// import { useTheme } from './ThemeProvider';

// import { getUserSession } from '../utils/session';

// interface Note {
//   name: string;
//   title: string;
//   content: string;
//   reference_doctype?: string;
//   reference_docname?: string;
//   creation?: string;
//   modified?: string;
// }

// interface NotesPageProps {
//   onCreateNote: () => void;
//   leadName?: string;
// }

// export function NotesPage({ onCreateNote, leadName }: NotesPageProps) {
//   const { theme } = useTheme();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editingNote, setEditingNote] = useState<Note | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

//   useEffect(() => {
//     fetchNotes();
//   }, [leadName]);

//   // const fetchNotes = async () => {
//   //   try {
//   //     setLoading(true);

//   //     // Get company from session
//   //     const sessionCompany = sessionStorage.getItem('company');
//   //     if (!sessionCompany) {
//   //       setNotes([]);
//   //       setLoading(false);
//   //       return;
//   //     }

//   //     // Add filter for company field (if your FCRM Note doctype has a 'company' field)
//   //     const filters = encodeURIComponent(JSON.stringify([["company", "=", sessionCompany]]));
//   //     const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note?fields=["name","title","content","reference_doctype","reference_docname","creation","modified"]&filters=${filters}`;

//   //     const response = await fetch(apiUrl, {
//   //       method: 'GET',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//   //       }
//   //     });

//   const fetchNotes = async () => {
//     try {
//       setLoading(true);

//       // Get session and company from local/session storage
//       const session = getUserSession();
//       const sessionCompany = session?.company;

//       if (!sessionCompany) {
//         setNotes([]);
//         setLoading(false);
//         return;
//       }

//       // Apply filter for the company field
//       const filters = encodeURIComponent(JSON.stringify([
//         ["company", "=", sessionCompany]
//       ]));

//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note?fields=["name","title","content","reference_doctype","reference_docname","creation","modified"]&filters=${filters}`;

//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `token ${session.api_key}:${session.api_secret}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result = await response.json();
//       let filteredNotes = result.data || [];

//       // Filter by leadName if provided
//       if (leadName) {
//         filteredNotes = filteredNotes.filter((note: Note) =>
//           note.reference_docname === leadName
//         );
//       }

//       setNotes(filteredNotes);
//     } catch (error) {
//       // console.error('Error fetching notes:', error);
//       // showToast('Failed to fetch notes', { type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (note: Note) => {
//     setEditingNote(note);
//     setShowEditModal(true);
//   };

//   const handleUpdate = async (updatedNote: Note) => {
//     try {
//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note/${updatedNote.name}`;

//       const response = await fetch(apiUrl, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//         },
//         body: JSON.stringify({
//           title: updatedNote.title,
//           content: updatedNote.content
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Note updated successfully', { type: 'success' });
//       setShowEditModal(false);
//       setEditingNote(null);
//       fetchNotes();
//     } catch (error) {
//       console.error('Error updating note:', error);
//       showToast('Failed to update note', { type: 'error' });
//     }
//   };

//   const handleDelete = async (noteName: string) => {
//     if (!confirm('Are you sure you want to delete this note?')) return;

//     try {
//       const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note/${noteName}`;

//       const response = await fetch(apiUrl, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       showToast('Note deleted successfully', { type: 'success' });
//       fetchNotes();
//     } catch (error) {
//       console.error('Error deleting note:', error);
//       showToast('Failed to delete note', { type: 'error' });
//     }
//   };

//   const filteredNotes = notes.filter(note =>
//     Object.values(note).some(value =>
//       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const EditModal = () => {
//     if (!editingNote || !showEditModal) return null;

//     return (
//       <div className="fixed inset-0 z-50 overflow-y-auto">
//         <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//           <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)} />

//           <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
//             }`}>
//             <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
//               <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Note</h3>

//               <div className="space-y-4">
//                 <div>
//                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Title</label>
//                   <input
//                     type="text"
//                     value={editingNote.title}
//                     onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
//                       ? 'bg-white-31 border-white text-white'
//                       : 'border-gray-300'
//                       }`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Content</label>
//                   <textarea
//                     value={editingNote.content}
//                     onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
//                     rows={4}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
//                       ? 'bg-white-31 border-white text-white'
//                       : 'border-gray-300'
//                       }`}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'
//               }`}>
//               <button
//                 onClick={() => handleUpdate(editingNote)}
//                 className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
//               >
//                 Update
//               </button>
//               <button
//                 onClick={() => setShowEditModal(false)}
//                 className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${theme === 'dark'
//                   ? 'border-purple-500/30 bg-dark-accent text-white hover:bg-purple-800/50'
//                   : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
//                   }`}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className={`min-h-screen ${theme === 'dark'
//         ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//         : 'bg-gray-50'
//         }`}>
//         <Header
//           title="Notes"
//           subtitle={leadName ? `For Lead: ${leadName}` : undefined}
//           onRefresh={fetchNotes}
//           onFilter={() => { }}
//           onSort={() => { }}
//           onColumns={() => { }}
//           onCreate={onCreateNote}
//           searchValue={searchTerm}
//           onSearchChange={setSearchTerm}
//           viewMode={viewMode}
//           onViewModeChange={setViewMode}
//         />
//         <div className="p-4 sm:p-6">
//           <div className="flex items-center justify-center">
//             <div className={theme === 'dark' ? 'text-white' : 'text-gray-600'}>Loading notes...</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${theme === 'dark'
//       ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//       : 'bg-gray-50'
//       }`}>
//       <Header
//         title="Notes"
//         subtitle={leadName ? `For Lead: ${leadName}` : undefined}
//         onRefresh={fetchNotes}
//         onFilter={() => { }}
//         onSort={() => { }}
//         onColumns={() => { }}
//         onCreate={onCreateNote}
//         searchValue={searchTerm}
//         onSearchChange={setSearchTerm}
//         viewMode={viewMode}
//         onViewModeChange={setViewMode}
//       />

//       <div className="p-4 sm:p-6">
//         {/* Notes Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredNotes.map((note) => (
//             <div key={note.name} className={`rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${theme === 'dark'
//               ? 'bg-custom-gradient border-white'
//               : 'bg-white border-gray-200'
//               }`}>
//               <div className="flex items-start justify-between mb-4">
//                 <h3 className={`text-lg font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {note.title}
//                 </h3>
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() => handleEdit(note)}
//                     className={`p-1 transition-colors ${theme === 'dark' ? 'text-white hover:bg-purplebg' : 'text-white hover:text-blue-600'
//                       }`}
//                   >
//                     <Edit className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(note.name)}
//                     className={`p-1 transition-colors ${theme === 'dark' ? 'text-white hover:text-red-400' : 'text-white hover:text-red-600'
//                       }`}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>

//               <p className={`text-sm mb-4 line-clamp-3 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
//                 {note.content}
//               </p>

//               {note.reference_docname && (
//                 <div className={`text-base mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                   Related to: {note.reference_docname}
//                 </div>
//               )}

//               {note.modified && (
//                 <div className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                   Modified: {new Date(note.modified).toLocaleDateString()}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {filteredNotes.length === 0 && (
//           <div className="text-center py-12">
//             <div className={theme === 'dark' ? 'text-white' : 'text-gray-500'}>No notes found</div>
//             <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-grey-500'}`}>
//               {leadName ? 'No notes for this lead' : 'Create your first note to get started'}
//             </div>
//           </div>
//         )}
//       </div>

//       <EditModal />
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter, ArrowUpDown, Columns, MoreHorizontal, Search, Edit, Trash2 } from 'lucide-react';
import { showToast } from '../utils/toast';
import { Header } from './Header';
import { useTheme } from './ThemeProvider';
import { getUserSession } from '../utils/session';

interface Note {
  name: string;
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
}

interface EditModalProps {
  show: boolean;
  theme: string;
  editForm: { title: string; content: string };
  setEditForm: React.Dispatch<React.SetStateAction<{ title: string; content: string }>>;
  onUpdate: () => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ show, theme, editForm, setEditForm, onUpdate, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
          <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>
            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Note</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'border-gray-300'
                    }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Content</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark'
                    ? 'bg-white-31 border-white text-white'
                    : 'border-gray-300'
                    }`}
                />
              </div>
            </div>
          </div>
          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-dark-tertiary' : 'bg-gray-50'}`}>
            <button
              onClick={onUpdate}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Update
            </button>
            <button
              onClick={onClose}
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${theme === 'dark'
                ? 'border-purple-500/30 bg-dark-accent text-white hover:bg-purple-800/50'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              Cancel
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

  useEffect(() => {
    fetchNotes();
  }, [leadName]);

  // const fetchNotes = async () => {
  //   try {
  //     setLoading(true);

  //     // Get company from session
  //     const sessionCompany = sessionStorage.getItem('company');
  //     if (!sessionCompany) {
  //       setNotes([]);
  //       setLoading(false);
  //       return;
  //     }

  //     // Add filter for company field (if your FCRM Note doctype has a 'company' field)
  //     const filters = encodeURIComponent(JSON.stringify([["company", "=", sessionCompany]]));
  //     const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note?fields=["name","title","content","reference_doctype","reference_docname","creation","modified"]&filters=${filters}`;

  //     const response = await fetch(apiUrl, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
  //       }
  //     });

  const fetchNotes = async () => {
    try {
      setLoading(true);

      // Get session and company from local/session storage
      const session = getUserSession();
      const sessionCompany = session?.company;

      if (!sessionCompany) {
        setNotes([]);
        setLoading(false);
        return;
      }

      // Apply filter for the company field
      const filters = encodeURIComponent(JSON.stringify([
        ["company", "=", sessionCompany]
      ]));

      const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note?fields=["name","title","content","reference_doctype","reference_docname","creation","modified"]&filters=${filters}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${session.api_key}:${session.api_secret}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      let filteredNotes = result.data || [];

      // Filter by leadName if provided
      if (leadName) {
        filteredNotes = filteredNotes.filter((note: Note) =>
          note.reference_docname === leadName
        );
      }

      setNotes(filteredNotes);
    } catch (error) {
      // console.error('Error fetching notes:', error);
      // showToast('Failed to fetch notes', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setEditForm({ title: note.title, content: note.content });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note/${editingNote?.name}`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
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
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const apiUrl = `http://103.214.132.20:8002/api/v2/document/FCRM Note/${noteName}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': 'token 1b670b800ace83b:f82627cb56de7f6'
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
          onCreate={onCreateNote}
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
        onCreate={onCreateNote}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        
      />

      <div className="p-4 sm:p-6">
        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.name} className={`rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${theme === 'dark'
              ? 'bg-custom-gradient border-white'
              : 'bg-white border-gray-200'
              }`}>
              <div className="flex items-start justify-between mb-4">
                <h3 className={`text-lg font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {note.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className={`p-1 transition-colors ${theme === 'dark' ? 'text-white hover:text-purplebg' : 'text-gray-700 hover:text-blue-600'
                      }`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.name)}
                    className={`p-1 transition-colors ${theme === 'dark' ? 'text-white hover:text-red-400' : 'text-gray-700 hover:text-red-600'
                      }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className={`text-sm mb-4 line-clamp-3 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                {note.content}
              </p>

              {note.reference_docname && (
                <div className={`text-base mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                  Related to: {note.reference_docname}
                </div>
              )}

              {note.modified && (
                <div className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                  Modified: {new Date(note.modified).toLocaleDateString()}
                </div>
              )}
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
      />
    </div>
  );
}