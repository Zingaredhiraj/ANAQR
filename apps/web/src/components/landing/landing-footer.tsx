import React from 'react';
import { Mail, MapPin, Headphones, ShieldCheck } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-[#07111E] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/10">
          {/* Brand & Purpose */}
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-md shadow-teal-500/20">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                AnatoScan AR
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-400/30">
                ACADEMIC SUPPORT
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clinical Spatial Anatomy Learning & Specimen Digitization platform connecting physical specimens with real-time 3D and Augmented Reality.
            </p>
          </div>

          {/* Support & Contact Only */}
          <div className="bg-[#0A1626] border border-white/10 rounded-2xl p-5 sm:p-6 w-full md:w-auto shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-teal-400" />
              <span>Support & Contact</span>
            </h4>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Academic Support:</span>
                <a
                  href="mailto:support@anatoscan.edu"
                  className="font-semibold text-white hover:text-teal-300 transition-colors underline decoration-teal-500/40"
                >
                  support@anatoscan.edu
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Department of Anatomy & Medical Informatics</span>
              </div>

              <div className="flex items-center gap-2.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Verified Clinical Curriculum • 24/7 Academic Inquiries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Minimal Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} AnatoScan AR. Department of Anatomy. All rights reserved.
          </p>
          <p className="italic">
            Dedicated for medical education • Content verified by faculty.
          </p>
        </div>
      </div>
    </footer>
  );
}
