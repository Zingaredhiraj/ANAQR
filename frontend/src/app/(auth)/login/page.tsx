'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { login, loginPending } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

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
      const user = await login({ email: data.email, password: data.password });
      if (user.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else if (user.role === 'FACULTY') {
        router.push('/faculty');
      } else {
        router.push('/student');
      }
    } catch (err: any) {
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.code === 'ECONNREFUSED' ||
        err?.message?.toLowerCase().includes('network') ||
        err?.message?.toLowerCase().includes('connection');

      if (isNetworkError) {
        setIsOffline(true);
        setErrorMessage(
          'Cannot connect to the AnatoScan API server. Start the backend with: cd apps/api && pnpm start:dev'
        );
      } else {
        setErrorMessage(
          err?.response?.data?.message || 'Invalid credentials. Please try again.'
        );
      }
    }
  };

  const setDemoCredentials = (role: 'admin' | 'faculty' | 'student') => {
    if (role === 'admin') {
      setValue('email', 'admin@anatoscan.edu');
      setValue('password', 'Admin@AnatoScan2024!');
    } else if (role === 'faculty') {
      setValue('email', 'dr.sharma@anatoscan.edu');
      setValue('password', 'Faculty@2024!');
    } else {
      setValue('email', 'student@anatoscan.edu');
      setValue('password', 'Student@2024!');
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
        <div className={`mb-5 flex items-start gap-2 p-3 rounded-xl text-xs border ${
          isOffline
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
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
          className="w-full flex items-center justify-center gap-2 bg-[#10243A] hover:bg-[#0d1f33] text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loginPending ? 'Authenticating...' : 'Sign In'}</span>
          {!loginPending && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {/* Demo Quick-Fill */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
          Demo Logins — Click to autofill
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDemoCredentials('admin')}
            className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-2 rounded-lg transition"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('faculty')}
            className="text-[11px] font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 py-1.5 px-2 rounded-lg transition"
          >
            Faculty
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('student')}
            className="text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 py-1.5 px-2 rounded-lg transition"
          >
            Student
          </button>
        </div>
      </div>

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
