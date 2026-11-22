'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, Stethoscope, ArrowRight, CheckCircle2 } from 'lucide-react';

const modules = [
  {
    id: 'normal',
    number: '01',
    title: 'Normal Working',
    subtitle: 'Healthy Physiology & Structural Architecture',
    icon: Activity,
    color: 'border-teal-500 text-teal-600 bg-teal-50',
    accent: '#0D9488',
    summary:
      'Step-by-step walkthrough of normal macroscopic and microscopic anatomy, sequential blood flow pathways, functional mechanics, and electrophysiological conduction systems.',
    points: [
      'Normal anatomical borders and mediastinal relations',
      'Systemic vs. pulmonary hemodynamic circuits',
      'Cardiac cycle phases: Isovolumetric contraction to ventricular ejection',
      'Intrinsic pacemakers (SA/AV nodes) & Purkinje network syncytium',
    ],
    example: 'Body → Right Atrium → Right Ventricle → Lungs → Left Atrium → Left Ventricle → Aorta → Body',
  },
  {
    id: 'disorders',
    number: '02',
    title: 'What Goes Wrong',
    subtitle: 'Common Abnormalities, Pathophysiology & Structural Defects',
    icon: AlertTriangle,
    color: 'border-amber-500 text-amber-600 bg-amber-50',
    accent: '#D97706',
    summary:
      'Direct visual comparisons between healthy specimens and pathological states, explaining etiology, morphologic alterations, hemodynamic resistance, and functional impact.',
    points: [
      'Aortic Stenosis: Valvular calcification, orifice narrowing & LV pressure overload',
      'Coronary Artery Disease: Atherosclerotic plaque morphology & ischemic cascade',
      'Congenital malformations: ASD, VSD, and Tetralogy of Fallot correlates',
      'Functional consequences on end-organ perfusion and cardiac workload',
    ],
    example: 'Normal Valve (2.6-3.5 cm²) vs. Severe Stenosis (< 1.0 cm²) resulting in concentric hypertrophy',
  },
  {
    id: 'diagnostics',
    number: '03',
    title: 'How It Is Measured & Treated',
    subtitle: 'Healthcare Measurement, Diagnostics & Clinical Technology',
    icon: Stethoscope,
    color: 'border-blue-500 text-blue-600 bg-blue-50',
    accent: '#2563EB',
    summary:
      'Connecting preclinical anatomy with contemporary medical technology: what clinical instruments record, biophysical principles, waveform interpretation, and therapeutic interventions.',
    points: [
      'Electrocardiography (ECG): Vectorial atrial (P) and ventricular (QRS-T) tracking',
      'Echocardiography: Doppler hemodynamic gradients & Ejection Fraction (EF)',
      'Cardiac biomarkers: High-sensitivity Troponin & CK-MB kinetics',
      'Therapeutic overviews: Coronary revascularization, TAVR, and valvuloplasty',
    ],
    example: '12-Lead ECG vector tracking matched with Doppler ultrasound echocardiographic flow jets',
  },
];

export function ThreeModules() {
  const [activeTab, setActiveTab] = useState(modules[0].id);
  const activeModule = modules.find((m) => m.id === activeTab) || modules[0];

  return (
    <section id="modules" className="py-24 bg-[#F5F7FA] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Tripartite Educational Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10243A] tracking-tight mt-3">
            Three Structured Learning Modules for Every Organ
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64748B]">
            Medical education requires understanding normal anatomy, disease processes, and clinical measurement techniques.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {modules.map((m) => {
            const isSelected = m.id === activeTab;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                  isSelected
                    ? 'bg-[#10243A] text-white shadow-md'
                    : 'bg-white text-[#172B3A] hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-gray-500'}`} />
                <span>{m.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Module Detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm max-w-5xl mx-auto"
          >
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                    MODULE {activeModule.number}
                  </span>
                  <span className="text-sm font-semibold text-[#0D9488]">
                    {activeModule.subtitle}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#10243A] mb-4">
                  {activeModule.title}
                </h3>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed mb-6">
                  {activeModule.summary}
                </p>

                <div className="space-y-3 mb-8">
                  {activeModule.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#172B3A]">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-[#F5F7FA] border border-gray-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Pedagogical Demonstration Focus:
                  </span>
                  <code className="text-xs sm:text-sm text-blue-700 font-mono font-medium block">
                    {activeModule.example}
                  </code>
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col justify-center">
                <div
                  className="rounded-2xl p-8 text-white flex flex-col justify-between min-h-[300px]"
                  style={{
                    background: `linear-gradient(135deg, #10243A 0%, ${activeModule.accent} 100%)`,
                  }}
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center mb-6">
                      <activeModule.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white/70 uppercase tracking-widest block mb-2">
                      Academic Scope
                    </span>
                    <h4 className="text-xl font-bold text-white mb-3">
                      Interactive Specimen Integration
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Every organ registered in AnatoScan contains verified curricula across all three categories, audited by department faculty before publication.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
                    <span>Clinical relevance</span>
                    <span className="font-bold">MBBS Year 1 & 2</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
