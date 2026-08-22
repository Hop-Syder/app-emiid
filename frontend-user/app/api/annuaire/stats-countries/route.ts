import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorMessage } from '@/types/supabase-rows'

// Route dépendante des cookies (session Supabase) → toujours dynamique.
// Évite l'erreur DYNAMIC_SERVER_USAGE au build (tentative de prérendu statique).
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase.rpc('get_top_countries')

        if (error) {
            console.error('get_top_countries RPC error:', error)
            return NextResponse.json({ countries: [] })
        }


        return NextResponse.json({ countries: data || [] })
    } catch (error) {
        console.error('Annuaire stats-countries route error:', error)
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}
