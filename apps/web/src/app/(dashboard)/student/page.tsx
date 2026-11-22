'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  QrCode,
  Flame,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { organsApi } from '@/lib/api';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const { data: organsData } = useQuery({
    queryKey: ['organs'],
    queryFn: () => organsApi.list({ limit: 12 }),
  });

  const organs = Array.isArray(organsData) ? organsData : (organsData as any)?.data || [];

  return (
    <div className="space-y-6">
      {/* Student Welcome Hero */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              MBBS Anatomy Learner
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>4 Day Study Streak</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Medical Student'}
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-lg leading-relaxed">
            Scan physical cadaveric specimens in the dissection hall or explore interactive 3D spatial anatomy from your desk.
          </p>
        </div>

        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition transform active:scale-95 shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan</span>
        </Link>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Organs Explored</span>
            <div className="text-xl font-bold text-navy-900 mt-0.5">8 of 10</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Avg Quiz Score</span>
            <div className="text-xl font-bold text-navy-900 mt-0.5">85%</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">AR Placements</span>
            <div className="text-xl font-bold text-navy-900 mt-0.5">14 Sessions</div>
          </div>
        </div>
      </div>

      {/* Explore Catalog Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Curriculum Specimens</h2>
            <p className="text-xs text-gray-500">
              Interactive 3D anatomical models with physiology and clinical diagnostics
            </p>
          </div>
          <Link
            href="/organs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Browse All Systems</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {organs.map((organ: any) => (
            <Link
              key={organ.id}
              href={`/o/${organ.slug}`}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-teal-500/50 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {organ.anatomicalSystem?.name || 'Anatomy'}
                  </span>
                  <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>3D / AR</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy-900 group-hover:text-blue-600 transition">
                  {organ.name}
                </h3>
                <p className="text-xs text-teal-700 italic font-medium">{organ.latinName}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                  {organ.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
