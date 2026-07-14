// API Client with automatic token injection and error handling

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.mithichat.live';

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admin_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const data = await response.json();

        if (!response.ok) {
            // Handle unauthorized
            if (response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                window.location.href = '/login';
            }

            throw {
                success: false,
                message: data.message || data.error || 'An error occurred',
                error: data.error,
            };
        }

        // If data doesn't have a success property, but response is OK, wrap it
        if (typeof data === 'object' && data !== null && !('success' in data)) {
            return {
                success: true,
                message: 'Success',
                data: data as T
            };
        }

        return data;
    }

    async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        const url = new URL(`${this.baseURL}${endpoint}`);
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    url.searchParams.append(key, String(params[key]));
                }
            });
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        return this.handleResponse<T>(response);
    }

    async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        return this.handleResponse<T>(response);
    }

    async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        return this.handleResponse<T>(response);
    }

    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    async uploadFile<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        const headers: HeadersInit = {};

        // Get token from localStorage (don't set Content-Type for FormData)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admin_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        return this.handleResponse<T>(response);
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
