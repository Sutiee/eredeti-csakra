import Hero from '@/components/landing/Hero';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import TrustSection from '@/components/landing/TrustSection';
import CTASection from '@/components/landing/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <TrustSection />
      <CTASection />
    </main>
  );
}
