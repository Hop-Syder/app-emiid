/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tracking des interactions sur un profil (clics WhatsApp, appel,
 *              partage) via la RPC increment_profile_metric.
 *
 *              Les VUES ne passent PAS par ici : elles sont enregistrées dans la
 *              table append-only `profile_views` (cf. use-profile-data), qui gère
 *              déjà l'anti-auto-vue et conserve l'identité du visiteur.
 *
 *              Fire-and-forget : le tracking ne doit jamais casser l'interface.
 * @created 2026-08-23
 */

"use client"

import { createClient } from "@/lib/supabase/client"

export type ProfileMetric = "whatsapp" | "call" | "share"

/** Incrémente un compteur d'interaction pour un profil. Silencieux en cas d'échec. */
export function trackProfileMetric(profileId: string | null | undefined, metric: ProfileMetric): void {
    if (!profileId) return
    void (async () => {
        try {
            const supabase = createClient()
            await supabase.rpc("increment_profile_metric", {
                p_profile_id: profileId,
                p_metric: metric,
            })
        } catch {
            /* silencieux : une métrique perdue vaut mieux qu'une UI cassée */
        }
    })()
}
