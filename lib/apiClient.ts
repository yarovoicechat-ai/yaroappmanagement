// API Client with automatic token injection and error handling

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.mithichat.live';
// Endpoints already include /api; accept either an origin or an origin ending in /api.
const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '').replace(/\/api$/i, '');

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
        const rawBody = await response.text();
        let data: Record<string, unknown> = {};
        if (rawBody) {
            try {
                data = JSON.parse(rawBody) as Record<string, unknown>;
            } catch {
                data = { message: rawBody };
            }
        }

        if (!response.ok) {
            // Handle unauthorized
            if (response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                window.location.href = '/login';
            }

            const message = String(data.message || data.error || `Request failed (${response.status})`);
            const error = new Error(message) as Error & { status?: number; details?: unknown };
            error.status = response.status;
            error.details = data;
            throw error;
        }

        // If data doesn't have a success property, but response is OK, wrap it
        if (typeof data === 'object' && data !== null && !('success' in data)) {
            return {
                success: true,
                message: 'Success',
                data: data as T
            };
        }

        return data as unknown as ApiResponse<T>;
    }

    private catchNetworkError(error: unknown): never {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            const err = new Error(`Backend server connection failed (${this.baseURL}). Please verify backend server is running.`) as Error & { status?: number };
            err.status = 503;
            throw err;
        }
        throw error;
    }

    async get<T = any>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
        try {
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

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async post<T = any>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(body),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async patch<T = any>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(body),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async put<T = any>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async uploadFile<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        try {
            const headers: HeadersInit = {};

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

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
