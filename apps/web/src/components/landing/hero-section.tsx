'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Layers,
  Activity,
  Heart,
  ArrowRight,
  ShieldCheck,
  Zap,
  QrCode,
} from 'lucide-react';

const stats = [
  { icon: Layers, label: '15 High-Fidelity 3D Organs', color: 'text-teal-400' },
  { icon: Activity, label: 'Real-Time Vitals HUD', color: 'text-rose-400' },
  { icon: Zap, label: 'Bedside WebAR Integration', color: 'text-amber-400' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-24 pb-14 overflow-hidden bg-gradient-to-b from-[#07111E] via-[#0A1626] to-[#07111E]">
      {/* Background medical ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(13,148,136,0.18),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Focused Medical Headline */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Medical Anatomy & Spatial Informatics</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]"
            >
              Scan. Place.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
                Explore Anatomy.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed"
            >
              Interactive 3D anatomical organ specimens with procedural PBR materials, real-time hemodynamic simulations, and direct clinical correlation for medical students and clinicians.
            </motion.p>

            {/* Quick Curriculum Specimen Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-2.5 pt-2"
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200"
                >
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  <span>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Modern Medical 3D Specimen Showcase Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl bg-gradient-to-b from-[#0D1C2E] to-[#08121E] border border-teal-500/30 p-6 shadow-2xl shadow-teal-500/10 overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
                    <Heart className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Heart (Cor)</h3>
                    <p className="text-[10px] text-slate-400">Cardiovascular Specimen • Full 360°</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>72 BPM PULSE</span>
                </span>
              </div>

              {/* Specimen Visual Showcase */}
              <div className="py-6 flex flex-col items-center justify-center text-center relative">
                {/* Glowing holographic orb behind specimen */}
                <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-rose-600/25 via-teal-500/20 to-blue-600/25 filter blur-xl absolute" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mb-4 shadow-xl group hover:scale-105 transition-transform">
                    <Heart className="w-12 h-12 text-rose-500 animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
                  </div>
                  <h4 className="text-base font-bold text-white">Human Cardiovascular Specimen</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Anterior interventricular sulcus, LAD artery, aortic arch with 3 branches, and pulmonary vessels.
                  </p>
                </div>
              </div>

              {/* Card Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-white/10 text-center text-xs">
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Stroke Vol</span>
                  <span className="font-bold text-white">70 mL</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Cardiac Out</span>
                  <span className="font-bold text-teal-300">5.0 L/m</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Ejection Frac</span>
                  <span className="font-bold text-white">62%</span>
                </div>
              </div>

              {/* Quick Launch Button */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Clinical PBR Specimen</span>
                </span>

                <Link
                  href="/scan"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all shadow-md shadow-teal-500/20 active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
