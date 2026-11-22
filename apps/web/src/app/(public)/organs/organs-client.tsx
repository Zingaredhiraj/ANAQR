'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  Sparkles,
  Heart,
  Wind,
  Brain,
  Layers,
  Utensils,
  Bone,
  Activity,
  Eye,
  ShieldAlert,
  X,
  Compass,
} from 'lucide-react';
import { OrganItem } from './types';

interface OrganBrowseClientProps {
  organs: OrganItem[];
}

const CATEGORIES = [
  { label: 'All Systems', value: 'all', icon: Layers },
  { label: 'Cardiovascular', value: 'cardiovascular', icon: Heart },
  { label: 'Nervous', value: 'nervous', icon: Brain },
  { label: 'Respiratory', value: 'respiratory', icon: Wind },
  { label: 'Digestive', value: 'digestive', icon: Utensils },
  { label: 'Urinary', value: 'urinary', icon: Compass },
  { label: 'Musculoskeletal', value: 'musculoskeletal', icon: Bone },
  { label: 'Endocrine', value: 'endocrine', icon: Activity },
  { label: 'Sensory', value: 'sensory', icon: Eye },
];

const SYSTEM_THEMES: Record<
  string,
  { bg: string; text: string; border: string; glow: string; badge: string; icon: any }
> = {
  cardiovascular: {
    bg: 'from-rose-950/40 to-[#0A1626]',
    text: 'text-rose-400',
    border: 'border-rose-500/30 hover:border-rose-400/60',
    glow: 'group-hover:shadow-rose-500/15',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    icon: Heart,
  },
  nervous: {
    bg: 'from-amber-950/40 to-[#0A1626]',
    text: 'text-amber-400',
    border: 'border-amber-500/30 hover:border-amber-400/60',
    glow: 'group-hover:shadow-amber-500/15',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: Brain,
  },
  respiratory: {
    bg: 'from-sky-950/40 to-[#0A1626]',
    text: 'text-sky-400',
    border: 'border-sky-500/30 hover:border-sky-400/60',
    glow: 'group-hover:shadow-sky-500/15',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    icon: Wind,
  },
  digestive: {
    bg: 'from-emerald-950/40 to-[#0A1626]',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    glow: 'group-hover:shadow-emerald-500/15',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon: Utensils,
  },
  urinary: {
    bg: 'from-cyan-950/40 to-[#0A1626]',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30 hover:border-cyan-400/60',
    glow: 'group-hover:shadow-cyan-500/15',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    icon: Compass,
  },
  musculoskeletal: {
    bg: 'from-indigo-950/40 to-[#0A1626]',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30 hover:border-indigo-400/60',
    glow: 'group-hover:shadow-indigo-500/15',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    icon: Bone,
  },
  endocrine: {
    bg: 'from-teal-950/40 to-[#0A1626]',
    text: 'text-teal-400',
    border: 'border-teal-500/30 hover:border-teal-400/60',
    glow: 'group-hover:shadow-teal-500/15',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    icon: Activity,
  },
  sensory: {
    bg: 'from-purple-950/40 to-[#0A1626]',
    text: 'text-purple-400',
    border: 'border-purple-500/30 hover:border-purple-400/60',
    glow: 'group-hover:shadow-purple-500/15',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    icon: Eye,
  },
};

export function OrganBrowseClient({ organs }: OrganBrowseClientProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    return organs.filter(organ => {
      const matchSearch =
        !search ||
        organ.name.toLowerCase().includes(search.toLowerCase()) ||
        (organ.scientificName || '').toLowerCase().includes(search.toLowerCase()) ||
        (organ.latinName || '').toLowerCase().includes(search.toLowerCase()) ||
        organ.description.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        activeCategory === 'all' || organ.category.toLowerCase() === activeCategory.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [organs, search, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* ── Search & Filter Controls ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search anatomical organs (e.g. Heart, Brain, Encephalon)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-[#0A1626] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Showing</span>
          <span className="font-extrabold text-teal-300">{filtered.length}</span>
          <span>of {organs.length} specimens</span>
        </div>
      </div>

      {/* ── Category Pill Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-teal-500 text-white border-teal-400 shadow-lg shadow-teal-500/25 scale-102'
                  : 'bg-[#0A1626] text-slate-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Organ Cards Grid ──────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(organ => {
            const theme = SYSTEM_THEMES[organ.category] || SYSTEM_THEMES.cardiovascular;
            const SystemIcon = theme.icon;

            return (
              <div
                key={organ.id}
                className={`group relative bg-gradient-to-b ${theme.bg} rounded-2xl p-5 border ${theme.border} transition-all duration-200 hover:-translate-y-1 shadow-xl ${theme.glow} flex flex-col justify-between`}
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${theme.badge}`}
                    >
                      <SystemIcon className="w-3 h-3" />
                      <span>{organ.systemName}</span>
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-400/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>3D Spatial</span>
                    </span>
                  </div>

                  {/* Organ Name & Taxonomy */}
                  <div className="mb-2">
                    <h3 className="text-xl font-black text-white group-hover:text-teal-200 transition-colors">
                      {organ.name}
                    </h3>
                    {organ.latinName && (
                      <p className="text-[11px] font-serif italic text-slate-400 mt-0.5">
                        Lat. {organ.latinName}
                      </p>
                    )}
                  </div>

                  {/* Medical Summary */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {organ.description}
                  </p>

                  {/* Clinical Highlight */}
                  {organ.clinicalHighlight && (
                    <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 text-[11px] text-slate-400 mb-4 flex items-start gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{organ.clinicalHighlight}</span>
                    </div>
                  )}
                </div>

                {/* Footer with "Go Ahead" action button */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {organ.structuresCount} Anatomical Landmarks
                  </span>

                  <Link
                    href={`/o/${organ.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all duration-150 shadow-md shadow-teal-500/20 group-hover:scale-105"
                  >
                    <span>Go Ahead</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#0A1626]/50 rounded-2xl border border-white/5 p-8">
          <Layers className="w-10 h-10 mx-auto text-slate-500 mb-3 opacity-40" />
          <h4 className="text-base font-bold text-white">No Matching Organs Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different anatomical system filter.
          </p>
        </div>
      )}
    </div>
  );
}
