import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | Emiid",
  description:
    "Mentions légales du site emiid.com : éditeur, contact et informations légales de la plateforme Emiid, éditée par Nexus Partners.",
  alternates: { canonical: "/legal" },
  openGraph: {
    title: "Mentions légales | Emiid",
    description: "Informations légales relatives au site emiid.com et à la plateforme Emiid.",
    url: "https://emiid.com/legal",
    siteName: "Emiid",
    locale: "fr_FR",
    type: "website",
  },
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
          Mentions légales
        </h1>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Éditeur du site</h2>
            <p>
              Le site <strong>emiid.com</strong> et la plateforme Emiid sont édités par{" "}
              <strong>Nexus Partners</strong>, dont le siège est établi à Cotonou, République du Bénin.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contact</h2>
            <p>
              Pour toute question relative au site ou à la plateforme :{" "}
              <a
                href="mailto:contact@emiid.com"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                contact@emiid.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hébergement</h2>
            <p>Le site est hébergé par Vercel Inc. (infrastructure cloud mondiale).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus du site (textes, visuels, logos, marque Emiid) est protégé.
              Toute reproduction sans autorisation préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Conditions d&apos;utilisation</h2>
            <p>
              L&apos;utilisation de la plateforme Emiid est encadrée par nos conditions générales
              d&apos;utilisation, consultables directement dans l&apos;application :{" "}
              <a
                href="https://app.emiid.com/conditions"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
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
