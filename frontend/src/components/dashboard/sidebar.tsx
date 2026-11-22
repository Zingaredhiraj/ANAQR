'use client';

import React, { useCallback, useState } from 'react';
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
  X,
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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  role,
  user,
  collapsed,
  onCollapse,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
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
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');

          const cookieNames = ['access_token', 'refresh_token'];
          const sameSites = ['Lax', 'None', 'Strict', ''];
          for (const name of cookieNames) {
            for (const ss of sameSites) {
              const ssPart = ss ? `; SameSite=${ss}` : '';
              document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT${ssPart}; Secure`;
              document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT${ssPart}`;
              document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            }
          }
        }
        logout();
      } catch {
      } finally {
        window.location.href = '/login?logout=true';
      }
    },
    [logout, isLoggingOut],
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`flex flex-col h-screen bg-[#10243A] text-white transition-all duration-300 fixed left-0 top-0 z-50 shadow-2xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-16' : 'w-72 md:w-64'}
        `}
      >
        {/* Logo & Header */}
        <div className="flex items-center justify-between px-4 py-4 md:py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="font-bold text-base md:text-lg tracking-tight">AnatoScan AR</span>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onCollapse}
            className="hidden md:flex ml-auto p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile close drawer button */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
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
                onClick={() => onMobileClose?.()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                  active
                    ? 'bg-[#2563EB] text-white shadow-md font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white font-medium'
                }`}
                title={collapsed && !mobileOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {(!collapsed || mobileOpen) && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <div
            className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 ${
              collapsed && !mobileOpen ? 'justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-bold truncate text-white">{displayName}</p>
                <p className="text-[11px] text-white/50 truncate">{user.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut || logoutPending}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              collapsed && !mobileOpen ? 'justify-center' : ''
            } text-white/70 hover:bg-red-500/20 hover:text-red-300 cursor-pointer`}
            title={collapsed && !mobileOpen ? 'Logout' : undefined}
          >
            <LogOut className={`w-4 h-4 shrink-0 ${isLoggingOut ? 'animate-spin' : ''}`} />
            {(!collapsed || mobileOpen) && (
              <span className="text-xs font-semibold">
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
