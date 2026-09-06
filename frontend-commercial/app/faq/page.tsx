/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Questions / Réponses (FAQ) avec Dark Mode #000616 et tokens EmiID
 * @created 2026-06-13
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { Metadata } from "next";
import { FaqAccordion } from "@/components/home/faq-accordion";
import { HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Centre d'Aide & Questions Fréquentes (FAQ) | EmiID",
  description:
    "Toutes les réponses sur EmiID : création d'empreinte numérique, abonnements FCFA, Mobile Money, badge Fondateur et sécurité.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Centre d'Aide & Questions Fréquentes (FAQ) | EmiID",
    description:
      "Toutes les réponses sur EmiID : profils vérifiés, abonnements FCFA, sécurité, mise en relation et messagerie.",
    url: "https://emiid.com/faq",
    siteName: "EmiID",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Questions Fréquentes (FAQ) | EmiID",
    description:
      "Toutes les réponses à vos questions sur la plateforme professionnelle EmiID.",
    creator: "@hopsyder",
  },
};

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden py-24 sm:py-32">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[900px] h-[500px] bg-[#013ff4]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#03b3f8]/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#013ff4]/10 dark:bg-[#013ff4]/20 border border-[#013ff4]/25 text-[#013ff4] dark:text-[#03b3f8] text-xs font-bold uppercase tracking-wider mb-5">
            <HelpCircle className="w-4 h-4" />
            <span>Centre d&apos;Aide & Support</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-5">
            Questions <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] to-[#03b3f8]">Fréquentes</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Tout ce que vous devez savoir pour démarrer, certifier votre profil et développer vos opportunités avec <span className="font-wordmark font-bold text-gray-900 dark:text-white">EmiID</span>.
          </p>
        </div>

        {/* L'accordéon FAQ avec recherche en direct */}
        <FaqAccordion />

        {/* Bannière CTA Finale */}
        <div className="mt-28 max-w-4xl mx-auto bg-gradient-to-br from-[#013ff4] to-[#000616] rounded-[2.5rem] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-[#013ff4]/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#03b3f8]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold mb-4 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#03b3f8]" />
              Réseau certifié sans carte bancaire requise
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
              Prêt à créer votre empreinte numérique ?
            </h2>

            <p className="text-blue-100/90 mb-8 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Rejoignez dès aujourd&apos;hui les premiers fondateurs et talents certifiés de l&apos;écosystème.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href={`${USER_APP_URL}/creer-profil`} 
                className="w-full sm:w-auto bg-white text-[#013ff4] font-bold py-3.5 px-7 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Créer mon profil gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="mailto:contact@emiid.com" 
                className="w-full sm:w-auto bg-white/10 text-white font-bold py-3.5 px-7 rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-sm"
              >
                Écrire à l&apos;assistance
              </a>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
