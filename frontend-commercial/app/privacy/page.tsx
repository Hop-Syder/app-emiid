/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Politique de Confidentialité avec Dark Mode #000616 et tokens EmiID
 * @created 2026-06-13
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ChevronRight, Lock, KeyRound, EyeOff, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | EmiID",
  description:
    "Comment EmiID protège vos données professionnelles : principe de minimisation, Row-Level Security, code PIN et respect de la vie privée.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Politique de Confidentialité | EmiID",
    description: "La politique de protection des données et de confidentialité de la plateforme EmiID.",
    url: "https://emiid.com/privacy",
    siteName: "EmiID",
    locale: "fr_FR",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden py-24 sm:py-32">
      {/* Glow d'ambiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#03b3f8]/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        
        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#013ff4] dark:hover:text-[#03b3f8] transition-colors">
            Accueil
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 dark:text-white">Politique de confidentialité</span>
        </nav>

        {/* En-tête */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" /> Protection des Données
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Engagement strict : zéro revente de données, contrôle total par l&apos;utilisateur.
          </p>
        </div>

        {/* Carte de contenu */}
        <div className="rounded-3xl bg-white dark:bg-[#000616] border border-gray-200/80 dark:border-white/10 p-8 sm:p-12 shadow-xl space-y-8 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          
          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-[#013ff4] dark:text-[#03b3f8]" />
              1. Données strictement nécessaires
            </h2>
            <p>
              EmiID applique le principe de <strong>minimisation des données</strong>. Nous ne collectons que ce qui est essentiel à l&apos;établissement de votre réputation professionnelle : nom, intitulé métier, bio, localisation, coordonnées de contact publiques consenties et portfolio de réalisations.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-emerald-500" />
              2. Sécurité Row-Level Security (RLS) & PIN
            </h2>
            <p>
              Votre compte bénéficie d&apos;une isolation cryptographique par politique RLS Supabase. Vos coordonnées sensibles (téléphone direct, documents contractuels) peuvent être verrouillées par <strong>code PIN personnel</strong> et ne sont dévoilées qu&apos;aux membres autorisés.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <EyeOff className="w-5 h-5 text-amber-500" />
              3. Zéro revente à des tiers
            </h2>
            <p>
              Vos données ne sont ni vendues, ni louées, ni cédées à des courtiers de données ou régies publicitaires. Notre modèle économique repose uniquement sur des abonnements Pro et Entreprise transparents.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-[#013ff4] dark:text-[#03b3f8]" />
              4. Vos droits : Droit à l&apos;oubli & Masquage
            </h2>
            <p>
              À tout moment, vous pouvez masquer votre profil de l&apos;annuaire public en 1 clic, exporter vos données ou demander la suppression définitive de votre compte depuis vos Paramètres ou par email à{" "}
              <a href="mailto:contact@emiid.com" className="text-[#013ff4] dark:text-[#03b3f8] font-bold hover:underline">
                contact@emiid.com
              </a>
              .
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}
