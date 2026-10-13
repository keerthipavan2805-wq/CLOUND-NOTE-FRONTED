import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import noteService from '../services/noteService';
import { Cloud, Calendar, Tag, Folder, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

const PublicNotePage = () => {
  const { shareToken } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        setLoading(true);
        const res = await noteService.getPublicNote(shareToken);
        if (res.success && res.data) {
          setNote(res.data);
        }
      } catch (err) {
        console.error('Failed to load shared note:', err);
        setError('This shared note was not found, is set to private, or the link has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedNote();
    }
  }, [shareToken]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Public Header */}
      <header className="navbar" style={{ padding: '0 2rem' }}>
        <Link to="/" className="brand-logo">
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            padding: '6px',
            borderRadius: '10px',
            display: 'flex',
            color: '#fff'
          }}>
            <Cloud size={20} />
          </div>
          <span>CloudNote</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={handleCopyLink} className="btn btn-secondary btn-sm">
            {copied ? <Check size={14} style={{ color: 'var(--emerald-500)' }} /> : <Copy size={14} />}
            <span>{copied ? 'Link Copied' : 'Share Link'}</span>
          </button>
          <Link to="/register" className="btn btn-primary btn-sm">
            <span>Create Your Free Account</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '860px', width: '100%', margin: '2rem auto', padding: '0 1.5rem', flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
            Loading shared note...
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Note Unavailable</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
            <Link to="/" className="btn btn-primary">Return to CloudNote</Link>
          </div>
        ) : note ? (
          <article className="card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <ShieldCheck size={16} />
              <span>Verified Public Read-Only Note</span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              {note.title || 'Untitled Note'}
            </h1>

            {/* Meta bar */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {note.categoryName && (
                <span className="category-pill" style={{ backgroundColor: note.categoryColor || '#4f46e5' }}>
                  <Folder size={12} />
                  <span>{note.categoryName}</span>
                </span>
              )}

              {note.tags && Array.from(note.tags).map((tag, idx) => (
                <span key={idx} className="badge tag-badge">
                  #{tag}
                </span>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
                <Calendar size={14} />
                <span>Updated {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Note Content */}
            <div className="markdown-preview" style={{ padding: 0 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content || '*No content*'}
              </ReactMarkdown>
            </div>
          </article>
        ) : null}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '1.5rem', textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
        Published with CloudNote — Secure Study & Notes Management Platform
      </footer>
    </div>
  );
};

export default PublicNotePage;
