import api from './axiosInstance';

// Helper to init Sanctum CSRF cookie
export const initSanctumCsrf = async () => {
  await api.get('/sanctum/csrf-cookie');
};

// Auth Service - Laravel Sanctum standard
export const authService = {
  async login(credentials) {
    await initSanctumCsrf();
    const response = await api.post('/login', credentials);
    const { data: user } = response;
    // Assume Laravel returns user + token
    if (user.token) {
      localStorage.setItem('user', JSON.stringify({ ...user, token: user.token }));
    }
    return user;
  },

  async register(userData) {
    await initSanctumCsrf();
    const response = await api.post('/register', userData);
    const { data: user } = response;
    if (user.token) {
      localStorage.setItem('user', JSON.stringify({ ...user, token: user.token }));
    }
    return user;
  },
};

// User Service
export const userService = {
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data.map(({ password, ...user }) => user); // Strip password if present
  },

  async getUserById(userId) {
    const response = await api.get(`/users/${userId}`);
    const { password, ...user } = response.data;
    return user;
  },

  async updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}`, userData);
    const { password, ...user } = response.data;
    localStorage.setItem('user', JSON.stringify({ ...user, token: JSON.parse(localStorage.getItem('user')).token }));
    return user;
  },

  async getWorkers() {
    const response = await api.get('/workers');
    return response.data.map(({ password, ...user }) => user);
  },

  async getCurrentUser() {
    const response = await api.get('/user');
    const { password, ...user } = response.data;
    return user;
  },
};

// Task Service
export const taskService = {
  async getAllTasks() {
    const response = await api.get('/tasks');
    return response.data;
  },

  async getTaskById(taskId) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    await api.delete(`/tasks/${taskId}`);
    return true;
  },

  async assignWorker(taskId, workerId) {
    const response = await api.post(`/tasks/${taskId}/assign/${workerId}`);
    return response.data;
  },

  async getTasksByClient(clientId) {
    const response = await api.get(`/tasks?client_id=${clientId}`);
    return response.data;
  },

  async getTasksByWorker(workerId) {
    const response = await api.get(`/tasks?worker_id=${workerId}`);
    return response.data;
  },

  async getPublishedTasks() {
    const response = await api.get('/tasks?status=published');
    return response.data;
  },

  async getComments(taskId) {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  async addComment(taskId, commentData) {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    return response.data;
  },
};

// Application Service
export const applicationService = {
  async getAllApplications() {
    const response = await api.get('/applications');
    return response.data;
  },

  async getApplicationsByTask(taskId) {
    const response = await api.get(`/tasks/${taskId}/applications`);
    return response.data;
  },

  async getApplicationsByWorker(workerId) {
    const response = await api.get(`/applications?worker_id=${workerId}`);
    return response.data;
  },

  async createApplication(applicationData) {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  async updateApplicationStatus(applicationId, status) {
    const response = await api.patch(`/applications/${applicationId}`, { status });
    return response.data;
  },
};

// Message Service
export const messageService = {
  async getConversations(userId) {
    const response = await api.get(`/messages/conversations/${userId}`);
    return response.data;
  },

  async getMessages(conversationId) {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  },

  async sendMessage(messageData) {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  async markAsRead(conversationId) {
    await api.patch(`/messages/${conversationId}/read`);
    return true;
  },

  async getOrCreateConversation(participant1Id, participant2Id) {
    const response = await api.post('/messages/conversations', { participant1Id, participant2Id });
    return response.data;
  },
};

// Review Service
export const reviewService = {
  async getAllReviews() {
    const response = await api.get('/reviews');
    return response.data;
  },

  async getReviewsByUser(userId) {
    const response = await api.get(`/reviews?reviewee_id=${userId}`);
    return response.data;
  },

  async getReviewsByTask(taskId) {
    const response = await api.get(`/tasks/${taskId}/reviews`);
    return response.data;
  },

  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
};

