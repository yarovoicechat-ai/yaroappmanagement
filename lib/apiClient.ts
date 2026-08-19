// API Client with automatic token injection, local fallback, XHR progress for large build uploads

const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        const localEnv = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
        if (localEnv) return localEnv.replace(/\/+$/, '').replace(/\/api$/i, '');
        // Default to production API if no local override set
    }
    const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.mithichat.live';
    return configuredBaseUrl.replace(/\/+$/, '').replace(/\/api$/i, '');
};

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

    private getEffectiveBaseUrl(): string {
        return getApiBaseUrl();
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

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
        const baseUrl = this.getEffectiveBaseUrl();
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            const err = new Error(`Backend server connection failed (${baseUrl}). Please check if the server is running or if Nginx client_max_body_size allows large build uploads (70MB+).`) as Error & { status?: number };
            err.status = 503;
            throw err;
        }
        throw error;
    }

    async get<T = any>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
        try {
            const baseUrl = this.getEffectiveBaseUrl();
            const url = new URL(`${baseUrl}${endpoint}`);
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
            const baseUrl = this.getEffectiveBaseUrl();
            const response = await fetch(`${baseUrl}${endpoint}`, {
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
            const baseUrl = this.getEffectiveBaseUrl();
            const response = await fetch(`${baseUrl}${endpoint}`, {
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
            const baseUrl = this.getEffectiveBaseUrl();
            const response = await fetch(`${baseUrl}${endpoint}`, {
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
            const baseUrl = this.getEffectiveBaseUrl();
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    /**
     * Large file upload via XMLHttpRequest for real-time progress and better error diagnostics
     */
    async uploadFile<T = any>(
        endpoint: string,
        formData: FormData,
        onProgress?: (percent: number) => void
    ): Promise<ApiResponse<T>> {
        const baseUrl = this.getEffectiveBaseUrl();
        const fullUrl = `${baseUrl}${endpoint}`;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', fullUrl);

            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('admin_token');
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
            }

            if (xhr.upload && onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        onProgress(percent);
                    }
                };
            }

            xhr.onload = () => {
                let data: any = {};
                try {
                    data = JSON.parse(xhr.responseText);
                } catch {
                    data = { message: xhr.responseText };
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    if (typeof data === 'object' && data !== null && !('success' in data)) {
                        resolve({ success: true, message: 'Success', data });
                    } else {
                        resolve(data);
                    }
                } else if (xhr.status === 413) {
                    reject(new Error('File size too large (413 Payload Too Large). Please ensure server Nginx client_max_body_size is 250M.'));
                } else {
                    reject(new Error(data.message || data.error || `Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error(`Network error uploading file to ${baseUrl}. Check if server is running or if CORS / Nginx limits are restricting large 70MB+ uploads.`));
            };

            xhr.send(formData);
        });
    }
}

export const apiClient = new ApiClient(getApiBaseUrl());
