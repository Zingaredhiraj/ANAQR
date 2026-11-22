'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  Activity,
  Stethoscope,
  QrCode,
  Eye,
  ExternalLink,
  Printer,
  Download,
  Loader2,
  AlertTriangle,
  X,
  Check,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { apiClient } from '@/lib/api/client';
import { organsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function FacultyOrganEditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'physiology' | 'clinical' | 'qr'>('overview');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Review & Approval state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Approve & Publish Mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      await organsApi.updateStatus(id, 'APPROVED');
    },
    onSuccess: () => {
      toast.success('Organ approved & published! Live and accessible to all students and visitors.');
      queryClient.invalidateQueries({ queryKey: ['organs'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to approve organ');
    },
  });

  // Reject & Request Changes Mutation
  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      await organsApi.updateStatus(id, 'REJECTED', reason);
    },
    onSuccess: () => {
      toast.success('Organ rejected. Changes requested & forwarded back to Admin.');
      setIsRejectModalOpen(false);
      setRejectionReason('');
      setRejectError('');
      queryClient.invalidateQueries({ queryKey: ['organs'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reject organ');
    },
  });

  // 1. Fetch organ list / find current organ
  const { data: organsData, isLoading: isOrganLoading } = useQuery({
    queryKey: ['organs'],
    queryFn: () => organsApi.list({ limit: 100 }),
  });

  const organList = Array.isArray(organsData) ? organsData : (organsData as any)?.data || [];
  const organ = organList.find((o: any) => o.id === id);

  // 2. Fetch organ detailed content
  const { data: contentData, isLoading: isContentLoading } = useQuery({
    queryKey: ['organ-content', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/organs/${id}/content`);
        return res.data?.data || res.data;
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });

  // Local editable form state
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    latinName: '',
    location: '',
    description: '',
    bloodSupply: '',
    nerveSupply: '',
    normalFunctioning: '',
    clinicalCorrelation: '',
    diagnosticMethods: '',
  });

  // Sync state when data loads
  useEffect(() => {
    if (organ) {
      setFormData((prev) => ({
        ...prev,
        name: organ.name || '',
        scientificName: organ.scientificName || '',
        latinName: organ.latinName || '',
        location: organ.location || '',
        description: organ.description || '',
      }));
    }
  }, [organ]);

  useEffect(() => {
    if (contentData) {
      setFormData((prev) => ({
        ...prev,
        bloodSupply: contentData.bloodSupply || '',
        nerveSupply: contentData.nerveSupply || '',
        normalFunctioning: contentData.normalFunctioning || '',
        clinicalCorrelation: contentData.clinicalCorrelation || '',
        diagnosticMethods: contentData.diagnosticMethods || '',
      }));
    }
  }, [contentData]);

  // Generate QR for Tab
  useEffect(() => {
    if (organ?.slug) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
      const scanUrl = `${origin}/o/${organ.slug}`;
      QRCodeLib.toDataURL(scanUrl, {
        width: 350,
        margin: 2,
        color: { dark: '#10243A', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [organ?.slug]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // 1. Update basic organ details
      await apiClient.patch(`/organs/${id}`, {
        name: formData.name,
        scientificName: formData.scientificName || undefined,
        latinName: formData.latinName || undefined,
        location: formData.location || undefined,
        description: formData.description || undefined,
      });

      // 2. Update extended anatomical content
      await apiClient.put(`/organs/${id}/content`, {
        bloodSupply: formData.bloodSupply,
        nerveSupply: formData.nerveSupply,
        normalFunctioning: formData.normalFunctioning,
        clinicalCorrelation: formData.clinicalCorrelation,
        diagnosticMethods: formData.diagnosticMethods,
      });
    },
    onSuccess: () => {
      toast.success('Specimen content saved successfully');
      queryClient.invalidateQueries({ queryKey: ['organs'] });
      queryClient.invalidateQueries({ queryKey: ['organ-content', id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save changes');
    },
  });

  const handlePrintPlacard = () => {
    if (!organ) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    const scanUrl = `${origin}/o/${organ.slug}`;

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Specimen Placard - ${organ.name}</title>
          <style>
            @page { size: A5 landscape; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #10243A; text-align: center; }
            .box { border: 3px solid #10243A; border-radius: 16px; padding: 24px; max-width: 500px; margin: 20px auto; }
            h1 { font-size: 26px; margin: 8px 0 2px 0; color: #10243A; }
            p { color: #0D9488; font-style: italic; margin: 0 0 16px 0; }
            img { width: 220px; height: 220px; margin: 0 auto; display: block; }
            .hint { font-size: 11px; color: #64748b; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>${organ.name}</h1>
            <p>${organ.latinName ? 'Lat. ' + organ.latinName : ''}</p>
            <img src="${qrDataUrl}" alt="QR Code" />
            <div class="hint">Scan with mobile camera to view interactive 3D specimen in Augmented Reality</div>
          </div>
          <script>window.onload = () => { window.print(); }<\/script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !organ) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `AnatoScan-${organ.slug}-QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR Code downloaded');
  };

  if (isOrganLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
        <p className="text-xs text-gray-500">Loading specimen authoring suite...</p>
      </div>
    );
  }

  if (!organ) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-4">
        <h2 className="text-base font-bold text-gray-900">Specimen Not Found</h2>
        <p className="text-xs text-gray-500">The requested anatomical organ could not be found.</p>
        <button
          onClick={() => router.push('/faculty/organs')}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to My Organs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/faculty/organs')}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 transition"
            title="Back to organs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{organ.name} – Content Editor</h1>
            <p className="text-xs text-teal-700 italic">
              {organ.latinName ? `Lat. ${organ.latinName}` : organ.scientificName || 'Anatomical Specimen'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/o/${organ.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition"
          >
            <Eye className="w-3.5 h-3.5 text-gray-500" />
            <span>Student View</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>

          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0b827a] text-white text-xs font-semibold px-4 py-2 text-center rounded-xl transition shadow-xs disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>

          {/* Faculty Approval & Rejection Actions */}
          {organ.status !== 'APPROVED' ? (
            <>
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 text-center rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {approveMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Approve & Publish</span>
              </button>

              <button
                onClick={() => setIsRejectModalOpen(true)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 text-center rounded-xl transition shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Request Changes</span>
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Published & Live</span>
            </span>
          )}
        </div>
      </div>

      {/* Review Workflow Status Banner */}
      {organ.status === 'PENDING_REVIEW' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-900">Faculty Review Required</h4>
            <p className="text-xs text-blue-700 mt-0.5">
              Administration added this organ and forwarded it for faculty approval. Please review anatomical content, 3D structures, and physiological notes. When ready, click <strong>Approve & Publish</strong> to make it live for students, or <strong>Request Changes</strong> to return it with required revisions.
            </p>
          </div>
        </div>
      )}

      {organ.status === 'REJECTED' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900">Changes Requested from Administration</h4>
            <div className="text-xs text-amber-900 mt-1 font-medium bg-white/80 p-3 rounded-xl border border-amber-200">
              &ldquo;{organ.revisions?.find((r: any) => r.fieldName === 'review_feedback')?.note || organ.revisions?.[0]?.note || 'Anatomical descriptions or landmarks need further refinement before publication.'}&rdquo;
            </div>
            <p className="text-[11px] text-amber-700 mt-1.5">
              This feedback was forwarded back to Administration. Once changes are satisfied, click <strong>Approve & Publish</strong>.
            </p>
          </div>
        </div>
      )}

      {organ.status === 'APPROVED' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Approved & Published</h4>
              <p className="text-xs text-emerald-700">
                This organ is fully verified by faculty and actively published. Medical students, visitors, and everyone can explore it in 3D and WebAR.
              </p>
            </div>
          </div>
          <a
            href={`/o/${organ.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 ml-4"
          >
            Open Live Specimen ➔
          </a>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-gray-200 pb-2">
        {[
          { key: 'overview', label: 'Overview & Anatomy', icon: BookOpen },
          { key: 'physiology', label: 'Physiology & Circulation', icon: Activity },
          { key: 'clinical', label: 'Clinical & Diagnostics', icon: Stethoscope },
          { key: 'qr', label: 'QR Placard', icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#10243A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Common Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Heart"
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Latin Name / Nomenclature
                </label>
                <input
                  type="text"
                  value={formData.latinName}
                  onChange={(e) => setFormData({ ...formData, latinName: e.target.value })}
                  placeholder="e.g. Cor"
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 italic"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Scientific Name
                </label>
                <input
                  type="text"
                  value={formData.scientificName}
                  onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                  placeholder="e.g. Cardiac Muscle / Cor"
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Topographical Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Middle mediastinum of thorax"
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Anatomical Description & Overview
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write an overview of this organ's structure, boundaries, and anatomical significance..."
                className="w-full text-xs border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Physiology */}
        {activeTab === 'physiology' && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Normal Physiological Functioning
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                Describe normal functioning, physiological cycles, mechanics, and filtration/pumping dynamics.
              </p>
              <textarea
                rows={6}
                value={formData.normalFunctioning}
                onChange={(e) => setFormData({ ...formData, normalFunctioning: e.target.value })}
                placeholder="Explain the physiological mechanisms and dynamics..."
                className="w-full text-xs border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Blood Supply & Perfusion
                </label>
                <textarea
                  rows={4}
                  value={formData.bloodSupply}
                  onChange={(e) => setFormData({ ...formData, bloodSupply: e.target.value })}
                  placeholder="Arterial branching and venous drainage pathways..."
                  className="w-full text-xs border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Innervation & Nerve Supply
                </label>
                <textarea
                  rows={4}
                  value={formData.nerveSupply}
                  onChange={(e) => setFormData({ ...formData, nerveSupply: e.target.value })}
                  placeholder="Sympathetic, parasympathetic, and somatic plexus connections..."
                  className="w-full text-xs border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Clinical */}
        {activeTab === 'clinical' && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Clinical Correlations & Pathology Notes
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                Key clinical conditions, signs, anomalies, or syndromes associated with this specimen.
              </p>
              <textarea
                rows={5}
                value={formData.clinicalCorrelation}
                onChange={(e) => setFormData({ ...formData, clinicalCorrelation: e.target.value })}
                placeholder="Describe relevant clinical pathologies, lesions, and symptoms..."
                className="w-full text-xs border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Diagnostic & Imaging Methods
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                Imaging modalities used in clinical evaluation (e.g. Ultrasound, CT, MRI, Angiography).
              </p>
              <textarea
                rows={4}
                value={formData.diagnosticMethods}
                onChange={(e) => setFormData({ ...formData, diagnosticMethods: e.target.value })}
                placeholder="Detail imaging and clinical diagnostics..."
                className="w-full text-xs border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Tab 4: QR Placard */}
        {activeTab === 'qr' && (
          <div className="max-w-xl space-y-5">
            <div className="p-6 rounded-2xl border border-gray-200 bg-slate-50 flex flex-col items-center text-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${organ.name}`}
                  className="w-56 h-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xs mb-4"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center bg-gray-100 rounded-xl mb-4">
                  <QrCode className="w-10 h-10 text-gray-400 animate-pulse" />
                </div>
              )}

              <h3 className="text-base font-bold text-gray-900">{organ.name}</h3>
              <p className="text-xs text-teal-700 italic mt-0.5">
                {organ.latinName ? `Lat. ${organ.latinName}` : ''}
              </p>
              <p className="text-xs text-gray-500 mt-2 max-w-sm">
                Students scan this QR code with their mobile device to launch the interactive 3D model in Augmented Reality.
              </p>

              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={handlePrintPlacard}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#10243A] hover:bg-[#163554] rounded-xl transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Placard</span>
                </button>

                <button
                  onClick={handleDownloadQR}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rejection / Request Changes Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-gray-900">Reject & Request Changes</h3>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Please explain why this organ is rejected and what anatomical, clinical, or 3D changes Administration needs to perform. This description will be forwarded directly back to the Admin.
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
                onClick={() => setIsRejectModalOpen(false)}
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
                  rejectMutation.mutate(rejectionReason.trim());
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
