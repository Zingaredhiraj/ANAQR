'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { PageSkeleton } from '@/components/ui/loading-skeleton';

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const displayName =
    user?.name ??
    (user?.facultyProfile?.firstName
      ? `${user.facultyProfile.firstName} ${user.facultyProfile.lastName ?? ''}`.trim()
      : undefined) ??
    user?.email?.split('@')[0] ??
    'Faculty';

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'FACULTY' && user.role !== 'SUPER_ADMIN') {
        router.push('/student');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role !== 'FACULTY' && user.role !== 'SUPER_ADMIN')) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        role="FACULTY"
        user={user}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area with Dynamic Margin preventing overlap */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Anatomy Faculty & Authoring Portal
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Instructor: <span className="font-semibold text-gray-900">{displayName}</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
