import React from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode } from 'lucide-react';
import { QRScanner } from '@/components/qr/qr-scanner';

export const metadata = {
  title: 'Scan Specimen QR | AnatoScan AR',
  description: 'Point your camera at any AnatoScan QR label to unlock interactive 3D and AR anatomy learning modules.',
};

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-md mx-auto w-full">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Scanner</span>
        </Link>
        <div className="flex items-center gap-1.5 text-teal-400 text-sm font-semibold">
          <QrCode className="w-4 h-4" />
          <span>AnatoScan AR</span>
        </div>
      </header>

      {/* Main Scanner Container */}
      <main className="my-auto py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Scan</h1>
          <p className="text-xs text-gray-400 mt-1">
            Aim at cadaveric specimens, plastinated models, or department study boards
          </p>
        </div>
        <QRScanner />
      </main>

      {/* Bottom Footer Info */}
      <footer className="max-w-md mx-auto w-full text-center text-xs text-gray-500 py-2">
        Anatomy Dissection Hall · Faculty of Medicine · AnatoScan AR v1.0
      </footer>
    </div>
  );
}
