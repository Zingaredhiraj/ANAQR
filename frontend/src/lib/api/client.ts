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

// Request interceptor: attach bearer token from localStorage if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const requestUrl = error.config?.url || '';
        const isAuthCheck = requestUrl.includes('/auth/me') || requestUrl.includes('/auth/login');

        // Only clear tokens and redirect if it's an actual expired session on a protected route
        if (!isAuthCheck) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

          if (
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register') &&
            (window.location.pathname.startsWith('/admin') ||
              window.location.pathname.startsWith('/faculty') ||
              window.location.pathname.startsWith('/student'))
          ) {
            window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
          }
        }
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
