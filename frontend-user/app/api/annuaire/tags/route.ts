import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorMessage } from '@/types/supabase-rows'

// Route dépendante des cookies (session Supabase) → toujours dynamique.
// Évite l'erreur DYNAMIC_SERVER_USAGE au build (tentative de prérendu statique).
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()

        // Tags les plus portés par les profils publiés (RPC get_popular_tags,
        // migration 20260826). En cas d'échec on renvoie une liste VIDE : afficher
        // des compétences fictives dans un annuaire détruirait la confiance.
        const { data, error } = await supabase.rpc('get_popular_tags', { max_results: 20 })

        if (error) {
            console.error('get_popular_tags RPC error:', error)
            return NextResponse.json({ tags: [] })
        }

        return NextResponse.json({ tags: data || [] })
    } catch (error) {
        console.error('Annuaire tags route error:', error)
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}
