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

// Enhanced Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at?: string;
  user_id: string;
  priority?: 'low' | 'medium' | 'high';
  group_id?: string;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
  created_at: string;
  friend_count?: number;
  group_count?: number;
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
  from_user?: User;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  host_id: string;
  invite_code: string;
  is_private: boolean;
  member_count: number;
  created_at: string;
  host?: User;
  members?: GroupMember[];
}

export interface GroupMember {
  user_id: string;
  role: 'host' | 'member';
  joined_at: string;
  user?: User;
}

export interface GroupTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  created_at: string;
  group_id: string;
}

export interface MotivationalNote {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  created_at: string;
  read: boolean;
  group_id?: string;
  from_user?: User;
}

export interface GroupMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  group_id: string;
  user?: User;
}

export interface FriendProgress {
  friend: Friend;
  tasks: Task[];
  stats: {
    total_tasks: number;
    completed_tasks: number;
    completion_percentage: number;
  };
}

export interface GroupProgress {
  group_id: string;
  group_tasks: GroupTask[];
  members_progress: {
    member: User;
    role: string;
    tasks: Task[];
    stats: {
      total_tasks: number;
      completed_tasks: number;
      completion_percentage: number;
    };
  }[];
}

export interface HistoryEntry {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  created_at: string;
}

class ApiService {
  // User Management
  async setupUser(displayName?: string, username?: string) {
    const response = await api.post('/users/setup', {
      display_name: displayName,
      username: username
    });
    return response.data;
  }

  async getUserProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  }

  async searchUsers(query: string) {
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Friend Management
  async sendFriendRequest(friendEmail: string) {
    const response = await api.post('/friends/request', null, {
      params: { friend_email: friendEmail }
    });
    return response.data;
  }

  async getFriendRequests() {
    const response = await api.get('/friends/requests');
    return response.data;
  }

  async respondToFriendRequest(requestId: string, action: 'accept' | 'reject') {
    const response = await api.put(`/friends/requests/${requestId}`, null, {
      params: { action }
    });
    return response.data;
  }

  async getFriends() {
    const response = await api.get('/friends');
    return response.data;
  }

  async getFriendsProgress() {
    const response = await api.get('/friends/progress');
    return response.data;
  }

  // Group Management
  async createGroup(name: string, description?: string, isPrivate?: boolean) {
    const response = await api.post('/groups', {
      name,
      description,
      is_private: isPrivate
    });
    return response.data;
  }

  async joinGroup(inviteCode: string) {
    const response = await api.post('/groups/join', null, {
      params: { invite_code: inviteCode }
    });
    return response.data;
  }

  async getUserGroups() {
    const response = await api.get('/groups');
    return response.data;
  }

  async getGroupDetails(groupId: string) {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  }

  async getGroupProgress(groupId: string) {
    const response = await api.get(`/groups/${groupId}/progress`);
    return response.data;
  }

  // Task Management (Enhanced)
  async createTask(title: string, description?: string, priority?: string, groupId?: string) {
    const response = await api.post('/tasks', {
      title,
      description,
      priority: priority || 'medium',
      group_id: groupId
    });
    return response.data;
  }

  async getTodayTasks() {
    const response = await api.get('/tasks/today');
    return response.data;
  }

  async updateTask(taskId: string, completed: boolean) {
    const response = await api.put(`/tasks/${taskId}`, { completed });
    return response.data;
  }

  async deleteTask(taskId: string) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  }

  // Group Task Management
  async createGroupTask(groupId: string, title: string, description?: string, priority?: string) {
    const response = await api.post(`/groups/${groupId}/tasks`, {
      title,
      description,
      priority: priority || 'medium'
    });
    return response.data;
  }

  async getGroupTasks(groupId: string) {
    const response = await api.get(`/groups/${groupId}/tasks`);
    return response.data;
  }

  // Motivational Notes (Enhanced)
  async sendMotivationalNote(message: string, toUserId: string, groupId?: string) {
    const response = await api.post('/motivational-notes', null, {
      params: {
        message,
        to_user_id: toUserId,
        group_id: groupId
      }
    });
    return response.data;
  }

  async getMotivationalNotes() {
    const response = await api.get('/motivational-notes');
    return response.data;
  }

  // Group Messaging
  async sendGroupMessage(groupId: string, message: string) {
    const response = await api.post(`/groups/${groupId}/messages`, null, {
      params: { message }
    });
    return response.data;
  }

  async getGroupMessages(groupId: string, limit?: number) {
    const response = await api.get(`/groups/${groupId}/messages`, {
      params: { limit: limit || 50 }
    });
    return response.data;
  }

  // Legacy methods for backward compatibility
  async setupPartner(partnerEmail: string) {
    return this.sendFriendRequest(partnerEmail);
  }

  async getPartnerTodayTasks() {
    const friendsProgress = await this.getFriendsProgress();
    return {
      tasks: friendsProgress.friends_progress?.[0]?.tasks || [],
      date: new Date().toISOString().split('T')[0]
    };
  }
}

export const apiService = new ApiService();
