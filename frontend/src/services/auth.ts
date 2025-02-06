import api from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password2: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    access: string;
    refresh: string;
}

export const authService = {
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/accounts/register/', data);
        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            // Set the token in axios defaults
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        }
        return response.data;
    },

    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/accounts/token/', credentials);
        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            // Set the token in axios defaults
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Remove token from axios defaults
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
    },

    getCurrentUser: (): User | null => {
        try {
            const userStr = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            
            if (!userStr || !token) return null;
            
            const user = JSON.parse(userStr);
            if (user && typeof user.id === 'number' && typeof user.username === 'string') {
                // Ensure token is set in axios defaults
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            return null;
        }
    },

    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');
        const user = authService.getCurrentUser();
        if (token && user?.id) {
            // Ensure token is set in axios defaults
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
    }
};

export default authService; 