import api from './api';

export const complaintService = {
  getComplaints: async (params = {}) => {
    const res = await api.get('/complaints', { params });
    return res.data;
  },

  getComplaintById: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data.data;
  },

  createComplaint: async (data) => {
    const res = await api.post('/complaints', data);
    return res.data;
  },

  updateComplaint: async (id, data) => {
    const res = await api.put(`/complaints/${id}`, data);
    return res.data;
  },

  updateStatus: async (id, status, comment) => {
    const res = await api.patch(`/complaints/${id}/status`, { status, comment });
    return res.data;
  },

  updatePriority: async (id, priority, comment) => {
    const res = await api.patch(`/complaints/${id}/priority`, { priority, comment });
    return res.data;
  },

  assignStaff: async (id, assigned_staff_id, comment) => {
    const res = await api.patch(`/complaints/${id}/assign`, { assigned_staff_id, comment });
    return res.data;
  },

  addComment: async (id, message, attachments = []) => {
    const res = await api.post(`/complaints/${id}/comments`, { message, attachments });
    return res.data.data;
  },

  resolveComplaint: async (id) => {
    const res = await api.post(`/complaints/${id}/resolve`);
    return res.data;
  },

  reopenComplaint: async (id) => {
    const res = await api.post(`/complaints/${id}/reopen`);
    return res.data;
  },

  closeComplaint: async (id) => {
    const res = await api.post(`/complaints/${id}/close`);
    return res.data;
  },

  bulkAssign: async (complaint_ids, assigned_staff_id) => {
    const res = await api.post('/complaints/bulk/assign', { complaint_ids, assigned_staff_id });
    return res.data;
  },

  bulkStatus: async (complaint_ids, status) => {
    const res = await api.post('/complaints/bulk/status', { complaint_ids, status });
    return res.data;
  },

  deleteComplaint: async (id) => {
    const res = await api.delete(`/complaints/${id}`);
    return res.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/complaints/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  submitFeedback: async (complaint_id, rating, comment) => {
    const res = await api.post('/feedback', { complaint_id, rating, comment });
    return res.data;
  }
};
