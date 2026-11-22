'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  QrCode,
  CheckCircle,
  Clock,
  Sparkles,
  X,
  Layers,
  BookOpen,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ClipboardPaste,
  FileImage,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { organsApi, systemsApi } from '@/lib/api';

type AngleKey = 'anterior' | 'posterior' | 'lateral' | 'superior';

export default function AdminOrgansPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Hidden file inputs for genuine local disk upload
  const fileInputRefs = {
    anterior: useRef<HTMLInputElement>(null),
    posterior: useRef<HTMLInputElement>(null),
    lateral: useRef<HTMLInputElement>(null),
    superior: useRef<HTMLInputElement>(null),
  };

  // Form state for creating a new organ
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    latinName: '',
    systemId: '',
    location: '',
    description: '',
  });

  // Multiple angle photos state: base64/URL preview data
  const [uploadedAngles, setUploadedAngles] = useState<Record<AngleKey, string | null>>({
    anterior: null,
    posterior: null,
    lateral: null,
    superior: null,
  });

  // Direct paste URL inputs for each angle
  const [pasteUrls, setPasteUrls] = useState<Record<AngleKey, string>>({
    anterior: '',
    posterior: '',
    lateral: '',
    superior: '',
  });

  const [activeTabAngle, setActiveTabAngle] = useState<'upload' | 'paste'>('upload');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch organs list
  const { data: organsData, isLoading } = useQuery({
    queryKey: ['organs', { search: searchTerm, systemId: selectedSystem }],
    queryFn: async () => {
      const res = await organsApi.list({ search: searchTerm || undefined, limit: 100 });
      return Array.isArray(res) ? res : (res as any)?.data || [];
    },
  });

  // Fetch anatomical systems
  const { data: systemsData } = useQuery({
    queryKey: ['systems'],
    queryFn: async () => {
      const res = await systemsApi.list();
      return Array.isArray(res) ? res : (res as any)?.data || [];
    },
  });

  const systems = Array.isArray(systemsData) ? systemsData : [];
  const rawOrgans = Array.isArray(organsData) ? organsData : [];

  const organs = rawOrgans.filter((organ: any) => {
    if (selectedSystem && organ.system?.id !== selectedSystem) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = organ.name?.toLowerCase().includes(term);
      const matchLatin = organ.latinName?.toLowerCase().includes(term);
      const matchSci = organ.scientificName?.toLowerCase().includes(term);
      return matchName || matchLatin || matchSci;
    }
    return true;
  });

  // Create Organ Mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => organsApi.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organs'] });
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        scientificName: '',
        latinName: '',
        systemId: '',
        location: '',
        description: '',
      });
      setUploadedAngles({
        anterior: null,
        posterior: null,
        lateral: null,
        superior: null,
      });
      setIsGenerating3D(false);
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to create organ. Please check required fields.');
      setIsGenerating3D(false);
    },
  });

  // Re-forward Organ to Faculty for Review
  const forwardMutation = useMutation({
    mutationFn: (organId: string) =>
      organsApi.updateStatus(organId, 'PENDING_REVIEW', 'Re-forwarded by Administration for faculty review'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organs'] });
    },
  });
  const handleLocalFileSelect = (angle: AngleKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedAngles((prev) => ({
        ...prev,
        [angle]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // 2. Direct web URL or clipboard paste handler
  const handleApplyPasteUrl = (angle: AngleKey) => {
    const url = pasteUrls[angle]?.trim();
    if (!url) return;
    setUploadedAngles((prev) => ({
      ...prev,
      [angle]: url,
    }));
  };

  // 3. Remove an uploaded angle
  const handleRemoveAngle = (angle: AngleKey, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedAngles((prev) => ({
      ...prev,
      [angle]: null,
    }));
    setPasteUrls((prev) => ({
      ...prev,
      [angle]: '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter an organ name.');
      return;
    }
    if (!formData.systemId) {
      setFormError('Please select an anatomical system.');
      return;
    }

    setIsGenerating3D(true);
    setTimeout(() => {
      createMutation.mutate(formData);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#10243A]">Anatomical Organ Inventory</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage institutional anatomical specimens, curate clinical modules, and generate physical QR placards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setFormError(null);
            }}
            className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0b827a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Organ</span>
          </button>
          <Link
            href="/admin/qr"
            className="flex items-center gap-2 bg-[#10243A] hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Print QR Placards</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specimen by English, Latin or scientific name..."
            className="w-full text-xs border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488] bg-white"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
          >
            <option value="">All Anatomical Systems</option>
            {systems.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Organs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-6">Specimen / Organ</th>
              <th className="py-3.5 px-6">System</th>
              <th className="py-3.5 px-6">Latin Nomenclature</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">3D & QR View</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  Loading anatomical specimens...
                </td>
              </tr>
            ) : organs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <div className="max-w-xs mx-auto space-y-3">
                    <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="font-medium text-gray-700">No anatomical specimens found</p>
                    <p className="text-[11px] text-gray-400">Click &ldquo;Add New Organ&rdquo; above to create your first anatomical specimen.</p>
                  </div>
                </td>
              </tr>
            ) : (
              organs.map((organ: any) => (
                <tr key={organ.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D9488] font-bold text-sm">
                        {organ.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{organ.name}</span>
                        <span className="text-[11px] text-gray-500">{organ.scientificName || 'Standard specimen'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700 font-medium">
                    {organ.system?.name || organ.anatomicalSystem?.name || 'Gross Anatomy'}
                  </td>
                  <td className="py-4 px-6 italic text-gray-500">
                    {organ.latinName || '-'}
                  </td>
                  <td className="py-4 px-6">
                    {organ.status === 'APPROVED' || organ.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Published & Live</span>
                      </span>
                    ) : organ.status === 'REJECTED' ? (
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Changes Requested</span>
                        </span>
                        <div className="max-w-xs text-[10px] text-rose-900 bg-rose-50/90 border border-rose-200 rounded-lg p-2 leading-relaxed">
                          <span className="font-bold">Faculty Feedback:</span>{' '}
                          &ldquo;{organ.revisions?.find((r: any) => r.fieldName === 'review_feedback')?.note || organ.revisions?.[0]?.note || 'Modifications required by faculty.'}&rdquo;
                        </div>
                        <button
                          onClick={() => forwardMutation.mutate(organ.id)}
                          disabled={forwardMutation.isPending}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-md transition shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Re-forward to Faculty</span>
                        </button>
                      </div>
                    ) : organ.status === 'PENDING_REVIEW' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>Forwarded to Faculty</span>
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Draft</span>
                        </span>
                        <button
                          onClick={() => forwardMutation.mutate(organ.id)}
                          disabled={forwardMutation.isPending}
                          className="block text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md transition"
                        >
                          Forward to Faculty
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/o/${organ.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive 3D</span>
                      </Link>
                      <Link
                        href="/admin/qr"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR</span>
                      </Link>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <Link
                      href={`/faculty/organs/${organ.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition"
                      title="Edit Educational Content"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <a
                      href={`/o/${organ.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gray-500 hover:text-[#10243A] p-1.5 rounded-lg hover:bg-gray-100 transition"
                      title="Preview Scan Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add New Organ with Multi-Angle File Selector & URL Paste Option */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#10243A] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>Catalog Organ & Upload Specimen Imagery</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select image files from your computer or paste image URLs. The backend synthesizes a 3D view and permanent QR placard.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Basic Meta Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Organ Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brain, Kidney, Spleen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Latin Nomenclature
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Encephalon, Ren"
                    value={formData.latinName}
                    onChange={(e) => setFormData({ ...formData, latinName: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Scientific Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cerebrum"
                    value={formData.scientificName}
                    onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Anatomical System *
                  </label>
                  <select
                    required
                    value={formData.systemId}
                    onChange={(e) => setFormData({ ...formData, systemId: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] bg-white"
                  >
                    <option value="">Select System...</option>
                    {systems.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Topographical Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cranial cavity, Mediastinum"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>

              {/* Multi-Angle Image Selection & Paste Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                      Attach Specimen Images (Select File or Paste Link)
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Upload from your device or paste image URLs for each angle to generate the 3D model.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActiveTabAngle('upload')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
                        activeTabAngle === 'upload'
                          ? 'bg-[#0D9488] text-white'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Select File
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTabAngle('paste')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
                        activeTabAngle === 'paste'
                          ? 'bg-[#0D9488] text-white'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                </div>

                {/* 4 Angle Upload / Paste Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    { key: 'anterior' as AngleKey, label: '1. Anterior View (Front)' },
                    { key: 'posterior' as AngleKey, label: '2. Posterior View (Back)' },
                    { key: 'lateral' as AngleKey, label: '3. Lateral Aspect (Side)' },
                    { key: 'superior' as AngleKey, label: '4. Superior / Cross-Section' },
                  ].map((angle) => {
                    const isUploaded = !!uploadedAngles[angle.key];
                    const imgUrl = uploadedAngles[angle.key];

                    return (
                      <div
                        key={angle.key}
                        className="bg-white border border-gray-200 rounded-2xl p-3 space-y-2 shadow-xs"
                      >
                        {/* Hidden Native File Input */}
                        <input
                          type="file"
                          ref={fileInputRefs[angle.key]}
                          accept="image/*"
                          onChange={(e) => handleLocalFileSelect(angle.key, e)}
                          className="hidden"
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-800">
                            {angle.label}
                          </span>
                          {isUploaded && (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveAngle(angle.key, e)}
                              className="text-red-500 hover:text-red-700 text-[10px] font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Image Preview Box or File Selector */}
                        {isUploaded && imgUrl ? (
                          <div className="relative h-28 w-full rounded-xl overflow-hidden border border-teal-500 bg-black/5 flex items-center justify-center">
                            <img
                              src={imgUrl}
                              alt={angle.label}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-teal-400" />
                              <span>Ready</span>
                            </div>
                          </div>
                        ) : activeTabAngle === 'upload' ? (
                          <div
                            onClick={() => fileInputRefs[angle.key].current?.click()}
                            className="h-28 w-full border-2 border-dashed border-gray-300 hover:border-teal-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-teal-50/30 p-2 text-center"
                          >
                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                            <span className="text-[11px] font-semibold text-gray-700">
                              Choose Image File
                            </span>
                            <span className="text-[9px] text-gray-400">
                              PNG, JPG, or WEBP from disk
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5 h-28 flex flex-col justify-center">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="url"
                                placeholder="Paste image URL here..."
                                value={pasteUrls[angle.key]}
                                onChange={(e) =>
                                  setPasteUrls({ ...pasteUrls, [angle.key]: e.target.value })
                                }
                                className="w-full text-[11px] border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-teal-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleApplyPasteUrl(angle.key)}
                                className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
                              >
                                Paste
                              </button>
                            </div>
                            <span className="text-[9px] text-gray-400">
                              Direct HTTPS link to specimen photo
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Overview & Anatomical Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Structural morphology, vascularization, and functional notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || isGenerating3D}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0b827a] rounded-xl transition shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isGenerating3D ? 'Synthesizing 3D Model & QR...' : 'Generate 3D & Save Specimen'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
