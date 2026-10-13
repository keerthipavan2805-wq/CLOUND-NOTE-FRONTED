import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  X,
  FileText,
  Layers,
  HelpCircle,
  Wand2,
  Copy,
  Check,
  CheckCircle2,
  Loader2,
  ArrowRight
} from 'lucide-react';
import noteService from '../services/noteService';

const AiAssistantModal = ({ isOpen, onClose, note, onApplyContent, onSaveFlashcards }) => {
  if (!isOpen || !note) return null;

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'flashcards' | 'quiz' | 'improve'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAction = async (actionType) => {
    setActiveTab(actionType);
    setLoading(true);
    setResult(null);
    setSavedSuccess(false);

    try {
      const content = `${note.title || ''}\n\n${note.content || ''}`;
      let res;
      if (actionType === 'summary') {
        res = await noteService.aiSummarize(content);
        setResult(res.data);
      } else if (actionType === 'flashcards') {
        res = await noteService.aiFlashcards(content);
        setResult(res.data);
      } else if (actionType === 'quiz') {
        res = await noteService.aiQuiz(content);
        setResult(res.data);
      } else if (actionType === 'improve') {
        res = await noteService.aiImprove(content);
        setResult(res.data);
      }
    } catch (err) {
      console.error('AI Error:', err);
      setResult('Failed to process with AI assistant: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCards = async () => {
    if (activeTab === 'flashcards' && Array.isArray(result) && note.id) {
      try {
        const jsonStr = JSON.stringify(result);
        await noteService.saveFlashcards(note.id, jsonStr);
        setSavedSuccess(true);
        if (onSaveFlashcards) onSaveFlashcards(jsonStr);
      } catch (err) {
        console.error('Failed to save flashcards:', err);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              padding: '6px',
              borderRadius: '8px',
              color: '#fff',
              display: 'flex'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Study Assistant</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Powered analysis for "{note.title || 'Untitled Note'}"
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Feature Tabs Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.4rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.25rem'
        }}>
          <button
            onClick={() => handleAction('summary')}
            className={`btn btn-sm ${activeTab === 'summary' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem' }}
          >
            <FileText size={14} />
            <span>Summary</span>
          </button>
          <button
            onClick={() => handleAction('flashcards')}
            className={`btn btn-sm ${activeTab === 'flashcards' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem' }}
          >
            <Layers size={14} />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => handleAction('quiz')}
            className={`btn btn-sm ${activeTab === 'quiz' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem' }}
          >
            <HelpCircle size={14} />
            <span>Quiz</span>
          </button>
          <button
            onClick={() => handleAction('improve')}
            className={`btn btn-sm ${activeTab === 'improve' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem' }}
          >
            <Wand2 size={14} />
            <span>Polish</span>
          </button>
        </div>

        {/* Content Result Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          minHeight: '260px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem'
        }}>
          {loading ? (
            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '0.9rem' }}>Analyzing note & generating {activeTab}...</p>
            </div>
          ) : result ? (
            <div>
              {activeTab === 'summary' && typeof result === 'string' && (
                <div className="markdown-preview" style={{ padding: 0, minHeight: 'auto' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              )}

              {activeTab === 'improve' && typeof result === 'string' && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-600)', marginBottom: '0.75rem' }}>
                    Polished & Structured Note Content:
                  </div>
                  <div className="markdown-preview" style={{ padding: 0, minHeight: 'auto' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                  </div>
                </div>
              )}

              {activeTab === 'flashcards' && Array.isArray(result) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Generated {result.length} Study Flashcards
                  </div>
                  {result.map((card, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem 1rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-600)', marginBottom: '0.35rem' }}>
                        Q: {card.question}
                      </div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        A: {card.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'quiz' && Array.isArray(result) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                        {idx + 1}. {q.question}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {q.options?.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            style={{
                              padding: '0.4rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.825rem',
                              backgroundColor: oIdx === q.answerIndex ? 'var(--primary-50)' : 'var(--bg-secondary)',
                              color: oIdx === q.answerIndex ? 'var(--primary-600)' : 'var(--text-secondary)',
                              fontWeight: oIdx === q.answerIndex ? 600 : 400
                            }}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.answerIndex && ' ✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Sparkles size={24} style={{ color: 'var(--primary-500)', opacity: 0.6 }} />
              <p style={{ fontSize: '0.85rem' }}>Select an AI capability above to analyze this note.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {savedSuccess && (
              <span style={{ fontSize: '0.8rem', color: 'var(--emerald-500)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} /> Flashcards saved to note!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {result && (
              <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            {activeTab === 'flashcards' && Array.isArray(result) && (
              <button onClick={handleSaveCards} className="btn btn-primary btn-sm">
                <span>Save to Flashcards</span>
              </button>
            )}

            {activeTab === 'improve' && typeof result === 'string' && onApplyContent && (
              <button
                onClick={() => {
                  onApplyContent(result);
                  onClose();
                }}
                className="btn btn-primary btn-sm"
              >
                <span>Apply to Note</span>
              </button>
            )}

            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantModal;
