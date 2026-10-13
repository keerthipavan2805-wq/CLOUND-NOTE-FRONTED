import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import SearchBar from '../components/SearchBar';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import noteService from '../services/noteService';
import { Star, Plus, FileText } from 'lucide-react';

const FavoritesPage = () => {
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [editingNote, setEditingNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteNoteTarget, setDeleteNoteTarget] = useState(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const [res, catRes] = await Promise.all([
        noteService.getNotes({ favorite: true }),
        noteService.getCategories(),
      ]);
      if (res.success) setFavoriteNotes(res.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleToggleFavorite = async (noteId) => {
    try {
      const res = await noteService.toggleFavorite(noteId);
      if (res.success) {
        // If unfavorited, remove from favorites list
        setFavoriteNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteNoteTarget) return;
    try {
      await noteService.deleteNote(deleteNoteTarget.id);
      setDeleteNoteTarget(null);
      if (isEditorOpen && editingNote?.id === deleteNoteTarget.id) {
        setIsEditorOpen(false);
      }
      fetchFavorites();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const filteredNotes = favoriteNotes.filter((n) => {
    if (!keyword) return true;
    const q = keyword.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
  });

  return (
    <div className="dashboard-layout">
      <Sidebar
        categories={categories}
        onNewNote={() => {
          setEditingNote(null);
          setIsEditorOpen(true);
        }}
        onOpenNewCategory={() => setIsCategoryModalOpen(true)}
        counts={{
          favoriteNotes: favoriteNotes.length,
        }}
      />

      <div className="dashboard-main">
        <Navbar onNewNote={() => {
          setEditingNote(null);
          setIsEditorOpen(true);
        }} />

        <div className="page-container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Star size={24} fill="#f59e0b" color="#f59e0b" />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Favorite Notes</h1>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Quick access to your most important pinned and starred notes
              </p>
            </div>

            <SearchBar
              value={keyword}
              onChange={setKeyword}
              onClear={() => setKeyword('')}
              placeholder="Search your favorites..."
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              Loading favorites...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Star size={30} fill="#d97706" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {keyword ? 'No matching favorites found' : 'No favorites yet'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                {keyword
                  ? `No favorite notes match "${keyword}".`
                  : 'Star notes anywhere in CloudNote to collect your key insights in one convenient place.'}
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onClick={handleEditNote}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={(n) => setDeleteNoteTarget(n)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditorOpen && (
        <NoteEditor
          note={editingNote}
          categories={categories}
          onClose={() => setIsEditorOpen(false)}
          onSaveSuccess={() => fetchFavorites()}
          onDeleteRequest={(noteToDelete) => setDeleteNoteTarget(noteToDelete)}
          onOpenNewCategory={() => setIsCategoryModalOpen(true)}
        />
      )}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCreated={() => fetchFavorites()}
      />

      <ConfirmDialog
        isOpen={!!deleteNoteTarget}
        title="Delete Note"
        message={`Are you sure you want to permanently delete "${deleteNoteTarget?.title || 'this note'}"?`}
        confirmText="Delete Note"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteNoteTarget(null)}
      />
    </div>
  );
};

export default FavoritesPage;
