import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  FileText,
  Shield,
  Zap,
  Tag,
  Search,
  Lock,
  ArrowRight,
  CheckCircle,
  Database,
  Code
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-600)',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            border: '1px solid var(--primary-100)'
          }}>
            <Shield size={14} />
            <span>Full-Stack Spring Boot 3 & React 18 Application</span>
          </div>

          <h1 className="hero-title">
            Capture Thoughts.<br />
            <span className="hero-gradient">Organize With Confidence.</span>
          </h1>

          <p className="hero-subtitle">
            A secure, modern notes workspace engineered for students and developers.
            Featuring seamless Markdown rendering, real-time debounced auto-saving,
            multi-tenant JWT security, and instant keyword indexing.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Start Taking Notes Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              <span>Sign In to CloudNote</span>
            </Link>
          </div>

          {/* Interactive UI Mockup Showcase */}
          <div style={{
            marginTop: '3.5rem',
            maxWidth: '1000px',
            margin: '3.5rem auto 0',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            textAlign: 'left'
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                CloudNote Workspace - Live Session
              </span>
            </div>

            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="category-pill" style={{ backgroundColor: '#4f46e5' }}>Computer Science</span>
                  <span className="badge tag-badge">#Algorithms</span>
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Graph Traversal & BFS/DFS</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Breadth-First Search utilizes a FIFO Queue to visit neighbor nodes level-by-level with O(V + E) complexity.
                </p>
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--emerald-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={13} />
                  <span>Auto-saved 2s ago</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="category-pill" style={{ backgroundColor: '#059669' }}>Architecture</span>
                  <span className="badge tag-badge">#SpringBoot</span>
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>JWT Stateless Security Filter</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Spring Security 6 OncePerRequestFilter validates the Bearer token HMAC-SHA256 signature and populates SecurityContext.
                </p>
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--emerald-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={13} />
                  <span>Auto-saved 1m ago</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Code size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Markdown & Live Preview</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Full GitHub Flavored Markdown support. Write notes formatted with bold, italics, checklists, nested lists, and code blocks.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Real-Time Auto-Save</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Intelligent debounced synchronization saves your notes automatically as you type, avoiding redundant requests and network drops.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Multi-Tenant Security</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Built with Spring Security, BCrypt hashing, and strict user isolation. Notes and categories are completely private to your account.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Search size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Instant Search & Filters</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Locate any note in milliseconds. Filter by custom color-coded categories, tags, favorites, or search within content.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Database size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>MySQL 8 Persistence</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Engineered with normalized relational tables, foreign key constraints, JPA mappings, and optimized query indexes.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Engineered for Academics</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              A distraction-free, professional productivity interface designed specifically for university students and engineers.
            </p>
          </div>
        </section>
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>CloudNote &copy; 2026 - A Secure Full-Stack Notes Web Application. Developed with Java Spring Boot & React.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
