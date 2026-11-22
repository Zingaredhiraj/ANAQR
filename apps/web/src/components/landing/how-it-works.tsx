'use client';

import { motion } from 'framer-motion';
import { QrCode, Smartphone, Eye, Sparkles } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Scan QR Code',
    desc: 'Locate the AnatoScan QR code on physical specimens, cadaveric stations, or model stands and scan using any smartphone camera.',
    icon: QrCode,
    color: 'from-blue-600 to-indigo-600',
    highlight: 'No app download required',
  },
  {
    step: '02',
    title: 'Place in AR',
    desc: 'Launch real-world Augmented Reality mode. Place life-sized or scaled 3D anatomical structures onto your dissecting table or desk.',
    icon: Smartphone,
    color: 'from-teal-600 to-emerald-600',
    highlight: 'WebXR, Scene Viewer & Quick Look',
  },
  {
    step: '03',
    title: 'Explore & Learn',
    desc: 'Interact with anatomical layers, observe physiological blood flow, compare normal vs pathology, and test your knowledge with clinical quizzes.',
    icon: Eye,
    color: 'from-amber-500 to-orange-600',
    highlight: 'Three structured learning modules',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            Seamless Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10243A] tracking-tight">
            How AnatoScan AR Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64748B]">
            A seamless bridge between physical anatomical collections and digital 3D/AR learning resources.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="relative p-8 rounded-2xl bg-[#F5F7FA] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black text-gray-200 group-hover:text-blue-100 transition-colors">
                  {s.step}
                </span>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md`}>
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#10243A] mb-3">{s.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed mb-6">{s.desc}</p>
              <div className="pt-4 border-t border-gray-200/60">
                <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  {s.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
