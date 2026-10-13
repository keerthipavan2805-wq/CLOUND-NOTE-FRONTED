import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Lock } from 'lucide-react';
import noteService from '../services/noteService';

const ShareModal = ({ isOpen, onClose, note, onShareUpdated }) => {
  if (!isOpen || !note) return null;

  const [isPublic, setIsPublic] = useState(note.isPublic || false);
  const [shareToken, setShareToken] = useState(note.shareToken || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const publicUrl = shareToken
    ? `${window.location.origin}/shared/${shareToken}`
    : '';

  const handleToggleShare = async () => {
    const nextState = !isPublic;
    setLoading(true);
    try {
      const res = await noteService.shareNote(note.id, nextState);
      if (res.success && res.data) {
        setIsPublic(res.data.isPublic);
        setShareToken(res.data.shareToken);
        if (onShareUpdated) onShareUpdated(res.data);
      }
    } catch (err) {
      console.error('Failed to update share settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Share2 size={20} style={{ color: 'var(--primary-600)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Share Note</h3>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Publish a read-only web view of "<strong>{note.title || 'Untitled Note'}</strong>" for your study group or classmates.
        </p>

        {/* Public Sharing Toggle Card */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: isPublic ? '#d1fae5' : 'var(--bg-surface)',
              color: isPublic ? '#059669' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isPublic ? <Globe size={18} /> : <Lock size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Public Link Access</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isPublic ? 'Anyone with the link can view this note' : 'Only you can view this note'}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleShare}
            disabled={loading}
            className={`btn btn-sm ${isPublic ? 'btn-primary' : 'btn-secondary'}`}
          >
            {isPublic ? 'Enabled' : 'Enable Link'}
          </button>
        </div>

        {/* Share Link Field */}
        {isPublic && publicUrl && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Public Access Link</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="form-input"
                style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)' }}
              />
              <button
                onClick={handleCopyLink}
                className="btn btn-secondary"
                style={{ minWidth: '100px', gap: '0.4rem' }}
              >
                {copied ? <Check size={14} style={{ color: 'var(--emerald-500)' }} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Done
          </button>
          {isPublic && publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Open Link
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
