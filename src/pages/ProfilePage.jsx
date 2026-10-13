import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import authService from '../services/authService';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Save,
  LogOut,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await authService.updateProfile(name.trim());
      if (res.success && res.data) {
        updateUser(res.data);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active Member';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="page-container" style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Account & Profile</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Manage your personal information, security, and credentials
            </p>
          </div>

          {successMsg && (
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#d1fae5',
              color: '#065f46',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid #a7f3d0'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca'
            }}>
              {errorMsg}
            </div>
          )}

          {/* User Profile Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name || 'User'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <Calendar size={13} />
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', opacity: 0.7, cursor: 'not-allowed' }}
                    value={user?.email || ''}
                    disabled
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & System Info Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} style={{ color: 'var(--primary-600)' }} />
              <span>Security & Encryption Details</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Lock size={15} style={{ color: 'var(--primary-600)' }} />
                  <span>Password Hashing</span>
                </div>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                  BCrypt cryptographic 10-round salted hash algorithm. Real passwords are never stored in plain text.
                </p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Shield size={15} style={{ color: 'var(--purple-600)' }} />
                  <span>Stateless Auth</span>
                </div>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                  HMAC SHA-256 JSON Web Tokens with 24-hour expiration validated on every Spring Security REST request.
                </p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Database size={15} style={{ color: 'var(--emerald-500)' }} />
                  <span>Data Isolation</span>
                </div>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                  Strict multi-tenant SQL constraints ensure notes and categories are isolated exclusively to your account.
                </p>
              </div>
            </div>
          </div>

          {/* Session Termination / Logout Card */}
          <div className="card" style={{ borderColor: '#fee2e2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--rose-500)' }}>Log Out of Session</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  End your current session on this browser device.
                </p>
              </div>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
