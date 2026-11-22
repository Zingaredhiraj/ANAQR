'use client';

import React, { useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  Users,
  QrCode,
  BarChart2,
  MessageSquare,
  ClipboardList,
  Settings,
  BookOpen,
  ScanLine,
  Bookmark,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Organs', href: '/admin/organs', icon: Heart },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'QR Codes', href: '/admin/qr', icon: QrCode },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { label: 'Audit Logs', href: '/admin/audit', icon: ClipboardList },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const facultyNav: NavItem[] = [
  { label: 'Overview', href: '/faculty', icon: LayoutDashboard },
  { label: 'My Organs', href: '/faculty/organs', icon: Heart },
  { label: 'QR Placards', href: '/faculty/qr', icon: QrCode },
  { label: 'Student Feedback', href: '/faculty/feedback', icon: MessageSquare },
];

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { label: 'Browse Organs', href: '/organs', icon: BookOpen },
  { label: 'Scan QR', href: '/scan', icon: ScanLine },
  { label: 'My Progress', href: '/student/progress', icon: TrendingUp },
  { label: 'Bookmarks', href: '/student/bookmarks', icon: Bookmark },
];

interface SidebarProps {
  role: 'SUPER_ADMIN' | 'FACULTY' | 'STUDENT';
  user: {
    name?: string;
    email: string;
    role: string;
    studentProfile?: { firstName?: string; lastName?: string };
    facultyProfile?: { firstName?: string; lastName?: string };
  };
  collapsed: boolean;
  onCollapse: () => void;
}

export function Sidebar({ role, user, collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { logout, logoutPending } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName =
    user.name ??
    (user.facultyProfile?.firstName
      ? `${user.facultyProfile.firstName} ${user.facultyProfile.lastName ?? ''}`.trim()
      : undefined) ??
    (user.studentProfile?.firstName
      ? `${user.studentProfile.firstName} ${user.studentProfile.lastName ?? ''}`.trim()
      : undefined) ??
    user.email.split('@')[0];

  const navItems =
    role === 'SUPER_ADMIN' ? adminNav : role === 'FACULTY' ? facultyNav : studentNav;

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/faculty' || href === '/student') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (isLoggingOut) return;
      setIsLoggingOut(true);
      try {
        // Clear tokens immediately so middleware doesn't bounce
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
        }
        logout();
        // Hard redirect ensures page and query cache are fully wiped
        window.location.href = '/login';
      } catch {
        setIsLoggingOut(false);
        window.location.href = '/login';
      }
    },
    [logout, isLoggingOut],
  );

  return (
    <aside
      className={`flex flex-col h-screen bg-[#10243A] text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } fixed left-0 top-0 z-40 shadow-xl`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AnatoScan AR</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center mx-auto">
            <Heart className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={onCollapse}
          className="ml-auto p-1 rounded-md hover:bg-white/10 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                active
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <div
          className={`flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          )}
        </div>

        {/* Proper Logout Button — NOT a Link to /login */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut || logoutPending}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            collapsed ? 'justify-center' : ''
          } text-white/70 hover:bg-red-500/20 hover:text-red-300 cursor-pointer`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className={`w-4 h-4 flex-shrink-0 ${isLoggingOut ? 'animate-spin' : ''}`} />
          {!collapsed && (
            <span className="text-sm font-medium">
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
