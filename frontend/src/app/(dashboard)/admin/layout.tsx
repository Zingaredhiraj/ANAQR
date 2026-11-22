'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { PageSkeleton } from '@/components/ui/loading-skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const displayName =
    user?.name ??
    (user?.facultyProfile?.firstName
      ? `${user.facultyProfile.firstName} ${user.facultyProfile.lastName ?? ''}`.trim()
      : undefined) ??
    user?.email?.split('@')[0] ??
    'Administrator';

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = '/login?from=%2Fadmin';
      } else if (user.role !== 'SUPER_ADMIN') {
        window.location.href = user.role === 'FACULTY' ? '/faculty' : '/student';
      }
    }
  }, [user, isLoading]);

  if (isLoading || !user || user.role !== 'SUPER_ADMIN') {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        role="SUPER_ADMIN"
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
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Department Administrator
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Welcome, <span className="font-semibold text-gray-900">{displayName}</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
