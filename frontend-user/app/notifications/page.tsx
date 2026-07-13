/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de centre de notifications intelligent (Server Component).
 * @created 2026-06-02
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { Metadata } from "next"
import { NotificationsContent } from "@/components/notifications/notifications-content"

export const metadata: Metadata = {
  title: "Centre d'Alertes | EmiID",
  description: "Gérez vos notifications système, messages et l'activité de votre réseau en temps réel.",
}

export default function NotificationsPage() {
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col">
      <NotificationsContent />
    </div>
  )
}
