/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout racine de l'application EmiID avec métadonnées SEO
 * @created 2026-04-18
 * @updated 2026-06-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://app.emiid.com'),
  title: 'EmiID — Votre empreinte numérique professionnelle',
  description: 'La plateforme de networking intelligente pour les professionnels africains. Créez votre carte de visite numérique et développez votre réseau.',
  generator: 'Next.js',
  keywords: ['networking', 'professionnel', 'Afrique', 'carte de visite', 'EmiID'],
  authors: [{ name: 'Nexus Partners' }],
  openGraph: {
    title: 'EmiID — Votre empreinte numérique professionnelle',
    description: 'La plateforme de networking intelligente pour les professionnels.',
    url: 'https://app.emiid.com',
    siteName: 'EmiID',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EmiID — Votre empreinte numérique professionnelle',
    description: 'La plateforme de networking intelligente pour les professionnels.',
    creator: '@hopsyder',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <Toaster position="top-right" richColors closeButton />
        <CookieConsent />
      </body>
    </html>
  )
}
