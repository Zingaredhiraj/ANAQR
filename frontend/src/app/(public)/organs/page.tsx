import { Suspense } from 'react';
import { OrganBrowseClient } from './organs-client';
import { OrganItem, MASTER_ORGANS_CATALOG } from './types';

async function getOrgans(): Promise<OrganItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api/v1';
    const res = await fetch(`${apiUrl}/organs?limit=50`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return MASTER_ORGANS_CATALOG;
    const json = await res.json();
    const dbOrgans = Array.isArray(json) ? json : json.data ?? json.organs ?? [];

    if (!Array.isArray(dbOrgans) || dbOrgans.length === 0) {
      return MASTER_ORGANS_CATALOG;
    }

    // Merge DB records into master catalog for consistency
    const merged = MASTER_ORGANS_CATALOG.map(std => {
      const match = dbOrgans.find(
        (d: any) => d.slug === std.slug || d.name?.toLowerCase() === std.name.toLowerCase()
      );
      if (match) {
        return {
          ...std,
          id: match.id || std.id,
          name: match.name || std.name,
          slug: match.slug || std.slug,
          scientificName: match.scientificName || match.latinName || std.scientificName,
          description: match.description || std.description,
        };
      }
      return std;
    });

    return merged;
  } catch {
    return MASTER_ORGANS_CATALOG;
  }
}

export const metadata = {
  title: 'Human Anatomy Specimen Library | AnatoScan AR',
  description: 'Interactive 3D and WebAR anatomical human specimen catalog for clinical education.',
};

export default async function OrgansPage() {
  const organs = await getOrgans();

  return (
    <main className="min-h-screen bg-[#07111E] text-slate-100 flex flex-col">
      {/* ── Healthcare Header ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-teal-500/15 bg-gradient-to-b from-[#0A1626] to-[#07111E] py-10 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-teal-400 uppercase">
                Clinical Spatial Anatomy Curriculum
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Human Anatomy Library
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Medical-grade 3D organ specimens calibrated for anatomical inspection, physiological simulation, and bedside AR.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#0D1C2E] border border-teal-500/30 rounded-2xl p-3.5 px-5 text-center shadow-lg">
              <span className="text-2xl font-black text-teal-300 block">15</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                3D Organs Cataloged
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Client Search, Category Filters & Cards Grid ────────────────── */}
      <section className="flex-1 py-8 px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#0D1C2E] rounded-2xl h-64 border border-white/5" />
              ))}
            </div>
          }
        >
          <OrganBrowseClient organs={organs} />
        </Suspense>
      </section>
    </main>
  );
}
