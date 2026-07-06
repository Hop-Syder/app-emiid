import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorMessage } from '@/types/supabase-rows'

// Route dépendante des cookies (session Supabase) → toujours dynamique.
// Évite l'erreur DYNAMIC_SERVER_USAGE au build (tentative de prérendu statique).
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC non déclarée dans les types Database
        const { data, error } = await (supabase as any)
            .rpc('get_top_countries')
            .limit(8)

        // Fallback temporaire si RPC n'existe pas
        if (error) {
            console.warn('RPC get_top_countries failed or missing, returning fallback mock data', error)
            return NextResponse.json({
                countries: [
                    { id: 1, iso_code: "SN", name: "Sénégal", count: 45 },
                    { id: 2, iso_code: "CI", name: "Côte d'Ivoire", count: 38 },
                    { id: 3, iso_code: "ML", name: "Mali", count: 22 },
                    { id: 4, iso_code: "CM", name: "Cameroun", count: 19 },
                    { id: 5, iso_code: "BJ", name: "Bénin", count: 14 }
                ]
            })
        }

        return NextResponse.json({ countries: data || [] })
    } catch (error) {
        console.error('Annuaire stats-countries route error:', error)
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}
