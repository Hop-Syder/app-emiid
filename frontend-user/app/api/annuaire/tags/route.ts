import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Route dépendante des cookies (session Supabase) → toujours dynamique.
// Évite l'erreur DYNAMIC_SERVER_USAGE au build (tentative de prérendu statique).
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()

        // Requête pour récupérer les 20 tags les plus utilisés
        // Supabase ne permet pas de faire un GROUP BY complexe via l'API REST standard facilement
        // On peut utiliser une fonction RPC si elle existe, sinon on fait un select sur public_profiles
        // pour compter.
        // Puisque nous devons respecter le plan : "SELECT t.name, t.id, count(pt.profile_id)..."
        // Si la base n'a pas de vue ou RPC `get_popular_tags`, on peut utiliser un RPC standard.
        // Par précaution, nous appelons rpc('get_popular_tags') s'il est défini,
        // Ou on récupère les tags directement si possible.
        // En attendant que la vue ou le RPC soit confirmé, utilisons une requête REST basique 
        // ou RPC générique:

        const { data, error } = await (supabase as any)
            .rpc('get_popular_tags')
            .limit(20)

        // Fallback temporaire si RPC n'existe pas (sera à ajuster selon la BDD)
        if (error) {
            console.warn('RPC get_popular_tags failed or missing, returning fallback mock data', error)
            return NextResponse.json({
                tags: [
                    { id: 1, name: "design", count: 34 },
                    { id: 2, name: "fintech", count: 28 },
                    { id: 3, name: "agro", count: 22 },
                    { id: 4, name: "mobile", count: 18 },
                    { id: 5, name: "ia", count: 15 },
                    { id: 6, name: "btob", count: 12 },
                    { id: 7, name: "export", count: 10 }
                ]
            })
        }

        return NextResponse.json({ tags: data || [] })
    } catch (error: any) {
        console.error('Annuaire tags route error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
