/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Boutons d'appel de l'en-tête de discussion (appel téléphonique
 *              et WhatsApp), façon WhatsApp. Le numéro est lu via la RPC
 *              get_public_profile, qui n'expose le contact que si la personne
 *              l'a autorisé (show_contact) : sans numéro public, aucun bouton.
 * @created 2026-10-09
 */

"use client"

import { useEffect, useMemo, useState } from "react"
import { Phone } from "lucide-react"
import { WhatsAppIcon } from "@/components/icons/brand-icons"
import { createClient } from "@/lib/supabase/client"
import { toInternational } from "@/lib/phone"

export function ChatCallButtons({ userId, name }: { userId: string; name: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [phone, setPhone] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setPhone(null)
    void supabase.rpc("get_public_profile", { identifier: userId }).then(({ data }) => {
      const raw = (data as { phone?: string | null } | null)?.phone
      if (active) setPhone(raw ? toInternational(raw) || null : null)
    })
    return () => {
      active = false
    }
  }, [supabase, userId])

  if (!phone) return null

  return (
    <>
      <a
        href={`tel:+${phone}`}
        aria-label={`Appeler ${name}`}
        className="flex h-11 w-11 lg:h-9 lg:w-9 items-center justify-center rounded-full lg:rounded-xl text-contact-fg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
      >
        <Phone className="h-5 w-5 lg:h-4 lg:w-4" />
      </a>
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Appeler ${name} sur WhatsApp`}
        className="flex h-11 w-11 lg:h-9 lg:w-9 items-center justify-center rounded-full lg:rounded-xl text-contact-fg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
      >
        <WhatsAppIcon className="h-5 w-5 lg:h-4 lg:w-4" />
      </a>
    </>
  )
}
