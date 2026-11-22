'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import type { User, LoginDto, RegisterDto } from '@/types';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (!token) return null;
      }
      try {
        return await authApi.me();
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  const loginMutation = useMutation({
    mutationFn: async (dto: LoginDto) => {
      const userRes = await authApi.login(dto);
      if (typeof window !== 'undefined' && userRes) {
        const token = (userRes as any).accessToken;
        const refreshToken = (userRes as any).refreshToken;
        if (token) {
          localStorage.setItem('access_token', token);
          document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;
        }
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
          document.cookie = `refresh_token=${refreshToken}; path=/; max-age=2592000; SameSite=Lax; Secure`;
        }
      }
      return userRes;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['auth', 'me'], user);
      const firstName =
        user.studentProfile?.firstName ||
        user.facultyProfile?.firstName ||
        user.email.split('@')[0];
      toast.success(`Welcome back, ${firstName}!`);

      // Determine redirect target
      let target = '/';
      if (user.role === 'SUPER_ADMIN') target = '/admin';
      else if (user.role === 'FACULTY') target = '/faculty';
      else if (user.role === 'STUDENT') target = '/student';

      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const from = searchParams.get('from');
        if (
          from &&
          from.startsWith('/') &&
          !from.startsWith('/login') &&
          !from.startsWith('/register')
        ) {
          if (from.startsWith('/admin') && user.role === 'SUPER_ADMIN') {
            target = from;
          } else if (
            from.startsWith('/faculty') &&
            (user.role === 'SUPER_ADMIN' || user.role === 'FACULTY')
          ) {
            target = from;
          } else if (
            from.startsWith('/student') &&
            (user.role === 'SUPER_ADMIN' || user.role === 'FACULTY' || user.role === 'STUDENT')
          ) {
            target = from;
          }
        }

        // Full window navigation ensures cookies and middleware are cleanly picked up immediately
        window.location.href = target;
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const msg =
        error?.response?.data?.message ||
        (error.message?.includes('Network') || error.message?.includes('ECONNREFUSED')
          ? 'Cannot connect to server. Please ensure the backend is running.'
          : 'Invalid credentials. Please try again.');
      toast.error(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),
    onSuccess: () => {
      toast.success('Registration successful! Please log in.');
      router.push('/login');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // continue logout even if backend is unreachable
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
      toast.info('You have been logged out.');
    },
  });

  return {
    user: user ?? undefined,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'SUPER_ADMIN',
    isFaculty: user?.role === 'FACULTY',
    isStudent: user?.role === 'STUDENT',
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginPending: loginMutation.isPending,
    registerPending: registerMutation.isPending,
    logoutPending: logoutMutation.isPending,
  };
}
