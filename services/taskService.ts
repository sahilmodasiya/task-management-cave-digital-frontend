import { api } from './api';
import { API_ENDPOINTS } from '../constants/config';

export interface Task {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
}

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.TASKS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTask: async (taskId: string): Promise<Task> => {
    try {
      const response = await api.get(`${API_ENDPOINTS.TASKS}/${taskId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    try {
      const response = await api.post(API_ENDPOINTS.TASKS, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (taskId: string, data: UpdateTaskData): Promise<Task> => {
    try {
      const response = await api.put(`${API_ENDPOINTS.TASKS}/${taskId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINTS.TASKS}/${taskId}`);
    } catch (error) {
      throw error;
    }
  },
}; 