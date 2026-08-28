/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Lecture stricte des variables d'environnement Supabase.
 *
 *              Les clients étaient construits avec l'assertion `!` :
 *              `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`. TypeScript se
 *              taisait, mais à l'exécution une variable absente donnait
 *              `undefined`, et Supabase répondait par un 400 opaque —
 *              « No API key found in request » — sans jamais nommer la
 *              variable manquante.
 *
 *              On échoue donc ici, avec un message qui dit quoi corriger.
 * @created 2026-08-28
 */

/** Lit une variable obligatoire, ou échoue en nommant ce qui manque. */
export function requireEnv(name: string, value: string | undefined): string {
    if (value && value.trim()) return value

    // Sur le client, `process.env` est remplacé au build : une variable absente
    // du déploiement ne sera jamais lisible au navigateur, même si elle existe
    // dans le tableau de bord après coup — il faut redéployer.
    throw new Error(
        `Configuration manquante : ${name}. ` +
        `Ajoutez-la aux variables d'environnement du projet, puis redéployez ` +
        `(les variables NEXT_PUBLIC_* sont figées au moment du build).`
    )
}

export const supabaseUrl = () =>
    requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)

export const supabaseAnonKey = () =>
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const supabaseServiceRoleKey = () =>
    requireEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)
