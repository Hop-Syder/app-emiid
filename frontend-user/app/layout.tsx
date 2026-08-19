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
import Script from 'next/script'
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
  title: 'EmiID — Votre empreinte numérique professionnelle',
  description: "Crée ta carte de visite numérique et rejoins le réseau de professionnels qui construisent l'Afrique de demain.",
  generator: 'Next.js',
  keywords: ['networking', 'professionnel', 'Afrique', 'carte de visite', 'EmiID'],
  authors: [{ name: 'Nexus Partners' }],
  appleWebApp: { capable: true, title: 'EmiID', statusBarStyle: 'black-translucent' },
  other: { 'msapplication-TileColor': '#013ff4' },
  openGraph: {
    title: 'EmiID — Votre empreinte numérique professionnelle',
    description: "Crée ta carte de visite numérique et rejoins le réseau de professionnels qui construisent l'Afrique de demain.",
    url: 'https://app.emiid.com',
    siteName: 'EmiID',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://app.emiid.com/logo/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EmiID — Votre empreinte numérique professionnelle',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EmiID — Votre empreinte numérique professionnelle',
    description: "Crée ta carte de visite numérique et rejoins le réseau de professionnels qui construisent l'Afrique de demain.",
    creator: '@hopsyder',
    images: ['https://app.emiid.com/logo/og-image.png'],
  },
  icons: {
    icon: [
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
    apple: '/apple-icon.png',
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
        {/* Google Analytics 4 — via next/script (afterInteractive), sans <head> manuel
            afin de laisser la Metadata API de Next gérer entièrement le <head> (SEO). */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KYGF0JWYZE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KYGF0JWYZE');
          `}
        </Script>

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
              logo: 'https://app.emiid.com/logo/logo-emiid.png',
              description:
                "Le réseau professionnel certifié pensé pour l'Afrique : profils vérifiés, annuaire et messagerie.",
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
            }).replace(/</g, '\\u003c'),
          }}
        />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
          <Toaster position="top-right" richColors closeButton />
          <BackendStatusBanner />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}
