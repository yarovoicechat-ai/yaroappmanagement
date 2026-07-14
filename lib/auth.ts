import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './apiEndpoints';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'superAdmin' | 'admin' | 'coinSeller' | 'host' | 'user';
    meethiId?: string;
}

export async function login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    try {
        const response = await apiClient.post(API_ENDPOINTS.ADMIN.LOGIN, {
            email,
            password,
        });

        if (response.success && response.data) {
            const { user, token, refreshToken } = response.data;

            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_refresh_token', refreshToken);
            localStorage.setItem('admin_user', JSON.stringify(user));

            return {
                user: {
                    id: user._id || user.userId,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    meethiId: user.meethiId,
                },
                token,
                refreshToken,
            };
        }

        throw new Error('Login failed');
    } catch (error: any) {
        throw new Error(error.message || 'Invalid credentials');
    }
}

export async function logout(): Promise<void> {
    try {
        await apiClient.post(API_ENDPOINTS.ADMIN.LOGOUT);
    } catch (error) {
        // Continue with logout even if API call fails
    } finally {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
    }
}

export async function getUser(token: string): Promise<User | null> {
    try {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            return {
                id: user._id || user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            };
        }

        const response = await apiClient.get(API_ENDPOINTS.ADMIN.PROFILE);
        if (response.success && response.data) {
            const user = response.data;
            localStorage.setItem('admin_user', JSON.stringify(user));
            return {
                id: user._id || user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            };
        }

        return null;
    } catch (error) {
        return null;
    }
}
