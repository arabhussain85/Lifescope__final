import axios, { AxiosError } from 'axios';
import { Role, Task, TaskCategory, TaskAnalytics, User } from '../types/task';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && !config.url?.includes('register') && !config.url?.includes('login')) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

interface ApiResponse<T> {
    data: T[];
    results: T[];
    count?: number;
    next?: string | null;
    previous?: string | null;
}

export const taskService = {
    // Roles
    getRoles: async () => {
        try {
            const response = await api.get<ApiResponse<Role>>('/tasks/roles/');
            return {
                data: response.data.results || response.data || []
            };
        } catch (error) {
            console.error('Error fetching roles:', error);
            return { data: [] };
        }
    },
    createRole: (data: Partial<Role>) => api.post('/tasks/roles/', data),
    updateRole: (id: number, data: Partial<Role>) => api.put(`/tasks/roles/${id}/`, data),
    deleteRole: (id: number) => api.delete(`/tasks/roles/${id}/`),

    // Tasks
    getTasks: async (filters?: Record<string, string>) => {
        try {
            const response = await api.get('/tasks/tasks/', { 
                params: {
                    ...filters,
                    start_date: filters?.start_date,
                    end_date: filters?.end_date,
                    ordering: 'due_date'  // Add ordering by due date
                }
            });
            
            const tasks = response.data?.results || response.data;
            return {
                data: Array.isArray(tasks) ? tasks : []
            };
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return { data: [] };
        }
    },
    getTask: (id: number) => api.get(`/tasks/tasks/${id}/`),
    createTask: async (data: Partial<Task>) => {
        try {
            const taskData: any = { ...data };
            
            // Convert string values to appropriate types
            if (typeof taskData.priority === 'string') {
                taskData.priority = parseInt(taskData.priority);
            }
            if (typeof taskData.role === 'string') {
                taskData.role = parseInt(taskData.role);
            }
            if (taskData.estimated_hours) {
                taskData.estimated_hours = parseFloat(taskData.estimated_hours as string) || 0;
            }
            if (taskData.actual_hours) {
                taskData.actual_hours = parseFloat(taskData.actual_hours as string) || 0;
            }

            const response = await api.post<Task>('/tasks/tasks/', taskData);
            return response.data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },
    updateTask: async (taskId: number, data: Partial<Task>) => {
        try {
            // First get the current task data
            const currentTask = await api.get<Task>(`/tasks/tasks/${taskId}/`);
            
            // Merge current task data with updates
            const updateData = {
                ...currentTask.data,  // Keep all existing task data
                ...data,              // Override with new data
            };

            // Clean and validate the data before sending
            if (typeof updateData.priority === 'string') {
                updateData.priority = parseInt(updateData.priority);
            }
            if (typeof updateData.role === 'string') {
                updateData.role = parseInt(updateData.role);
            }
            if (updateData.estimated_hours) {
                updateData.estimated_hours = parseFloat(updateData.estimated_hours as string) || 0;
            }
            if (updateData.actual_hours) {
                updateData.actual_hours = parseFloat(updateData.actual_hours as string) || 0;
            }

            const response = await api.patch<Task>(`/tasks/tasks/${taskId}/`, updateData);
            return response.data;
        } catch (error: any) {
            console.error('Error updating task:', error.response?.data || error.message);
            throw error;
        }
    },
    deleteTask: async (taskId: number) => {
        return await api.delete(`/tasks/tasks/${taskId}/`);
    },
    getAnalytics: async () => {
        try {
            const response = await api.get<TaskAnalytics>('/tasks/tasks/analytics/');
            console.log('Raw analytics response:', response); // Debug log
            return response;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    },

    // Categories
    getCategories: async () => {
        try {
            const response = await api.get<ApiResponse<TaskCategory>>('/tasks/categories/');
            return {
                data: response.data.data || []
            };
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { data: [] };
        }
    },
    createCategory: async (data: Partial<TaskCategory>) => {
        const response = await api.post<TaskCategory>('/tasks/categories/', data);
        return response.data;
    },
    updateCategory: async (id: number, data: Partial<TaskCategory>) => {
        const response = await api.put<TaskCategory>(`/tasks/categories/${id}/`, data);
        return response.data;
    },
    deleteCategory: async (id: number) => {
        await api.delete(`/tasks/categories/${id}/`);
    },

    toggleTaskComplete: async (id: number) => {
        try {
            // First get the current task state
            const currentTask = await api.get<Task>(`/tasks/tasks/${id}/`);
            
            // Prepare update data while preserving existing task data
            const updateData = {
                ...currentTask.data,  // Keep all existing task data
                is_completed: !currentTask.data.is_completed,
                completed_at: !currentTask.data.is_completed ? new Date().toISOString() : null,
                status: !currentTask.data.is_completed ? 'completed' : 'not_started'
            };

            const response = await api.patch<Task>(`/tasks/tasks/${id}/`, updateData);
            
            // After successful update, fetch fresh analytics
            const analyticsResponse = await api.get<TaskAnalytics>('/tasks/tasks/analytics/');
            
            // Return both updated task and analytics
            return {
                task: response.data,
                analytics: analyticsResponse.data
            };
        } catch (error: any) {
            console.error('Error toggling task completion:', error.response?.data || error.message);
            throw error;
        }
    },

    getUserProfile: async () => {
        try {
            const response = await api.get<User>('/auth/profile/');
            return response;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    updateUserProfile: async (data: Partial<User & { current_password?: string, new_password?: string }>) => {
        try {
            const response = await api.patch<User>('/auth/profile/', data);
            return response;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },
};

export default api;