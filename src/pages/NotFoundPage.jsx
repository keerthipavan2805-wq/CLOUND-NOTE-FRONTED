import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-50)',
        color: 'var(--primary-600)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <FileQuestion size={36} />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>404</h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
        The note or page you are looking for doesn't exist, has been removed, or was moved to another folder.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn btn-primary">
          <Home size={16} />
          <span>{isAuthenticated ? 'Go to Dashboard' : 'Back to Home'}</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
