import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Emiid",
  description:
    "Comment Emiid collecte, utilise et protège vos données personnelles : principe de minimisation, sécurité et vos droits.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Politique de confidentialité | Emiid",
    description: "La politique de confidentialité d'Emiid : données collectées, finalités et vos droits.",
    url: "https://emiid.com/privacy",
    siteName: "Emiid",
    locale: "fr_FR",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
          Politique de confidentialité
        </h1>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Données collectées</h2>
            <p>
              Emiid ne collecte que les données nécessaires à la création de votre identité
              professionnelle : nom, métier, coordonnées que vous choisissez de rendre publiques,
              et pièces de vérification stockées dans un espace privé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Finalités</h2>
            <p>
              Vos données servent exclusivement à assurer le fonctionnement du réseau : publication
              de votre profil, mise en relation, messagerie et mesure d&apos;audience anonymisée.
              Elles ne sont ni revendues, ni cédées à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sécurité</h2>
            <p>
              Les accès sont protégés par authentification, code PIN optionnel et chiffrement en
              transit. Les pièces justificatives de vérification ne sont jamais publiques.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Vos droits</h2>
            <p>
              Vous pouvez à tout moment accéder à vos données, masquer votre profil de l&apos;annuaire
              ou demander sa suppression depuis les paramètres de l&apos;application, ou en écrivant à{" "}
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
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Politique complète</h2>
            <p>
              La politique de confidentialité détaillée de la plateforme est disponible dans
              l&apos;application :{" "}
              <a
                href="https://app.emiid.com/confidentialite"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                app.emiid.com/confidentialite
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
