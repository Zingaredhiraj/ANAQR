'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QrCode, Download, Printer, ExternalLink, Sparkles, MapPin, Search } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { organsApi } from '@/lib/api';

interface OrganQRCardProps {
  organ: any;
}

function OrganQRCard({ organ }: OrganQRCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [locationLabel, setLocationLabel] = useState<string>('Anatomy Lab / Dissection Hall');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    const scanUrl = `${origin}/o/${organ.slug}`;

    QRCodeLib.toDataURL(scanUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#10243A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR', err));
  }, [organ.slug]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `AnatoScan-${organ.slug}-QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    const scanUrl = `${origin}/o/${organ.slug}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
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
              padding: 28px;
              width: 520px;
              text-align: center;
              box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            }
            .badge {
              display: inline-block;
              background: #0D9488;
              color: white;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 4px 14px;
              border-radius: 999px;
              margin-bottom: 12px;
            }
            .title {
              font-size: 26px;
              font-weight: 800;
              margin: 0;
              color: #10243A;
            }
            .latin {
              font-size: 15px;
              font-style: italic;
              color: #0D9488;
              margin: 4px 0 16px 0;
            }
            .qr-frame {
              background: #F8FAFC;
              padding: 16px;
              border-radius: 16px;
              display: inline-block;
              border: 1px solid #E2E8F0;
              margin: 12px 0;
            }
            .qr-frame img {
              width: 220px;
              height: 220px;
              display: block;
            }
            .instructions {
              font-size: 13px;
              font-weight: 600;
              color: #1E293B;
              margin: 12px 0 4px 0;
            }
            .subtext {
              font-size: 11px;
              color: #64748B;
              margin: 0;
            }
            .location-tag {
              margin-top: 14px;
              font-size: 10px;
              color: #475569;
              font-family: monospace;
              border-top: 1px dashed #CBD5E1;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="placard">
            <span class="badge">Anatomy Department Specimen</span>
            <h1 class="title">${organ.name}</h1>
            <p class="latin">${organ.latinName || organ.scientificName || 'Human Anatomical Specimen'}</p>
            <div class="qr-frame">
              <img src="${qrDataUrl}" alt="${organ.name} QR" />
            </div>
            <p class="instructions">📱 Scan with Smartphone Camera to Explore in 3D / AR</p>
            <p class="subtext">No registration required for students or visitors • Works on iOS & Android</p>
            <div class="location-tag">
              Station / Location: ${locationLabel} | Target URL: ${scanUrl}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 uppercase tracking-wider">
            {organ.system?.name || 'Anatomy'}
          </span>
          <span className="text-[11px] text-gray-400 font-mono">
            /o/{organ.slug}
          </span>
        </div>

        <h3 className="text-base font-bold text-navy-900">{organ.name}</h3>
        <p className="text-xs text-teal-700 italic font-medium">
          {organ.scientificName || organ.latinName || 'Human Specimen'}
        </p>

        {/* Physical Placement Input */}
        <div className="mt-3 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="e.g. Lab Station 3, Museum Shelf A..."
            className="bg-transparent text-gray-700 w-full text-[11px] outline-none"
            title="Physical label location for printing"
          />
        </div>

        {/* QR Placard Preview */}
        <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR for ${organ.name}`}
              className="w-40 h-40 object-contain rounded-lg shadow-sm bg-white p-2 border"
            />
          ) : (
            <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <QrCode className="w-8 h-8 animate-pulse" />
            </div>
          )}
          <span className="text-[10px] text-gray-500 font-mono mt-2">
            Instant Public Scan
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold py-2 px-3 rounded-lg transition"
            title="Print Physical Placard to paste in lab or museum"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Placard</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 px-3 rounded-lg transition"
            title="Download PNG sticker"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>
          <a
            href={`/o/${organ.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-navy-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
            title="Test student scan destination"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminQRCodesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: organsData, isLoading } = useQuery({
    queryKey: ['organs'],
    queryFn: async () => {
      const res = await organsApi.list({ limit: 100 });
      return Array.isArray(res) ? res : (res as any)?.data || [];
    },
  });

  const rawOrgans = Array.isArray(organsData) ? organsData : [];

  const organs = rawOrgans.filter((o: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.name?.toLowerCase().includes(term) ||
      (o.latinName && o.latinName.toLowerCase().includes(term)) ||
      (o.scientificName && o.scientificName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Physical Specimen QR Placard Generator</h1>
          <p className="text-xs text-gray-500 mt-1">
            Print ready-to-paste physical QR code cards for dissection tables, museum jars, and anatomical library shelves.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specimen..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Guest/Student Scanning Workflow Info Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-navy-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Zero-Friction Physical Learning Workflow
          </span>
          <p className="text-gray-600">
            Physical QR codes open directly to the organ's interactive 3D model, AR viewer, and 3 clinical modules. 
            <strong> Registration and login are strictly optional</strong> for visiting students and anatomy guests.
          </p>
        </div>
      </div>

      {/* Grid of Specimen QR Badges */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
          Loading specimen QR placards...
        </div>
      ) : organs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-2">
          <QrCode className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">No anatomical specimens found</p>
          <p className="text-xs text-gray-400">Add an organ in the Organ Inventory to generate its QR placard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organs.map((organ: any) => (
            <OrganQRCard key={organ.id} organ={organ} />
          ))}
        </div>
      )}
    </div>
  );
}
