import { 
  users, 
  tasks, 
  applications, 
  conversations, 
  messages, 
  reviews 
} from './mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Auth Service
export const authService = {
  async login(credentials) {
    await delay(500);
    const user = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async register(userData) {
    await delay(500);
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }
    const newUser = {
      id: String(users.length + 1),
      ...userData,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.firstName}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
};

// User Service
export const userService = {
  async getAllUsers() {
    await delay(300);
    return users.map(({ password, ...user }) => user);
  },

  async getUserById(userId) {
    await delay(300);
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async updateUser(userId, userData) {
    await delay(300);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    users[userIndex] = { ...users[userIndex], ...userData };
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  },

  async getWorkers() {
    await delay(300);
    return users
      .filter(u => u.role === 'worker')
      .map(({ password, ...user }) => user);
  },
};

// Task Service
export const taskService = {
  async getAllTasks() {
    await delay(300);
    return [...tasks];
  },

  async getTaskById(taskId) {
    await delay(300);
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  },

  async createTask(taskData) {
    await delay(500);
    const newTask = {
      id: String(tasks.length + 1),
      ...taskData,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    return newTask;
  },

  async updateTask(taskId, taskData) {
    await delay(300);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    tasks[taskIndex] = { 
      ...tasks[taskIndex], 
      ...taskData,
      updatedAt: new Date().toISOString(),
    };
    return tasks[taskIndex];
  },

  async deleteTask(taskId) {
    await delay(300);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    tasks.splice(taskIndex, 1);
    return true;
  },

  async assignWorker(taskId, workerId) {
    await delay(300);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      workerId,
      status: 'assigned',
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return tasks[taskIndex];
  },

  async getTasksByClient(clientId) {
    await delay(300);
    return tasks.filter(t => t.clientId === clientId);
  },

  async getTasksByWorker(workerId) {
    await delay(300);
    return tasks.filter(t => t.workerId === workerId);
  },

  async getPublishedTasks() {
    await delay(300);
    return tasks.filter(t => t.status === 'published');
  },
};

// Application Service
export const applicationService = {
  async getAllApplications() {
    await delay(300);
    return [...applications];
  },

  async getApplicationsByTask(taskId) {
    await delay(300);
    return applications.filter(a => a.taskId === taskId);
  },

  async getApplicationsByWorker(workerId) {
    await delay(300);
    return applications.filter(a => a.workerId === workerId);
  },

  async createApplication(applicationData) {
    await delay(500);
    // Check if worker already applied
    const existingApp = applications.find(
      a => a.taskId === applicationData.taskId && a.workerId === applicationData.workerId
    );
    if (existingApp) {
      throw new Error('You have already applied to this task');
    }
    const newApplication = {
      id: String(applications.length + 1),
      ...applicationData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    applications.push(newApplication);
    return newApplication;
  },

  async updateApplicationStatus(applicationId, status) {
    await delay(300);
    const appIndex = applications.findIndex(a => a.id === applicationId);
    if (appIndex === -1) {
      throw new Error('Application not found');
    }
    applications[appIndex] = { 
      ...applications[appIndex], 
      status,
      updatedAt: new Date().toISOString(),
    };
    return applications[appIndex];
  },
};

// Message Service
export const messageService = {
  async getConversations(userId) {
    await delay(300);
    return conversations.filter(c => c.participants.includes(userId));
  },

  async getMessages(conversationId) {
    await delay(300);
    return messages.filter(m => m.conversationId === conversationId);
  },

  async sendMessage(messageData) {
    await delay(300);
    const newMessage = {
      id: `m${messages.length + 1}`,
      ...messageData,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
    
    // Update conversation
    const convIndex = conversations.findIndex(c => c.id === messageData.conversationId);
    if (convIndex !== -1) {
      conversations[convIndex].lastMessage = newMessage;
      conversations[convIndex].updatedAt = newMessage.createdAt;
    }
    
    return newMessage;
  },

  async markAsRead(conversationId) {
    await delay(200);
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      conversations[convIndex].unreadCount = 0;
    }
    return true;
  },

  async getOrCreateConversation(participant1Id, participant2Id) {
    await delay(300);
    let conversation = conversations.find(
      c => c.participants.includes(participant1Id) && c.participants.includes(participant2Id)
    );
    if (!conversation) {
      conversation = {
        id: String(conversations.length + 1),
        participants: [participant1Id, participant2Id],
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      conversations.push(conversation);
    }
    return conversation;
  },
};

// Review Service
export const reviewService = {
  async getAllReviews() {
    await delay(300);
    return [...reviews];
  },

  async getReviewsByUser(userId) {
    await delay(300);
    return reviews.filter(r => r.revieweeId === userId);
  },

  async getReviewsByTask(taskId) {
    await delay(300);
    return reviews.filter(r => r.taskId === taskId);
  },

  async createReview(reviewData) {
    await delay(500);
    // Check if review already exists
    const existingReview = reviews.find(
      r => r.taskId === reviewData.taskId && r.reviewerId === reviewData.reviewerId
    );
    if (existingReview) {
      throw new Error('You have already reviewed this task');
    }
    const newReview = {
      id: String(reviews.length + 1),
      ...reviewData,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    return newReview;
  },
};

