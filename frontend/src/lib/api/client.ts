import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Fall back to 4005 (local API port); override via NEXT_PUBLIC_API_URL in .env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor: unwrap the ApiResponse envelope
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on auth pages to prevent redirect loops
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  },
);

// Generic typed fetch helper
export async function apiFetch<T>(
  endpoint: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.request<{ data: T; message: string }>({
    url: endpoint,
    ...config,
  });
  // Handle both wrapped { data: T } and direct T responses
  const body = response.data as any;
  return (body?.data !== undefined ? body.data : body) as T;
}

export type { AxiosError };
