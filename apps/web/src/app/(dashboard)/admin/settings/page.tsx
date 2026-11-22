'use client';

import React, { useState } from 'react';
import { Settings, Save, Shield, Bell, Database, Globe, Sliders, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [institutionName, setInstitutionName] = useState('Department of Anatomy – Medical College');
  const [supportEmail, setSupportEmail] = useState('admin@anatoscan.edu');
  const [allowGuestBrowse, setAllowGuestBrowse] = useState(true);
  const [enableTelemetry, setEnableTelemetry] = useState(true);
  const [defaultArQuality, setDefaultArQuality] = useState('HIGH');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Platform configurations saved successfully');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-900">Platform Settings & Configurations</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Configure institutional parameters, AR visualization defaults, and access policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General & Institution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Institutional Profile */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Globe className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">Institutional Identity</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Institution / Department Name
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Administrator Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* AR & 3D Visualization Defaults */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Sliders className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-gray-900">Augmented Reality & 3D Engine</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Default 3D Mesh Precision
                </label>
                <select
                  value={defaultArQuality}
                  onChange={(e) => setDefaultArQuality(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="HIGH">High (Anatomical fidelity with 2K textures)</option>
                  <option value="MEDIUM">Balanced (Optimized for mobile browsers)</option>
                  <option value="LOW">Low Bandwidth (Fastest loading for clinical halls)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-semibold text-gray-900">Public Guest Specimen Browsing</h4>
                  <p className="text-[11px] text-gray-500">Allow unauthenticated students to preview approved anatomy catalogues</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowGuestBrowse}
                  onChange={(e) => setAllowGuestBrowse(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-semibold text-gray-900">Scan Telemetry & Audit Recording</h4>
                  <p className="text-[11px] text-gray-500">Record QR placard scans and assessment completions into institutional logs</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableTelemetry}
                  onChange={(e) => setEnableTelemetry(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Status */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Database className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">System Environment</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">PostgreSQL</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Connected :5433
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Redis Cache</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Connected :6379
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">NestJS API</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  v1.0 (Port 4000)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-500">Web Client</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Next.js 15 (Port 3001)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-navy-900 text-white p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">Security Stance</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Role-based access control enforces least-privilege principles across Super Admin, Faculty, and Student tiers.
            </p>
            <div className="pt-2 border-t border-slate-700 flex items-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>JWT + Argon2id Hash Verified</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
