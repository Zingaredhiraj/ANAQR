'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Flame,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { organsApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function StudentProgressPage() {
  const { user } = useAuth();

  const { data: organsData } = useQuery({
    queryKey: ['organs'],
    queryFn: async () => {
      const res = await organsApi.list({ limit: 50 });
      return Array.isArray(res) ? res : (res as any)?.data || [];
    },
  });

  const organs = Array.isArray(organsData) ? organsData : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10243A] via-[#163554] to-[#2563EB] p-8 md:p-10 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-300">
              <TrendingUp className="w-4 h-4" />
              <span>Academic Curriculum Mastery</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Anatomy Learning Progress
            </h1>
            <p className="text-xs text-gray-200 leading-relaxed pt-1">
              Track specimen stations scanned, clinical module completions, and formative quiz scores across all 10 anatomical systems.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0b827a] text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Scan Next Specimen</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Curriculum Explored</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#10243A] mt-2">10 / 10</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">100% Core System Coverage</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Average Quiz Score</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-[#10243A] mt-2">88.5%</div>
          <p className="text-[11px] text-teal-600 font-medium mt-1">Formative Assessments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#10243A] mt-2">5 Days</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Dissection Hall Active</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">AR Dwell Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-[#10243A] mt-2">32 mins</div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Spatial 3D Inspection</p>
        </div>
      </div>

      {/* Organ Curriculum Progress Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#10243A]">System Specimen Checklist</h2>
          <span className="text-xs text-gray-400">{organs.length} units enrolled</span>
        </div>

        <div className="divide-y divide-gray-100">
          {organs.map((organ: any, index: number) => (
            <div
              key={organ.id}
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D9488] font-bold text-sm shrink-0">
                  {organ.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{organ.name}</h3>
                  <p className="text-xs text-[#0D9488] italic">
                    {organ.latinName ? `Lat. ${organ.latinName}` : organ.scientificName || 'Anatomy'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right sm:block hidden">
                  <span className="text-xs font-semibold text-gray-700 block">
                    {index % 2 === 0 ? 'Modules Mastered' : 'In Progress'}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {index % 2 === 0 ? 'Quiz: 90% Pass' : 'Quiz: Awaiting review'}
                  </span>
                </div>

                <Link
                  href={`/o/${organ.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
