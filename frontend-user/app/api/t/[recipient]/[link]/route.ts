/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Suivi des clics d'une campagne e-mail, puis redirection.
 *
 *              On mesure les clics et non les ouvertures : le pixel invisible
 *              ne veut plus rien dire. Apple Mail précharge toutes les images,
 *              gonflant les ouvertures de personnes qui n'ont rien lu, tandis
 *              que les clients qui bloquent les images n'en signalent aucune.
 *              Un clic, lui, est un geste délibéré — moins nombreux, mais vrai.
 *
 *              La destination n'est jamais lue dans l'URL : elle est stockée en
 *              base et retournée par record_email_click. Rediriger vers une
 *              adresse passée en paramètre ferait de ce point d'entrée une
 *              redirection ouverte, exploitable pour envoyer des victimes
 *              n'importe où depuis notre propre domaine.
 * @created 2026-08-29
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Repli quand le clic ne peut être attribué : l'accueil, jamais une erreur. */
function homeUrl(request: Request): URL {
    return new URL('/', request.url)
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ recipient: string; link: string }> },
) {
    const { recipient, link } = await params

    // Identifiants malformés : rien à enregistrer, on ne laisse pas la personne
    // devant une page d'erreur pour autant.
    if (!UUID.test(recipient) || !UUID.test(link)) {
        return NextResponse.redirect(homeUrl(request), 302)
    }

    try {
        const supabase = await createClient()
        const { data, error } = await supabase.rpc('record_email_click', {
            p_recipient_id: recipient,
            p_link_id: link,
        })

        const target = typeof data === 'string' ? data : null
        if (error || !target) {
            return NextResponse.redirect(homeUrl(request), 302)
        }

        // Ultime garde-fou : la base ne doit contenir que du http(s), mais une
        // valeur inattendue ne doit pas devenir un `javascript:` cliquable.
        if (!/^https?:\/\//i.test(target)) {
            return NextResponse.redirect(homeUrl(request), 302)
        }

        // 302 et non 301 : une redirection permanente serait mise en cache par
        // le navigateur, et les clics suivants ne nous parviendraient plus.
        const response = NextResponse.redirect(target, 302)
        response.headers.set('Cache-Control', 'no-store, max-age=0')
        return response
    } catch {
        // La mesure n'est jamais une raison d'empêcher quelqu'un d'arriver
        // à destination.
        return NextResponse.redirect(homeUrl(request), 302)
    }
}
