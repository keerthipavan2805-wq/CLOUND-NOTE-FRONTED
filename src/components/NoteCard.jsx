import React from 'react';
import { Star, Trash2, Pin, Tag as TagIcon, Clock, Download, Share2, Globe, Calendar } from 'lucide-react';
import noteService from '../services/noteService';

const NoteCard = ({ note, onClick, onToggleFavorite, onDelete, onShare }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Strip Markdown symbols for a clean card snippet
  const getPlainTextSnippet = (markdown) => {
    if (!markdown) return 'No additional text';
    return markdown
      .replace(/[#*`_~\[\]()>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleDownloadPdf = async (e) => {
    e.stopPropagation();
    try {
      await noteService.downloadPdf(note.id, note.title || 'note');
    } catch (err) {
      console.error('Download PDF error:', err);
    }
  };

  return (
    <div className="note-card" onClick={() => onClick(note)}>
      <div>
        <div className="note-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
            {note.pinned && (
              <Pin size={14} style={{ color: 'var(--primary-600)', transform: 'rotate(45deg)', flexShrink: 0 }} />
            )}
            <h3 className="note-card-title">{note.title || 'Untitled Note'}</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {note.isPublic && (
              <span title="Public note" style={{ color: 'var(--emerald-500)', display: 'inline-flex', padding: '2px' }}>
                <Globe size={14} />
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note.id);
              }}
              className={`note-card-favorite-btn ${note.favorite ? 'active' : ''}`}
              title={note.favorite ? 'Remove from favorites' : 'Mark as favorite'}
              aria-label="Toggle favorite"
            >
              <Star size={18} fill={note.favorite ? '#f59e0b' : 'none'} />
            </button>
          </div>
        </div>

        <p className="note-card-body">
          {getPlainTextSnippet(note.content)}
        </p>
      </div>

      <div>
        {/* Tags & Category */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem' }}>
          {note.categoryName && (
            <span
              className="category-pill"
              style={{ backgroundColor: note.categoryColor || '#4f46e5' }}
            >
              {note.categoryName}
            </span>
          )}

          {note.tags && Array.from(note.tags).slice(0, 3).map((tag, idx) => (
            <span key={idx} className="badge tag-badge">
              #{tag}
            </span>
          ))}
          {note.tags && note.tags.length > 3 && (
            <span className="badge tag-badge">+{note.tags.length - 3}</span>
          )}

          {note.reminderDate && (
            <span className="badge" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }} title="Study Reminder">
              <Calendar size={10} />
              <span>Due {new Date(note.reminderDate).toLocaleDateString()}</span>
            </span>
          )}
        </div>

        {/* Card Footer */}
        <div className="note-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={12} />
            <span>{formatDate(note.updatedAt || note.createdAt)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <button
              onClick={handleDownloadPdf}
              className="btn-icon"
              style={{ padding: '4px', color: 'var(--text-muted)' }}
              title="Download as PDF"
            >
              <Download size={14} />
            </button>

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note);
                }}
                className="btn-icon"
                style={{ padding: '4px', color: 'var(--text-muted)' }}
                title="Move note to trash"
                aria-label="Delete note"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
