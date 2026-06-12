/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de présentation "À propos" de l'entreprise Emiid
 * @created 2026-06-12
 * @updated 2026-06-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

export const metadata = {
  title: "À propos d'Emiid | Notre histoire et notre vision",
  description: "Découvrez l'histoire d'Emiid, les défis que nous relevons pour l'écosystème tech africain, et nos solutions pour l'avenir.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">
            Façonner l'avenir de la tech en Afrique
          </h1>
          <div className="prose prose-lg prose-indigo text-gray-600">
            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Notre Histoire</h2>
            <p>
              Emiid est né d'un constat simple : l'écosystème tech africain regorge de talents et d'innovations, mais souffre d'un manque de visibilité centralisée. Notre plateforme a été créée pour bâtir des ponts entre les créateurs, les investisseurs et les partenaires stratégiques.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Les Défis</h2>
            <p>
              Les entrepreneurs africains font souvent face à l'isolement et à un manque d'accès aux capitaux. De l'autre côté, les investisseurs peinent à identifier les pépites à fort potentiel au-delà des cercles restreints. Ce fossé informationnel freine la croissance de tout un continent.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Nos Solutions</h2>
            <p>
              En proposant un annuaire certifié et dynamique, Emiid redonne le pouvoir aux acteurs de l'écosystème :
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li><strong>Des profils premium</strong> : Une vitrine professionnelle (portfolio, certifications, réalisations).</li>
              <li><strong>Un moteur de recherche précis</strong> : Filtrez par pays, secteur, type d'acteur ou technologie.</li>
              <li><strong>Une mise en relation directe</strong> : Messagerie intégrée et opportunités exclusives.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Roadmap</h2>
            <p>
              Nous travaillons continuellement à l'amélioration de la plateforme. Prochainement : intégration d'une intelligence artificielle pour le matchmaking automatisé, événements virtuels privés, et agrégation des levées de fonds en temps réel.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
