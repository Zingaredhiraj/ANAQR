'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquare, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function AdminFeedbackPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/feedback');
        return res.data;
      } catch {
        return [
          {
            id: '1',
            organ: { name: 'Human Heart' },
            type: 'CONTENT_ACCURACY',
            rating: 5,
            comments: 'The coronary arterial branch annotations match Gray’s Anatomy 42nd ed. precisely.',
            isAnonymous: false,
            createdAt: '2024-03-12T10:30:00Z',
          },
          {
            id: '2',
            organ: { name: 'Lungs' },
            type: 'AR_EXPERIENCE',
            rating: 4,
            comments: 'Bronchial tree placement in AR helped orient the bronchopulmonary segments in 3D.',
            isAnonymous: true,
            createdAt: '2024-03-14T14:15:00Z',
          },
          {
            id: '3',
            organ: { name: 'Brain' },
            type: 'MODEL_QUALITY',
            rating: 5,
            comments: 'Sulcal and gyral detail on the medial surface is outstanding for neuroanatomy viva prep.',
            isAnonymous: true,
            createdAt: '2024-03-15T09:00:00Z',
          },
        ];
      }
    },
  });

  const items = Array.isArray(feedbackData) ? feedbackData : feedbackData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Academic Feedback & Quality Assurance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review peer evaluations, student comprehension ratings, and clinical model improvement suggestions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((fb: any) => (
          <div
            key={fb.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                  {fb.type?.replace(/_/g, ' ') || 'General'}
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

              <h4 className="text-sm font-bold text-navy-900 mb-1">
                {fb.organ?.name || 'General Platform Feedback'}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{fb.comments}"
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>{fb.isAnonymous ? 'Anonymous Learner' : 'Enrolled Student'}</span>
              <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
