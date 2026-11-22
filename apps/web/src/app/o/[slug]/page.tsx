import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';
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
    title: `${organ.name} (${organ.latinName || 'Anatomy'}) | AnatoScan AR`,
    description: organ.description || `Interactive 3D and AR anatomical model of the ${organ.name}.`,
  };
}

export default async function QRLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const organ = await getOrgan(slug);

  if (!organ) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Specimen Bar for QR Scanners */}
      <header className="bg-navy-950 text-white px-4 py-3 flex items-center justify-between border-b border-navy-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal</span>
          </Link>
          <span className="text-gray-700">|</span>
          <div className="flex items-center gap-1.5 text-teal-400 font-bold text-sm">
            <QrCode className="w-4 h-4" />
            <span>AnatoScan AR</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/scan"
            className="text-xs bg-navy-800 hover:bg-navy-700 text-gray-200 px-3 py-1.5 rounded-lg border border-navy-700 transition"
          >
            Scan
          </Link>
        </div>
      </header>

      {/* Main Organ Specimen Content */}
      <main className="flex-1">
        <OrganPageTabs organ={organ} />
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500 bg-white">
        Department of Anatomy & Medical Informatics • AnatoScan AR Academic Platform
      </footer>
    </div>
  );
}
