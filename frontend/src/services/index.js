import api from './api';
export { authService } from './authService';
export { complaintService } from './complaintService';

export const userService = {
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data;
  },
  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },
  createUser: async (data) => {
    const res = await api.post('/users', data);
    return res.data.data;
  },
  updateUser: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },
  changeStatus: async (id, status) => {
    const res = await api.patch(`/users/${id}/status`, { status });
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
  getUserComplaints: async (id) => {
    const res = await api.get(`/users/${id}/complaints`);
    return res.data.items;
  }
};

export const staffService = {
  getStaff: async () => {
    const res = await api.get('/staff');
    return res.data.items;
  },
  getStaffById: async (id) => {
    const res = await api.get(`/staff/${id}`);
    return res.data.data;
  },
  createStaff: async (data) => {
    const res = await api.post('/staff', data);
    return res.data.data;
  },
  updateStaff: async (id, data) => {
    const res = await api.put(`/staff/${id}`, data);
    return res.data.data;
  },
  deleteStaff: async (id) => {
    const res = await api.delete(`/staff/${id}`);
    return res.data;
  },
  getStaffComplaints: async (id) => {
    const res = await api.get(`/staff/${id}/complaints`);
    return res.data.items;
  }
};

export const departmentService = {
  getDepartments: async () => {
    const res = await api.get('/departments');
    return res.data.items;
  },
  createDepartment: async (data) => {
    const res = await api.post('/departments', data);
    return res.data.data;
  },
  updateDepartment: async (id, data) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data.data;
  },
  deleteDepartment: async (id) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  }
};

export const categoryService = {
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data.items;
  },
  createCategory: async (data) => {
    const res = await api.post('/categories', data);
    return res.data.data;
  },
  updateCategory: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data.data;
  },
  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  }
};

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  }
};

export const analyticsService = {
  getOverview: async (params = {}) => {
    const res = await api.get('/analytics/overview', { params });
    return res.data.data;
  },
  getTrends: async (params = {}) => {
    const res = await api.get('/analytics/complaint-trends', { params });
    return res.data.data;
  },
  getStatusDist: async (params = {}) => {
    const res = await api.get('/analytics/status-distribution', { params });
    return res.data.data;
  },
  getPriorityDist: async (params = {}) => {
    const res = await api.get('/analytics/priority-distribution', { params });
    return res.data.data;
  },
  getCategoryDist: async (params = {}) => {
    const res = await api.get('/analytics/category-distribution', { params });
    return res.data.data;
  },
  getDeptPerformance: async (params = {}) => {
    const res = await api.get('/analytics/department-performance', { params });
    return res.data.data;
  },
  getResolutionMetrics: async (params = {}) => {
    const res = await api.get('/analytics/resolution-time', { params });
    return res.data.data;
  },
  getSLAMetrics: async (params = {}) => {
    const res = await api.get('/analytics/sla', { params });
    return res.data.data;
  },
  getStaffPerformance: async (params = {}) => {
    const res = await api.get('/analytics/staff-performance', { params });
    return res.data.data;
  },
  getUserMetrics: async (params = {}) => {
    const res = await api.get('/analytics/users', { params });
    return res.data.data;
  },
  getSatisfaction: async (params = {}) => {
    const res = await api.get('/analytics/satisfaction', { params });
    return res.data.data;
  },
  getAIInsights: async () => {
    const res = await api.get('/analytics/ai-insights');
    return res.data.data;
  }
};

export const reportService = {
  getSummary: async () => {
    const res = await api.get('/reports/summary');
    return res.data.data;
  },
  getFeedback: async () => {
    const res = await api.get('/feedback');
    return res.data.items;
  },
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/audit-logs', { params });
    return res.data;
  }
};

export const settingService = {
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data.data;
  },
  updateSettings: async (data) => {
    const res = await api.put('/settings', data);
    return res.data.data;
  }
};
