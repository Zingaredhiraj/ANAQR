'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { PageSkeleton } from '@/components/ui/loading-skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      {/* Navigation Sidebar */}
      <Sidebar
        role="SUPER_ADMIN"
        user={user}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area - Full width on mobile, offset on desktop */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 ${
          collapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 truncate">
              Administration
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Admin: <span className="font-semibold text-gray-900">{displayName}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
