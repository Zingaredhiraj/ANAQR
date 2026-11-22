'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { QrCode, Download, Printer, ExternalLink, Search, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { organsApi } from '@/lib/api';
import { toast } from 'sonner';

interface FacultyQRCardProps {
  organ: any;
}

function FacultyQRCard({ organ }: FacultyQRCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    const scanUrl = `${origin}/o/${organ.slug}`;

    QRCodeLib.toDataURL(scanUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#10243A', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [organ.slug]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `AnatoScan-${organ.slug}-QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloaded QR code for ${organ.name}`);
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AnatoScan AR Specimen Placard - ${organ.name}</title>
          <style>
            @page { size: A5 landscape; margin: 12mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #10243A;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #fff;
            }
            .placard {
              border: 3px solid #10243A;
              border-radius: 20px;
              padding: 24px;
              width: 500px;
              text-align: center;
              box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            }
            .badge {
              display: inline-block;
              background: #0D9488;
              color: white;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              padding: 4px 12px;
              border-radius: 999px;
              margin-bottom: 8px;
            }
            h1 { font-size: 26px; font-weight: 800; margin: 4px 0 2px 0; color: #10243A; }
            .latin { font-style: italic; color: #0D9488; font-size: 14px; margin-bottom: 16px; }
            .qr-wrap { display: inline-block; padding: 12px; background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; margin: 8px auto; }
            img { width: 200px; height: 200px; display: block; }
            .desc { font-size: 11px; color: #64748b; margin-top: 12px; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="placard">
            <span class="badge">AnatoScan AR • Dissection Specimen</span>
            <h1>${organ.name}</h1>
            <div class="latin">${organ.latinName ? 'Lat. ' + organ.latinName : ''}</div>
            <div class="qr-wrap">
              <img src="${qrDataUrl}" alt="${organ.name} QR Code" />
            </div>
            <div class="desc">
              Scan with smartphone camera to launch the interactive 3D anatomy model in Augmented Reality.
            </div>
          </div>
          <script>window.onload = () => { window.print(); }<\/script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between items-center text-center">
      <div className="w-full">
        <div className="flex items-center justify-between mb-3 w-full">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100 uppercase">
            {organ.anatomicalSystem?.name || organ.system?.name || 'Anatomy'}
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready</span>
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 inline-block mb-3">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`${organ.name} QR`} className="w-36 h-36 rounded-lg" />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center bg-gray-100 rounded-lg">
              <QrCode className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-gray-900">{organ.name}</h3>
        <p className="text-xs text-teal-700 italic mt-0.5">
          {organ.latinName ? `Lat. ${organ.latinName}` : organ.scientificName || ''}
        </p>
      </div>

      <div className="w-full pt-4 mt-4 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-[#10243A] hover:bg-[#163554] rounded-xl transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>

        <button
          onClick={handleDownload}
          className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition"
          title="Download PNG"
        >
          <Download className="w-4 h-4" />
        </button>

        <a
          href={`/o/${organ.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition"
          title="Student AR Preview"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default function FacultyQRPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('ALL');

  const { data: organsData, isLoading } = useQuery({
    queryKey: ['organs'],
    queryFn: () => organsApi.list({ limit: 100 }),
  });

  const organs = Array.isArray(organsData) ? organsData : (organsData as any)?.data || [];

  const systems = useMemo(() => {
    const set = new Set<string>();
    organs.forEach((o: any) => {
      const name = o.anatomicalSystem?.name || o.system?.name;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [organs]);

  const filtered = useMemo(() => {
    return organs.filter((organ: any) => {
      const systemName = organ.anatomicalSystem?.name || organ.system?.name || '';
      const matchesSystem = selectedSystem === 'ALL' || systemName === selectedSystem;
      const matchesSearch =
        !searchTerm ||
        organ.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (organ.latinName && organ.latinName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSystem && matchesSearch;
    });
  }, [organs, selectedSystem, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-900">Dissection Hall QR Placards</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Download and print tabletop QR placards to place beside anatomical cadaveric specimens and physical models.
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specimen placard by name..."
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

      {/* Placards Grid */}
      {isLoading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-200">
          <p className="text-xs text-gray-500">Generating QR placards...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white rounded-2xl border border-gray-200">
          <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-800">No Specimens Found</h3>
          <p className="text-xs text-gray-500 mt-1">No specimens match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((organ: any) => (
            <FacultyQRCard key={organ.id} organ={organ} />
          ))}
        </div>
      )}
    </div>
  );
}
