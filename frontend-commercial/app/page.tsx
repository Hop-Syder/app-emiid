/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page d'accueil du site commercial Emiid
 * @created 2026-06-12
 * @updated 2026-06-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { HeroSection } from "@/components/home/hero-section";
import { FomoSection } from "@/components/home/fomo-section";
import { ComparisonSection } from "@/components/home/comparison-section";
import { SocialProofSection } from "@/components/home/social-proof-section";
import { PricingSection } from "@/components/home/pricing-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />

      <FomoSection />

      <ComparisonSection />
      <SocialProofSection />
      <PricingSection />
    </main>
  );
}
