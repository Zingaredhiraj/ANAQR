'use client';

import { motion } from 'framer-motion';
import { Smartphone, Globe2, Box, Tag, Shield, ChevronRight } from 'lucide-react';

const benefits = [
  { icon: Box, label: 'Realistic 3D Anatomy', desc: 'High-fidelity GLB/GLTF models with anatomical mesh precision down to vessel-level detail.' },
  { icon: Smartphone, label: 'Augmented Reality', desc: 'Place organs on any flat surface at life-scale using native iOS/Android ARKit & ARCore.' },
  { icon: Tag, label: 'Interactive Hotspots', desc: 'Tap-to-annotate structures with linked anatomical descriptions and clinical notes.' },
  { icon: Globe2, label: 'No App Required', desc: 'Browser-native WebXR, Android Scene Viewer & iOS AR Quick Look. Pure URL access.' },
  { icon: Shield, label: 'Faculty Reviewed', desc: 'Every model and label is reviewed and approved by qualified anatomy faculty before publishing.' },
];

const compatBadges = [
  { label: 'WebXR API', color: 'bg-blue-100 text-blue-700' },
  { label: 'iOS AR Quick Look', color: 'bg-gray-100 text-gray-700' },
  { label: 'Android Scene Viewer', color: 'bg-green-100 text-green-700' },
  { label: 'Google Model Viewer', color: 'bg-red-100 text-red-700' },
  { label: 'Three.js WebGL', color: 'bg-orange-100 text-orange-700' },
];

export function ARBenefits() {
  return (
    <section id="ar-benefits" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider border border-purple-100 mb-6">
              <Smartphone className="w-3.5 h-3.5" />
              Spatial Learning Technology
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10243A] tracking-tight mb-5">
              Visualize Anatomy in Augmented Reality
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed mb-8">
              AnatoScan AR uses browser-native WebXR and platform-specific AR runtimes to place anatomically correct 3D models directly in the user's physical environment — no app installation, no headset.
            </p>

            <div className="space-y-5 mb-8">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#10243A] flex items-center justify-center shrink-0">
                    <b.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#10243A] text-sm">{b.label}</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed mt-0.5">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {compatBadges.map((b) => (
                <span key={b.label} className={`text-xs font-semibold px-3 py-1 rounded-full ${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative w-72 sm:w-80">
              {/* Phone frame */}
              <div className="relative rounded-[2.5rem] bg-gradient-to-b from-[#10243A] to-[#1e3a5f] p-3 shadow-2xl ring-1 ring-white/10">
                <div className="rounded-[2rem] bg-gradient-to-br from-blue-50 to-teal-50 overflow-hidden aspect-[9/16] flex flex-col items-center justify-center relative">
                  {/* AR UI mockup */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent" />
                  <div
                    className="absolute inset-4 rounded-xl border-2 border-dashed border-teal-400/60"
                    style={{ boxShadow: '0 0 24px rgba(13,148,136,0.3)' }}
                  />

                  {/* Heart SVG */}
                  <svg viewBox="0 0 200 200" className="w-28 h-28 relative z-10 drop-shadow-xl">
                    <path
                      d="M100 170 C100 170 20 110 20 65 C20 40 40 25 65 25 C82 25 95 35 100 45 C105 35 118 25 135 25 C160 25 180 40 180 65 C180 110 100 170 100 170Z"
                      fill="url(#grad1)"
                    />
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="100%" stopColor="#991B1B" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* AR indicator */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <div className="bg-black/70 backdrop-blur rounded-xl px-4 py-2 text-white text-xs font-semibold text-center">
                      AR Mode Active · Tap to place
                    </div>
                  </div>

                  {/* Hotspot dots */}
                  <div className="absolute top-24 right-16 w-5 h-5 rounded-full bg-teal-400 border-2 border-white shadow-lg animate-pulse flex items-center justify-center">
                    <ChevronRight className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="absolute top-32 left-16 w-5 h-5 rounded-full bg-blue-400 border-2 border-white shadow-lg animate-pulse" />
                </div>
              </div>

              {/* Floating label */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -right-8 top-1/4 bg-white rounded-xl px-3 py-2 shadow-lg text-xs font-semibold text-[#10243A] border border-gray-100"
              >
                Left Ventricle ↗
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
