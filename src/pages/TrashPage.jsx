import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
import noteService from '../services/noteService';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

const TrashPage = () => {
  const [trashNotes, setTrashNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [targetPermanentDelete, setTargetPermanentDelete] = useState(null);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await noteService.getTrashNotes();
      if (res.success) {
        setTrashNotes(res.data);
      }
    } catch (err) {
      console.error('Failed to load trash notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await noteService.restoreFromTrash(id);
      setTrashNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to restore note:', err);
    }
  };

  const handlePermanentDelete = async () => {
    if (!targetPermanentDelete) return;
    try {
      await noteService.deleteNotePermanently(targetPermanentDelete.id);
      setTrashNotes((prev) => prev.filter((n) => n.id !== targetPermanentDelete.id));
      setTargetPermanentDelete(null);
    } catch (err) {
      console.error('Failed to delete note permanently:', err);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await noteService.emptyTrash();
      setTrashNotes([]);
      setConfirmEmpty(false);
    } catch (err) {
      console.error('Failed to empty trash:', err);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="page-container" style={{ maxWidth: '900px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Trash2 size={24} style={{ color: 'var(--rose-500)' }} />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Trash</h1>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Notes moved to trash can be restored or permanently removed
              </p>
            </div>

            {trashNotes.length > 0 && (
              <button
                onClick={() => setConfirmEmpty(true)}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={15} />
                <span>Empty Trash</span>
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              Loading trash...
            </div>
          ) : trashNotes.length === 0 ? (
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
                marginBottom: '1rem'
              }}>
                <Trash2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Trash is empty
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Deleted notes will appear here before permanent erasure.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {trashNotes.map((note) => (
                <div
                  key={note.id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.15rem 1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>
                      {note.content?.substring(0, 120) || 'No text content'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={() => handleRestore(note.id)}
                      className="btn btn-secondary btn-sm"
                      title="Restore note to active workspace"
                    >
                      <RotateCcw size={14} />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => setTargetPermanentDelete(note)}
                      className="btn btn-danger btn-sm"
                      title="Permanently erase note"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmEmpty}
        title="Empty Trash"
        message="Are you sure you want to permanently delete all notes in the trash? This cannot be undone."
        confirmText="Empty All"
        onConfirm={handleEmptyTrash}
        onCancel={() => setConfirmEmpty(false)}
      />

      <ConfirmDialog
        isOpen={!!targetPermanentDelete}
        title="Permanently Delete Note"
        message={`Are you sure you want to permanently erase "${targetPermanentDelete?.title || 'this note'}"?`}
        confirmText="Delete Forever"
        onConfirm={handlePermanentDelete}
        onCancel={() => setTargetPermanentDelete(null)}
      />
    </div>
  );
};

export default TrashPage;
