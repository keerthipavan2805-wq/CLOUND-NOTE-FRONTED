import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import SearchBar from '../components/SearchBar';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import noteService from '../services/noteService';
import {
  FileText,
  Star,
  Folder,
  Tag,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalNotes: 0,
    favoriteNotes: 0,
    categoryCount: 0,
    tagCount: 0,
  });
  const [categories, setCategories] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search keyword
  const [keyword, setKeyword] = useState('');

  // Modals state
  const [editingNote, setEditingNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteNoteTarget, setDeleteNoteTarget] = useState(null);

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, catRes, notesRes] = await Promise.all([
        noteService.getStats(),
        noteService.getCategories(),
        noteService.getNotes({ sort: 'newest' }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (notesRes.success) setRecentNotes(notesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        setRecentNotes((prev) =>
          prev.map((n) => (n.id === noteId ? res.data : n))
        );
        fetchData();
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
      fetchData();
    } catch (err) {
      console.error('Failed to move note to trash:', err);
    }
  };

  const filteredNotes = recentNotes.filter((n) => {
    if (!keyword) return true;
    const q = keyword.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-layout">
      <Sidebar
        categories={categories}
        onNewNote={handleCreateNote}
        onOpenNewCategory={() => setIsCategoryModalOpen(true)}
        counts={{
          totalNotes: stats.totalNotes,
          favoriteNotes: stats.favoriteNotes,
        }}
      />

      <div className="dashboard-main">
        <Navbar onNewNote={handleCreateNote} />

        <div className="page-container">
          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Sparkles size={18} style={{ color: 'var(--primary-600)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Workspace Overview
                </span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Hello, {user?.name || 'Explorer'}!
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                You have {stats.totalNotes} notes synced and securely stored in your personal cloud.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleCreateNote} className="btn btn-primary btn-lg">
                <Plus size={18} />
                <span>Create New Note</span>
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}>
            {/* Total Notes */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Notes</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalNotes}</div>
              </div>
            </div>

            {/* Favorites */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Star size={22} fill="#d97706" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Favorites</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.favoriteNotes}</div>
              </div>
            </div>

            {/* Categories */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#ede9fe',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Folder size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Categories</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.categoryCount}</div>
              </div>
            </div>

            {/* Tags */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Tag size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Tags</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.tagCount}</div>
              </div>
            </div>
          </div>

          {/* Recent Notes Section Header & Search */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Recent Notes</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your latest thoughts and active drafts</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '380px' }}>
              <SearchBar
                value={keyword}
                onChange={setKeyword}
                onClear={() => setKeyword('')}
                placeholder="Search recent notes..."
              />
            </div>
          </div>

          {/* Notes Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Loading your notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {keyword ? 'No matching notes found' : 'No notes created yet'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                {keyword
                  ? `We couldn't find any note containing "${keyword}". Try another term.`
                  : 'Start capturing your engineering study notes, project architecture diagrams, or code snippets.'}
              </p>
              <button onClick={handleCreateNote} className="btn btn-primary">
                <Plus size={16} />
                <span>Create Your First Note</span>
              </button>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.slice(0, 9).map((note) => (
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
            fetchData();
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
        onCreated={(newCat) => {
          fetchData();
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

export default DashboardPage;
