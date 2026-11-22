import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OrganPageTabs } from '@/components/organ/organ-page-tabs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getOrgan(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api/v1';
    const res = await fetch(`${apiUrl}/organs/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data !== undefined ? json.data : json;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const organ = await getOrgan(slug);
  if (!organ) return { title: 'Specimen Not Found | AnatoScan AR' };

  return {
    title: `${organ.name} | AnatoScan AR Anatomy Catalog`,
    description: organ.description,
  };
}

export default async function OrganDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const organ = await getOrgan(slug);

  if (!organ) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/organs"
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-navy-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Anatomical Systems</span>
          </Link>
          <div className="text-xs text-gray-500 font-medium">
            System: <span className="text-navy-900 font-semibold">{organ.system?.name || organ.anatomicalSystem?.name || 'General Anatomy'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <OrganPageTabs organ={organ} />
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500 bg-white">
        Department of Anatomy & Medical Informatics • AnatoScan AR Academic Platform
      </footer>
    </div>
  );
}
