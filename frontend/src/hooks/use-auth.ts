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
      try {
        return await authApi.me();
      } catch {
        // 401 simply means not logged in — not a crash
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  const loginMutation = useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: (user: User) => {
      queryClient.setQueryData(['auth', 'me'], user);
      const firstName =
        user.studentProfile?.firstName ||
        user.facultyProfile?.firstName ||
        user.email.split('@')[0];
      toast.success(`Welcome back, ${firstName}!`);

      switch (user.role) {
        case 'SUPER_ADMIN':
          router.push('/admin');
          break;
        case 'FACULTY':
          router.push('/faculty');
          break;
        case 'STUDENT':
          router.push('/student');
          break;
        default:
          router.push('/');
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
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
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
