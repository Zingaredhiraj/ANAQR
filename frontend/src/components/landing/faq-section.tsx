'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const faqs = [
  { q: 'How do I scan a QR code to view an organ?', a: 'Point your smartphone camera at any AnatoScan QR label attached to an anatomical specimen or model board. The camera will read the QR and open the corresponding organ page in your browser automatically — no separate app is needed.' },
  { q: 'Do I need to install an app?', a: 'No. AnatoScan AR is fully browser-based. The 3D model viewer uses Google Model Viewer loaded from a CDN. AR uses built-in platform APIs: iOS AR Quick Look (Safari) and Android Scene Viewer (Chrome). Desktop browsers display the interactive 3D viewer only.' },
  { q: 'Which devices support Augmented Reality?', a: 'iOS devices running Safari 12+ and ARKit-compatible hardware (iPhone 6S and later, all iPads with A9 chip or later) support AR Quick Look. Android devices with ARCore support (most modern Android phones from 2018+) support Scene Viewer. Some Chromium-based desktop browsers support WebXR for experimental AR.' },
  { q: 'How is the clinical content verified for accuracy?', a: 'All anatomical descriptions, disorder explanations, and clinical correlations are created by qualified faculty and must receive formal approval from the department administrator before appearing on public-facing organ pages. No auto-generated AI content is published without faculty review.' },
  { q: 'Can visitors or external students access content without an account?', a: 'Yes. QR codes resolve to public organ pages accessible without registration. Guests can view anatomy, see 3D models, launch AR, and read all three educational modules. Creating an account as a Student unlocks quiz attempts, progress tracking, bookmarks, and learning history.' },
  { q: 'How do faculty add or update organ content?', a: 'Faculty receive a dedicated login from the department administrator. The Faculty Portal provides structured content editors for anatomy, physiology, disorders, diagnostics, 3D model management, quiz creation, and educational resources. All changes go through a review workflow before publication.' },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-[#F5F7FA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10243A] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-[#64748B]">
            Common questions about using AnatoScan AR in your anatomy teaching.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-bold text-[#172B3A]">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#2563EB] shrink-0 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
