/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant de pied de page (Footer) avec Bleu Nuit #000616, badges de réassurance FedaPay / Mobile Money et nouveau logo
 * @created 2026-06-12
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import Link from "next/link";
import { Twitter, Linkedin, Github, ShieldCheck, Smartphone, Lock } from "lucide-react";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#000616] text-gray-400 border-t border-white/10 relative overflow-hidden">
      {/* Glow d'ambiance bas */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 py-16 relative z-10">
        <div className="xl:grid xl:grid-cols-3 xl:gap-12">
          {/* Logo, description & badges de confiance */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo/icon.svg"
                alt="Logo EmiID"
                width={36}
                height={36}
                className="h-9 w-auto object-contain group-hover:scale-105 transition-all duration-300 shrink-0"
              />
              <span className="font-wordmark font-black text-2xl tracking-tight text-white">
                EmiID
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-gray-400">
              L&apos;empreinte numérique des professionnels, talents et entreprises d&apos;Afrique. Valorisez votre expertise vérifiée et développez votre réseau en toute confiance.
            </p>

            {/* Badges de réassurance */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Mobile Money & FedaPay
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Certifié par les pairs
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                Chiffrement SSL 256-bit
              </span>
            </div>

            {/* Réseaux sociaux */}
            <div className="flex space-x-4 pt-2">
              <a
                href="https://twitter.com/emiid_africa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/emiid"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/hopsyder"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Colonnes de navigation */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Plateforme</h3>
              <ul role="list" className="mt-4 space-y-3">
                <li>
                  <Link href="/" className="text-sm hover:text-white transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="text-sm hover:text-white transition-colors">
                    Explorer l&apos;annuaire
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-sm hover:text-white transition-colors">
                    Tarifs & Forfaits
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm hover:text-white transition-colors">
                    Centre d&apos;aide & FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Entreprise</h3>
              <ul role="list" className="mt-4 space-y-3">
                <li>
                  <Link href="/about" className="text-sm hover:text-white transition-colors">
                    À propos d&apos;EmiID
                  </Link>
                </li>
                <li>
                  <a
                    href="https://ceo.nexuspartners.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    Nexus Partners ↗
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@emiid.com"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Nous contacter
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Légal & Sécurité</h3>
              <ul role="list" className="mt-4 space-y-3">
                <li>
                  <Link href="/legal" className="text-sm hover:text-white transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                    Confidentialité & Données
                  </Link>
                </li>
                <li>
                  <a
                    href="https://app.emiid.com/conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Conditions Générales (CGU)
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ligne inférieure de copyright */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            &copy; {currentYear} EmiID. Tous droits réservés. Une création Nexus Partners.
          </p>
          <p className="flex items-center gap-1 text-gray-400">
            Conçu pour l&apos;Afrique, ouvert au monde 🌍
          </p>
        </div>
      </div>
    </footer>
  );
}
