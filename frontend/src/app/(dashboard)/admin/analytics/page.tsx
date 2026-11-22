'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Download, Calendar, Layers, Smartphone, Sparkles } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { ScanTrendChart } from '@/components/charts/scan-trend-chart';
import { OrganDistributionChart } from '@/components/charts/organ-distribution-chart';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview', timeRange],
    queryFn: () => analyticsApi.overview(),
  });

  const trendData = [
    { date: 'Day 1', scans: 5 },
    { date: 'Day 2', scans: 8 },
    { date: 'Day 3', scans: 12 },
    { date: 'Day 4', scans: 10 },
    { date: 'Day 5', scans: 22 },
    { date: 'Day 6', scans: 17 },
    { date: 'Day 7', scans: 28 },
  ];

  const organData = [
    { name: 'Heart', scans: 42 },
    { name: 'Brain', scans: 31 },
    { name: 'Lungs', scans: 27 },
    { name: 'Kidney', scans: 19 },
    { name: 'Liver', scans: 16 },
    { name: 'Eye', scans: 11 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Anatomical Engagement Analytics</h1>
          <p className="text-xs text-gray-500 mt-1">
            Student utilization telemetry, scan heatmaps, AR session durations, and learning module completions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeRange === r
                  ? 'bg-navy-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Last {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">Average AR Dwell Time</span>
          <div className="text-2xl font-bold text-navy-900 mt-1">4m 18s</div>
          <p className="text-[11px] text-teal-600 font-medium mt-1">
            +14% vs traditional plastic anatomical models
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">Top AR Device Family</span>
          <div className="text-2xl font-bold text-navy-900 mt-1">iOS QuickLook (54%)</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            Android SceneViewer 41% · Desktop 3D 5%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">Quiz Completion Rate</span>
          <div className="text-2xl font-bold text-navy-900 mt-1">82.4%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Average formative score: 78.5%
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">QR Scan Trends Over Time</h3>
            <span className="text-xs text-gray-400">Total Scans</span>
          </div>
          <ScanTrendChart data={trendData} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Most Explored Anatomical Specimens</h3>
            <span className="text-xs text-gray-400">Interactions Count</span>
          </div>
          <OrganDistributionChart data={organData} />
        </div>
      </div>
    </div>
  );
}
