/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant de pied de page (Footer) avec liens de navigation, réseaux sociaux et mentions légales
 * @created 2026-06-12
 * @updated 2026-06-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import Link from "next/link";
import { Globe, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900">
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 lg:px-16 py-12">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo et description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
                <Globe className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                emiid
              </span>
            </Link>
            <p className="text-sm leading-6 max-w-xs">
              L'empreinte numérique des professionnels africains. Valorisez vos expertises, développez votre réseau, et saisissez de nouvelles opportunités.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Colonnes de liens */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Plateforme</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/" className="text-sm leading-6 hover:text-white transition-colors">
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-sm leading-6 hover:text-white transition-colors">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Entreprise</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/about" className="text-sm leading-6 hover:text-white transition-colors">
                      À propos
                    </Link>
                  </li>
                  <li>
                    <a href="https://ceo.nexuspartners.xyz" target="_blank" rel="noopener noreferrer" className="text-sm leading-6 hover:text-white transition-colors">
                      Nexus Partners
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Légal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/legal" className="text-sm leading-6 hover:text-white transition-colors">
                      Mentions légales
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-sm leading-6 hover:text-white transition-colors">
                      Politique de confidentialité
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne de copyright bas */}
        <div className="mt-16 border-t border-gray-900 pt-8 sm:mt-20 lg:mt-24 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs leading-5 text-gray-500">
            &copy; {currentYear} Emiid. Tous droits réservés. Développé par Nexus Partners.
          </p>
          <p className="text-xs leading-5 text-gray-500">
            Fait en Afrique pour le monde entier 🌍
          </p>
        </div>
      </div>
    </footer>
  );
}
