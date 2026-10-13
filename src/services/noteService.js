import api from './api';

export const noteService = {
  // Notes CRUD & Filtering
  async getNotes(params = {}) {
    const res = await api.get('/notes', { params });
    return res.data;
  },

  async getNoteById(id) {
    const res = await api.get(`/notes/${id}`);
    return res.data;
  },

  async createNote(noteData) {
    const res = await api.post('/notes', noteData);
    return res.data;
  },

  async updateNote(id, noteData) {
    const res = await api.put(`/notes/${id}`, noteData);
    return res.data;
  },

  async toggleFavorite(id) {
    const res = await api.patch(`/notes/${id}/favorite`);
    return res.data;
  },

  async deleteNotePermanently(id) {
    const res = await api.delete(`/notes/${id}`);
    return res.data;
  },

  async moveToTrash(id) {
    const res = await api.patch(`/notes/${id}/trash`);
    return res.data;
  },

  async restoreFromTrash(id) {
    const res = await api.patch(`/notes/${id}/restore`);
    return res.data;
  },

  async getTrashNotes() {
    const res = await api.get('/notes/trash');
    return res.data;
  },

  async emptyTrash() {
    const res = await api.delete('/notes/trash');
    return res.data;
  },

  async toggleArchive(id) {
    const res = await api.patch(`/notes/${id}/archive`);
    return res.data;
  },

  async getArchivedNotes() {
    const res = await api.get('/notes/archived');
    return res.data;
  },

  async shareNote(id, isPublic = true) {
    const res = await api.post(`/notes/${id}/share`, { isPublic });
    return res.data;
  },

  async getPublicNote(shareToken) {
    const res = await api.get(`/public/notes/${shareToken}`);
    return res.data;
  },

  async saveFlashcards(id, flashcardsJson) {
    const res = await api.post(`/notes/${id}/flashcards`, { flashcardsJson });
    return res.data;
  },

  async getStudyNotes() {
    const res = await api.get('/notes/study');
    return res.data;
  },

  async getStats() {
    const res = await api.get('/notes/stats');
    return res.data;
  },

  // Categories
  async getCategories() {
    const res = await api.get('/categories');
    return res.data;
  },

  async createCategory(categoryData) {
    const res = await api.post('/categories', categoryData);
    return res.data;
  },

  async updateCategory(id, categoryData) {
    const res = await api.put(`/categories/${id}`, categoryData);
    return res.data;
  },

  async deleteCategory(id) {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },

  // Tags
  async getTags() {
    const res = await api.get('/tags');
    return res.data;
  },

  // Document PDF Extraction & Export
  async extractPdfText(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/extract-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async downloadPdf(noteId, title = 'note') {
    const res = await api.get(`/documents/export-pdf/${noteId}`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // AI Study Assistant Services
  async aiSummarize(content) {
    const res = await api.post('/ai/summarize', { content });
    return res.data;
  },

  async aiFlashcards(content) {
    const res = await api.post('/ai/flashcards', { content });
    return res.data;
  },

  async aiQuiz(content) {
    const res = await api.post('/ai/quiz', { content });
    return res.data;
  },

  async aiImprove(content) {
    const res = await api.post('/ai/improve', { content });
    return res.data;
  },
};

export default noteService;
