import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Save,
  Star,
  Pin,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  Edit3,
  Tag as TagIcon,
  Folder,
  Plus,
  Mic,
  MicOff,
  Sparkles,
  Download,
  Upload,
  Share2,
  Calendar,
  Layers
} from 'lucide-react';
import noteService from '../services/noteService';
import AiAssistantModal from './AiAssistantModal';
import ShareModal from './ShareModal';

const NoteEditor = ({
  note,
  categories = [],
  onClose,
  onSaveSuccess,
  onTrashRequest,
  onOpenNewCategory
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [favorite, setFavorite] = useState(note?.favorite || false);
  const [pinned, setPinned] = useState(note?.pinned || false);
  const [categoryId, setCategoryId] = useState(note?.categoryId || '');
  const [tags, setTags] = useState(note?.tags ? Array.from(note?.tags) : []);
  const [tagInput, setTagInput] = useState('');
  const [reminderDate, setReminderDate] = useState(note?.reminderDate ? note.reminderDate.substring(0, 16) : '');

  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImportingPdf, setIsImportingPdf] = useState(false);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const initialNoteRef = useRef({
    title: note?.title || '',
    content: note?.content || '',
    favorite: note?.favorite || false,
    pinned: note?.pinned || false,
    categoryId: note?.categoryId || '',
    tags: note?.tags ? Array.from(note?.tags) : [],
    reminderDate: note?.reminderDate ? note.reminderDate.substring(0, 16) : ''
  });

  const noteIdRef = useRef(note?.id || null);
  const debounceTimerRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setContent((prev) => (prev ? prev + ' ' + transcript.trim() : transcript.trim()));
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Could not start speech recognition:', err);
      }
    }
  };

  // Check if form has unsaved modifications
  const hasChanges = useCallback(() => {
    const init = initialNoteRef.current;
    if (title.trim() !== init.title.trim()) return true;
    if (content !== init.content) return true;
    if (favorite !== init.favorite) return true;
    if (pinned !== init.pinned) return true;
    if ((categoryId || null) !== (init.categoryId || null)) return true;
    if ((reminderDate || '') !== (init.reminderDate || '')) return true;

    const currentTags = [...tags].sort().join(',');
    const initTags = [...init.tags].sort().join(',');
    if (currentTags !== initTags) return true;

    return false;
  }, [title, content, favorite, pinned, categoryId, tags, reminderDate]);

  // Save Note Function
  const saveNote = useCallback(async (isAutoSave = false) => {
    if (!title.trim() && !content.trim()) return;
    if (isAutoSave && !hasChanges()) return;

    setSaveStatus('saving');

    const payload = {
      title: title.trim() || 'Untitled Note',
      content: content,
      favorite,
      pinned,
      categoryId: categoryId ? Number(categoryId) : null,
      tags: tags,
      color: '#ffffff',
      reminderDate: reminderDate ? reminderDate + ':00' : null
    };

    try {
      let savedNote;
      if (noteIdRef.current) {
        const res = await noteService.updateNote(noteIdRef.current, payload);
        savedNote = res.data;
      } else {
        const res = await noteService.createNote(payload);
        savedNote = res.data;
        noteIdRef.current = savedNote.id;
      }

      initialNoteRef.current = {
        title: savedNote.title,
        content: savedNote.content,
        favorite: savedNote.favorite,
        pinned: savedNote.pinned,
        categoryId: savedNote.categoryId || '',
        tags: savedNote.tags ? Array.from(savedNote.tags) : [],
        reminderDate: savedNote.reminderDate ? savedNote.reminderDate.substring(0, 16) : ''
      };

      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      if (onSaveSuccess) onSaveSuccess(savedNote);
    } catch (err) {
      console.error('Failed to save note:', err);
      setSaveStatus('error');
    }
  }, [title, content, favorite, pinned, categoryId, tags, reminderDate, hasChanges, onSaveSuccess]);

  // Debounced auto-save hook
  useEffect(() => {
    if (!hasChanges()) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveNote(true);
    }, 1200);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [title, content, favorite, pinned, categoryId, tags, reminderDate, hasChanges, saveNote]);

  // PDF Text Import Handler
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingPdf(true);
    try {
      const res = await noteService.extractPdfText(file);
      if (res.success && res.data) {
        const extracted = res.data.extractedText;
        const importedTitle = file.name.replace(/\.pdf$/i, '');
        if (!title.trim()) setTitle(importedTitle);
        setContent((prev) => (prev ? prev + '\n\n---\n### 📄 Imported from ' + file.name + '\n\n' + extracted : extracted));
      }
    } catch (err) {
      console.error('PDF extraction failed:', err);
      alert('Failed to extract text from PDF: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsImportingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // PDF Export Download Handler
  const handleExportPdf = async () => {
    if (!noteIdRef.current) {
      await saveNote(false);
    }
    if (noteIdRef.current) {
      try {
        await noteService.downloadPdf(noteIdRef.current, title || 'note');
      } catch (err) {
        console.error('PDF export failed:', err);
        alert('Failed to export note as PDF.');
      }
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^[#,]/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="editor-container"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '94%', maxWidth: '1050px', height: '92vh' }}
      >
        {/* Editor Top Bar */}
        <div className="editor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Star & Pin */}
            <button
              onClick={() => setFavorite(!favorite)}
              className="btn-icon"
              style={{ color: favorite ? '#f59e0b' : 'var(--text-muted)' }}
              title={favorite ? 'Favorited' : 'Add to Favorites'}
            >
              <Star size={19} fill={favorite ? '#f59e0b' : 'none'} />
            </button>

            <button
              onClick={() => setPinned(!pinned)}
              className="btn-icon"
              style={{ color: pinned ? 'var(--primary-600)' : 'var(--text-muted)' }}
              title={pinned ? 'Pinned to top' : 'Pin note'}
            >
              <Pin size={19} fill={pinned ? 'currentColor' : 'none'} style={{ transform: 'rotate(45deg)' }} />
            </button>

            {/* Voice Dictation Button */}
            <button
              onClick={toggleSpeechRecognition}
              className="btn-icon"
              style={{
                color: isListening ? 'var(--rose-500)' : 'var(--text-muted)',
                backgroundColor: isListening ? '#fee2e2' : 'transparent'
              }}
              title={isListening ? 'Stop Voice Dictation' : 'Start Voice Dictation (Speech-to-Text)'}
            >
              {isListening ? <MicOff size={19} /> : <Mic size={19} />}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem'
              }}
              title="AI Study Assistant (Summarize, Flashcards, Quiz)"
            >
              <Sparkles size={14} />
              <span>AI Assistant</span>
            </button>

            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
              {saveStatus === 'saving' && (
                <>
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 size={13} style={{ color: 'var(--emerald-500)' }} />
                  <span>{lastSavedTime ? `Saved ${lastSavedTime}` : 'Saved'}</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle size={13} style={{ color: 'var(--rose-500)' }} />
                  <span style={{ color: 'var(--rose-500)' }}>Sync error</span>
                </>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Hidden PDF file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={handlePdfUpload}
            />

            {/* Import PDF */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImportingPdf}
              className="btn-icon"
              title="Import & Extract PDF text into note"
            >
              {isImportingPdf ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={17} />}
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPdf}
              className="btn-icon"
              title="Export & Download as PDF document"
            >
              <Download size={17} />
            </button>

            {/* Share Public Link */}
            {noteIdRef.current && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="btn-icon"
                title="Share public read-only link"
              >
                <Share2 size={17} />
              </button>
            )}

            {/* Mode Switcher */}
            <div className="editor-tabs">
              <button
                className={`editor-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Edit3 size={13} />
                  <span>Write</span>
                </div>
              </button>
              <button
                className={`editor-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Eye size={13} />
                  <span>Preview</span>
                </div>
              </button>
            </div>

            <button
              onClick={() => saveNote(false)}
              className="btn btn-primary btn-sm"
              disabled={saveStatus === 'saving'}
            >
              <Save size={14} />
              <span>Save</span>
            </button>

            {noteIdRef.current && onTrashRequest && (
              <button
                onClick={() => onTrashRequest(note)}
                className="btn-icon"
                title="Move note to trash"
                style={{ color: 'var(--rose-500)' }}
              >
                <Trash2 size={17} />
              </button>
            )}

            <button onClick={onClose} className="btn-icon" title="Close">
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Note Title */}
        <input
          type="text"
          className="editor-title-input"
          placeholder="Note Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        {/* Meta Bar */}
        <div className="editor-meta-bar">
          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Folder size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="form-input"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto', minWidth: '130px' }}
            >
              <option value="">No Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {onOpenNewCategory && (
              <button
                type="button"
                onClick={onOpenNewCategory}
                className="btn-icon"
                title="New Category"
                style={{ padding: '4px' }}
              >
                <Plus size={13} />
              </button>
            )}
          </div>

          {/* Study Reminder Due Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="datetime-local"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="form-input"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.775rem', width: 'auto' }}
              title="Study Reminder / Revision Due Date"
            />
          </div>

          {/* Tags Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', flex: 1 }}>
            <TagIcon size={14} style={{ color: 'var(--text-muted)' }} />
            {tags.map((t, idx) => (
              <span key={idx} className="badge tag-badge" style={{ gap: '0.3rem' }}>
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  style={{ color: 'var(--text-muted)', lineHeight: 1 }}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Tag + Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                minWidth: '100px'
              }}
            />
          </div>
        </div>

        {/* Editor Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
          {activeTab === 'edit' ? (
            <textarea
              className="editor-textarea"
              placeholder="Start typing your study notes in Markdown... (supports headings, bold, italics, checklists, ```code blocks, tables, and live speech dictation)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ flex: 1, minHeight: '380px' }}
            />
          ) : (
            <div className="markdown-preview" style={{ flex: 1 }}>
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem 0' }}>
                  No content to preview. Write notes in Markdown mode.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        note={{ id: noteIdRef.current, title, content }}
        onApplyContent={(improvedText) => {
          setContent(improvedText);
        }}
        onSaveFlashcards={() => {
          if (onSaveSuccess) onSaveSuccess({ ...note, id: noteIdRef.current });
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        note={{ id: noteIdRef.current, title, isPublic: note?.isPublic, shareToken: note?.shareToken }}
        onShareUpdated={(updated) => {
          if (onSaveSuccess) onSaveSuccess(updated);
        }}
      />
    </div>
  );
};

export default NoteEditor;
