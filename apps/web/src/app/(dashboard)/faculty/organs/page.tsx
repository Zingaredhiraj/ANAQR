'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  ArrowLeft,
  AlertTriangle,
  Check,
  X,
  RotateCcw,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { organsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function FacultyOrgansListPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');

  // Rejection modal state
  const [rejectModalOrgan, setRejectModalOrgan] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const { data: organsData, isLoading } = useQuery({
    queryKey: ['organs'],
    queryFn: () => organsApi.list({ limit: 100 }),
  });

  const organs = Array.isArray(organsData) ? organsData : (organsData as any)?.data || [];

  // Extract unique systems
  const systems = useMemo(() => {
    const set = new Set<string>();
    organs.forEach((o: any) => {
      const name = o.anatomicalSystem?.name || o.system?.name;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [organs]);

  // Counts for tabs
  const pendingCount = useMemo(
    () => organs.filter((o: any) => o.status === 'PENDING_REVIEW').length,
    [organs]
  );
  const approvedCount = useMemo(
    () => organs.filter((o: any) => o.status === 'APPROVED' || o.isPublished).length,
    [organs]
  );
  const rejectedCount = useMemo(
    () => organs.filter((o: any) => o.status === 'REJECTED').length,
    [organs]
  );

  // Filter organs
  const filtered = useMemo(() => {
    return organs.filter((organ: any) => {
      const systemName = organ.anatomicalSystem?.name || organ.system?.name || '';
      const matchesSystem = selectedSystem === 'ALL' || systemName === selectedSystem;
      const matchesSearch =
        !searchTerm ||
        organ.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (organ.latinName && organ.latinName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (organ.scientificName && organ.scientificName.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = true;
      if (selectedStatus === 'PENDING_REVIEW') matchesStatus = organ.status === 'PENDING_REVIEW';
      else if (selectedStatus === 'APPROVED') matchesStatus = organ.status === 'APPROVED' || organ.isPublished;
      else if (selectedStatus === 'REJECTED') matchesStatus = organ.status === 'REJECTED';

      return matchesSystem && matchesSearch && matchesStatus;
    });
  }, [organs, selectedSystem, searchTerm, selectedStatus]);

  // Quick Approve Mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => organsApi.updateStatus(id, 'APPROVED'),
    onSuccess: () => {
      toast.success('Organ approved & published! Live for students and visitors.');
      queryClient.invalidateQueries({ queryKey: ['organs'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to approve organ');
    },
  });

  // Quick Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      organsApi.updateStatus(id, 'REJECTED', reason),
    onSuccess: () => {
      toast.success('Organ rejected. Changes requested & forwarded back to Admin.');
      setRejectModalOrgan(null);
      setRejectionReason('');
      setRejectError('');
      queryClient.invalidateQueries({ queryKey: ['organs'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reject organ');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Faculty Organ Review & Curriculum Authoring</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review organs forwarded by Administration, verify clinical accuracy, and Approve to publish live for medical students.
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

      {/* Review Workflow Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        {[
          { key: 'ALL', label: 'All Specimens', count: organs.length },
          { key: 'PENDING_REVIEW', label: 'Pending Review', count: pendingCount, highlight: pendingCount > 0 },
          { key: 'APPROVED', label: 'Approved & Live', count: approvedCount },
          { key: 'REJECTED', label: 'Changes Requested', count: rejectedCount },
        ].map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#10243A] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  tab.highlight
                    ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                    : isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specimen by English or Latin name..."
            className="w-full text-xs border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>

        <select
          value={selectedSystem}
          onChange={(e) => setSelectedSystem(e.target.value)}
          className="text-xs border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
        >
          <option value="ALL">All Anatomical Systems</option>
          {systems.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-200">
          <p className="text-xs text-gray-500">Loading specimens...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white rounded-2xl border border-gray-200">
          <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-800">No Specimens Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your status or search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((organ: any) => {
            const isApproved = organ.status === 'APPROVED' || organ.isPublished;
            const isPending = organ.status === 'PENDING_REVIEW';
            const isRejected = organ.status === 'REJECTED';
            const feedbackNote =
              organ.revisions?.find((r: any) => r.fieldName === 'review_feedback')?.note ||
              organ.revisions?.[0]?.note;

            return (
              <div
                key={organ.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                  isPending
                    ? 'border-blue-300 ring-1 ring-blue-100'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-gray-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100 uppercase tracking-wider">
                      {organ.anatomicalSystem?.name || organ.system?.name || 'Anatomy'}
                    </span>
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        isApproved
                          ? 'text-emerald-700'
                          : isPending
                          ? 'text-blue-700'
                          : isRejected
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Approved & Live</span>
                        </>
                      ) : isPending ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Pending Review</span>
                        </>
                      ) : isRejected ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Changes Requested</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{organ.name}</h3>
                  <p className="text-xs text-teal-700 italic font-medium mt-0.5">
                    {organ.latinName ? `Lat. ${organ.latinName}` : organ.scientificName || ''}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-3 mt-2 leading-relaxed">
                    {organ.description || 'Clinical anatomy specimen module.'}
                  </p>

                  {/* Feedback display if rejected */}
                  {isRejected && feedbackNote && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 leading-snug">
                      <span className="font-bold">Requested Changes:</span> &ldquo;{feedbackNote}&rdquo;
                    </div>
                  )}

                  {/* Pending review callout banner */}
                  {isPending && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Forwarded by Admin for your review</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                  {/* Quick Approval / Rejection Action buttons */}
                  {!isApproved && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveMutation.mutate(organ.id)}
                        disabled={approveMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-2.5 rounded-xl transition shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectModalOrgan(organ);
                          setRejectionReason('');
                          setRejectError('');
                        }}
                        className="flex-1 flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-1.5 px-2.5 rounded-xl transition shadow-2xs"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Request Changes</span>
                      </button>
                    </div>
                  )}

                  {/* Editor and Preview links */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/faculty/organs/${organ.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#0D9488] hover:bg-[#0b827a] text-white text-xs font-semibold py-2 px-3 rounded-xl transition shadow-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Open Editor & Review</span>
                    </Link>
                    <a
                      href={`/o/${organ.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
                      title="Student AR View"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection / Request Changes Modal */}
      {rejectModalOrgan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Reject & Request Changes: {rejectModalOrgan.name}
                </h3>
              </div>
              <button
                onClick={() => setRejectModalOrgan(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Please explain why this organ is rejected and what anatomical or clinical changes Administration needs to perform. This description will be forwarded directly back to the Admin.
            </p>

            {rejectError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {rejectError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Required Changes / Rejection Description *
              </label>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setRejectError('');
                }}
                placeholder="e.g. Please clarify blood supply branching in the external structure and update the ventricular landmarks..."
                className="w-full text-xs border border-gray-300 rounded-xl p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRejectModalOrgan(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectMutation.isPending}
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    setRejectError('Please write the description of why the organ is rejected.');
                    return;
                  }
                  rejectMutation.mutate({
                    id: rejectModalOrgan.id,
                    reason: rejectionReason.trim(),
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Forwarding to Admin...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Forward Changes to Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
