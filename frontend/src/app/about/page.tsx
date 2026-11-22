import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  Activity,
  Layers,
  ShieldCheck,
  GraduationCap,
  Microscope,
  Stethoscope,
  Globe,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Heart,
  Brain,
  Boxes,
  Cpu,
  Users,
  BookOpen,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata = {
  title: 'About AnatoScan AR | Clinical Spatial Anatomy & Specimen Digitization',
  description:
    'Learn how AnatoScan AR empowers medical schools, dissection halls, and healthcare educators through interactive 3D procedural anatomy, clinical vitals simulations, and WebAR.',
};

const pillars = [
  {
    icon: QrCode,
    title: 'Dissection Hall QR Integration',
    description:
      'Cadaveric jars, plastinated organs, and dry osteology stations are labeled with encrypted QR markers, enabling instant smartphone retrieval of 3D spatial models without installing native apps.',
    tag: 'Physical-to-Digital',
    color: 'from-teal-500/20 to-teal-500/5 text-teal-400 border-teal-500/30',
  },
  {
    icon: Boxes,
    title: 'Procedural PBR 3D Organ Geometry',
    description:
      'Engineered with multi-frequency vertex displacement, dual vascular arborization (arterial & venous), and high-resolution PBR shaders, delivering realistic organ topography and structural depth.',
    tag: 'High-Fidelity Spatial 3D',
    color: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
  },
  {
    icon: Activity,
    title: 'Real-Time Clinical Physiology HUD',
    description:
      'Every organ specimen features an authentic clinical telemetry HUD displaying live stroke volume, cardiac output, GFR, intracranial pressure, or alveolar gas tension tailored specifically to that organ.',
    tag: 'Hemodynamic Simulation',
    color: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30',
  },
  {
    icon: BookOpen,
    title: 'Structured 3-Tier Clinical Modules',
    description:
      'Each specimen links to curriculum-aligned modules: Gross Topographical Anatomy, Normal Physiology, and Pathological Disorders with built-in competency-based formative assessment quizzes.',
    tag: 'Competency Curriculum',
    color: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
  },
];

const capabilities = [
  'Zero native app download — runs seamlessly in Chrome, Safari, and Edge via WebGL and WebXR',
  '15 high-fidelity procedural anatomical organs covering all 10 human body systems',
  'Dynamic interactive 3D floating landmark pins anchored to anatomical nodes in real time',
  'Faculty dashboard with QR code generator, curriculum management, and student analytics',
  'Institutional compliance with NMC, USMLE, and GMC competency-based medical curricula',
  'Dual-tone synthesized cardiac acoustics and pulse synchronization for cardiovascular training',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07111E] text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950">
      <LandingNavbar />

      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(13,148,136,0.22),rgba(255,255,255,0))] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Department of Anatomy & Medical Informatics</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Transforming Anatomy Education with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
                Spatial 3D & Augmented Reality
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              AnatoScan AR is an academic medical platform connecting physical cadaveric specimens,
              plastinated organs, and pathology collections with interactive 3D simulation and bedside WebAR.
            </p>

            {/* Metric Highlights */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-[#0A1626]/80 border border-white/10 p-5 rounded-2xl shadow-xl">
                <span className="text-3xl font-extrabold text-teal-400 block">15+</span>
                <span className="text-xs text-slate-400 mt-1 block font-medium">Procedural 3D Organs</span>
              </div>
              <div className="bg-[#0A1626]/80 border border-white/10 p-5 rounded-2xl shadow-xl">
                <span className="text-3xl font-extrabold text-cyan-400 block">100%</span>
                <span className="text-xs text-slate-400 mt-1 block font-medium">Web-Native WebAR</span>
              </div>
              <div className="bg-[#0A1626]/80 border border-white/10 p-5 rounded-2xl shadow-xl">
                <span className="text-3xl font-extrabold text-rose-400 block">15</span>
                <span className="text-xs text-slate-400 mt-1 block font-medium">Physiology Telemetry HUDs</span>
              </div>
              <div className="bg-[#0A1626]/80 border border-white/10 p-5 rounded-2xl shadow-xl">
                <span className="text-3xl font-extrabold text-amber-400 block">10</span>
                <span className="text-xs text-slate-400 mt-1 block font-medium">Anatomical Body Systems</span>
              </div>
            </div>
          </div>
        </section>

        {/* Academic Mission Section */}
        <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <GraduationCap className="w-4 h-4 text-teal-400" />
                <span>The Academic Challenge</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Bridging the Gap Between Flat Atlases and Cadaveric Dissection
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Traditional anatomy training often forces students to toggle between flat 2D textbook
                illustrations and fixed, formaldehyde-preserved cadavers where fine neurovascular
                relationships can be obscured.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                AnatoScan AR solves this spatial disconnect. By scanning a QR marker beside any specimen,
                students instantly summon a responsive, rotating, 360-degree 3D specimen directly in their
                hands, complete with live physiology telemetry and interactive landmark pins.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/scan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-teal-500/20"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Launch QR Scanner</span>
                </Link>
              </div>
            </div>

            {/* Visual Callout Box */}
            <div className="lg:col-span-6 bg-[#0A1626] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none" />

              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <span>Core Architectural Guarantees</span>
              </h3>

              <ul className="space-y-4">
                {capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-20 bg-[#0A1626]/50 border-t border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Pillars of the Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
                Designed for Medical Excellence
              </h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Built from the ground up to support medical students, postgraduates, anatomy professors,
                and surgical residents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className={`p-7 rounded-2xl bg-gradient-to-br ${pillar.color} border transition hover:-translate-y-1 duration-200`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <pillar.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact and Faculty Inquiries Banner */}
        <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-teal-950/40 via-[#0A1626] to-blue-950/40 border border-teal-500/30 rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Deploy AnatoScan AR in Your Medical Institution
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect your dissection hall specimens with 3D spatial models and enable faculty
                curriculum management today.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-teal-500/20"
                >
                  Faculty & Student Portal
                </Link>
                <a
                  href="mailto:support@anatoscan.edu"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold text-xs transition"
                >
                  Contact Academic Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
