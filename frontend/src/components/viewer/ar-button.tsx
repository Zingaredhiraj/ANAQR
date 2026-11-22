'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Sparkles, AlertCircle } from 'lucide-react';

interface ARButtonProps {
  modelUrl: string;
  iosUsdzUrl?: string;
  organName: string;
}

export function ARButton({ modelUrl, iosUsdzUrl, organName }: ARButtonProps) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) {
      setPlatform('ios');
    } else if (/Android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  if (platform === 'ios') {
    return (
      <a
        href={iosUsdzUrl || modelUrl}
        rel="ar"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md hover:shadow-teal-500/20 transition-all transform active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-white" />
        <span>Launch iOS Quick Look AR</span>
      </a>
    );
  }

  if (platform === 'android') {
    return (
      <button
        onClick={() => {
          const mv = document.querySelector('model-viewer') as any;
          if (mv && mv.activateAR) {
            mv.activateAR();
          }
        }}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md hover:shadow-teal-500/20 transition-all transform active:scale-95"
      >
        <Smartphone className="w-4 h-4 text-white" />
        <span>Place in Classroom (WebXR / SceneViewer)</span>
      </button>
    );
  }

  // Desktop view
  return (
    <div className="flex items-center gap-2 bg-navy-900 border border-navy-700/80 px-3 py-1.5 rounded-lg text-xs text-gray-300">
      <Smartphone className="w-4 h-4 text-teal-400 shrink-0" />
      <span>Scan specimen QR code with smartphone to place {organName} in AR</span>
    </div>
  );
}
