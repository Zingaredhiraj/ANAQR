'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquare, ArrowLeft, Heart, Search } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function FacultyFeedbackPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/feedback');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const rawItems = Array.isArray(feedbackData) ? feedbackData : feedbackData?.data || [];

  const items = rawItems.filter((fb: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const organName = fb.organ?.name?.toLowerCase() || '';
    const comment = fb.comments?.toLowerCase() || '';
    return organName.includes(term) || comment.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-900">Student Comprehension & Feedback</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Real student responses and ratings on 3D anatomical accuracy and module clarity.
          </p>
        </div>

        <Link
          href="/faculty"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter feedback by organ name or keywords..."
          className="w-full text-xs border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        />
      </div>

      {/* Feedback Grid */}
      {isLoading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-200">
          <p className="text-xs text-gray-500">Loading student feedback...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white rounded-2xl border border-gray-200">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-800">No Feedback Submitted Yet</h3>
          <p className="text-xs text-gray-500 mt-1">
            Student feedback collected from AR specimen interactions will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((fb: any) => (
            <div
              key={fb.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100 uppercase">
                    {fb.organ?.name || 'General Feedback'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (fb.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{fb.comments || 'No comment provided'}"
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>{fb.isAnonymous ? 'Anonymous Student' : 'Enrolled Student'}</span>
                <span>{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : 'Recent'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
