'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { OrganDimensions, AnatomicalHotspot } from '@/lib/three/types';

interface OrganPreviewWrapperProps {
  organType: string;
  dimensions?: Partial<OrganDimensions>;
  xray?: boolean;
  showHotspots?: boolean;
  autoRotate?: boolean;
  onSelectHotspot?: (hotspot: AnatomicalHotspot | null) => void;
  className?: string;
}

export const Organ3DPreviewDynamic = dynamic(
  () => import('./Organ3DPreview'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] w-full rounded-2xl bg-[#050B1D] border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400/80 border-t-transparent animate-spin" />
        <span className="text-sm font-medium tracking-wide text-slate-300">
          Loading 3D Anatomy WebGL Canvas...
        </span>
      </div>
    ),
  }
);
