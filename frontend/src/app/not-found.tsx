import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 – Page Not Found | AnatoScan AR',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#10243A] flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-[#10243A]">AnatoScan AR</span>
        </div>

        {/* 404 Display */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#2563EB] to-[#0D9488] mb-4">
            404
          </div>
          <h1 className="text-xl font-bold text-[#10243A] mb-2">
            Specimen Not Located
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            The anatomical resource you scanned or navigated to does not exist in our catalogue.
            It may have been moved, removed, or the QR code is invalid.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#10243A] hover:bg-[#0d1f33] text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/organs"
              className="inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0b827a] text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
            >
              Browse Organs
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          If you believe this is an error, please contact your anatomy department administrator.
        </p>
      </div>
    </div>
  );
}
