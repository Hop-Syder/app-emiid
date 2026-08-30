/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout racine de l'application EmiID avec métadonnées SEO
 * @created 2026-04-18
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { RegisterServiceWorker } from '@/components/pwa/register-sw'
import { PwaInstallPrompt } from '@/components/pwa/install-prompt'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Charte EmiID : fond blanc en clair, slate-950 en sombre (la couleur de marque
  // #013ff4 reste l'accent/symbole, pas le fond du chrome mobile).
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
}

export const metadata: Metadata = {
  // Domaine public pour le SEO (canonical/OG). On privilégie le site officiel
  // (emiid.com) via NEXT_PUBLIC_PUBLIC_URL ; défaut = domaine app pour ne rien
  // casser tant que le site officiel ne sert pas encore les pages profil.
  metadataBase: new URL(process.env.NEXT_PUBLIC_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://app.emiid.com'),
  applicationName: 'EmiID',
  title: {
    default: 'EmiID — Votre empreinte numérique professionnelle',
    template: '%s | EmiID',
  },
  description: "Créez votre carte de visite numérique vérifiée et rejoignez le réseau de référence des professionnels, freelances et entreprises qui construisent l'Afrique de demain.",
  generator: 'Next.js',
  keywords: [
    'EmiID',
    'réseau professionnel Afrique',
    'carte de visite numérique',
    'annuaire professionnel',
    'freelance Afrique',
    'artisans certifiés',
    'profil professionnel vérifié',
    'Bénin',
    'Côte d\'Ivoire',
    'Sénégal',
    'Togo',
    'Afrique de l\'Ouest',
    'FCFA',
    'networking B2B'
  ],
  authors: [{ name: 'Nexus Partners', url: 'https://app.emiid.com' }],
  creator: 'Nexus Partners',
  publisher: 'Nexus Partners',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  appleWebApp: { capable: true, title: 'EmiID', statusBarStyle: 'black-translucent' },
  other: { 'msapplication-TileColor': '#013ff4' },
  // Propriété Search Console : requise pour soumettre le sitemap et suivre
  // l'indexation. Renseigner NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION avec le jeton
  // fourni par Google (méthode « balise HTML »).
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    title: 'EmiID — Votre empreinte numérique professionnelle',
    description: "Rejoignez le réseau professionnel certifié pensé pour l'Afrique : carte de visite numérique, opportunités vérifiées et visibilité décuplée.",
    url: 'https://app.emiid.com',
    siteName: 'EmiID',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/logo-emiid-bleu-blanc.png',
        width: 500,
        height: 500,
        alt: 'EmiID — Votre empreinte numérique professionnelle',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EmiID — Votre empreinte numérique professionnelle',
    description: "Rejoignez le réseau professionnel certifié pensé pour l'Afrique. Carte de visite numérique et opportunités vérifiées.",
    creator: '@hopsyder',
    images: ['/logo-emiid-bleu-blanc.png'],
  },
  icons: {
    icon: [
      {
        url: '/logo-emiid-bleu-blanc.png',
        type: 'image/png',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo-emiid-bleu-blanc.png',
  },
}

import { Toaster } from 'sonner'
import { CookieConsent } from '@/components/CookieConsent'
import { ThemeProvider } from '@/components/theme-provider'
import { BackendStatusBanner } from '@/components/backend-status-banner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* Mesure d'audience. L'identifiant vient de NEXT_PUBLIC_GA_ID et le
            composant suit les navigations de l'App Router, que gtag ne voit pas
            seul (aucun rechargement de document entre les pages). */}
        <GoogleAnalytics />

        {/* Données structurées — Organization (logo officiel clair, lisible sur les
            surfaces Google) + WebSite. Aide le knowledge panel à associer la marque. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'EmiID',
              url: 'https://app.emiid.com',
              logo: 'https://app.emiid.com/logo-emiid-bleu-blanc.png',
              image: 'https://app.emiid.com/logo-emiid-bleu-blanc.png',
              description:
                "Le réseau professionnel certifié pensé pour l'Afrique : profils vérifiés, annuaire et messagerie.",
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Cotonou',
                addressCountry: 'BJ',
              },
              sameAs: [
                'https://emiid.com',
                'https://x.com/hopsyder',
              ],
            }).replace(/</g, '\\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'EmiID',
              url: 'https://app.emiid.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://app.emiid.com/annuaire?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }).replace(/</g, '\\u003c'),
          }}
        />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
          <Toaster position="top-right" richColors closeButton />
          <BackendStatusBanner />
          <CookieConsent />
          {/* PWA : service worker au démarrage (requis pour que Chrome
              propose l'installation), puis invitation à installer. */}
          <RegisterServiceWorker />
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}
