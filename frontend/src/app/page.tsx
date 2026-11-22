import { LandingNavbar } from '@/components/landing/landing-navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { ThreeModules } from '@/components/landing/three-modules';
import { ARBenefits } from '@/components/landing/ar-benefits';
import { FAQSection } from '@/components/landing/faq-section';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      <LandingNavbar />
      <HeroSection />
      <HowItWorks />
      <ThreeModules />
      <ARBenefits />
      <FAQSection />
      <LandingFooter />
    </main>
  );
}
