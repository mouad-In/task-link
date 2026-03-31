import api from './axiosInstance';

// ================= AUTH =================
export const authService = {
  login: async (data) => {
    const res = await api.post('/login', data);
    return res.data;
  },

  register: async (data) => {
    const res = await api.post('/register', data);
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/logout');
    return res.data;
  },

  getUser: async () => {
    const res = await api.get('/user');
    return res.data;
  },
};

// ================= USERS =================
export const userService = {
  getAllUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  updateUser: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  getWorkers: async () => {
    const res = await api.get('/workers');
    return res.data;
  },
};

// ================= TASKS =================
export const taskService = {
  getAllTasks: async () => {
    const res = await api.get('/tasks');
    return res.data;
  },

  getTaskById: async (id) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  createTask: async (data) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },

  updateTask: async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data;
  },

  deleteTask: async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
};

// ================= APPLICATIONS =================
export const applicationService = {
  createApplication: async (data) => {
    const res = await api.post('/applications', data);
    return res.data;
  },

  getApplicationsByTask: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/applications`);
    return res.data;
  },
};

// ================= MESSAGES =================
export const messageService = {
  getMessages: async (conversationId) => {
    const res = await api.get(`/conversations/${conversationId}/messages`);
    return res.data;
  },

  sendMessage: async (data) => {
    const res = await api.post('/messages', data);
    return res.data;
  },
};

// ================= REVIEWS =================
export const reviewService = {
  createReview: async (data) => {
    const res = await api.post('/reviews', data);
    return res.data;
  },

  getReviewsByTask: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/reviews`);
    return res.data;
  },
};