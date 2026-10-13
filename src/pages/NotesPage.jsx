import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import noteService from '../services/noteService';
import {
  Plus,
  Grid,
  List,
  ArrowUpDown,
  Filter,
  FileText,
  Tag as TagIcon
} from 'lucide-react';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'title-asc' | 'title-desc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modals
  const [editingNote, setEditingNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteNoteTarget, setDeleteNoteTarget] = useState(null);

  // Fetch Notes with current filters
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {
        sort: sortOrder,
      };
      if (activeCategory) params.category = activeCategory;
      if (activeTag) params.tag = activeTag;
      if (showFavoritesOnly) params.favorite = true;
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await noteService.getNotes(params);
      if (res.success) {
        setNotes(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories & Tags for sidebar & filter pills
  const fetchMetadata = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        noteService.getCategories(),
        noteService.getTags(),
      ]);
      if (catRes.success) setCategories(catRes.data);
      if (tagRes.success) setTags(tagRes.data);
    } catch (err) {
      console.error('Failed to load categories/tags:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 200);
    return () => clearTimeout(timer);
  }, [keyword, activeCategory, activeTag, showFavoritesOnly, sortOrder]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleToggleFavorite = async (noteId) => {
    try {
      const res = await noteService.toggleFavorite(noteId);
      if (res.success && res.data) {
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? res.data : n))
        );
        fetchMetadata();
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteNoteTarget) return;
    try {
      await noteService.moveToTrash(deleteNoteTarget.id);
      setDeleteNoteTarget(null);
      if (isEditorOpen && editingNote?.id === deleteNoteTarget.id) {
        setIsEditorOpen(false);
      }
      fetchNotes();
      fetchMetadata();
    } catch (err) {
      console.error('Failed to move note to trash:', err);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setActiveTag(null);
        }}
        onOpenNewCategory={() => setIsCategoryModalOpen(true)}
        onNewNote={handleCreateNote}
        counts={{
          totalNotes: notes.length,
        }}
      />

      <div className="dashboard-main">
        <Navbar onNewNote={handleCreateNote} />

        <div className="page-container">
          {/* Header Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>All Notes</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Manage, search, and edit your knowledge base
              </p>
            </div>

            <button onClick={handleCreateNote} className="btn btn-primary">
              <Plus size={16} />
              <span>Create Note</span>
            </button>
          </div>

          {/* Search, Sort, and View Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            <SearchBar
              value={keyword}
              onChange={setKeyword}
              onClear={() => setKeyword('')}
              placeholder="Search by keywords in title or content..."
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Sort Order Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.825rem', width: 'auto' }}
                >
                  <option value="newest">Recently Updated</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title-asc">Title (A - Z)</option>
                  <option value="title-desc">Title (Z - A)</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div style={{
                display: 'flex',
                background: 'var(--bg-secondary)',
                padding: '0.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className="btn-icon"
                  style={{
                    padding: '5px',
                    borderRadius: 'var(--radius-sm)',
                    background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--primary-600)' : 'var(--text-muted)'
                  }}
                  title="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="btn-icon"
                  style={{
                    padding: '5px',
                    borderRadius: 'var(--radius-sm)',
                    background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--primary-600)' : 'var(--text-muted)'
                  }}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ marginBottom: '1.5rem' }}>
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavoritesOnly={setShowFavoritesOnly}
            />
          </div>

          {/* Tag Filter Filter Bar (if tag is active or available) */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Filter Tag:
              </span>
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="badge tag-badge"
                  style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', borderColor: 'var(--primary-500)', cursor: 'pointer' }}
                >
                  Clear Tag: #{activeTag} &times;
                </button>
              )}
              {tags.slice(0, 10).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTag(activeTag === t.name ? null : t.name)}
                  className={`badge tag-badge`}
                  style={{
                    cursor: 'pointer',
                    background: activeTag === t.name ? 'var(--primary-600)' : 'var(--bg-secondary)',
                    color: activeTag === t.name ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  #{t.name} ({t.noteCount})
                </button>
              ))}
            </div>
          )}

          {/* Notes Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No notes match your selection
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Try adjusting your search query, clear active category/tag filters, or create a brand new note.
              </p>
              <button onClick={handleCreateNote} className="btn btn-primary">
                <Plus size={16} />
                <span>Create New Note</span>
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'notes-grid' : 'notes-list'}>
              {notes.map((note) => (
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

      {/* Note Editor Modal */}
      {isEditorOpen && (
        <NoteEditor
          note={editingNote}
          categories={categories}
          onClose={() => setIsEditorOpen(false)}
          onSaveSuccess={(saved) => {
            fetchNotes();
            fetchMetadata();
          }}
          onTrashRequest={(noteToTrash) => {
            setDeleteNoteTarget(noteToTrash);
          }}
          onOpenNewCategory={() => setIsCategoryModalOpen(true)}
        />
      )}

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCreated={() => {
          fetchMetadata();
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteNoteTarget}
        title="Move to Trash"
        message={`Move "${deleteNoteTarget?.title || 'this note'}" to trash? You can restore it anytime from the Trash page.`}
        confirmText="Move to Trash"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteNoteTarget(null)}
      />
    </div>
  );
};

export default NotesPage;
