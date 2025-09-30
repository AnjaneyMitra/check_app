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
  priority?: 'low' | 'medium' | 'high';
  group_id?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
  friends?: string[];
  groups?: string[];
}

export interface Friend {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  from_user?: {
    id: string;
    email: string;
    display_name?: string;
    username?: string;
  };
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  invite_code: string;
  members: string[];
}

export interface GroupMember {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
}

export interface GroupTask {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  created_at: string;
  group_id: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export interface MotivationalNote {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  created_at: string;
  read: boolean;
  group_id?: string;
}

export interface HistoryEntry {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
}

export interface GroupProgress {
  group_id: string;
  group_name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  members_progress: {
    user_id: string;
    user_name: string;
    completed_tasks: number;
    total_tasks: number;
  }[];
}

// API functions
export const apiService = {
  // User management
  getUserProfile: async (): Promise<{user: UserProfile}> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (data: { display_name?: string; username?: string }): Promise<UserProfile> => {
    const response = await api.post('/users/setup', data);
    return response.data.user;
  },

  searchUsers: async (query: string): Promise<{users: Friend[]}> => {
    const response = await api.get('/users/search', { params: { query } });
    return response.data;
  },

  // Friend management
  sendFriendRequest: async (userEmail: string): Promise<FriendRequest> => {
    const response = await api.post('/friends/request', { user_email: userEmail });
    return response.data;
  },

  getFriendRequests: async (): Promise<{requests: FriendRequest[]}> => {
    const response = await api.get('/friends/requests');
    return response.data;
  },

  respondToFriendRequest: async (requestId: string, accept: boolean): Promise<{ message: string }> => {
    const response = await api.post(`/friends/requests/${requestId}/respond`, { accept });
    return response.data;
  },

  getFriends: async (): Promise<{friends: Friend[]}> => {
    const response = await api.get('/friends');
    return response.data;
  },

  getFriendsProgress: async (): Promise<any> => {
    const response = await api.get('/friends/progress');
    return response.data;
  },

  removeFriend: async (friendId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  },

  // Task management
  createTask: async (title: string, description?: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<Task> => {
    const response = await api.post('/tasks', { title, description, priority });
    return response.data;
  },

  getTodayTasks: async (): Promise<{tasks: Task[], date: string}> => {
    const response = await api.get('/tasks/today');
    return response.data;
  },

  getFriendTasks: async (friendId: string): Promise<Task[]> => {
    const response = await api.get(`/tasks/friend/${friendId}`);
    return response.data;
  },

  updateTask: async (taskId: string, data: { completed?: boolean; title?: string; description?: string; priority?: 'low' | 'medium' | 'high' }): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Group management
  createGroup: async (name: string, description?: string): Promise<Group> => {
    const response = await api.post('/groups', { name, description });
    return response.data;
  },

  joinGroup: async (inviteCode: string): Promise<Group> => {
    const response = await api.post('/groups/join', { invite_code: inviteCode });
    return response.data;
  },

  getGroups: async (): Promise<{groups: Group[]}> => {
    const response = await api.get('/groups');
    return response.data;
  },

  getGroup: async (groupId: string): Promise<Group> => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  getGroupMembers: async (groupId: string): Promise<GroupMember[]> => {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  },

  leaveGroup: async (groupId: string): Promise<{ message: string }> => {
    const response = await api.post(`/groups/${groupId}/leave`);
    return response.data;
  },

  // Group tasks
  createGroupTask: async (groupId: string, title: string, description?: string, assignedTo?: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<GroupTask> => {
    const response = await api.post(`/groups/${groupId}/tasks`, {
      title,
      description,
      assigned_to: assignedTo,
      priority
    });
    return response.data;
  },

  getGroupTasks: async (groupId: string): Promise<GroupTask[]> => {
    const response = await api.get(`/groups/${groupId}/tasks`);
    return response.data;
  },

  updateGroupTask: async (groupId: string, taskId: string, data: { completed?: boolean; title?: string; description?: string; assigned_to?: string; priority?: 'low' | 'medium' | 'high' }): Promise<GroupTask> => {
    const response = await api.put(`/groups/${groupId}/tasks/${taskId}`, data);
    return response.data;
  },

  deleteGroupTask: async (groupId: string, taskId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/groups/${groupId}/tasks/${taskId}`);
    return response.data;
  },

  // Group messaging
  sendGroupMessage: async (groupId: string, message: string): Promise<GroupMessage> => {
    const response = await api.post(`/groups/${groupId}/messages`, { message });
    return response.data;
  },

  getGroupMessages: async (groupId: string): Promise<GroupMessage[]> => {
    const response = await api.get(`/groups/${groupId}/messages`);
    return response.data;
  },

  // Group progress
  getGroupProgress: async (groupId: string): Promise<GroupProgress> => {
    const response = await api.get(`/groups/${groupId}/progress`);
    return response.data;
  },

  // Motivational notes
  sendMotivationalNote: async (toUserId: string, message: string, groupId?: string): Promise<MotivationalNote> => {
    const response = await api.post('/motivational-notes', {
      to_user_id: toUserId,
      message,
      group_id: groupId
    });
    return response.data;
  },

  getMotivationalNotes: async (): Promise<{notes: MotivationalNote[]}> => {
    const response = await api.get('/motivational-notes');
    return response.data;
  },

  markNoteAsRead: async (noteId: string): Promise<{ message: string }> => {
    const response = await api.put(`/motivational-notes/${noteId}/read`);
    return response.data;
  },

  // History
  getUserHistory: async (): Promise<HistoryEntry[]> => {
    const response = await api.get('/history');
    return response.data;
  },

  getFriendHistory: async (friendId: string): Promise<HistoryEntry[]> => {
    const response = await api.get(`/history/friend/${friendId}`);
    return response.data;
  },
};

export default api;
