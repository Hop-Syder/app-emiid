/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout racine de l'application Nukun avec métadonnées SEO
 * @created 2026-04-18
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

import type { Metadata } from 'next'
// import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nukun — Ton réseau, ta force',
  description: 'La plateforme de networking intelligente pour les professionnels en Afrique.',
  generator: 'Next.js',
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
        {/* <Analytics /> */}
        <Toaster position="top-right" richColors closeButton />
        <CookieConsent />
      </body>
    </html>
  )
}
