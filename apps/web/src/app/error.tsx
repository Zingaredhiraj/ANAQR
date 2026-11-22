'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[AnatoScan AR Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#10243A] mb-2">Something Went Wrong</h1>
          <p className="text-sm text-gray-500 mb-8">
            An unexpected error occurred in the AnatoScan AR platform. Our team has been notified.
            {error?.digest && (
              <span className="block mt-2 font-mono text-xs text-gray-400">
                Reference: {error.digest}
              </span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#10243A] hover:bg-[#0d1f33] text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
