import React from 'react';
import Link from 'next/link';
import { Layers, QrCode } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 flex flex-col justify-between p-4 md:p-8">
      {/* Brand Top Bar */}
      <header className="max-w-md mx-auto w-full pt-4">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-105 transition">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight block">
              AnatoScan <span className="text-teal-400">AR</span>
            </span>
            <span className="text-[10px] text-gray-400 tracking-wider uppercase block">
              Medical Anatomy Platform
            </span>
          </div>
        </Link>
      </header>

      {/* Auth Content Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-xs text-gray-500 pb-4">
        Authorized Access Only · Institutional Academic Portal · © AnatoScan
      </footer>
    </div>
  );
}
