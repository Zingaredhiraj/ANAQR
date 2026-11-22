'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Sparkles, CheckCircle2 } from 'lucide-react';

const featured = [
  {
    name: 'Heart',
    scientificName: 'Cor',
    slug: 'heart',
    system: 'Cardiovascular System',
    systemColor: '#EF4444',
    desc: 'Four-chambered muscular pump driving systemic & pulmonary circulation. Includes coronary vasculature, valvular mechanics, and conductive nodes.',
    tag: 'Full 3D & 3 Modules',
    isPrimary: true,
  },
  {
    name: 'Brain',
    scientificName: 'Encephalon',
    slug: 'brain',
    system: 'Nervous System',
    systemColor: '#8B5CF6',
    desc: 'Telencephalon, diencephalon, cerebellum, and brainstem orchestrating somatic, autonomic, and executive cognitive faculties.',
    tag: 'Interactive Anatomy',
    isPrimary: false,
  },
  {
    name: 'Lungs',
    scientificName: 'Pulmones',
    slug: 'lungs',
    system: 'Respiratory System',
    systemColor: '#3B82F6',
    desc: 'Paired spongy organs comprising lobar bronchopulmonary segments dedicated to hematosis and oxygen-carbon dioxide alveolar transfer.',
    tag: 'Clinical Correlations',
    isPrimary: false,
  },
  {
    name: 'Liver',
    scientificName: 'Hepar',
    slug: 'liver',
    system: 'Digestive System',
    systemColor: '#F97316',
    desc: 'Dual-vascular supply organ with functional hexagonal lobules executing metabolic, bile secretion, and biochemical biotransformation tasks.',
    tag: 'Faculty Verified',
    isPrimary: false,
  },
];

export function FeaturedOrgans() {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Models
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10243A] tracking-tight">
              Featured Anatomical Specimens
            </h2>
            <p className="mt-3 text-base text-[#64748B] max-w-xl">
              Equipped with accurate 3D geometry, interactive dissection layers, and structured clinical teaching modules.
            </p>
          </div>
          <Link
            href="/organs"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10243A] text-white font-medium text-sm hover:bg-slate-800 transition-colors"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((organ, idx) => (
            <motion.div
              key={organ.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                organ.isPrimary
                  ? 'bg-gradient-to-b from-blue-50/50 to-white border-blue-200 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: organ.systemColor }}
                  >
                    {organ.system}
                  </span>
                  {organ.isPrimary && (
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Primary Demo
                    </span>
                  )}
                </div>

                <div className="h-36 rounded-xl bg-[#F5F7FA] border border-gray-100 flex items-center justify-center mb-5 relative group overflow-hidden">
                  <Box className="w-12 h-12 text-[#9FB8CF] group-hover:scale-110 group-hover:text-blue-600 transition-all duration-300" />
                  <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700 bg-white px-3 py-1.5 rounded-full shadow-sm">
                      View 3D / AR
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#10243A]">{organ.name}</h3>
                <p className="text-xs italic text-[#64748B] mb-2">{organ.scientificName}</p>
                <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 mb-6">
                  {organ.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/o/${organ.slug}`}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Quick Scan URL →
                </Link>
                <Link
                  href={`/organs/${organ.slug}`}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 transition-colors"
                >
                  Learn
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
