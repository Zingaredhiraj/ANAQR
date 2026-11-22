'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Wind,
  Utensils,
  Brain,
  Bone,
  Activity,
  Droplet,
  Users,
  Zap,
  Shield,
  ArrowRight,
} from 'lucide-react';

const systems = [
  { name: 'Cardiovascular System', slug: 'cardiovascular', icon: Heart, color: '#EF4444', desc: 'Heart, aorta, coronary vessels, and blood circulation routes.', count: 1 },
  { name: 'Respiratory System', slug: 'respiratory', icon: Wind, color: '#3B82F6', desc: 'Trachea, bronchial tree, alveolar gas exchange, and lungs.', count: 1 },
  { name: 'Digestive System', slug: 'digestive', icon: Utensils, color: '#F97316', desc: 'Gastrointestinal tract, liver, gallbladder, and pancreas.', count: 3 },
  { name: 'Nervous System', slug: 'nervous', icon: Brain, color: '#8B5CF6', desc: 'Cerebrum, cerebellum, brainstem, spinal cord, and sensory organs.', count: 3 },
  { name: 'Skeletal System', slug: 'skeletal', icon: Bone, color: '#6B7280', desc: 'Axial and appendicular skeleton, synovial joints, and cartilage.', count: 1 },
  { name: 'Muscular System', slug: 'muscular', icon: Activity, color: '#DC2626', desc: 'Skeletal musculature, origins, insertions, and biomechanics.', count: 1 },
  { name: 'Urinary System', slug: 'urinary', icon: Droplet, color: '#D97706', desc: 'Renal cortex, medullary pyramids, nephrons, and ureters.', count: 1 },
  { name: 'Reproductive System', slug: 'reproductive', icon: Users, color: '#EC4899', desc: 'Male and female pelvic anatomy and reproductive organs.', count: 1 },
  { name: 'Endocrine System', slug: 'endocrine', icon: Zap, color: '#10B981', desc: 'Pituitary, thyroid, adrenals, and systemic hormone pathways.', count: 1 },
  { name: 'Integumentary System', slug: 'integumentary', icon: Shield, color: '#92400E', desc: 'Dermal layers, epidermal appendages, and subcutaneous fascia.', count: 1 },
];

export function AnatomicalSystems() {
  return (
    <section id="systems" className="py-24 bg-[#F5F7FA] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Department Curriculum
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10243A] tracking-tight mt-3">
              Explore by Anatomical System
            </h2>
            <p className="mt-2 text-base text-[#64748B] max-w-xl">
              All 10 fundamental human anatomical systems cataloged with high-resolution digital representations.
            </p>
          </div>
          <Link
            href="/organs"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Browse all organs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {systems.map((sys, idx) => (
            <motion.div
              key={sys.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
            >
              <Link
                href={`/organs?system=${sys.slug}`}
                className="block h-full p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-sm"
                  style={{ backgroundColor: sys.color }}
                >
                  <sys.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#10243A] group-hover:text-blue-600 transition-colors text-base mb-1.5">
                  {sys.name}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2 mb-4">
                  {sys.desc}
                </p>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                  <span>{sys.count} organ{sys.count > 1 ? 's' : ''}</span>
                  <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
