import axios from 'axios';
import { auth } from '../firebase/config';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  partner_id?: string;
}

export interface MotivationalNote {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface HistoryEntry {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
}

// API functions
export const apiService = {
  // User management
  setupUser: async (partnerEmail: string) => {
    const response = await api.post('/users/setup', null, {
      params: { partner_email: partnerEmail }
    });
    return response.data;
  },

  getUserProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Task management
  createTask: async (title: string, description?: string) => {
    const response = await api.post('/tasks', { title, description });
    return response.data;
  },

  getTodayTasks: async () => {
    const response = await api.get('/tasks/today');
    return response.data;
  },

  getPartnerTodayTasks: async () => {
    const response = await api.get('/tasks/partner/today');
    return response.data;
  },

  updateTask: async (taskId: string, completed: boolean) => {
    const response = await api.put(`/tasks/${taskId}`, { completed });
    return response.data;
  },

  deleteTask: async (taskId: string) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Motivational notes
  sendMotivationalNote: async (message: string) => {
    const response = await api.post('/motivational-notes', null, {
      params: { message }
    });
    return response.data;
  },

  getMotivationalNotes: async () => {
    const response = await api.get('/motivational-notes');
    return response.data;
  },

  // History
  getUserHistory: async () => {
    const response = await api.get('/history');
    return response.data;
  },
};

export default api;
