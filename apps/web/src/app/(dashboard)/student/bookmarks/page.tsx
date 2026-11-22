'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { organsApi } from '@/lib/api';

export default function StudentBookmarksPage() {
  const { data: organsData, isLoading } = useQuery({
    queryKey: ['organs'],
    queryFn: async () => {
      const res = await organsApi.list({ limit: 50 });
      return Array.isArray(res) ? res : (res as any)?.data || [];
    },
  });

  const organs = Array.isArray(organsData) ? organsData.slice(0, 4) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#10243A]">Saved Specimen Bookmarks</h1>
          <p className="text-xs text-gray-500 mt-1">
            Quick access to anatomical structures pinned during dissection hall rounds or exam revision.
          </p>
        </div>
        <Link
          href="/organs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#10243A] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl transition"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse All Specimens</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organs.map((organ: any) => (
          <div
            key={organ.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  {organ.system?.name || 'Gross Anatomy'}
                </span>
                <Bookmark className="w-4 h-4 text-teal-600 fill-teal-600" />
              </div>
              <h3 className="text-base font-bold text-[#10243A]">{organ.name}</h3>
              <p className="text-xs text-[#0D9488] italic">{organ.latinName || organ.scientificName}</p>
              <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                {organ.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
              <Link
                href={`/o/${organ.slug}`}
                className="text-xs font-semibold text-[#2563EB] hover:text-blue-800 flex items-center gap-1"
              >
                <span>Go Ahead</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
