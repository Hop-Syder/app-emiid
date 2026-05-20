/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Liste des slides d'introduction EmiID avec copywriting adapté
 * @created 2026-05-20
 * @updated 2026-05-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/
// ──────────────────────────────────────────────────────────────────

export interface IntroSlide {
  id: number;
  eyebrow: string;       // Surtitre court
  headline: string;      // Accroche principale
  body: string;          // Description concise
  ctaLabel: string;      // Label du bouton principal
  illustration: string;  // Emoji/icône temporaire (remplacer par image SVG)
}

export const introSlides: IntroSlide[] = [
  {
    id: 1,
    eyebrow: "Bienvenue sur EmiID",
    headline: "Ton réseau,\nta force.",
    body:
      "Crée ta carte de visite numérique en moins de 2 minutes et rejoins des milliers de professionnels qui construisent l'Afrique de demain.",
    ctaLabel: "Commencer →",
    illustration: "🌍",
  },
  {
    id: 2,
    eyebrow: "Des talents vérifiés",
    headline: "Connecte-toi\naux meilleurs.",
    body:
      "Trouve des partenaires, clients et collaborateurs de confiance. Chaque profil est authentifié — pas de faux comptes, que des opportunités réelles.",
    ctaLabel: "Suivant →",
    illustration: "🤝",
  },
  {
    id: 3,
    eyebrow: "Une carte qui travaille pour toi",
    headline: "Partage ton\nprofil en un tap.",
    body:
      "QR code, lien direct, NFC. Ta carte EmiID remplace les cartes papier et t'ouvre des portes, même quand tu n'es pas dans la pièce.",
    ctaLabel: "Créer mon profil gratuit →",
    illustration: "✨",
  },
];
