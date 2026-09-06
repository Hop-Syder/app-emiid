/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Mentions Légales avec Dark Mode #000616 et tokens EmiID
 * @created 2026-06-13
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ChevronRight, Mail, Globe2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions Légales | EmiID",
  description:
    "Mentions légales du site emiid.com : éditeur, contact et informations juridiques de la plateforme EmiID, éditée par Nexus Partners.",
  alternates: { canonical: "/legal" },
  openGraph: {
    title: "Mentions Légales | EmiID",
    description: "Informations légales relatives au site emiid.com et à la plateforme EmiID.",
    url: "https://emiid.com/legal",
    siteName: "EmiID",
    locale: "fr_FR",
    type: "website",
  },
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden py-24 sm:py-32">
      {/* Glow d'ambiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#013ff4]/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        
        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#013ff4] dark:hover:text-[#03b3f8] transition-colors">
            Accueil
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 dark:text-white">Mentions légales</span>
        </nav>

        {/* En-tête */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#013ff4]/10 text-[#013ff4] dark:text-[#03b3f8] text-xs font-bold uppercase tracking-wider mb-4">
            <Shield className="w-4 h-4" /> Cadre Juridique
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Mentions Légales
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Dernière mise à jour : 1er septembre 2026
          </p>
        </div>

        {/* Carte de contenu */}
        <div className="rounded-3xl bg-white dark:bg-[#000616] border border-gray-200/80 dark:border-white/10 p-8 sm:p-12 shadow-xl space-y-8 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#013ff4]" />
              1. Éditeur du site & Propriété
            </h2>
            <p>
              Le site <strong>emiid.com</strong> et la plateforme applicative <strong>app.emiid.com</strong> sont conçus et édités par <strong>Nexus Partners</strong>.
            </p>
            <p className="text-xs text-gray-500">
              Siège : Cotonou, République du Bénin · Contact direction : daoudaabassichristian@gmail.com · ceo.nexuspartners.xyz
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#03b3f8]" />
              2. Contact & Assistance
            </h2>
            <p>
              Pour toute question administrative, technique ou signalement :
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="mailto:contact@emiid.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold text-xs hover:bg-[#013ff4] hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" /> contact@emiid.com
              </a>
              <a
                href="https://ceo.nexuspartners.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold text-xs hover:bg-[#013ff4] hover:text-white transition-colors"
              >
                <Globe2 className="w-4 h-4" /> ceo.nexuspartners.xyz
              </a>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#013ff4]" />
              3. Hébergement & Infrastructure
            </h2>
            <p>
              L&apos;infrastructure web commerciale est hébergée sur le réseau mondial de <strong>Vercel Inc.</strong> (San Francisco, CA, USA). Les bases de données sécurisées et l&apos;authentification RLS sont assurées par <strong>Supabase Inc.</strong> sur serveurs conformes RGPD.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#03b3f8]" />
              4. Propriété Intellectuelle
            </h2>
            <p>
              La marque <strong className="font-wordmark">EmiID</strong>, les chartes graphiques, logos, architectures logicielles et contenus rédactionnels sont la propriété exclusive de Nexus Partners. Toute contrefaçon ou reproduction non autorisée fera l&apos;objet de poursuites judiciaires appropriées.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#013ff4]" />
              5. Conditions Générales d&apos;Utilisation
            </h2>
            <p>
              L&apos;utilisation des services de création de profil, de messagerie et d&apos;annuaire est régie par les Conditions Générales consultables en continu sur{" "}
              <a
                href="https://app.emiid.com/conditions"
                className="text-[#013ff4] dark:text-[#03b3f8] font-bold hover:underline"
              >
                app.emiid.com/conditions
              </a>
              .
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
