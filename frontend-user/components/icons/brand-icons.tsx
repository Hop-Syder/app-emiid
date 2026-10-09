/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Vrais glyphes de marque, partagés par toute l'application.
 *              Lucide ne fournit pas WhatsApp ni TikTok : on les remplaçait par
 *              des icônes approchantes (bulle de discussion, note de musique),
 *              ce qui trompait l'utilisateur sur l'action réelle.
 *              Ces SVG héritent de la couleur du texte (`fill: currentColor`)
 *              et se dimensionnent par `className`, comme une icône Lucide.
 * @created 2026-10-09
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

interface BrandIconProps {
  className?: string
  /** Laisser vide quand un libellé texte accompagne déjà l'icône. */
  title?: string
}

/** Logo WhatsApp officiel (Font Awesome Free 6, licence CC BY 4.0). */
export function WhatsAppIcon({ className, title }: BrandIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title && <title>{title}</title>}
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.46.002 9.9-4.434 9.903-9.893.002-2.643-1.029-5.127-2.906-7.004C16.492 1.83 14.015.799 11.374.798c-5.462 0-9.905 4.439-9.909 9.897-.001 1.62.423 3.202 1.232 4.616l-.993 3.62 3.713-.974zm13.114-6.27c-.125-.207-.46-.33-.966-.583s-2.99-1.476-3.455-1.645-.792-.25-.125.717c.666.966.875 1.191.966 1.314.092.125.125.25-.125.502s-1.062 1.212-1.314 1.455c-.253.25-.502.29-.966.04-.467-.251-1.97-.726-3.754-2.316-1.39-1.24-2.327-2.77-2.6-3.252-.272-.482-.03-.743.22-.993.228-.226.502-.583.75-.875.253-.29.333-.5.5-.833.166-.33.083-.625-.041-.875s-.966-2.328-1.323-3.18c-.347-.837-.7-.723-.966-.737-.25-.013-.538-.015-.826-.015s-.758.107-1.155.539c-.397.433-1.517 1.483-1.517 3.61s1.55 4.18 1.767 4.473c.216.29 3.05 4.66 7.39 6.54 1.033.447 1.84.713 2.47.915 1.038.33 1.986.283 2.733.17.833-.125 2.502-1.022 2.852-2.008.35-.987.35-1.83.246-2.008z" />
    </svg>
  )
}

/** Logo TikTok officiel (Font Awesome Free 6, licence CC BY 4.0). */
export function TikTokIcon({ className, title }: BrandIconProps) {
  return (
    <svg className={className} viewBox="0 0 448 512" fill="currentColor" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title && <title>{title}</title>}
      <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
    </svg>
  )
}
