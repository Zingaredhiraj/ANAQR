'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { PageSkeleton } from '@/components/ui/loading-skeleton';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const displayName =
    user?.name ??
    (user?.studentProfile?.firstName
      ? `${user.studentProfile.firstName} ${user.studentProfile.lastName ?? ''}`.trim()
      : undefined) ??
    user?.email?.split('@')[0] ??
    'Student';

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login?from=%2Fstudent';
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        role="STUDENT"
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
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Student Anatomy Learning Workspace
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Learner: <span className="font-semibold text-gray-900">{displayName}</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
