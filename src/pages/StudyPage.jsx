import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import noteService from '../services/noteService';
import {
  GraduationCap,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle,
  HelpCircle,
  Award,
  BookOpen
} from 'lucide-react';

const StudyPage = () => {
  const [studyNotes, setStudyNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const fetchStudyNotes = async () => {
    try {
      setLoading(true);
      const res = await noteService.getNotes();
      if (res.success && res.data) {
        setStudyNotes(res.data);
        if (res.data.length > 0) {
          selectNoteForStudy(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load study notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyNotes();
  }, []);

  const selectNoteForStudy = (note) => {
    setSelectedNote(note);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setQuizMode(false);
    setQuizSubmitted(false);
    setSelectedAnswers({});

    if (note.flashcardsJson) {
      try {
        const parsed = JSON.parse(note.flashcardsJson);
        setFlashcards(parsed);
      } catch (e) {
        generateCardsForNote(note);
      }
    } else {
      generateCardsForNote(note);
    }
  };

  const generateCardsForNote = async (note) => {
    try {
      const content = `${note.title || ''}\n\n${note.content || ''}`;
      const res = await noteService.aiFlashcards(content);
      if (res.success && res.data) {
        setFlashcards(res.data);
        if (note.id) {
          await noteService.saveFlashcards(note.id, JSON.stringify(res.data));
        }
      }
    } catch (err) {
      console.error('Failed to generate cards:', err);
    }
  };

  const handleStartQuiz = async () => {
    if (!selectedNote) return;
    setLoading(true);
    setQuizMode(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    try {
      const content = `${selectedNote.title || ''}\n\n${selectedNote.content || ''}`;
      const res = await noteService.aiQuiz(content);
      if (res.success && res.data) {
        setQuizQuestions(res.data);
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuizOption = (qIdx, oIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx });
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="page-container" style={{ maxWidth: '1000px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <GraduationCap size={24} style={{ color: 'var(--primary-600)' }} />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Study & Active Recall</h1>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Master concepts using flashcards and AI-generated practice quizzes
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setQuizMode(false)}
                className={`btn btn-sm ${!quizMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Layers size={15} />
                <span>Flashcard Deck</span>
              </button>
              <button
                onClick={handleStartQuiz}
                className={`btn btn-sm ${quizMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                <HelpCircle size={15} />
                <span>Practice Quiz</span>
              </button>
            </div>
          </div>

          {/* Note Selector Selector Carousel */}
          <div style={{ marginBottom: '1.5rem', overflowX: 'auto', display: 'flex', gap: '0.6rem', paddingBottom: '0.5rem' }}>
            {studyNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => selectNoteForStudy(note)}
                className={`btn btn-sm ${selectedNote?.id === note.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
              >
                <BookOpen size={13} />
                <span>{note.title || 'Untitled Note'}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
              Preparing study session...
            </div>
          ) : !selectedNote ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <GraduationCap size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No notes available for study mode</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Create some notes first in your workspace.</p>
            </div>
          ) : quizMode ? (
            /* Quiz Mode View */
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedNote.title} - Quiz</h2>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Answer all questions and submit to check your score</p>
                </div>
                {quizSubmitted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-50)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', color: 'var(--primary-600)', fontWeight: 700 }}>
                    <Award size={18} />
                    <span>Score: {quizScore} / {quizQuestions.length}</span>
                  </div>
                )}
              </div>

              {quizQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  Generating quiz questions...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  {quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                        {qIdx + 1}. {q.question}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
                        {q.options?.map((opt, oIdx) => {
                          const isSelected = selectedAnswers[qIdx] === oIdx;
                          const isCorrect = q.answerIndex === oIdx;
                          let optBg = 'var(--bg-surface)';
                          let optBorder = 'var(--border-subtle)';

                          if (quizSubmitted) {
                            if (isCorrect) {
                              optBg = '#d1fae5';
                              optBorder = '#10b981';
                            } else if (isSelected && !isCorrect) {
                              optBg = '#fee2e2';
                              optBorder = '#ef4444';
                            }
                          } else if (isSelected) {
                            optBg = 'var(--primary-50)';
                            optBorder = 'var(--primary-500)';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                              style={{
                                textAlign: 'left',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: optBg,
                                border: `1px solid ${optBorder}`,
                                fontSize: '0.85rem',
                                cursor: quizSubmitted ? 'default' : 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && q.explanation && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                          💡 <em>{q.explanation}</em>
                        </div>
                      )}
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="btn btn-primary"
                        disabled={Object.keys(selectedAnswers).length === 0}
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <button onClick={handleStartQuiz} className="btn btn-secondary">
                        <RotateCw size={15} />
                        <span>Retake Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Flashcards Mode View */
            <div>
              {flashcards.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No flashcards found for this note.</p>
                  <button onClick={() => generateCardsForNote(selectedNote)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    <Sparkles size={16} />
                    <span>Generate Flashcards Now</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Progress Indicator */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                    <span>Click card to flip</span>
                  </div>

                  {/* Interactive Flip Card */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{
                      width: '100%',
                      minHeight: '320px',
                      perspective: '1000px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      minHeight: '320px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-xl)',
                      border: '2px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '3rem 2.5rem',
                      textAlign: 'center',
                      transition: 'all 0.25s ease',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '1.25rem',
                        left: '1.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: isFlipped ? 'var(--emerald-500)' : 'var(--primary-600)'
                      }}>
                        {isFlipped ? 'Answer' : 'Question'}
                      </div>

                      <div style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.5rem',
                        color: 'var(--text-muted)'
                      }}>
                        <RotateCw size={16} />
                      </div>

                      <div style={{
                        fontSize: isFlipped ? '1.15rem' : '1.35rem',
                        fontWeight: 700,
                        lineHeight: 1.5,
                        color: 'var(--text-primary)',
                        maxWidth: '650px'
                      }}>
                        {isFlipped ? currentCard?.answer : currentCard?.question}
                      </div>

                      <div style={{
                        position: 'absolute',
                        bottom: '1.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>
                        {isFlipped ? 'Click to see question' : 'Click to reveal answer'}
                      </div>
                    </div>
                  </div>

                  {/* Card Deck Navigation */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '1.75rem' }}>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                      }}
                      disabled={currentCardIndex === 0}
                      className="btn btn-secondary"
                      style={{ padding: '0.6rem 1.25rem' }}
                    >
                      <ChevronLeft size={18} />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="btn btn-secondary"
                      style={{ padding: '0.6rem 1rem' }}
                      title="Flip card"
                    >
                      <RotateCw size={17} />
                    </button>

                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="btn btn-primary"
                      style={{ padding: '0.6rem 1.25rem' }}
                    >
                      <span>Next</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
