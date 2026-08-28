/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Questions / Réponses (FAQ) remplaçant l'ancien annuaire
 * @created 2026-06-13
 * @updated 2026-06-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { Metadata } from "next";
import { FaqAccordion } from "@/components/home/faq-accordion";

export const metadata: Metadata = {
  title: "Questions Fréquentes | Emiid",
  description: "Trouvez les réponses à toutes vos questions sur Emiid, le réseau professionnel conçu pour l'Afrique.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Questions Fréquentes | Emiid",
    description: "Toutes les réponses sur Emiid : profils, abonnements FCFA, sécurité, messagerie.",
    url: "https://emiid.com/faq",
    siteName: "Emiid",
    locale: "fr_FR",
    type: "website",
  },
};

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] relative overflow-hidden py-24 sm:py-32">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[1000px] h-[500px] bg-indigo-500/10 rounded-[100%] blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-widest uppercase mb-6">
            Centre d'aide
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
            Questions <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Fréquentes</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Tout ce que vous devez savoir sur Emiid, le premier réseau professionnel B2B pensé pour nos réalités.
          </p>
        </div>

        {/* The Animated Accordion */}
        <FaqAccordion />

        {/* CTA Footer */}
        <div className="mt-32 max-w-4xl mx-auto bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2.5rem] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
          {/* Subtle noise and glow inside CTA */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-6">Vous avez d'autres questions ?</h2>
            <p className="text-indigo-200 mb-10 text-lg max-w-2xl mx-auto">
              Notre équipe est là pour vous accompagner. Créez votre compte gratuitement et découvrez par vous-même la puissance du réseau.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={`${USER_APP_URL}/creer-profil`} 
                className="w-full sm:w-auto bg-white text-indigo-900 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Créer mon profil gratuit
              </a>
              <a 
                href="mailto:contact@emiid.com" 
                className="w-full sm:w-auto bg-indigo-800/50 text-white font-bold py-4 px-8 rounded-xl border border-indigo-400/30 hover:bg-indigo-800 transition-colors"
              >
                Contacter le support
              </a>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
