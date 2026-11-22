import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/providers';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AnatoScan AR - Scan. Place. Explore.',
    template: '%s | AnatoScan AR',
  },
  description:
    'QR-based anatomy learning and management platform. Scan a QR code to explore interactive 3D organs in Augmented Reality.',
  keywords: ['anatomy', 'medical education', 'AR', '3D models', 'augmented reality', 'QR code'],
  authors: [{ name: 'AnatoScan AR' }],
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10243A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-brand-bg font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'Inter, sans-serif' },
          }}
        />
      </body>
    </html>
  );
}
