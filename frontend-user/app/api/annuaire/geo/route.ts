/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Découpage administratif servi aux filtres de l'annuaire.
 *
 *              Sans paramètre : la liste des départements.
 *              Avec ?department=<uuid> : les communes de ce département.
 *
 *              `departments` ne porte AUCUN rattachement à un pays (cf. la
 *              migration 20260824) : ce sont les douze départements du Bénin,
 *              et rien d'autre. L'appelant est donc responsable de ne proposer
 *              ces filtres que là où ils ont un sens — l'interface les désactive
 *              pour tout autre pays.
 *
 *              Les deux tables sont des référentiels lisibles publiquement
 *              depuis la migration 20260904, et quasi immuables : on les met en
 *              cache une heure, avec une fenêtre de revalidation d'un jour.
 * @created 2026-09-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorMessage } from '@/types/supabase-rows'

// Route dépendante des cookies (session Supabase) → toujours dynamique.
export const dynamic = 'force-dynamic'

/** Un référentiel ne bouge pas : on autorise un cache long côté client/CDN. */
const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const departmentId = searchParams.get('department')?.trim()

        const supabase = await createClient()

        // ── Communes d'un département ──────────────────────────────────────
        if (departmentId) {
            const { data, error } = await supabase
                .from('communes')
                .select('id, name')
                .eq('department_id', departmentId)
                .order('name')

            if (error) {
                console.error('[annuaire/geo] communes :', error.message)
                return NextResponse.json({ communes: [] })
            }
            return NextResponse.json({ communes: data || [] }, { headers: CACHE_HEADERS })
        }

        // ── Départements ───────────────────────────────────────────────────
        const { data, error } = await supabase
            .from('departments')
            .select('id, name')
            .order('name')

        if (error) {
            console.error('[annuaire/geo] départements :', error.message)
            return NextResponse.json({ departments: [] })
        }
        return NextResponse.json({ departments: data || [] }, { headers: CACHE_HEADERS })
    } catch (error) {
        console.error('[annuaire/geo] erreur critique :', errorMessage(error))
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}
