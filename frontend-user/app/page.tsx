/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page d'accueil de l'application (Intro / Onboarding)
 * @created 2026-05-20
 * @updated 2026-06-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
// ──────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import IntroScreen from "@/components/intro/IntroScreen";

// ─── SEO & Open Graph ────────────────────────────────────────────────────────
// og:url corrigé → app.emiid.com (et non plus emiid.xyz)
export const metadata: Metadata = {
  title: "EmiID — Votre empreinte numérique professionnelle",
  description:
    "Crée ta carte de visite numérique et rejoins le réseau de professionnels qui construisent l'Afrique de demain.",
  keywords: ["networking", "professionnel", "Afrique", "carte de visite", "EmiID"],
  authors: [{ name: "Nexus Partners", url: "https://app.emiid.com" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    // ✅ CORRIGÉ : URL canonique pointe vers app.emiid.com
    url: "https://app.emiid.com",
    siteName: "EmiID",
    title: "EmiID — Votre empreinte numérique professionnelle",
    description:
      "Crée ta carte de visite numérique et rejoins le réseau de professionnels qui construisent l'Afrique de demain.",
    images: [
      {
        url: "https://app.emiid.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "EmiID — Votre empreinte numérique professionnelle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@hopsyder",
    title: "EmiID — Votre empreinte numérique professionnelle",
    description:
      "Crée ta carte de visite numérique et rejoins le réseau de professionnels qui construisent l'Afrique de demain.",
  },
  // Empêche l'indexation de la page d'intro (contenu dupliqué avec dashboard)
  robots: {
    index: false,
    follow: true,
  },
};

export default function IntroPage() {
  return <IntroScreen />;
}
