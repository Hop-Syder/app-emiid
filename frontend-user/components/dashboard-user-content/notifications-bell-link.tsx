/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Accès direct aux notifications, mobile uniquement.
 *
 *              Extrait de profile-completeness le 05/09. Ce bouton y vivait,
 *              dans l'en-tête de la carte de complétude ; or cette carte
 *              disparaît désormais dès que le profil atteint 100 %. Sans
 *              extraction, les profils complets perdaient sur mobile leur seul
 *              accès d'un geste aux notifications — le dock ne les propose
 *              qu'au fond de son menu.
 *
 *              Il double volontairement l'entrée du dock : ici, il est à portée
 *              de pouce au moment où l'utilisateur ouvre son tableau de bord.
 *              Sur desktop il s'efface, la barre latérale faisant déjà ce
 *              travail.
 * @created 2026-09-05
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"

/**
 * `dark` : posé sur le bandeau sombre du tableau de bord, où les couleurs de
 * carte du thème clair seraient illisibles.
 */
interface NotificationsBellLinkProps {
  tone?: "card" | "dark"
}

export function NotificationsBellLink({ tone = "card" }: NotificationsBellLinkProps) {
  const unreadCount = useUnreadNotifications()

  return (
    <Link
      href="/notifications"
      aria-label={
        unreadCount > 0
          ? `Voir mes notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
          : "Voir mes notifications"
      }
      className={cn(
        "lg:hidden shrink-0 p-2.5 rounded-2xl active:scale-90 transition-all shadow-sm",
        tone === "dark"
          ? "bg-card/[0.08] border border-white/15 text-white hover:bg-card/[0.16] backdrop-blur-md"
          : "bg-card border border-border/70 text-foreground hover:text-[#013ff4] hover:bg-[#013ff4]/10",
      )}
    >
      <span className="relative flex items-center justify-center">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className={cn(
              "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 shadow-sm",
              tone === "dark" ? "ring-[#000616]" : "ring-white",
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </span>
    </Link>
  )
}
