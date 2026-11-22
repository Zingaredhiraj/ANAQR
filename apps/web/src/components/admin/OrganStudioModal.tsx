'use client';

import React, { useState, useMemo, useTransition } from 'react';
import {
  Sparkles,
  Download,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Eye,
  FileText,
  Share2,
} from 'lucide-react';
import { detectOrgan, extractDimensions } from '@/lib/three/organ-detection';
import { OrganDimensions, OrganType } from '@/lib/three/types';
import { Organ3DPreviewDynamic } from './organ-preview-wrapper';
import { getProceduralOrganGenerator } from '@/lib/three/organ-models';
import { exportOrganToGLB, downloadGLBBlob } from '@/lib/three/exporter';

const SAMPLE_DESCRIPTIONS: Record<string, string> = {
  Heart:
    'Human heart with four chambers, myocardial ventricles, aortic arch, pulmonary trunk, superior vena cava, and coronary arteries. Length 12 cm, width 9 cm, height 6 cm.',
  Lungs:
    'Human lungs with bilateral pulmonary lobes, cardiac notch on left lung, segmented trachea with cartilage rings, and branching bronchi. Width 240 mm, depth 180 mm, height 280 mm.',
  Kidney:
    'Human kidney with smooth renal cortex, medial hilum, renal artery, renal vein, suprarenal adrenal cap, and descending ureter. Length 11 cm, width 6 cm, thickness 4 cm.',
  Liver:
    'Human liver with large convex right lobe, triangular left lobe, falciform ligament boundary, gallbladder in visceral fossa, and inferior vena cava. Length 16 cm, width 22 cm, height 12 cm.',
  Brain:
    'Human brain with bilateral cerebral hemispheres, gyri and sulci surface displacement, posterior cerebellum, and descending pons brainstem. Length 160 mm, width 140 mm, height 120 mm.',
  Femur:
    'Human femur bone with spherical articular head, femoral neck, greater trochanter, cortical shaft with anterior bow, and distal bicondylar knee knuckles. Length 45 cm, width 8 cm, height 8 cm.',
};

export default function OrganStudioModal() {
  const [description, setDescription] = useState(SAMPLE_DESCRIPTIONS.Heart);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Auto-detect organ from description
  const detectionResult = useMemo(
    () => detectOrgan(description),
    [description]
  );

  const detectedOrgan = detectionResult?.organType ?? 'heart';

  // Extract dimensions or use default
  const extractedDims = useMemo(
    () => extractDimensions(description, detectedOrgan),
    [description, detectedOrgan]
  );

  const [customDims, setCustomDims] = useState<OrganDimensions | null>(null);

  // Active dimensions (custom sliders override extracted)
  const activeDims = customDims ?? extractedDims;

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setCustomDims(null); // Reset manual overrides when description changes
  };

  const handleExportGLB = async () => {
    try {
      setIsExporting(true);
      setExportSuccess(false);

      const generator = getProceduralOrganGenerator(detectedOrgan);
      if (!generator) throw new Error('Generator not found');

      const organGroup = generator(activeDims, { xray: false });
      const glbBlob = await exportOrganToGLB(organGroup);

      downloadGLBBlob(glbBlob, `${detectedOrgan}-model.glb`);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export GLB:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold tracking-wide uppercase">
              No-API-Key 3D Engine
            </span>
            <span className="text-xs text-slate-500">Three.js + R3F PBR</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            ANAQR Specimen 3D Studio
          </h2>
          <p className="text-sm text-slate-400">
            Generate and preview medical-grade procedural 3D organs from clinical text, fine-tune dimensions, and export ready-to-use AR models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportGLB}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : exportSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{exportSuccess ? 'GLB Exported!' : 'Export for AR (.GLB)'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right 3D View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Preset Prompts Pill Bar */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Sample Clinical Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SAMPLE_DESCRIPTIONS).map(([name, text]) => (
                <button
                  key={name}
                  onClick={() => {
                    setDescription(text);
                    setCustomDims(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    detectedOrgan.toLowerCase() === name.toLowerCase()
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Clinical Specimen Description
              </label>
              {detectionResult && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Detected: {detectionResult.organType} ({detectionResult.confidence} matches)
                </span>
              )}
            </div>

            <textarea
              value={description}
              onChange={handleDescriptionChange}
              rows={4}
              placeholder="Describe anatomical specimen, chambers, vessels, and dimensions in cm or mm..."
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Dimension Fine-Tuning Sliders */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Physical Dimensions (Metric)
              </span>
              <button
                onClick={() => setCustomDims(null)}
                className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
              >
                Reset to Extracted
              </button>
            </div>

            {/* Length / Depth */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Length (AP axis)</span>
                <span className="font-mono text-amber-300 font-semibold">
                  {activeDims.lengthMm} mm
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                value={activeDims.lengthMm}
                onChange={(e) =>
                  setCustomDims({
                    ...activeDims,
                    lengthMm: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Width (Transverse)</span>
                <span className="font-mono text-amber-300 font-semibold">
                  {activeDims.widthMm} mm
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                value={activeDims.widthMm}
                onChange={(e) =>
                  setCustomDims({
                    ...activeDims,
                    widthMm: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Height (Vertical)</span>
                <span className="font-mono text-amber-300 font-semibold">
                  {activeDims.heightMm} mm
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                value={activeDims.heightMm}
                onChange={(e) =>
                  setCustomDims({
                    ...activeDims,
                    heightMm: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right 3D Preview (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <Organ3DPreviewDynamic
            organType={detectedOrgan}
            dimensions={activeDims}
            className="h-[560px] w-full"
          />
        </div>
      </div>
    </div>
  );
}
