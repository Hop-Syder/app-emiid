/**
 * @description Source de vérité unique pour l'état Suivre/Abonné côté client.
 * Lecture directe de la table de liaison user_follows (RLS "Follows Read" :
 * le follower ne voit que ses propres lignes) — fiable au rafraîchissement,
 * sans aller-retour HTTP vers le backend Express.
 */

import { createClient } from "@/lib/supabase/client"

/**
 * IDs (user_id) des profils suivis par l'utilisateur connecté.
 * Renvoie null si non connecté ou en cas d'erreur (l'appelant conserve alors
 * l'état par défaut au lieu d'écraser avec de fausses valeurs).
 */
export async function fetchFollowedIds(): Promise<Set<string> | null> {
    try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return null
        const { data, error } = await supabase
            .from("user_follows")
            .select("following_id")
            .eq("follower_id", session.user.id)
        if (error) return null
        return new Set((data || []).map((f) => f.following_id as string))
    } catch {
        return null
    }
}

/**
 * Vérifie si l'utilisateur connecté suit un profil donné (user_id).
 * Renvoie false si non connecté.
 */
export async function isFollowingUser(targetUserId: string): Promise<boolean> {
    try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return false
        const { data } = await supabase
            .from("user_follows")
            .select("id")
            .eq("follower_id", session.user.id)
            .eq("following_id", targetUserId)
            .maybeSingle()
        return !!data
    } catch {
        return false
    }
}
