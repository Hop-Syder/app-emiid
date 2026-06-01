import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60 // Cache for 60 seconds (ISR)

export async function GET() {
    try {
        const supabase = await createClient()

        // Requêtes parallèles optimisées utilisant l'option "head: true" et "count: 'exact'"
        // Cela demande à Postgres de renvoyer uniquement le nombre de lignes (COUNT), sans transférer les données.
        const [
            { count: totalEntrepreneurs, error: err1 },
            { count: verifiedMembers, error: err2 },
            { count: premiumMembers, error: err3 }
        ] = await Promise.all([
            // 1. Total Membres publiés
            supabase
                .from('public_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true),
            
            // 2. Membres Vérifiés publiés
            supabase
                .from('public_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true)
                .eq('is_verified', true),
                
            // 3. Membres Premium publiés
            supabase
                .from('public_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true)
                .eq('is_premium', true)
        ])

        if (err1 || err2 || err3) {
            console.error("Erreur lors du calcul des statistiques", { err1, err2, err3 })
            return NextResponse.json({ error: "Erreur de base de données" }, { status: 500 })
        }

        // 4. Calcul des pays couverts
        // Option la plus optimisée côté frontend/API Supabase JS sans RPC (Stored Procedure) : 
        // Récupérer uniquement les `country_id` pour faire un Set. 
        // C'est rapide même avec des milliers de lignes car la colonne est toute petite.
        let countriesCovered = 0
        const { data: countriesData, error: err4 } = await supabase
            .from('public_profiles')
            .select('country_id')
            .eq('is_published', true)
            .not('country_id', 'is', null)

        if (!err4 && countriesData) {
            const uniqueCountries = new Set(countriesData.map(c => c.country_id))
            countriesCovered = uniqueCountries.size
        }

        // Renvoi de la structure attendue par le Dashboard
        return NextResponse.json({
            totalEntrepreneurs: totalEntrepreneurs || 0,
            verifiedMembers: verifiedMembers || 0,
            countriesCovered: countriesCovered || 0,
            premiumMembers: premiumMembers || 0,
        })

    } catch (error) {
        console.error("Stats API Error:", error)
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
    }
}
