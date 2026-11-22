'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, AlertCircle, ArrowRight, Server } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, login, loginPending } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // If already logged in, redirect directly to user's dashboard (unless explicitly logging out)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('logout') === 'true') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return;
      }
    }

    if (user) {
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
          } else if (from.startsWith('/student')) {
            target = from;
          }
        }
        window.location.href = target;
      }
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsOffline(false);
    try {
      await login({ email: data.email, password: data.password });
      // Redirection is handled in loginMutation.onSuccess via window.location.href
    } catch (err: any) {
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.code === 'ECONNREFUSED' ||
        err?.message?.toLowerCase().includes('network') ||
        err?.message?.toLowerCase().includes('connection');

      if (isNetworkError) {
        setIsOffline(true);
        setErrorMessage(
          'Cannot connect to the AnatoScan API server. Please verify backend status.'
        );
      } else {
        setErrorMessage(
          err?.response?.data?.message || 'Invalid credentials. Please try again.'
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy-900">Academic Portal Sign In</h2>
        <p className="text-xs text-gray-500 mt-1">
          Access anatomy curriculum, 3D authoring, or student progress tracking.
        </p>
      </div>

      {errorMessage && (
        <div
          className={`mb-5 flex items-start gap-2 p-3 rounded-xl text-xs border ${
            isOffline
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}
        >
          {isOffline ? (
            <Server className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Institutional Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. name@anatoscan.edu"
              className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loginPending}
          className="w-full flex items-center justify-center gap-2 bg-[#10243A] hover:bg-[#0d1f33] text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>{loginPending ? 'Authenticating...' : 'Sign In'}</span>
          {!loginPending && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-xs text-gray-500">
          Medical student without an institutional account?{' '}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
