'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  QrCode,
  Users,
  Plus,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import type { AnalyticsOverview } from '@/types';
import { StatCard } from '@/components/ui/stat-card';
import { ScanTrendChart } from '@/components/charts/scan-trend-chart';
import { OrganDistributionChart } from '@/components/charts/organ-distribution-chart';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import OrganStudioModal from '@/components/admin/OrganStudioModal';

export default function AdminDashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.overview(),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const { data: scanTrend, isLoading: scanLoading } = useQuery({
    queryKey: ['analytics', 'scans', 30],
    queryFn: () => analyticsApi.scans({ groupBy: 'day' }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: organDist, isLoading: distLoading } = useQuery({
    queryKey: ['analytics', 'organs'],
    queryFn: () => analyticsApi.organs(),
    staleTime: 1000 * 60 * 5,
  });

  if (overviewLoading) return <PageSkeleton />;

  const stats: AnalyticsOverview = overview ?? {
    totalOrgans: 0,
    totalScans: 0,
    totalFaculty: 0,
    totalStudents: 0,
    pendingApprovals: 0,
    unresolvedReports: 0,
    publishedOrgans: 0,
    draftOrgans: 0,
    totalQrCodes: 0,
    totalModels: 0,
    totalQuizAttempts: 0,
    avgFeedbackRating: 0,
  };
  const totalUsers = (stats.totalFaculty ?? 0) + (stats.totalStudents ?? 0);

  // Normalise scan trend data for the chart component
  const trendData = (scanTrend ?? []).map((pt: { date: string; count: number }) => ({
    date: new Date(pt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    scans: pt.count,
  }));

  const distData = (organDist ?? []).map((o: { organ: string; scans: number }) => ({
    name: o.organ,
    scans: o.scans,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Anatomy Department Overview</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time telemetry across physical specimens, cadaveric stations, and student AR placements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/organs"
            className="flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Organ</span>
          </Link>
        </div>
      </div>

      {/* Alert Banners for pending actions */}
      {(stats.pendingApprovals > 0 || stats.unresolvedReports > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.pendingApprovals > 0 && (
            <Link
              href="/admin/organs"
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-amber-800">
                {stats.pendingApprovals} organ{stats.pendingApprovals !== 1 ? 's' : ''} awaiting approval
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 ml-auto" />
            </Link>
          )}
          {stats.unresolvedReports > 0 && (
            <Link
              href="/admin/feedback"
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-100 transition"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-xs font-semibold text-red-800">
                {stats.unresolvedReports} unresolved error report{stats.unresolvedReports !== 1 ? 's' : ''}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-red-500 ml-auto" />
            </Link>
          )}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cataloged Organs"
          value={stats.totalOrgans ?? 0}
          change={`${stats.publishedOrgans ?? 0} published`}
          changeType="positive"
          icon={Heart}
          iconColor="text-red-500"
          description="Across anatomical systems"
        />
        <StatCard
          title="Total QR Scans"
          value={stats.totalScans ?? 0}
          change="Lifetime"
          changeType="neutral"
          icon={QrCode}
          iconColor="text-teal-600"
          description="Physical dissection hall interactions"
        />
        <StatCard
          title="Active Learners & Faculty"
          value={totalUsers}
          change={`${stats.totalFaculty} faculty · ${stats.totalStudents} students`}
          changeType="neutral"
          icon={Users}
          iconColor="text-blue-600"
          description="Medical students & anatomists"
        />
        <StatCard
          title="3D/AR Visualizations"
          value={`${stats.publishedOrgans ?? 0}`}
          change="Live in AR"
          changeType="positive"
          icon={Sparkles}
          iconColor="text-purple-600"
          description="Published organs with model-viewer"
        />
      </div>

      {/* Live Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Scan Engagement — Last 30 Days</h3>
            <Link href="/admin/analytics" className="text-xs text-blue-600 hover:underline font-semibold">
              Full analytics
            </Link>
          </div>
          {scanLoading ? (
            <div className="h-32 flex items-center justify-center text-xs text-gray-400">Loading chart…</div>
          ) : (
            <ScanTrendChart data={trendData} />
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Top Explored Specimens</h3>
            <span className="text-xs text-gray-400">By scan count</span>
          </div>
          {distLoading ? (
            <div className="h-32 flex items-center justify-center text-xs text-gray-400">Loading chart…</div>
          ) : (
            <OrganDistributionChart data={distData} />
          )}
        </div>
      </div>

      {/* Procedural 3D Organ Specimen Studio */}
      <OrganStudioModal />

      {/* Recent QR scan activity — live from analytics */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900">Platform Health</h3>
          <Link href="/admin/analytics" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
            <span>View full telemetry</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100 text-xs">
          {[
            {
              label: 'Published Organs',
              value: `${stats.publishedOrgans ?? 0} / ${stats.totalOrgans ?? 0}`,
              status: (stats.publishedOrgans ?? 0) > 0 ? 'ok' : 'warn',
            },
            {
              label: 'Active QR Codes',
              value: `${stats.totalQrCodes ?? 0}`,
              status: 'ok',
            },
            {
              label: 'Quiz Attempts',
              value: `${stats.totalQuizAttempts ?? 0}`,
              status: 'ok',
            },
            {
              label: 'Pending Approvals',
              value: `${stats.pendingApprovals ?? 0}`,
              status: (stats.pendingApprovals ?? 0) > 0 ? 'warn' : 'ok',
            },
          ].map((item, idx) => (
            <div key={idx} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition">
              <span className="font-medium text-gray-700">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{item.value}</span>
                {item.status === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
