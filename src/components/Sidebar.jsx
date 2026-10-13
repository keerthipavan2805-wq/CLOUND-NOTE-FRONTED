import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Star,
  Folder,
  Plus,
  LayoutDashboard,
  User,
  LogOut,
  Moon,
  Sun,
  Hash,
  X,
  Trash2,
  Layers
} from 'lucide-react';

const Sidebar = ({
  categories = [],
  activeCategory,
  onSelectCategory,
  onOpenNewCategory,
  onNewNote,
  counts = {}
}) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.15rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            padding: '5px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <FileText size={18} />
          </div>
          <span style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>CloudNote</span>
        </NavLink>
      </div>

      <div style={{ padding: '1rem 0.85rem 0' }}>
        <button
          onClick={onNewNote}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' }}
        >
          <Plus size={18} />
          <span>Create Note</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-item-left">
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </div>
        </NavLink>

        <NavLink
          to="/notes"
          className={({ isActive }) => `sidebar-item ${isActive && !activeCategory ? 'active' : ''}`}
          onClick={() => onSelectCategory && onSelectCategory(null)}
        >
          <div className="sidebar-item-left">
            <FileText size={17} />
            <span>All Notes</span>
          </div>
          {counts.totalNotes !== undefined && (
            <span className="sidebar-count">{counts.totalNotes}</span>
          )}
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-item-left">
            <Star size={17} style={{ color: '#f59e0b' }} />
            <span>Favorites</span>
          </div>
          {counts.favoriteNotes !== undefined && (
            <span className="sidebar-count">{counts.favoriteNotes}</span>
          )}
        </NavLink>

        <NavLink
          to="/study"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-item-left">
            <span style={{ color: 'var(--primary-600)', display: 'inline-flex' }}>
              <Layers size={17} />
            </span>
            <span>Study & Recall</span>
          </div>
        </NavLink>

        <NavLink
          to="/trash"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-item-left">
            <Trash2 size={17} style={{ color: 'var(--text-muted)' }} />
            <span>Trash</span>
          </div>
          {counts.trashCount !== undefined && counts.trashCount > 0 && (
            <span className="sidebar-count" style={{ color: 'var(--rose-500)' }}>{counts.trashCount}</span>
          )}
        </NavLink>

        {/* Categories Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '0.5rem' }}>
          <div className="sidebar-section-title" style={{ padding: '1rem 0 0.4rem 0.85rem' }}>Categories</div>
          {onOpenNewCategory && (
            <button
              onClick={onOpenNewCategory}
              className="btn-icon"
              title="Add Category"
              style={{ padding: '4px', marginTop: '0.6rem' }}
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {categories.length === 0 ? (
          <div style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No categories yet
          </div>
        ) : (
          categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className={`sidebar-item ${activeCategory === cat.id ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <div className="sidebar-item-left">
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: cat.color || '#6366f1',
                    display: 'inline-block'
                  }}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                  {cat.name}
                </span>
              </div>
              <span className="sidebar-count">{cat.noteCount || 0}</span>
            </button>
          ))
        )}

        <div className="sidebar-section-title">Account</div>
        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-item-left">
            <User size={17} />
            <span>My Profile</span>
          </div>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={handleLogout}
            className="btn-icon"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
