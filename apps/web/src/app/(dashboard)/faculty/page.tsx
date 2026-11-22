'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  GraduationCap,
  ExternalLink,
  Search,
  FileEdit,
} from 'lucide-react';
import { organsApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function FacultyOverviewPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'DRAFT'>('ALL');

  const { data: organsData, isLoading } = useQuery({
    queryKey: ['organs'],
    queryFn: () => organsApi.list({ limit: 100 }),
  });

  const rawOrgans = Array.isArray(organsData) ? organsData : (organsData as any)?.data || [];

  const instructorName =
    user?.facultyProfile?.firstName
      ? `Dr. ${user.facultyProfile.firstName} ${user.facultyProfile.lastName ?? ''}`.trim()
      : user?.name || 'Faculty Instructor';

  // Derived stats
  const stats = useMemo(() => {
    const total = rawOrgans.length;
    const approved = rawOrgans.filter((o: any) => o.status === 'APPROVED').length;
    const drafts = total - approved;
    return { total, approved, drafts };
  }, [rawOrgans]);

  // Filtered organs
  const filteredOrgans = useMemo(() => {
    return rawOrgans.filter((organ: any) => {
      const matchesSearch =
        !searchTerm ||
        organ.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (organ.latinName && organ.latinName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (organ.anatomicalSystem?.name && organ.anatomicalSystem.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'APPROVED' && organ.status === 'APPROVED') ||
        (statusFilter === 'DRAFT' && organ.status !== 'APPROVED');

      return matchesSearch && matchesStatus;
    });
  }, [rawOrgans, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#10243A] via-[#163554] to-[#0D9488] p-6 md:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-300">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Anatomy Faculty Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {instructorName}
            </h1>
            <p className="text-xs text-gray-200 leading-relaxed">
              Curate anatomical learning content, review specimen descriptions, and generate QR placards for dissection halls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/faculty/organs"
              className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0b827a] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Author Content</span>
            </Link>
            <Link
              href="/faculty/qr"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/20 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Placards</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative background blur */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Catalogued Specimens</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            <span className="text-[11px] text-gray-400">Total anatomy modules</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Live in AR Catalogue</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{stats.approved}</h3>
            <span className="text-[11px] text-gray-400">Published to students</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">In Preparation / Draft</p>
            <h3 className="text-2xl font-bold text-amber-700 mt-1">{stats.drafts}</h3>
            <span className="text-[11px] text-gray-400">Content awaiting review</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specimen by name, Latin term, or system..."
            className="w-full text-xs border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-300 text-xs">
          {(['ALL', 'APPROVED', 'DRAFT'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === status
                  ? 'bg-[#10243A] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status === 'ALL' ? 'All Organs' : status === 'APPROVED' ? 'Approved' : 'Drafts'}
            </button>
          ))}
        </div>
      </div>

      {/* Specimen Modules Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Anatomical Specimen Modules</h2>
          <span className="text-xs text-gray-500">
            Showing {filteredOrgans.length} of {rawOrgans.length}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-200">
            <p className="text-xs text-gray-500">Loading anatomy catalogue...</p>
          </div>
        ) : filteredOrgans.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white rounded-2xl border border-gray-200">
            <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-800">No Specimens Found</h3>
            <p className="text-xs text-gray-500 mt-1">No specimens match your current search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrgans.map((organ: any) => {
              const isApproved = organ.status === 'APPROVED';
              return (
                <div
                  key={organ.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100 uppercase tracking-wider">
                        {organ.anatomicalSystem?.name || organ.system?.name || 'General Anatomy'}
                      </span>
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          isApproved ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Draft</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#10243A] group-hover:text-[#0D9488] transition-colors">
                      {organ.name}
                    </h3>
                    <p className="text-xs text-teal-700 italic font-medium mt-0.5">
                      {organ.latinName ? `Lat. ${organ.latinName}` : organ.scientificName || ''}
                    </p>

                    <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                      {organ.description || 'Anatomical model with 3D visualization, mechanics, and quizzes.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/faculty/organs/${organ.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:text-teal-800 transition"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/faculty/qr`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                        title="View QR code"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>QR</span>
                      </Link>

                      <a
                        href={`/o/${organ.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                        title="Open student AR view"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
