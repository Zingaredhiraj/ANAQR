'use client';

import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Layers,
  Activity,
  Heart,
  AlertCircle,
  Stethoscope,
  HelpCircle,
  MessageSquare,
  Sparkles,
  BookOpen,
  Info,
} from 'lucide-react';
import { ModelViewer } from '@/components/viewer/model-viewer';
import { QuizPlayer } from '@/components/quiz/quiz-player';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { ModuleSectionRenderer } from '@/components/modules/module-section-renderer';

interface OrganPageTabsProps {
  organ: any;
}

export function OrganPageTabs({ organ }: OrganPageTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const defaultModel = organ.models?.find((m: any) => m.isDefault) || organ.models?.[0];
  const physiologyModule = organ.learningModules?.find((m: any) => m.type === 'NORMAL_WORKING' || m.type === 'PHYSIOLOGY');
  const disordersModule = organ.learningModules?.find((m: any) => m.type === 'WHAT_GOES_WRONG');
  const clinicalModule = organ.learningModules?.find((m: any) => m.type === 'HOW_IT_IS_MEASURED' || m.type === 'CLINICAL');
  const disorders = organ.disorders || [];
  const primaryQuiz = organ.quizzes?.[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 md:py-8 space-y-4 md:space-y-6">
      {/* Organ Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {organ.anatomicalSystem?.name || 'Anatomy'}
            </span>
            {organ.latinName && (
              <span className="text-xs italic text-gray-500 font-serif">
                Lat. {organ.latinName}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            {organ.name}
          </h1>
          {organ.scientificName && (
            <p className="text-xs sm:text-sm font-medium text-teal-700 mt-0.5">
              {organ.scientificName}
            </p>
          )}
          <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 max-w-2xl leading-relaxed">
            {organ.description}
          </p>
        </div>

        {organ.location && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 md:w-64 shrink-0 text-xs text-gray-600 space-y-1">
            <span className="font-semibold text-gray-800 uppercase tracking-wider block text-[10px]">
              Topographical Location
            </span>
            <p className="leading-snug text-gray-700">{organ.location}</p>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <Tabs.List className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-2 border-b border-gray-200 -mx-3 px-3 sm:mx-0 sm:px-0">
          <Tabs.Trigger
            value="overview"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'overview'
                ? 'bg-navy-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-navy-900 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Overview & Structure</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="3d-ar"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === '3d-ar'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>3D & AR Specimen</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="physiology"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'physiology'
                ? 'bg-navy-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-navy-900 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Normal Physiology</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="disorders"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'disorders'
                ? 'bg-navy-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-navy-900 hover:bg-gray-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Disorders ({disorders.length})</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="clinical"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'clinical'
                ? 'bg-navy-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-navy-900 hover:bg-gray-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Clinical Correlation</span>
          </Tabs.Trigger>

          {primaryQuiz && (
            <Tabs.Trigger
              value="quiz"
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
                activeTab === 'quiz'
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'text-gray-600 hover:text-navy-900 hover:bg-gray-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Assessment</span>
            </Tabs.Trigger>
          )}

          <Tabs.Trigger
            value="feedback"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'feedback'
                ? 'bg-navy-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-navy-900 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Academic Feedback</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* 1. Overview Tab */}
        <Tabs.Content value="overview" className="space-y-4 md:space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-navy-900 border-b pb-2">
                External & Gross Architecture
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {organ.organContent?.externalStructure || organ.structure || 'Gross anatomical details are structured in modular cadaveric layers.'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-navy-900 border-b pb-2">
                Internal Architecture & Chambers
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {organ.organContent?.internalStructure || 'Detailed internal structures with neurovascular relationships.'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-navy-900 border-b pb-2">
                Arterial & Venous Supply
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {organ.organContent?.bloodSupply || organ.bloodSupply || 'Arterial perfusion and venous drainage pathways.'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-navy-900 border-b pb-2">
                Innervation & Lymphatics
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {organ.organContent?.nerveSupply || organ.nerveSupply || 'Autonomic sympathetic and parasympathetic innervation plexuses.'}
              </p>
            </div>
          </div>
        </Tabs.Content>

        {/* 2. 3D & AR Specimen Tab */}
        <Tabs.Content value="3d-ar" className="outline-none">
          <ModelViewer
            modelUrl={defaultModel?.fileUrl}
            thumbnailUrl={defaultModel?.thumbnailUrl || organ.thumbnailUrl}
            organName={organ.name}
            systemName={organ.anatomicalSystem?.name || organ.system?.name}
            slug={organ.slug}
            description={organ.description}
            hotspots={organ.structures?.map((s: any) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              clinicalFunction: s.clinicalFunction,
              system: s.system,
            }))}
          />
        </Tabs.Content>

        {/* 3. Physiology Tab */}
        <Tabs.Content value="physiology" className="space-y-4 md:space-y-6 outline-none">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Normal Physiological Functioning</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-navy-900">
              {physiologyModule?.title || `Functional Dynamics of the ${organ.name}`}
            </h2>
            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-2">
              <ModuleSectionRenderer
                content={
                  physiologyModule?.content ||
                  organ.organContent?.physiology ||
                  organ.functions ||
                  'Physiological mechanisms explaining hemodynamics, tissue perfusion, and autonomic regulation.'
                }
              />
            </div>
          </div>
        </Tabs.Content>

        {/* 4. Disorders Tab */}
        <Tabs.Content value="disorders" className="space-y-4 outline-none">
          {disorders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center text-gray-500 text-xs sm:text-sm">
              No pathological disorders cataloged for this organ yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {disorders.map((d: any) => (
                <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {d.type || 'Pathology'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-navy-900">{d.name}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{d.description}</p>
                  {d.symptoms && (
                    <div className="text-xs text-gray-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <strong className="text-gray-900 font-semibold block mb-0.5 text-[11px]">Clinical Signs:</strong>
                      {d.symptoms}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Tabs.Content>

        {/* 5. Clinical Correlation Tab */}
        <Tabs.Content value="clinical" className="space-y-4 md:space-y-6 outline-none">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
              <Stethoscope className="w-4 h-4" />
              <span>Medical & Surgical Diagnostics</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-navy-900">
              {clinicalModule?.title || `Clinical & Imaging Diagnostics: ${organ.name}`}
            </h2>
            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-2">
              <ModuleSectionRenderer
                content={
                  clinicalModule?.content ||
                  organ.organContent?.clinicalCorrelation ||
                  'Radiological imaging modalities (CT, MRI, Ultrasonography), biomarker diagnostics, and surgical access triangles.'
                }
              />
            </div>
          </div>
        </Tabs.Content>

        {/* 6. Quiz Tab */}
        {primaryQuiz && (
          <Tabs.Content value="quiz" className="outline-none">
            <QuizPlayer quiz={primaryQuiz} organId={organ.id} />
          </Tabs.Content>
        )}

        {/* 7. Feedback Tab */}
        <Tabs.Content value="feedback" className="outline-none">
          <div className="max-w-xl mx-auto">
            <FeedbackForm organId={organ.id} organName={organ.name} />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
